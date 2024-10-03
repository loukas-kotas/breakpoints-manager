import * as vscode from "vscode";
import { GlobalState } from "../global-state";
import { BreakpointCollection, ExportableCollection } from "../models/collection-types.model";
import { toExportableCollection } from "../helpers/to-breakpoint-internal";
import { persistCollectionsToContext } from "../helpers/persist-collection";
import { CommandType } from "../command-type.model";
import { ExportableBreakpoint } from "../models/exportable-breakpoint";

/**
 * The function `createCollection` creates a new breakpoint collection with the current breakpoints and
 * saves it.
 * @param {string | undefined} requestedCollectionName - The `requestedCollectionName` parameter is a
 * string that represents the name of the collection that the user wants to create. It is optional and
 * can be `undefined` if the user does not provide a name for the collection.
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
