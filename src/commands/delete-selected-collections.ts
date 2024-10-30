import { WorkspaceState } from "../global-state";
import { showMessage, showMessageWithTimeout } from "../helpers/messages";
import { removeCollections } from "../helpers/remove-collection";
import { CommonKeys } from "../models";

export async function DeleteSelectedCollectionsCommand() {
  const globalState = WorkspaceState.getInstance();
  const selectedCollections = globalState.selectedCollections;

  if (selectedCollections.length === 0) {
    console.warn(globalState.context?.workspaceState.get(CommonKeys.IDENTIFIER));
    showMessage('You have not selected any collections', 'warning');
    return;
  }

  try {
    await removeCollections(selectedCollections);
    
    globalState.selectedCollections = []; // empty selectedCollections after the deletion is completed
    // Display informational message 
    showMessageWithTimeout("Selected Collections Removed");
  } catch (error) {
    // Display error message 
    showMessage("ERROR: Could not remove selected collections please try again", 'error');
    console.error(`[ERROR] Could not remove selected collections: `, error);
  }
}
