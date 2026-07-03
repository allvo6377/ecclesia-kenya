@echo off
setlocal
cd /d "%~dp0"
echo ===================================================
echo    Push Ecclesia Kenya to GitHub
echo ===================================================
echo.
echo Before running, make sure you have:
echo    1) Git for Windows installed  ( https://git-scm.com/download/win )
echo    2) Created an EMPTY GitHub repo (no README, no .gitignore)
echo       and copied its URL, e.g.
echo          https://github.com/YOURNAME/ecclesia-kenya.git
echo.
set /p REPOURL=Paste your GitHub repo URL and press Enter:
if "%REPOURL%"=="" ( echo No URL entered. Exiting. & pause & exit /b )
echo.

REM start a clean git history
if exist ".git" rmdir /s /q ".git"
git init -b main
REM identity (only used to label the commit; change if you like)
git config user.email "alvinpilot@gmail.com"
git config user.name "allvo6377"
git config core.autocrlf true
git add -A
git commit -m "Ecclesia Kenya - Catholic Parish Directory"
git branch -M main
git remote add origin %REPOURL%
echo.
echo Pushing to GitHub... (a browser window may open to sign you in)
REM --force so re-running this always overwrites the repo with these exact files
git push -u origin main --force
echo.
echo ---------------------------------------------------
echo  If that succeeded, finish in your browser:
echo   1) Open your repo on github.com
echo   2) Settings  ^>  Pages
echo   3) Source: "Deploy from a br