-- Fandom info for the stock page: full titles, icon, colour and order.
-- Paste this whole file into the Supabase SQL Editor and run it once.
-- After that, edit fandoms in Table Editor → fandoms; no code change or
-- redeploy needed. Safe to re-run: it never overwrites rows you've edited.
--
--   name        exactly as the fandom is written in Merch Planner, e.g. [ORV]
--   title_en    English full title under the section header (optional)
--   title_ru    Russian full title under it (optional)
--   icon        a drawing from assets/icons/sprite.svg: sparkle, cat, flower,
--               swirl (empty = sparkle)
--   color       hex colour for the fandom's button, header and cards
--               (empty = an automatic one that never changes)
--   sort_order  fandoms are ordered by item count, most first; this only
--               decides between fandoms with the same count (smaller first)

create table if not exists fandoms (
  name        text primary key,
  title_en    text,
  title_ru    text,
  icon        text,
  color       text check (color is null or color ~ '^#[0-9a-fA-F]{6}$'),
  sort_order  integer
);

-- Everything in this table is public: anyone may read it. With RLS on and
-- no write policy, only the dashboard (which bypasses RLS) can change it.
alter table fandoms enable row level security;
drop policy if exists "fandoms are public" on fandoms;
create policy "fandoms are public" on fandoms for select using (true);
grant select on fandoms to anon, authenticated;

-- Today's fandoms, with the titles, icons and colours the page already uses
insert into fandoms (name, title_en, title_ru, icon, color, sort_order) values
  ('[GSGW]', 'got dropped into a ghost story, still gotta work',
             'даже если попадёшь в историю о призраках, всё равно придётся идти на работу',
             'cat',     '#4a8f8f', 10),
  ('[MSCH]', 'my s-class hunters', 'воспитанные мной s-классы',
             'flower',  '#a3854e', 20),
  ('[OC]',   'original characters', 'оригинальные персонажи',
             'swirl',   '#a64b6b', 30),
  ('[ORV]',  'omniscient reader''s viewpoint', 'всеведущий читатель',
             'sparkle', '#7b6ba4', 40)
on conflict (name) do nothing;

-- Any other fandom already in the catalog gets a row to fill in
insert into fandoms (name, sort_order)
  select distinct fandom, 100 from items where fandom is not null
on conflict (name) do nothing;
