import {
  CollectionTreeItem,
  TreeItemLabel,
} from "../collection-tree-provider.model";
import * as vscode from "vscode";
import { CommandType } from "../command-type.model";
import { GlobalState } from "../global-state";

export async function setActiveCollectionCommand(
  selectedCollection: CollectionTreeItem
) {
  const globalState = GlobalState.getInstance();
  if (selectedCollection) {
    setActiveCollectionHelper(selectedCollection.label);
  }
  globalState.lastActionApplied = CommandType.SetActiveCollection;
}

// Helper functions
export const setActiveCollectionHelper = async (
  collectionName: TreeItemLabel
) => {
  const globalState = GlobalState.getInstance();
  const collection = globalState.collections.find(
    (col) => col.name === collectionName.label
  );

  if (collection) {
    globalState.activeCollection = collection;
    vscode.debug.removeBreakpoints(vscode.debug.breakpoints); // remove current breakpoints
    vscode.debug.addBreakpoints(globalState.activeCollection!.breakpoints); // load selected collection's breakpoints
    vscode.window.showInformationMessage(
      `Active Collection Set: ${collectionName.label}`
    );
  } else {
    vscode.window.showWarningMessage(
      `Collection "${collectionName}" not found.`
    );
  }
};