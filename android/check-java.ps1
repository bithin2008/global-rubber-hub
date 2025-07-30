Write-Host "Checking Java version..." -ForegroundColor Green
java -version

Write-Host "`nSetting JAVA_HOME to Java 11 if available..." -ForegroundColor Green
Write-Host ""

# Check if Java 11 is installed in common locations
$java11Paths = @(
    "C:\Program Files\Java\jdk-11",
    "C:\Program Files\Eclipse Adoptium\jdk-11",
    "C:\Program Files\Amazon Corretto\jdk11",
    "C:\Program Files\OpenJDK\jdk-11"
)

$foundJava11 = $false
foreach ($path in $java11Paths) {
    if (Test-Path $path) {
        $env:JAVA_HOME = $path
        Write-Host "Found Java 11 at: $path" -ForegroundColor Yellow
        $foundJava11 = $true
        break
    }
}

if (-not $foundJava11) {
    Write-Host "Java 11 not found in common locations." -ForegroundColor Red
    Write-Host "Please install Java 11 and set JAVA_HOME manually." -ForegroundColor Red
    Write-Host "You can download from: https://adoptium.net/temurin/releases/?version=11" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Current JAVA_HOME: $env:JAVA_HOME" -ForegroundColor Yellow
Write-Host ""
Write-Host "To build your project, run:" -ForegroundColor Green
Write-Host ".\gradlew.bat clean build" -ForegroundColor Cyan 