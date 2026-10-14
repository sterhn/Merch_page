/* The catalog page. Settings (Supabase project, contact links, fallback
   fandom info) live in config.js; styles in styles.css; icons in
   assets/icons/sprite.svg. */
const CONFIG = window.CONFIG || {}
const OTHER = CONFIG.otherFandom || 'Другое'
const PALETTE = CONFIG.palette || ['#5aa0a0']
const SPRITE = 'assets/icons/sprite.svg'
const CART_KEY = CONFIG.cartKey || 'hehearse_cart'

const $ = (id) => document.getElementById(id)
const status = $('status')

const showStatus = (text) => {
  status.textContent = text
  status.classList.remove('hidden')
}

const configured = !!(CONFIG.supabaseUrl && CONFIG.supabaseAnonKey)
if (!configured) {
  showStatus('Не настроено: укажите supabaseUrl и supabaseAnonKey в config.js (см. README).')
}

/* Contact links come from config.js so a handle change is a one-line edit */
for (const a of document.querySelectorAll('[data-link]')) {
  const href = CONFIG.links && CONFIG.links[a.dataset.link]
  if (href) a.href = href
}

/* Supabase's REST API, called directly: one GET doesn't need the 50 KB
   client library, and a blocked CDN can no longer take the page down. */
async function query(path) {
  const key = CONFIG.supabaseAnonKey
  const headers = { apikey: key }
  /* Legacy anon keys are JWTs and go in Authorization too; the newer
     sb_publishable_ keys must not. */
  if (key.startsWith('eyJ')) headers.Authorization = 'Bearer ' + key
  const res = await fetch(`${CONFIG.supabaseUrl}/rest/v1/${path}`, { headers })
  const body = await res.json().catch(() => null)
  if (!res.ok) throw new Error((body && body.message) || `HTTP ${res.status}`)
  return body
}

/* Toast: the order flow hinges on a clipboard copy the user can't see,
   and stock caps silently swallow taps — both need visible feedback. */
let toastTimer
function toast(text, kind) {
  const el = $('toast')
  el.textContent = text
  if (kind === 'ok') el.insertAdjacentHTML('beforeend', ' ' + icon('sparkle', 'orn'))
  el.className = 'toast show' + (kind ? ' ' + kind : '')
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { el.className = 'toast' + (kind ? ' ' + kind : '') }, 2600)
}

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

const rub = (n) => new Intl.NumberFormat('ru-RU').format(n) + ' ₽'
const hasPrice = (item) => item.sale_price != null
const ON_REQUEST = 'цена по запросу'

/* A hand-drawn icon from assets/icons/sprite.svg */
const icon = (name, cls, style) =>
  `<svg class="ico ${cls}" aria-hidden="true"${style ? ` style="${style}"` : ''}><use href="${SPRITE}#i-${esc(name)}"/></svg>`

let items = []
let itemById = new Map()
let cart = {}
let typeList = []
let typeFilter = null
let fandomList = []
let fandomFilter = null
let stockOnly = false
let firstRender = true

const fandomOf = (item) => item.fandom || OTHER
const stockOf = (item) => item.stock_qty ?? 0

/* Fandom info (titles, icon, colour, order) comes from the fandoms table,
   matched by the exact catalog label; see supabase/fandoms.sql. */
let fandomMeta = new Map()
const metaOf = (fandom) => fandomMeta.get(fandom) || {}
const fandomColor = (fandom) => metaOf(fandom).color || PALETTE[0]
/* A fandom without its own icon gets the site's sparkle */
const fandomIcon = (fandom) => metaOf(fandom).icon || 'sparkle'

/* Stable colour for a fandom with no row (or no colour) in the table: it
   comes from the name itself, so adding another fandom never repaints the
   existing ones. Colours already claimed in the table are skipped. */
function autoColor(name, taken) {
  const free = PALETTE.filter((c) => !taken.has(c.toLowerCase()))
  const pool = free.length ? free : PALETTE
  let h = 0
  for (const ch of name) h = (h * 31 + ch.codePointAt(0)) >>> 0
  return pool[h % pool.length]
}

