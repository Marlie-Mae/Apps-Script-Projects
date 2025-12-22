const SHEET_ID = "1caCoTBN6tA4vG-MzQcbssZ7YCgSJ4JhcLUa6b7pIiV8";
const CHAT_SHEET = "Chat";

function doGet() {
  return HtmlService
    .createTemplateFromFile("index")
    .evaluate()
    .setTitle("Sheet Chat");
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// for login 
const USERS_SHEET = "Users";

function loginUser(username, password) {
  const sheet = SpreadsheetApp
    .openById(SHEET_ID)
    .getSheetByName(USERS_SHEET);

  if (!sheet) return null;

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return null; // no users yet

  const data = sheet.getRange(2, 1, lastRow - 1, 3).getValues();

  for (let row of data) {
    const [userId, uname, pwd] = row;

    if (uname === username && String(pwd) === password) {
      PropertiesService.getUserProperties()
        .setProperty("currentUser", JSON.stringify({
          userId,
          username: uname
        }));

      return {
        userId,
        username: uname
      };
    }
  }

  return null;
}

// for dashboard
function getOtherUsers(currentUserId) {
  const sheet = SpreadsheetApp
    .openById(SHEET_ID)
    .getSheetByName(USERS_SHEET);

  if (!sheet) return [];

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];

  const data = sheet.getRange(2, 1, lastRow - 1, 3).getValues();

  return data
    .map(r => ({ userId: r[0], username: r[1] }))
    .filter(u => u.userId !== currentUserId);
}

//for chat
function sendMessage(fromUser, toUser, message) {
  const sheet = SpreadsheetApp
    .openById(SHEET_ID)
    .getSheetByName(CHAT_SHEET);

  sheet.appendRow([
    new Date(),
    fromUser,
    toUser,
    message
  ]);

  return true;
}

function getMessages(userA, userB) {
  const sheet = SpreadsheetApp
    .openById(SHEET_ID)
    .getSheetByName(CHAT_SHEET);

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];

  const data = sheet.getRange(2, 1, lastRow - 1, 4).getValues();

  const messages = data
    .filter(r =>
      (r[1] === userA && r[2] === userB) ||
      (r[1] === userB && r[2] === userA)
    )
    .map(r => ({
      from: r[1],        
      to: r[2],          
      message: r[3],     
      time: Utilities.formatDate(
        new Date(r[0]),
        Session.getScriptTimeZone(),
        "HH:mm"
      )
    }));


  return messages;
}
