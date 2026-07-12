import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import type { McpBridgeToken } from "@breakpoints-manager/shared";

/** Mirrors the path written by the extension (`shared` `getMcpConfigPath`). */
const DEFAULT_CONFIG_PATH = path.join(
  os.homedir(),
  ".breakpoints-manager",
  ".mcp.json"
);

/** Thrown when the bridge cannot be reached (extension not running, stale token, etc.). */
export class BridgeClientError extends Error {}

export interface BridgeClientOptions {
  /** Override the token-file path (mainly for testing). */
  configPath?: string;
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/**
 * Thin HTTP client for the in-extension bridge. Reads the connection file on every call so it
 * transparently picks up bridge restarts (the token/port change when VS Code reloads).
 */
export class BridgeClient {
  private readonly configPath: string;

  constructor(options: BridgeClientOptions = {}) {
    this.configPath = options.configPath ?? DEFAULT_CONFIG_PATH;
  }

  private readConfig(): McpBridgeToken {
    let raw: string;
    try {
      raw = fs.readFileSync(this.configPath, "utf8");
    } catch {
      throw new BridgeClientError(
        "Breakpoints Manager extension is not running. Open VS Code, activate the " +
          "Breakpoints Manager extension, and retry."
      );
    }
    try {
      const parsed = JSON.parse(raw) as Partial<McpBridgeToken>;
      if (
        typeof parsed.port === "number" &&
        typeof parsed.token === "string"
      ) {
        return { port: parsed.port, token: parsed.token };
      }
    } catch {
      /* fall through */
    }
    throw new BridgeClientError(
      "Breakpoints Manager bridge token file is missing or corrupted."
    );
  }

  private async request(
    method: string,
    endpoint: string,
    body?: unknown
  ): Promise<unknown> {
    const cfg = this.readConfig();
    const res = await fetch(`http://127.0.0.1:${cfg.port}${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cfg.token}`,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    const text = await res.text();
    const data = text ? safeJson(text) : null;

    if (!res.ok) {
      const message =
        (data && typeof data === "object" && "error" in data
          ? String((data as { error: unknown }).error)
          : null) || res.statusText;
      throw new BridgeClientError(
        `Breakpoints Manager error (${res.status}): ${message}`
      );
    }
    return data;
  }

  post(endpoint: string, body: unknown): Promise<unknown> {
    return this.request("POST", endpoint, body);
  }

  get(endpoint: string): Promise<unknown> {
    return this.request("GET", endpoint);
  }
}
