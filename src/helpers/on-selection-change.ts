import { GlobalState } from "../global-state";
import { BreakpointCollection } from "../models/breakpoints.model";

/**
 * The function `onSelectionChange` listens for changes in selection in a tree view and adds selected
 * collections to a global state.
 */
export function onSelectionChange(): void {
  const globalState = GlobalState.getInstance();
  globalState?.treeView?.onDidChangeSelection((event) => {
    const selection = event.selection;
    selection.forEach((collectionTreeItem) => {
      const selectedCollection = globalState.collections.find(
        (item) => item.name === collectionTreeItem.label.label
      ) as BreakpointCollection;
      globalState.selectedCollections.push(selectedCollection);
    });
  });
}
