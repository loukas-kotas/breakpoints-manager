import * as vscode from "vscode";
import { BreakpointCollection } from "../models/collection-types.model";
import { identifier } from "../extension";
import { GlobalState } from "../global-state";

/**
 * The function persistCollectionsToContext asynchronously updates breakpoint collections in the global
 * state context.
 * @param {BreakpointCollection[]} collections - An array of BreakpointCollection
 * objects that need to be persisted to the context.
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
  vscode.window.showInformationMessage(
    "Context: Updated with Breakpoints Collections"
  );
}


/**
 * The function `loadCollectionsFromContext` retrieves and converts saved breakpoint collections from
 * the global state context in TypeScript.
 * @returns The function `loadCollectionsFromContext` returns an array of `BreakpointCollection`
 * objects. If there are saved collections in the global state context, it tries to convert them to
 * source collections, add them to the collection provider, and then return the restored collections.
 * If there are no saved collections or an error occurs during the transformation process, an empty
 * array is returned.
 */
export function loadCollectionsFromContext(): BreakpointCollection[] {
  const globalState: GlobalState = GlobalState.getInstance();
  const savedCollections =
    globalState.context?.globalState.get<BreakpointCollection[]>(identifier) ??
    [];
  const workspace_uri_path = vscode.workspace.workspaceFolders![0].uri.path;

  if (savedCollections?.length > 0) {
    try {
      // TODO: might not needed
      // const restoredCollections = convertToSourceCollections(
      //   savedCollections,
      //   workspace_uri_path!
      // );

      savedCollections.map((savedCollection) => {
        globalState.collectionProvider?.addCollection(savedCollection.name);
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
 * The function `updateCollectionsInContext` updates breakpoint collections in the VS Code extension
 * context.
 * @param context - The `context` parameter is an instance of `vscode.ExtensionContext`, which provides
 * access to various functionalities and resources of the VS Code extension. It is typically used to
 * store and retrieve global state data, manage subscriptions, and interact with the VS Code API.
 * @param {BreakpointCollection[]} collections - The `collections` parameter in the
 * `updateCollectionsInContext` function is an array of `BreakpointCollection` objects. These objects
 * likely represent different sets of breakpoints or breakpoints organized in some way. The function
 * updates the global state in the provided `vscode.ExtensionContext` with the new `collections
 */
export async function updateCollectionsInContext(
  context: vscode.ExtensionContext,
  collections: BreakpointCollection[]
) {
  await context.globalState.update(identifier, []);
  await context.globalState.update(identifier, collections);
  vscode.window.showInformationMessage("Breakpoint collections updated");
}
