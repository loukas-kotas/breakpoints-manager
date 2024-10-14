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

  const selectedCollectionTreeItem: CollectionTreeItem | undefined = globalState.collectionProvider?.findTreeItem(selectedCollectionName.label);
  const selectedTreeItem = globalState.collectionProvider?.getTreeItem(selectedCollectionTreeItem!);

  updateIconForActiveCollection(globalState, selectedTreeItem);
  
  setActiveCollectionTreeItem(requestedCollection, globalState, selectedCollectionName);
};

/**
 * The function `setActiveCollectionTreeItem` sets the active breakpoint collection based on the
 * requested collection and displays a message accordingly.
 * @param {BreakpointCollection | undefined} requestedCollection - The `requestedCollection` parameter
 * is of type `BreakpointCollection | undefined`, which means it can either be a `BreakpointCollection`
 * object or `undefined`. The function `setActiveCollectionTreeItem` uses this parameter to set the
 * active collection based on the user's selection.
 * @param {GlobalState} globalState - The `globalState` parameter in the `setActiveCollectionTreeItem`
 * function is likely an object that stores global state information for your application or extension.
 * It may contain properties and values that need to be accessed or updated throughout the application.
 * This parameter is used to keep track of the active collection and
 * @param selectedCollectionName - The `selectedCollectionName` parameter in the
 * `setActiveCollectionTreeItem` function represents the label of the tree item that was selected by
 * the user. It is used to display messages to the user indicating the status of the operation, such as
 * showing an information message when the active collection is set or
 */
function setActiveCollectionTreeItem(requestedCollection: BreakpointCollection | undefined, globalState: GlobalState, selectedCollectionName: vscode.TreeItemLabel) {
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
}

/**
 * The function `updateIconForActiveCollection` updates the icon for the selected collection in a tree
 * view while removing icons from other collection tree items.
 * @param {GlobalState} globalState - The `globalState` parameter is an object that holds the state of
 * the extension globally. It likely contains information about the current state of the extension,
 * such as which collection is active or selected.
 * @param {vscode.TreeItem | undefined} selectedTreeItem - The `selectedTreeItem` parameter is the tree
 * item that is currently selected in the collection tree view.
 */
function updateIconForActiveCollection(globalState: GlobalState, selectedTreeItem: vscode.TreeItem | undefined) {
  // remove icons from all the collection tree items in the collection provider 
  globalState.collectionProvider?.getChildren().forEach(collectionTreeItem => collectionTreeItem.iconPath = undefined);

  // update the icon on the selected collection on the collection provider
  try {
    if (selectedTreeItem) {
      selectedTreeItem.iconPath = new vscode.ThemeIcon('check', new vscode.ThemeColor('charts.green'));
      globalState.collectionProvider?.refresh();
    }
  } catch (e) {
    vscode.window.showErrorMessage('Error: on selecting the tree item');
  }
}
