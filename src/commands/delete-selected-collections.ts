import { GlobalState } from "../global-state";
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
    vscode.window.showInformationMessage("Selected Collections Removed");
  } catch (error) {
    // Display error message 
    vscode.window.showErrorMessage("ERROR: Could not remove selected collections please try again");
  }
}
