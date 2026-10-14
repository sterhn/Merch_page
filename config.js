/* Site settings. Everything you'd want to change without touching app.js. */
window.CONFIG = {
  /* Supabase project (Settings → API). The anon key is public by design:
     every visitor's browser receives it. Row-level security keeps the private
     tables (items, orders, expenses…) empty for it; it only sees the
     public_stock view and the fandoms table. Never put the service_role key
     here. */
  supabaseUrl: 'https://yqdlhqvifkbhwkkxrkcu.supabase.co',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxZGxocXZpZmtiaHdra3hya2N1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExMDM2NzksImV4cCI6MjA5NjY3OTY3OX0.Yt0sdLmEafEMHAAoLI9fqohhKCr6rCYN2H4dKGPp3M8',

  /* Where the header button and the order buttons lead. Neither link type
     supports pre-filled text, so the order buttons copy the order first. */
  links: {
    telegram: 'https://t.me/hehearse_exe',
    'telegram-order': 'https://t.me/hehearse_exe?direct',
    'vk-order': 'https://vk.me/hehehearyou',
  },

  /* Label for items that have no fandom set */
  otherFandom: 'Другое',

  /* localStorage key the cart is saved under */
  cartKey: 'hehearse_cart',

  /* Colours handed out to fandoms that have no colour in the fandoms table */
  palette: ['#4a8f8f', '#a3854e', '#a64b6b', '#7b6ba4', '#5a8a6e', '#5aa0a0'],

  /* Used only until supabase/fandoms.sql has been run (or if that request
     fails): the same titles, icons and colours the table is seeded with. */
  fallbackFandoms: [
    { name: '[GSGW]', title_en: 'got dropped into a ghost story, still gotta work', title_ru: 'даже если попадёшь в историю о призраках, всё равно придётся идти на работу', icon: 'cat', color: '#4a8f8f', sort_order: 10 },
    { name: '[MSCH]', title_en: 'my s-class hunters', title_ru: 'воспитанные мной s-классы', icon: 'flower', color: '#a3854e', sort_order: 20 },
    { name: '[OC]', title_en: 'original characters', title_ru: 'оригинальные персонажи', icon: 'swirl', color: '#a64b6b', sort_order: 30 },
    { name: '[ORV]', title_en: "omniscient reader's viewpoint", title_ru: 'всеведущий читатель', icon: 'sparkle', color: '#7b6ba4', sort_order: 40 },
  ],
}
