import { CommandType } from "../command-type.model";
import { GlobalState } from "../global-state";
import { exportCollection } from "../helpers/export-collection";

export async function ExportSelectedCollectionsCommand() {
  const globalState = GlobalState.getInstance();
  const selectedCollections = globalState.selectedCollections;
  if (selectedCollections) {
    if (globalState.workspace_uri_path_length) {
      exportCollection(
        { label: `bm-exports-${new Date().getTime()}` },
        selectedCollections
      );
    }
    globalState.lastActionApplied = CommandType.ExportSelectedCollections;
  }
}
