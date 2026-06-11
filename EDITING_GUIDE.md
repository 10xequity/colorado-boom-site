# Editing Guide — Colorado Boom site

Static site (plain HTML/CSS/JS, no build step) hosted on **GitHub Pages** at
**coloradoboom.com**. Every page opens with a comment listing its section codes.
Reference an area by its code (e.g. "change `[HM-05]`") and anyone can find it instantly
via search.

## Pages & codes (11 pages)
- `index.html` -> **HM** (+ shared `[NAV]`, `[ANN]`, `[HMB]`, `[FT]`)
- `tryouts.html` -> **TO**
- `club.html` -> **CL**
- `girls-club.html` -> **GC**
- `boys-club.html` -> **BC**
- `programs.html` -> **PG**
- `coaching-staff.html` -> **CO**
- `parent-resources.html` -> **RE**
- `volleyball-rules.html` -> educational reference
- `volleyball-positions.html` -> educational reference
- `legal.html` -> Privacy / Terms / Accessibility (anchors `#privacy`, `#terms`, `#accessibility`)

## Shared blocks (NOT auto-synced in plain HTML)
`[NAV]` header, `[ANN]` announcement bar, and `[FT]` footer are duplicated in every
`.html` file. Changing one means changing it in each file (or ask for a full re-generate).
Everything else is centralized:
- All styling -> `assets/css/styles.css` (change a color/spacing once, every page updates)
- All behavior -> `assets/js/main.js`
- Brand colors -> top of `styles.css` under `:root`

## Global content (appears in several places — update everywhere)
| Item | Value | Where it appears |
|---|---|---|
| Email | admin@coloradoboom.com | header Contact, footer, CTAs, FAQ |
| Open gym | Mon/Wed/Fri 5:30-7:00 PM | `[HM-08]`, `[PG-05]`, tryouts |
| Group training | Tues/Thurs 5:00-6:30 PM | `[PG-05]`, tryouts |
| Tryout dates (2026) | Girls 15U-18U Jul 10-29 / Boys 14U & 15U-18U Jul 17-31 / Girls 11U-14U Aug 21-31 | `[ANN]` (all pages), tryouts tables, club calendars |
| Stats | 13 courts / 96K sq ft / 15 teams | `[HM-07]` |
| Instagram | @coboomvb | `[HM-06]`, footer |
| Facebook | facebook.com/profile.php?id=61590351960515 | footer |
| Address | 14200 E Alameda Ave, Aurora, CO 80012 | `[HM-08]`, footer |

## Common edits
- **Change tryout dates** -> `[ANN]` (in the header block of every page) and the tryout
  tables in `tryouts.html`, plus the season calendars in `girls-club.html` / `boys-club.html`.
- **Change a color** -> `assets/css/styles.css` `:root` variables.
- **Instagram feed** -> the home feed in `[HM-06]` uses a **Behold** widget
  (`<behold-widget feed-id="p4gyc3sRiiOZbXltCYKY">` + the `w.behold.so/widget.js` module
  loader). All layout/config is on the Behold dashboard; no credentials live in the code.
  If the feed renders blank, check the Behold dashboard's **allowed domains**
  (`coloradoboom.com` + `www.coloradoboom.com`) and that the Instagram source is still
  connected. Do NOT add the `reveal` class to `.ig-embed` — the widget hydrates to zero
  height and a scroll-reveal observer never fires, leaving it invisible.
- **Swap a photo** -> see `IMAGES.md` (keep the same filename).
- **Legal pages** -> Terms/Privacy/Accessibility live on `legal.html` (single page, three
  anchored sections). Footer links across all pages point to `legal.html#...`. The current
  copy is boilerplate pending a counsel review.
