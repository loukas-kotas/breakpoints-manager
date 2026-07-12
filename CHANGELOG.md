# Changelog

All notable changes to this project will be documented in this file.

## [0.1.4] - 2026-07-12

### Added
- MCP integration: the extension now runs a local HTTP bridge so AI tools can manage breakpoints through the Breakpoints Manager.
- New `@breakpoints-manager/mcp-server` package (published to npm) that lets AI coding assistants create, update, list, and remove breakpoint collections via the Model Context Protocol.
- "Show MCP Bridge Status" command to inspect the running bridge URL and token location.

### Changed
- Migrated the repo to a pnpm workspace (`shared`, `mcp-server`, and the extension).
- Minimum VS Code version set to `^1.92.0`.

### Fixed
- No bug fixes in this release.

### Known Issues
- No known issues were introduced in this version.

## [0.1.3] - 2025-04-10

### Added
- No changes were added in this release

### Changed
- No changes were added in this release

### Fixed
- Not activating collection after vscode window reload

### Known Issues
- No known issues were introduced in this version.

## [0.1.2] - 2025-03-07

### Added
- Additional error messages

### Changed
- Central handling for checkbox treeview updates 

### Fixed
- Broken extension for vscode v1.97+

### Known Issues
- No known issues were introduced in this version.

## [0.1.1] - 2025-02-25

### Added
- No changes were added in this release

### Changed
- Downgraded extension's minimum version to 1.92.2 

### Fixed
- No bugs fixed in this initial release.

### Known Issues
- No known issues were introduced in this version.

## [0.1.0] - 2024-10-30

### Added
- Initial release of the Breakpoints Manager extension.
- Features for creating, updating, and managing breakpoint collections.
- Functionality to export and import breakpoint collections as JSON files.
- Basic UI integration with Visual Studio Code's debugging environment.
- Commands for selecting and searching collections.

### Changed
- No changes were made in this initial release.

### Fixed
- No bugs fixed in this initial release.

### Known Issues
- Performance may degrade with a high number of collections imported at once.
- Breakpoints outside the current workspace may not be fully supported.
