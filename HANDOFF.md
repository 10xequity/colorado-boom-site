# Handoff — Colorado Boom website

**Updated** 2026-09-21 · **Live build** v1.93 · **Status** Active
**Supersedes** the 2026-08-24 handoff (v1.67)

A practical handoff so anyone can pick up the Colorado Boom site. Read this first, then
`EDITING_GUIDE.md` (how to edit), `DEPLOY_GITHUB.md` (how to publish), and `CHANGELOG.md` (why each
change was made, newest first).

---

## 1. What this is & where it lives

- **coloradoboom.com** — a plain static site (HTML/CSS/JS, no build step), **14 pages**.
- **Source of truth:** GitHub repo **`10xequity/colorado-boom-site`**, branch **`Main`** (capital M).
- **Hosting:** GitHub Pages, fronted by **Cloudflare** (caches ~10 min, so changes take a few
  minutes to appear — hard-refresh with Ctrl/Cmd+Shift+R).
- A `drafts` branch exists from 2026-08-29 and is **stale/superseded** — everything on it shipped.
  Safe to delete once someone confirms.

## 2. ⚠ Important caveat about the working copy

The local folder used in Claude sessions lives in a **temporary scratchpad directory** that can be
cleared at any time. **Do not treat it as the source of truth.** To continue:

```bash
git clone https://github.com/10xequity/colorado-boom-site.git
cd colorado-boom-site        # branch is "Main" (capital M)
git config core.autocrlf false   # see §7 — CRLF breaks scripted edits
# edit files, then:
git add -A && git commit -m "…" && git push origin Main
```

Pages redeploys automatically ~1 minute after the push.

## 3. How to publish an update

- **Non-technical:** edit the file on GitHub (pencil icon) → **Commit changes**. To swap a photo,
  upload a file with the **same name** into `assets/img/`. Full detail in `DEPLOY_GITHUB.md`.
- **Command line:** `git push origin Main`.

## 4. Current state (v1.93, 2026-09-21)

**v2.15 (2026-10-22):** Littles (Little Spikers, ages 6–9, Tue/Thu 5:00–6:30) is a session inside the Skills Training Membership on `programs.html` (#s-littles, #littles "Membership by Age Group"); nav/footer say "Littles (Ages 6–9)". Colorado Boom Camps (Nov 23–24, Dec 28–30, Jun 14–17, Jul 5–8, Jul 19–22; 9–4; groups 13 & under / 14–18) replaced the Nike block — **no Nike branding on this site**, Nike is promoted through Boomtown. Tryouts page: see the facts table. Photo library: `assets/img/library/` (+README index). Later entries live in CHANGELOG.md.

**v1.93 (2026-09-21):** tryouts moved to **Sun Oct 11, 2:00–3:00 PM** on all 15 pages (Sept 20 had
passed). Same self-retiring gates: every mention hides itself on Oct 12 and the "any Wed / Fri open
gym" fallback appears the same day; `legal.html` is the one hand edit. Popup key bumped to
`cobo-popup-v193`. Reasoning in CHANGELOG v1.93.

**v1.92 (2026-09-16):** `robots.txt` gained `Disallow: /api/` after Search Console reported the
Instagram Worker's JSON (`/api/ig`) as "Crawled – currently not indexed". The other two reports it
raised — "Page with redirect" for the `http://` / `www` variants and "Alternate page with proper
canonical tag" for `/index.html` — are the site working as designed and need nothing. Reasoning
in CHANGELOG v1.92.

**v1.85 (2026-09-02):** Summer Membership on `tryouts.html` is retired until summer 2027 (markup at
`b83ae5c`) and replaced by **Pre-season Practice & Training — Tues–Fri 5:00–7:00 PM, $295/mo
non-club members**; club rate $150/mo (v1.86); pre-season walk-in $10/class (v1.87). NOTE: general "drop-in" is a SEPARATE program (free club / $10 non-member) not yet placed on any page. Monday open gym/training
references removed site-wide. Details in CHANGELOG v1.85.

Everything through **v1.76** is live (`5f2e028`). Full history in `CHANGELOG.md`. The 2026-08-29/30
work added two whole areas and changed several site-wide facts:

**New: `teams.html` (Our Club Teams)** — linked from **Club Info → Our Club Teams** (renamed from
"Our Teams" in v1.81).
- **15 teams live**, 12U through 17U. A gold callout opens the list: **"Practice Begins
  November 2, 2026."** Every team practices **three days a week** (Friday added in v1.81, standard
  window 5:15–7:30 PM) — except **12 Colorado - Kula** (new in v1.81, coach Kula Tanuvasa), which is
  **Tue & Thu** per the owner.
