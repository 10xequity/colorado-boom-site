# Editing Guide — Colorado Boom site

**Version** 2.0 · **Updated** 2026-08-17 · **Status** Active
**Supersedes** Editing Guide v1 (page list, shared blocks, tryout dates, and the Instagram
instructions were all stale)

Static site — plain HTML/CSS/JS, no build step — on GitHub Pages at **coloradoboom.com**.
Every page opens with a comment listing its section codes, so you can say "change `[HM-05]`"
and anyone finds it by searching.

Deployment: `DEPLOY_GITHUB.md`. Past decisions and why: `CHANGELOG.md`.

---

## Pages & codes (12 pages)

| File | Code |
|---|---|
| `index.html` | **HM** |
| `tryouts.html` | **TO** |
| `schedule.html` | **SCH** — club calendar, GymDesk widget |
| `club.html` | **CL** |
| `girls-club.html` | **GC** |
| `boys-club.html` | **BC** |
| `programs.html` | **PG** |
| `coaching-staff.html` | **CO** |
| `parent-resources.html` | **RE** |
| `volleyball-rules.html` | educational reference |
| `volleyball-positions.html` | educational reference |
| `legal.html` | Privacy / Terms / Accessibility (`#privacy`, `#terms`, `#accessibility`) |

---

## Shared blocks are copy-pasted, NOT included

Plain HTML has no include mechanism, so these live separately in **every** page:

| Code | What it is |
|---|---|
| `[NAV]` | Header and navigation |
| `[ANN]` | Gold announcement bar (tryout dates + Register) |
| `[RB]` | Black recruiting banner (roster needs) |
| `[OCSR]` | Cream OCS bar (membership + offer logistics) |
| `[FT]` | Footer |

Changing any of them means changing 11–12 files. Genuinely centralized:
- **All styling** → `assets/css/styles.css` (brand colors are `:root` variables at the top)
- **All behavior** → `assets/js/main.js`

### ⚠ `legal.html` does not use the shared blocks
It has its own hand-rolled `<header class="nav">`, its own `.ann` bar, and its own
inline-styled buttons. **Site-wide find-and-replace skips it silently.** Always open it and
check by hand. This has already caused one bug where it advertised superseded tryout wording
for days after every other page was updated.

---

## Global content (appears in several places — update everywhere)

| Item | Value | Where |
|---|---|---|
| Email | admin@coloradoboom.com | header Contact, footer, CTAs, FAQs |
| Open gym | Mon/Wed/Fri 5:30–7:00 PM | `[HM-08]`, `[TO-02]`, `[PG]`, `schedule.html` |
| Group training | Tues/Thurs 5:00–6:30 PM | `[TO-02]`, `[PG]` |
| Open evaluations | Mon Aug 17 & Wed Aug 19, 5:30–7:00 PM (10U–14U) | `[ANN]` note (11 pages), `[TO-EVAL]`, home popup, `schedule.html` |
| Official tryouts | Fri Aug 21 4:30–6:30 · Sat Aug 22 10:00–11:30 · Mon Aug 24 & Mon Aug 31 5:30–7:00 | `[ANN]` (all pages), `[TO-04]` table, home popup, `schedule.html` |
| 15U–18U | Ongoing at open gym — 17s/18s need middles & pin hitters; Regional 15s/16s hitters & middles | `[RB]`, `[TO-04]`, `schedule.html` |
| RMR offers | 9:00 PM Thu Aug 20 | `[OCSR]`, `[TO-07]`, `club.html` FAQ, `parent-resources.html` FAQ |
| Stats | 13 courts / 96K sq ft / 15 teams | `[HM-07]` |
| Instagram | @coboomvb | `[HM-06]`, footer |
| Address | 14200 E Alameda Ave, Aurora, CO 80012 | `[HM-08]`, footer |

Registration forms currently in use:
- Official tryouts — `forms.gle/2fEhY72d9GdU5Q8H7`
- Open evaluations — `forms.gle/61d5snUgDeM5Qzuv5`
- Open gym — `forms.gle/5wyRdqmmUxUdhkK4A`

