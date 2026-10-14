# Merch Stock

A public, read-only page you can send to clients: every item from your [Merch Planner](https://github.com/sterhn/merch_planner) catalog with photo, price, and how many are in stock. No login needed to view it.

It reads from the same Supabase project as Merch Planner, but **only** through a dedicated public view that exposes name, type, fandom, photo, sale price, and stock, plus a small `fandoms` table of display info. Your cost prices, profit, orders, customers, and expenses are not accessible from this page.

No build step and no runtime dependencies: plain HTML, CSS and JS.

## Files

| File | What's in it |
| --- | --- |
| `index.html` | Page markup |
| `styles.css` | All styles. Colours are tokens at the top (`--accent-rgb`, `--grey-rgb`, …) |
| `app.js` | Loading, filters, detail view, cart and order flow |
| `config.js` | **Settings you might change**: Supabase project, Telegram/VK links, colour palette, fallback fandom info |
| `assets/icons/sprite.svg` | The hand-drawn icons plus the Telegram/VK marks |
| `supabase/*.sql` | One-time setup scripts for the database |
| `tests/` | Smoke tests (they run automatically before every deploy) |

## Everyday tasks

**Add a fandom, or change its full title, icon or colour.** In Supabase, go to **Table Editor → fandoms** and edit the row. Use the name exactly as Merch Planner writes it (e.g. `[ORV]`). The page picks the change up on the next reload, with no redeploy. A fandom without a row still shows up, with the sparkle icon and an automatic colour that never changes.

**Fandom order** is automatic: the fandom with the most items comes first, on the buttons and down the page. `sort_order` only decides between fandoms with the same number of items.

**Change the Telegram or VK link.** Edit `links` in `config.js`.

**Change the site's accent colour.** Edit `--accent-rgb` (and `--accent-hi` / `--accent-deep`) at the top of `styles.css`.

**Add a new drawing.** Trace it to a path (potrace works well) and add it to `assets/icons/sprite.svg` as `<symbol id="i-name" viewBox="0 0 24 24">…</symbol>` with `fill="currentColor"`. Then set `icon` to `name` in the fandom's row. The PNG originals live in [`assets/icons/`](assets/icons): `cat.png` (GSGW), `flower.png` (MSCH), `swirl.png` (OC), `sparkle.png` (ORV, and the site's ornament) and `heartbeat.png`, the line under the title. The browser-tab icon is `assets/icons/favicon.svg`.

**Hide prices.** Remove `sale_price` from the view in `supabase/public_stock_view.sql` and re-run it. Items without a price show "цена по запросу", and the cart total says it's partial.

## Preview locally

```sh
python3 -m http.server 8080      # then open http://localhost:8080
```

It shows your real, live catalog. Opening `index.html` straight from disk won't work, because browsers block the icon sprite on `file://`.

## Tests

```sh
npm install
npx playwright install chromium   # first time only
npm test
```

The tests use made-up catalog data, not your real stock. They check that the page renders, the filters work, the detail view opens and closes, and the cart builds the right order text. GitHub runs them on every pull request and before every deploy. If they fail, the deploy is skipped and the live page stays as it was.

## Setup (already done for this repo)

### 1. Database

In your Supabase project, open **SQL Editor** and run each file once:

1. [`supabase/public_stock_view.sql`](supabase/public_stock_view.sql) creates the public, read-only view of the catalog. (The dashboard may warn about a "security definer view". That's expected; the file explains why. To take the data offline, run `drop view public_stock;`.) Re-running it is safe and picks up new columns.
2. [`supabase/fandoms.sql`](supabase/fandoms.sql) creates the `fandoms` table, already filled with today's titles, icons and colours. Re-running it is safe: it never overwrites rows you've edited. Until it has been run, the page uses the copy in `config.js`.

### 2. Config and deploy

1. In Supabase, go to **Settings → API** and put the **Project URL** and the **anon public** key in `config.js`. The anon key is meant to be public: every visitor's browser gets it anyway, and row-level security hides everything except the view and the fandoms table. **Never** use the `service_role` key here.
2. In the repo, go to **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Push to `main`, or go to **Actions → "Deploy to GitHub Pages" → Run workflow**. The page goes live at **https://sterhn.github.io/Merch_page/**.

The `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` repository variables used by older versions are no longer read. You can delete them.

## What clients see

- Every catalog item, grouped by fandom, with photo, sale price, description, and stock amount
- Fandom buttons as the main navigation, biggest collection first (each shows how many items it has), plus filter chips by type and an "in stock only" toggle
- Each fandom has its own hand-drawn icon on its button and section header, and it stands in for items that don't have a picture yet
- Sold-out items are dimmed, labeled, and sorted to the end of each group
- A tap on any card opens a detail view with the real product photo (when one is set in Merch Planner) and description; a cart composes a ready-to-send Telegram order message
- Works with a keyboard and a screen reader: cards and the cart bar are real buttons, the overlays are proper modal dialogs, and text meets WCAG AA contrast

Stock numbers are live from Supabase: the same `stock_qty` that Merch Planner updates automatically when you mark orders as sent.
