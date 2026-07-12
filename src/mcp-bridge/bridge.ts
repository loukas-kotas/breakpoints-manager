import * as http from "http";
import * as net from "net";
import * as vscode from "vscode";
import { WorkspaceState } from "../global-state";
import {
  generateToken,
  writeTokenFile,
  removeTokenFile,
} from "./token-file";
import {
  handleAddBreakpoint,
  handleRemoveBreakpoint,
  handleListBreakpoints,
  handleCreateCollection,
  handleSetActiveCollection,
  handleRemoveCollection,
  handleListCollections,
} from "./handlers";
import type {
  AddBreakpointRequest,
  RemoveBreakpointRequest,
  CreateCollectionRequest,
  SetActiveCollectionRequest,
  RemoveCollectionRequest,
  ApiError,
} from "@breakpoints-manager/shared";

type JsonHandler = (body: any) => Promise<unknown>;

function sendJson(res: http.ServerResponse, status: number, data: unknown): void {
  const payload = JSON.stringify(data);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(payload),
  });
  res.end(payload);
}

function readJsonBody(req: http.IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (c) => chunks.push(c as Buffer));
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8").trim();
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error("Invalid JSON body."));
      }
    });
    req.on("error", reject);
  });
}

/**
 * Local HTTP bridge that runs inside the VS Code extension process. It performs the real
 * `vscode` API calls on behalf of the standalone MCP server (which, as a separate process,
 * cannot call VS Code APIs directly). Every request is authenticated with a bearer token
 * written to `~/.breakpoints-manager/.mcp.json`.
 */
export class McpBridge {
  private server: http.Server | undefined;
  private token = "";
  private port = 0;

  get url(): string | undefined {
    return this.port ? `http://127.0.0.1:${this.port}` : undefined;
  }

  get portNumber(): number {
    return this.port;
  }

  get authToken(): string {
    return this.token;
  }

  async start(): Promise<{ port: number; token: string }> {
    this.token = generateToken();
    this.server = http.createServer((req, res) =>
      this.onRequest(req, res).catch((e) => {
        sendJson(res, 500, { error: (e as Error).message } as ApiError);
      })
    );

    await new Promise<void>((resolve, reject) => {
      this.server!.once("error", reject);
      this.server!.listen(0, "127.0.0.1", () => {
        const addr = this.server!.address();
        if (addr && typeof addr === "object") {
          this.port = (addr as net.AddressInfo).port;
        }
        resolve();
      });
    });

    const tokenFile = writeTokenFile(this.port, this.token);

    const gs = WorkspaceState.getInstance();
    gs.mcpBridgePort = this.port;
    gs.mcpBridgeToken = this.token;

    return tokenFile;
  }

  stop(): void {
    try {
      this.server?.close();
    } catch {
      /* ignore */
    }
    this.server = undefined;
    this.port = 0;
    this.token = "";

    const gs = WorkspaceState.getInstance();
    gs.mcpBridgePort = undefined;
    gs.mcpBridgeToken = undefined;

    removeTokenFile();
  }

  private async onRequest(
    req: http.IncomingMessage,
    res: http.ServerResponse
  ): Promise<void> {
    const auth = req.headers["authorization"];
    if (
      !auth ||
      !auth.startsWith("Bearer ") ||
      auth.substring(7) !== this.token
    ) {
      sendJson(res, 401, { error: "Unauthorized" } as ApiError);
      return;
    }

    const { pathname } = new URL(req.url ?? "/", "http://127.0.0.1");

    if (req.method === "GET" && pathname === "/health") {
      sendJson(res, 200, { ok: true });
      return;
    }

    const handler =
      req.method === "POST"
        ? this.postRoutes[pathname]
        : this.getRoutes[pathname];

    if (!handler) {
      sendJson(res, 404, {
        error: `Unknown route: ${req.method} ${pathname}`,
      } as ApiError);
      return;
    }

    try {
      const body = req.method === "POST" ? await readJsonBody(req) : {};
      const result = await handler(body);
      sendJson(res, 200, result);
    } catch (e) {
      sendJson(res, 400, { error: (e as Error).message } as ApiError);
    }
  }

  private readonly postRoutes: Record<string, JsonHandler> = {
    "/add-breakpoint": (b) => handleAddBreakpoint(b as AddBreakpointRequest),
    "/remove-breakpoint": (b) =>
      handleRemoveBreakpoint(b as RemoveBreakpointRequest),
    "/create-collection": (b) =>
      handleCreateCollection(b as CreateCollectionRequest),
    "/set-active-collection": (b) =>
      handleSetActiveCollection(b as SetActiveCollectionRequest),
    "/remove-collection": (b) =>
      handleRemoveCollection(b as RemoveCollectionRequest),
  };

  private readonly getRoutes: Record<string, JsonHandler> = {
    "/list-breakpoints": () => handleListBreakpoints(),
    "/list-collections": () => handleListCollections(),
  };
}

let activeBridge: McpBridge | undefined;

/** Start the bridge (no-op if already running). Returns the bridge. */
export async function startMcpBridge(): Promise<McpBridge | undefined> {
  const gs = WorkspaceState.getInstance();
  if (!gs.collectionProvider || !gs.context) {
    return undefined;
  }
  if (activeBridge) {
    return activeBridge;
  }
  activeBridge = new McpBridge();
  try {
    await activeBridge.start();
  } catch (e) {
    console.error("[BreakpointsManager] Failed to start MCP bridge", e);
    activeBridge = undefined;
    vscode.window.showErrorMessage(
      "Breakpoints Manager: failed to start the MCP bridge."
    );
  }
  return activeBridge;
}

/** Get the running bridge instance, if any. */
export function getMcpBridge(): McpBridge | undefined {
  return activeBridge;
}

/** Alias used by the test suite. */
export function getActiveBridge(): McpBridge | undefined {
  return activeBridge;
}

/** Stop the running bridge (called on extension deactivation). */
export function stopMcpBridge(): void {
  activeBridge?.stop();
  activeBridge = undefined;
}

/** Command: show the bridge URL/token and connection state. */
export async function showMcpStatus(): Promise<void> {
  const bridge = getMcpBridge();
  if (!bridge?.url) {
    vscode.window.showInformationMessage(
      "Breakpoints Manager MCP bridge is not running. Open a workspace folder to enable it."
    );
    return;
  }
  vscode.window.showInformationMessage(
    `Breakpoints Manager MCP bridge is running at ${bridge.url} (token written to ~/.breakpoints-manager/.mcp.json).`
  );
}
