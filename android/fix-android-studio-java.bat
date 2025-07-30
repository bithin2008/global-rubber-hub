@echo off
echo ========================================
echo Android Studio Java Configuration Fix
echo ========================================
echo.

echo Setting JAVA_HOME for this session...
set JAVA_HOME=C:\Program Files\Java\jdk-17
set PATH=%JAVA_HOME%\bin;%PATH%

echo.
echo Current Java version:
java -version

echo.
echo ========================================
echo MANUAL STEPS REQUIRED IN ANDROID STUDIO
echo ========================================
echo.
echo 1. Close Android Studio completely
echo.
echo 2. Open Android Studio
echo.
echo 3. Go to: File ^> Settings ^> Build, Execution, Deployment ^> Build Tools ^> Gradle
echo.
echo 4. Set "Gradle JDK" to: C:\Program Files\Java\jdk-17
echo    (If not in dropdown, click "Download JDK" and select version 17)
echo.
echo 5. Click "Apply" and "OK"
echo.
echo 6. Go to: File ^> Settings ^> Build, Execution, Deployment ^> Compiler
echo.
echo 7. Set "Project bytecode version" to: 17
echo.
echo 8. Click "Apply" and "OK"
echo.
echo 9. Restart Android Studio
echo.
echo ========================================
echo ALTERNATIVE: Set System Environment Variable
echo ========================================
echo.
echo Run this command as Administrator in PowerShell:
echo [Environment]::SetEnvironmentVariable('JAVA_HOME', 'C:\Program Files\Java\jdk-17', 'Machine')
echo.
echo Then restart your computer.
echo.
echo ========================================
echo Test the fix:
echo ========================================
echo After making changes, try building:
echo gradlew.bat clean build 