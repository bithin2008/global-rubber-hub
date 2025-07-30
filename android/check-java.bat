@echo off
echo Checking Java version...
java -version

echo.
echo Setting JAVA_HOME to Java 11 if available...
echo.

REM Check if Java 11 is installed in common locations
if exist "C:\Program Files\Java\jdk-11" (
    set JAVA_HOME=C:\Program Files\Java\jdk-11
    echo Found Java 11 at: %JAVA_HOME%
) else if exist "C:\Program Files\Eclipse Adoptium\jdk-11" (
    set JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-11
    echo Found Java 11 at: %JAVA_HOME%
) else if exist "C:\Program Files\Amazon Corretto\jdk11" (
    set JAVA_HOME=C:\Program Files\Amazon Corretto\jdk11
    echo Found Java 11 at: %JAVA_HOME%
) else (
    echo Java 11 not found in common locations.
    echo Please install Java 11 and set JAVA_HOME manually.
    echo You can download from: https://adoptium.net/temurin/releases/?version=11
)

echo.
echo Current JAVA_HOME: %JAVA_HOME%
echo.
echo To build your project, run:
echo gradlew.bat clean build 