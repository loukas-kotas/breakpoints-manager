import { CollectionTreeItem } from "../collection-tree-provider.model";
import { CommandType } from "../command-type.model";
import { GlobalState } from "../global-state";
import { removeCollection } from "../helpers/remove-collection";

export function DeleteCollectionCommand(collectionItem: CollectionTreeItem) {
  const globalState = GlobalState.getInstance();
  removeCollection(collectionItem);
  globalState.lastActionApplied = CommandType.RemoveCollection;
}