**Never put a Google Forms `/edit` URL on the site** — that is the admin editor, and anyone
with it can change the form. Only `forms.gle/...` links are public.

---

## How to make a multi-page change safely

The method that has worked here, and why it matters: two separate bugs shipped because a
search pattern could not match text that was plainly on the page.

1. **Write a throwaway script** that does exact-string replacements and **throws if an anchor
   is missing or appears more than once.** A silent skip is the failure mode you cannot see.
2. **Assert across all 12 pages** afterwards — count the banners, confirm old strings are gone,
   confirm the strings that should survive did.
3. **Add a positive control** to every search: feed it a known-bad string and confirm it
   matches. A check that cannot detect the thing it hunts is worse than no check, because it
   reports success.
4. **Match the shortest distinctive fragment.** Searching for `hitters, middles & setters
   welcome` missed a page that wrote the same phrase without "welcome."
5. **Open `legal.html`** and verify by hand.
6. **Check the live site** afterwards (see below).

---

## Verifying the live site

- Cloudflare's managed `robots.txt` blocks AI crawlers, so automated fetchers get **403**. Use
  `curl` with a normal browser user-agent, or a headless browser.
- Pages cache about **10 minutes**. Expect to poll once, or hard-refresh (Ctrl/Cmd+Shift+R).
- Confirm what you *added* appears **and** what you *replaced* is gone. Grepping only for the
  new string will not catch a duplicate left behind elsewhere.

---

## Common edits

**Tryout or evaluation dates** → `[ANN]` in every page's header block, the tables in
`tryouts.html` (`[TO-EVAL]` for evaluations, `[TO-04]` for official tryouts), the popup table
in `index.html`, the calendar in `schedule.html`, and the season tables in `girls-club.html` /
`boys-club.html`. Also check the FAQ answers in `club.html` and `parent-resources.html` — those
mention offer timing, and one lives inside JSON-LD that Google reads for search results.

**A color or spacing value** → `assets/css/styles.css`, `:root` variables.

**The home Instagram feed** → `[HM-06]` renders from a **Cloudflare Worker** at
`coloradoboom.com/api/ig` that edge-caches Behold's JSON feed, keeping Behold's free-plan view
count low. It builds DOM nodes in JavaScript; it is *not* a `<behold-widget>` element any more.
If it renders blank, check the Worker and the Behold dashboard's allowed domains
(`coloradoboom.com` + `www.coloradoboom.com`) and source connection. **Do not add the `reveal`
class to `.ig-embed`** — the feed hydrates to zero height, so the scroll-reveal observer never
fires and the section stays invisible forever.

**The tryout popup** (`[HM-POP]` in `index.html`) shows once per browser session. Its
`sessionStorage` key is versioned (`cobo-popup-v151`) — **bump it** when you change the popup,
or returning visitors keep seeing the dismissed old one.

**A photo** → keep the same filename, see `IMAGES.md`.

**Legal copy** → `legal.html`. Currently boilerplate pending counsel review.

---

## Design conventions

- **Montserrat** (headings, buttons, nav) and **Open Sans** (body) are the locked brand faces.
  An automated design check flags Montserrat as an "overused font" — known false positive,
  leave it.
- Colors come from `:root`: teal `#0E7C86`, teal-dark `#065A62`, gold `#E5B800`, cream
  `#FFF9F0`, black `#111111`.
- **Check contrast before shipping a color pairing.** The site shipped white-on-gold at 1.88:1
  on its most important link, against a 4.5:1 minimum. Useful measurements already made: teal
  text passes on cream (4.72:1) but fails on teal-light (4.31:1); black on gold is comfortable
  (10:1).
- Button hierarchy: **gold** is the primary action, **teal** secondary, **teal outline on white**
  for a lighter or earlier step (e.g. evaluations vs official tryouts). `.btn-sm` is the
  secondary scale.
