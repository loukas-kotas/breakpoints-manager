import {
  CollectionTreeItem,
  TreeItemLabel,
} from "../collection-tree-provider.model";
import * as vscode from "vscode";
import { CommandType } from "../command-type.model";
import { GlobalState } from "../global-state";
import { identifier } from "../extension";
import { BreakpointCollection } from "../models/collection-types.model";
import { convertToSourceCollection } from "../helpers/convert-to-source-breakpoint";

export async function SetActiveCollectionCommand(
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
  selectedCollectionName: TreeItemLabel
) => {
  const globalState = GlobalState.getInstance();
  const collections = globalState.context?.globalState.get(identifier) as BreakpointCollection[];
  const requestedCollection: BreakpointCollection | undefined = collections.find((col) => col.name === selectedCollectionName.label);

  if (requestedCollection) {
    const workspace_path = vscode.workspace.workspaceFolders![0].uri.path;
    globalState.activeCollection = convertToSourceCollection(requestedCollection, workspace_path);
    vscode.debug.removeBreakpoints(vscode.debug.breakpoints); // remove current breakpoints
    vscode.debug.addBreakpoints(globalState.activeCollection!.breakpoints); // load selected collection's breakpoints
    vscode.window.showInformationMessage(
      `Active Collection Set: ${selectedCollectionName.label}`
    );
  } else {
    vscode.window.showWarningMessage(
      `Collection "${selectedCollectionName.label}" not found.`
    );
  }
};