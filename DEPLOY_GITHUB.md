# Deploying / Updating Colorado Boom on GitHub Pages

**Version** 1.1 · **Updated** 2026-08-17 · **Status** Active
**Supersedes** v1 (branch name, page list, and Instagram details were wrong)

This is a plain static site (HTML/CSS/JS, no build step) hosted free on **GitHub Pages**.
The site is **already live at coloradoboom.com** (served from this GitHub repo; the old Wix
build was abandoned). This doc covers how the hosting is set up and how to push updates.

> **Two things that bite people:**
> 1. The deploy branch is **`Main` with a capital M**. Pushing to `main` creates a second
>    branch and deploys nothing.
> 2. **Cloudflare sits in front of GitHub Pages.** Pages cache for roughly 10 minutes, so a
>    change can be live on GitHub and not yet visible in a browser. Hard-refresh or wait.

---

## Repo layout
Everything lives at the repo **root** (not inside a `cobo-site/` subfolder):

```
index.html              <- home page (must stay named index.html, at the root)
tryouts.html  schedule.html  club.html  girls-club.html  boys-club.html
programs.html  coaching-staff.html  parent-resources.html
volleyball-rules.html  volleyball-positions.html  legal.html
                        <- 12 pages total
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
- **Settings -> Pages -> Source:** Deploy from a branch, **`Main`** (capital M), **/(root)**.
- **Custom domain:** `CNAME` file contains `coloradoboom.com`; DNS points the apex (and
  `www`) at GitHub Pages **through Cloudflare** (the domain is proxied, not DNS-only).
  **Enforce HTTPS** is enabled.
- **Cloudflare** handles caching (~10 min), rewrites `robots.txt` to block AI crawlers, and
  can inject scripts server-side — which is why Cloudflare Web Analytics would need no code
  change here.
- If you ever move DNS, GitHub Pages apex A records are
  `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
  (plus GitHub's AAAA IPv6 records), and `www` is a CNAME to `YOURUSERNAME.github.io`.

---

## Status of the old pre-launch checklist
- **noindex:** removed — the site is indexable. (Nothing to do.)
- **robots.txt / sitemap.xml:** present at the root; sitemap lists all 12 pages including
  `legal.html`. Still TODO (off-page): verify Google Search Console (a placeholder `<meta>`
  tag sits commented out in `index.html` awaiting a real token), then submit the sitemap
  there and in Bing Webmaster Tools.
- **Legal links:** Terms/Privacy/Accessibility now point to `legal.html#…` on every page
  (no longer `#` placeholders). Copy is boilerplate pending counsel review.
- **Instagram feed:** `[HM-06]` renders from a **Cloudflare Worker** at
  `coloradoboom.com/api/ig` that edge-caches Behold's JSON feed (no credentials in code).
  It is no longer a drop-in `<behold-widget>` element. If blank, check the Worker, then the
  Behold dashboard's allowed domains (`coloradoboom.com` + `www.coloradoboom.com`) and source
  connection.
- **Real photos:** swap any placeholder/AI images for real team/facility photos — keep the
  same filenames in `assets/img/` and the pages pick them up automatically. One photo (the
  Boomtown Fieldhouse shot on the home page) still loads from `static.wixstatic.com` and is an
  unoptimized ~6.5 MB file; replacing it with a local copy is an open item.
- **Analytics — nothing is currently recording traffic.** Either enable Cloudflare Web
  Analytics (no code change; the domain is proxied) or paste a Google Measurement ID into the
  inert `GA_MEASUREMENT_ID` hook in `assets/js/main.js`. Both can run at once.
- **Still open (dashboards, not code):** Google Business Profile, Cloudflare security headers.

---

## Quick troubleshooting
- **404 at the URL:** `index.html` isn't at the repo root, or Pages source is misset.
- **Page loads but no CSS/images:** `assets/` structure broke on upload, or `.nojekyll` missing.
- **Old version still showing:** hard refresh (Ctrl/Cmd+Shift+R); GitHub CDN caches briefly.
- **HTTPS warning on the domain:** wait for the cert, then ensure "Enforce HTTPS" is ticked.
