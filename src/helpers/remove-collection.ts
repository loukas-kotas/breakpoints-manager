import { CollectionTreeItem } from "../collection-tree-provider.model";
import { GlobalState } from "../global-state";
import { updateCollectionsInContext } from "./persist-collection";
import * as vscode from "vscode";
import { identifier } from '../extension';
import { ExportableCollection } from '../models/collection-types.model';

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
    // Retrieve collections stored in context
    const contextCollections: ExportableCollection[] = globalState.context?.globalState.get(identifier) as ExportableCollection[];
    
    // remove collection from context collections
    const remainingCollections = contextCollections.filter(
      (col) => col.name !== collectionItem.label.label
    );

    try {
      if (globalState.context) {
        
        // update context with the remaining collections, after selected collection removal.
        updateCollectionsInContext(
          globalState.context,
          remainingCollections
        );
        
        // update collection tree provider
        globalState.collectionProvider.removeCollection(collectionItem.label); // remove collection from the collection tree
        
        // remove collection from selectedCollections if exists in there
        globalState.selectedCollections =
          globalState.selectedCollections.filter(
            (collection) => collection.name !== collectionItem.label.label
          );
        
        // Display informational message 
        vscode.window.showInformationMessage(
          `Collection "${collectionItem.label.label}" removed.`
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
