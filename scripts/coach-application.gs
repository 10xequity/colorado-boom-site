/**
 * Colorado Boom - Coach Application receiver (BACKUP OPTION)
 *
 * The live hiring page uses an embedded Google Form. This script is the alternative if
 * the club ever wants a form styled like the site instead: the page would POST the
 * answers here as JSON, and this writes one row to a Google Sheet and emails admin@.
 *
 * Works two ways:
 *   1. Attached to a Sheet (Extensions > Apps Script inside the sheet). It uses that sheet.
 *   2. Standalone (script.google.com). First run of setup() creates a "Coach Applications"
 *      sheet in your Drive and remembers it. Or paste an existing sheet's ID into SHEET_ID.
 *
 * FIRST TIME: pick setup() in the toolbar dropdown and press Run. Approve the permission
 * screens. You get an email with the sheet link when it worked. Then Deploy > New deployment
 * > Web app > Execute as: Me / Who has access: Anyone > Deploy. Full steps in HIRING_FORM.md.
 */

var SHEET_ID     = '1dnhtyxG3TOX-ViLE-robK07XdJgNB7xoIjSzcqlOCMw'; // "Coach Applications" sheet (boomtownvball@gmail.com Drive)
var SHEET_NAME   = 'Applications';
var NOTIFY_EMAIL = 'admin@coloradoboom.com';
var REQUIRED     = ['name', 'email', 'phone', 'position'];

var FIELDS = ['name','email','phone','city','position','teamType','ageGroups',
  'practiceDays','yearsCoaching','playingLevel','certifications','background',
  'resume','hearAbout','contactPref','notes'];

var LABELS = {
  name:'Full name', email:'Email', phone:'Phone', city:'City',
  position:'Position', teamType:'Team type', ageGroups:'Age groups',
  practiceDays:'Practice days', yearsCoaching:'Years coaching',
  playingLevel:'Highest level played', certifications:'Certifications',
  background:'Coaching background', resume:'Resume / reference link',
  hearAbout:'How they heard about us', contactPref:'Best way to reach',
  notes:'Anything else'
};

/** Run this once by hand from the editor. It authorizes the script and creates the sheet. */
function setup() {
  var ss = getSpreadsheet_();
  getSheet_();
  MailApp.sendEmail(NOTIFY_EMAIL, 'Coach application script is ready',
    'Applications will be saved here:\n' + ss.getUrl());
  Logger.log('Sheet: ' + ss.getUrl());
}

function doPost(e) {
  try {
    var raw = e && e.postData && e.postData.contents;
    if (!raw) return json_({ ok: false, error: 'Empty request.' });
    var data = JSON.parse(raw);

    // Honeypot: real people never fill the hidden "website" field. Bots do.
    if (data.website) return json_({ ok: true });

    var missing = REQUIRED.filter(function (k) { return !String(data[k] || '').trim(); });
    if (missing.length) {
      return json_({ ok: false, error: 'Please fill in: ' + missing.map(function (k) { return LABELS[k]; }).join(', ') + '.' });
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(data.email))) {
      return json_({ ok: false, error: 'That email address does not look right.' });
    }

    var row = [new Date()].concat(FIELDS.map(function (k) { return clean_(data[k]); }));
    getSheet_().appendRow(row);
    notify_(data);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: 'Server error: ' + err.message });
  }
}

/** Health check: open the Web app URL in a browser; you should see {"ok":true,...}. */
function doGet() {
  return json_({ ok: true, service: 'coach-application', sheet: SHEET_NAME });
}

function getSpreadsheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();          // attached to a sheet
  if (ss) return ss;
  if (SHEET_ID) return SpreadsheetApp.openById(SHEET_ID);  // standalone, ID given
  var props = PropertiesService.getScriptProperties();     // standalone, remembered
  var id = props.getProperty('SHEET_ID');
  if (id) return SpreadsheetApp.openById(id);
  ss = SpreadsheetApp.create('Coach Applications');        // standalone, first run
  props.setProperty('SHEET_ID', ss.getId());
  return ss;
}

function getSheet_() {
  var ss = getSpreadsheet_();
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(['Submitted'].concat(FIELDS.map(function (k) { return LABELS[k]; })));
    sh.setFrozenRows(1);
  }
  return sh;
}

// Arrays (checkbox groups) become "a, b, c". Leading = + - @ get a quote so a pasted
// value can never run as a spreadsheet formula. Hard cap on length.
function clean_(v) {
  if (Array.isArray(v)) v = v.join(', ');
  v = String(v == null ? '' : v).trim();
  if (/^[=+\-@]/.test(v)) v = "'" + v;
  return v.slice(0, 2000);
}

