import { GlobalState } from "../global-state";
import * as vscode from "vscode";
import { toExportableCollection } from "../helpers/to-breakpoint-internal";
import { BreakpointCollection } from "../models/collection-types.model";
import { persistCollectionsToContext } from "../helpers/persist-collection";
import { showMessage, showMessageWithTimeout } from "../helpers/messages";

export function UpdateCollectionCommand() {
  const globalState: GlobalState = GlobalState.getInstance();
  try {
    globalState.activeCollection!.breakpoints = [...vscode.debug.breakpoints];
    let workspace_uri_path_length =
      vscode.workspace.workspaceFolders![0].uri.path.length;
    const exportableCollection = toExportableCollection(
      globalState.activeCollection as BreakpointCollection,
      workspace_uri_path_length
    );
    if (globalState.context) {
      persistCollectionsToContext([exportableCollection]);
    }

    showMessageWithTimeout(`Collection ${globalState.activeCollection?.name} updated!`);
  } catch (e) {
    showMessage("Could not Update Collection", 'error');
  }
}
