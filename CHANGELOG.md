# Changelog — Colorado Boom Website

**Version** 1.0 · **Created** 2026-08-17 · **Status** Active

Newest first. Internal build numbers (`v1.xx`) also appear in an HTML comment at the top of
each page, so a page's own stamp tells you how current it is.

Entries record **why**, not just what — the reasoning is the part that is expensive to
reconstruct later.

---

## v1.75 — 2026-08-29 · Mobile + contrast fixes from a measured audit
`assets/css/styles.css`, `index.html`, `coaching-staff.html`

Found by auditing eight pages at 390px wide and measuring every text node against the
surface actually painted behind it, rather than against intended colours.

- **The home page scrolled sideways on phones** — a real defect, and **pre-existing** (the live
  site showed the same 435px content in a 375px viewport before this batch). Cause: grid items
  default to `min-width:auto`, so the contact panel's value column could not shrink below the
  min-content width of "admin@coloradoboom.com" (~221px); with the 110px label column and 32px
  padding the panel came to 411px. Fix: grid children may shrink, the address wraps, and the
  label/value pairs stack below 600px.
- **Jump-nav links were 27px tall** on phones, under touch guidance in a dense two-row bar.
  Padding raises the hit area to ~45px without moving the text.
- **Current-page nav link** was gold on the teal-dark mobile menu at **4.23:1**, just under the
  4.5:1 minimum for 12px text. Now the lighter gold already used in the CTA gradient: **6.03:1**.
- **Popup week-row labels** ("Official Tryouts…", "Uniform Fitting") were `--gold-dark` on white at
  **2.64:1**, a clear failure. Now `--teal-dark` at **7.70:1**.
- Fuller meta description on the coaching-staff page (77 → 158 characters).

Checked and **not** changed: the staff page's gold CTA reads ~10:1 on black; the audit's "1:1"
readings were the measuring script defaulting to white where it could not read a gradient or
photo backdrop, not real failures. Instrument error, confirmed element by element.

---

## v1.74 — 2026-08-29 · Staff page all-black, teams cross-linked to coaches, Visit Us rebuilt
`coaching-staff.html`, `teams.html`, `index.html`

- **Coaching staff is now one black area** (intro, Club Leadership and the coach grid all
  `bg-dark`). The **main header is gold** ("2026–27 Coaching Staff") and the **sub-headers are white**
  ("Club Leadership", "Coaches", "Assistant Coaches"). Leadership keeps its teal-dark nameplate with
  the gold name; assistants keep cream nameplates.
- **Our Teams links through to each coach.** Every coach card on the staff page gained an id
  (`coach-first-last`); each coach name on the teams page is now a link to it, and the target card
  draws a gold focus ring so you land on the right person. Link targets are validated at build time —
  a coach on a team with no staff card fails the build.
- **Coach names on the teams page are first names only** ("17 National - Jawn"), in the team title,
  the jump-nav label and the coach line. Full names stay on the staff page. The build asserts the
  shortened labels are still unique.
- **Team cards are cream** (were white) and the **sticky team nav is black** with white links and a
  gold rule. The site default link colour for that bar (teal-dark) would have been **1.6:1** on black;
  white is **18:1**.
- **[HM-08] Visit Us** is a black band with a cream information panel. **Boomtown Fieldhouse** now
  links to boomtownathletics.com; sanctioning is split into **RMR / USAV** and **AAU** with each
  linked (AAU resolves to aausports.org/volleyball — verified, not guessed); open gym reads
  **Wed / Fri (Sept–Oct)** and the "three days a week, through August" subtitle is gone.
- **SEO:** teams.html gained `ItemList` / `SportsTeam` structured data for all 14 teams.

---

## v1.73 — 2026-08-29 · Coaching-staff colour rework
`coaching-staff.html`

- **Club Leadership: the black moved from the card to the section.** The previous build painted
  the *photo area* black, which is not what was asked — the **section band** is black now
  (`bg-dark`) and the photo placeholder is back to the standard light treatment, so the cards read
  as cards rather than holes in the page.
