import * as vscode from "vscode";
import { Labels } from "./models/labels.model";

export class CollectionTreeProvider implements vscode.TreeDataProvider<CollectionTreeItem> {
  private collections: CollectionTreeItem[] = [];
  private _selectAllItem: CollectionTreeItem;

  private _onDidChangeTreeData: vscode.EventEmitter<
    CollectionTreeItem | undefined | void
  > = new vscode.EventEmitter<CollectionTreeItem | undefined | void>();
  
  readonly onDidChangeTreeData: vscode.Event<
    CollectionTreeItem | undefined | void
  > = this._onDidChangeTreeData.event;

  constructor() {
    // tree item to be displayed on the panel
    this._selectAllItem = new CollectionTreeItem(
      {label: Labels.SelectAll},
      vscode.TreeItemCheckboxState.Unchecked,
      false,
      Labels.SelectAll
    );
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: CollectionTreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(): CollectionTreeItem[] {
    // The first item will be the "Select All" checkbox
    return [this._selectAllItem, ...this.collections];
  }

  findCollectionByGUID(guid: string) {
    return this.collections.find(collection => collection.guid === guid);
  }

  addCollectionToTree(name: string, guid: string): void {
    const label: TreeItemLabel = { label: name, highlights: [[0, 100],[100,200]]};
    this.collections.push(new CollectionTreeItem(label, vscode.TreeItemCheckboxState.Unchecked, true, guid));
    this.refresh();
  }


  // Remove collection method
  removeCollection(guid: string) {
    // Filter out the collection to be removed
    this.collections = this.collections.filter((col) => col.guid !== guid);

    // Unselect 'Select All / Unselect All' checkbox if no checkboxes exist
    if (this.collections.length === 0) {
      this._selectAllItem.checkboxState = vscode.TreeItemCheckboxState.Unchecked;
    }
    this.refresh();

    // Refresh the tree view
    this._onDidChangeTreeData.fire();
  }

    // Handler for when the "Select All" checkbox is clicked
  toggleSelectAll(): void {
    if (this._selectAllItem.checkboxState === vscode.TreeItemCheckboxState.Checked) {
      this.deselectAllCollections();
      this._selectAllItem.checkboxState = vscode.TreeItemCheckboxState.Unchecked;
    } else {
      this.selectAllCollections();
      this._selectAllItem.checkboxState = vscode.TreeItemCheckboxState.Checked;
    }
    this.refresh();
  }
  

  selectAllCollections(): void {
    this.collections.forEach(collection => {
        collection.checkboxState = vscode.TreeItemCheckboxState.Checked; // mark all the collections as checked
    });
    this.refresh();
  }

  deselectAllCollections(): void {
    this.collections.forEach(collection => {
        collection.checkboxState = vscode.TreeItemCheckboxState.Unchecked; // mark all the collections as unchecked
    });
    this.refresh();
  }

/**
 * The function `getSelectAllState` returns the checkbox state of the `_selectAllItem` TreeItem in a
 * TypeScript class.
 * @returns The function `getSelectAllState()` is returning the checkbox state of the `_selectAllItem`
 * tree item.
 */
  getSelectAllState(): vscode.TreeItemCheckboxState {
    return this._selectAllItem.checkboxState;
  }
}

export class CollectionTreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: vscode.TreeItemLabel,
    public checkboxState: vscode.TreeItemCheckboxState = vscode.TreeItemCheckboxState.Unchecked,
    public showIcons: boolean = true,
    public guid: string,
  ) {
    super(label, vscode.TreeItemCollapsibleState.None);
    this.checkboxState = vscode.TreeItemCheckboxState.Unchecked;
    this.guid = guid;  // Store the GUID for reference

    // Assign a unique context value based on whether the item should have icons
    this.contextValue = showIcons ? Labels.CollectionWithIcons : Labels.CollectionWithoutIcons;
  }
}

export type TreeItemLabel = vscode.TreeItemLabel;
