import * as vscode from "vscode";
import { BreakpointCollection } from "../models/collection-types.model";
import { identifier } from "../extension";
import { GlobalState } from "../global-state";

/**
 * The function persistCollectionsToContext asynchronously updates a global state with new breakpoint
 * collections.
 * @param {BreakpointCollection[]} collections - The `collections` parameter in the
 * `persistCollectionsToContext` function is an array of `BreakpointCollection` objects.
 */
export async function persistCollectionsToContext(
  collections: BreakpointCollection[]
) {
  const globalState = GlobalState.getInstance();
  const savedCollections = (await globalState!.context?.globalState.get(
    identifier
  )) as BreakpointCollection[];
  await globalState!.context?.globalState.update(identifier, [
    ...savedCollections,
    ...collections,
  ]);
}

/**
 * The function `loadCollectionsFromContext` retrieves saved breakpoint collections from the global
 * state context in TypeScript.
 * @returns The function `loadCollectionsFromContext` returns an array of `BreakpointCollection`
 * objects. If there are saved collections in the global state context, it attempts to create and
 * refresh each collection before returning the array of saved collections. If an error occurs during
 * this process, it logs the error and shows an information message indicating that the transformation
 * of context collections failed. If there are no saved collections, an
 */
export function loadCollectionsFromContext(): BreakpointCollection[] {
  const globalState: GlobalState = GlobalState.getInstance();
  const savedCollections =
    globalState.context?.globalState.get<BreakpointCollection[]>(identifier) ??
    [];

  if (savedCollections?.length > 0) {
    try {
      savedCollections.map((savedCollection) => {
        globalState.collectionProvider?.createCollection(savedCollection.name);
        globalState.collectionProvider?.refresh();
      });

      return savedCollections || [];
    } catch (error) {
      console.error(error);
      vscode.window.showInformationMessage(
        "Failed to transform context collections"
      );
    }
  }

  return [];
}

/**
 * The function `updateCollectionsInContext` updates the breakpoint collections in the provided
 * `vscode.ExtensionContext`.
 * @param context - The `context` parameter is an instance of `vscode.ExtensionContext`, which provides
 * access to various functionalities and resources within the VS Code extension. It is typically used
 * to store and retrieve global state, manage subscriptions, and interact with the VS Code API.
 * @param {BreakpointCollection[]} collections - The `collections` parameter is an array of
 * `BreakpointCollection` objects.
 */
export async function updateCollectionsInContext(
  context: vscode.ExtensionContext,
  collections: BreakpointCollection[]
) {
  await context.globalState.update(identifier, []);
  await context.globalState.update(identifier, collections);
}
