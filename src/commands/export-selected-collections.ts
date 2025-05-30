import { CommandType } from "../command-type.model";
import { WorkspaceState } from "../global-state";
import { exportCollections } from "../helpers/export-collection";
import { showMessage } from "../helpers/messages";

export function ExportSelectedCollectionsCommand() {
  const globalState = WorkspaceState.getInstance();
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
    }
  } catch (error) {
    showMessage(`ERROR: Could not export collections`, 'error');
    console.log(`[ERROR] Could not export collections: `, error);
  }
}
