import { CollectionTreeItem } from "../collection-tree-provider.model";
import { CommandType } from "../command-type.model";
import { GlobalState } from "../global-state";
import { exportCollection } from "../helpers/export-collection";

export async function ExportCollectionCommand(
  selectedCollection: CollectionTreeItem
) {
  const globalState = GlobalState.getInstance();
  if (selectedCollection) {
    const collectionName = selectedCollection.label;
    exportCollection(collectionName, globalState.collections);
    globalState.lastActionApplied = CommandType.ExportCollection;
  }
}
