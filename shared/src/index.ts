/**
 * Shared contracts between the Breakpoints Manager VS Code extension (HTTP bridge)
 * and the standalone MCP server. Keeping these in one place avoids drift between the
 * two processes.
 */
import * as os from "os";
import * as path from "path";

/** Directory (inside the user home) where the bridge writes its connection file. */
export const MCP_CONFIG_DIR = ".breakpoints-manager";
/** File name of the bridge connection file (`{ port, token }`). */
export const MCP_CONFIG_FILE = ".mcp.json";

/** Absolute path to the bridge connection file. */
export function getMcpConfigPath(): string {
  return path.join(os.homedir(), MCP_CONFIG_DIR, MCP_CONFIG_FILE);
}

/**
 * Contents of `~/.breakpoints-manager/.mcp.json`. Written by the extension on
 * activation, read by the MCP server on startup.
 */
export interface McpBridgeToken {
  /** Port the bridge HTTP server is listening on (127.0.0.1). */
  port: number;
  /** Shared bearer token used to authenticate every request. */
  token: string;
}

/** Alias kept for readability in docs. */
export type McpBridgeConfig = McpBridgeToken;

/** Default collection name used when the AI tool does not supply one. */
export const DEFAULT_COLLECTION_NAME = "MCP";

/** A single breakpoint in a serializable form. */
export interface BreakpointInfo {
  type: "source";
  /** Absolute file path. */
  file: string;
  /** 0-based line number. */
  line: number;
  /** 0-based character/column number. */
  character?: number;
  enabled: boolean;
  condition?: string;
  hitCondition?: string;
  logMessage?: string;
}

/** A collection summary returned by `list-collections`. */
export interface CollectionInfo {
  name: string;
  guid: string;
  breakpointCount: number;
}

/** Standard error envelope returned by the bridge on failure. */
export interface ApiError {
  error: string;
}

// ---------------------------------------------------------------------------
// Request payloads
// ---------------------------------------------------------------------------

export interface AddBreakpointRequest {
  /** Absolute file path. */
  file: string;
  /** 0-based line number. */
  line: number;
  /** 0-based character/column number. */
  character?: number;
  condition?: string;
  hitCondition?: string;
  logMessage?: string;
  /** Collection to record the breakpoint into (defaults to "MCP"). */
  collection?: string;
}

export interface RemoveBreakpointRequest {
  /** Absolute file path. */
  file: string;
  /** 0-based line number. */
  line: number;
  /** 0-based character/column number (optional filter). */
  character?: number;
  /** Collection to drop the breakpoint from (optional). */
  collection?: string;
}

export interface CreateCollectionRequest {
  name: string;
}

export interface SetActiveCollectionRequest {
  name: string;
}

export interface RemoveCollectionRequest {
  name: string;
}
