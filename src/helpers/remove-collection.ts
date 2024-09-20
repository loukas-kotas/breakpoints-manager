import { CollectionTreeItem } from "../collection-tree-provider.model";
import { GlobalState } from "../global-state";
import { updateCollectionsInContext } from "./persist-collection";
import * as vscode from "vscode";

/**
 * This function removes a collection item from various places in the global state and displays
 * appropriate messages in a TypeScript environment.
 * @param {CollectionTreeItem} collectionItem - The `collectionItem` parameter is an object of type
 * `CollectionTreeItem`, which likely represents an item in a collection tree. It contains information
 * about the collection item, such as its label and possibly other properties related to the
 * collection.
 */
export function removeCollection(collectionItem: CollectionTreeItem) {
  const globalState = GlobalState.getInstance();

  if (globalState.collectionProvider) {
    globalState.collections = globalState.collections.filter(
      (col) => col.name !== collectionItem.label.label
    ); // remove collection from here too
    try {
      if (globalState.context) {
        updateCollectionsInContext(
          globalState.context,
          globalState.collections
        );
        globalState.collectionProvider.removeCollection(collectionItem.label); // remove collection from the collection tree
        globalState.selectedCollections =
          globalState.selectedCollections.filter(
            (collection) => collection.name !== collectionItem.label.label
          ); // remove collection from selected collection if exists in there.
        vscode.window.showInformationMessage(
          `Collection "${collectionItem.label}" removed.`
        );
      }
    } catch (e) {
      vscode.window.showErrorMessage(`Error: ${e}`);
    }
  }
}

/**
 * The function `removeCollections` iterates through an array of `CollectionTreeItem` objects and calls
 * `removeCollection` on each item.
 * @param {CollectionTreeItem[]} collectionItems - An array of CollectionTreeItem objects.
 */
export function removeCollections(collectionItems: CollectionTreeItem[]) {
  collectionItems.forEach((collectionItem) => removeCollection(collectionItem));
}
