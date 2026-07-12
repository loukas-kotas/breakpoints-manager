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
import { CommonKeys } from "./models";
import { listenCheckboxChanges } from "./helpers/listen-checkbox-changes";
import { startMcpBridge, showMcpStatus, stopMcpBridge } from "./mcp-bridge/bridge";

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

  const showMcpStatusCommand = vscode.commands.registerCommand(
    CommandType.ShowMcpStatus,
    () => {
      showMcpStatus();
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
    updateCollection,
    showMcpStatusCommand
  );
}

// This method is called when your extension is deactivated
export function deactivate() {
  stopMcpBridge();
}

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
  const restoredCollections = await loadCollectionsFromContext();
  await globalState.context.workspaceState.update(CommonKeys.IDENTIFIER, restoredCollections);

  // empty selected collections
  globalState.selectedCollections = [];

  // store workspace path length of current directory
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (workspaceFolders && workspaceFolders.length > 0) {
    globalState.workspace_uri_path_length =
      workspaceFolders[0].uri.path.length;
    globalState.workspace_uri_path = workspaceFolders[0].uri.path;
  }

  /**
   * Observing only if the user clicked "Select / Unselect All". 
   */
  // Listen for changes when a selection checkbox changes state.
  listenCheckboxChanges();

  // Start the MCP bridge so AI tools can manage breakpoints via the MCP server.
  await startMcpBridge();
}
