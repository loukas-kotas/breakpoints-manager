import * as vscode from "vscode";
import {
  BreakpointCollection,
} from "../models/collection-types.model";

/**
 * The function `convertToSourceBreakpoint` takes a point and workspace path as input and returns a
 * vscode SourceBreakpoint object based on the provided information.
 * @param {any} point - The `point` parameter seems to represent a breakpoint object with properties
 * like `location`, `line`, `enabled`, `condition`, `hitCondition`, and `logMessage`. The `location`
 * property likely contains information about the file path where the breakpoint is set, and the `line`
 * property seems
 * @param {string} workspace_path - The `workspace_path` parameter is a string that represents the path
 * to the workspace where the source file is located. This path is used to construct the URI for the
 * source breakpoint location.
 * @returns The `convertToSourceBreakpoint` function is returning a `vscode.SourceBreakpoint` object or
 * `undefined` if an error occurs during the conversion process.
 */
export function convertToSourceBreakpoint(
  point: any,
  workspace_path: string
): vscode.SourceBreakpoint | undefined {
  try {
    return new vscode.SourceBreakpoint(
      new vscode.Location(
        vscode.Uri.file(`${workspace_path}${point.location}`),
        new vscode.Range(
          new vscode.Position(point.line[0].line, point.line[0].character),
          new vscode.Position(point.line[1].line, point.line[1].character)
        )
      ),
      point.enabled,
      point.condition,
      point.hitCondition,
      point.logMessage
    );
  } catch (e) {
    vscode.window.showErrorMessage("convertToSourceBreakpoint failed");
    console.error(e);
  }
}

/**
 * The function `convertToSourceBreakpoints` takes an array of points and a workspace path, then maps
 * each point to a source breakpoint using the `convertToSourceBreakpoint` function and returns an
 * array of source breakpoints.
 * @param {any[]} points - The `points` parameter is an array containing data points that need to be
 * converted into source breakpoints.
 * @param {string} workspace_path - The `workspace_path` parameter is a string that represents the path
 * to the workspace where the breakpoints are set.
 * @returns An array of `vscode.SourceBreakpoint` objects is being returned.
 */
export function convertToSourceBreakpoints(
  points: any[],
  workspace_path: string
): vscode.SourceBreakpoint[] {
  return (
    points.map((point) => convertToSourceBreakpoint(point, workspace_path)!) ??
    []
  );
}

/**
 * The function `convertToSourceCollections` takes an array of `BreakpointCollection` objects and a
 * workspace path, then returns an array of objects with collection names and corresponding source
 * breakpoints.
 * @param {BreakpointCollection[] | BreakpointCollection[]} collections - The `collections` parameter
 * in the `convertToSourceCollections` function is an array of `BreakpointCollection` objects or an
 * array of `BreakpointCollection` arrays. Each `BreakpointCollection` object has a `name` property and
 * a `breakpoints` property, where `breakpoints
 * @param {string} workspace_path - The `workspace_path` parameter is a string that represents the path
 * to the workspace where the breakpoints are located. This path is used to resolve any relative paths
 * of the breakpoints to their absolute paths within the workspace.
 * @returns The `convertToSourceCollections` function returns an array of objects, where each object
 * has a `name` property (taken from the `name` property of each `BreakpointCollection` in the input
 * `collections` array) and a `breakpoints` property (an array of `vscode.SourceBreakpoint` objects
 * obtained by calling the `convertToSourceBreakpoints` function on the `
 */
export function convertToSourceCollections(
  collections: BreakpointCollection[] | BreakpointCollection[],
  workspace_path: string
): { name: string; breakpoints: vscode.SourceBreakpoint[] }[] {
  return collections.map((collection) => ({
    name: collection.name,
    breakpoints: convertToSourceBreakpoints(
      collection.breakpoints,
      workspace_path
    ),
  }));
}

/**
 * The function `convertToSourceCollection` converts a BreakpointCollection to a source collection by
 * mapping breakpoints to source breakpoints.
 * @param {BreakpointCollection} collection - A BreakpointCollection object containing a collection of
 * breakpoints.
 * @param {string} workspace_path - The `workspace_path` parameter is a string that represents the path
 * to the workspace where the breakpoints are located.
 * @returns An object is being returned with two properties: `name`, which is the name of the
 * breakpoint collection, and `breakpoints`, which is an array of converted source breakpoints.
 */
export function convertToSourceCollection(collection: BreakpointCollection, workspace_path: string) {
  return {
    name: collection.name,
    breakpoints: convertToSourceBreakpoints(
      collection.breakpoints,
      workspace_path
    ),
  };
}
