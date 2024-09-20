import { GlobalState } from "../global-state";
import * as vscode from "vscode";
import { toExportableBreakpointCollection } from "../helpers/to-breakpoint-internal";
import { BreakpointCollection } from "../create-collection";
import { persistCollectionsToContext } from "../helpers/persist-collection";

export function UpdateCollectionCommand() {
  const globalState: GlobalState = GlobalState.getInstance();
  try {
    globalState.activeCollection!.breakpoints = [...vscode.debug.breakpoints];
    let workspace_uri_path_length =
      vscode.workspace.workspaceFolders![0].uri.path.length;
    const exportableCollection = toExportableBreakpointCollection(
      globalState.activeCollection as BreakpointCollection,
      workspace_uri_path_length
    );
    if (globalState.context) {
      persistCollectionsToContext([exportableCollection]);
    }

    vscode.window.showInformationMessage(
      `Collection ${globalState.activeCollection?.name} updated!`
    );
  } catch (e) {
    vscode.window.showErrorMessage("Could not Update Collection");
  }
}
