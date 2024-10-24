import { GlobalState } from "../global-state";
import * as vscode from "vscode";
import { ExportableCollection } from "../models/collection-types.model";
import { showMessage, showMessageWithTimeout } from "../helpers/messages";
import { CommandType } from "../command-type.model";
import { CollectionTreeItem } from "../collection-tree-provider.model";
import { identifier } from "../extension";
import {  toExportableBreakpoints } from "../helpers/create-exportable-breakpoint";

export function UpdateCollectionCommand(selectedCollectionItem: CollectionTreeItem) {
  const globalState: GlobalState = GlobalState.getInstance();
  try {
    // Find the selected collection
    const currentCollections = globalState.context?.globalState.get(identifier) as ExportableCollection[];
    const selectedCollection = currentCollections.find(collection => selectedCollectionItem.label.label === collection.name);

    // Get current breakpoints
    const currentBreakpoints = vscode.debug.breakpoints;

    // Convert to Exportable Breakpoints
    const workspace_uri_path_length = vscode.workspace.workspaceFolders![0].uri.path.length;
    const exportableBreakpoints = toExportableBreakpoints([...currentBreakpoints], workspace_uri_path_length);

    selectedCollection!.breakpoints = JSON.parse(JSON.stringify(exportableBreakpoints));

    if (globalState.context) {
      globalState.context.workspaceState.update(identifier, currentCollections);
      globalState.collectionProvider?.refresh();
    }

    globalState.lastActionApplied = CommandType.UpdateCollection;
    showMessageWithTimeout(`Collection ${selectedCollection?.name} updated!`);
  } catch (e) {
    showMessage("Could not Update Collection", 'error');
  }
}
