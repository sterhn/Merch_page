// End-to-end smoke tests: the page loads, filters, opens an item and builds
// an order. Supabase is mocked with the fixtures below, so the tests don't
// depend on what's in stock today.
const { test, expect } = require('@playwright/test')

const ITEMS = [
  { id: 'a1', fandom: '[ORV]', type: 'значок', name: 'Значок Кима', image_url: null, product_photo_url: null, sale_price: 250, stock_qty: 3, description: 'Круглый, 58 мм' },
  { id: 'a2', fandom: '[ORV]', type: 'брелок', name: 'Брелок без цены', image_url: null, product_photo_url: null, sale_price: null, stock_qty: 2, description: null },
  { id: 'a3', fandom: '[ORV]', type: 'брелок', name: 'Распроданный брелок', image_url: null, product_photo_url: null, sale_price: 400, stock_qty: 0, description: null },
  { id: 'b1', fandom: '[MSCH]', type: 'карточка', name: 'Карточка', image_url: 'https://example.invalid/dead.webp', product_photo_url: null, sale_price: 100, stock_qty: 5, description: null },
  { id: 'c1', fandom: '[NEW]', type: 'стикеры', name: 'Новый стикер', image_url: null, product_photo_url: null, sale_price: 150, stock_qty: 1, description: null },
  { id: 'd1', fandom: null, type: 'лента', name: 'Без фандома', image_url: null, product_photo_url: null, sale_price: 50, stock_qty: 4, description: null },
]

const FANDOMS = [
  { name: '[ORV]', title_en: "omniscient reader's viewpoint", title_ru: 'всеведущий читатель', icon: 'sparkle', color: '#7b6ba4', sort_order: 30 },
  { name: '[MSCH]', title_en: 'my s-class hunters', title_ru: 'воспитанные мной s-классы', icon: 'flower', color: '#a3854e', sort_order: 20 },
]

const json = (body, status = 200) => ({ status, contentType: 'application/json', body: JSON.stringify(body) })

async function mockSupabase(page, { items = ITEMS, fandoms = FANDOMS, itemsStatus = 200 } = {}) {
  await page.route('**/rest/v1/public_stock**', (r) =>
    r.fulfill(itemsStatus === 200 ? json(items) : json({ message: 'relation "public_stock" does not exist' }, itemsStatus)))
  await page.route('**/rest/v1/fandoms**', (r) =>
    r.fulfill(fandoms ? json(fandoms) : json({ code: 'PGRST205', message: "Could not find the table 'public.fandoms'" }, 404)))
  // Keep the run offline and fast
  await page.route(/fonts\.(googleapis|gstatic)\.com|example\.invalid/, (r) => r.abort())
}

/* Uncaught errors fail the test */
test.beforeEach(async ({ page }) => {
  page.on('pageerror', (e) => { throw e })
})

