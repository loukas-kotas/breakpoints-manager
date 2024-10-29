import { identifier } from "../extension";
import { WorkspaceState } from "../global-state";
import { ExportableCollection } from "../models/collection-types.model";
import { Labels } from "../models/labels.model";

/**
 * The function `onSelectionChange` listens for selection changes in a tree view and adds selected
 * collections to a global state.
 */
export function onSelectionChange(): void {
  const globalState = WorkspaceState.getInstance();
  globalState?.treeView?.onDidChangeSelection((event) => {
    const selection = event.selection;
    if (selection && selection.length === 0) { return; } 
    selection.forEach(async (collectionTreeItem) => {
      
      // If the user clicked the "Select All" select all the items
      if (collectionTreeItem.guid === Labels.SelectAll) {
        globalState.collectionProvider?.toggleSelectAll();
      } else {
        const contextCollections: ExportableCollection[] = await globalState.context?.workspaceState.get(identifier) ?? [];
        const selectedCollection = contextCollections.find((item) => item.guid === collectionTreeItem.guid) as ExportableCollection;
        globalState.selectedCollections.push(selectedCollection);
      }
    });
  });
}
