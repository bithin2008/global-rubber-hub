Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Android Studio Java Configuration Fix" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Setting JAVA_HOME for this session..." -ForegroundColor Green
$env:JAVA_HOME = "C:\Program Files\Java\jdk-17"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"

Write-Host ""
Write-Host "Current Java version:" -ForegroundColor Yellow
java -version

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "MANUAL STEPS REQUIRED IN ANDROID STUDIO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Close Android Studio completely" -ForegroundColor White
Write-Host ""
Write-Host "2. Open Android Studio" -ForegroundColor White
Write-Host ""
Write-Host "3. Go to: File → Settings → Build, Execution, Deployment → Build Tools → Gradle" -ForegroundColor White
Write-Host ""
Write-Host "4. Set 'Gradle JDK' to: C:\Program Files\Java\jdk-17" -ForegroundColor Yellow
Write-Host "   (If not in dropdown, click 'Download JDK' and select version 17)" -ForegroundColor Gray
Write-Host ""
Write-Host "5. Click 'Apply' and 'OK'" -ForegroundColor White
Write-Host ""
Write-Host "6. Go to: File → Settings → Build, Execution, Deployment → Compiler" -ForegroundColor White
Write-Host ""
Write-Host "7. Set 'Project bytecode version' to: 17" -ForegroundColor Yellow
Write-Host ""
Write-Host "8. Click 'Apply' and 'OK'" -ForegroundColor White
Write-Host ""
Write-Host "9. Restart Android Studio" -ForegroundColor White
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ALTERNATIVE: Set System Environment Variable" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Run this command as Administrator in PowerShell:" -ForegroundColor Yellow
Write-Host "[Environment]::SetEnvironmentVariable('JAVA_HOME', 'C:\Program Files\Java\jdk-17', 'Machine')" -ForegroundColor White
Write-Host ""
Write-Host "Then restart your computer." -ForegroundColor White
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test the fix:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "After making changes, try building:" -ForegroundColor Green
Write-Host ".\gradlew.bat clean build" -ForegroundColor Yellow 