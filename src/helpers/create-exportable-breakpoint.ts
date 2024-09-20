import { ExportableBreakpoint } from "../models/exportable-breakpoint";

/**
 * The function `toExportableBreakpoint` creates an `ExportableBreakpoint` object based on the
 * provided parameters.
 * @param {any} point - The `point` parameter in the `toExportableBreakpoint` function is an object
 * that contains information about a breakpoint. It likely includes properties such as `location`
 * (containing information about where the breakpoint is set), `enabled` (indicating whether the
 * breakpoint is currently active), `condition`
 * @param {number} workspace_uri_path_length - The `workspace_uri_path_length` parameter is the length
 * of the workspace URI path. It is used to extract a substring from the URI path of a location.
 * @returns An instance of the `ExportableBreakpoint` class is being returned, with properties set
 * based on the `point` object and `workspace_uri_path_length` parameter.
 */
export function toExportableBreakpoint(
  point: any,
  workspace_uri_path_length: number
) {
  return new ExportableBreakpoint(
    `${point.location.uri.path.substring(workspace_uri_path_length)}`,
    point.location.range,
    point.enabled,
    point.condition,
    point.hitCondition,
    point.logMessage
  );
}
