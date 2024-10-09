import { CommandType } from "../command-type.model";
import { GlobalState } from "../global-state";
import { exportCollections } from "../helpers/export-collection";
import * as vscode from 'vscode';

export async function ExportSelectedCollectionsCommand() {
  const globalState = GlobalState.getInstance();
  const selectedCollections = globalState.selectedCollections;
  const fileTitle = `bm-exports-${new Date().getTime()}`;

  try {
    if (selectedCollections) {
      if (globalState.workspace_uri_path_length) {
        exportCollections(
          { label: fileTitle },
          selectedCollections
        );
      }
      globalState.lastActionApplied = CommandType.ExportSelectedCollections;
      vscode.window.showInformationMessage(
        `Collection '${fileTitle}' exported successfully.`
      );
    }
  } catch (error) {
    vscode.window.showErrorMessage(
      `ERROR: Could not export collections`
    );
  }
}
