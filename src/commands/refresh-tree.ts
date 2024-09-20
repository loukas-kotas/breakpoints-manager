import { CommandType } from "../command-type.model";
import { GlobalState } from "../global-state";

export function RefreshTreeCommand() {
  const globalState = GlobalState.getInstance();
  if (globalState.collectionProvider && globalState.context) {
    globalState.collectionProvider.refresh();
    globalState.lastActionApplied = CommandType.RefreshTree;
  }
}
