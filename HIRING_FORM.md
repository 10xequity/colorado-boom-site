# Hiring Page Application — Setup & Care

**Version** 2.0 · **Created** 2026-09-12 · **Updated** 2026-09-12 · **Status** Active
**Supersedes** v1.0 (same day; that version described the Apps Script route as primary)

The Apply section on `join-our-staff.html` shows a Google Form inside a cream box that
matches the site. You build the form in Google Forms, send the link, and the page displays
it. Google stores every answer, blocks spam, and can email you each time someone applies.

Until the link is added to the page, the box shows a short "email us at admin@" message
instead, so the page is never broken.

## Current links (created 2026-09-12 by `createForm`, boomtownvball@gmail.com account)
- **Application form (this is what the page embeds):**
  https://docs.google.com/forms/d/e/1FAIpQLSdXYDEnpBD8VVK40O2CEnCFv734W7-b09oMmWX3wQC8TTfEvg/viewform
- **Edit the questions:** https://docs.google.com/forms/d/1UVt1YbzuSBFS1M8pT0i5MhqLyLzB6rGoZC65UXJzeOM/edit
- **Responses spreadsheet ("Coach Applications"):**
  https://docs.google.com/spreadsheets/d/1dnhtyxG3TOX-ViLE-robK07XdJgNB7xoIjSzcqlOCMw/edit
  Answers land on the "Form Responses 1" tab. The "Applications" tab belongs to the unused
  Apps Script backup and stays empty.
- **Script project ("COBO Recruiting"):**
  https://script.google.com/d/1q7HMCe7Hc-3-mDN3qPmx_pWSxTGWWqg9-MF3BVvctXjYsEHZ7wzlV239/edit

Menu wording below is quoted from Google's own help pages
(support.google.com/docs/answer/2839588, 2917686, 139706, 145737) unless marked *unverified*.

---

## Part A — Build the Google Form

### Fastest way: let the script build it (about 1 minute)
The `createForm` function at the bottom of `scripts/coach-application.gs` stands on its own:
paste just that function into the "COBO Recruiting" Apps Script project
(boomtownvball@gmail.com account), even replacing everything else there, click **Save**,
choose **createForm** in the toolbar dropdown, click **Run**, and approve the permission
screen (it asks for Forms access). It builds
the form below exactly, saves answers into the "Coach Applications" sheet, publishes it,
emails the links to admin@, and writes them to a **Setup** tab in that sheet. Then skip to
step 7. If you'd rather build it by hand, follow steps 1–7.

### 1. Create the form
Go to forms.google.com, click **Blank form**. Title it **Colorado Boom Coach Application**.
Description: `2026–27 season. We review applications as they come in and follow up by email.`

### 2. Add the questions, in this order
"Required" means click the **Required** toggle at the bottom-right of that question.
Use **Add section** (the two-bars icon in the side toolbar) to start each new group.

**Section 1 · Contact**
| # | Question | Type | Required |
|---|---|---|---|
| 1 | Full name | Short answer | Yes |
| 2 | Email | Short answer | Yes |
| 3 | Phone | Short answer | Yes |
| 4 | City you live in | Short answer | |

**Section 2 · The role**
| # | Question | Type | Options | Required |
|---|---|---|---|---|
| 5 | Position you're applying for | Dropdown | Head Coach · Assistant Coach · Trainer · Open to any | Yes |
| 6 | Team type | Multiple choice | Regional (non-travel) · Travel · Either | |
| 7 | Age groups you can coach | Checkboxes | 10U · 11U · 12U · 13U · 14U · 15U · 16U · 17U · 18U | |
| 8 | Practice days you can work | Checkboxes | Mon/Wed/Fri 5–7 PM · Tue/Thu/Fri 5–7 PM · Either | |

**Section 3 · Experience**
| # | Question | Type | Options | Required |
|---|---|---|---|---|
| 9 | Years coaching | Dropdown | None yet, playing background · 1 to 3 years · 3 to 7 years · More than 7 years | |
| 10 | Highest level you played | Dropdown | High school · Club · College · Professional · Other | |
| 11 | Certifications you hold now | Checkboxes | USAV IMPACT · SafeSport · CAP I or II · CPR / First Aid · None yet | |
| 12 | Coaching background | Paragraph | | |
| 13 | Resume or reference link | Short answer | | |

