-- Run this in the Supabase SQL Editor (Project -> SQL Editor -> New query).
-- Replace '<ADMIN_USER_ID>' below with your admin user's UUID once you've
-- created it (Authentication -> Users -> copy the "User UID" column).

create table if not exists items (
  id text primary key,
  name text not null,
  tags text[] not null default '{}',
  description text,
  url text,
  category text,
  icon_kind text not null check (icon_kind in ('simple-icons', 'custom')),
  icon_value text not null,
  created_at timestamptz not null default now()
);

-- Extracted theme color for custom-uploaded icons (simple-icons items derive
-- their color from the bundled dataset instead, so this stays null for those).
alter table items add column if not exists icon_tint text;

-- Package-manager install commands, e.g. [{"manager":"brew","command":"brew install --cask protonvpn"}].
-- A flexible per-item list (jsonb), not fixed columns — items support
-- different subsets of managers, and commands can carry flags/casks/etc.
alter table items add column if not exists install_commands jsonb not null default '[]'::jsonb;

alter table items enable row level security;

-- Every policy below is dropped-then-recreated, so this whole file is safe to
-- re-run any time (e.g. after rotating the admin user / losing the password —
-- just substitute the new UID and run the whole thing again). Note that
-- Storage policies (on storage.objects) are managed on a different dashboard
-- page ("Storage -> Policies") from table policies ("Table Editor -> items ->
-- Policies" or "Database -> Policies") — clearing one place does not clear
-- the other, which is why re-running used to fail with a "already exists"
-- error on the storage policies below.

drop policy if exists "Public can read items" on items;
create policy "Public can read items"
  on items for select
  using (true);

drop policy if exists "Admin can insert items" on items;
create policy "Admin can insert items"
  on items for insert
  with check (auth.uid() = '<ADMIN_USER_ID>');

drop policy if exists "Admin can update items" on items;
create policy "Admin can update items"
  on items for update
  using (auth.uid() = '<ADMIN_USER_ID>');

drop policy if exists "Admin can delete items" on items;
create policy "Admin can delete items"
  on items for delete
  using (auth.uid() = '<ADMIN_USER_ID>');

-- Storage bucket for custom-uploaded icons (create the bucket named "icons"
-- via Storage -> New bucket in the dashboard first, then run these policies).

drop policy if exists "Public can read icons" on storage.objects;
create policy "Public can read icons"
  on storage.objects for select
  using (bucket_id = 'icons');

drop policy if exists "Admin can upload icons" on storage.objects;
create policy "Admin can upload icons"
  on storage.objects for insert
  with check (bucket_id = 'icons' and auth.uid() = '<ADMIN_USER_ID>');

-- Optional: seed the same 6 demo items used during local development so the
-- site isn't empty on first load. Safe to skip or delete afterward.

insert into items (id, name, tags, url, icon_kind, icon_value) values
  ('proton-vpn', 'Proton VPN', array['windows','macos','linux','privacy'], 'https://protonvpn.com', 'simple-icons', 'protonvpn'),
  ('signal', 'Signal', array['windows','macos','linux','privacy'], 'https://signal.org', 'simple-icons', 'signal'),
  ('bitwarden', 'Bitwarden', array['windows','macos','linux','privacy'], 'https://bitwarden.com', 'simple-icons', 'bitwarden'),
  ('iterm2', 'iTerm2', array['macos'], 'https://iterm2.com', 'simple-icons', 'iterm2'),
  ('cachyos', 'CachyOS', array['linux','cachyos'], 'https://cachyos.org', 'simple-icons', 'cachyos'),
  ('ubuntu', 'Ubuntu', array['linux','ubuntu'], 'https://ubuntu.com', 'simple-icons', 'ubuntu')
on conflict (id) do nothing;

-- Tag catalog: filter *groups* (Operating System / Topic) stay static in the
-- app (src/data/filterTags.ts); filter *tags* within those groups live here so
-- the admin panel can add new ones without a code change/redeploy.

create table if not exists tags (
  id text primary key,
  label text not null,
  group_id text not null check (group_id in ('os', 'topic')),
  created_at timestamptz not null default now()
);

alter table tags enable row level security;

drop policy if exists "Public can read tags" on tags;
create policy "Public can read tags"
  on tags for select
  using (true);

drop policy if exists "Admin can insert tags" on tags;
create policy "Admin can insert tags"
  on tags for insert
  with check (auth.uid() = '<ADMIN_USER_ID>');

drop policy if exists "Admin can delete tags" on tags;
create policy "Admin can delete tags"
  on tags for delete
  using (auth.uid() = '<ADMIN_USER_ID>');

insert into tags (id, label, group_id) values
  ('macos', 'macOS', 'os'),
  ('windows', 'Windows', 'os'),
  ('linux', 'Linux', 'os'),
  ('cachyos', 'CachyOS', 'os'),
  ('ubuntu', 'Ubuntu', 'os'),
  ('privacy', 'Privacy', 'topic')
on conflict (id) do nothing;

-- Allow a new "featured" tag group (curation/meta tags — currently just
-- "recommended" — distinct from the "os"/"topic" content-property groups).
alter table tags drop constraint if exists tags_group_id_check;
alter table tags add constraint tags_group_id_check
  check (group_id in ('os', 'topic', 'featured'));

insert into tags (id, label, group_id) values
  ('recommended', 'Recommended', 'featured')
on conflict (id) do nothing;

-- Category catalog: like tags, categories are created once via the admin
-- panel and picked from existing ones thereafter, instead of free-typed per
-- item. Unlike tags, categories are single-select-per-item and are never
-- exposed as a public filter facet (grouping/display only) — kept as its own
-- table rather than folded into `tags` so nothing needs excluding from the
-- generic group iteration that drives the public FilterBar.

create table if not exists categories (
  id text primary key,
  label text not null,
  created_at timestamptz not null default now()
);

alter table categories enable row level security;

drop policy if exists "Public can read categories" on categories;
create policy "Public can read categories"
  on categories for select
  using (true);

drop policy if exists "Admin can insert categories" on categories;
create policy "Admin can insert categories"
  on categories for insert
  with check (auth.uid() = '<ADMIN_USER_ID>');

drop policy if exists "Admin can delete categories" on categories;
create policy "Admin can delete categories"
  on categories for delete
  using (auth.uid() = '<ADMIN_USER_ID>');

-- Backfill: turn any existing free-text items.category values into real
-- catalog entries (slugified id + original text as the label), then repoint
-- items.category at the new id. Safe to re-run — slugifying an
-- already-slugified value is a no-op.

insert into categories (id, label)
select distinct
  regexp_replace(lower(trim(category)), '[^a-z0-9]+', '-', 'g'),
  trim(category)
from items
where category is not null and trim(category) <> ''
on conflict (id) do nothing;

update items
set category = regexp_replace(lower(trim(category)), '[^a-z0-9]+', '-', 'g')
where category is not null and trim(category) <> '';

-- Blog posts: markdown body, authored through the admin panel (same
-- content-without-redeploy model as items/tags/categories). `published_at`
-- being null means "draft" — drafts are readable/editable by the admin only,
-- everyone else only sees posts once they're published.

create table if not exists posts (
  id text primary key,
  title text not null,
  excerpt text,
  body text not null,
  published_at timestamptz,
  created_at timestamptz not null default now()
);

alter table posts enable row level security;

drop policy if exists "Public can read published posts" on posts;
create policy "Public can read published posts"
  on posts for select
  using (published_at is not null or auth.uid() = '<ADMIN_USER_ID>');

drop policy if exists "Admin can insert posts" on posts;
create policy "Admin can insert posts"
  on posts for insert
  with check (auth.uid() = '<ADMIN_USER_ID>');

drop policy if exists "Admin can update posts" on posts;
create policy "Admin can update posts"
  on posts for update
  using (auth.uid() = '<ADMIN_USER_ID>');

drop policy if exists "Admin can delete posts" on posts;
create policy "Admin can delete posts"
  on posts for delete
  using (auth.uid() = '<ADMIN_USER_ID>');

-- Storage bucket for blog post images/video (create the bucket named
-- "post-media" via Storage -> New bucket in the dashboard first, same as the
-- "icons" bucket above, then run these policies).

drop policy if exists "Public can read post-media" on storage.objects;
create policy "Public can read post-media"
  on storage.objects for select
  using (bucket_id = 'post-media');

drop policy if exists "Admin can upload post-media" on storage.objects;
create policy "Admin can upload post-media"
  on storage.objects for insert
  with check (bucket_id = 'post-media' and auth.uid() = '<ADMIN_USER_ID>');

-- Manually-pinned GitHub repos: repos the admin contributed to but doesn't
-- own (so they don't show up in the live per-username repo list on the
-- Projects page). Only the reference ("owner/repo") is stored — display data
-- (description/stars/language) is still live-fetched from the GitHub API at
-- render time, same as the owned repos, so this table never goes stale.

create table if not exists pinned_repos (
  id text primary key,
  created_at timestamptz not null default now()
);

alter table pinned_repos enable row level security;

drop policy if exists "Public can read pinned repos" on pinned_repos;
create policy "Public can read pinned repos"
  on pinned_repos for select
  using (true);

drop policy if exists "Admin can insert pinned repos" on pinned_repos;
create policy "Admin can insert pinned repos"
  on pinned_repos for insert
  with check (auth.uid() = '<ADMIN_USER_ID>');

drop policy if exists "Admin can delete pinned repos" on pinned_repos;
create policy "Admin can delete pinned repos"
  on pinned_repos for delete
  using (auth.uid() = '<ADMIN_USER_ID>');

-- Hardware page devices (PC/homeserver/MacBook, etc). "specs" is a free-form
-- ordered label/value list, e.g. [{"label":"CPU","value":"Ryzen 9 7950X"}].
-- "model_url" points at an admin-uploaded .glb in the "device-models" bucket
-- (create it via Storage -> New bucket in the dashboard, same as "icons"/
-- "post-media", then run the bucket policies below); "model_credit" is a
-- nullable {creator, sourceUrl, license?} object crediting the model's
-- Sketchfab author. Unlike tags/categories/pinned_repos, devices get a real
-- update policy — specs/models are expected to be edited in place.

create table if not exists devices (
  id text primary key,
  name text not null,
  specs jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- Added after the table's first version (which had a "kind" column selecting
-- a procedural rig, since replaced by real per-device .glb uploads) — plain
-- "create table if not exists" is a no-op on an already-existing table, so
-- these explicit alters are what actually bring an existing devices table up
-- to date when this file is re-run.
alter table devices add column if not exists model_url text;
alter table devices add column if not exists model_credit jsonb;
alter table devices drop column if exists kind;

alter table devices enable row level security;

drop policy if exists "Public can read devices" on devices;
create policy "Public can read devices"
  on devices for select
  using (true);

drop policy if exists "Admin can insert devices" on devices;
create policy "Admin can insert devices"
  on devices for insert
  with check (auth.uid() = '<ADMIN_USER_ID>');

drop policy if exists "Admin can update devices" on devices;
create policy "Admin can update devices"
  on devices for update
  using (auth.uid() = '<ADMIN_USER_ID>');

drop policy if exists "Admin can delete devices" on devices;
create policy "Admin can delete devices"
  on devices for delete
  using (auth.uid() = '<ADMIN_USER_ID>');

drop policy if exists "Public can read device-models" on storage.objects;
create policy "Public can read device-models"
  on storage.objects for select
  using (bucket_id = 'device-models');

drop policy if exists "Admin can upload device-models" on storage.objects;
create policy "Admin can upload device-models"
  on storage.objects for insert
  with check (bucket_id = 'device-models' and auth.uid() = '<ADMIN_USER_ID>');
