-- Public, read-only view of the catalog for the client-facing stock page.
-- Paste this whole file into the Supabase SQL Editor and run it.
--
-- The view deliberately runs with owner rights (no security_invoker), which
-- bypasses the RLS on `items` — that is the point: it exposes ONLY the
-- columns listed below to anonymous visitors. Everything else (cost_price,
-- profit, orders, customers, expenses…) stays private. Supabase's dashboard
-- may flag it as a "security definer view" — that is expected here.

create view public_stock as
  select id, type, fandom, name, image_url, sale_price, stock_qty
  from items;

grant select on public_stock to anon;

-- To take the page offline later, just run: drop view public_stock;
