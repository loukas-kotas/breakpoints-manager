import * as vscode from "vscode";
import { WorkspaceState } from "../global-state";
import { CommonKeys } from "../models";
import { ExportableCollection } from "../models/collection-types.model";
import { toExportableBreakpoint } from "../helpers/create-exportable-breakpoint";
import {
  persistCollectionsToContext,
  updateCollectionsInContext,
} from "../helpers/persist-collection";
import { createCollection } from "../helpers/create-collection";
import { setActiveCollectionHelper } from "../commands/set-active-collection";
import { removeCollection } from "../helpers/remove-collection";
import { generateGUID } from "../helpers/generate-guid";
import {
  AddBreakpointRequest,
  RemoveBreakpointRequest,
  CreateCollectionRequest,
  SetActiveCollectionRequest,
  RemoveCollectionRequest,
} from "@breakpoints-manager/shared";
import type { BreakpointInfo, CollectionInfo } from "@breakpoints-manager/shared";

/** Default collection name used when the AI tool does not supply one. */
const DEFAULT_COLLECTION_NAME = "MCP";

/** Line/character numbers are 0-based (VS Code convention) per the shared contract. */

function getCollections(): ExportableCollection[] {
  const gs = WorkspaceState.getInstance();
  const raw = gs.context?.workspaceState.get<ExportableCollection[]>(
    CommonKeys.IDENTIFIER,
    []
  );
  return Array.isArray(raw) ? raw : [];
}

function requireWorkspacePath(): string {
  const ws = WorkspaceState.getInstance().workspace_uri_path;
  if (!ws) {
    throw new Error(
      "No workspace folder is open. Open a folder in VS Code before managing breakpoints."
    );
  }
  return ws;
}

/** POST /add-breakpoint — add a live breakpoint and record it into a collection. */
export async function handleAddBreakpoint(req: AddBreakpointRequest) {
  if (!req || typeof req.file !== "string" || typeof req.line !== "number") {
    throw new Error("'file' (string) and 'line' (number) are required.");
  }

  const gs = WorkspaceState.getInstance();
  const wsPath = requireWorkspacePath();
  const wsLen = gs.workspace_uri_path_length ?? wsPath.length;

  const line = Math.max(0, Math.floor(req.line));
  const character = typeof req.character === "number" ? req.character : 0;
  const collectionName = (req.collection?.trim() || DEFAULT_COLLECTION_NAME).trim();

  const bp = new vscode.SourceBreakpoint(
    new vscode.Location(
      vscode.Uri.file(req.file),
      new vscode.Position(line, character)
    ),
    true,
    req.condition,
    req.hitCondition,
    req.logMessage
  );

  // 1. Add the real breakpoint inside VS Code.
  vscode.debug.addBreakpoints([bp]);

  // 2. Record it into a collection (find-or-create by name).
  const exportable = toExportableBreakpoint(bp, wsLen);
  const collections = getCollections();
  const existing = collections.find((c) => c.name === collectionName);

  if (existing) {
    existing.breakpoints.push(exportable);
    await updateCollectionsInContext(
      gs.context!,
      collections as unknown as Parameters<typeof updateCollectionsInContext>[1]
    );
  } else {
    const created: ExportableCollection = {
      name: collectionName,
      guid: generateGUID(),
      breakpoints: [exportable],
    };
    await persistCollectionsToContext([created]);
    gs.collectionProvider?.addCollectionToTree(created.name, created.guid);
  }
  gs.collectionProvider?.refresh();

  return {
    ok: true as const,
    message: `Breakpoint added at ${req.file}:${line} (collection "${collectionName}").`,
  };
}

