# Colorado Boom Volleyball Club — Website

**Version** 2.0 · **Updated** 2026-08-17 · **Status** Live
**Supersedes** README v1 (page count, branch name, and Instagram details were stale)

Static site — plain HTML/CSS/JS, no build step — served by **GitHub Pages** from this repo
at **coloradoboom.com**, behind Cloudflare.

Change history and the reasoning behind past decisions: **`CHANGELOG.md`**.
How to make a change without breaking something: **`EDITING_GUIDE.md`**.

---

## Read this first (things that have cost real time)

**The live site is this repo — not Wix.** The owner's Wix account holds several older sites
also called "Colorado Boom." They are abandoned drafts. If someone says "update the Colorado
Boom site," it means this repo.

**The branch is `Main` with a capital M.** Not `main`. Pushing to `main` creates a second
branch and deploys nothing.

**Cloudflare sits in front of the site.** Three consequences:
- Pages are cached about 10 minutes. After a push, a hard refresh (Ctrl/Cmd+Shift+R) or a
  short wait is normal before changes appear.
- Cloudflare's managed `robots.txt` blocks AI crawlers, so automated fetchers get **403**.
  To check the live site, use `curl` with a normal browser user-agent, or a headless browser.
- Cloudflare injects its own scripts into pages and can inject analytics the same way — which
  is why Cloudflare Web Analytics needs no code changes here.

**`legal.html` is not built like the other pages.** It has its own hand-rolled header and
announcement bar instead of the shared ones. Any site-wide header or banner edit **misses it**.
Check it by hand every time. (See `CHANGELOG.md` → 2026-08-11 for how this bit us.)

**One image still loads from Wix.** The Boomtown Fieldhouse photo in `index.html` is hosted on
`static.wixstatic.com`. It is the last external dependency and an unoptimized ~6.5 MB phone
photo that every visitor downloads. The owner chose to leave it for now; a 239 KB replacement
was prepared but not shipped.

---

## Files

**12 pages** — `index.html`, `tryouts.html`, `schedule.html`, `club.html`, `girls-club.html`,
`boys-club.html`, `programs.html`, `coaching-staff.html`, `parent-resources.html`,
`volleyball-rules.html`, `volleyball-positions.html`, `legal.html`

| Path | What it is |
|---|---|
| `assets/css/styles.css` | All styling. Brand colors are `:root` variables at the top. |
| `assets/js/main.js` | Nav, scroll reveal, FAQ accordion, back-to-top, analytics hook. |
| `assets/img/` | Image library — see `IMAGES.md`. |
| `robots.txt`, `sitemap.xml` | SEO. Sitemap lists all 12 pages. |
| `CNAME` | Custom domain (`coloradoboom.com`). |
| `.nojekyll` | Tells GitHub Pages to serve files as-is. **Keep this dotfile.** |

Reference docs: `CHANGELOG.md`, `EDITING_GUIDE.md`, `DEPLOY_GITHUB.md`, `IMAGES.md`,
`UNIFORMS_REFERENCE.md`.

---

## Update the live site

**Web, no Git:** open a file on github.com, click the pencil (Edit) icon, change it, Commit.
Pages redeploys in about a minute; Cloudflare's cache clears within ten.

**Command line:**
```bash
git add -A && git commit -m "what changed" && git push origin Main
```

**For any change touching more than one or two files**, read `EDITING_GUIDE.md` first. The
shared header, banners, and footer are copy-pasted into every page, so a "small" wording
change is usually a 12-file edit.

---

## Current content state (as of 2026-08-17)

- **Open evaluations**, Girls 10U–14U: Mon Aug 17 & Wed Aug 19, 5:30–7:00 PM. No price shown
  on the site by owner request; the registration form collects it.
- **Official tryouts**, Girls 10U–14U Club & RYL: Fri Aug 21 4:30–6:30 PM · Sat Aug 22
  10:00–11:30 AM · Mon Aug 24 and Mon Aug 31 5:30–7:00 PM.
- **Girls 15U–18U**: ongoing tryouts at open gym, no fixed dates. 17s and 18s need middles and
  pin hitters; Regional 15s and 16s have room for hitters and middles.
- **RMR offers** release 9:00 PM Thu Aug 20; evaluated players first.
- **Open gym**: Mon/Wed/Fri 5:30–7:00 PM through August. **September dates are not yet set** —
  the site says they will be released later, so this needs updating once known.
- **Boys**: sections exist but promise no dates. Keep them generic until told otherwise.
- **Nike Camp**: "Dates TBD." Flyers are kept but labeled as past, since the artwork has
  July 2026 printed in the image.
- **Financial aid**: RMR replaced its Shinkara need-based grant with a work-study program for
  2026–27. Copy reflects that; do not publish the old Shinkara PDF.

---

## Open items

**Blocked on the owner**
- **Analytics — nothing is recording site traffic.** Two independent options, and both can run:
  - *Cloudflare Web Analytics* — no code needed. Add the site under Web Analytics in the
    Cloudflare dashboard and it injects automatically. Cookieless, so no consent banner.
  - *Google Analytics* — `assets/js/main.js` has an inert hook. Paste the Measurement ID
    (`G-…`) into `GA_MEASUREMENT_ID` and it switches on site-wide, because `main.js` already
    loads on every page. Note it sets cookies, so the privacy policy should mention them.
- **Google Search Console** — a verification `<meta>` tag sits commented out in `index.html`
  awaiting a real token. Verifying enables Google's own search reporting and sitemap submission.
- **Three old Wix sites are still published** and publicly reachable, showing outdated or
  placeholder content. Recommend unpublishing (reversible).

**Code / content debt**
- Replace the Wix-hosted fieldhouse photo with a local, resized copy.
- Standardize `legal.html` onto the shared header and banner components.
- `legal.html` legal copy is boilerplate pending counsel review.
- The financial-aid heading says "with Partners." Confirm that Chance Sports and the Colorado
  Athletics Foundation are genuinely partner organizations, or reword.
- Replace any remaining placeholder imagery with real team photos (same filenames — see
  `IMAGES.md`).

---

## Notes

- No `noindex` remains; the site is indexable.
- The home Instagram feed renders from a **Cloudflare Worker** at `coloradoboom.com/api/ig`
  that edge-caches Behold's JSON feed. It is no longer a drop-in `<behold-widget>` element.
  Do not add the `reveal` class to `.ig-embed` — see `EDITING_GUIDE.md`.
- **Montserrat is the intentional brand typeface**, locked in the design tokens. An automated
  design check flags it as an "overused font." That is a known false positive; leave it.
