@echo off
echo ========================================
echo Zavlo.ia - Executando Todos os Testes
echo ========================================
echo.

REM Ativar ambiente virtual
if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate
) else (
    echo ERRO: Ambiente virtual nao encontrado!
    echo Execute: python -m venv venv
    pause
    exit /b 1
)

echo [1/3] Testando Classificador (Unitario)...
echo ========================================
python run_all_tests.py
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERRO: Testes unitarios falharam!
    pause
    exit /b 1
)

echo.
echo.
echo [2/3] Iniciando servidor FastAPI...
echo ========================================
start "Zavlo FastAPI" cmd /k "venv\Scripts\activate && python main.py"

REM Aguardar servidor iniciar
echo Aguardando servidor iniciar (10 segundos)...
timeout /t 10 /nobreak > nul

echo.
echo.
echo [3/3] Testando API (Endpoints)...
echo ========================================
python test_api.py
set API_TEST_RESULT=%ERRORLEVEL%

echo.
echo.
echo ========================================
echo Testes Concluidos!
echo ========================================
echo.

if %API_TEST_RESULT% EQU 0 (
    echo Status: TODOS OS TESTES PASSARAM!
    echo.
    echo O servidor FastAPI continua rodando.
    echo Acesse: http://localhost:8001/docs
    echo.
    echo Pressione qualquer tecla para encerrar o servidor...
    pause > nul
    taskkill /FI "WINDOWTITLE eq Zavlo FastAPI*" /F > nul 2>&1
) else (
    echo Status: ALGUNS TESTES FALHARAM!
    echo.
    echo Verifique os logs acima para detalhes.
    echo.
    pause
    taskkill /FI "WINDOWTITLE eq Zavlo FastAPI*" /F > nul 2>&1
    exit /b 1
)
