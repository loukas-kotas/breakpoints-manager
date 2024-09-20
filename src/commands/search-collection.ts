import * as vscode from "vscode";
import { setActiveCollectionHelper } from "./set-active-collection";
import { BreakpointCollection } from "../create-collection";
import { CommandType } from "../command-type.model";
import { GlobalState } from "../global-state";

export function SearchCollectionCommand() {
  const globalState = GlobalState.getInstance();

  if (globalState.collectionProvider) {
    const quickPick = vscode.window.createQuickPick();
    quickPick.items = globalState.collections.map(
      (item: BreakpointCollection) => {
        return {
          label: item.name,
          description: item.name,
        } as vscode.QuickPickItem;
      }
    );
    quickPick.onDidChangeSelection((selection) => {
      if (selection[0]) {
        setActiveCollectionHelper({ label: selection[0].label });
      }
    });
    quickPick.onDidHide(() => quickPick.dispose());
    quickPick.show();
    globalState.collectionProvider.refresh();
    globalState.lastActionApplied = CommandType.SearchCollection;
  }
}
