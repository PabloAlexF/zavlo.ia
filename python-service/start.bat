@echo off
echo ========================================
echo Zavlo.ia - Python Classification Service
echo ========================================
echo.

REM Verificar se venv existe
if not exist "venv\" (
    echo [1/3] Criando ambiente virtual...
    python -m venv venv
    echo.
)

REM Ativar venv
echo [2/3] Ativando ambiente virtual...
call venv\Scripts\activate
echo.

REM Instalar dependências
echo [3/3] Instalando dependências...
pip install -r requirements.txt
echo.

REM Iniciar servidor
echo ========================================
echo Iniciando servidor FastAPI...
echo URL: http://localhost:8001
echo Docs: http://localhost:8001/docs
echo ========================================
echo.

python main.py
