import {
  CollectionTreeItem,
  TreeItemLabel,
} from "../collection-tree-provider.model";
import * as vscode from "vscode";
import { CommandType } from "../command-type.model";
import { WorkspaceState } from "../global-state";
import { identifier } from "../extension";
import { BreakpointCollection, ExportableCollection } from "../models/collection-types.model";
import { convertToSourceBreakpoints } from "../helpers/convert-to-source-breakpoint";
import { showMessage, showMessageWithTimeout } from "../helpers/messages";

export async function SetActiveCollectionCommand(
  selectedCollection: CollectionTreeItem
) {
  const globalState = WorkspaceState.getInstance();
  if (selectedCollection) {
    setActiveCollectionHelper(selectedCollection.label);
  }
  globalState.lastActionApplied = CommandType.SetActiveCollection;
}

// Helper functions
export const setActiveCollectionHelper = async (
  selectedCollectionName: TreeItemLabel
) => {
  const globalState = WorkspaceState.getInstance();
  const collections = globalState.context?.workspaceState.get(identifier) as BreakpointCollection[];
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
 * @param {WorkspaceState} globalState - The `globalState` parameter in the `setActiveCollectionTreeItem`
 * function is likely an object that stores global state information for your application or extension.
 * It may contain properties and values that need to be accessed or updated throughout the application.
 * This parameter is used to keep track of the active collection and
 * @param selectedCollectionName - The `selectedCollectionName` parameter in the
 * `setActiveCollectionTreeItem` function represents the label of the tree item that was selected by
 * the user. It is used to display messages to the user indicating the status of the operation, such as
 * showing an information message when the active collection is set or
 */
function setActiveCollectionTreeItem(requestedCollection: BreakpointCollection | undefined, globalState: WorkspaceState, selectedCollectionName: vscode.TreeItemLabel) {
  if (requestedCollection) {
    const workspace_path = vscode.workspace.workspaceFolders![0].uri.path;
    // Find selected collection
    const currentCollections = globalState.context?.workspaceState.get(identifier) as ExportableCollection[];
    const selectedCollection = currentCollections.find(collection => requestedCollection.name === collection.name);

    vscode.debug.removeBreakpoints(vscode.debug.breakpoints); // remove current breakpoints
    vscode.debug.addBreakpoints(convertToSourceBreakpoints(selectedCollection!.breakpoints, workspace_path)); // load selected collection's breakpoints
    showMessageWithTimeout(`Active Collection Set: ${selectedCollectionName.label}`);
  } else {
    vscode.window.showWarningMessage(
      `Collection "${selectedCollectionName.label}" not found.`
    );
  }
}

/**
 * The function `updateIconForActiveCollection` updates the icon for the selected collection in a tree
 * view while removing icons from other collection tree items.
 * @param {WorkspaceState} globalState - The `globalState` parameter is an object that holds the state of
 * the extension globally. It likely contains information about the current state of the extension,
 * such as which collection is active or selected.
 * @param {vscode.TreeItem | undefined} selectedTreeItem - The `selectedTreeItem` parameter is the tree
 * item that is currently selected in the collection tree view.
 */
function updateIconForActiveCollection(globalState: WorkspaceState, selectedTreeItem: vscode.TreeItem | undefined) {
  // remove icons from all the collection tree items in the collection provider 
  globalState.collectionProvider?.getChildren().forEach(collectionTreeItem => collectionTreeItem.iconPath = undefined);

  // update the icon on the selected collection on the collection provider
  try {
    if (selectedTreeItem) {
      selectedTreeItem.iconPath = new vscode.ThemeIcon('check', new vscode.ThemeColor('charts.green'));
      globalState.collectionProvider?.refresh();
    }
  } catch (e) {
    showMessage('Error: on selecting the tree item', 'error');
  }
}
