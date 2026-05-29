@echo off
setlocal EnableExtensions

REM Run from Temp repo root OR from migration folder (double-click / cmd).
set "SCRIPT_DIR=%~dp0"
set "BUNDLE=%SCRIPT_DIR%insurance-project-branches.bundle"

if not exist "%BUNDLE%" (
  echo Missing bundle: %BUNDLE%
  exit /b 1
)

set "WORKDIR=%TEMP%\insurance-project-push-%RANDOM%"
mkdir "%WORKDIR%" 2>nul
cd /d "%WORKDIR%"

echo Cloning Insurance-project...
git clone https://github.com/rahulvellaturi/Insurance-project.git repo
if errorlevel 1 exit /b 1

cd repo
echo Fetching branches from bundle...
git fetch "%BUNDLE%" cursor/run-project-dev-f525:cursor/run-project-dev-f525
if errorlevel 1 exit /b 1
git fetch "%BUNDLE%" cursor/admin-portal-ui-enhancements-f525:cursor/admin-portal-ui-enhancements-f525
if errorlevel 1 exit /b 1

echo Pushing branches...
git push origin cursor/run-project-dev-f525
if errorlevel 1 exit /b 1
git push origin cursor/admin-portal-ui-enhancements-f525
if errorlevel 1 exit /b 1

where gh >nul 2>&1
if errorlevel 1 (
  echo.
  echo Branches pushed. Install GitHub CLI and run: gh auth login
  echo Then create PRs manually on https://github.com/rahulvellaturi/Insurance-project
  goto :done
)

echo Creating pull requests...
gh pr create --repo rahulvellaturi/Insurance-project --base main --head cursor/run-project-dev-f525 --title "Make AssureMe runnable in dev (backend + frontend) and fix blank admin portal" --body "Migrated from Temp. Changes are under insurance_project/."
gh pr create --repo rahulvellaturi/Insurance-project --base cursor/run-project-dev-f525 --head cursor/admin-portal-ui-enhancements-f525 --title "AssureMe: admin UI, client portal fixes, Claims Center and form focus" --body "Migrated from Temp. Stack on dev-fixes PR. Changes under insurance_project/."

:done
echo.
echo Done.
cd /d "%SCRIPT_DIR%"
endlocal
