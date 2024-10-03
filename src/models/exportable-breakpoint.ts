import { Range } from "vscode";
import * as vscode from 'vscode';

export class ExportableBreakpoint extends vscode.Breakpoint {
  location: string;
  line: Range;
  enabled: boolean;
  condition?: string;
  hitCondition?: string;
  logMessage?: string;

  constructor(
    location: string,
    line: Range,
    enabled: boolean,
    condition?: string,
    hitCondition?: string,
    logMessage?: string
  ) {
    super();
    this.location = location;
    this.line = line;
    this.enabled = enabled ?? false;
    this.condition = condition;
    this.hitCondition = hitCondition;
    this.logMessage = logMessage;
  }
}
