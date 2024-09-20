import { TreeItemLabel } from "../collection-tree-provider.model";
import { CommandType } from "../command-type.model";
import { GlobalState } from "../global-state";
import { exportCollection } from "../helpers/export-collection";

export async function ExportAllCollectionsCommand() {
  const globalState = GlobalState.getInstance();

  const collectionName: TreeItemLabel = { label: "exports" };
  exportCollection(collectionName, globalState.collections);
  globalState.lastActionApplied = CommandType.ExportAllCollections;
}
