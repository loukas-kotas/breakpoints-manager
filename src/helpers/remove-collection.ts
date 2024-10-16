import { CollectionTreeItem } from "../collection-tree-provider.model";
import { GlobalState } from "../global-state";
import { updateCollectionsInContext } from "./persist-collection";
import { identifier } from '../extension';
import { ExportableCollection } from '../models/collection-types.model';
import { showMessage } from "./messages";

/**
 * This TypeScript function removes a collection item from a collection tree and updates the context
 * and selected collections accordingly.
 * @param {CollectionTreeItem} collectionItem - The `collectionItem` parameter in the
 * `removeCollection` function is of type `CollectionTreeItem`. It seems to represent an item in a
 * collection tree, possibly used in a user interface to display collections. The function removes this
 * collection item from various places such as the context collections, the collection tree
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
      }
    } catch (e) {
      showMessage(`Error: ${e}`, 'error');
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