/** POST /remove-breakpoint — remove a live breakpoint and optionally drop it from a collection. */
export async function handleRemoveBreakpoint(req: RemoveBreakpointRequest) {
  if (!req || typeof req.file !== "string" || typeof req.line !== "number") {
    throw new Error("'file' (string) and 'line' (number) are required.");
  }

  requireWorkspacePath();

  const toRemove = vscode.debug.breakpoints.filter(
    (bp): bp is vscode.SourceBreakpoint =>
      bp instanceof vscode.SourceBreakpoint &&
      bp.location.uri.fsPath === req.file &&
      bp.location.range.start.line === req.line &&
      (req.character === undefined ||
        bp.location.range.start.character === req.character)
  );

  if (toRemove.length > 0) {
    vscode.debug.removeBreakpoints(toRemove);
  }

  // Optional: also remove from the named collection.
  const gs = WorkspaceState.getInstance();
  if (req.collection) {
    const wsLen = gs.workspace_uri_path_length ?? 0;
    const rel = req.file.startsWith(gs.workspace_uri_path ?? "")
      ? req.file.substring(wsLen)
      : req.file;
    const collections = getCollections();
    let changed = false;
    for (const c of collections) {
      const before = c.breakpoints.length;
      c.breakpoints = c.breakpoints.filter(
        (b) =>
          !(
            b.location === rel &&
            (b.line as unknown as vscode.Range)?.start?.line === req.line
          )
      );
      if (c.breakpoints.length !== before) {
        changed = true;
      }
    }
    if (changed) {
      await updateCollectionsInContext(
        gs.context!,
        collections as unknown as Parameters<typeof updateCollectionsInContext>[1]
      );
      gs.collectionProvider?.refresh();
    }
  }

  return {
    ok: true as const,
    message: `Removed ${toRemove.length} breakpoint(s) at ${req.file}:${req.line}.`,
  };
}

/** GET /list-breakpoints — serializable subset of the live breakpoints. */
export async function handleListBreakpoints(): Promise<{
  breakpoints: BreakpointInfo[];
}> {
  const breakpoints: BreakpointInfo[] = vscode.debug.breakpoints
    .filter((bp): bp is vscode.SourceBreakpoint =>
      bp instanceof vscode.SourceBreakpoint
    )
    .map((bp) => {
      const range = bp.location.range;
      return {
        type: "source" as const,
        file: bp.location.uri.fsPath,
        line: range.start.line,
        character: range.start.character,
        enabled: bp.enabled,
        condition: bp.condition,
        hitCondition: bp.hitCondition,
        logMessage: bp.logMessage,
      };
    });

  return { breakpoints };
}

/** POST /create-collection — snapshot the current breakpoints into a new collection. */
export async function handleCreateCollection(req: CreateCollectionRequest) {
  if (!req || !req.name?.trim()) {
    throw new Error("'name' is required.");
  }
  await createCollection(req.name.trim());
  return { ok: true as const, message: `Collection "${req.name}" created.` };
}

/** POST /set-active-collection — load a stored collection as the active breakpoints. */
export async function handleSetActiveCollection(
  req: SetActiveCollectionRequest
) {
  if (!req || !req.name?.trim()) {
    throw new Error("'name' is required.");
  }
  await setActiveCollectionHelper({ label: req.name.trim() });
  return {
    ok: true as const,
    message: `Active collection set to "${req.name}".`,
  };
}

/** POST /remove-collection — delete a stored collection. */
export async function handleRemoveCollection(req: RemoveCollectionRequest) {
  if (!req || !req.name?.trim()) {
    throw new Error("'name' is required.");
  }
  const collections = getCollections();
  const target = collections.find((c) => c.name === req.name.trim());
  if (!target) {
    throw new Error(`Collection "${req.name}" not found.`);
  }
  await removeCollection(target);
  return {
    ok: true as const,
    message: `Collection "${req.name}" removed.`,
  };
}

/** GET /list-collections — list stored collections. */
export async function handleListCollections(): Promise<{
  collections: CollectionInfo[];
}> {
  const collections = getCollections();
  return {
    collections: collections.map((c) => ({
      name: c.name,
      guid: c.guid,
      breakpointCount: c.breakpoints?.length ?? 0,
    })),
  };
}
