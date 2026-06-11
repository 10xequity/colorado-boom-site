# Colorado Boom Volleyball Club — Website

Static site (plain HTML/CSS/JS, no build step) hosted on **GitHub Pages** at
**coloradoboom.com**. (An earlier Wix build was abandoned — GitHub Pages is the live site.)

## Files
- 11 pages: `index.html`, `tryouts.html`, `club.html`, `girls-club.html`, `boys-club.html`,
  `programs.html`, `coaching-staff.html`, `parent-resources.html`, `volleyball-rules.html`,
  `volleyball-positions.html`, `legal.html`
- `assets/css/styles.css` — all styling (shared)
- `assets/js/main.js` — nav, scroll reveal, FAQ accordion (shared)
- `assets/img/` — image library (see `IMAGES.md`)
- `robots.txt`, `sitemap.xml` — SEO (sitemap lists all 11 pages)
- `CNAME` — custom domain (`coloradoboom.com`)
- `.nojekyll` — tells GitHub Pages to serve files as-is (keep this dotfile)
- `EDITING_GUIDE.md`, `DEPLOY_GITHUB.md`, `IMAGES.md` — reference docs

## Update the live site
- **Web:** open any file on github.com, click the **pencil (Edit)** icon, make changes,
  **Commit**. Pages redeploys automatically in under a minute.
- **From a new batch:** unzip and re-upload the contents to the repo root; GitHub overwrites
  changed files. Confirm `.nojekyll` is present after upload (some OSes hide dotfiles).

## Replace / add photos
Upload a file into `assets/img/` with the **exact same filename** (case-sensitive) as in `IMAGES.md`.

## SEO status
On-page SEO is in place: unique title + description, canonical, OG/Twitter/geo meta, and
JSON-LD on every page; `robots.txt` + `sitemap.xml` at the root. Still open (off-page,
done in dashboards, not in code): submit the sitemap to Google Search Console + Bing
Webmaster Tools, create/claim the Google Business Profile, add security headers + cookieless
analytics via Cloudflare, and replace any AI-placeholder images with real photos.

## Notes
- No `noindex` remains — the site is indexable.
- The home Instagram feed uses a Behold widget (config on the Behold dashboard; no
  credentials in code). See `EDITING_GUIDE.md`.
- Legal pages (Privacy/Terms/Accessibility) are on `legal.html`; copy is boilerplate
  pending counsel review.
