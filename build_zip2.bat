@echo off
cd /d c:\Users\Administrator\Desktop\zavlo.ia\frontend
powershell -Command "Compress-Archive -Path '*' -DestinationPath 'c:\Users\Administrator\Desktop\zavlo.ia\frontend-final.zip' -Force"
echo Done!

