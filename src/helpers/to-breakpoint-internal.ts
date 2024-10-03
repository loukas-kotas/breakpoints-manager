import {
  BreakpointCollection,
  ExportableCollection,
} from "../models/collection-types.model";
import { ExportableBreakpoint } from "../models/exportable-breakpoint";
import * as vscode from "vscode";
import { toExportableBreakpoint } from "./create-exportable-breakpoint";

/**
 * The function `toExportableCollection` converts a `BreakpointCollection` to an
 * `ExportableCollection` by creating an array of exportable breakpoints with adjusted
 * workspace URI path length.
 * @param {BreakpointCollection} collection - The `collection` parameter is of type
 * `BreakpointCollection`, which likely contains a collection of breakpoints.
 * @param {number} workspace_uri_path_length - The `workspace_uri_path_length` parameter in the
 * `toExportableCollection` function is used to specify the length of the workspace URI path.
 * This parameter is important for creating an exported breakpoint collection with the correct
 * information about the breakpoints in the collection. It helps in formatting the URIs of
 * @returns An object of type ExportableCollection is being returned. This object contains the
 * name of the collection and an array of ExportableBreakpoint objects representing the breakpoints in
 * the collection.
 */
export function toExportableCollection(
  collection: BreakpointCollection,
  workspace_uri_path_length: number
): ExportableCollection {
  const exportable_breakpoints: ExportableBreakpoint[] = [];
  collection?.breakpoints.forEach((breakpoint: vscode.Breakpoint) => {
    exportable_breakpoints.push(
      toExportableBreakpoint(breakpoint, workspace_uri_path_length)
    );
  });
  return { name: collection.name, breakpoints: exportable_breakpoints };
}
