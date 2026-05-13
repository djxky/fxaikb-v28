-- pin-comments · 增量迁移：v0.3 → v0.4（保留全部历史评论）
--
-- 适用场景：你的 Supabase 已经按 v0.3 schema（含 project_key）跑过，且评论数据需要保留。
-- 在 Supabase SQL Editor 一次性执行本文件即可，**幂等**：跑 N 次都安全。
--
-- v0.4 做了两件影响数据的事：
--   1. comment_pins 表新增 page_title 列（页面可读名，用于跨页清单展示）
--   2. page_key 默认值由 location.pathname（带路径前缀）改为「文件名」，
--      让同一页面在「本地 dev / GitHub Pages 子路径 / file://」三种环境下 page_key 一致，
--      跨页跳转用相对解析也不会 404。
--      → 老数据里的 page_key 是 "/some/path/page.html" 形式，需要归一成 "page.html"。

-- ============= 1. 加 page_title 列 =============
alter table public.comment_pins
  add column if not exists page_title text;

-- ============= 2. 把历史 page_key 规范化为「文件名」（幂等） =============
-- 仅对包含 "/" 的旧值生效；新数据写入时已经是文件名格式，不会被影响。
-- 同时把老数据的 page_title 兜底成 page_key 规范化前的最后一段，避免清单显示空白。
update public.comment_pins
   set page_title = coalesce(page_title, regexp_replace(page_key, '^.*/', ''))
 where page_title is null;

update public.comment_pins
   set page_key = regexp_replace(page_key, '^.*/', '')
 where page_key like '%/%';

update public.comment_messages
   set page_key = regexp_replace(page_key, '^.*/', '')
 where page_key like '%/%';

-- ============= 3. 更新 RLS（INSERT 校验加上 page_title 长度） =============
drop policy if exists "anon can insert comment pins" on public.comment_pins;
create policy "anon can insert comment pins"
on public.comment_pins for insert
to anon
with check (
  length(trim(project_key)) between 1 and 80
  and length(trim(page_key)) between 1 and 200
  and (page_title is null or length(page_title) <= 200)
  and length(trim(created_by)) between 1 and 40
  and length(trim(selector)) > 0
);

-- ============= 4. 自检（可选执行，看下迁移效果） =============
-- select page_key, count(*) from public.comment_pins group by page_key order by count(*) desc;
-- 跑完上面这条，page_key 应该都是文件名形式，没有 "/"。
