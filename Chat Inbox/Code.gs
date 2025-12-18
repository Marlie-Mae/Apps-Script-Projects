const SHEET_ID = "1caCoTBN6tA4vG-MzQcbssZ7YCgSJ4JhcLUa6b7pIiV8";
const CHAT_SHEET = "Chat";

function doGet() {
  return HtmlService.createHtmlOutputFromFile("chat")
    .setTitle("Sheet Chat");
}

function sendMessage(user, message) {
  const sheet = SpreadsheetApp
    .openById(SHEET_ID)
    .getSheetByName(CHAT_SHEET);

  sheet.appendRow([new Date(), user, message]);
}

function getMessages() {
  const sheet = SpreadsheetApp
    .openById(SHEET_ID)
    .getSheetByName(CHAT_SHEET);

  if (!sheet) return [];

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];

  const values = sheet.getRange(2, 1, lastRow - 1, 3).getValues();

  // RETURN PLAIN DATA (IMPORTANT)
  return values.map(r => ({
    user: r[1],
    message: r[2]
  }));
}
