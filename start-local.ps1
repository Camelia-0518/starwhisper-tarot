# 星言塔罗 — 本地启动脚本
# 在 PowerShell 中运行

# 1. 进入项目目录
Set-Location -Path "C:\Users\13400\Kimi_Agent_塔罗牌AI系统\app"

# 2. 检查 nvm 和 Node
Write-Host "=== 检查环境 ===" -ForegroundColor Cyan
$nvmCheck = Get-Command nvm -ErrorAction SilentlyContinue
if ($nvmCheck) {
    Write-Host "nvm 已找到" -ForegroundColor Green
    nvm list
} else {
    Write-Host "nvm 未找到，尝试直接运行 npm..." -ForegroundColor Yellow
}

# 3. 安装依赖
Write-Host "`n=== 安装依赖 ===" -ForegroundColor Cyan
npm install

# 4. 启动开发服务器
Write-Host "`n=== 启动开发服务器 ===" -ForegroundColor Cyan
npm run dev
