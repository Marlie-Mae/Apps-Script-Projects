function doGet(e) {
  var page = e && e.parameter.page ? e.parameter.page : 'Login';
  return HtmlService
    .createTemplateFromFile(page)
    .evaluate()
    .setTitle("PCN Hub Login");
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}


function checkLogin(caredcode, password) {

  var spreadsheet = SpreadsheetApp.openById('1mu9WnGEzuMwV9FdHO5bmwmuQXSQAQlB_jSOx5DxxOPQ');
  var sheet = spreadsheet.getSheetByName('CREDENTIALS');
  var values = sheet.getDataRange().getValues();

  for (var i = 1; i < values.length; i++) {

    var sheetCaredCode = values[i][1];
    var sheetPassword = values[i][2];

    if (sheetCaredCode == caredcode && sheetPassword == password) {
      return {
        status: "success",
        row: values[i]
      };
    }
  }

  return { status: "error", message: "Invalid username or password" };
}
