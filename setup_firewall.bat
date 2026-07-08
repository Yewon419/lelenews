@echo off
echo ================================
echo  LeLeNews - 방화벽 규칙 추가
echo ================================
echo.
netsh advfirewall firewall add rule name="LeLeNews Dev (4040)" dir=in action=allow protocol=TCP localport=4040
if %errorlevel% neq 0 (
    echo [실패] 관리자 권한으로 다시 실행하세요.
) else (
    echo [성공] 포트 4040 방화벽 허용 완료
    echo.
    echo 같은 와이파이에서 모바일로 접속:
    echo   http://10.240.6.181:4040
)
echo.
pause
