# Handoff — Colorado Boom website

**Updated** 2026-08-23 · **Live build** v1.59 · **Status** Active

A quick, practical handoff so anyone can pick up the Colorado Boom site. Read this first, then
`EDITING_GUIDE.md` (how to edit), `DEPLOY_GITHUB.md` (how to publish), and `CHANGELOG.md` (why each
change was made, newest first).

---

## 1. What this is & where it lives

- **coloradoboom.com** — a plain static site (HTML/CSS/JS, no build step), 12 pages.
- **Source of truth:** GitHub repo **`10xequity/colorado-boom-site`**, branch **`Main`** (capital M).
- **Hosting:** GitHub Pages, fronted by **Cloudflare** (caches ~10 min, so changes can take a few
  minutes to appear — hard-refresh with Ctrl/Cmd+Shift+R).

## 2. ⚠ Important caveat about the working copy

The local folder used in these Claude sessions lives in a **temporary scratchpad directory** that
can be cleared at any time. **Do not treat it as the source of truth.** To continue the work:

```bash
git clone https://github.com/10xequity/colorado-boom-site.git
cd colorado-boom-site        # branch is "Main" (capital M)
# edit files, then:
git add -A && git commit -m "…" && git push origin Main
```

GitHub Pages redeploys automatically ~1 minute after the push.

## 3. How to publish an update

- **Non-technical:** edit the file on GitHub (pencil icon) → **Commit changes**. Pages redeploys.
  To swap a photo, upload a file with the **same name** into `assets/img/`. Full detail in
  `DEPLOY_GITHUB.md`.
- **Command line:** `git push origin Main` (see above).

## 4. Current state (as of v1.59, 2026-08-23)

Everything through **v1.59** is live. Recent work (full detail in `CHANGELOG.md`):
- Club fees split by age band — **11U–14U (Girls Club)** and **15U–18U**; pay-in-full discount removed.
- **Girls League** (14U–18U) and **Add-On / Skills Training** added to Programs.
- **All training signups point to one Google Form:** `forms.gle/yvnstZ89psTTLmux7`.
- Expired tryout/eval dates cleaned up; **remaining tryouts: Aug 24 & 31** (Girls 10U–14U).
- Mobile nav scroll fix; image dimensions for layout stability; typography polish.
- Training price made consistent: **$150 club members / $295 community** per month.

## 5. Open items / what's next

1. **Unify the "training" presentation.** Developmental Training, 14+ Advanced Skills, Summer Club
   Training, and Add-On Skills Training are **all one all-inclusive program** (one membership, one
   price, several day/time options). The price is now consistent ($150 members / $295 community),
   but they still appear as separate sections. A **demo of a single "Skills Training Membership"
   section** has been proposed for the owner to review, then roll into `programs.html` (the existing
   `[TO-03] Summer Membership` block on `tryouts.html` is already the all-inclusive model to copy).
2. **Recurring date upkeep.** Tryouts **Aug 24 & 31** are still upcoming. **After Aug 31**, switch
   the site to off-season / next-season messaging. Date-bearing spots to update each time:
   - `[ANN]` gold banner — **all 12 pages** (identical text; sweep with a script).
   - `[OCSR]` OCS bar — 11 pages.
   - Home popup `[HM-POP]` in `index.html` — **bump the `cobo-popup-vNNN` key** when you change it,
     or returning visitors keep seeing the old one.
   - `tryouts.html` — the this-week callout and the tryout table.
   - `schedule.html` calendar — **left as historical on purpose**; don't strip past dates there.
3. **Design-linter noise** (the "impeccable" pop-ups) is an internal dev tool, muted at the session
   root. It has **no effect on the live site**; ignore it.

## 6. Facts you'll need

| Item | Value |
|---|---|
| Brand fonts | **Montserrat** (headings/buttons) + **Open Sans** (body) — locked |
| Brand colors | teal `#0E7C86`, teal-dark `#065A62`, gold `#E5B800`, cream `#FFF9F0`, black `#111111` |
| All styling | `assets/css/styles.css` (`:root` variables at top) |
| Training signup form | `forms.gle/yvnstZ89psTTLmux7` |
| Tryouts form | `forms.gle/2fEhY72d9GdU5Q8H7` · Open gym | `forms.gle/5wyRdqmmUxUdhkK4A` |
| Club member login | `https://colorado-boom.gymdesk.com/login` |
| Contact email | admin@coloradoboom.com |
| `legal.html` | Has its **own** header/banner (not the shared block) — always edit it by hand |

Every page opens with a `<!-- BUILD vX … -->` comment and section codes (e.g. `[CL-06]`) so you can
search for a spot by code.
