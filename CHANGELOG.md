# Changelog — Colorado Boom Website

**Version** 1.0 · **Created** 2026-08-17 · **Status** Active

Newest first. Internal build numbers (`v1.xx`) also appear in an HTML comment at the top of
each page, so a page's own stamp tells you how current it is.

Entries record **why**, not just what — the reasoning is the part that is expensive to
reconstruct later.

---

## v1.57 — 2026-08-22 · All training signups point to one form
all pages

Per owner: consolidate every training-program signup onto a single Google Form
(`forms.gle/yvnstZ89psTTLmux7`, the Add-On Training form). Repointed **22 buttons across 11 pages**,
replacing three separate forms:
- Developmental Training — `nx3jtbQCTXsEVZKU8`
- 14+ Advanced Skills / Membership — `d4GT48VSgh4qve6Z6`
- Advanced Summer Club Training (free week) — `CRPDPm7R5ZcdTQKWA`

Left unchanged: Open Gym (`5wyRdqmmUxUdhkK4A`), Tryouts (`2fEhY72d9GdU5Q8H7`), and the
parent-resources apply form. **Prices unchanged** (Add-On $150 members / $295 community; the 14+
membership $295/month) — link swap only, per owner. Note: each program section still carries its own
name, schedule, and price; they now just share one signup form.

---

## v1.56 — 2026-08-21 · Programs-page polish + removed the added Login button
`programs.html`, `assets/css/styles.css`, all pages (nav)

Owner review of the live v1.55 deploy flagged five visual items:
- **Removed the mobile "Login" button** added to the header in v1.55 — not wanted. (The existing
  "Club Login" nav CTA stays.) Removed from all 11 shared-nav pages and its CSS dropped.
- **Programs background gap:** Add-On Skills Training and Advanced Skills were both `bg-cream`,
  running together with no separation. Advanced switched to `bg-white` so sections alternate again.
- **Developmental "training" photo looked stretched:** the source is a very wide 1400×630 panorama
  that renders as a thin strip (worst on mobile). Cropped to a natural 16:9 via `object-fit:cover`.
- **Hanging lines:** added `text-wrap: balance` (headings/subtitles) and `text-wrap: pretty`
  (body copy) so single-word orphans stop wrapping onto their own line.

Verified in a headless browser at mobile (390px) and desktop (1250px) before publishing.

---

## v1.55 — 2026-08-20 · Club fees split by age band (11U–14U vs 15U–18U)
`club.html`, `programs.html`

The 2026–27 Membership & FAQ packet re-scoped club pricing by age. `club.html` carried one
four-level fee model for all ages, but the 11U–14U and 15U–18U bands now price differently, and
the single "National = $X" figure no longer held across ages.

- **NEW `[CL-04a]` "Team Levels & Fees — 11U–14U (Girls Club)"** above the older-band block:
  Colorado (11U–14U · 1 travel · $375 fee · **$4,875**) and National (**14U only** · 2 travel ·
  $1,000 fee · **$5,500**), RYL included at both, plus an Add-On Training info card. Its own
  two-column fee table, $1,000 deposit line, and a 5:15–7:30 PM practice note.
- **`[CL-04c]` rescoped to 15U–18U.** Removed the "Regional — 14U & below" card (14U now lives in
  the new block) and relabeled the remaining three cards to 15U–18U. **This retires the only
  $0-committed-travel tier for young players** — the old Regional 14U-&-below ($4,500, no travel)
  has no equivalent in the new 11U–14U band, where Colorado ($4,875, one committed Casper Rumble
  event) is the entry level. Surfaced to the owner as a flag, not assumed.
- **`[CL-06]` fee table cut 4→3 columns** (Regional / Colorado / National, all 15U–18U); RYL row
  dropped. **Removed "Pay in full at signing (−$100 discount)"** per owner — no pay-in-full
  discount anywhere on the site now (it existed only here). Deposit, quarterly/monthly, and the
  −$300 sibling discount kept.
