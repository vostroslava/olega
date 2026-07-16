alter type public.staff_role add value if not exists 'editor';

create type public.site_page_state as enum ('draft', 'review', 'published');

create table public.site_pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  navigation_label text not null,
  page_title text not null,
  meta_description text not null,
  canonical_path text not null,
  schema_type text not null default 'WebPage',
  hero_title text,
  hero_lead text,
  hero_image_url text,
  content jsonb not null default '{}'::jsonb,
  state public.site_page_state not null default 'draft',
  published_page_title text,
  published_meta_description text,
  published_content jsonb,
  published_at timestamptz,
  published_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint site_pages_slug_shape check (slug ~ '^/[a-z0-9/-]*$'),
  constraint site_pages_title_length check (char_length(page_title) between 1 and 160),
  constraint site_pages_description_length check (char_length(meta_description) between 1 and 320),
  constraint site_pages_canonical_path check (canonical_path ~ '^/'),
  constraint site_pages_schema_type check (schema_type in ('WebPage', 'Service', 'CollectionPage', 'ContactPage', 'AboutPage'))
);

create table public.site_page_revisions (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.site_pages(id) on delete cascade,
  revision_number integer not null,
  action text not null,
  snapshot jsonb not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint site_page_revisions_action check (action in ('seeded', 'draft_saved', 'published')),
  constraint site_page_revisions_number check (revision_number > 0),
  unique (page_id, revision_number)
);

create table public.site_media (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'image',
  source_url text not null,
  alt_text text not null default '',
  caption text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint site_media_kind check (kind in ('image', 'video', 'document')),
  constraint site_media_source_url check (source_url ~ '^https?://|^/'),
  constraint site_media_alt_length check (char_length(alt_text) <= 240)
);

create table public.site_settings (
  setting_key text primary key,
  setting_value jsonb not null,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now(),
  constraint site_settings_key_shape check (setting_key ~ '^[a-z0-9_.-]{2,80}$')
);

create index site_pages_state_updated_idx on public.site_pages (state, updated_at desc);
create index site_page_revisions_page_created_idx on public.site_page_revisions (page_id, created_at desc);
create index site_media_created_idx on public.site_media (created_at desc);

create trigger site_pages_touch_updated_at
before update on public.site_pages
for each row execute function app_private.touch_updated_at();

create trigger site_media_touch_updated_at
before update on public.site_media
for each row execute function app_private.touch_updated_at();

create trigger site_settings_touch_updated_at
before update on public.site_settings
for each row execute function app_private.touch_updated_at();

