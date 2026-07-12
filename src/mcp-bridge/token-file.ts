import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import * as crypto from "crypto";
import type { McpBridgeToken } from "@breakpoints-manager/shared";

export const MCP_CONFIG_DIR = path.join(os.homedir(), ".breakpoints-manager");
export const MCP_TOKEN_FILE = path.join(MCP_CONFIG_DIR, ".mcp.json");

export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/** Write the bridge connection details to `~/.breakpoints-manager/.mcp.json` (chmod 600). */
export function writeTokenFile(port: number, token: string): McpBridgeToken {
  const payload: McpBridgeToken = { port, token };
  fs.mkdirSync(MCP_CONFIG_DIR, { recursive: true });
  fs.writeFileSync(MCP_TOKEN_FILE, JSON.stringify(payload, null, 2), {
    mode: 0o600,
  });
  return payload;
}

export function removeTokenFile(): void {
  try {
    fs.rmSync(MCP_TOKEN_FILE, { force: true });
  } catch {
    /* best-effort */
  }
}

export function readTokenFile(): McpBridgeToken | null {
  try {
    const parsed = JSON.parse(
      fs.readFileSync(MCP_TOKEN_FILE, "utf8")
    ) as Partial<McpBridgeToken>;
    if (typeof parsed.port === "number" && typeof parsed.token === "string") {
      return { port: parsed.port, token: parsed.token };
    }
    return null;
  } catch {
    return null;
  }
}