function buildFandoms(rows) {
  const byName = new Map()
  for (const r of rows || []) if (r && r.name) byName.set(String(r.name).trim(), r)
  const taken = new Set([...byName.values()].map((r) => r.color && r.color.toLowerCase()).filter(Boolean))

  fandomMeta = new Map()
  for (const name of new Set(items.map(fandomOf))) {
    const r = byName.get(name) || {}
    fandomMeta.set(name, {
      title_en: r.title_en || '',
      title_ru: r.title_ru || '',
      icon: r.icon || 'sparkle',
      color: r.color || autoColor(name, taken),
      sort_order: r.sort_order ?? null,
    })
  }
  /* Table order first (sort_order), then the rest alphabetically, and
     items without a fandom at the very end */
  fandomList = [...fandomMeta.keys()].sort((a, b) => {
    if (a === OTHER || b === OTHER) return (a === OTHER) - (b === OTHER)
    const sa = fandomMeta.get(a).sort_order, sb = fandomMeta.get(b).sort_order
    if (sa != null && sb != null && sa !== sb) return sa - sb
    if ((sa != null) !== (sb != null)) return sa != null ? -1 : 1
    return a.localeCompare(b, 'ru')
  })
}

function loadCart() {
  try {
    const saved = localStorage.getItem(CART_KEY)
    if (saved) cart = JSON.parse(saved)
  } catch {}
}
/* Safari's private mode throws on setItem — losing persistence is fine,
   taking the whole "add to cart" click down with it is not. */
function saveCart() {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart))
  } catch {}
}

function addToCart(id) {
  const item = itemById.get(id)
  if (!item || stockOf(item) <= 0) return
  const max = stockOf(item)
  const before = cart[id] || 0
  cart[id] = Math.min(before + 1, max)
  saveCart()
  updateCartUI()
  updateAddBtn(id)
  if (cart[id] > before) {
    const badge = $('cart-count')
    badge.classList.remove('pulse')
    void badge.offsetWidth
    badge.classList.add('pulse')
  } else {
    toast(`Больше нет в наличии — доступно ${max} шт.`, 'warn')
  }
}

function updateAddBtn(id) {
  const sel = window.CSS && CSS.escape ? CSS.escape(id) : id
  const btn = document.querySelector(`.add-btn[data-id="${sel}"]`)
  if (!btn) return
  const qty = cart[id] || 0
  if (qty > 0) {
    btn.classList.add('in-cart')
    btn.textContent = qty
  } else {
    btn.classList.remove('in-cart')
    btn.textContent = '+'
  }
}

function setQty(id, qty) {
  const item = itemById.get(id)
  if (!item) return
  const max = stockOf(item)
  if (qty <= 0) {
    delete cart[id]
  } else {
    if (qty > max) toast(`Больше нет в наличии — доступно ${max} шт.`, 'warn')
    cart[id] = Math.min(qty, max)
  }
  saveCart()
  updateCartUI()
  updateAddBtn(id)
}

function clearCart() {
  const ids = Object.keys(cart)
  cart = {}
  saveCart()
  updateCartUI()
  ids.forEach(updateAddBtn)
  toggleCart()
}

function getCartItems() {
  return Object.entries(cart)
    .map(([id, qty]) => {
      const item = itemById.get(id)
      if (!item || qty <= 0) return null
      return { ...item, cartQty: qty }
    })
    .filter(Boolean)
}

/* Items without a price aren't counted, so the total says when it's partial */
function getCartTotal() {
  return getCartItems().reduce(
    (sum, i) => sum + (i.sale_price || 0) * i.cartQty, 0)
}

const cartHasUnpriced = () => getCartItems().some((i) => !hasPrice(i))

function getCartCount() {
  return Object.values(cart).reduce((s, q) => s + q, 0)
}

function buildTgMessage() {
  const ci = getCartItems()
  if (!ci.length) return ''
  let msg = 'Привет! Хочу заказать:\n\n'
  for (const i of ci) {
    const line = `• ${i.name}`
      + (i.type ? ` (${i.type})` : '')
      + ` × ${i.cartQty}`
      + (i.sale_price ? ` — ${rub(i.sale_price * i.cartQty)}` : '')
      + (hasPrice(i) ? '' : ` — ${ON_REQUEST}`)
    msg += line + '\n'
  }
  msg += `\nИтого: ${rub(getCartTotal())}`
  if (cartHasUnpriced()) msg += ` + позиции с ценой по запросу`
  msg += '\n\n---\n'
  const data = ci.map((i) => ({
    id: i.id,
    name: i.name,
    type: i.type,
    qty: i.cartQty,
    price: i.sale_price,
  }))
  msg += 'import:' + JSON.stringify(data)
  return msg
}

