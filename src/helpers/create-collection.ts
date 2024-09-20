import * as vscode from "vscode";
import { GlobalState } from "../global-state";
import { BreakpointCollection } from "../create-collection";
import { toExportableBreakpointCollection } from "../helpers/to-breakpoint-internal";
import { persistCollectionsToContext } from "../helpers/persist-collection";
import { CommandType } from "../command-type.model";

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

    let workspace_uri_path_length =
      vscode.workspace.workspaceFolders![0].uri.path.length;

    // Save the new collection
    globalState.collections.push(newCollection);
    const exportableCollection = toExportableBreakpointCollection(
      newCollection,
      workspace_uri_path_length
    );
    if (globalState.context) {
      persistCollectionsToContext([exportableCollection]);
    }
    globalState.collectionProvider.addCollection(newCollection.name);
    globalState.lastActionApplied = CommandType.AddCollection;
    vscode.window.showInformationMessage(
      `Breakpoint Collection "${requestedCollectionName}" created.`
    );
  }
}
