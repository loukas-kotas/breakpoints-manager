import { CommandType } from "../command-type.model";
import { WorkspaceState } from "../global-state";
import { showMessageWithTimeout } from "../helpers/messages";

export function RefreshTreeCommand() {
  const globalState = WorkspaceState.getInstance();
  if (globalState.collectionProvider && globalState.context) {
    globalState.collectionProvider.refresh();
    globalState.lastActionApplied = CommandType.RefreshTree;
    // Show informational message
    showMessageWithTimeout(`Refreshing Collections`, 2000);
  }
}
