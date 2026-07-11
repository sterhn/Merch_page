# Merch Stock

A public, read-only page you can send to clients: every item from your [Merch Planner](https://github.com/sterhn/merch_planner) catalog with photo, price, and how many are in stock. No login needed to view it.

It reads from the same Supabase project as Merch Planner, but **only** through a dedicated public view that exposes name, type, fandom, photo, sale price, and stock. Your cost prices, profit, orders, customers, and expenses are not accessible from this page.

No build step: it's one `index.html`.

## Setup (~5 minutes)

### 1. Create the public view in Supabase

1. Open your Supabase project → **SQL Editor**.
2. Copy all of [`supabase/public_stock_view.sql`](supabase/public_stock_view.sql), paste, press **Run**.

(The dashboard may warn about a "security definer view" — that's expected; the file explains why. To take the data offline later, run `drop view public_stock;`.)

**Already ran an older version of this file?** Run it again as-is: it starts with `drop view if exists public_stock;`, so re-running recreates the view with the current column list (the page now also reads `description` and `product_photo_url` — the large product photo shown in the item detail view).

### 2. Configure and deploy this repo

1. In Supabase: **Settings → API**. Copy the **Project URL** and the **anon public** key (the same values you used for Merch Planner).
2. In this repo: **Settings → Secrets and variables → Actions → Variables tab → New repository variable**:
   - `VITE_SUPABASE_URL` = the Project URL
   - `VITE_SUPABASE_ANON_KEY` = the anon key
3. Still in repo settings: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
4. Go to the **Actions** tab → "Deploy to GitHub Pages" → **Run workflow** (or push any commit to `main`).
5. When it's green, the page is live at **https://sterhn.github.io/Merch_page/** — that's the link you send to clients.

## What clients see

- Every catalog item, grouped by fandom, with photo, sale price, description, and stock amount
- Totals: number of items and total units in stock (they follow the active search/filters)
- Search by name, type, or fandom, plus filter chips by type and an "in stock only" toggle
- Sold-out items are dimmed, labeled, and sorted to the end of each group
- A tap on any card opens a detail view with the real product photo (when one is set in Merch Planner) and description; a cart composes a ready-to-send Telegram order message

Stock numbers are live from Supabase — the same `stock_qty` that Merch Planner updates automatically when you mark orders as sent.

Don't want prices shown? Remove the `sale_price` line from the view SQL and the price row in `index.html`.
