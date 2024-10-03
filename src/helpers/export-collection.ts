import { TreeItemLabel } from "../collection-tree-provider.model";
import { BreakpointCollection, ExportableCollection } from "../models/collection-types.model";
import * as vscode from "vscode";
import * as circularJson from "circular-json";
import * as fs from "fs";

/**
 * The function `exportCollection` exports a selected breakpoint collection to a JSON file after
 * converting it to an exportable format.
 * @param {TreeItemLabel} collectionName - `collectionName` is a parameter representing the name of
 * the collection to be exported. It is of type `TreeItemLabel`.
 * @param {BreakpointCollection[]} collections - The `collections` parameter in the
 * `exportCollection` function is an array of `BreakpointCollection` objects. This array contains
 * multiple collections of breakpoints that can be exported.
 */
export async function exportCollection(
  collectionName: TreeItemLabel,
  collections: ExportableCollection[]
) {
  const jsonFileUri = await openSaveDialog(collectionName);
  if (collections) {
    const exportedCollections: ExportableCollection[] = [];
    collections.forEach((collection) => {
      exportedCollections.push(collection);
    });

    const jsonContent = circularJson.stringify(exportedCollections);

    if (jsonFileUri) {
      fs.writeFileSync(jsonFileUri.fsPath, jsonContent, "utf8");
    }
  }
}

/**
 * The function `openSaveDialog` asynchronously opens a save dialog for a JSON file with a default file
 * name based on a provided collection name.
 * @param collectionName - `collectionName` is a `vscode.TreeItem` object representing an item in a
 * tree view within the Visual Studio Code editor.
 * @returns The function `openSaveDialog` is returning a Promise that resolves to a `vscode.Uri` object
 * or `undefined`.
 */
async function openSaveDialog(
  collectionName: vscode.TreeItem
): Promise<vscode.Uri | undefined> {
  const jsonFileUri = await vscode.window.showSaveDialog({
    filters: { "JSON Files": ["json"] },
    defaultUri: vscode.Uri.file(`${collectionName.label}.json`),
  });

  return jsonFileUri;
}
