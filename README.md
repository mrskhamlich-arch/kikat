# Nekkat Universe — Landing (static)

Files added:

- `index.html` — main landing page
- `styles.css` — styles and responsive rules


How to view locally:

Option A — Serve static only (quick):

1. Open `index.html` directly in your browser (fonts may load differently).

Option B — Run the included server (recommended):

1. Install dependencies:

```bash
npm install
```

2. Start the server:

```bash
npm start
```

3. Open http://localhost:3000 in your browser.

Admin panel:

- Visit http://localhost:3000/admin to edit the live site. There is intentionally no button linking to `/admin` from the main page — access is by entering the URL directly.


What I built:

- A static landing page styled to match the provided screenshot: purple gradient background with a subtle diamond pattern, a glowing stacked title, large rounded dark cards, social icons, and pill-shaped navigation buttons.

Next steps I can do:

- Add your real logo image and social links
- Tweak fonts, sizes, and exact colors
- Export as a ready-to-deploy package (ZIP) or add simple animations

Admin access note:

- If you have an admin panel, place its files under an `/admin` path on your server. There is intentionally no visible button or link to the admin panel from the site — access is via the `/admin` URL only.

