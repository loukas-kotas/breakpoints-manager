import * as vscode from "vscode";
import { GlobalState } from "../global-state";
import { BreakpointCollection, ExportableCollection } from "../models/collection-types.model";
import { toExportableCollection } from "../helpers/to-breakpoint-internal";
import { persistCollectionsToContext } from "../helpers/persist-collection";
import { CommandType } from "../command-type.model";

/**
 * The function `createCollection` creates a new breakpoint collection based on the current breakpoints
 * and saves it in the context.
 * @param {string | undefined} requestedCollectionName - The `requestedCollectionName` parameter in the
 * `createCollection` function is a string that represents the name of the collection that the user
 * wants to create. If this parameter is provided and the necessary conditions are met, a new
 * breakpoint collection will be created with the specified name.
 */
export function createCollection(requestedCollectionName: string | undefined) {
  const currentBreakpoints = vscode.debug.breakpoints; // Get current breakpoints
  const globalState = GlobalState.getInstance();

  if (requestedCollectionName && globalState.collectionProvider) {
    // Create a new collection with the current breakpoints
    const newCollection: BreakpointCollection = {
      name: requestedCollectionName,
      breakpoints: currentBreakpoints.filter(
        (bp) => bp instanceof vscode.Breakpoint
      ) as vscode.Breakpoint[],
    };

    // Convert MapCollection to ExportableCollection
    const workspace_uri_path_length = vscode.workspace.workspaceFolders![0].uri.path.length;
    const exportableCollection: ExportableCollection = toExportableCollection(newCollection, workspace_uri_path_length);

    // Save the new collection in the context
    if (globalState.context) {
      persistCollectionsToContext([exportableCollection]);
    }
    // Update Collection Tree Provider
    globalState.collectionProvider.createCollection(exportableCollection.name);

    // Update last action applied
    globalState.lastActionApplied = CommandType.CreateCollection;

    // Show informational message
    vscode.window.showInformationMessage(
      `Breakpoint Collection "${requestedCollectionName}" created.`
    );
  }
}
