import * as vscode from "vscode";

export class CollectionTreeProvider
  implements vscode.TreeDataProvider<CollectionTreeItem>
{
  private collections: CollectionTreeItem[] = [];

  private _onDidChangeTreeData: vscode.EventEmitter<
    CollectionTreeItem | undefined | void
  > = new vscode.EventEmitter<CollectionTreeItem | undefined | void>();
  
  readonly onDidChangeTreeData: vscode.Event<
    CollectionTreeItem | undefined | void
  > = this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: CollectionTreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(): CollectionTreeItem[] {
    return this.collections;
  }

  findTreeItem(name: string) {
    return this.collections.find(
      (collection) => collection.label.label === name
    );
  }

  addCollection(name: string): void {
    const label: TreeItemLabel = { label: name };
    this.collections.push(new CollectionTreeItem(label));
    this.refresh();
  }

  addCollections(collectionNames: string[] | undefined): void {
    collectionNames?.forEach((name) => {
      this.addCollection(name);
    });
    this.refresh();
  }

  // Remove collection method
  removeCollection(collectionName: TreeItemLabel) {
    // Filter out the collection to be removed
    this.collections = this.collections.filter(
      (col) => col.label !== collectionName
    );

    // Refresh the tree view
    this._onDidChangeTreeData.fire();
  }

  removeCollections(collectionNames: TreeItemLabel[]) {
    collectionNames.forEach((collectionName) =>
      this.removeCollection(collectionName)
    );
  }

  removeAllCollections(): void {
    this.collections = [];

    // Refresh the tree view
    this._onDidChangeTreeData.fire();
  }
}

export class CollectionTreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: vscode.TreeItemLabel,
    public checkboxState: vscode.TreeItemCheckboxState = vscode
      .TreeItemCheckboxState.Unchecked
  ) {
    super(label, vscode.TreeItemCollapsibleState.None);
    this.checkboxState = vscode.TreeItemCheckboxState.Unchecked;
  }
}

export type TreeItemLabel = vscode.TreeItemLabel;
