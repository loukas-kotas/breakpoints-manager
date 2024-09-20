import * as vscode from "vscode";
import { updateCollectionsInContext } from "../helpers/persist-collection";
import { CommandType } from "../command-type.model";
import { GlobalState } from "../global-state";

export function DeleteAllCollectionsCommand() {
  const globalState = GlobalState.getInstance();
  if (globalState.collectionProvider) {
    globalState.collectionProvider.removeAllCollections();
    globalState.collections = [];
    globalState.selectedCollections = [];
    try {
      if (globalState.context) {
        updateCollectionsInContext(globalState.context, []);
      }
    } catch (e) {
      vscode.window.showErrorMessage(`Error ${e}`);
    }
    globalState.lastActionApplied = CommandType.RemoveAllCollections;
    vscode.window.showInformationMessage(
      "All the collections have been removed"
    );
  }
}