- **Four club rosters are live as tile grids** (14 National - Tara, 14 Colorado - Kimberly,
  14 Colorado - Mel, 16 National - Damon); 16 Colorado - Zhu was pulled back to "posted soon"
  (v1.82, owner). **Jersey numbers**: add `<span class="pnum">12</span>` as a tile's first child
  and a gold corner badge renders it. ⚠ The Mel roster arrived labeled "16 Colorado - Mel" (no
  such team) and is published under 14 Colorado - Mel — still unconfirmed; see CHANGELOG v1.81.
- **`ryl-teams.html` is live** — five RYL teams, tile rosters (positions spelled out, v1.83),
  per-team practice days (all two a week; club teams are three), the official RMR event schedule
  on every card, and Makayla Clemons coaching the 12s. 12 Colorado's roster is deliberately
  withheld (owner). ⚠ Mel's RYL practice DAYS are an assumption (Tue & Thu at the owner's
  5:30–7:00); ⚠ name best-guesses (Elliana Foster, Aimee Aviles Ramirez, Kiarya McCready) are
  reasoned in CHANGELOG v1.83 — owner should confirm.
- **Tryouts message is combined** (v1.82): "Girls Club Tryouts · 10U-18U", no RYL mention and no
  age split on tryouts.html; the 15U-18U "ongoing" block became the black "Try Out at Any Open
  Gym" band (`#open-gym-tryouts`). The ANN banner everywhere and the home popup follow suit. Each is a collapsible card: coach line, then **Roster**,
  **Practice Times** and **Schedule** sub-panels.
- Team names end with the head coach's **first name** — "17 National - Jawn".
- A **sticky two-row jump bar** (black, white links) scrolls to and auto-opens a team. Plain anchors
  can't open a closed `<details>`, so the links are JS-driven with an offset for the two sticky bars.
- **12U Colorado and 18U National were built then pulled** at the owner's request (rosters undecided).
  Their markup is in git at **`3b3c8c5`** if they come back.
- Real 2026–27 tournament schedules are in. **Practice times carry no court numbers** — see §6.

**New: `coaching-staff.html` roster** — real staff, not placeholders.
- **Club Leadership** on a black band: **Tara Tucker** (Club Operations Director) and
  **Damon Sichler** (Assistant Club Director).
- Below, on cream: **Coaches** (8) and **Assistant Coaches** (6), four per row, each showing role and
  teams. Cards are **generated from the same roster data as the teams page**, so a coach change is one
  edit in one place.
- Every coach card has an id (`coach-first-last`); the teams page deep-links to it.

**New: Private & Group Lessons** — a section on `programs.html` (`#private-lessons`), in the
Volleyball Programs menu as "Private/Group Lessons". $80 minimum 1-on-1, $50/player for groups of 2+.
The **whole pricing box is the mailto link** (no inner button).

**Site-wide changes:**
- **Open gym is Wed / Fri only** (was Mon/Wed/Fri), 5:30–7:00 PM.
- **Tryouts: Sun Oct 11, 2:00–3:00 PM** is the only date (Sept 13 and Sept 20 have passed; v1.93
  moved every mention). Oct 11 is date-gated and retires itself on Oct 12. **Uniform fitting
  is by appointment: families email tt@coloradoboom.com (v1.94).**
- **Advanced Club Training is live: Tues / Thurs, 5:00–7:00 PM, no coach named** (owner, v1.97,
  2026-10-06; was Coach Damon, Wed/Fri 7:00–8:30, paused until Nov). The Nov-1 date gates and
  `[KEEP]` comments are gone on club, programs, schedule and tryouts — nothing flips on Nov 1 now.
- **club.html order (v1.97):** Practice → Season Schedules → Advanced Club Training → Age Groups →
  11U–14U Levels & Fees → RYL → 15U–18U Levels & Fees (cards + table) → What Your Fee Includes →
  Deposits, Payments & Conditional Fees → Uniforms. Fee-table header is "Features".
- **No gray body text anywhere** — `--gray-text` is now `#111111`, `--gray-meta` `#444444`.
- Mobile fixes: the home page no longer scrolls sideways on phones, the tryout popup is
  scroll-locked and centres correctly, and jump-nav links meet touch-target size.

## 5. Open items / what's next

**Waiting on the club:**

1. **Player rosters** — all 16 club teams live as of **v1.98** (names only, no positions). Source is
   Tara's "Team roster" sheet; parent emails live in the Drive sheet **"2026 COBO Parent Contacts"**,
   never on the site. Pending ("P") players stay off the page until they accept. 14 Colorado - Kula
   still needs a tournament schedule; 14 Colorado - Rob needs Rob's last name + staff card (v1.99).
   The home popup's Regis vs. CCU row has no date gate: remove it by hand after the game.
   **Coaches come from Tara's "Colorado Boom Schedule" sheet, Roster tab (v2.00), not "Team roster".**
   **Banners (v2.00):** gold = practice start; black = scrolling events ticker (edit BOTH lists,
   and legal.html by hand); cream OCS bar is `hidden`, so remove the attribute to bring it back.
