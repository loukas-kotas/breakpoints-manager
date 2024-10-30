import { WorkspaceState } from "../global-state";
import * as vscode from "vscode";
import { ExportableCollection } from "../models/collection-types.model";
import { showMessage, showMessageWithTimeout } from "../helpers/messages";
import { CommandType } from "../command-type.model";
import { CollectionTreeItem } from "../collection-tree-provider.model";
import {  toExportableBreakpoints } from "../helpers/create-exportable-breakpoint";
import { CommonKeys } from "../models";

export async function UpdateCollectionCommand(selectedCollectionItem: CollectionTreeItem) {
  const globalState: WorkspaceState = WorkspaceState.getInstance();
  try {
    // Find the selected collection
    const currentCollections = await globalState.context?.workspaceState.get(CommonKeys.IDENTIFIER) as ExportableCollection[];
    const selectedCollection = currentCollections.find(collection => selectedCollectionItem.guid === collection.guid);

    // Get current breakpoints
    const currentBreakpoints = vscode.debug.breakpoints;

    // Convert to Exportable Breakpoints
    const workspace_uri_path_length = vscode.workspace.workspaceFolders![0].uri.path.length;
    const exportableBreakpoints = toExportableBreakpoints([...currentBreakpoints], workspace_uri_path_length);

    selectedCollection!.breakpoints = exportableBreakpoints;

    if (globalState.context) {
      await globalState.context.workspaceState.update(CommonKeys.IDENTIFIER, currentCollections);
      globalState.collectionProvider?.refresh();
    }

    globalState.lastActionApplied = CommandType.UpdateCollection;
    showMessageWithTimeout(`Collection ${selectedCollection?.name} updated!`);
  } catch (error) {
    showMessage("Could not Update Collection", 'error');
    console.error(`[ERROR] Could not update collection `, error);
  }
}
