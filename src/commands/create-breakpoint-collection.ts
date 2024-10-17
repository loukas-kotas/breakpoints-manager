import * as vscode from "vscode";
import { BreakpointCollection } from "../models/collection-types.model";

export function createBreakpointCollection(requestedCollectionName: string, currentBreakpoints: readonly vscode.Breakpoint[]): BreakpointCollection {
    return {
      name: requestedCollectionName,
      breakpoints: currentBreakpoints.filter(
        (bp) => bp instanceof vscode.Breakpoint
      ) as vscode.Breakpoint[],
    };
  }
  