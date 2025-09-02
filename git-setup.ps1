# DevSync Git Setup Script
Write-Host "Setting up Git repository for DevSync..." -ForegroundColor Green

# Set Git path
$gitPath = "C:\Program Files\Git\bin\git.exe"

# Configure Git
Write-Host "Configuring Git..." -ForegroundColor Yellow
& $gitPath config --global user.name "DevSync Developer"
& $gitPath config --global user.email "devsync@example.com"

# Check if we're in a git repository
Write-Host "Checking Git status..." -ForegroundColor Yellow
& $gitPath status

# Add all files
Write-Host "Adding files to Git..." -ForegroundColor Yellow
& $gitPath add .

# Check status again
Write-Host "Checking status after add..." -ForegroundColor Yellow
& $gitPath status

# Make initial commit
Write-Host "Making initial commit..." -ForegroundColor Yellow
& $gitPath commit -m "Initial commit: DevSync AI Requirement Translator + Universal API Connector"

# Show commit log
Write-Host "Showing commit log..." -ForegroundColor Yellow
& $gitPath log --oneline

Write-Host "Git setup complete!" -ForegroundColor Green
