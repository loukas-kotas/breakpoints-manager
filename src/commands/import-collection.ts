import * as vscode from "vscode";
import * as fs from "fs";
import { promoteCollectionsFromImport } from "../helpers/save-collection-from-import";
import { CommandType } from "../command-type.model";
import { GlobalState } from "../global-state";
import { persistCollectionsToContext } from "../helpers/persist-collection";
import { ExportableCollection } from "../models/collection-types.model";

export async function ImportCollectionCommand() {
  const globalState = GlobalState.getInstance();
  await importCollections(globalState);

  globalState.lastActionApplied = CommandType.ImportCollection;
}

async function importCollections(globalState: GlobalState) {
  const jsonFileUri = await vscode.window.showOpenDialog({
    filters: { "JSON Files": ["json"] },
    canSelectMany: false,
  });

  if (jsonFileUri && jsonFileUri.length > 0) {
    const jsonContent = fs.readFileSync(jsonFileUri[0].fsPath, "utf8");
    const importedCollections = JSON.parse(
      jsonContent
    ) as ExportableCollection[];

    const fsPath = jsonFileUri[0].fsPath;
    const filename = fsPath.substring(
      fsPath.lastIndexOf("/") + 1, // Find the last '/' and move one position ahead
      fsPath.lastIndexOf(".json") // Find the position of '.json'
    );

    promoteCollectionsFromImport(importedCollections);
    persistCollectionsToContext(importedCollections);
    vscode.window.showInformationMessage(
      `Collection '${filename}' imported successfully.`
    );
  }
}
