@echo off
echo Starting Knowvation Servers...
start "Knowvation Frontend" cmd /k "cd frontend && npm run dev"
start "Knowvation Backend" cmd /k "cd backend && uvicorn main:app --reload --port 8000"
echo Both servers have been launched in new windows!
echo You can close this window now.
pause
