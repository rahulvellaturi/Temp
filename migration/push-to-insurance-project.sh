#!/usr/bin/env bash
# Run locally with your GitHub credentials (not the Cursor bot token).
# Pushes the migrated branches to Insurance-project and opens PRs.

set -euo pipefail

REPO="https://github.com/rahulvellaturi/Insurance-project.git"
BUNDLE="$(dirname "$0")/insurance-project-branches.bundle"

if [[ ! -f "$BUNDLE" ]]; then
  echo "Missing bundle: $BUNDLE"
  exit 1
fi

WORKDIR=$(mktemp -d)
trap 'rm -rf "$WORKDIR"' EXIT

git clone "$REPO" "$WORKDIR/repo"
cd "$WORKDIR/repo"

git fetch "$BUNDLE" cursor/run-project-dev-f525:cursor/run-project-dev-f525
git fetch "$BUNDLE" cursor/admin-portal-ui-enhancements-f525:cursor/admin-portal-ui-enhancements-f525

git push origin cursor/run-project-dev-f525
git push origin cursor/admin-portal-ui-enhancements-f525

# Create PRs (requires gh CLI logged in as you)
gh pr create --repo rahulvellaturi/Insurance-project \
  --base main \
  --head cursor/run-project-dev-f525 \
  --title "Make AssureMe runnable in dev (backend + frontend) and fix blank admin portal" \
  --body "Migrated from Temp/assureme_insurance PR #2. Changes are under \`insurance_project/\`."

gh pr create --repo rahulvellaturi/Insurance-project \
  --base cursor/run-project-dev-f525 \
  --head cursor/admin-portal-ui-enhancements-f525 \
  --title "AssureMe: admin UI, client portal fixes, Claims Center and form focus" \
  --body "Migrated from Temp/assureme_insurance PR #3. Changes are under \`insurance_project/\`. Stack on PR #1 above."

echo "Done. Close old PRs on Temp if desired:"
echo "  https://github.com/rahulvellaturi/Temp/pull/2"
echo "  https://github.com/rahulvellaturi/Temp/pull/3"
