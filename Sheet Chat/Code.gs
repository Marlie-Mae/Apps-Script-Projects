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

const PRESENCE_SHEET = "Presence";

function updateLastSeen(username) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName(PRESENCE_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(PRESENCE_SHEET);
    sheet.appendRow(["Username", "LastSeen"]);
  }

  const data = sheet.getDataRange().getValues();
  const now = new Date();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === username) {
      sheet.getRange(i + 1, 2).setValue(now);
      return;
    }
  }

  sheet.appendRow([username, now]);
}

function getLastSeen(username) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(PRESENCE_SHEET);
  if (!sheet) return null;

  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === username) {
      return Utilities.formatDate(
        new Date(data[i][1]),
        Session.getScriptTimeZone(),
        "HH:mm"
      );
    }
  }
  return null;
}

function setTyping(fromUser, toUser) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(PRESENCE_SHEET);
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === fromUser) {
      sheet.getRange(i + 1, 3).setValue(toUser);
      return;
    }
  }
}

function clearTyping(fromUser) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(PRESENCE_SHEET);
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === fromUser) {
      sheet.getRange(i + 1, 3).setValue("");
      return;
    }
  }
}

function isTyping(otherUser, me) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(PRESENCE_SHEET);
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === otherUser && data[i][2] === me) {
      return true;
    }
  }
  return false;
}

function getUnreadCount(me) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(CHAT_SHEET);
  const data = sheet.getDataRange().getValues();

  const counts = {};

  for (let i = 1; i < data.length; i++) {
    const [ , from, to, , read ] = data[i];
    if (to === me && read !== true) {
      counts[from] = (counts[from] || 0) + 1;
    }
  }

  return counts;
}


function markMessagesAsRead(me, other) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(CHAT_SHEET);
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    const from = data[i][1];
    const to = data[i][2];
    const read = data[i][4];

    if (from === other && to === me && read !== true) {
      sheet.getRange(i + 1, 5).setValue(true);
    }
  }
}

// logout
function logoutUser() {
  const props = PropertiesService.getUserProperties();
  props.deleteAllProperties();
}

// for online status
function getOnlineStatus() {
  const sheet = SpreadsheetApp
    .openById(SHEET_ID)
    .getSheetByName(PRESENCE_SHEET);

  if (!sheet) return {};

  const data = sheet.getDataRange().getValues();
  const now = new Date();
  const status = {};

  for (let i = 1; i < data.length; i++) {
    const username = data[i][0];
    const lastSeen = data[i][1];

    if (!lastSeen) {
      status[username] = false;
      continue;
    }

    const diff = (now - new Date(lastSeen)) / 1000;
    status[username] = diff <= 10; // online if active in last 10s
  }

  return status;
}

