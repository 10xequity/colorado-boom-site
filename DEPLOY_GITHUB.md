# Deploying Colorado Boom (Alpha) to GitHub Pages

This is a plain static site (HTML/CSS/JS, no build step). GitHub Pages can host it for
free. Below are two paths — **Option A (web upload, no software)** is recommended if you
don't use Git. Follow the sections in order.

> IMPORTANT: your real site is live on Wix at **coloradoboom.com**. Nothing here touches
> that until you deliberately point DNS (Step 5). Do the alpha on a `github.io` URL or a
> **subdomain** first so the live site is never at risk.

---

## What you're uploading
The `cobo-site/` folder. Its structure must be preserved exactly:

```
cobo-site/
  index.html              <- home page (must stay named index.html, at the root)
  club.html
  tryouts.html
  girls-club.html
  boys-club.html
  programs.html
  coaching-staff.html
  parent-resources.html
  .nojekyll               <- tells GitHub "don't run Jekyll" (keep this file)
  robots.txt
  sitemap.xml
  assets/
    css/styles.css
    js/main.js
    img/  (logo.png, hero.jpg, girls.jpg, boys.jpg, club.jpg, programs.jpg,
           developmental.jpg, camps.jpg, why-boom.jpg, tryouts.jpg,
           boys-action.jpg, parent-hero.jpg, uniform.png)
```

Everything inside `cobo-site/` goes to the repo **root** (do NOT upload the `cobo-site`
folder itself as a subfolder — upload its *contents*).

---

## Step 1 — Create a GitHub account & repository
1. Sign up / log in at https://github.com
2. Click the **+** (top right) → **New repository**.
3. **Repository name:** `colorado-boom` (any name is fine).
   - Special case: if you name it exactly `YOURUSERNAME.github.io`, the site lives at
     the root URL `https://YOURUSERNAME.github.io/`. Otherwise it lives at
     `https://YOURUSERNAME.github.io/colorado-boom/`.
4. Visibility: **Public** (required for free GitHub Pages).
5. Do NOT add a README/.gitignore/license (keeps the repo empty for a clean upload).
6. Click **Create repository**.

---

## Step 2 — Upload the files (Option A: web, no Git)
1. On the empty repo page, click **uploading an existing file** (the link in
   "Quick setup"), or go to **Add file → Upload files**.
2. Open the `cobo-site` folder on your computer. Select **all of its contents**
   (the .html files, `.nojekyll`, robots.txt, sitemap.xml, and the whole `assets`
   folder) and drag them into the browser upload area.
   - Dragging the `assets` folder keeps its subfolders (`css`, `js`, `img`) intact.
   - Make sure `.nojekyll` uploads. If your OS hides dotfiles, enable "show hidden
     files," or just create it on GitHub later: **Add file → Create new file**, name it
     `.nojekyll`, leave it empty, commit.
3. Scroll down, type a commit message like `alpha site`, click **Commit changes**.
4. Confirm `index.html` sits at the **root** of the repo (not inside a `cobo-site`
   subfolder). If it landed in a subfolder, delete and re-upload the *contents*.

### Option B — Git command line (if you prefer)
```bash
cd path/to/cobo-site
git init
git add .
git commit -m "alpha site"
git branch -M main
git remote add origin https://github.com/YOURUSERNAME/colorado-boom.git
git push -u origin main
```

---

## Step 3 — Turn on GitHub Pages
1. In the repo, go to **Settings** (top tab) → **Pages** (left sidebar).
2. Under **Build and deployment → Source**, choose **Deploy from a branch**.
3. **Branch:** `main`, **Folder:** `/ (root)`. Click **Save**.
4. Wait 1–3 minutes. Refresh the Pages screen; it will show:
   *"Your site is live at https://YOURUSERNAME.github.io/colorado-boom/"*.
5. Open that URL. You should see the home page. Click through the nav to confirm
   every page and the images load.

If images or styles are missing, it's almost always one of:
- the `assets` folder didn't keep its structure (re-upload the folder, not loose files), or
- `.nojekyll` is missing (add it per Step 2.2).

---

