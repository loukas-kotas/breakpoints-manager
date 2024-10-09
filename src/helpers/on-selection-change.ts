import { identifier } from "../extension";
import { GlobalState } from "../global-state";
import { ExportableCollection } from "../models/collection-types.model";
import { Labels } from "../models/labels.model";

/**
 * The function `onSelectionChange` listens for selection changes in a tree view and adds selected
 * collections to a global state.
 */
export function onSelectionChange(): void {
  const globalState = GlobalState.getInstance();
  globalState?.treeView?.onDidChangeSelection((event) => {
    const selection = event.selection;
    selection.forEach((collectionTreeItem) => {
      
      // If the user clicked the "Select All" select all the items
      if (collectionTreeItem.label.label === Labels.SelectAll) {
        globalState.collectionProvider?.toggleSelectAll();
      } else {
        const contextCollections: ExportableCollection[] = globalState.context?.globalState.get(identifier) ?? [];
        const selectedCollection = contextCollections.find((item) => item.name === collectionTreeItem.label.label) as ExportableCollection;
        globalState.selectedCollections.push(selectedCollection);
      }
    });
  });
}