const plural = (n, one, few, many) => {
  const m10 = n % 10, m100 = n % 100
  if (m10 === 1 && m100 !== 11) return one
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few
  return many
}

function updateCartUI() {
  const count = getCartCount()
  const total = getCartTotal()
  const partial = cartHasUnpriced()
  $('cart-count').textContent = count
  $('cart-bar-total').textContent = rub(total) + (partial ? ' +' : '')
  $('cart-bar').classList.toggle('visible', count > 0)
  $('cart-live').textContent = count
    ? `В корзине ${count} ${plural(count, 'товар', 'товара', 'товаров')} на ${rub(total)}`
      + (partial ? ', часть — по запросу' : '')
    : ''

  const ci = getCartItems()
  if (!ci.length) {
    $('cart-items').innerHTML = '<div class="cart-empty">Корзина пуста</div>'
    $('cart-footer').classList.add('hidden')
    return
  }

  $('cart-footer').classList.remove('hidden')
  $('cart-total').textContent = rub(total)
  $('cart-total-note').classList.toggle('hidden', !partial)

  let html = ''
  for (const i of ci) {
    const fandom = fandomOf(i)
    const color = fandomColor(fandom)
    const thumb = i.image_url || i.product_photo_url
    const fIcon = fandomIcon(fandom)
    html += `<div class="cart-item">
      <div class="thumb"${thumb ? '' : ` style="background:linear-gradient(135deg,${color}22,${color}08)"`}>
        ${thumb
          ? `<img src="${esc(thumb)}" alt="" loading="lazy" decoding="async" data-fallback="${fIcon}" data-fallback-color="${color}" />`
          : icon(fIcon, 'ph', `color:${color}`)}
      </div>
      <div class="info">
        <div class="name">${esc(i.name)}</div>
        ${i.type ? `<div class="type-tag">${esc(i.type)}</div>` : ''}
        <div class="cart-price${hasPrice(i) ? '' : ' on-request'}">${hasPrice(i) ? esc(rub(i.sale_price * i.cartQty)) : ON_REQUEST}</div>
      </div>
      <div class="qty-controls">
        <button type="button" class="qty-btn" data-act="qty" data-id="${esc(i.id)}" data-qty="${i.cartQty - 1}" aria-label="Убавить количество: ${esc(i.name)}">−</button>
        <span class="qty-val" aria-live="off">${i.cartQty}</span>
        <button type="button" class="qty-btn" data-act="qty" data-id="${esc(i.id)}" data-qty="${i.cartQty + 1}" aria-label="Добавить ещё: ${esc(i.name)}">+</button>
      </div>
    </div>`
  }
  $('cart-items').innerHTML = html
}

/* Overlay history: opening pushes a history entry, closing goes back,
   so the phone's back button closes the overlay instead of the page. */
let detailOpen = false
let cartOpen = false

/* history.back() is async: without this guard a second close call
   (a double-tap, or a held Escape) fires back() again and navigates out
   of the site. */
let overlayClosing = false
function closeOverlayViaBack() {
  if (overlayClosing) return
  overlayClosing = true
  history.back()
}

window.addEventListener('popstate', () => {
  overlayClosing = false
  if (detailOpen) hideDetail()
  else if (cartOpen) hideCart()
})
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && (detailOpen || cartOpen)) { closeOverlayViaBack(); return }
  if (e.key === 'Tab') trapFocus(e)
})

/* Modal plumbing: without this the overlays were only visually modal —
   everything behind them stayed tabbable, and focus never entered the
   dialog or came back to the card that opened it. */
const FOCUSABLE = 'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])'
let lastFocused = null

function setInert(el, on) {
  if (!el) return
  el.inert = on
  el.setAttribute('aria-hidden', on ? 'true' : 'false')
}

