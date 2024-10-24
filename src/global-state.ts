import {
  CollectionTreeItem,
  CollectionTreeProvider,
} from "./collection-tree-provider.model";
import { CommandType } from "./command-type.model";
import { ExportableCollection } from "./models/collection-types.model";
import * as vscode from "vscode";

// Singleton Global State
export class WorkspaceState {
  private static instance: WorkspaceState;
  
  // public activeCollection: ActiveCollection | null = null;
  public collectionProvider: CollectionTreeProvider | undefined;
  public context: vscode.ExtensionContext | undefined;
  public lastActionApplied: CommandType | undefined = undefined;
  public workspace_uri_path_length: number | undefined;
  public workspace_uri_path: string | undefined;
  public treeView: vscode.TreeView<CollectionTreeItem> | undefined;
  public selectedCollections: ExportableCollection[] = [];

  // Private constructor to prevent instantiation from outside
  private constructor() {}

  // Static method to get the single instance of WorkspaceState
  public static getInstance(): WorkspaceState {
    if (!WorkspaceState.instance) {
      WorkspaceState.instance = new WorkspaceState();
    }
    return WorkspaceState.instance;
  }
}
