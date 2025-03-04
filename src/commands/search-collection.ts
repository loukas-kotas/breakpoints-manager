import * as vscode from "vscode";
import { setActiveCollectionHelper } from "./set-active-collection";
import { ExportableCollection } from "../models/collection-types.model";
import { CommandType } from "../command-type.model";
import { WorkspaceState } from "../global-state";
import { CommonKeys } from "../models";

export async function SearchCollectionCommand() {
  const globalState = WorkspaceState.getInstance();

  if (globalState.collectionProvider) {
    const quickPick = vscode.window.createQuickPick();
    const contextCollections: ExportableCollection[] = await globalState.context?.workspaceState.get(CommonKeys.IDENTIFIER) ?? [];
    quickPick.items = contextCollections.map(
      (item: ExportableCollection) => {
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
