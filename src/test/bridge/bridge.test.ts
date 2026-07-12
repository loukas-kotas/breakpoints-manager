import * as assert from "assert";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import * as vscode from "vscode";
import { startMcpBridge, getActiveBridge } from "../../mcp-bridge/bridge";

async function httpJson(
  method: string,
  url: string,
  token?: string,
  body?: unknown
): Promise<{ status: number; json: any }> {
  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = text;
  }
  return { status: res.status, json };
}

suite("MCP Bridge", () => {
  const tmpFiles: string[] = [];

  teardown(() => {
    for (const f of tmpFiles) {
      try {
        fs.rmSync(f, { force: true });
      } catch {
        /* ignore */
      }
    }
  });

  test("bridge starts and enforces bearer auth", async function () {
    this.timeout(20000);
    const bridge = await startMcpBridge();
    const active = getActiveBridge();
    // The bridge only starts when a workspace folder is open.
    if (!bridge || !active) {
      this.skip();
      return;
    }

    const base = `http://127.0.0.1:${active.portNumber}`;
    const token = active.authToken;

    // No token -> 401.
    const noAuth = await httpJson("GET", `${base}/health`);
    assert.equal(noAuth.status, 401);

    // Wrong token -> 401.
    const wrong = await httpJson("GET", `${base}/health`, "wrong");
    assert.equal(wrong.status, 401);

    // Correct token -> 200.
    const ok = await httpJson("GET", `${base}/health`, token);
    assert.equal(ok.status, 200);
  });

  test("add + list + remove breakpoint round-trips", async function () {
    this.timeout(20000);
    const bridge = await startMcpBridge();
    const active = getActiveBridge();
    if (!bridge || !active) {
      this.skip();
      return;
    }

    const base = `http://127.0.0.1:${active.portNumber}`;
    const token = active.authToken;

    const file = path.join(os.tmpdir(), `bm-bridge-test-${Date.now()}.ts`);
    fs.writeFileSync(file, "export const x = 1;\n");
    tmpFiles.push(file);

    const add = await httpJson(
      "POST",
      `${base}/add-breakpoint`,
      token,
      { file, line: 0, collection: "MCP" }
    );
    assert.equal(add.status, 200);
    assert.equal(add.json.ok, true);

    // The breakpoint should now be live.
    const list = await httpJson("GET", `${base}/list-breakpoints`, token);
    assert.equal(list.status, 200);
    assert.ok(
      Array.isArray(list.json.breakpoints),
      "list-breakpoints should return an array"
    );
    assert.ok(
      list.json.breakpoints.some(
        (b: any) => b.file === file && b.line === 0
      ),
      "added breakpoint should appear in list"
    );

    // And it should be recorded in the collection.
    const collections = await httpJson(
      "GET",
      `${base}/list-collections`,
      token
    );
    assert.ok(
      collections.json.collections.some(
        (c: any) => c.name === "MCP" && c.breakpointCount >= 1
      ),
      "MCP collection should contain the breakpoint"
    );

    // Remove it.
    const remove = await httpJson(
      "POST",
      `${base}/remove-breakpoint`,
      token,
      { file, line: 0, collection: "MCP" }
    );
    assert.equal(remove.status, 200);
  });
});
