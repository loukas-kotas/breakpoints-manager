import * as vscode from "vscode";
import {
  BreakpointCollection,
  ExportedBreakpointCollection,
} from "../create-collection";

/**
 * The function `convertToSourceBreakpoint` takes a point object and a workspace path as input, and
 * returns a vscode SourceBreakpoint object based on the provided information.
 * @param {any} point - The `point` parameter in the `convertToSourceBreakpoint` function seems to
 * represent a breakpoint object with the following properties:
 * @param {string} workspace_path - The `workspace_path` parameter in the `convertToSourceBreakpoint`
 * function is a string that represents the path to the workspace where the source file is located.
 * This path is used to construct the URI for the source breakpoint location.
 * @returns The `convertToSourceBreakpoint` function is returning a new `vscode.SourceBreakpoint`
 * object based on the provided `point` data and `workspace_path`. The function creates a new
 * `vscode.Location` object using the file path constructed from the `workspace_path` and
 * `point.location`, and a `vscode.Range` object using the line and character information from
 * `point.line`.
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
 * The function `convertToSourceBreakpoints` converts an array of points to an array of
 * `vscode.SourceBreakpoint` objects based on a workspace path.
 * @param {any[]} points - The `points` parameter is an array of points that you want to convert to
 * source breakpoints. Each point in the array represents a specific location in your code where you
 * want to set a breakpoint.
 * @param {string} workspace_path - The `workspace_path` parameter is a string that represents the path
 * to the workspace where the source breakpoints will be set.
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
 * The function `convertToSourceCollection` takes an array of breakpoint collections and a workspace
 * path, then converts them into an array of objects containing collection names and source
 * breakpoints.
 * @param {BreakpointCollection[] | ExportedBreakpointCollection[]} collections - The `collections`
 * parameter in the `convertToSourceCollection` function can be either an array of
 * `BreakpointCollection` objects or an array of `ExportedBreakpointCollection` objects.
 * @param {string} workspace_path - The `workspace_path` parameter is a string that represents the path
 * to the workspace where the breakpoints are located. This path is used to resolve any relative paths
 * of the breakpoints to their absolute paths within the workspace.
 * @returns The function `convertToSourceCollection` returns an array of objects, where each object has
 * a `name` property and a `breakpoints` property. The `name` property is taken from the `name`
 * property of each collection in the input `collections` array. The `breakpoints` property is an array
 * of `vscode.SourceBreakpoint` objects obtained by calling the `convertTo
 */
export function convertToSourceCollection(
  collections: BreakpointCollection[] | ExportedBreakpointCollection[],
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