- **Header text reversed to gold and white**: the "Club Leadership" heading is gold on the black
  band, and on the nameplate the **name is gold** with the **title in white**. The nameplate moved
  from `--teal` to `--teal-dark` for one reason: gold on `--teal` is **2.7:1**, a contrast failure,
  while gold on `--teal-dark` is **4.16:1**, which clears the 3:1 bar for large text (the name is
  20px bold). The build now fails if any of these five pairings drops below its threshold.
- **Coaches now sit on the teal gradient** (`bg-teal-d`, was cream), and the single "Coaching Staff"
  grid is split into **Coaches** (8) and **Assistant Coaches** (6). The split is derived from the
  existing card markup, not retyped, so no name can drift.
- **Assistant coaches get cream nameplates** (`--cream`), which is what distinguishes them from the
  head coaches' white ones. The "Interested in Coaching?" button went gold — teal-on-teal would
  have disappeared into the new background.

---

## v1.72 — 2026-08-29 · Uniform fitting time; 12U/18U pulled; Damon retitled
`teams.html`, `coaching-staff.html`, all 12 full-nav pages (`[ANN]`), `index.html` (`[HM-POP]`),
`tryouts.html`, `schedule.html`, `girls-club.html`

- **Uniform fitting is Sunday Sept 13, 5:00–8:00 PM** — the last "Time TBA" on the site is gone.
  Published on the announcement note (12 pages), the home popup table and bullet, the Tryouts page
  note, the Club Calendar row, and the girls-club season timeline. The popup's sessionStorage key was
  **deliberately not bumped**: the tryout dates people already dismissed it over have not changed, so
  re-opening it for everyone would be noise.
- **12U Colorado and 18U National are no longer public** — the owner is still deciding those rosters.
  Both were coach-OPEN with no schedule. The public team count is back to **14** and the jump nav
  rebalanced to two rows of seven. Their markup lives in git at `3b3c8c5` if they return.
- **Damon Sichler is now Assistant Club Director** (was Girls Club Director) on the staff page.
- Confirmed by the owner and left as built: **Ken = Kyn Van**, and 15 National - Sidney Reese's
  "OPEN (Katie)" assistant stays unassigned.

---

## v1.71 — 2026-08-29 · Full team/coach roster; club leadership on the staff page
`teams.html`, `coaching-staff.html`

- **`teams.html` now carries the owner's full roster: 16 teams**, up from 14. **12U Colorado** and
  **18U National** are new — both have OPEN coaching and no schedule yet, so they show a name, a
  level tile, and "Schedule will be posted here soon."
- **Every team name ends with its head coach** ("13 Colorado - Micheal Zhu"), and the line beneath
  reads "Head Coach: X · Assistant: Y". The roster's numeric suffixes (Colorado 1 / 2, National 1 / 2)
  were dropped in favour of the coach name, per the owner's earlier instruction. **OPEN and PENDING
  render as nothing at all** — a build-time guard fails if either string reaches the page.
- **Jump nav is now two rows of eight**, which the 16-team roster makes exact. Labels carry a coach
  surname only where two teams share a name (14 Colorado, 15 National, 16 Colorado); the nav
  container was widened to 1460px so neither row scrolls sideways.
- **`coaching-staff.html`**: new **Club Leadership** block at the top — **Tara Tucker, Club
  Operations Director** and **Damon Sichler, Girls Club Director** — on black cards with teal
  nameplates. Below it the coach cards are now generated from the same roster data, each showing
  the coach's role and the teams they take (14 coaches). One source of truth: editing the
  roster updates both pages.
- **Name resolution:** the roster's first-name-only coaches were matched to the owner's name list
  five-for-five — Will → Will Ly, Claire → Claire Kwok, Jae → Jae Spain, Randy → Randy Vang, and
  **Ken → Kyn Van** (the one inference; flagged for confirmation). "OPEN (Katie)" and "PENDING" were
  both treated as unassigned.