function applyInert() {
  const anyOpen = detailOpen || cartOpen
  setInert($('detail-overlay'), !detailOpen)
  setInert($('cart-panel'), !cartOpen)
  setInert(document.querySelector('.wrap'), anyOpen)
  setInert($('cart-bar'), anyOpen)
  document.body.classList.toggle('scroll-locked', anyOpen)
}

function dialogRoot() {
  return detailOpen ? $('detail-card') : cartOpen ? $('cart-panel') : null
}

/* Fallback for browsers without `inert` — keeps Tab inside the dialog */
function trapFocus(e) {
  const root = dialogRoot()
  if (!root) return
  const f = [...root.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null)
  if (!f.length) return
  const first = f[0], last = f[f.length - 1]
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
}

function focusDialog() {
  const root = dialogRoot()
  if (!root) return
  const target = root.querySelector(FOCUSABLE)
  if (target) target.focus()
}

function restoreFocus() {
  if (lastFocused && document.contains(lastFocused)) lastFocused.focus()
  lastFocused = null
}

function openDetail(id) {
  const item = itemById.get(id)
  if (!item) return
  const fandom = fandomOf(item)
  const color = fandomColor(fandom)
  const soldOut = stockOf(item) <= 0
  const inCart = cart[item.id] > 0

  /* Prefer the real product photo in the detail view; fall back to the catalog art */
  const detailPhoto = item.product_photo_url || item.image_url
  const fIcon = fandomIcon(fandom)
  const imgHtml = (detailPhoto
    ? `<img src="${esc(detailPhoto)}" alt="${esc(item.name)}" data-fallback="${fIcon}" data-fallback-color="${color}" />`
    : icon(fIcon, 'ph', `color:${color}`))
    + (soldOut ? '<div class="stamp">Нет в наличии</div>' : '')
  $('detail-img').style.background = detailPhoto ? 'none' : `linear-gradient(135deg,${color}22,${color}08)`
  $('detail-img').classList.toggle('sold', soldOut)
  $('detail-img').innerHTML = imgHtml

  let info = ''
  if (item.type) info += `<div class="detail-type" style="color:${color}">${esc(item.type)}</div>`
  if (item.fandom) info += `<div class="detail-fandom">${esc(item.fandom)}</div>`
  info += `<h2 class="detail-name" id="detail-name">${esc(item.name)}</h2>`
  if (item.description) info += `<div class="detail-desc">${esc(item.description)}</div>`
  info += `<div class="detail-bottom">`
  info += hasPrice(item)
    ? `<span class="detail-price">${esc(rub(item.sale_price))}</span>`
    : `<span class="detail-price on-request">${ON_REQUEST}</span>`
  if (soldOut) {
    info += `<span class="detail-sold">Нет в наличии</span>`
  } else {
    info += `<button type="button" class="detail-add${inCart ? ' in-cart' : ''}" data-act="detail-add" data-id="${esc(item.id)}">${inCart ? 'В корзине: ' + cart[item.id] : 'В корзину'}</button>`
  }
  info += '</div>'
  $('detail-info').innerHTML = info

  const wasOpen = detailOpen
  if (!wasOpen) {
    lastFocused = document.activeElement
    detailOpen = true
    overlayClosing = false
    history.pushState({ overlay: 'detail' }, '', '#item=' + encodeURIComponent(item.id))
  }
  $('detail-overlay').classList.add('open')
  applyInert()
  if (!wasOpen) focusDialog()
}

function hideDetail() {
  detailOpen = false
  $('detail-overlay').classList.remove('open')
  applyInert()
  restoreFocus()
}

function closeDetail() {
  if (detailOpen) closeOverlayViaBack()
}

function openCart() {
  lastFocused = document.activeElement
  cartOpen = true
  overlayClosing = false
  history.pushState({ overlay: 'cart' }, '')
  $('cart-overlay').classList.add('open')
  $('cart-panel').classList.add('open')
  applyInert()
  focusDialog()
}

function hideCart() {
  cartOpen = false
  $('cart-overlay').classList.remove('open')
  $('cart-panel').classList.remove('open')
  applyInert()
  restoreFocus()
}

function toggleCart() {
  if (cartOpen) closeOverlayViaBack()
  else openCart()
}

