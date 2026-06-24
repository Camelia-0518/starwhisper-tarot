cd "C:\Users\13400\Kimi_Agent_塔罗牌AI系统"

# 创建根目录 .gitignore（防止 node_modules 被提交）
if (-not (Test-Path ".gitignore")) {
    @"
node_modules
dist
.DS_Store
.env.local
.env.*.local
"@ | Set-Content -Path ".gitignore" -Encoding UTF8
}

# 从 git 缓存中移除大文件（如果之前被追踪了）
git rm -r --cached app/node_modules 2>$null
git rm -r --cached app/dist 2>$null
git rm -r --cached node_modules 2>$null
git rm -r --cached dist 2>$null

# 添加压缩后的图片和 .gitignore
git add .gitignore
git add app/public/cards

# 提交
git commit -m "Compress images and clean large files" --no-verify

# 设置更大的网络缓冲区，防止超时
git config http.postBuffer 524288000

# 强制推送（覆盖远程的旧大文件）
git push --force origin main

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Push Complete!" -ForegroundColor Green
Write-Host "  Check: https://github.com/Camelia-0518/starwhisper-tarot" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

pause
