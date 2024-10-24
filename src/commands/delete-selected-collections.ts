import { WorkspaceState } from "../global-state";
import { showMessage, showMessageWithTimeout } from "../helpers/messages";
import { removeCollection, removeCollections } from "../helpers/remove-collection";

export function DeleteSelectedCollectionsCommand() {
  const globalState = WorkspaceState.getInstance();
  const selectedCollections = globalState.selectedCollections;
  try {
    removeCollections(selectedCollections);

    globalState.selectedCollections = []; // empty selectedCollections after the deletion is completed
    // Display informational message 
    showMessageWithTimeout("Selected Collections Removed");
  } catch (error) {
    // Display error message 
    showMessage("ERROR: Could not remove selected collections please try again", 'error');
    console.error(`Breakpoints Manager`, error);
  }
}