**Section 4 · Anything else**
| # | Question | Type | Options | Required |
|---|---|---|---|---|
| 14 | How did you hear about us? | Short answer | | |
| 15 | Best way to reach you | Dropdown | Email · Phone call · Text | |
| 16 | Anything else you'd like us to know? | Paragraph | | |

### 3. Match the site colours
Top right, click **Customize theme** (palette icon). Under **Color**, click **Add custom
color** and enter `0E7C86` (Boom teal). Pick a light background. Under **Header** you can
**Choose Image** and upload `assets/img/hiring-hero.jpg` if you want the photo up top.
Click **Close**.

### 4. Settings that make it work on a public website
Open the **Settings** tab at the top of the form.
- **Collect email addresses:** set to **Responder input** (people type it; no Google
  sign-in needed) — or leave off, since question 2 already asks for it.
- Leave **Limit to 1 response** OFF. Turning it on forces applicants to sign in to Google
  and many won't. *(toggle name unverified)*
- If you see a **Restrict to users in Boomtown Athletics** (or similar organisation)
  option, make sure it is OFF; otherwise only your staff can open the form.
  *(toggle name unverified; appears only on Google Workspace accounts)*

### 5. Save answers to a spreadsheet and get emailed
Click the **Responses** tab. At the top right click **More** (⋮) → **Select destination for
responses** → **Create a new spreadsheet** → **Create**. Then click **More** (⋮) again →
**Get email notifications for new responses**. You now get an email per applicant and a
spreadsheet with everything.

### 6. Publish it and let anyone with the link respond
Top right, click **Publish**. Click **Manage** to choose who can respond. Under **General
access**, choose the option that gives access to **anyone with a link** (not "Restricted").
Click **Done**, then **Publish**. The button should now read **Published**. Google's own
warning: "If the form is unpublished, responders with the link can't access it."

### 7. Send the link
Click **Published** (or **Share**) → **Copy responder link**. Do **not** tick "Shorten URL";
the long link that ends in `/viewform` is the one the page needs. Paste it to me (or into
`FORM_URL` at the very bottom of `join-our-staff.html`, between the quotes). Commit, push,
open the hiring page, submit a test application, and check the spreadsheet and your inbox.

### Changing questions later
Edit them in Google Forms. The page updates automatically; nothing on the website changes.

---

## Part B — Backup: a form styled like the site (Apps Script)

Not in use. Kept in case the club later wants form fields that look like the rest of the
site instead of Google's look. It needs a small Google script, which is the piece that did
not work first time. In plain terms: the script is a tiny program that lives in your Google
account, receives each application from the page, writes it into a spreadsheet, and emails
you. The code is in `scripts/coach-application.gs`.

Why it usually "doesn't work" the first time:
- **It was pasted somewhere that isn't attached to a spreadsheet.** The new version handles
  this: it creates its own "Coach Applications" sheet in your Drive the first time it runs.
- **The permission screen was closed.** Google shows a scary "unverified app" warning the
  first time. Click **Advanced** → **Go to (project name)** → **Allow**. It's your own
  script asking for permission to use your own sheet and email.
- **The page was never told the script's address.** The page needs the Web app URL pasted in.

Steps (Apps Script menu wording verified against developers.google.com/apps-script/guides/web
where quoted; the rest *unverified*):
1. Go to script.google.com → **New project**. Delete the sample code, paste the whole of
   `scripts/coach-application.gs`, press the save icon.
2. In the toolbar, change the function dropdown from `doPost` to **setup**, then click
   **Run**. Approve the permission screens. Within a minute you get an email
   "Coach application script is ready" with the spreadsheet link. If you got that email,
   the script works.
3. Click **Deploy → New deployment**. Next to "Select type", click the gear and choose
   **Web app**. Execute as: **Me**. Who has access: **Anyone**. Click **Deploy**. Copy the
   **Web app URL**.
4. Open that URL in a browser tab. You should see `{"ok":true,...}`. That confirms it's live.
5. Send me the URL. I switch the page from the Google Form to the site-styled form and wire
   it to that URL. (The site-styled form markup is in git history, v1.89 working tree.)
