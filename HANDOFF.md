# Handoff — Colorado Boom website

**Updated** 2026-08-23 · **Live build** v1.62 · **Status** Active

A practical handoff so anyone can pick up the Colorado Boom site. Read this first, then
`EDITING_GUIDE.md` (how to edit), `DEPLOY_GITHUB.md` (how to publish), and `CHANGELOG.md` (why each
change was made, newest first).

---

## 1. What this is & where it lives

- **coloradoboom.com** — a plain static site (HTML/CSS/JS, no build step), 12 pages.
- **Source of truth:** GitHub repo **`10xequity/colorado-boom-site`**, branch **`Main`** (capital M).
- **Hosting:** GitHub Pages, fronted by **Cloudflare** (caches ~10 min, so changes take a few
  minutes to appear — hard-refresh with Ctrl/Cmd+Shift+R).

## 2. ⚠ Important caveat about the working copy

The local folder used in the Claude sessions lives in a **temporary scratchpad directory** that can
be cleared at any time. **Do not treat it as the source of truth.** To continue:

```bash
git clone https://github.com/10xequity/colorado-boom-site.git
cd colorado-boom-site        # branch is "Main" (capital M)
# edit files, then:
git add -A && git commit -m "…" && git push origin Main
```

Pages redeploys automatically ~1 minute after the push.

## 3. How to publish an update

- **Non-technical:** edit the file on GitHub (pencil icon) → **Commit changes**. To swap a photo,
  upload a file with the **same name** into `assets/img/`. Full detail in `DEPLOY_GITHUB.md`.
- **Command line:** `git push origin Main`.

## 4. Current state (v1.62, 2026-08-23)

Everything through **v1.62** is live. Highlights (full history in `CHANGELOG.md`):

- **Club fees are age-scoped** — an **11U–14U (Girls Club)** section and a **15U–18U** section on
  `club.html`; no pay-in-full discount. Fee math: 11U–14U Colorado $4,875 / National(14U) $5,500;
  15U–18U Regional $4,500 / Colorado $5,500 / National $6,000 (all = $4,500 base + travel).
- **Payment plan:** deposit at signing, then **September, December & March**; −$300 sibling discount.
- **Programs page** now has **one "Skills Training Membership"** — $150 club members / $295 open
  enrollment per month — replacing the old Developmental / Add-On / Advanced sections. Three included
  sessions (Developmental Tue/Thu 5:00–6:30; Advanced 14+ Tue/Wed/Thu 5:00–7:00; Coach Damon Mon/Wed
  7:00–8:30), each described below the box with `#s-dev` / `#s-adv` / `#s-damon` anchors.
- **Girls League** (Programs): Girls 14U–18U · **Aug–Oct** · $80 for 8 weeks · open to any club player.
- **All training signups use one Google Form:** `forms.gle/yvnstZ89psTTLmux7`.
- **Tryouts:** current remaining sessions are **Aug 24 & 31** (Girls 10U–14U). Expired dates and the
  old evaluation content have been cleared; wording is evergreen where it used to name past dates.
- Mobile nav scroll fix; image dimensions for layout stability; a full copy review pass.

## 5. Open items / what's next

1. **Tryouts page "Summer Membership" box** (`tryouts.html` `[TO-03]`) — a separate membership box
   that still lists **open gyms + tryout fees** and older session times. Decide: align it to the new
   Skills Training Membership (drop those, update times), or keep it as a distinct seasonal offer.
2. **Recurring date upkeep.** Tryouts **Aug 24 & 31** are still upcoming. **After Aug 31**, switch the
   site to off-season / next-season messaging. Date-bearing spots to update each time:
   - `[ANN]` gold banner — **all 12 pages** (identical text; sweep with a script).
   - `[OCSR]` OCS bar — 11 pages.
   - Home popup `[HM-POP]` in `index.html` — **bump the `cobo-popup-vNNN` key** (currently `v158`)
     when you change it, or returning visitors keep seeing the old one.
   - `tryouts.html` — the this-week callout and the tryout table.
   - `schedule.html` calendar — **left as historical on purpose**; don't strip past dates there.
3. **Boys fees are not defined.** `club.html` Club Fees only covers girls (11U–14U is labeled "Girls
   Club"). The boys overview (`boys-club.html`) is generic and says "contact us" for fees. When boys
   pricing is set, add it to Club Fees and update the boys overview.
4. **Coach photos** — `coaching-staff.html` shows "[ Coach photo ]" placeholders; swap in real photos
   when available (keep the same filenames per `IMAGES.md`).
5. **Developmental photo** — `assets/img/developmental.jpg` is no longer referenced (the section that
   used it was consolidated). Harmless; delete it if you want a tidy asset folder.
6. **Design-linter noise** (the "impeccable" pop-ups) is an internal dev tool, muted at the session
   root. It has **no effect on the live site**; ignore it.

## 6. Facts you'll need

| Item | Value |
|---|---|
| Brand fonts | **Montserrat** (headings/buttons) + **Open Sans** (body) — locked |
| Brand colors | teal `#0E7C86`, teal-dark `#065A62`, gold `#E5B800`, cream `#FFF9F0`, black `#111111` |
| All styling | `assets/css/styles.css` (`:root` variables at top); all behavior in `assets/js/main.js` |
| Training signup form | `forms.gle/yvnstZ89psTTLmux7` |
| Tryouts form | `forms.gle/2fEhY72d9GdU5Q8H7` · Open gym `forms.gle/5wyRdqmmUxUdhkK4A` |
| Girls League form | `docs.google.com/forms/d/e/1FAIpQLScVc0co2_2f36uQCu1Mj1n2SySxPNOlFN2mGqcMIs3kL1wbSw/viewform` |
| Club member login | `https://colorado-boom.gymdesk.com/login` |
| Contact email | admin@coloradoboom.com |
| Open gym | Mon/Wed/Fri 5:30–7:00 PM (through August; Sept dates TBA) |
| `legal.html` | Has its **own** header/banner (not the shared block) — always edit it by hand |

Every page opens with a `<!-- BUILD vX … -->` comment and section codes (e.g. `[CL-06]`, `[PG-02]`)
so you can search for a spot by code. When you change a shared block (`[NAV]`, `[ANN]`, `[RB]`,
`[OCSR]`, `[FT]`), remember it is copy-pasted into every page — change all of them.
