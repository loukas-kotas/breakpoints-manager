import { WorkspaceState } from "../global-state";
import { updateCollectionsInContext } from "./persist-collection";
import { identifier } from '../extension';
import { ExportableCollection } from '../models/collection-types.model';
import { showMessage } from "./messages";
import { CommandType } from "../command-type.model";

/**
 * The function `removeCollection` removes a specified collection from a global state and updates the
 * context and collection tree provider accordingly.
 * @param {ExportableCollection} collectionToDelete - The `collectionToDelete` parameter is an
 * `ExportableCollection` object that represents the collection that needs to be removed from the
 * context and the collection tree provider.
 */
export function removeCollection(collectionToDelete: ExportableCollection) {
  const globalState = WorkspaceState.getInstance();

  if (globalState.collectionProvider) {
    // Retrieve collections stored in context
    const contextCollections: ExportableCollection[] = globalState.context?.workspaceState.get(identifier) as ExportableCollection[];
    
    // remove collection from context collections
    const remainingCollections = contextCollections.filter(
      (col) => col.name !== collectionToDelete.name
    );

    try {
      if (globalState.context) {
        
        // update context with the remaining collections, after selected collection removal.
        updateCollectionsInContext(
          globalState.context,
          remainingCollections
        );
        
        // update collection tree provider
        globalState.collectionProvider.removeCollection({label: collectionToDelete.name}); // remove collection from the collection tree\
        globalState.collectionProvider.refresh();

        globalState.lastActionApplied = CommandType.RemoveSelectedCollections;
      }
    } catch (e) {
      showMessage(`Error: ${e}`, 'error');
    }
  }
}

/**
 * The function `removeCollections` takes an array of `ExportableCollection` objects and removes each
 * collection using the `removeCollection` function.
 * @param {ExportableCollection[]} collectionsToDelete - An array of ExportableCollection objects that
 * need to be deleted.
 */
export function removeCollections(collectionsToDelete: ExportableCollection[]) {
  collectionsToDelete.forEach((collectionToDelete) => removeCollection(collectionToDelete));
}