- **FAQ:** "How much does club volleyball cost?" now lists both bands; the Regional/Colorado/
  National answer states National is 14U-only within 11U–14U and 11U–13U play Colorado; a new FAQ
  explains the 11U–14U 5:15 start (early warm-up welcome; eases the from-school commute).
- **`programs.html`:** NEW `[PG-02g]` Girls League (#girls-league · **Girls 14U–18U** · Oct–Aug ·
  $80/8wk) with the Google-Form registration link; NEW `[PG-02t]` Add-On Skills Training
  (#add-on-training) as a **two-area club-member-vs-community model** (member rate from September;
  community $150/mo) using the new signup form. `club.html` links to both from the age-band blocks.

**Follow-up in the same batch (owner feedback 2026-08-20):**
- **Mobile nav fix** (`styles.css`) — the open menu used `max-height:calc(100vh - 70px)`; on mobile
  `100vh` exceeds the visible viewport, so the bottom CTAs (Tryout / **Club Login**) hid behind the
  browser toolbar and could not be scrolled to. Switched to `dvh` (vh fallback kept) and pulled the
  CTAs to the top of the menu (`order:-1`) so members reach Club Login immediately. Centralized, so
  it fixes every page.
- **Homepage popup** (`index.html`) — removed the expired Aug 17 & 19 open-evaluation rows (kept on
  `schedule.html` as historical); bumped the popup key `v151→v155` so returning visitors see it.
- **`club.html` age-band jump buttons** on both fee blocks (`#age-11-14` ⇄ `#team-levels`).

**Second follow-up (owner feedback 2026-08-20, evening) — site-wide sweeps:**
- **Add-On pricing corrected:** club-member **$150/mo** (the discount), community/non-club **$295/mo**
  (full). `programs.html` cards + `club.html` info card.
- **Banner date sweep (11 pages):** the shared `[ANN]` note advertised the now-past Aug 17 & 19
  open evaluations; replaced with open-gym + RYL wording. Scripted with a positive control and a
  per-page anchor assertion. `legal.html` has its own banner and was already clean. The standalone
  `[TO-EVAL]` open-evaluations section on `tryouts.html` (headline Aug 17 & 19, now past) was
  **removed** per owner: its jump-nav entry dropped and its two cross-references re-pointed to open
  gym / tryouts ("join us at tryouts"). `schedule.html` keeps the dates as the intentional
  historical record. All 11 swept pages are stamped `v1.55`.
- **Mobile Login (11 pages) + `styles.css`:** a compact "Login" button added to the header bar,
  shown only ≤980px (desktop keeps Club Login in the nav CTAs) so members reach the portal without
  opening the menu.
- **Club Fees menu split (11 pages):** the Club Info dropdown's single "Club Fees" link became
  "Club Fees — 11U–14U" (`#age-11-14`) and "Club Fees — 15U–18U" (`#team-levels`).
- **Image CLS fix (all pages):** global `img` rule gained `height:auto`, and intrinsic
  `width`/`height` were written onto all 27 static `<img>` tags (6 unique images) so the browser
  reserves space and stops layout shift on load.

Not committed — changes left in the working tree for manual upload (GitHub access is read-only
this pass).

---

## v1.54 — 2026-08-15 · Financial aid rewritten for RMR's work-study model
Commit `6027187` · `parent-resources.html`

The owner forwarded a PDF, "RMR Shinkara Volleyball Hardship Assistance Fund," asking where it
should go on the site. **It should not go anywhere.** RMR's own page — titled "RMR 26-27
Financial Aid Program" — states they are *"replacing the Shinkara 'need-based gifting' program
with a 'work-study' model."* Supporting evidence: the PDF is hosted on a different club's
website, and `rmrvolleyball.org` returns 404 for it.

Worse, the site's existing copy repeated the retired promise ("need-based financial assistance
to qualifying families"), so a family following it would reach a job application expecting a
grant form. Fixed rather than extended:

