import * as vscode from "vscode";
import { CollectionTreeItem } from "../collection-tree-provider.model";
import { WorkspaceState } from "../global-state";
import { Labels, CommonKeys, ExportableCollection } from "../models";
import { showMessage } from "./messages";

// TODO: Optimize function. Redundant and ugly code.
export function listenCheckboxChanges() {
  const globalState = WorkspaceState.getInstance();

  if (globalState.treeView === undefined) {
    showMessage("Tree view is undefined", 'error');
    console.error("[Breakpoints Manager] Tree view is undefined");
    return;
  }

  globalState.treeView.onDidChangeCheckboxState((event) => {
    event.items.forEach(async (item) => {
      const collectionTreeItem = item[0] as CollectionTreeItem;

      if (collectionTreeItem.guid === Labels.SelectAll) {
        // return select all checkbox to previous state. Before change.
        collectionTreeItem.checkboxState = collectionTreeItem.checkboxState ? vscode.TreeItemCheckboxState.Unchecked : vscode.TreeItemCheckboxState.Checked;
        globalState.collectionProvider?.toggleSelectAll();
        const selectAllState: vscode.TreeItemCheckboxState | undefined = globalState.collectionProvider?.getSelectAllState();

        switch (selectAllState) {
          case vscode.TreeItemCheckboxState.Checked:
            const collections = await globalState.context?.workspaceState.get(CommonKeys.IDENTIFIER) as ExportableCollection[];
            globalState.selectedCollections = collections;
            break;
          case vscode.TreeItemCheckboxState.Unchecked:
            globalState.selectedCollections = [];
            break;
          default:
          // do nothing
        }
      } else {
        // Update selectedCollections for non "Select / Unselect all" checkbox
        const collectionCheckboxState = collectionTreeItem.checkboxState;
        const contextCollections: ExportableCollection[] = await globalState.context?.workspaceState.get(CommonKeys.IDENTIFIER) ?? [];
        const selectedCollection = contextCollections.find((item) => item.guid === collectionTreeItem.guid) as ExportableCollection;

        switch (collectionCheckboxState) {
          case vscode.TreeItemCheckboxState.Checked:
            globalState.selectedCollections.push(selectedCollection);
            break;
          case vscode.TreeItemCheckboxState.Unchecked:
            globalState.selectedCollections = globalState.selectedCollections.filter(collection => collection.guid !== selectedCollection.guid);
            break;
          default:
          // do nothing
        }
      }
    });
  });
}
