import {
  BreakpointCollection,
  ExportableCollection,
} from "../models/collection-types.model";
import { GlobalState } from "../global-state";
import { convertToSourceBreakpoint } from "./convert-to-source-breakpoint";
import * as vscode from "vscode";
import { updateCollectionsInContext } from "./persist-collection";

/**
 * The function `promoteCollectionFromImport` takes an exported breakpoint collection, converts it to
 * source breakpoints, adds it to the global state, and returns the restored collection.
 * @param {ExportableCollection} collection - The `collection` parameter in the
 * `promoteCollectionFromImport` function is of type `ExportableCollection`. It represents a
 * collection of breakpoints that have been exported from a previous state and need to be saved in the
 * current state.
 * @returns The function `promoteCollectionFromImport` is returning a `BreakpointCollection` object that
 * contains the name of the collection and an array of `vscode.SourceBreakpoint` objects representing
 * the restored breakpoints from the imported `ExportableCollection`.
 */
const promoteCollectionFromImport = (
  collection: ExportableCollection
): void => {
  const globalState: GlobalState = GlobalState.getInstance();
  const workspace_path = globalState.workspace_uri_path;
  const restoredBreakpoints: vscode.SourceBreakpoint[] = [];
  globalState.collectionProvider?.createCollection(collection.name);
  globalState.collectionProvider?.refresh();

  collection.breakpoints.forEach((breakpoint) =>
    restoredBreakpoints.push(
      convertToSourceBreakpoint(breakpoint, workspace_path!)!
    )
  );
  // const restoredCollection = {
  //   name: collection.name,
  //   breakpoints: restoredBreakpoints,
  // };
  // globalState.collections.push(collection);

  // return restoredCollection;
};

/**
 * The function `promoteCollectionsFromImport` takes an array of `ExportableCollection` objects,
 * maps over them, and saves each collection using `promoteCollectionFromImport` with the collection's
 * name.
 * @param {ExportableCollection[]} collections - An array of ExportableCollection
 * objects.
 */
export const promoteCollectionsFromImport = (
  collections: ExportableCollection[]
): void => collections.forEach((collection) => promoteCollectionFromImport(collection));
