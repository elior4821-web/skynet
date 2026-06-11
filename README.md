# Arelio — Shopify Online Store 2.0 sections (Dawn-based)

Editable, theme-editor-driven sections converted from the original one-page
Arelio landing page. All CSS is scoped under `.arelio` so it cannot interfere
with the rest of the Dawn theme. The rotating pillow is 100% CSS (no video).

## Files and where they go in Shopify

In Shopify admin: **Online Store → Themes → (your Dawn theme) → ⋯ → Edit code**.

| File in this repo | Paste into this folder in the theme editor |
|---|---|
| `sections/arelio-hero.liquid` | `sections/` → **Add a new section** → name it `arelio-hero` |
| `sections/arelio-benefits.liquid` | `sections/` → `arelio-benefits` |
| `sections/arelio-product-info.liquid` | `sections/` → `arelio-product-info` |
| `sections/arelio-product-offers.liquid` | `sections/` → `arelio-product-offers` |
| `sections/arelio-reviews.liquid` | `sections/` → `arelio-reviews` |
| `sections/arelio-faq.liquid` | `sections/` → `arelio-faq` |
| `assets/arelio.css` | `assets/` → **Add a new asset** → `arelio.css` |
| `assets/arelio.js` | `assets/` → `arelio.js` |
| `templates/page.arelio.json` | `templates/` → **Add a new template** → type *page*, name `arelio` |

> When the code editor creates a section/asset/template it appends the file
> extension automatically — create `arelio-hero` (it becomes `arelio-hero.liquid`),
> `arelio` under templates as JSON, etc. Then paste the file contents.

## Build the page

1. Create a page: **Online Store → Pages → Add page** (title e.g. "Arelio").
2. In the page's **Theme template** dropdown choose **arelio**.
3. Open **Customize** for that page — every heading, button, benefit, offer,
   review and FAQ item is editable, and you can add/remove/reorder blocks.

Prefer this as your homepage instead? Copy `templates/page.arelio.json` to
`templates/index.json` (this **replaces** Dawn's default homepage), or just add
the six `Arelio …` sections to any page from **Customize → Add section**.

## Connect the offers to real products

Open the **Arelio Product Offers** section in Customize. For each offer block,
pick a **Shopify product**. Title, price and the **Add to Cart** button then use
live product data and add the variant to the real cart (AJAX, with a graceful
fallback to a normal `/cart/add` submit). Leave a block's product empty to keep
the manual title/price/description text instead.

## Notes

- `arelio.js` enhances Add to Cart and refreshes Dawn's cart bubble / opens the
  cart drawer when present. It is defensive and never throws if Dawn changes.
- Respects `prefers-reduced-motion` (pillow stops spinning for those users).
- Fully responsive: multi-column on desktop, single column under 900px.
