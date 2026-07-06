# Merch Stock

A single read-only page that shows every item from your [Merch Planner](https://github.com/sterhn/merch_planner) catalog and how many are in stock. Same Supabase data, same login — just a quick view for checking stock.

No build step: it's one `index.html`. You log in with the same email and password you use for Merch Planner.

## Setup (~3 minutes)

It connects to the **same Supabase project** as Merch Planner — nothing new to create there.

1. In Supabase: **Settings → API**. Copy the **Project URL** and the **anon public** key (the same values you used for Merch Planner).
2. In this repo: **Settings → Secrets and variables → Actions → Variables tab → New repository variable**:
   - `VITE_SUPABASE_URL` = the Project URL
   - `VITE_SUPABASE_ANON_KEY` = the anon key
3. Still in repo settings: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
4. Go to the **Actions** tab → "Deploy to GitHub Pages" → **Run workflow** (or push any commit to `main`).
5. When it's green, the page is live at **https://sterhn.github.io/Merch_page/**

On your phone: open the URL, log in, then "Add to Home Screen".

## What it shows

- Every catalog item, grouped by type, with its photo and stock amount
- Totals: number of items and total units in stock (they follow the search filter)
- Search by name, type, or fandom
- Items with zero stock are dimmed with the amount in red

Stock numbers are live from Supabase — the same `stock_qty` that Merch Planner updates automatically when you mark orders as sent.
