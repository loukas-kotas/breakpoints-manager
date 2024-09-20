import { Range } from "vscode";

export class ExportableBreakpoint {
  location: string;
  line: Range;
  enabled?: boolean;
  condition?: string;
  hitCondition?: string;
  logMessage?: string;

  constructor(
    location: string,
    line: Range,
    enabled?: boolean,
    condition?: string,
    hitCondition?: string,
    logMessage?: string
  ) {
    this.location = location;
    this.line = line;
    this.enabled = enabled;
    this.condition = condition;
    this.hitCondition = hitCondition;
    this.logMessage = logMessage;
  }
}
