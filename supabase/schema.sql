-- 星言塔罗 Supabase 数据库 Schema
-- 执行顺序：先 extensions → tables → functions → policies → triggers

-- ============================================
-- 1. Extensions
-- ============================================
extension vector;  -- 如需 AI 语义搜索后续可用

-- ============================================
-- 2. Tables
-- ============================================

-- 用户配置表（扩展 supabase auth.users）
create table public.user_profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 占卜记录表（核心数据）
create table public.readings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  
  -- 牌阵信息
  spread_id text not null,
  spread_name text not null,
  question text,
  
  -- 抽牌结果（JSONB 存储完整牌阵）
  cards jsonb not null,
  
  -- AI 解读
  ai_overall_reading text,
  ai_card_readings jsonb,  -- 数组，每项含 position/keywords/interpretation/advice
  
  -- 元数据
  is_public boolean default false,
  share_slug text unique,  -- 公开分享短链接
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 塔罗日记表（用户主动记录的非占卜内容）
create table public.journal_entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  
  title text,
  content text not null,
  mood text,  -- 心情标签
  tags text[],  -- 自定义标签
  
  -- 关联占卜（可选）
  linked_reading_id uuid references public.readings on delete set null,
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 牌阵收藏表（用户保存喜欢的牌阵配置）
create table public.saved_spreads (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  
  name text not null,
  description text,
  spread_id text not null,  -- 引用内置牌阵ID
  custom_positions jsonb,  -- 自定义位置（如有）
  
  created_at timestamptz default now()
);

-- 每日抽牌记录
create table public.daily_draws (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  
  card_id text not null,
  is_reversed boolean default false,
  reflection text,  -- 用户当日感悟
  
  draw_date date not null,
  
  created_at timestamptz default now(),
  
  unique(user_id, draw_date)  -- 每天只能抽一次
);

-- ============================================
-- 3. Indexes
-- ============================================
create index idx_readings_user_id on public.readings(user_id);
create index idx_readings_created_at on public.readings(created_at desc);
create index idx_readings_share_slug on public.readings(share_slug);
create index idx_readings_is_public on public.readings(is_public) where is_public = true;

create index idx_journal_user_id on public.journal_entries(user_id);
create index idx_journal_created_at on public.journal_entries(created_at desc);

create index idx_daily_draws_user_date on public.daily_draws(user_id, draw_date);

-- ============================================
-- 4. Row Level Security (RLS) Policies
-- ============================================

-- user_profiles: 用户只能看/改自己的资料
alter table public.user_profiles enable row level security;

create policy "Users can view own profile"
  on public.user_profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.user_profiles for update
  using (auth.uid() = id);

-- readings: 用户看自己的，公开的可被任何人看
alter table public.readings enable row level security;

create policy "Users can view own readings"
  on public.readings for select
  using (auth.uid() = user_id);

create policy "Anyone can view public readings"
  on public.readings for select
  using (is_public = true);

create policy "Users can create own readings"
  on public.readings for insert
  with check (auth.uid() = user_id);

create policy "Users can update own readings"
  on public.readings for update
  using (auth.uid() = user_id);

create policy "Users can delete own readings"
  on public.readings for delete
  using (auth.uid() = user_id);

-- journal_entries: 仅自己可见
alter table public.journal_entries enable row level security;

create policy "Users can CRUD own journal"
  on public.journal_entries
  using (auth.uid() = user_id);

-- saved_spreads: 仅自己可见
alter table public.saved_spreads enable row level security;

create policy "Users can CRUD own saved spreads"
  on public.saved_spreads
  using (auth.uid() = user_id);

-- daily_draws: 仅自己可见
alter table public.daily_draws enable row level security;

create policy "Users can CRUD own daily draws"
  on public.daily_draws
  using (auth.uid() = user_id);

-- ============================================
-- 5. Functions
-- ============================================

-- 生成分享短链接 slug
CREATE OR REPLACE FUNCTION public.generate_share_slug()
RETURNS text AS $$
DECLARE
  slug text;
  exists_check boolean;
BEGIN
  LOOP
    slug := substr(md5(random()::text), 1, 8);
    SELECT EXISTS(SELECT 1 FROM public.readings WHERE share_slug = slug) INTO exists_check;
    EXIT WHEN NOT exists_check;
  END LOOP;
  RETURN slug;
END;
$$ LANGUAGE plpgsql;

-- 更新 updated_at 触发器函数
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 6. Triggers
-- ============================================
create trigger update_user_profiles_updated_at
  before update on public.user_profiles
  for each row execute function public.update_updated_at();

create trigger update_readings_updated_at
  before update on public.readings
  for each row execute function public.update_updated_at();

create trigger update_journal_entries_updated_at
  before update on public.journal_entries
  for each row execute function public.update_updated_at();

-- ============================================
-- 7. 新用户自动创建 profile 的触发器
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', '塔罗行者'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
