# Colorado Boom Volleyball Club — Website

Static site (plain HTML/CSS/JS, no build step) for **GitHub Pages**.

## Files
- 7 pages: `index.html`, `tryouts.html`, `girls-club.html`, `boys-club.html`, `programs.html`, `coaching-staff.html`, `parent-resources.html`
- `assets/css/styles.css` — all styling (shared)
- `assets/js/main.js` — nav, scroll reveal, FAQ accordion (shared)
- `assets/img/` — image library (see `IMAGES.md`)
- `EDITING_GUIDE.md` — how to find/change things
- `.nojekyll` — tells GitHub Pages to serve files as-is

## Deploy on GitHub Pages (one-time)
1. Create a free account at github.com if you don't have one.
2. Create a new repository (e.g. `colorado-boom`). Make it **Public**.
3. On the repo page click **Add file -> Upload files**. Drag in EVERYTHING from this folder,
   **keeping the `assets/` folder structure** (drag the whole `assets` folder in too). Commit.
4. Go to **Settings -> Pages**. Under "Build and deployment", Source = **Deploy from a branch**,
   Branch = **main**, folder = **/(root)**. Save.
5. Wait ~1 minute. Your site is live at `https://<your-username>.github.io/<repo-name>/`.

## Edit later (no tools needed)
- Open any file on github.com, click the **pencil (Edit)** icon, make changes, **Commit**.
  The site redeploys automatically in under a minute.

## Replace / add photos
- Upload a file into `assets/img/` with the **exact same filename** (case-sensitive) as in `IMAGES.md`.

## Go live on your domain
- When approved: add a file named `CNAME` at the repo root containing `www.coloradoboom.com`,
  then point your DNS to GitHub Pages. **Remove the `<meta name="robots" content="noindex">`
  line from each page** so Google can index it.
