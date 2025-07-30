Write-Host "Setting up Java 17 for Android development..." -ForegroundColor Green

# Set JAVA_HOME for this session
$env:JAVA_HOME = "C:\Program Files\Java\jdk-17"

# Add Java to PATH for this session
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"

Write-Host ""
Write-Host "Current Java version:" -ForegroundColor Yellow
java -version

Write-Host ""
Write-Host "JAVA_HOME set to: $env:JAVA_HOME" -ForegroundColor Yellow
Write-Host ""
Write-Host "To make this permanent, run as Administrator:" -ForegroundColor Cyan
Write-Host "[Environment]::SetEnvironmentVariable('JAVA_HOME', 'C:\Program Files\Java\jdk-17', 'Machine')" -ForegroundColor White
Write-Host ""
Write-Host "Then restart your IDE (Android Studio) for changes to take effect." -ForegroundColor Yellow
Write-Host ""
Write-Host "To build your project now, run:" -ForegroundColor Green
Write-Host ".\gradlew.bat clean build" -ForegroundColor Cyan 