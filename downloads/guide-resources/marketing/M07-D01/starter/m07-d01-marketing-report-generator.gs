/**
 * 마케팅 교육용 Apps Script 예제
 * 활성 행의 값을 새 Google Docs 문서로 옮깁니다.
 * 실제 개인정보가 없는 실습용 Sheet 사본에서만 사용하세요.
 */
const CONFIG = {
  sheetName: "폼 응답 1",
  titlePrefix: "마케팅 실습 보고서",
  outputFolderId: ""
};

function createReportFromActiveRow() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName(CONFIG.sheetName);
  if (!sheet) throw new Error("시트 이름을 확인하세요: " + CONFIG.sheetName);

  const activeRange = sheet.getActiveRange();
  if (!activeRange) throw new Error("응답 행의 셀 하나를 선택하세요.");
  const row = activeRange.getRow();
  if (row < 2) throw new Error("제목 행이 아닌 응답 행을 선택하세요.");

  const lastColumn = sheet.getLastColumn();
  const headers = sheet.getRange(1, 1, 1, lastColumn).getDisplayValues()[0];
  const values = sheet.getRange(row, 1, 1, lastColumn).getDisplayValues()[0];
  const record = Object.fromEntries(headers.map((header, index) => [header, values[index]]));

  const document = DocumentApp.create(CONFIG.titlePrefix + " - " + row);
  const body = document.getBody();
  body.appendParagraph(CONFIG.titlePrefix).setHeading(DocumentApp.ParagraphHeading.HEADING1);

  headers.forEach((header) => {
    body.appendParagraph(header).setHeading(DocumentApp.ParagraphHeading.HEADING2);
    body.appendParagraph(record[header] || "확인 필요");
  });

  document.saveAndClose();
  if (CONFIG.outputFolderId) {
    const file = DriveApp.getFileById(document.getId());
    file.moveTo(DriveApp.getFolderById(CONFIG.outputFolderId));
  }

  console.log(document.getUrl());
  return document.getUrl();
}