2. **Coach photos** — `coaching-staff.html` shows "[ Coach photo ]" placeholders; swap in real photos
   (keep filenames per `IMAGES.md`).
3. **12U Colorado / 18U National** — decide whether they're real teams; markup is in git (§4).
4. **"Katie"** — the roster listed 15 National - Sidney Reese's assistant as "OPEN (Katie)", treated
   as unassigned. If she's confirmed, add her full name.
5. **"Ken" → published as "Kyn Van"** — inferred from the owner's name list (a clean five-for-five
   match on the first-name-only coaches). Owner confirmed, but the spelling is worth a second look.
6. **Google Form dates** — `forms.gle/2fEhY72d9GdU5Q8H7` (same link, edited in place) needs
   **Sun Oct 11, 2:00–3:00 PM** as a date option and the passed Sept dates removed. The form lives
   outside this repo. Earlier an email went to **zhu@boomtownvball.com** for the Sept dates; the club's
   other drafts address Zhu at **zhu@coloradoaf.org** — worth checking which address reaches him.

**Dated content — next manual touches (v1.93, 2026-09-21):**

- **After Sun Oct 11:** delete " · Tryouts Oct 11" from `legal.html`'s `.ann` div — that page has no
  date engine. Every other Oct 11 mention hides itself on Oct 12 and the open-gym fallback rows
  appear on their own.
- **Post-tryout messaging:** the home popup title and the `tryouts.html` callout both say "October".
  Decide what the banner and popup should say once tryouts are over; the "Try Out at Any Open Gym"
  band (v1.82) already carries the substance.

**Pre-existing, still open:**

7. **Boys fees are not defined.** `club.html` Club Fees covers girls only. `boys-club.html` says
   "contact us". Add boys pricing when it's set.
8. **Tryouts `[TO-03]` "Summer Membership" box** still lists open-gym + tryout fees and older session
   times. Decide: align it to the Skills Training Membership, or keep it as a distinct seasonal offer.
9. **Minor spacing** — `club.html` `[CL-02]` and `[CL-08b]` carry ≤14px extra bottom padding. Every
   other section on all 13 pages is balanced.
10. **Design-linter noise** (the "impeccable" pop-ups) is an internal dev tool. **No effect on the
    live site**; ignore it.
11. **`X-Robots-Tag: noindex` on the `/api/ig` Worker** (Cloudflare dashboard → Workers & Pages →
    the Instagram Worker → its response headers). `robots.txt` already blocks crawling of `/api/`
    (v1.92); the header is the belt to that suspender and cannot be set from this repo. The dev
    token in the environment is scoped to the Boomtown platform Worker and cannot see this zone,
    so it is a dashboard task or a Cloudflare connector authorization.

## 6. House rules — learned the hard way, don't undo these

| Rule | Why |
|---|---|
| **Never use gray text** | Owner directive, stated twice. Tokens were darkened site-wide so one edit governs. |
| **"OPEN" / "PENDING" never render** | A team with no coach shows **nothing** — not "TBA", not "OPEN". |
| **Practice times carry no court numbers** | The owner's own brief listed courts but opened with "IGNORE THE COURT ASSIGNMENTS, THEY ARE NOT VALID." The instruction wins. Don't reintroduce them from a pasted table. |
| **"Micheal Zhu" is referenced as "Zhu"** | Team names, coach lines, jump labels, and his anchor `#coach-zhu`. |
| **Coach name = one field** | On `teams.html`, filling a team's coach field updates the team title, the jump label and the coach line together. Don't hand-edit the three separately. |
| **Prefer date-gating over deleting** | `data-show-until` / `data-show-from` (engine in `main.js`, judged America/Denver). Aug 31 was kept rather than deleted because it hadn't happened yet — deleting a live tryout date costs registrations. |
| **Bump the popup key** | `cobo-popup-vNNN` in `index.html` (currently **`v169`**). Change the popup without bumping it and returning visitors never see the update. |
| **Shared blocks are copy-pasted** | `[NAV]`, `[ANN]`, `[RB]`, `[OCSR]`, `[FT]` appear on every page — change all of them, and remember **`legal.html` has its own header/banner** and must be edited by hand. |

**Two traps that produced real bugs:**

