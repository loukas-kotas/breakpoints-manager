import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { BridgeClient, BridgeClientError } from "./bridge-client.js";

function textResult(data: unknown, isError = false) {
  const text = typeof data === "string" ? data : JSON.stringify(data, null, 2);
  return {
    content: [{ type: "text" as const, text }],
    isError,
  };
}

/**
 * Register every Breakpoints Manager tool on the MCP server. Each tool proxies the matching
 * bridge endpoint. Failures (extension not running, validation errors) are surfaced as
 * `isError` tool results rather than crashing the server.
 */
export function registerTools(server: McpServer, client: BridgeClient): void {
  server.tool(
    "add_breakpoint",
    "Add a breakpoint in the open VS Code workspace and record it in a Breakpoints Manager collection. " +
      "Line and character are 0-based (VS Code convention).",
    {
      file: z.string().describe("Absolute path to the source file."),
      line: z
        .number()
        .int()
        .nonnegative()
        .describe("0-based line number."),
      character: z
        .number()
        .int()
        .nonnegative()
        .optional()
        .describe("0-based column. Defaults to 0."),
      condition: z
        .string()
        .optional()
        .describe("Conditional breakpoint expression."),
      hitCondition: z
        .string()
        .optional()
        .describe("Hit count expression, e.g. '> 5'."),
      logMessage: z.string().optional().describe("Logpoint message."),
      collection: z
        .string()
        .optional()
        .describe("Collection name. Defaults to 'MCP'."),
    },
    async (args) => {
      try {
        return textResult(await client.post("/add-breakpoint", args));
      } catch (e) {
        return textResult((e as Error).message, true);
      }
    }
  );

  server.tool(
    "remove_breakpoint",
    "Remove a breakpoint from the open VS Code workspace. By default only the live breakpoint is " +
      "removed; pass `collection` to also drop it from a stored collection.",
    {
      file: z.string().describe("Absolute path to the source file."),
      line: z.number().int().nonnegative().describe("0-based line number."),
      character: z
        .number()
        .int()
        .nonnegative()
        .optional()
        .describe("0-based column used to disambiguate."),
      collection: z
        .string()
        .optional()
        .describe("Also remove the breakpoint from this collection."),
    },
    async (args) => {
      try {
        return textResult(await client.post("/remove-breakpoint", args));
      } catch (e) {
        return textResult((e as Error).message, true);
      }
    }
  );

  server.tool(
    "list_breakpoints",
    "List the currently active breakpoints in VS Code.",
    {},
    async () => {
      try {
        return textResult(await client.get("/list-breakpoints"));
      } catch (e) {
        return textResult((e as Error).message, true);
      }
    }
  );

  server.tool(
    "create_collection",
    "Create a new Breakpoints Manager collection from the current breakpoints.",
    {
      name: z.string().describe("Name of the collection to create."),
    },
    async (args) => {
      try {
        return textResult(await client.post("/create-collection", args));
      } catch (e) {
        return textResult((e as Error).message, true);
      }
    }
  );

  server.tool(
    "set_active_collection",
    "Load a stored Breakpoints Manager collection as the active breakpoints (replaces the current set).",
    {
      name: z.string().describe("Name of the collection to activate."),
    },
    async (args) => {
      try {
        return textResult(await client.post("/set-active-collection", args));
      } catch (e) {
        return textResult((e as Error).message, true);
      }
    }
  );

  server.tool(
    "list_collections",
    "List the stored Breakpoints Manager collections.",
    {},
    async () => {
      try {
        return textResult(await client.get("/list-collections"));
      } catch (e) {
        return textResult((e as Error).message, true);
      }
    }
  );

  server.tool(
    "remove_collection",
    "Delete a stored Breakpoints Manager collection.",
    {
      name: z.string().describe("Name of the collection to remove."),
    },
    async (args) => {
      try {
        return textResult(await client.post("/remove-collection", args));
      } catch (e) {
        return textResult((e as Error).message, true);
      }
    }
  );
}

export { BridgeClientError };
