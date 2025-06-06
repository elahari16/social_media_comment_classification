@echo off
echo Killing process using port 5001...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5001') do (
    echo Found process: %%a
    taskkill /F /PID %%a
    echo Process killed
)
echo Port 5001 is now free