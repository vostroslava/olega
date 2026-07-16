alter table public.site_pages
  add column template_key text not null default 'landing',
  add column seo_robots text not null default 'index,follow',
  add column og_title text,
  add column og_description text,
  add column og_image_url text,
  add column twitter_card text not null default 'summary_large_image',
  add column sitemap_priority numeric(2,1) not null default 0.5,
  add column sitemap_change_frequency text not null default 'monthly',
  add column is_indexable boolean not null default true,
  add column is_in_navigation boolean not null default true,
  add column navigation_order integer not null default 100,
  add column navigation_parent text,
  add column published_snapshot jsonb;

alter table public.site_pages
  add constraint site_pages_template_key check (template_key in ('home', 'audience', 'projects', 'production', 'contacts', 'landing', 'article')),
  add constraint site_pages_robots check (seo_robots in ('index,follow', 'noindex,follow', 'noindex,nofollow')),
  add constraint site_pages_twitter_card check (twitter_card in ('summary', 'summary_large_image')),
  add constraint site_pages_sitemap_priority check (sitemap_priority between 0.0 and 1.0),
  add constraint site_pages_sitemap_frequency check (sitemap_change_frequency in ('always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never')),
  add constraint site_pages_og_image check (og_image_url is null or og_image_url ~ '^(https?://|/)');

create table public.site_page_blocks (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.site_pages(id) on delete cascade,
  block_key text not null,
  block_type text not null,
  label text not null,
  position integer not null,
  is_visible boolean not null default true,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint site_page_blocks_key check (block_key ~ '^[a-z0-9_-]{2,80}$'),
  constraint site_page_blocks_type check (block_type in ('hero', 'text', 'image', 'cards', 'projects', 'technology', 'faq', 'quote', 'cta')),
  constraint site_page_blocks_position check (position >= 0),
  unique (page_id, block_key),
  unique (page_id, position)
);

create table public.site_navigation_items (
  id uuid primary key default gen_random_uuid(),
  location text not null default 'header',
  label text not null,
  href text not null,
  position integer not null,
  is_visible boolean not null default true,
  opens_new_tab boolean not null default false,
  page_id uuid references public.site_pages(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint site_navigation_location check (location in ('header', 'footer', 'utility')),
  constraint site_navigation_href check (href ~ '^(https?://|/)'),
  constraint site_navigation_position check (position >= 0),
  unique (location, position)
);

create table public.site_release_events (
  id uuid primary key default gen_random_uuid(),
  page_id uuid references public.site_pages(id) on delete set null,
  kind text not null,
  status text not null default 'completed',
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint site_release_events_kind check (kind in ('page_published', 'navigation_published', 'settings_saved', 'deploy_requested')),
  constraint site_release_events_status check (status in ('queued', 'completed', 'failed'))
);

create index site_page_blocks_page_position_idx on public.site_page_blocks (page_id, position);
create index site_navigation_items_location_position_idx on public.site_navigation_items (location, position);
create index site_release_events_page_created_idx on public.site_release_events (page_id, created_at desc);

create trigger site_page_blocks_touch_updated_at
before update on public.site_page_blocks
for each row execute function app_private.touch_updated_at();

create trigger site_navigation_items_touch_updated_at
before update on public.site_navigation_items
for each row execute function app_private.touch_updated_at();

update public.site_pages
set template_key = case slug
  when '/' then 'home'
  when '/dlya-doma/' then 'audience'
  when '/dlya-biznesa/' then 'audience'
  when '/proekty/' then 'projects'
  when '/proizvodstvo/' then 'production'
  when '/kontakty/' then 'contacts'
  else 'landing'
end,
navigation_order = case slug
  when '/' then 0
  when '/dlya-doma/' then 10
  when '/dlya-biznesa/' then 20
  when '/proekty/' then 30
  when '/proizvodstvo/' then 40
  when '/kontakty/' then 50
  else 100
end,
og_title = page_title,
og_description = meta_description,
og_image_url = hero_image_url,
published_snapshot = jsonb_build_object(
  'page_title', published_page_title,
  'meta_description', published_meta_description,
  'canonical_path', canonical_path,
  'schema_type', schema_type,
  'seo_robots', seo_robots,
  'og_title', page_title,
  'og_description', meta_description,
  'og_image_url', hero_image_url,
  'twitter_card', twitter_card,
  'content', published_content
)
where published_at is not null;

insert into public.site_page_blocks (page_id, block_key, block_type, label, position, data)
select id, 'hero', 'hero', 'Первый экран', 0, jsonb_build_object(
  'eyebrow', 'СтеклоСтройГрупп',
  'heading', coalesce(hero_title, navigation_label),
  'body', coalesce(hero_lead, meta_description),
  'ctaLabel', 'Рассчитать проект',
  'ctaHref', '/raschet/',
  'imageUrl', hero_image_url,
  'imageAlt', navigation_label
)
from public.site_pages
on conflict (page_id, block_key) do nothing;

insert into public.site_page_blocks (page_id, block_key, block_type, label, position, data)
select id, 'primary-story', 'text', 'Основной смысловой блок', 10, jsonb_build_object(
  'eyebrow', 'Подход',
  'heading', case slug
    when '/' then 'От замера до монтажа — в одной инженерной связке'
    when '/dlya-doma/' then 'Свет, тишина и связь с ландшафтом'
    when '/dlya-biznesa/' then 'Инженерный подход для объекта любого масштаба'
    when '/proekty/' then 'Объекты, в которых видна точность решения'
    when '/proizvodstvo/' then 'Точность начинается на производстве'
    else 'Начнём с вашей архитектурной задачи'
  end,
  'body', meta_description
)
from public.site_pages
on conflict (page_id, block_key) do nothing;

insert into public.site_navigation_items (location, label, href, position, page_id)
select 'header', navigation_label, slug, navigation_order, id
from public.site_pages
where slug in ('/dlya-doma/', '/dlya-biznesa/', '/proekty/', '/proizvodstvo/', '/kontakty/')
on conflict (location, position) do nothing;

insert into public.site_settings (setting_key, setting_value)
values
  ('brand', '{"name":"СтеклоСтройГрупп","legalName":"ООО СтеклоСтройГрупп","logoAlt":"СтеклоСтройГрупп"}'::jsonb),
  ('contacts', '{"phone":"+375 (29) 000-00-00","email":"info@steklostroygroup.by","address":"Могилёв, Беларусь"}'::jsonb),
  ('social', '{"instagram":"","telegram":"","youtube":""}'::jsonb),
  ('default_seo', '{"titleSuffix":"| СтеклоСтройГрупп","defaultRobots":"index,follow","defaultOgImage":"/assets/visuals/hero-desktop-after.webp"}'::jsonb),
  ('analytics', '{"gaMeasurementId":"","yandexMetrikaId":""}'::jsonb)
on conflict (setting_key) do nothing;

alter table public.site_page_blocks enable row level security;
alter table public.site_navigation_items enable row level security;
alter table public.site_release_events enable row level security;

revoke all on table public.site_page_blocks, public.site_navigation_items, public.site_release_events from anon, authenticated;
grant select, insert, update, delete on table public.site_page_blocks, public.site_navigation_items, public.site_release_events to service_role;
