import * as vscode from "vscode";
import { createCollection } from "../helpers/create-collection";

export async function CreateCollectionCommand() {
  const requestedCollectionName = await vscode.window.showInputBox({
    prompt: "Enter collection name",
  });
  createCollection(requestedCollectionName);
}
