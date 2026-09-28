@echo off
cd /d "%~dp0backend"
echo ================================================
echo GymAI Manager Backend
echo Chatbase API: /api/chatbase/*
echo ================================================
python -m pip install -r requirements.txt
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
pause
