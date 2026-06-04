# Editing Guide — Colorado Boom site

Every page opens with a comment listing its section codes. Reference an area by its code
(e.g. "change `[HM-05]`") and anyone can find it instantly via search.

## Page codes
- `index.html` -> **HM** (+ shared `[NAV]`, `[ANN]`, `[HMB]`, `[FT]`)
- `tryouts.html` -> **TO**
- `girls-club.html` -> **GC**
- `boys-club.html` -> **BC**
- `programs.html` -> **PG**
- `coaching-staff.html` -> **CO**
- `parent-resources.html` -> **RE**

## Shared across ALL pages (edit once -> applies everywhere is NOT automatic in plain HTML;
## these blocks are identical in every file, so change them in each, OR ask to re-generate)
- `[NAV]` header  ·  `[ANN]` announcement bar  ·  `[FT]` footer
- All styling -> `assets/css/styles.css` (change a color/spacing once, every page updates)
- All behavior -> `assets/js/main.js`
- Brand colors -> top of `styles.css` under `:root` (change once, whole site re-themes)

## Global content (appears in several places — update everywhere)
| Item | Value | Where it appears |
|---|---|---|
| Email | admin@coloradoboom.com | header Contact, footer, CTAs, FAQ |
| Tryout dates | Girls 15U-18U Jul 10-Aug 10; Girls 10U-14U / Boys 13U-18U Aug 10-Sep 10 | `[ANN]` (all pages), `[TO-04]` |
| Open gym | Mon/Wed/Fri 5-7 PM | `[HM-08]`, `[TO-03]`, `[PG-05]` |
| Stats | 13 courts · 96K sq ft · 15 teams | `[HM-07]` |
| Instagram | @coboomvb | `[HM-06]`, footer |
| Address | 14200 E Alameda Ave, Aurora, CO 80012 | `[HM-08]`, footer |

## Common edits
- **Change tryout dates** -> `[ANN]` (in the header block of every page) and `[TO-04]` table in `tryouts.html`.
- **Change a color** -> `assets/css/styles.css` `:root` variables.
- **Add Instagram feed** -> replace the placeholder grid in `[HM-06]` with an OAuth widget (Elfsight/SnapWidget). Never hard-code credentials.
- **Swap a photo** -> see `IMAGES.md` (keep the same filename).
- **Legal pages** (Terms/Privacy/Accessibility) are `#` placeholders in the footer — create those pages or link existing policies before launch.
