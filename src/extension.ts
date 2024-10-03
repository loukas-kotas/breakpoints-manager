import { CommandType } from "./command-type.model";
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import {
  CollectionTreeItem,
  CollectionTreeProvider,
} from "./collection-tree-provider.model";
import { loadCollectionsFromContext } from "./helpers/persist-collection";
import {
  CreateCollectionCommand,
  DeleteSelectedCollectionsCommand,
  ExportSelectedCollectionsCommand,
  ImportCollectionCommand,
  RefreshTreeCommand,
  SearchCollectionCommand,
  SetActiveCollectionCommand,
  UpdateCollectionCommand,
} from "./commands";
import { GlobalState } from "./global-state";
import { onSelectionChange } from "./helpers/on-selection-change";

export const identifier = "breakpointCollections";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

const globalState = GlobalState.getInstance();

export function activate(context: vscode.ExtensionContext) {
  // let collections: BreakpointCollection[];
  // Initilization function when // register tree view
  init(context);

  const createCollection = vscode.commands.registerCommand(
    "breakpointsmanager.createCollection",
    () => {
      CreateCollectionCommand();
    }
  );

  const removeSelectedCollections = vscode.commands.registerCommand(
    CommandType.RemoveSelectedCollections,
    () => {
      DeleteSelectedCollectionsCommand();
    }
  );

  const setActiveCollection = vscode.commands.registerCommand(
    "breakpointsmanager.setActiveCollection",
    (selectedCollection: CollectionTreeItem) => {
      SetActiveCollectionCommand(selectedCollection);
    }
  );

  const exportSelectedCollections = vscode.commands.registerCommand(
    CommandType.ExportSelectedCollections,
    () => {
      ExportSelectedCollectionsCommand();
    }
  );

  const importCollection = vscode.commands.registerCommand(
    CommandType.ImportCollection,
    async () => {
      ImportCollectionCommand();
    }
  );

  const refreshTree = vscode.commands.registerCommand(
    CommandType.RefreshTree,
    () => {
      RefreshTreeCommand();
    }
  );

  const searchCollection = vscode.commands.registerCommand(
    CommandType.SearchCollection,
    () => {
      SearchCollectionCommand();
    }
  );

  const updateCollection = vscode.commands.registerCommand(
    CommandType.UpdateCollection,
    () => {
      UpdateCollectionCommand();
    }
  );

  context.subscriptions.push(
    createCollection,
    setActiveCollection,
    removeSelectedCollections,
    exportSelectedCollections,
    importCollection,
    refreshTree,
    searchCollection,
    updateCollection
  );
}

// This method is called when your extension is deactivated
export function deactivate() {}

function init(context: vscode.ExtensionContext): void {
  const collectionTreeProvider = new CollectionTreeProvider();
  const treeView = vscode.window.createTreeView("breakpointsCollection", {
    treeDataProvider: collectionTreeProvider,
  });
  globalState.collectionProvider = collectionTreeProvider;
  globalState.treeView = treeView;
  globalState.context = context;
  
  // Load collections from context if they exist
  globalState.context.globalState.update(identifier, loadCollectionsFromContext());

  globalState.selectedCollections = [];
  globalState.workspace_uri_path_length =
    vscode.workspace.workspaceFolders![0].uri.path.length;
  globalState.workspace_uri_path =
    vscode.workspace.workspaceFolders![0].uri.path;

  onSelectionChange();
}
