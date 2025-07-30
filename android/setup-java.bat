@echo off
echo Setting up Java 17 for Android development...

REM Set JAVA_HOME for this session
set JAVA_HOME=C:\Program Files\Java\jdk-17

REM Add Java to PATH for this session
set PATH=%JAVA_HOME%\bin;%PATH%

echo.
echo Current Java version:
java -version

echo.
echo JAVA_HOME set to: %JAVA_HOME%
echo.
echo To make this permanent, add to your system environment variables:
echo JAVA_HOME = C:\Program Files\Java\jdk-17
echo.
echo Then restart your IDE (Android Studio) for changes to take effect.
echo.
echo To build your project now, run:
echo gradlew.bat clean build 