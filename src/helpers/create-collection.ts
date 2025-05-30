import * as vscode from "vscode";
import { WorkspaceState } from "../global-state";
import { BreakpointCollection, ExportableCollection } from "../models/collection-types.model";
import { toExportableCollection } from "../helpers/to-breakpoint-internal";
import { persistCollectionsToContext } from "../helpers/persist-collection";
import { CommandType } from "../command-type.model";
import { showMessage, showMessageWithTimeout } from "./messages";
import { createBreakpointCollection } from "../commands/create-breakpoint-collection";

/**
 * The function `createCollection` creates a new breakpoint collection based on the current breakpoints
 * and saves it in the context.
 * @param {string | undefined} requestedCollectionName - The `requestedCollectionName` parameter in the
 * `createCollection` function is a string that represents the name of the collection that the user
 * wants to create. If this parameter is provided and the necessary conditions are met, a new
 * breakpoint collection will be created with the specified name.
 */
export async function createCollection(requestedCollectionName: string | undefined) {
  try {
    const currentBreakpoints = vscode.debug.breakpoints; // Get current breakpoints
    const globalState = WorkspaceState.getInstance();
  
    if (requestedCollectionName && globalState.collectionProvider) {
      // Create a new collection with the current breakpoints
      const newCollection: BreakpointCollection = createBreakpointCollection(requestedCollectionName, currentBreakpoints);
  
      // Convert MapCollection to ExportableCollection
      const workspace_uri_path_length = vscode.workspace.workspaceFolders![0].uri.path.length;
      const exportableCollection: ExportableCollection = toExportableCollection(newCollection, workspace_uri_path_length);
  
      // Save the new collection in the context
      if (globalState.context) {
        await persistCollectionsToContext([exportableCollection]);
      }
      // Update Collection Tree Provider
      globalState.collectionProvider.addCollectionToTree(exportableCollection.name, exportableCollection.guid);
  
      // Update last action applied
      globalState.lastActionApplied = CommandType.CreateCollection;
  
      // Show informational message
      showMessageWithTimeout(`Breakpoint Collection "${requestedCollectionName}" created.`);  
  } 
  } catch (error) {
    console.error(`[BreakpointsManager] Failed to create collection`, error);
    showMessage(`Failed to create collection`, 'error');
  }
}
