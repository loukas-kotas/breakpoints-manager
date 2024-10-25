import { Breakpoint } from "vscode";
import { ExportableBreakpoint } from "../models/exportable-breakpoint";

/**
 * The function `toExportableBreakpoint` takes a point object and workspace URI path length as input,
 * and returns a new ExportableBreakpoint object with specific properties extracted from the input
 * point object.
 * @param {any} point - The `point` parameter in the `toExportableBreakpoint` function is an object
 * that contains information about a breakpoint, such as its location, whether it is enabled, any
 * condition set for the breakpoint, hit condition, and log message.
 * @param {number} workspace_uri_path_length - The `workspace_uri_path_length` parameter is the length
 * of the workspace URI path. It is used to extract a substring from the URI path of a location.
 * @returns The function `toExportableBreakpoint` is returning a new instance of `ExportableBreakpoint`
 * class with properties derived from the `point` object and `workspace_uri_path_length` parameter.
 */
export function toExportableBreakpoint(
  point: any,
  workspace_uri_path_length: number
) {
  const exportableBreakpoint = new ExportableBreakpoint(
    `${point.location.uri.path.substring(workspace_uri_path_length)}`,
    point.location.range,
    point.enabled,
    point.condition,
    point.hitCondition,
    point.logMessage
  );
  // Deep clone the breakpoint object by serializing and deserializing it to strip away non-serializable properties, leaving a manageable set of values (e.g line).
  const simplifiedExportableBreakpoint = JSON.parse(JSON.stringify(exportableBreakpoint));
  return simplifiedExportableBreakpoint;
}


export function toExportableBreakpoints(points: Breakpoint[], workspace_uri_path_length: number): ExportableBreakpoint[] {
  const exportableBreakpoints: ExportableBreakpoint[] = [];
  points.forEach(point => exportableBreakpoints.push(toExportableBreakpoint(point, workspace_uri_path_length)));
  return exportableBreakpoints;
}