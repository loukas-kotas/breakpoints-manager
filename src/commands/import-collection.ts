import * as vscode from "vscode";
import * as fs from "fs";
import * as circularJson from "circular-json";
import { promoteCollectionsFromImport } from "../helpers/save-collection-from-import";
import { CommandType } from "../command-type.model";
import { GlobalState } from "../global-state";
import { ExportedBreakpointCollection } from "../models/breakpoints.model";

export async function ImportCollectionCommand() {
  const globalState = GlobalState.getInstance();
  await importCollections();

  globalState.lastActionApplied = CommandType.ImportCollection;
}

async function importCollections() {
  const jsonFileUri = await vscode.window.showOpenDialog({
    filters: { "JSON Files": ["json"] },
    canSelectMany: false,
  });

  if (jsonFileUri && jsonFileUri.length > 0) {
    const jsonContent = fs.readFileSync(jsonFileUri[0].fsPath, "utf8");
    const importedCollections = circularJson.parse(
      jsonContent
    ) as ExportedBreakpointCollection[];

    const fsPath = jsonFileUri[0].fsPath;
    const filename = fsPath.substring(
      fsPath.lastIndexOf("/") + 1, // Find the last '/' and move one position ahead
      fsPath.lastIndexOf(".json") // Find the position of '.json'
    );

    promoteCollectionsFromImport(importedCollections);
    vscode.window.showInformationMessage(
      `Collection '${filename}' imported successfully.`
    );
  }
}
