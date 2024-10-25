import * as vscode from "vscode";
import { ExportableBreakpoint } from "./exportable-breakpoint";

export interface BreakpointCollection {
  name: string;
  guid: string;
  breakpoints: vscode.Breakpoint[]; // Store breakpoints
}

export interface ExportableCollection {
  name: string;
  guid: string;
  breakpoints: ExportableBreakpoint[];
}

export type Breakpoint = vscode.Breakpoint;
export type SourceBreakpoint = vscode.SourceBreakpoint;
export type FunctionBreakpoint = vscode.FunctionBreakpoint;
