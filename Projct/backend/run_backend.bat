@echo off
REM Start the Part-Time Job Platform backend (FastAPI + Firebase).
REM Double-click this file, or run it from any terminal.
cd /d "%~dp0"
call venv\Scripts\activate.bat
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
