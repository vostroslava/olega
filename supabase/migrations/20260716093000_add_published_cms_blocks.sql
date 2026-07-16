-- Keep the public site on a coherent published snapshot while editors work in drafts.
-- The editable columns remain data/is_visible/position; the published columns are
-- only copied when a page is explicitly published.
alter table public.site_page_blocks
  add column published_data jsonb,
  add column published_position integer,
  add column published_is_visible boolean,
  add column published_at timestamptz;

update public.site_page_blocks
set
  published_data = data,
  published_position = position,
  published_is_visible = is_visible,
  published_at = now()
where published_data is null;

alter table public.site_page_blocks
  alter column published_data set default '{}'::jsonb,
  alter column published_position set default 0,
  alter column published_is_visible set default true,
  alter column published_data set not null,
  alter column published_position set not null,
  alter column published_is_visible set not null;

alter table public.site_page_blocks
  add constraint site_page_blocks_published_position check (published_position >= 0);

create index site_page_blocks_public_position_idx
  on public.site_page_blocks (page_id, published_position)
  where published_is_visible = true;
