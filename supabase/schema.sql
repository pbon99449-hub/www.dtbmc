create extension if not exists pgcrypto;

create table if not exists public.gallery_posts (
  id uuid primary key default gen_random_uuid(),
  author text not null default 'Anonymous',
  caption text not null default 'New gallery post',
  image_url text not null,
  public_id text not null,
  owner_token text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.teacher_posts (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Uploaded Teacher',
  phone text not null default '',
  subject text not null default 'N/A',
  image_url text not null,
  public_id text not null,
  owner_token text not null,
  created_at timestamptz not null default now()
);

alter table public.teacher_posts
add column if not exists phone text not null default '';

create table if not exists public.letter_box_posts (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  title text not null,
  message text not null,
  name text not null default '',
  is_anonymous boolean not null default false,
  owner_token text not null,
  created_at timestamptz not null default now()
);

create index if not exists gallery_posts_created_at_idx on public.gallery_posts (created_at desc);
create index if not exists teacher_posts_created_at_idx on public.teacher_posts (created_at desc);
create index if not exists letter_box_posts_created_at_idx on public.letter_box_posts (created_at desc);

-- Ensure latest schema on existing projects
alter table public.teacher_posts
add column if not exists phone text not null default '';

-- Optional check query (run separately if needed)
-- select id, name, phone, subject
-- from public.teacher_posts
-- order by created_at desc;
