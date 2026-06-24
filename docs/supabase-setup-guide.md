# 星言塔罗 — Supabase 配置指南

## 1. 创建 Supabase 项目

1. 访问 [supabase.com](https://supabase.com) 注册/登录
2. 点击 "New Project" 创建新项目
3. 选择区域（建议选离你用户最近的，如 `ap-southeast-1` 新加坡）
4. 设置数据库密码（保存好，后续需要）
5. 等待项目初始化完成（约 1-2 分钟）

## 2. 获取前端环境变量

项目创建完成后，进入 Project Settings → API：

```
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-public-key>
```

将这两个值填入：
- `app/.env.local`（本地开发，已加入 .gitignore）
- `app/.env.example`（模板，供其他开发者参考）

## 3. 执行数据库 Schema

进入 Supabase Dashboard → SQL Editor → New Query，粘贴 `supabase/schema.sql` 的全部内容，点击 **Run**。

这会创建：
- `user_profiles` — 用户资料扩展表
- `readings` — 占卜记录表（核心）
- `journal_entries` — 塔罗日记表
- `saved_spreads` — 牌阵收藏表
- `daily_draws` — 每日抽牌记录表
- RLS 安全策略 — 确保用户只能访问自己的数据
- 触发器 — 自动更新 `updated_at`、新用户自动创建 profile

## 4. 配置 Edge Function 环境变量

进入 Project Settings → Edge Functions → Config：

```
DEEPSEEK_API_KEY=your-deepseek-api-key
DEEPSEEK_MODEL=deepseek-chat
DEEPSEEK_API_BASE_URL=https://api.deepseek.com/v1/chat/completions
```

## 5. 部署 Edge Function

### 方式 A：使用 Supabase CLI（推荐）

```bash
# 安装 Supabase CLI（需 Node.js）
npm install -g supabase

# 登录
supabase login

# 链接项目
supabase link --project-ref <your-project-ref>

# 部署 Edge Function
supabase functions deploy tarot-reading
```

### 方式 B：使用 Supabase Dashboard（无需 CLI）

1. 进入 Dashboard → Edge Functions → New Function
2. 函数名：`tarot-reading`
3. 将 `supabase/functions/tarot-reading/index.ts` 的内容粘贴进去
4. 点击 Deploy

## 6. 配置认证方式

进入 Authentication → Providers，启用你需要的登录方式：

**推荐配置（国内用户友好）：**
- Email（默认开启）
- 可选：WeChat OAuth（需申请微信开放平台应用）
- 可选：Phone（短信登录，需配置 SMS 提供商）

**海外用户推荐：**
- Google OAuth
- GitHub OAuth

## 7. 配置 Storage（头像上传）

进入 Storage → New Bucket：
- Bucket name: `avatars`
- Public: ✅ 勾选（头像需要公开访问）
- 文件大小限制: 2MB
- 允许格式: image/*

创建后，在 Policies 中添加：
- `avatars` bucket 允许认证用户上传/删除自己的文件

## 8. 验证部署

### 测试 Edge Function

```bash
curl -X POST https://<project-ref>.supabase.co/functions/v1/tarot-reading \
  -H "Authorization: Bearer <anon-key>" \
  -H "Content-Type: application/json" \
  -d '{
    "spread": {"id":"single","name":"单张牌","cardCount":1,"positions":[{"index":0,"name":"今日指引","description":"核心答案"}]},
    "drawnCards": [{"card":{"name":"愚者","nameEn":"The Fool","element":"spirit","keywordsUpright":["新开始","冒险","纯真"],"keywordsReversed":["鲁莽","不成熟"],"meaningUpright":"代表全新的开始...","meaningReversed":"警告不要轻率行事..."},"position":{"index":0,"name":"今日指引","description":"核心答案"},"isReversed":false}],
    "question": "今天运势如何？"
  }'
```

### 测试数据库

```sql
-- 检查表是否创建成功
SELECT * FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('readings', 'journal_entries', 'user_profiles');
```

## 9. 前端启动

```bash
cd app
npm install
npm run dev
```

浏览器打开 `http://localhost:3000`，测试：
1. 未登录时占卜 → 记录保存在 localStorage
2. 注册/登录后 → 记录自动同步到云端
3. AI 解牌 → 走 Edge Function，不再暴露 API Key

## 10. 生产部署

### 构建

```bash
cd app
npm run build
```

### 部署到 Vercel（推荐）

```bash
# 安装 Vercel CLI
npm install -g vercel

# 部署
vercel --prod
```

环境变量在 Vercel Dashboard → Project Settings → Environment Variables 中配置：
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

> 注意：生产环境不再需要 `VITE_DEEPSEEK_API_KEY`，DeepSeek Key 只在服务端 Edge Function 中配置。

## 常见问题

### Q: Edge Function 调用返回 401？
A: 检查 `Authorization` header 是否携带了正确的 `anon key`。前端通过 `supabase.functions.invoke()` 会自动处理。

### Q: 数据库 RLS 导致查询无结果？
A: 确保用户已登录，且 `user_id` 字段与 `auth.uid()` 匹配。未登录时 RLS 会阻止所有数据访问。

### Q: 本地开发时 CORS 报错？
A: Edge Function 代码中已配置 CORS headers，确保前端调用时使用 `supabase.functions.invoke()` 而非直接 `fetch`。

### Q: 如何查看 Edge Function 日志？
A: Supabase Dashboard → Edge Functions → tarot-reading → Logs

## 安全清单

- [ ] `.env.local` 已加入 `.gitignore`
- [ ] DeepSeek API Key 仅配置在服务端环境变量
- [ ] 数据库 RLS 已启用
- [ ] Storage bucket 已配置访问策略
- [ ] 生产环境使用 HTTPS
- [ ] 定期轮换 API Key