## Step 4 — (Optional) Update the site later
- **Web:** open any file in the repo → pencil icon → edit → **Commit changes**. Pages
  redeploys automatically in ~1 minute. To replace an image, open `assets/img`, delete
  the old file, **Add file → Upload files** with the same filename.
- **Re-uploading from me:** when I send a new `cobo-site.zip`, unzip it and repeat
  **Step 2** (GitHub will overwrite changed files; commit the upload).

---

## Step 5 — Connect a domain (only when you're ready)
Your apex domain `coloradoboom.com` currently points to **Wix**. Pointing it to GitHub
will move the public site off Wix. **Recommended: review on a subdomain first.**

### 5a. Safer: a review subdomain (Wix stays live)
1. In the repo: **Add file → Create new file**, name it `CNAME` (all caps, no
   extension), content = your subdomain only, e.g.:
   ```
   alpha.coloradoboom.com
   ```
   Commit.
2. At your DNS provider (where coloradoboom.com's DNS is managed), add a record:
   - Type **CNAME**, Host/Name **alpha**, Value **YOURUSERNAME.github.io**
3. Back in **Settings → Pages → Custom domain**, enter `alpha.coloradoboom.com`, Save.
   Check **Enforce HTTPS** once the certificate is issued (can take up to an hour).
4. Visit `https://alpha.coloradoboom.com`. The Wix site at `coloradoboom.com` is
   untouched.

### 5b. Going fully live on the apex domain (replaces Wix)
Only do this once the alpha is approved.
1. Set the `CNAME` file content to `www.coloradoboom.com`.
2. DNS records:
   - **CNAME**: Host **www** → **YOURUSERNAME.github.io**
   - **A records** for the apex (`@`) pointing to GitHub Pages IPs:
     `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
     (and/or the AAAA IPv6 records GitHub lists in its Pages docs).
3. In **Settings → Pages → Custom domain**, enter `www.coloradoboom.com`, Save, then
   enable **Enforce HTTPS**.
4. DNS can take minutes to 48 hours to propagate.

---

## Step 6 — Before the REAL public launch (not needed for alpha)
1. **Remove `noindex`:** every page currently has
   `<meta name="robots" content="noindex">` in its `<head>` so search engines ignore the
   staging site. Delete that one line from all 8 `.html` files when you want Google to
   index the site. (Leave it in during alpha review.)
2. **Update `robots.txt` / `sitemap.xml`** with the final domain.
3. **Legal links:** the footer Terms / Privacy / Accessibility links are placeholders
   (`#`). Point them at your real policy pages (you already have these on Wix:
   `/terms-and-conditions`, `/privacy-policy`, `/accessibility-statement`).
4. **Instagram feed:** the home Instagram grid is a placeholder. See "Instagram setup"
   below to make it live.
5. **Real photos:** swap any placeholder/AI images for real team/facility photos —
   keep the same filenames in `assets/img/` and the pages pick them up automatically.

---

## Instagram feed — how to make it live
The home page Instagram section is currently a static placeholder grid. You do **not**
put your Instagram password in the code. Use an embed/widget service that connects via
Instagram's official login (OAuth):

1. Pick a widget provider (free tiers exist): **Behold** (behold.so), **Elfsight**
   (elfsight.com/instagram-feed-widget), or **SnapWidget** (snapwidget.com).
2. Create an account there and click "Connect Instagram." You'll be sent to Instagram
   to **authorize** the `@coboomvb` account — this is the login step, done on Instagram,
   not in your code.
3. The provider gives you a small embed snippet (a `<script>` + a `<div>`, or an
   `<iframe>`).
4. Send me that snippet (or paste it into `index.html` in place of the placeholder grid
   block). The feed then updates automatically whenever you post.

This keeps credentials with Instagram/the widget, which is the supported, secure way.

---

## Quick troubleshooting
- **404 at the Pages URL:** Pages not enabled yet, or `index.html` isn't at the repo
  root. Re-check Step 3 and the file location.
- **Page loads but no CSS/images:** `assets/` structure broke on upload, or `.nojekyll`
  missing.
- **HTTPS warning on custom domain:** wait for the certificate, then tick "Enforce
  HTTPS." DNS/cert can take up to ~24h.
- **Old version still showing:** hard refresh (Ctrl/Cmd+Shift+R); GitHub CDN can cache
  briefly.