function notify_(d) {
  try {
    var body = FIELDS.map(function (k) { return LABELS[k] + ': ' + clean_(d[k]); }).join('\n');
    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      subject: 'New coach application: ' + clean_(d.name) + ' (' + clean_(d.position) + ')',
      body: body + '\n\nAll applications: ' + getSpreadsheet_().getUrl()
    });
  } catch (e) { /* the row is already saved; a failed email must not fail the submission */ }
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Run once by hand: builds the Google Form the hiring page embeds. All 16 questions in
 * four sections, answers saved into the "Coach Applications" sheet, form published so
 * anyone with the link can respond. Emails the links to NOTIFY_EMAIL and writes them to a
 * "Setup" tab in the sheet. Safe to run again: it makes a new form each time, so delete
 * the old one in Drive if you do.
 *
 * Stands on its own: it can be pasted into an otherwise empty project and run.
 */
function createForm() {
  var NOTIFY_EMAIL = 'admin@coloradoboom.com';
  var ss = SpreadsheetApp.openById('1dnhtyxG3TOX-ViLE-robK07XdJgNB7xoIjSzcqlOCMw'); // "Coach Applications"
  var form = FormApp.create('Colorado Boom Coach Application');
  form.setDescription('2026–27 season. We review applications as they come in and follow up by email.')
      .setCollectEmail(false)
      .setLimitOneResponsePerUser(false)
      .setConfirmationMessage('Thanks, we have your application. We review applications as they come in and will follow up by email.');

  form.addSectionHeaderItem().setTitle('Contact');
  form.addTextItem().setTitle('Full name').setRequired(true);
  form.addTextItem().setTitle('Email').setRequired(true);
  form.addTextItem().setTitle('Phone').setRequired(true);
  form.addTextItem().setTitle('City you live in');

  form.addPageBreakItem().setTitle('The role');
  form.addListItem().setTitle("Position you're applying for").setRequired(true)
      .setChoiceValues(['Head Coach', 'Assistant Coach', 'Trainer', 'Open to any']);
  form.addMultipleChoiceItem().setTitle('Team type')
      .setChoiceValues(['Regional (non-travel)', 'Travel', 'Either']);
  form.addCheckboxItem().setTitle('Age groups you can coach')
      .setChoiceValues(['10U', '11U', '12U', '13U', '14U', '15U', '16U', '17U', '18U']);
  form.addCheckboxItem().setTitle('Practice days you can work')
      .setChoiceValues(['Mon/Wed/Fri 5–7 PM', 'Tue/Thu/Fri 5–7 PM', 'Either']);

  form.addPageBreakItem().setTitle('Experience');
  form.addListItem().setTitle('Years coaching')
      .setChoiceValues(['None yet, playing background', '1 to 3 years', '3 to 7 years', 'More than 7 years']);
  form.addListItem().setTitle('Highest level you played')
      .setChoiceValues(['High school', 'Club', 'College', 'Professional', 'Other']);
  form.addCheckboxItem().setTitle('Certifications you hold now')
      .setChoiceValues(['USAV IMPACT', 'SafeSport', 'CAP I or II', 'CPR / First Aid', 'None yet']);
  form.addParagraphTextItem().setTitle('Coaching background')
      .setHelpText("Where you've coached, positions you specialize in, how you like to develop players.");
  form.addTextItem().setTitle('Resume or reference link')
      .setHelpText('Google Drive, LinkedIn, or a reference contact.');

  form.addPageBreakItem().setTitle('Anything else');
  form.addTextItem().setTitle('How did you hear about us?');
  form.addListItem().setTitle('Best way to reach you').setChoiceValues(['Email', 'Phone call', 'Text']);
  form.addParagraphTextItem().setTitle("Anything else you'd like us to know?");

  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
  try { form.setPublished(true); form.setAcceptingResponses(true); } catch (e) { /* older forms model: live on creation */ }

  var pub = form.getPublishedUrl(), edit = form.getEditUrl();
  var tab = ss.getSheetByName('Setup') || ss.insertSheet('Setup');
  tab.clear();
  tab.appendRow(['Application form (share this link)', pub]);
  tab.appendRow(['Edit the questions', edit]);
  tab.appendRow(['Created', new Date()]);
  var msg = 'Application form (share this link):\n' + pub + '\n\nEdit the questions:\n' + edit +
            '\n\nResponses spreadsheet:\n' + ss.getUrl();
  MailApp.sendEmail(NOTIFY_EMAIL, 'Coach application form is ready', msg);
  Logger.log(msg);
}