insert into public.site_pages (
  slug, navigation_label, page_title, meta_description, canonical_path, schema_type, hero_title, hero_lead, hero_image_url, content, state, published_page_title, published_meta_description, published_content, published_at
) values
  ('/', 'Главная страница', 'СтеклоСтройГрупп | Фасады, окна и остекление под ключ', 'Производство и монтаж окон ПВХ, алюминиевых дверей, фасадных систем, витражей и панорамного остекления по всей Беларуси.', '/', 'WebPage', 'Стекло, которое меняет архитектуру', 'Окна, фасады и панорамное остекление — от замера и проектирования до производства и монтажа по всей Беларуси.', '/assets/visuals/hero-desktop-after.webp', '{"page":"home"}'::jsonb, 'published', 'СтеклоСтройГрупп | Фасады, окна и остекление под ключ', 'Производство и монтаж окон ПВХ, алюминиевых дверей, фасадных систем, витражей и панорамного остекления по всей Беларуси.', '{"page":"home"}'::jsonb, now()),
  ('/dlya-doma/', 'Для дома', 'Остекление для дома | СтеклоСтройГрупп', 'Панорамные окна, двери и террасы для частного дома: проектирование, производство и монтаж по Беларуси.', '/dlya-doma/', 'Service', 'Остекление, которое работает на архитектуру дома', 'Окна, двери и террасы под задачу, свет и геометрию вашего пространства.', '/assets/photos/project-arbat.png', '{"page":"home"}'::jsonb, 'published', 'Остекление для дома | СтеклоСтройГрупп', 'Панорамные окна, двери и террасы для частного дома: проектирование, производство и монтаж по Беларуси.', '{"page":"home"}'::jsonb, now()),
  ('/dlya-biznesa/', 'Для бизнеса', 'Фасадное остекление для бизнеса | СтеклоСтройГрупп', 'Фасады, входные группы и алюминиевые системы для коммерческих объектов по всей Беларуси.', '/dlya-biznesa/', 'Service', 'Фасады, которые становятся частью бренда', 'Светопрозрачные решения для объектов с высокой нагрузкой и точной архитектурой.', '/assets/photos/project-avenue.png', '{"page":"business"}'::jsonb, 'published', 'Фасадное остекление для бизнеса | СтеклоСтройГрупп', 'Фасады, входные группы и алюминиевые системы для коммерческих объектов по всей Беларуси.', '{"page":"business"}'::jsonb, now()),
  ('/proekty/', 'Проекты', 'Проекты остекления | СтеклоСтройГрупп', 'Реализованные объекты: фасады, витражи, окна и панорамное остекление в Беларуси.', '/proekty/', 'CollectionPage', 'Архитектура, которую можно увидеть', 'Изучите реализованные объекты и инженерные решения за каждым фасадом.', '/assets/photos/project-avenue.png', '{"page":"projects"}'::jsonb, 'published', 'Проекты остекления | СтеклоСтройГрупп', 'Реализованные объекты: фасады, витражи, окна и панорамное остекление в Беларуси.', '{"page":"projects"}'::jsonb, now()),
  ('/proizvodstvo/', 'Производство', 'Собственное производство | СтеклоСтройГрупп', 'Проектирование и производство светопрозрачных конструкций: контроль каждого этапа.', '/proizvodstvo/', 'WebPage', 'Точность начинается на производстве', 'Собственное производство и контроль качества каждой конструкции.', '/assets/photos/project-avenue.png', '{"page":"production"}'::jsonb, 'published', 'Собственное производство | СтеклоСтройГрупп', 'Проектирование и производство светопрозрачных конструкций: контроль каждого этапа.', '{"page":"production"}'::jsonb, now()),
  ('/kontakty/', 'Контакты', 'Контакты | СтеклоСтройГрупп', 'Свяжитесь со СтеклоСтройГрупп для расчёта окон, фасада или панорамного остекления.', '/kontakty/', 'ContactPage', 'Начнём с вашей архитектурной задачи', 'Передайте исходные данные — инженер предложит следующий шаг.', '/assets/photos/project-arbat.png', '{"page":"contacts"}'::jsonb, 'published', 'Контакты | СтеклоСтройГрупп', 'Свяжитесь со СтеклоСтройГрупп для расчёта окон, фасада или панорамного остекления.', '{"page":"contacts"}'::jsonb, now())
on conflict (slug) do nothing;

insert into public.site_page_revisions (page_id, revision_number, action, snapshot)
select id, 1, 'seeded', jsonb_build_object(
  'page_title', page_title,
  'meta_description', meta_description,
  'canonical_path', canonical_path,
  'schema_type', schema_type,
  'hero_title', hero_title,
  'hero_lead', hero_lead,
  'hero_image_url', hero_image_url,
  'content', content,
  'state', state
)
from public.site_pages
on conflict (page_id, revision_number) do nothing;

alter table public.site_pages enable row level security;
alter table public.site_page_revisions enable row level security;
alter table public.site_media enable row level security;
alter table public.site_settings enable row level security;

revoke all on table public.site_pages, public.site_page_revisions, public.site_media, public.site_settings from anon, authenticated;
grant select, insert, update, delete on table public.site_pages, public.site_page_revisions, public.site_media, public.site_settings to service_role;
