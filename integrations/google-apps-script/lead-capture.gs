const SPREADSHEET_ID = "PASTE_SPREADSHEET_ID_HERE";
const SHEET_NAME = "Leads";

function doGet() {
  return ContentService.createTextOutput(
    JSON.stringify({
      ok: true,
      service: "steklostroygroup-lead-capture",
    }),
  ).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const lead = parseLead_(e);
    const sheet = getSheet_();

    ensureHeader_(sheet);
    sheet.appendRow([
      lead.submittedAt,
      lead.name,
      lead.phone,
      lead.product,
      lead.message,
      lead.page,
      lead.source,
      lead.consent,
    ]);

    return ContentService.createTextOutput(
      JSON.stringify({
        ok: true,
      }),
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({
        ok: false,
        error: String(error),
      }),
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function parseLead_(e) {
  const params = (e && e.parameter) || {};

  return {
    submittedAt: valueOrDefault_(params.submittedAt, new Date().toISOString()),
    name: valueOrDefault_(params.name, ""),
    phone: valueOrDefault_(params.phone, ""),
    product: valueOrDefault_(params.product, ""),
    message: valueOrDefault_(params.message, ""),
    page: valueOrDefault_(params.page, ""),
    source: valueOrDefault_(params.source, "steklostroygroup-site"),
    consent: valueOrDefault_(params.consent, "no"),
  };
}

function getSheet_() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const existing = spreadsheet.getSheetByName(SHEET_NAME);

  if (existing) {
    return existing;
  }

  return spreadsheet.insertSheet(SHEET_NAME);
}

function ensureHeader_(sheet) {
  if (sheet.getLastRow() > 0) {
    return;
  }

  sheet.appendRow([
    "submitted_at",
    "name",
    "phone",
    "product",
    "message",
    "page",
    "source",
    "consent",
  ]);
}

function valueOrDefault_(value, fallback) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  return String(value);
}

