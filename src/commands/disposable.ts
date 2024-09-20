import * as vscode from 'vscode';

export const DisplosableCommand = () => {
  // The code you place here will be executed every time your command is executed
  // Display a message box to the user
  vscode.window.showInformationMessage("Hello World from BreakpointsManager!");
  console.log(vscode.debug);
};