---

## v1.70 — 2026-08-29 · Coaching roster added; unassigned teams show no coach line
`coaching-staff.html`, `teams.html`

- **`coaching-staff.html`**: the three generic placeholder cards (Head Coach / Girls Program, etc.)
  are replaced with the real 2026–27 roster supplied by the owner: **Will Ly, Kyn Van, Claire Kwok,
  Jae Spain, Randy Vang**. Titles and team assignments were **not** supplied, so none were invented —
  each card carries the name and a photo placeholder only. Add a `<span>` under a name to give it a
  role or team. Section heading changed from "Staff Roster Coming Soon" to "2026–27 Coaching Staff",
  and the meta description was updated to match.
- **`teams.html`**: per owner, a team with no assigned coach now shows **no coach line at all**
  rather than "Coaches: To be announced" — 12 of 14 teams. The two assigned teams
  (15 National - Tara, 15 National - Sidney) are unchanged. Filling a coach in the page's team list
  restores the line automatically.
- **Still pending:** the team-to-coach mapping. The owner's message referenced an OPEN/assigned
  roster that did not come through, so the five names are on the staff page but not yet attached to
  teams. Tara and Sidney are first-name-only and are therefore not on the staff page yet.

---

## v1.69 — 2026-08-29 · September tryouts + uniform fitting, open gym Wed/Fri, teams page detail
All 12 full-nav pages (`[ANN]`), `legal.html`, `index.html` (`[HM-POP]`), `tryouts.html`,
`schedule.html`, `programs.html`, `club.html`, `girls-club.html`, `teams.html`

- **New tryout dates**: Sun **Sept 13, 6:00–7:00 PM** and Sun **Sept 20, 1:00–2:00 PM**, plus a
  **uniform fitting Sept 13** (time still TBA). Added to the announcement bar, the home popup, the
  Tryouts page table, the Club Calendar table, and the girls-club season timeline. The popup's
  sessionStorage key was bumped to `cobo-popup-v169` so returning visitors see it again.
