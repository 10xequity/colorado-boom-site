# Deploying / Updating Colorado Boom on GitHub Pages

This is a plain static site (HTML/CSS/JS, no build step) hosted free on **GitHub Pages**.
The site is **already live at coloradoboom.com** (served from this GitHub repo; the old Wix
build was abandoned). This doc covers how the hosting is set up and how to push updates.

---

## Repo layout
Everything lives at the repo **root** (not inside a `cobo-site/` subfolder):

```
index.html              <- home page (must stay named index.html, at the root)
tryouts.html  club.html  girls-club.html  boys-club.html  programs.html
coaching-staff.html  parent-resources.html  volleyball-rules.html
volleyball-positions.html  legal.html
.nojekyll               <- tells GitHub "don't run Jekyll" (keep this file)
robots.txt   sitemap.xml   CNAME
assets/
  css/styles.css
  js/main.js
  img/  (logo.png, hero.jpg, girls.jpg, boys.jpg, club.jpg, programs.jpg,
         developmental.jpg, camps.jpg, why-boom.jpg, boys-action.jpg, etc.)
```

---

## Push an update (web, no Git)
1. In the repo, open the file you want to change, click the **pencil (Edit)** icon, edit,
   then **Commit changes**. Pages redeploys automatically in ~1 minute.
2. To replace an image: open `assets/img`, delete the old file, **Add file -> Upload files**
   with the **same filename**.
3. **From a new batch (zip) from Claude:** unzip, then **Add file -> Upload files** and drag
   in the contents. GitHub overwrites changed files. After committing:
   - Confirm `index.html` is at the repo **root**.
   - Confirm **`.nojekyll`** is present (some OSes hide dotfiles on upload — if missing,
     **Add file -> Create new file**, name it `.nojekyll`, leave empty, commit).

### Git command line (alternative)
```bash
cd path/to/repo
git add .
git commit -m "update"
git push
```

---

## Hosting settings (already configured — for reference)
- **Settings -> Pages -> Source:** Deploy from a branch, **main**, **/(root)**.
- **Custom domain:** `CNAME` file contains `coloradoboom.com`; DNS points the apex (and
  `www`) at GitHub Pages. **Enforce HTTPS** is enabled.
- If you ever move DNS, GitHub Pages apex A records are
  `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
  (plus GitHub's AAAA IPv6 records), and `www` is a CNAME to `YOURUSERNAME.github.io`.

---

## Status of the old pre-launch checklist
- **noindex:** removed — the site is indexable. (Nothing to do.)
- **robots.txt / sitemap.xml:** present at the root; sitemap lists all 11 pages including
  `legal.html`. Still TODO (off-page): submit the sitemap in Google Search Console + Bing
  Webmaster Tools.
- **Legal links:** Terms/Privacy/Accessibility now point to `legal.html#…` on every page
  (no longer `#` placeholders). Copy is boilerplate pending counsel review.
- **Instagram feed:** live via a **Behold** widget in `[HM-06]` (OAuth on the Behold
  dashboard; no credentials in code). If blank, check the Behold dashboard's allowed
  domains (`coloradoboom.com` + `www.coloradoboom.com`) and source connection.
- **Real photos:** swap any placeholder/AI images for real team/facility photos — keep the
  same filenames in `assets/img/` and the pages pick them up automatically.
- **Still open (dashboards, not code):** Google Business Profile, Cloudflare security
  headers + cookieless analytics.

---

## Quick troubleshooting
- **404 at the URL:** `index.html` isn't at the repo root, or Pages source is misset.
- **Page loads but no CSS/images:** `assets/` structure broke on upload, or `.nojekyll` missing.
- **Old version still showing:** hard refresh (Ctrl/Cmd+Shift+R); GitHub CDN caches briefly.
- **HTTPS warning on the domain:** wait for the cert, then ensure "Enforce HTTPS" is ticked.
