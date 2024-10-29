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
import { WorkspaceState } from "./global-state";
import { onSelectionChange } from "./helpers/on-selection-change";
import { Labels } from "./models/labels.model";
import { ExportableCollection } from "./models/collection-types.model";

export const identifier = "breakpointCollections";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

const globalState = WorkspaceState.getInstance();

export function activate(context: vscode.ExtensionContext) {
  // let collections: BreakpointCollection[];
  // Initilization function when // register tree view
  init(context);

  const createCollection = vscode.commands.registerCommand(
    CommandType.CreateCollection,
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
    CommandType.SetActiveCollection,
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
    () => {
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
    (selectedCollection: CollectionTreeItem) => {
      UpdateCollectionCommand(selectedCollection);
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

async function init(context: vscode.ExtensionContext): Promise<void> {
  // Initialize values
  const collectionTreeProvider = new CollectionTreeProvider();
  const treeView = vscode.window.createTreeView("breakpointsManager", {
    treeDataProvider: collectionTreeProvider,
  });
  globalState.collectionProvider = collectionTreeProvider;
  globalState.treeView = treeView;
  globalState.context = context;
  
  // Load collections from context if they exist
  await globalState.context.workspaceState.update(identifier, loadCollectionsFromContext());

  // empty selected collections
  globalState.selectedCollections = [];

  // store workspace path length of current directory
  globalState.workspace_uri_path_length =
    vscode.workspace.workspaceFolders![0].uri.path.length;

  // store workspace path of current directory
  globalState.workspace_uri_path =
    vscode.workspace.workspaceFolders![0].uri.path;

  // Listen for changes when a selection changes
  onSelectionChange();

  globalState.treeView.onDidChangeCheckboxState((event) => {
    event.items.forEach(async item => {
      if (item[0].guid === Labels.SelectAll) {
        // return select all checkbox to previous state. Before change.
        item[0].checkboxState = item[0].checkboxState ? vscode.TreeItemCheckboxState.Unchecked : vscode.TreeItemCheckboxState.Checked;
        globalState.collectionProvider?.toggleSelectAll();
        const selectAllState: vscode.TreeItemCheckboxState | undefined = globalState.collectionProvider?.getSelectAllState();

        switch (selectAllState) {
          case vscode.TreeItemCheckboxState.Checked:
            const collections = await globalState.context?.workspaceState.get(identifier) as ExportableCollection[];
            globalState.selectedCollections = collections;
            break;
          case vscode.TreeItemCheckboxState.Unchecked:
            globalState.selectedCollections = [];
            break;
          default: 
            // do nothing
        }
      }
    });
  });
}