- **A light card inside a dark section inherits white text.** `.bg-dark` / `.bg-teal-d` set
  `color:#fff`; a `.coach` card placed inside one had its name render **white on white**, invisible.
  Restate `color` on card text, and watch specificity ties (`.coach .b h4` and `.coach--lead .b h4`
  are equal, so order decides). **Verify contrast by measuring the rendered page**, not the hex values
  you intended — and note that a `getComputedStyle` walker **cannot read gradient backgrounds**, so
  gradient-backed text reports a bogus 1:1 and needs a visual check.
- **Never inline long prose into a shell string.** A CHANGELOG entry written through a bash
  double-quoted string had every backtick eaten as command substitution; the command still exited 0.
  Write prose from a script file, use `git commit -F -` with a quoted heredoc, and read back what was
  written before committing.

## 7. Working with the repo from a script

Most edits in recent sessions were made by a small Node script that does **anchored** replacements
(assert the anchor appears exactly once, then replace) and a **verification sweep** before writing.
That pattern caught several mistakes before they shipped. Two things to know:

- **Set `git config core.autocrlf false`.** A default Windows clone rewrites the working tree to CRLF
  while the repo stores LF, and every multi-line anchor silently stops matching.
- **Guard against your own guards.** More than one "failure" in these sessions was the check being
  wrong, not the page — a regex missing a trailing `;`, a count including HTML comments, a contrast
  script that couldn't see gradients. Confirm what a failing check is actually measuring.

## 8. Facts you'll need

| Item | Value |
|---|---|
| Brand fonts | **Montserrat** (headings/buttons) + **Open Sans** (body) — locked |
| Brand colors | teal `#0E7C86`, teal-dark `#065A62`, gold `#E5B800`, cream `#FFF9F0`, black `#111111` |
| All styling | `assets/css/styles.css` (`:root` variables at top); all behavior in `assets/js/main.js` |
| Open gym | **Wed / Fri**, 5:30–7:00 PM |
| Tryouts | **2027–28 tryouts announced April 2027**; 2026–27 roster spots by private evaluation, email admin@ for an appointment (v2.15). Every "Try Out" button emails admin@. |
| Uniform fitting | By appointment — email **tt@coloradoboom.com** (v1.94) |
| Private lessons | 1-on-1 **$80 minimum** · group (2+) **$50/player** · booked by email |
| Tryouts form | `forms.gle/2fEhY72d9GdU5Q8H7` — **do not swap this link**, several pages point at it |
| Training signup form | `forms.gle/yvnstZ89psTTLmux7` |
| Open gym form | `forms.gle/5wyRdqmmUxUdhkK4A` |
| Summer membership form | `forms.gle/d4GT48VSgh4qve6Z6` (programs) |
| Parent resources form | `forms.gle/1Zjjtc1VyEsZqwZ9A` |
| Girls League form | `docs.google.com/forms/d/e/1FAIpQLScVc0co2_2f36uQCu1Mj1n2SySxPNOlFN2mGqcMIs3kL1wbSw/viewform` |
| Club member login | `https://colorado-boom.gymdesk.com/login` |
| Contact email | admin@coloradoboom.com (primary contact everywhere) |
| Phone | +1-720-773-0067 — LocalBusiness JSON-LD (index) + a quiet homepage `[HM-08]` row only; NOT in nav/footer, per owner |
| Sanctioning | **RMR / USAV** and **AAU**, each linked from `[HM-08]` |
| Venue link | Boomtown Fieldhouse → `https://www.boomtownathletics.com` |
| Instagram | `@coboomvb` — linked from the teams page hero and the footer |
| Auto-hide dated content | `data-show-until` / `data-show-from`; engine in `main.js`, America/Denver |
| `legal.html` | Has its **own** header/banner (not the shared block) — always edit it by hand |

Every page opens with a `<!-- BUILD vX … -->` comment and section codes (e.g. `[CL-06]`, `[PG-02]`,
`[TM-02]`, `[CO-03]`) so you can search for a spot by code. Page versions differ — a page only gets a
new BUILD stamp when it changes — so the newest stamp across the site is the live build number.

## 9. Club fees (unchanged)

- **Age-scoped:** an **11U–14U (Girls Club)** section and a **15U–18U** section on `club.html`; no
  pay-in-full discount. 11U–14U Colorado $4,875 / National (14U) $5,500; 15U–18U Regional $4,500 /
  Colorado $5,500 / National $6,000 (all = $4,500 base + travel).
- **Payment plan:** deposit at signing, then **September, December & March**; −$300 sibling discount.
- **Skills Training Membership** (Programs): $150 club members / $295 open enrollment per month.
- **Girls League** (Programs): Girls 14U–18U · Aug–Oct · $80 for 8 weeks.
- **RYL:** $500 RYL-only; included for rostered 14U & under club players.
