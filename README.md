# LTE House — Website

Plain HTML/CSS/JS — no build step, no npm install. Open the folder in VS Code and go.

## Run it

1. Open the `lte-house` folder in VS Code.
2. Install the **Live Server** extension (Ritwick Dey) if you don't have it.
3. Right-click `index.html` → **Open with Live Server**.

(Opening `index.html` directly by double-clicking also works, but Live Server gives you auto-refresh while you edit.)

## Structure

```
lte-house/
├── index.html            Home
├── about.html             About + CEO spotlight section
├── certifications.html    Certifications
├── shop.html               Product grid + "add to quote"
├── bookings.html           Calendar/time-slot picker + booking form
├── contact.html             Contact form + FAQ
├── css/style.css           All styling — colors, type, layout live here
├── js/main.js               Nav toggle, quote cart, calendar, form handling
└── assets/
    ├── logo-icon.svg        The roofline + bulb mark, used in every header/footer
    └── images/               Empty — drop your real photos here (see below)
```

Every page shares the same header/footer markup — it's plain HTML so it's duplicated across files rather than one shared template. If you rename a nav link or add a page, update it in all six files (find-and-replace works well for this).

## Replacing the placeholder images

Every image spot on the site is currently a dashed-border box with a label, e.g.:

```html
<div class="ph" style="--ar:4/5;">
  <div class="ph-inner">
    Hero image — a home with panels installed
    <span class="ph-file">suggested file: assets/images/hero-home.jpg</span>
  </div>
</div>
```

To swap in a real photo, replace the whole `<div class="ph">...</div>` block with:

```html
<img src="assets/images/hero-home.jpg" alt="Describe the photo here">
```

Save your photo into `assets/images/` using the suggested filename (or whatever you like — just match the `src`). The `--ar` value on the placeholder tells you the aspect ratio the spot was designed for (e.g. `4/5` = portrait, `1/1` = square) — crop close to that ratio so layouts don't jump.

## Colors, fonts, spacing

Everything lives at the top of `css/style.css` under `:root`:

```css
--black:  #060607;   /* page background */
--gold:   #F5B301;   /* primary accent — from your logo */
--white:  #EDEDE7;   /* body text */
```

Change these and the whole site updates — buttons, links, the animated roofline divider, everything references these variables.

## The forms (Bookings + Contact)

Both forms currently only show a "success" message on submit — they don't send anywhere yet. To make them real, either:

- **Quick option:** point the `<form>` at a service like Formspree or Netlify Forms (add their `action`/`data-*` attributes per their docs), or
- **Full option:** replace the `data-fake-submit` handling in `js/main.js` with a `fetch()` call to your own backend/API.

## Shop → quote flow

There's no payment processing here — "Add to quote" saves the item in the browser's `localStorage` and the count badge (bottom-right) links to the Bookings page, where the selected items show up next to the booking form. This is meant as a **quote-request** flow, not a checkout. If you want real online payments later, that needs a payment provider (Paystack/Flutterwave/Stripe) wired into a backend — happy to help with that when you're ready.

## Content still to fill in

Search each HTML file for `[Placeholder]` or bracketed text like `[CEO Full Name]`, `[Year]`, `[Certificate No. XXXXXX]` — those are the spots written specifically so you can find and replace your real details fast.

## Social links

The `IG` / `FB` / `X` / `IN` / `WA` circles in the footer (and on the Contact page) all currently point to `#`. Search for `aria-label="LTE House on` across the HTML files and swap each `href="#"` for your real profile URL.
