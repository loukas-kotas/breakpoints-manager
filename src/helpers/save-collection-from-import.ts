import {
  ExportableCollection,
} from "../models/collection-types.model";
import { WorkspaceState } from "../global-state";
import { convertToSourceBreakpoint } from "./convert-to-source-breakpoint";
import * as vscode from "vscode";

/**
 * The function `promoteCollectionFromImport` takes an `ExportableCollection` as input, creates a
 * collection in the global state, refreshes the collection provider, and converts breakpoints to
 * source breakpoints.
 * @param {ExportableCollection} collection - The `collection` parameter is of type
 * `ExportableCollection`, which likely contains information about a collection of items that can be
 * exported or imported.
 */
const promoteCollectionFromImport = (
  collection: ExportableCollection
): void => {
  const globalState: WorkspaceState = WorkspaceState.getInstance();
  const workspace_path = globalState.workspace_uri_path;
  const restoredBreakpoints: vscode.SourceBreakpoint[] = [];
  globalState.collectionProvider?.createCollection(collection.name, collection.guid);
  globalState.collectionProvider?.refresh();

  collection.breakpoints.forEach((breakpoint) =>
    restoredBreakpoints.push(
      convertToSourceBreakpoint(breakpoint, workspace_path!)!
    )
  );
};

/**
 * The function `promoteCollectionsFromImport` iterates over an array of `ExportableCollection` objects
 * and calls `promoteCollectionFromImport` on each one.
 * @param {ExportableCollection[]} collections - An array of `ExportableCollection` objects.
 */
export const promoteCollectionsFromImport = (
  collections: ExportableCollection[]
): void => collections.forEach((collection) => promoteCollectionFromImport(collection));