- New **"Earn It: The RMR Work-Study Program"** block with the real rates (refs from $40 a
  match, RMR reports ~$250 a day at Powers events; site staff $25/hour and up), a link to
  RMR's actual application form, and the two differences that matter to a parent — you apply
  to *work*, and there is no annual deadline.
- Partner scholarships split into **"Needs Based Scholarships with Partners"** (owner's wording).
- The Shinkara fund is **named** in the copy on purpose. Families hear about it from other
  clubs; deleting it silently would leave them thinking Colorado Boom offers nothing.
- Quick-link card now scrolls to the section instead of jumping off-site, because the model
  needs a sentence of context before the click.

A build check fails if any page links that PDF or restores the old need-based claim.

---

## v1.53 — 2026-08-14 · Price removed from pre-evaluation copy
Commit `a3af4e3` · `index.html`, `tryouts.html`

Owner asked to drop `$20` from the evaluation references. Removed from all three places
v1.52 introduced. **Deliberately left alone:** the RMR tryout/RYL membership fee and the
open-gym drop-in rate — different charges, still accurate. A check asserts both survive.

Context worth keeping: three separate `$20` amounts can appear to a parent (open-gym drop-in,
RMR membership, evaluation fee). Since evaluations happen *during* open gym, it was never
confirmed whether the evaluation fee replaces the drop-in fee or stacks on it. Unresolved.

---

## v1.52 — 2026-08-14 · Pre-evaluation registration form
Commit `27f2256` · `index.html`, `tryouts.html`, `styles.css`

Zhu supplied a live registration form. Verified before publishing — it resolves to a form
titled "Colorado Boom 10u-14u Open Evaluations."

- Popup: teal-on-white register button directly beneath the Aug 17/19 rows, at a smaller scale
  than the gold tryout CTA so hierarchy reads *earlier and lighter* vs the main commitment.
  Declared in the page's **inline** `<style>` block, which loads after `styles.css`, because it
  otherwise loses a specificity tie with `.popup-sched td:last-child{text-align:right}`.
- `tryouts.html`: evaluation content lifted out of `[TO-04]` into its own `[TO-EVAL]` section
  **above** it, since evaluations happen first. The callout inside `[TO-04]` became a short
  pointer up rather than a second copy.
- Jump nav gained "Evaluations"; the open-gym anchor was retargeted from the removed
  `#open-evals` to `#pre-eval`.

**Security note:** Zhu also sent the form's `/forms/d/<id>/edit` URL — that is the admin editor.
It is not published anywhere, and a build check fails if any page ever contains a Google Forms
`/edit` URL. Only `forms.gle/...` links belong on the site.

---

## v1.51 — 2026-08-12 · Open evaluations, and Aug 21 retimed
Commit `d30a011` · 11 pages

Per Tara: open evaluations Mon Aug 17 and Wed Aug 19, 5:30–7:00 PM for 10U–14U; official
tryouts on Fri Aug 21 moved from 4:00–5:30 to **4:30–6:30 PM**.

Both dates land on existing Mon/Wed/Fri open-gym nights, and they are the last two before
offers release 9:00 PM Thu Aug 20 — so the funnel reads cleanly for a parent. Named as the
headline dates **while keeping** the standing "any Mon/Wed/Fri open gym works too" line, so
nobody arriving on another night is turned away.

Noted and confirmed with the owner: Aug 21 now runs two hours while the other sessions are 90
minutes, and it overlaps Friday open gym by an hour. Not a problem — Aug 24 and Aug 31 already
sit on top of Monday open gym, so tryouts during open gym is existing practice.

---

## 2026-08-11 · `schedule.html` rows missed by the v1.50 sweep
Commit `8ebfeea` · `schedule.html`

The club calendar still listed Girls 15U–18U under the fixed Aug 21/22/24/31 dates and asked
for "hitters, middles & setters" — both superseded hours earlier by v1.50.

**Why it survived, because this will happen again:** the v1.50 guard searched for
`hitters, middles & setters welcome`. This page wrote the same phrase **without** the word
"welcome," so the pattern could not match text that was sitting in plain sight. When sweeping
for superseded copy, match the shortest distinctive fragment, and add a positive control that
proves the check can see a known-bad string.

---

## v1.50 — 2026-08-11 · Banner split, messaging refresh, contrast fix
Commit `839bba5` · 14 files

**Banners.** One overloaded gold bar became three rows, each with one job: gold = official
10U–14U tryout dates + Register; black = current roster needs; new cream **OCS bar** = the
membership and offer-logistics fine print that was drowning the gold bar, with Add Player and
OCS Login buttons.

**Accessibility.** "Register Now!" was white text on gold — measured **1.88:1**, far below the
4.5:1 minimum, on the single most important link on the site. Now a black pill at **18.9:1**,
which also makes it read as the button it is. The OCS bar is cream rather than the teal-light
first tried, because teal text measures 4.72:1 on cream (passes) versus 4.31:1 on teal-light
(fails).

**Copy.** 15U–18U reframed from a fixed August table to ongoing open-gym tryouts with specific
position needs. 10U–14U gained pre-evaluation and walk-in wording. RYL explained as
non-high-school, including that boys may join RYL without joining club. Nike Camp → "Dates TBD"
with flyers relabeled as past (their artwork has July 2026 printed in it) and the dead register
button replaced by a notify-me link.

**Expired claims removed**, including *"15U–18U offers went out in July"* in four places —
`club.html` twice and `parent-resources.html` twice. One of those was inside the FAQ JSON-LD,
which is the copy Google can surface directly in search results.

**Header/UI.** Two-line nav labels left-aligned. Header widened so the logo sits further left
and the menu breathes. The "Tryout Now!" shine was already coded but invisible — a rule hiding
nav underlines (`.nav .btn::after{display:none!important}`) was also hiding the shine sweep.
Popup gained a Register button on the teal header band.

**Also:** an inert analytics hook in `main.js`, so activating Google Analytics later is a
one-line change in one file rather than an edit to all 12 pages.

---

## Before v1.50

No changelog was kept. Each page's top-of-file HTML comment carries its own version history,
and `tryouts.html` has the longest chain. Summarized:

- **v1.47** (2026-07-30) — 15U–18U tryout table added alongside 10U–14U.
- **v1.46** — boys and 15U–18U tables removed as sessions concluded; page reframed around
  Girls 10U–14U; tryout membership corrected $15 → $20 against `rmrvolleyball.org`.
- **v1.45** (2026-07-19) — past July sessions dropped.
- **v1.42–v1.44** (2026-07-14 → 07-16) — Club Login nav button; Club Calendar page added;
  repeated boys session retimings.
- **v1.38–v1.41** (2026-07-14) — `schedule.html` created with the GymDesk widget; recruiting
  banner added; header alignment pass.
- **v1.36–v1.37** (2026-07-04 → 07-12) — tryout popup; enlarged announcement bar with the OCS
  note; jump-nav; Advanced Skills.
- **v1.33–v1.34** (2026-06-22) — button shine; Instagram feed moved to the Cloudflare Worker;
  back-to-top button.

---

## Working notes for whoever edits next

**Shared blocks are copy-pasted, not included.** `[NAV]`, `[ANN]`, `[RB]`, `[OCSR]`, and `[FT]`
live in every page. A wording change is a 12-file edit. Only CSS and JS are genuinely shared.

**`legal.html` is the trap.** Its header and announcement bar are hand-rolled, so site-wide
find-and-replace silently skips it. It has burned us once.

**What worked for multi-file edits:** a throwaway Node script that does exact-string
replacements and **throws if an anchor is missing or matches more than once**, followed by
assertions over all 12 pages — plus a positive control proving each check can detect a
known-bad string. Both real misses in this period were checks that could not match the text
they were hunting.

**Verifying live** takes a browser user-agent (Cloudflare 403s automated fetchers) and usually
one poll, because of the ~10 minute cache.

**Never publish** a Google Forms `/edit` URL, or a document describing a program you have not
confirmed is still running.