test('renders fandoms biggest-first, with their titles, icons and counts', async ({ page }) => {
  await mockSupabase(page)
  await page.goto('/')

  // Most items first even though [ORV] has the larger sort_order; ties
  // ([MSCH] vs [NEW]) fall back to sort_order; no fandom is always last
  const buttons = page.locator('.fandom-btn')
  await expect(buttons).toHaveText([/\[ORV\]\s*3/, /\[MSCH\]\s*1/, /\[NEW\]\s*1/, /Другое\s*1/])
  // Every button is the same size, whatever its count
  const sizes = await buttons.evaluateAll((els) => els.map((e) => getComputedStyle(e).fontSize))
  expect(new Set(sizes).size).toBe(1)
  await expect(page.locator('.fandom-group h2')).toHaveText(['[ORV]', '[MSCH]', '[NEW]', 'Другое'])
  await expect(page.locator('.fandom-en').first()).toHaveText("omniscient reader's viewpoint")
  await expect(buttons.nth(1).locator('use')).toHaveAttribute('href', 'assets/icons/sprite.svg#i-flower')
  // Colour from the table, not from position
  await expect(buttons.nth(1)).toHaveAttribute('style', /--fc:#a3854e/)

  // Sold-out sorts last in its group and is stamped; no price reads "по запросу"
  const orvCards = page.locator('.fandom-group').first().locator('.card')
  await expect(orvCards.last()).toHaveClass(/sold-out/)
  await expect(page.locator('.card', { hasText: 'Брелок без цены' }).locator('.card-price')).toHaveText('цена по запросу')

  // A dead image URL falls back to the fandom icon
  await expect(page.locator('.card', { hasText: 'Карточка' }).locator('.card-img .ph')).toBeVisible()
})

test('the icon sprite has every icon the page and config use', async ({ request }) => {
  const svg = await (await request.get('/assets/icons/sprite.svg')).text()
  for (const id of ['sparkle', 'cat', 'flower', 'swirl', 'telegram', 'vk']) {
    expect(svg).toContain(`id="i-${id}"`)
  }
})

test('falls back to config.js fandom info before fandoms.sql is run', async ({ page }) => {
  await mockSupabase(page, { fandoms: null })
  await page.goto('/')
  await expect(page.locator('.fandom-group h2').first()).toHaveText('[ORV]')
  await expect(page.locator('.fandom-ru').first()).toHaveText('всеведущий читатель')
})

test('filters by fandom, type and stock, and resets', async ({ page }) => {
  await mockSupabase(page)
  await page.goto('/')
  await page.locator('.fandom-btn', { hasText: '[ORV]' }).click()
  await expect(page.locator('.card')).toHaveCount(3)
  await page.locator('.chip', { hasText: 'В наличии' }).click()
  await expect(page.locator('.card')).toHaveCount(2)
  await page.locator('.chip', { hasText: 'значок' }).click()
  await expect(page.locator('.card')).toHaveCount(1)
  await page.locator('.chip', { hasText: 'карточка' }).click()
  await page.locator('[data-act="reset"]').click()
  await expect(page.locator('.card')).toHaveCount(ITEMS.length)
})

test('detail view opens from a card and Escape closes it without leaving the site', async ({ page }) => {
  await mockSupabase(page)
  await page.goto('/')
  await page.locator('.card-img[data-id="a1"]').click()
  await expect(page.locator('#detail-overlay')).toHaveClass(/open/)
  await expect(page.locator('#detail-name')).toHaveText('Значок Кима')
  await expect(page).toHaveURL(/#item=a1$/)

  await page.keyboard.press('Escape')
  await expect(page.locator('#detail-overlay')).not.toHaveClass(/open/)
  await expect(page).toHaveURL(/\/$/)
  await expect(page.locator('.fandom-btn').first()).toBeVisible()
})

test('a #item= link opens that item', async ({ page }) => {
  await mockSupabase(page)
  await page.goto('/#item=b1')
  await expect(page.locator('#detail-name')).toHaveText('Карточка')
})

test('cart: stock cap, partial total and the copied order text', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await mockSupabase(page)
  await page.goto('/')

  const add = (id) => page.locator(`.add-btn[data-id="${id}"]`).click()
  await add('c1')
  await add('c1') // only 1 in stock
  await expect(page.locator('#toast')).toContainText('доступно 1 шт.')
  await add('a1')
  await add('a2') // no price
  await expect(page.locator('#cart-bar')).toHaveClass(/visible/)
  await expect(page.locator('#cart-count')).toHaveText('3')
  await expect(page.locator('#cart-bar-total')).toHaveText(/400\s₽ \+/)

  await page.locator('.cart-bar-inner').click()
  await expect(page.locator('#cart-panel')).toHaveClass(/open/)
  await expect(page.locator('#cart-total-note')).toBeVisible()
  await expect(page.locator('#send-order')).toHaveAttribute('href', 'https://t.me/hehearse_exe?direct')

  await page.locator('#copy-btn').click()
  await expect(page.locator('#copy-btn')).toHaveText('Скопировано!')
  const text = await page.evaluate(() => navigator.clipboard.readText())
  expect(text).toContain('• Новый стикер (стикеры) × 1 — 150')
  expect(text).toContain('• Брелок без цены (брелок) × 1 — цена по запросу')
  expect(text).toMatch(/Итого: 400\s₽ \+ позиции с ценой по запросу/)
  const payload = JSON.parse(text.split('import:')[1])
  expect(payload.map((p) => p.id).sort()).toEqual(['a1', 'a2', 'c1'])

  // The cart survives a reload
  await page.reload()
  await expect(page.locator('#cart-count')).toHaveText('3')
})

test('shows a readable error when the catalog fails to load', async ({ page }) => {
  await mockSupabase(page, { itemsStatus: 404 })
  await page.goto('/')
  await expect(page.locator('#status')).toContainText('Не удалось загрузить: relation "public_stock" does not exist')
  await expect(page.locator('#list .sk')).toHaveCount(0)
})