/* Neither Telegram channel DMs (t.me/...?direct) nor vk.me support
   pre-filled text in the link, so every order button copies the message
   (with the import: payload) to the clipboard instead. */
/* In-app browsers (Telegram, VK) often refuse the async Clipboard API, and
   the link navigates away regardless — so fall back to execCommand and
   always tell the user which of the two happened. */
function legacyCopy(text) {
  const ta = document.createElement('textarea')
  ta.value = text
  ta.setAttribute('readonly', '')
  ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none'
  document.body.appendChild(ta)
  ta.select()
  ta.setSelectionRange(0, text.length)
  let ok = false
  try { ok = document.execCommand('copy') } catch { ok = false }
  ta.remove()
  return ok
}

function onCopied() {
  const btn = $('copy-btn')
  btn.textContent = 'Скопировано!'
  btn.classList.add('copied')
  setTimeout(() => { btn.textContent = 'Копировать текст'; btn.classList.remove('copied') }, 2000)
  toast('Текст заказа скопирован — вставьте его в чат', 'ok')
}

function onCopyFailed() {
  toast('Не удалось скопировать автоматически. Откройте «Копировать текст» и скопируйте вручную.', 'warn')
}

function copyOrder() {
  const msg = buildTgMessage()
  if (!msg) return
  const fallback = () => { if (legacyCopy(msg)) onCopied(); else onCopyFailed() }
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(msg).then(onCopied).catch(fallback)
  } else {
    fallback()
  }
}

function setFandomFilter(idx) {
  const name = fandomList[idx]
  fandomFilter = fandomFilter === name ? null : name
  renderFandomChips()
  render()
}

function renderFandomChips() {
  /* Title size scales with how many items the fandom has (largest = 1.35rem,
     smallest = 1rem) — the buttons themselves stay equal for easy tapping. */
  const counts = new Map()
  for (const it of items) {
    const key = fandomOf(it)
    counts.set(key, (counts.get(key) || 0) + 1)
  }
  const maxCount = Math.max(1, ...counts.values())
  let html = ''
  fandomList.forEach((f, i) => {
    const n = counts.get(f) || 0
    const fs = (1 + 0.35 * (n / maxCount)).toFixed(3)
    const on = fandomFilter === f
    html += `<button type="button" class="fandom-btn${on ? ' active' : ''}" style="--fc:${fandomColor(f)};--fs:${fs}rem" data-act="fandom" data-idx="${i}" aria-pressed="${on}">
      ${icon(fandomIcon(f), 'orn')}${esc(f)}<span class="cnt">${n}<span class="sr-only"> ${plural(n, 'товар', 'товара', 'товаров')}</span></span>
    </button>`
  })
  const wrap = $('fandoms')
  wrap.innerHTML = html
  wrap.classList.toggle('has-active', !!fandomFilter)
  wrap.classList.remove('hidden')
}

function setTypeFilter(idx) {
  typeFilter = idx < 0 ? null : typeList[idx]
  renderChips()
  render()
}

function toggleStockOnly() {
  stockOnly = !stockOnly
  renderChips()
  render()
}

function renderChips() {
  let html = `<button type="button" class="chip${!typeFilter ? ' active' : ''}" data-act="type" data-idx="-1" aria-pressed="${!typeFilter}">Все</button>`
  typeList.forEach((t, i) => {
    const on = typeFilter === t
    html += `<button type="button" class="chip${on ? ' active' : ''}" data-act="type" data-idx="${i}" aria-pressed="${on}">${esc(t)}</button>`
  })
  html += `<button type="button" class="chip chip-stock${stockOnly ? ' active' : ''}" data-act="stock" aria-pressed="${stockOnly}">В наличии</button>`
  $('chips').innerHTML = html
  $('chips').classList.remove('hidden')
}

function renderSkeleton() {
  let cards = ''
  for (let i = 0; i < 6; i++) cards += '<div class="sk sk-card"></div>'
  const list = $('list')
  list.setAttribute('aria-busy', 'true')
  list.innerHTML = `<div class="fandom-group">
    <div class="sk sk-header"></div>
    <div class="card-grid">${cards}</div>
  </div>`
}

