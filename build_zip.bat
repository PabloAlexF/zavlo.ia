@echo off
cd /d c:\Users\Administrator\Desktop\zavlo.ia\frontend
powershell -Command "Compress-Archive -Path '*' -DestinationPath 'c:\Users\Administrator\Desktop\zavlo.ia\frontend-built.zip' -Force"
echo Done!

