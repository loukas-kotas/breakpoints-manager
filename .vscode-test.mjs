import { defineConfig } from '@vscode/test-cli';

export default defineConfig({
	files: 'out/test/**/*.test.js',
	// Open the repo as a workspace folder so the bridge (and the extension's
	// collection helpers, which are workspace-scoped) have a workspace path.
	launchArgs: [process.cwd()],
});
