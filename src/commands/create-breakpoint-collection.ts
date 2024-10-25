import * as vscode from "vscode";
import { BreakpointCollection } from "../models/collection-types.model";
import { generateGUID } from "../helpers/generate-guid";

export function createBreakpointCollection(requestedCollectionName: string, currentBreakpoints: readonly vscode.Breakpoint[]): BreakpointCollection {
    return {
      name: requestedCollectionName,
      guid: generateGUID(),
      breakpoints: currentBreakpoints.filter(
        (bp) => bp instanceof vscode.Breakpoint
      ) as vscode.Breakpoint[],
    };
  }
  