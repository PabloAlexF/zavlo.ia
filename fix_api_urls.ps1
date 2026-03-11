# Script to fix localhost:3001 references in frontend files
$frontendPath = "c:\Users\Administrator\Desktop\zavlo.ia\frontend"

# Get all tsx and ts files
$files = Get-ChildItem -Path $frontendPath -Recurse -Include *.tsx,*.ts -Exclude node_modules

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
    if ($content -match 'localhost:3001') {
        # Replace localhost:3001/api/v1/ with process.env.NEXT_PUBLIC_API_URL/
        $newContent = $content -replace "http://localhost:3001/api/v1/", "process.env.NEXT_PUBLIC_API_URL/"
        
        # Also replace standalone localhost:3001
        $newContent = $newContent -replace "http://localhost:3001", "process.env.NEXT_PUBLIC_API_URL"
        
        Set-Content -Path $file.FullName -Value $newContent -NoNewline
        Write-Host "Fixed: $($file.FullName)"
    }
}

Write-Host "Done!"