function render() {
  let visible = items
  if (fandomFilter) visible = visible.filter((i) => fandomOf(i) === fandomFilter)
  if (typeFilter) visible = visible.filter((i) => i.type === typeFilter)
  if (stockOnly) visible = visible.filter((i) => stockOf(i) > 0)

  // Single visible fandom → the whole page takes on its color
  const visibleFandoms = new Set(visible.map(fandomOf))
  if (visibleFandoms.size === 1) {
    document.documentElement.style.setProperty(
      '--page-accent', fandomColor([...visibleFandoms][0]))
  } else {
    document.documentElement.style.removeProperty('--page-accent')
  }

  /* Groups follow fandomList, i.e. the order set in the fandoms table */
  const groups = new Map(fandomList.map((f) => [f, []]))
  for (const i of visible) groups.get(fandomOf(i)).push(i)

  const animate = firstRender
  firstRender = false

  let html = ''
  let groupIdx = 0
  for (const [fandom, list] of groups) {
    if (!list.length) continue
    const color = fandomColor(fandom)
    const groupDelay = animate ? groupIdx * 100 : 0
    const fadeCls = animate ? ' fade-in' : ''
    const sorted = [
      ...list.filter((i) => stockOf(i) > 0),
      ...list.filter((i) => stockOf(i) <= 0),
    ]
    const meta = metaOf(fandom)
    const fIcon = fandomIcon(fandom)
    html += `<div class="fandom-group${fadeCls}"${animate ? ` style="animation-delay:${groupDelay}ms"` : ''}>
      <div class="fandom-header" style="border-bottom:1px solid ${color}33">
        ${icon(fIcon, 'orn', `color:${color}`)}
        <h2>${esc(fandom)}</h2>
        <div class="line" style="background:linear-gradient(to right,${color}33,transparent)"></div>
      </div>
      ${meta.title_en || meta.title_ru ? `<div class="fandom-full">
        ${meta.title_en ? `<div class="fandom-en">${esc(meta.title_en)}</div>` : ''}
        ${meta.title_ru ? `<div class="fandom-ru">${esc(meta.title_ru)}</div>` : ''}
      </div>` : ''}
      <div class="card-grid">`

    for (let i = 0; i < sorted.length; i++) {
      const item = sorted[i]
      const qty = stockOf(item)
      const soldOut = qty <= 0
      const inCart = cart[item.id] > 0
      const delay = animate ? i * 60 : 0
      const img = item.image_url
        ? `<img src="${esc(item.image_url)}" alt="${esc(item.name)}" loading="lazy" decoding="async" data-fallback="${fIcon}" data-fallback-color="${color}" />`
        : icon(fIcon, 'ph', `color:${color}`)
      const addBtn = !soldOut
        ? `<button type="button" class="add-btn${inCart ? ' in-cart' : ''}" data-act="add" data-id="${esc(item.id)}" aria-label="Добавить в корзину: ${esc(item.name)}">${inCart ? cart[item.id] : '+'}</button>`
        : ''

      html += `<div class="card${fadeCls}${soldOut ? ' sold-out' : ''}" style="--fc:${color}${animate ? `;animation-delay:${groupDelay + delay}ms` : ''}">
        <button type="button" class="card-img" data-act="detail" data-id="${esc(item.id)}" aria-label="Подробнее: ${esc(item.name)}" aria-haspopup="dialog" style="background:${item.image_url ? 'none' : `linear-gradient(135deg,${color}22,${color}08)`}">
          ${img}
          <span class="card-idx" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
          ${soldOut ? '<span class="stamp">Нет в наличии</span>' : `<span class="stock-badge in-stock">${qty} шт.</span>`}
        </button>
        <div class="card-info">
          ${item.type ? `<div class="card-type" style="color:${color}">${esc(item.type)}</div>` : ''}
          <div class="card-name">${esc(item.name)}</div>
          <div class="card-bottom">
            ${hasPrice(item) ? `<span class="card-price">${esc(rub(item.sale_price))}</span>` : `<span class="card-price on-request">${ON_REQUEST}</span>`}
            ${addBtn}
          </div>
        </div>
      </div>`
    }

    html += '</div></div>'
    groupIdx++
  }

  if (!html) {
    const filtered = fandomFilter || typeFilter || stockOnly
    html = `<div class="empty-state">
      <p class="status">Ничего не найдено.</p>
      ${filtered ? '<button type="button" class="reset-btn" data-act="reset">Сбросить фильтры</button>' : ''}
    </div>`
  }
  $('list').innerHTML = html
  $('list').removeAttribute('aria-busy')
}

