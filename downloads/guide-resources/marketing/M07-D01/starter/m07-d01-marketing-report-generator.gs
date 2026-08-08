/**
 * M07-D01 마케팅 교육용 Apps Script
 * 선택 행 또는 Google Sheet의 폼 제출 행을 Docs와 PDF로 변환합니다.
 * 실제 개인정보가 없는 실습용 사본에서만 사용하세요.
 */
const CONFIG = {
  sheetName: "폼 응답 1",
  idHeader: "요청ID",
  titlePrefix: "PICO 캠페인 콘텐츠 요청 카드",
  outputFolderId: "",
  docUrlHeader: "문서URL",
  pdfUrlHeader: "PDFURL"
};

function ensureHeader_(sheet, header) {
  const width = Math.max(sheet.getLastColumn(), 1);
  const headers = sheet.getRange(1, 1, 1, width).getDisplayValues()[0];
  const index = headers.indexOf(header);
  if (index >= 0) return index + 1;
  const column = width + 1;
  sheet.getRange(1, column).setValue(header);
  return column;
}

function createReportFromRow_(sheet, row) {
  if (row < 2) throw new Error("제목 행이 아닌 응답 행을 선택하세요.");
  const width = sheet.getLastColumn();
  const headers = sheet.getRange(1, 1, 1, width).getDisplayValues()[0];
  const values = sheet.getRange(row, 1, 1, width).getDisplayValues()[0];
  const record = Object.fromEntries(headers.map((header, index) => [header, values[index]]));
  const recordId = record[CONFIG.idHeader] || "ROW-" + row;

  const document = DocumentApp.create(CONFIG.titlePrefix + " - " + recordId);
  const body = document.getBody();
  body.appendParagraph(CONFIG.titlePrefix).setHeading(DocumentApp.ParagraphHeading.HEADING1);
  headers
    .filter((header) => header && ![CONFIG.docUrlHeader, CONFIG.pdfUrlHeader].includes(header))
    .forEach((header) => {
      body.appendParagraph(header).setHeading(DocumentApp.ParagraphHeading.HEADING2);
      body.appendParagraph(record[header] || "확인 필요");
    });
  document.saveAndClose();

  const documentFile = DriveApp.getFileById(document.getId());
  const folder = CONFIG.outputFolderId
    ? DriveApp.getFolderById(CONFIG.outputFolderId)
    : DriveApp.getRootFolder();
  if (CONFIG.outputFolderId) documentFile.moveTo(folder);
  const pdfBlob = documentFile.getBlob().getAs(MimeType.PDF)
    .setName(CONFIG.titlePrefix + " - " + recordId + ".pdf");
  const pdfFile = folder.createFile(pdfBlob);

  sheet.getRange(row, ensureHeader_(sheet, CONFIG.docUrlHeader)).setValue(document.getUrl());
  sheet.getRange(row, ensureHeader_(sheet, CONFIG.pdfUrlHeader)).setValue(pdfFile.getUrl());
  return { documentUrl: document.getUrl(), pdfUrl: pdfFile.getUrl() };
}

function createReportFromActiveRow() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.sheetName);
  if (!sheet) throw new Error("시트 이름을 확인하세요: " + CONFIG.sheetName);
  const range = sheet.getActiveRange();
  if (!range) throw new Error("응답 행의 셀 하나를 선택하세요.");
  return createReportFromRow_(sheet, range.getRow());
}

function onFormSubmit(e) {
  if (!e || !e.range) throw new Error("설치형 Sheet 폼 제출 트리거에서 실행하세요.");
  if (e.range.getSheet().getName() !== CONFIG.sheetName) return;
  createReportFromRow_(e.range.getSheet(), e.range.getRow());
}
