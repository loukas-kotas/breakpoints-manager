import { GlobalState } from "../global-state";
import { showMessage, showMessageWithTimeout } from "../helpers/messages";
import { removeCollection } from "../helpers/remove-collection";
import * as vscode from "vscode";

export function DeleteSelectedCollectionsCommand() {
  const globalState = GlobalState.getInstance();
  const selectedCollections = globalState.selectedCollections;
  try {
    selectedCollections.forEach((selectedCollection) => {
      removeCollection(
        globalState.collectionProvider?.findTreeItem(selectedCollection.name)!
      );
    });
    // Display informational message 
    showMessageWithTimeout("Selected Collections Removed");
  } catch (error) {
    // Display error message 
    showMessage("ERROR: Could not remove selected collections please try again", 'error');
  }
}