function resetFilters() {
  fandomFilter = null
  typeFilter = null
  stockOnly = false
  renderFandomChips()
  renderChips()
  render()
}

/* One delegated listener for every button on the page, rendered or static —
   ids never have to survive an inline onclick attribute. */
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-act]')
  if (!el) return
  const id = el.dataset.id
  switch (el.dataset.act) {
    case 'add': addToCart(id); break
    case 'qty': setQty(id, Number(el.dataset.qty)); break
    case 'detail': openDetail(id); break
    case 'detail-add':
      addToCart(id)
      openDetail(id)
      /* openDetail re-renders the panel, so re-focus the button we clicked */
      $('detail-info').querySelector('.detail-add')?.focus()
      break
    case 'close-detail': closeDetail(); break
    /* Only a click on the dimmed backdrop itself, not inside the card */
    case 'detail-backdrop': if (e.target === el) closeDetail(); break
    case 'toggle-cart': toggleCart(); break
    /* The order links still open the chat; the copy happens on the way out */
    case 'order': copyOrder(); break
    case 'copy': copyOrder(); break
    case 'clear': clearCart(); break
    case 'fandom': setFandomFilter(Number(el.dataset.idx)); break
    case 'type': setTypeFilter(Number(el.dataset.idx)); break
    case 'stock': toggleStockOnly(); break
    case 'reset': resetFilters(); break
  }
})

/* A dead image URL used to leave a broken-image icon in the card */
document.addEventListener('error', (e) => {
  const img = e.target
  if (img.tagName !== 'IMG' || !img.dataset.fallback) return
  const color = img.dataset.fallbackColor || PALETTE[0]
  const box = img.parentElement
  if (box) box.style.background = `linear-gradient(135deg,${color}22,${color}08)`
  img.insertAdjacentHTML('afterend', icon(img.dataset.fallback, 'ph', `color:${esc(color)}`))
  img.remove()
}, true)

async function loadItems() {
  renderSkeleton()
  let data, fandomRows
  try {
    [data, fandomRows] = await Promise.all([
      /* '*' so the page keeps working whether or not the view already exposes
         newer columns like product_photo_url (see supabase/public_stock_view.sql) */
      query('public_stock?select=*&order=name.asc'),
      /* Until supabase/fandoms.sql has been run this fails — use the copy in config.js */
      query('fandoms?select=*').catch((e) => {
        console.info('fandoms table unavailable, using config.js fallback:', e.message)
        return CONFIG.fallbackFandoms
      }),
    ])
  } catch (e) {
    /* A dropped connection rejects too, and used to leave the skeleton
       spinning forever. */
    $('list').innerHTML = ''
    $('list').removeAttribute('aria-busy')
    showStatus(
      'Не удалось загрузить: ' + (e && e.message ? e.message : 'нет соединения') +
      ' — если ошибка про "public_stock", выполните supabase/public_stock_view.sql в SQL Editor Supabase (см. README).')
    return
  }
  items = data || []
  itemById = new Map(items.map((i) => [i.id, i]))
  buildFandoms(fandomRows)
  typeList = [...new Set(items.map((i) => i.type).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, 'ru'))
  loadCart()
  Object.keys(cart).forEach((id) => {
    const item = itemById.get(id)
    const max = item ? stockOf(item) : 0
    if (max <= 0) delete cart[id]
    else cart[id] = Math.min(cart[id], max)
  })
  saveCart()
  renderFandomChips()
  renderChips()
  render()
  updateCartUI()

  // Deep link: #item=<id> opens that item's detail view
  const hash = location.hash.match(/^#item=(.+)$/)
  if (hash) {
    const id = decodeURIComponent(hash[1])
    if (itemById.has(id)) {
      history.replaceState(null, '', location.pathname + location.search)
      openDetail(id)
    }
  }
}

applyInert()
if (configured) {
  loadItems()
}
