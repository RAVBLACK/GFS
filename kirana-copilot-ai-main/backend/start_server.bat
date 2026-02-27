@echo off
echo Starting Invoice OCR Backend Server...
set PATH=%PATH%;C:\poppler\poppler-24.08.0\Library\bin
"C:\Users\karth\AppData\Local\Programs\Python\Python312\python.exe" app.py
pause
