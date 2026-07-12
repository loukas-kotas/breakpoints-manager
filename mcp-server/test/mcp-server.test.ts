import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import * as http from "node:http";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

import { BridgeClient, BridgeClientError } from "../src/bridge-client.js";
import { registerTools } from "../src/tools.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let configPath: string;
let server: http.Server;
let receivedAuth: string | undefined;
let nextResponse: { status: number; body: unknown };

function startStubServer(port: number): Promise<void> {
  return new Promise((resolve) => {
    server = http.createServer((req, res) => {
      receivedAuth = req.headers["authorization"];
      let data = "";
      req.on("data", (c) => (data += c));
      req.on("end", () => {
        res.writeHead(nextResponse.status, {
          "Content-Type": "application/json",
        });
        res.end(JSON.stringify(nextResponse.body));
      });
    });
    server.listen(port, "127.0.0.1", () => resolve());
  });
}

before(async () => {
  configPath = path.join(os.tmpdir(), `bm-mcp-test-${Date.now()}.json`);
  const port = 39871;
  fs.writeFileSync(
    configPath,
    JSON.stringify({ port, token: "secret-token" })
  );
  nextResponse = { status: 200, body: { ok: true } };
  await startStubServer(port);
});

after(() => {
  server?.close();
  fs.rmSync(configPath, { force: true });
});

test("BridgeClient sends the bearer token and returns parsed JSON", async () => {
  const client = new BridgeClient({ configPath });
  const data = await client.get("/list-breakpoints");
  assert.equal(receivedAuth, "Bearer secret-token");
  assert.deepEqual(data, { ok: true });
});

test("BridgeClient throws BridgeClientError on non-2xx responses", async () => {
  nextResponse = { status: 400, body: { error: "bad request" } };
  const client = new BridgeClient({ configPath });
  await assert.rejects(
    () => client.post("/add-breakpoint", { file: "/a.ts", line: 0 }),
    (err: unknown) =>
      err instanceof BridgeClientError &&
      err.message.includes("bad request")
  );
});

test("BridgeClient throws when the config file is missing", async () => {
  const client = new BridgeClient({ configPath: "/does/not/exist.json" });
  await assert.rejects(
    () => client.get("/list-breakpoints"),
    (err: unknown) => err instanceof BridgeClientError
  );
});

test("registerTools exposes all seven tools", async () => {
  const tools: Record<string, unknown> = {};
  const fakeServer: any = {
    tool: (name: string) => {
      tools[name] = true;
    },
  };
  const client = new BridgeClient({ configPath });
  registerTools(fakeServer, client);

  const expected = [
    "add_breakpoint",
    "remove_breakpoint",
    "list_breakpoints",
    "create_collection",
    "set_active_collection",
    "list_collections",
    "remove_collection",
  ];
  for (const name of expected) {
    assert.ok(tools[name], `tool "${name}" should be registered`);
  }
});

test("add_breakpoint tool proxies to the bridge and returns text content", async () => {
  nextResponse = {
    status: 200,
    body: { ok: true, message: "Breakpoint added at /a.ts:0" },
  };
  const tools: Record<string, (args: any) => Promise<any>> = {};
  const fakeServer: any = {
    tool: (_name: string, _desc: string, _schema: unknown, cb: any) => {
      tools[_name] = cb;
    },
  };
  const client = new BridgeClient({ configPath });
  registerTools(fakeServer, client);

  const result = await tools["add_breakpoint"]({
    file: "/a.ts",
    line: 0,
    collection: "MCP",
  });
  assert.equal(result.isError, false);
  assert.equal(typeof result.content[0].text, "string");
  assert.match(result.content[0].text, /Breakpoint added at \/a\.ts:0/);
});

test("tools surface bridge errors as isError results", async () => {
  nextResponse = { status: 404, body: { error: "Collection not found" } };
  const tools: Record<string, (args: any) => Promise<any>> = {};
  const fakeServer: any = {
    tool: (_name: string, _desc: string, _schema: unknown, cb: any) => {
      tools[_name] = cb;
    },
  };
  const client = new BridgeClient({ configPath });
  registerTools(fakeServer, client);

  const result = await tools["remove_collection"]({ name: "nope" });
  assert.equal(result.isError, true);
  assert.match(result.content[0].text, /Collection not found/);
});
