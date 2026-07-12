#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { BridgeClient } from "./bridge-client.js";
import { registerTools } from "./tools.js";

const server = new McpServer({
  name: "breakpoints-manager-mcp",
  version: "0.1.0",
});

const client = new BridgeClient();
registerTools(server, client);

const transport = new StdioServerTransport();
await server.connect(transport);
