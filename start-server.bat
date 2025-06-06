@echo off
echo Checking for processes using port 5000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do (
    echo Killing process with PID: %%a
    taskkill /F /PID %%a
)
echo Starting MongoDB service...
net start MongoDB || echo MongoDB service already running

echo Starting application server...
nodemon server.js