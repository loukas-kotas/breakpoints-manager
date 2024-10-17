import { TreeItemLabel } from "../collection-tree-provider.model";
import { ExportableCollection } from "../models/collection-types.model";
import * as vscode from "vscode";
import * as fs from "fs";
import { showMessageWithTimeout } from "./messages";

/**
 * The function `exportCollection` exports a collection of data to a JSON file after converting it to a
 * string.
 * @param {TreeItemLabel} collectionName - The `collectionName` parameter is the label of the tree item
 * representing the collection that you want to export.
 * @param {ExportableCollection[]} collections - The `collections` parameter in the `exportCollection`
 * function is an array of `ExportableCollection` objects that you want to export to a JSON file. Each
 * `ExportableCollection` object represents a collection of data that you want to save in the JSON
 * file.
 */
export async function exportCollections(
  collectionName: TreeItemLabel,
  collections: ExportableCollection[]
) {
  const jsonFileUri = await openSaveDialog(collectionName);
  if (collections) {
    const exportedCollections: ExportableCollection[] = [];
    collections.forEach((collection) => {
      exportedCollections.push(collection);
    });

    const jsonContent = JSON.stringify(exportedCollections);

    if (jsonFileUri) {
      try {
        fs.writeFileSync(jsonFileUri.fsPath, jsonContent, "utf8");
        showMessageWithTimeout(`Collection '${collectionName.label}' exported successfully.`);
      } catch (error) {
        console.error(error);
        console.error("There was error while exporting the selected collections");
      }
    }
  }
}

/**
 * The function `openSaveDialog` in TypeScript opens a save dialog for a JSON file with a default
 * filename based on the provided collection name.
 * @param collectionName - The `collectionName` parameter in the `openSaveDialog` function is of type
 * `vscode.TreeItem`. It represents an item in a tree view, typically used in Visual Studio Code
 * extensions to display hierarchical data.
 * @returns The `openSaveDialog` function is returning a Promise that resolves to a `vscode.Uri` object
 * representing the URI of the selected file in the save dialog. If no file is selected or the dialog
 * is canceled, it will return `undefined`.
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
