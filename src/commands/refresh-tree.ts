import { CommandType } from "../command-type.model";
import { WorkspaceState } from "../global-state";

export function RefreshTreeCommand() {
  const globalState = WorkspaceState.getInstance();
  if (globalState.collectionProvider && globalState.context) {
    globalState.collectionProvider.refresh();
    globalState.lastActionApplied = CommandType.RefreshTree;
  }
}
