#!/usr/bin/env bash
# Pre-publish / deploy safety checks for the Breakpoints Manager MCP integration.
# Run from anywhere:  bash scripts/prepublish-check.sh
#
# This script NEVER publishes, logs in, or writes a tarball. It only inspects the
# repo and runs `npm pack --dry-run` (which does not create a file) to preview the
# package contents. Exit code is non-zero if any BLOCKER is found.

set -u

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

FAIL=0
WARN=0

pass() { echo "  PASS: $1"; }
fail() { echo "  FAIL: $1"; FAIL=$((FAIL+1)); }
warn() { echo "  WARN: $1"; WARN=$((WARN+1)); }
section() { echo ""; echo "== $1 =="; }

# ---------------------------------------------------------------
section "mcp-server package.json sanity"
PKG=mcp-server/package.json
[ -f "$PKG" ] && pass "found $PKG" || fail "missing $PKG"

NAME=$(node -p "require('./$PKG').name" 2>/dev/null)
VERSION=$(node -p "require('./$PKG').version" 2>/dev/null)
MAIN=$(node -p "require('./$PKG').main" 2>/dev/null)
FILES=$(node -p "JSON.stringify(require('./$PKG').files)" 2>/dev/null)
echo "  info: name    = $NAME"
echo "  info: version = $VERSION"
echo "  info: main    = $MAIN"
echo "  info: files   = $FILES"

# BLOCKER: pnpm-only 'workspace:*' specifier in runtime dependencies.
# node exits 0 when the blocker IS present (so `if` -> fail).
if node -e "const d=require('./$PKG').dependencies||{}; process.exit(Object.values(d).some(v=>String(v).includes('workspace:'))?0:1)"; then
  fail "dependencies contain a 'workspace:*' specifier (npm publish rejects this)"
else
  pass "no 'workspace:*' specifier in dependencies"
fi

# shared should not be a RUNTIME dependency (only a type import).
if node -e "const d=require('./$PKG').dependencies||{}; process.exit('@breakpoints-manager/shared' in d?0:1)"; then
  warn "@breakpoints-manager/shared is a RUNTIME dependency; it should be type-only (move to devDependencies or remove)"
else
  pass "@breakpoints-manager/shared is not in runtime dependencies"
fi

# ---------------------------------------------------------------
section "mcp-server source: shared used only as type"
if grep -rn 'from "@breakpoints-manager/shared"' mcp-server/src >/dev/null 2>&1; then
  BAD=$(grep -rn 'from "@breakpoints-manager/shared"' mcp-server/src | grep -vc 'import type')
  if [ "$BAD" -eq 0 ]; then
    pass "all shared imports in mcp-server/src are type-only"
  else
    fail "$BAD shared import(s) are NOT type-only (would create a runtime dependency)"
  fi
else
  pass "no shared imports in mcp-server/src"
fi

# ---------------------------------------------------------------
section "mcp-server build output"
if [ -f mcp-server/dist/src/index.js ]; then
  pass "mcp-server/dist/src/index.js exists (built)"
else
  fail "mcp-server/dist/src/index.js missing - run the build first"
fi
if [ -f mcp-server/dist/src/index.js ] && head -1 mcp-server/dist/src/index.js | grep -q '^#!'; then
  pass "bin shebang present in dist/src/index.js"
else
  fail "dist/src/index.js missing or lacks '#!/usr/bin/env node' shebang"
fi

# ---------------------------------------------------------------
section "npm auth (read-only)"
if npm whoami >/dev/null 2>&1; then
  pass "logged in to npm as $(npm whoami 2>/dev/null)"
else
  fail "NOT logged in to npm - create an account at npmjs.com, then run 'npm login'"
fi

# ---------------------------------------------------------------
section "npm pack --dry-run (preview of what would ship)"
cd mcp-server
PACK=$(npm pack --dry-run 2>&1)
rm -f ./*.tgz 2>/dev/null
cd "$REPO_ROOT"
echo "$PACK" | grep -E 'npm notice (name|version|filename|package size|total files)' | sed 's/npm notice/  /'

if echo "$PACK" | grep -q 'dist/test/'; then
  fail "tarball would include dist/test/ (test code) - narrow 'files' to [\"dist/src\"]"
else
  pass "tarball excludes dist/test/"
fi
if echo "$PACK" | grep -q 'dist/src/index.js'; then
  pass "tarball includes the bin target dist/src/index.js"
else
  fail "tarball is missing dist/src/index.js (the bin target)"
fi
if echo "$PACK" | grep -iE 'npm notice.*(\.env|secret|token|\.pem|private|id_rsa)'; then
  fail "tarball may include a secret-like file"
else
  pass "no secret-like files detected in tarball"
fi

# ---------------------------------------------------------------
section "extension (vsix) sanity"
if grep -rn '@breakpoints-manager/shared' out --include='*.js' >/dev/null 2>&1; then
  fail "compiled extension (out/) has a runtime require of @breakpoints-manager/shared"
else
  pass "compiled extension does not require @breakpoints-manager/shared at runtime"
fi
if grep -q 'shared/\*\*' .vscodeignore && grep -q 'mcp-server/\*\*' .vscodeignore; then
  pass ".vscodeignore excludes shared/** and mcp-server/** (vsix stays clean)"
else
  warn ".vscodeignore may not exclude shared/** and/or mcp-server/**"
fi

# ---------------------------------------------------------------
echo ""
if [ "$FAIL" -gt 0 ]; then
  echo "RESULT: $FAIL blocker(s) found. DO NOT publish until resolved."
  exit 1
else
  echo "RESULT: no blockers. Safe to publish (review the WARN item(s) above if any)."
  exit 0
fi
