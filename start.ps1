# 星言塔罗 — 本地启动器
# 用法：右键 PowerShell，执行 .\start.ps1

param(
  [switch]$Build,      # 构建模式
  [switch]$Install,     # 仅安装依赖
  [switch]$Clean,       # 清理 node_modules 后重装
  [switch]$OpenBrowser  # 启动后自动打开浏览器
)

$ErrorActionPreference = "Stop"
$host.ui.RawUI.WindowTitle = "星言塔罗 🌟 启动器"

$AppDir = Join-Path $PSScriptRoot "app"
$NodeMin = [System.Version]"20.19.0"
$NodeCurrent = $null
$NodeOk = $false

function Write-Header($text) {
  Write-Host ""
  Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
  Write-Host "  $text" -ForegroundColor Cyan
  Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
  Write-Host ""
}

function Write-Step($text) {
  Write-Host "➜ $text" -ForegroundColor Yellow
}

function Write-Success($text) {
  Write-Host "✓ $text" -ForegroundColor Green
}

function Write-Error($text) {
  Write-Host "✗ $text" -ForegroundColor Red
}

function Write-Info($text) {
  Write-Host "  $text" -ForegroundColor DarkGray
}

# ─── 1. 检查 Node.js ───
Write-Header "环境检查"

try {
  $nodeVersionOutput = node --version 2>$null
  if ($nodeVersionOutput -match 'v(\d+\.\d+\.\d+)') {
    $NodeCurrent = [System.Version]$matches[1]
    Write-Info "Node 版本: v$NodeCurrent"
  } else {
    Write-Error "无法获取 Node 版本"
    exit 1
  }
} catch {
  Write-Error "Node.js 未安装。请先安装 Node.js 20+："
  Write-Info "https://nodejs.org/"
  exit 1
}

if ($NodeCurrent -ge $NodeMin) {
  $NodeOk = $true
  Write-Success "Node 版本满足要求（≥ $NodeMin）"
} else {
  Write-Error "Node 版本 v$NodeCurrent 低于要求 v$NodeMin"
  Write-Info "建议：用 nvm 切换到更高版本"
  Write-Info "  nvm install 20"
  Write-Info "  nvm use 20"
  Write-Info ""
  Write-Info "或者继续尝试（可能 Vite 5 可以兼容）..."
  Write-Host ""
}

# ─── 2. 检查 npm ───
try {
  npm --version > $null 2>&1
  Write-Success "npm 可用"
} catch {
  Write-Error "npm 不可用"
  exit 1
}

# ─── 3. 进入项目目录 ───
Set-Location -Path $AppDir
Write-Info "工作目录: $AppDir"

# ─── 4. 清理模式 ───
if ($Clean) {
  Write-Header "清理依赖"
  if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force "node_modules"
    Write-Success "已删除 node_modules"
  }
  if (Test-Path "package-lock.json") {
    Remove-Item -Force "package-lock.json"
    Write-Success "已删除 package-lock.json"
  }
}

# ─── 5. 安装依赖 ───
if ($Clean -or $Install -or -not (Test-Path "node_modules")) {
  Write-Header "安装依赖"
  Write-Step "npm install（可能需要 1-2 分钟）..."
  npm install
  if ($LASTEXITCODE -ne 0) {
    Write-Error "npm install 失败"
    Write-Info "尝试降级 Vite 到兼容版本..."
    npm install vite@5.4.0 @vitejs/plugin-react@4.3.0 --save-dev
    npm install
    if ($LASTEXITCODE -ne 0) {
      Write-Error "安装失败，请检查网络或 npm 配置"
      exit 1
    }
  }
  Write-Success "依赖安装完成"
}

# ─── 6. 构建模式 ───
if ($Build) {
  Write-Header "生产构建"
  Write-Step "npm run build ..."
  npm run build
  if ($LASTEXITCODE -eq 0) {
    Write-Success "构建完成！输出目录: app/dist"
  } else {
    Write-Error "构建失败"
  }
  exit $LASTEXITCODE
}

# ─── 7. 启动开发服务器 ───
Write-Header "启动开发服务器"

if (-not $NodeOk) {
  Write-Info "Node 版本较低，尝试启动..."
  Write-Info "如果报错，请按 Ctrl+C 后执行："
  Write-Info "  nvm use 20 && .\start.ps1"
  Write-Info ""
}

# 在后台启动 dev server
$process = Start-Process -FilePath "npm" -ArgumentList "run","dev" `
  -WorkingDirectory $AppDir -PassThru -NoNewWindow

Write-Step "正在启动..."

# 等待 Vite 启动（检测端口）
$maxWait = 30
$started = $false
for ($i = 0; $i -lt $maxWait; $i++) {
  Start-Sleep -Seconds 1
  try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 200) {
      $started = $true
      break
    }
  } catch {}
  Write-Host "." -NoNewline -ForegroundColor DarkGray
}
Write-Host ""

if ($started) {
  Write-Success "服务器已启动！"
  Write-Info "地址: http://localhost:3000"
  Write-Info ""
  Write-Info "快捷键："
  Write-Info "  Ctrl+C  → 停止服务器"
  Write-Info "  Ctrl+Shift+R  → 浏览器强制刷新"
  Write-Info ""
  
  if ($OpenBrowser) {
    Start-Process "http://localhost:3000"
  } else {
    Write-Step "按 Enter 打开浏览器，或 Ctrl+C 退出..."
    $null = [Console]::ReadKey()
    Start-Process "http://localhost:3000"
  }
} else {
  Write-Error "服务器启动超时"
  Write-Info "请检查控制台输出，可能需要降级 Vite："
  Write-Info "  npm install vite@5.4.0 @vitejs/plugin-react@4.3.0 --save-dev"
  Write-Info "  .\start.ps1"
}

# 等待进程退出
Write-Step "服务器运行中，按 Ctrl+C 退出..."
$process.WaitForExit()
