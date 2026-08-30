# Handoff — Colorado Boom website

**Updated** 2026-08-30 · **Live build** v1.76 · **Status** Active
**Supersedes** the 2026-08-24 handoff (v1.67)

A practical handoff so anyone can pick up the Colorado Boom site. Read this first, then
`EDITING_GUIDE.md` (how to edit), `DEPLOY_GITHUB.md` (how to publish), and `CHANGELOG.md` (why each
change was made, newest first).

---

## 1. What this is & where it lives

- **coloradoboom.com** — a plain static site (HTML/CSS/JS, no build step), **13 pages**.
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

## 4. Current state (v1.76, 2026-08-30)

Everything through **v1.76** is live (`5f2e028`). Full history in `CHANGELOG.md`. The 2026-08-29/30
work added two whole areas and changed several site-wide facts:

**New: `teams.html` (Our Teams)** — linked from **Club Info → Our Teams**.
- **14 teams live**, 13U through 17U. Each is a collapsible card: coach line, then **Roster**,
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
- **Tryouts: Sun Sept 13, 6:00–7:00 PM** and **Sun Sept 20, 1:00–2:00 PM**; **uniform fitting
  Sun Sept 13, 5:00–8:00 PM**. Mon Aug 31 is authored to retire itself after that date.
- **Coach Damon's advanced club training is paused until November** and returns **Wed / Fri**
  (was Mon/Wed). The notes retire themselves Oct 31 and the full listings restore themselves
  **Nov 1** — no edit needed. Original copy is preserved in `[KEEP]` comments.
- **No gray body text anywhere** — `--gray-text` is now `#111111`, `--gray-meta` `#444444`.
- Mobile fixes: the home page no longer scrolls sideways on phones, the tryout popup is
  scroll-locked and centres correctly, and jump-nav links meet touch-target size.

## 5. Open items / what's next

**Waiting on the club:**

1. **Player rosters** — all 14 teams show "Roster will be posted here soon."
2. **Coach photos** — `coaching-staff.html` shows "[ Coach photo ]" placeholders; swap in real photos
   (keep filenames per `IMAGES.md`).
3. **12U Colorado / 18U National** — decide whether they're real teams; markup is in git (§4).
4. **"Katie"** — the roster listed 15 National - Sidney Reese's assistant as "OPEN (Katie)", treated
   as unassigned. If she's confirmed, add her full name.
5. **"Ken" → published as "Kyn Van"** — inferred from the owner's name list (a clean five-for-five
   match on the first-name-only coaches). Owner confirmed, but the spelling is worth a second look.
6. **Google Form dates** — an email went to **zhu@boomtownvball.com** asking for Sept 13 & 20 to be
   added to `forms.gle/2fEhY72d9GdU5Q8H7` (same link, edited in place). Confirm it was done. Note the
   club's other drafts address Zhu at **zhu@coloradoaf.org** — worth checking which address reaches him.

**Pre-existing, still open:**

7. **Boys fees are not defined.** `club.html` Club Fees covers girls only. `boys-club.html` says
   "contact us". Add boys pricing when it's set.
8. **Tryouts `[TO-03]` "Summer Membership" box** still lists open-gym + tryout fees and older session
   times. Decide: align it to the Skills Training Membership, or keep it as a distinct seasonal offer.
9. **Minor spacing** — `club.html` `[CL-02]` and `[CL-08b]` carry ≤14px extra bottom padding. Every
   other section on all 13 pages is balanced.
10. **Design-linter noise** (the "impeccable" pop-ups) is an internal dev tool. **No effect on the
    live site**; ignore it.

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
| Tryouts | **Sun Sept 13, 6:00–7:00 PM** · **Sun Sept 20, 1:00–2:00 PM** |
| Uniform fitting | **Sun Sept 13, 5:00–8:00 PM** |
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