- **Passed dates removed**: Aug 17/19/21/22/**24** are gone from every surface. **Aug 31 was kept** —
  it had not happened yet at build time (built Sat Aug 29) — and carries
  `data-show-until="2026-08-31"` so it retires itself rather than needing another edit. Deleting a
  still-upcoming tryout would have cost the club a session's registrations.
- **Open gym is now Wed / Fri only** (was Mon/Wed/Fri), swept across the announcement note, Tryouts
  page (open-gym + 15U–18U ongoing callouts), Programs, Club Calendar, home contact panel, and the
  club FAQ. Team *practice* days (M/W/F or T/Th/F per team) are a different thing and were left alone.
- **`teams.html`**: every team gained a **Practice Times** collapsible (content to follow).
  Tournament names spelled out and located — `EOYR` → **RMR End of Year Regionals**, Hype Nation
  Rumble → **(Casper WY)**, PNQ → **(Philadelphia PA)**; Colorado events stay unqualified per owner.
  Coach names now render at the end of the team name ("15 National - Tara"), driven by one field per
  team in the page's team list, so filling the remaining 12 is a one-word edit each.

**Build note:** the first attempt at this entry was written through a bash double-quoted string and
backtick code spans were silently eaten by command substitution. Long prose belongs in a file written
by the build script, never inlined into a shell string.

---

## v1.68 — 2026-08-29 · Teams page (new), Private & Group Lessons, Damon paused to Nov, no-gray pass
`teams.html` (NEW), `assets/img/teams-hero.jpg` (NEW), `programs.html`, `club.html`, `tryouts.html`,
`schedule.html`, `sitemap.xml`, `assets/css/styles.css`, nav dropdowns on all full-nav pages

- **NEW `teams.html`** — all 14 girls teams for 2026–27 with owner-provided tournament schedules.
  Each team is a collapsible card (coaches line + Roster + Schedule); a **sticky two-row jump nav**
  follows the scroll and smooth-scrolls to (and auto-opens) the target team — plain anchor jumps
  don't open a closed `<details>`, so links are JS-driven with a computed offset for the two sticky
  bars. Duplicate teams (two 14 Colorado, two 16 Colorado) share one jump link until coach names
  arrive to tell them apart (owner convention: "15 National - Tara", hyphen not parentheses).
  Rosters/most coaches say "to be announced" — **no placeholder names went live**. Hero = new team
  photo; "Follow us on Instagram @coboomvb" under the title. Linked from Club Info > Our Teams.
- **`programs.html` [PG-06]** — new Private & Group Lessons section after Camps ($80 minimum
  1-on-1, $50/player groups of 2+). The whole pricing box is the mailto link (owner: no redundant
  inner buttons); How-It-Works boxes are black. Section order now Camps → Private Lessons →
  Outdoor → Littles, and the Programs dropdown was realigned to match page order (off-page
  Advanced Skills item last) with the new Private/Group Lessons item — dropdown updated on every
  full-nav page.
- **Coach Damon training paused until November** (programs, club, tryouts, schedule): current
  Mon/Wed listings replaced by "returns in November · Wed / Fri" notes that retire themselves
  Oct 31 (`data-show-until`), while the full Wed/Fri listings + signup CTAs are authored hidden
  and **restore themselves Nov 1** (`data-show-from`) — no future edit needed. Original copy kept
  in [KEEP] comments.
- **No-gray text pass** (`styles.css`): owner directive "stop using gray text throughout the
  website" — `--gray-text` #555→#111, `--gray-meta` #AAA→#444, `.sched td` #222→#111. Tokens kept
  so one edit governs the site.

---

## v1.67 — 2026-08-24 · Site-wide line-balancing (hanging lines)
`assets/css/styles.css`

Per owner: review short 1–3 word trailing lines ("hanging lines"). v1.56 applied
`text-wrap:balance/pretty` to a few classes; extended it to **every** heading (`h1–h4` →
balance) and body block (`p, li, dd, figcaption, blockquote` → pretty). The browser now
redistributes words so a lonely last word gets pulled up. **Why not just widen columns:**
line length drives readability (~60–75 characters is the target), so widening to fix a widow
would hurt more than it helps — balancing fixes the symptom without changing measure.
Progressive enhancement; engines without `text-wrap` wrap as before.

---

## v1.66 — 2026-08-24 · Date-based auto-hide engine
`assets/js/main.js`, all 12 pages (`[ANN]`)

Answers the recurring date-upkeep problem (dates had to be hand-edited every few days). New
in `main.js`: a small engine that shows/hides elements by date on each page load, judged in
**America/Denver** time so it flips at local midnight regardless of the visitor's timezone.
- `data-show-until="YYYY-MM-DD"` — hides the element the day **after** that date.
- `data-show-from="YYYY-MM-DD"` — reveals it on that date (author the element `hidden` +
  `style="display:none"` so it stays hidden until then, no flash).
- **Fail-safe:** a bad/missing date is left as authored; with JS off, `until` content stays
  visible (never a blank gap) and `from` content stays hidden.

Applied to the `[ANN]` banner on all 12 pages: only the expiring phrase
"· Official Tryouts Aug 24 & 31" is wrapped in `data-show-until="2026-08-31"`. On **Sep 1** it
retires itself, leaving "Girls Club & RYL Tryouts · 10U–14U · Register Now!" — no gap, no
invented off-season copy. Verified: wrapped exactly once per page, `main.js` passes
`node --check`, hide fires 2026-09-01 and shows through 2026-08-31. **To reuse:** tag any dated
block with the attributes above (e.g. the `[ANN]` `.ann-note` "through August" line next).

---

## v1.65 — 2026-08-24 · De-AI copy pass (remove em-dash overuse + AI-isms)
all 12 pages

Per owner: strip AI writing tells and em dashes, use correct punctuation. Ran a scripted,
verified pass (exact replacements + positive controls, the method in EDITING_GUIDE) across
rendered body text: **~290 em dashes → punctuation** (colons for headings/labels, commas/periods
in prose). Testimonial attributions keep their em dash (conventional, correct). Shared blocks
(NAV/ANN/RB/OCSR/FT) changed identically on every page. Head metadata cleaned on
index/legal/schedule (title/description/og/twitter). Homepage: rewrote the fragment-cascade
paragraph ("We're different. … the player's journey…") into natural prose; dropped "elite" from
the tagline and meta. **Why scripted:** a naive find/replace has shipped bugs here before;
the pass skipped `<head>`, comments, `<script>`/`<style>`, protected attributions, and verified
zero rendered em dashes remained. Facts, dates, prices, links, IDs, and JSON-LD unchanged.

---

## v1.64 — 2026-08-24 · Club phone in metadata + quiet contact row
`index.html`

Per owner: list the phone for Google but keep email primary and the number something a visitor
has to look for. Filled the empty `"telephone"` in the SportsClub/LocalBusiness JSON-LD
(**+1-720-773-0067**) — the on-site metadata Google reads. Added a plain **Phone** row to the
homepage `[HM-08]` contact block below Email (tel: link, no button) with the note "Email is the
fastest way to reach us." **Deliberately not** in the nav or footer, so it stays out of the
always-visible chrome. (The Google Business **Profile** itself is edited at business.google.com,
not on the site.)

---

## v1.63 — 2026-08-24 · Programs reorder + recolor
`programs.html`

Per owner: Girls League above RYL; Open Gym after RYL. New order: Skills Training → **Girls
League → RYL → Open Gym** → Camps → Littles → Outdoor. Recolored to keep the light/dark
alternation intact (no two adjacent sections share a ground, the v1.56 lesson): Girls League &
Open Gym → `bg-teal-d`; RYL & Outdoor → `bg-white`, with button swaps for contrast
(RYL/Outdoor → `btn-outline-teal`, Open Gym → `btn-outline-white`). Jump-nav reordered to match.
Anchor IDs unchanged so the shared nav's `#dev-training`/`#ryl`/`#camps`/`#littles` links still
resolve. Shared blocks untouched (git diff confirmed only programs.html changed).

---

## v1.62 — 2026-08-23 · Unified "Skills Training Membership" on Programs
`programs.html`

Per owner (demo approved): the training options are one program, so consolidated **[PG-02]
Developmental + [PG-02t] Add-On + [PG-02b] Advanced Skills** into one **Skills Training Membership**:
- One membership, tiered price **$150 club members / $295 open enrollment** per month (site's
  `.mship--teal` box, single training signup form).
- Three included sessions, each linking to a full description below (`#s-dev` / `#s-adv` /
  `#s-damon`): Developmental (Tues/Thurs 5:00–6:30), Advanced 14+ (Tues/Wed/Thurs 5:00–7:00),
  Coach Damon (Mon/Wed 7:00–8:30). Open gyms & tryout fees are no longer listed as included, per owner.
- Kept `id="dev-training"` so the shared nav "Developmental Training" link still resolves; trimmed the
  page jump-nav (removed Add-On + Advanced; renamed Developmental → Skills Training).
- Verified in a headless browser at desktop (1250px) and mobile (390px) before publishing.

**Flagged:** the Tryouts page still has a separate "Summer Membership" box listing open gyms + tryout
fees and older session times — align it to this membership, or is it a distinct offer?

---

## v1.61 — 2026-08-23 · Copy-review follow-ups (owner answers)
`club.html`, `programs.html`, `boys-club.html`

- **Girls League** window reversed **Oct–Aug → Aug–Oct**; added "open to any Colorado Boom club
  player" (Programs + the two club.html references).
- **Payment schedule** corrected: Quarterly is now **deposit at signing, then September, December &
  March** (was "half in January, balance in April").
- **Boys program overview** made generic — dropped the girls-only Club Fees link; boys fees are by
  contact for now, per owner.

Confirmed no change: open gym "through August" (changes in Sept); RYL stays girls-focused (it's open
to boys, but no need to mention); no 10U/11U age-table rows (they play up); coach photos to be added
later once the owner has them.

---

## v1.60 — 2026-08-23 · Copy-review fixes
`club.html`, `girls-club.html`, `boys-club.html`, `parent-resources.html`, `index.html`, `programs.html`

A full-site copy review turned up factual / consistency issues (the training sections were excluded —
being redesigned; the schedule calendar left historical). Fixed:
- **Open-gym time** on `club.html` read "5–7 PM"; every other page says **5:30–7:00 PM** — corrected.
- **Girls / Boys program overview** still listed the retired 4-level fee model ("Regional (14U & below)"
  …), contradicting the age-scoped Club Fees. **Girls** rewritten to the 11U–14U / 15U–18U model;
  **boys** made general and pointed to Club Fees / contact (boys pricing is not yet defined on the
  Club Fees page — flagged).
- Homepage popup leftovers from removed evaluations: caption "Evaluations & Tryouts" → "Official
  Tryouts"; "(dates below)" → "(dates above)"; popup key `v157→v158`.
- `girls-club.html` season table "Aug 21–31" → "Aug 24–31" (matches remaining tryouts).
- "all summer" → "through August" (home); "Needs Based" → "Need-Based"; camp "Dates TBD" →
  "to be announced".

Flagged for the owner (not changed): RYL framed girls-only on `programs.html` but boys-included on
club/tryouts; Girls League "Oct–Aug / $80 for 8 weeks" window is unclear; coach-photo placeholders;
whether to add 10U/11U rows to the RMR age table; the "Quarterly" payment label.

---

## v1.59 — 2026-08-23 · Date correction (Aug 22 passed) + training price made consistent
`tryouts.html`, `index.html`, `club.html`, `programs.html`, all banners

- **Today is Sun Aug 23**, so the Sat Aug 22 session has passed. Removed it site-wide: banner
  (12 pages) now "Aug 24 & 31"; tryouts table + this-week callout + "join us" cross-link; homepage
  popup row (key bumped `v156→v157`); club 11U-14U note; forward-looking "Aug 22-31" window →
  "Aug 24-31". **Remaining tryouts: Aug 24 & 31.** schedule.html calendar stays historical.
- **Training price made consistent** per owner: the tryouts "Summer Membership" showed $295/month
  only; now shows **$150–$295** ($150 club members / $295 community) to match the Add-On section.
  (The full unified-program presentation is a separate demo, pending owner review.)

---

## v1.58 — 2026-08-22 · Refresh dates that have passed
all pages

As of Aug 22, the Aug 20 offer release and the Aug 21 tryout session have passed. Updated site-wide:
- **Announcement banner** (12 pages): "Aug 21, 22, 24 & 31" → "Aug 22, 24 & 31".
- **OCS bar** (11 pages) + FAQs + popup: the passed "offers release 9:00 PM, Aug 20 … accept within
  48 hours" line is now evergreen ("offers are sent through the RMR OCS after tryouts,
  pre-evaluated players first").
- **tryouts.html**: removed the Fri Aug 21 session from the this-week callout, the tryout table,
  and the "join us at tryouts" cross-link; offer bullets made evergreen.
- **index.html popup**: removed the Aug 21 row; popup key bumped `v155→v156` so returning visitors
  see the update.
- **club.html**: 11U-14U tryout note "Aug 21" → "Aug 22, 24 & 31"; two offer FAQs made evergreen.
- Forward-looking "Aug 21-31" window → "Aug 22-31" (home hero, popup, programs RYL note).

Left as-is on purpose: `schedule.html` calendar and the `girls-club.html` season table (historical
record), the tryouts `SportsEvent` schema `startDate` (2026-08-21 — the event's actual start;
`endDate` Aug 31 is future), and build-comment history. Kept today (Aug 22) and future (Aug 24, 31);
RYL Sep-Oct and the Nov-June season are future.

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
