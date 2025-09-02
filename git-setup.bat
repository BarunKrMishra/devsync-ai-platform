@echo off
echo Setting up Git repository for DevSync...

REM Configure Git
"C:\Program Files\Git\bin\git.exe" config --global user.name "DevSync Developer"
"C:\Program Files\Git\bin\git.exe" config --global user.email "devsync@example.com"

REM Add all files
echo Adding files to Git...
"C:\Program Files\Git\bin\git.exe" add .

REM Check status
echo Checking Git status...
"C:\Program Files\Git\bin\git.exe" status

REM Make initial commit
echo Making initial commit...
"C:\Program Files\Git\bin\git.exe" commit -m "Initial commit: DevSync AI Requirement Translator + Universal API Connector"

REM Show commit log
echo Showing commit log...
"C:\Program Files\Git\bin\git.exe" log --oneline

echo Git setup complete!
pause
