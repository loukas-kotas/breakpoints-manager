import { GlobalState } from "../global-state";
import { removeCollection } from "../helpers/remove-collection";

export function DeleteSelectedCollectionsCommand() {
  const globalState = GlobalState.getInstance();
  const selectedCollections = globalState.selectedCollections;

  selectedCollections.forEach((selectedCollection) => {
    removeCollection(
      globalState.collectionProvider?.findTreeItem(selectedCollection.name)!
    );
  });
}
