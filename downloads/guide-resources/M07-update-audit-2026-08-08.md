# M07 최신성·직무 분리 검토

기준일: 2026-08-08

## 1. 최종 Excel 원문 범위

- M07-D01: Google Forms → 응답 Sheet → Apps Script Docs·PDF → Notion 결과물 DB
- M07-D02: 전날 구조를 n8n 트리거·노드·매핑·실행 로그로 재구성하고 Notion에 등록
- M07-D03: Sheets의 필터·SUM·AVERAGE·차트와 ChatGPT 분석을 대조해 1페이지 보고서 작성
- 구조: 3일 · 12시간 · 12차시

## 2. 2026-08-08 공식 최신성 확인

| 일차 | 확인 내용 | 수업 반영 | 공식 자료 |
|---|---|---|---|
| D01 | 2025년 12월 이후 기존 Forms가 세분화된 응답자 접근 제어 방식으로 자동 전환 | 링크 복사 전에 게시·응답자 범위·응답 요약 공개를 확인 | [Google Forms 업데이트](https://support.google.com/docs/answer/16319311?hl=en) |
| D01 | 게시되지 않은 폼은 링크가 있어도 응답할 수 없음 | 질문 작성과 응답자 공개를 별도 단계로 실습 | [Forms 게시·공유](https://support.google.com/docs/answer/2839588?hl=en) |
| D01 | Form과 연결 Sheet는 별도 파일이며 이후 권한 변경이 자동 동기화되지 않음 | Form·Sheet·Docs/PDF·Notion 권한을 각각 검수 | [응답 저장 위치](https://support.google.com/docs/answer/2917686?hl=en) |
| D01 | Apps Script 설치형 제출 트리거는 Forms용과 Sheets용이 다르며 생성자 권한으로 실행 | 제공 코드는 Sheet 제출 이벤트를 기준으로 하고 수동 1회 실행 후 트리거 연결 | [설치형 트리거](https://developers.google.com/apps-script/guides/triggers/installable), [이벤트 객체](https://developers.google.com/apps-script/guides/triggers/events) |
| D01·D02 | Notion DB 구조 변경과 내용 편집 권한이 다르고, 연결은 기능 권한과 대상 페이지 접근이 모두 필요 | 속성 매핑·최소 권한·대상 DB 접근을 별도 체크 | [Notion DB 설정](https://www.notion.com/help/customize-your-database), [Notion 공유 권한](https://www.notion.com/en-gb/help/sharing-and-permissions), [연결 기능 권한](https://developers.notion.com/reference/capabilities) |
| D02 | n8n 2.0부터 Active·Inactive 대신 Publish·Unpublish 사용 | 저장·수동 실행·로그 검수·게시를 분리 | [n8n 2.0 게시 방식](https://support.n8n.io/article/understanding-workflow-publishing-in-n-8-n-2-0) |
| D02 | 2026-08-07 기준 안정 릴리스는 2.33.7 | 특정 버튼 위치 대신 개념·노드·로그·게시 상태를 평가 | [n8n 공식 릴리스](https://github.com/n8n-io/n8n/releases), [n8n 2.0 소개](https://blog.n8n.io/introducing-n8n-2-0/) |
| D03 | ChatGPT 데이터 분석은 XLS·XLSX·CSV, 표·차트, 코드 기반 분석을 지원하며 코드·가정을 검토해야 함 | CSV 업로드를 모든 계정의 공통 기본 경로로 사용하고 Sheet 수식과 재검산 | [ChatGPT 데이터 분석](https://help.openai.com/en/articles/8437071-data-analysis-with-chatgpt), [파일 업로드 FAQ](https://help.openai.com/en/articles/8555545-file-uploads-with-gpts-and-advanced-data-analysis-in-chatgpt) |
| D03 | ChatGPT for Google Sheets 사이드바는 플랜·관리자 설정에 따라 제공 | 있으면 선택 실습, 없으면 CSV·범위 복사로 같은 결과 완성 | [ChatGPT for Excel and Google Sheets](https://help.openai.com/en/articles/20001063-chatgpt-for-excel/) |

## 3. 단독 수강·연속 수강 매트릭스

| 일차 | 경영지원 오전 | 마케팅 오후 | 중복 방지 장치 |
|---|---|---|---|
| D01 | 교육 신청 Form, 신청 확인서·PDF, 교육 결과물 DB | 캠페인 콘텐츠 요청 Form, 기획 카드·PDF, 콘텐츠 DB | 질문·Sheet 열·코드 제목·DB 속성·권한 위험이 모두 다름 |
| D02 | 시설 요청, 긴급도·기한·필수값 차단, 업무 DB | 콘텐츠 요청, 채널 분기·목표·유형·브랜드 검수, 콘텐츠 DB | 노드 분기·허용값·고장 카드·로그 판단이 모두 다름 |
| D03 | 업무 요청 281건, 완료율·평균 처리일·운영 개선 | 콘텐츠 12개, 가중 CTR·CPA·채널 비교 | 산식·차트·오류·보고서 의사결정이 모두 다름 |

각 원자료 팩은 해당 과정의 선행 수업 없이 시작할 수 있도록 입력 스키마·샘플·오류·평가 기준을 모두 포함한다.

## 4. 제작 산출물

- 공통 최신 업데이트 카드: 3개
- 직무별 가상 실습 화면: 6개
- 직무별 원자료 팩: 6개
- 갱신 실습자료 묶음: 경영지원 3개 + 마케팅 3개
- 가이드 반영: 학습자 6개 + 강사용 6개

## 5. 시각자료·배포 안전

- 한글·수치·워크플로우 정확성을 위해 1600×900 SVG로 제작한다.
- 모든 화면은 `교육용 가상 화면 · 2026-08-08 기준`으로 표시한다.
- 실제 Google·Notion·n8n 계정 화면처럼 오인시키는 상표·개인정보·자격증명을 넣지 않는다.
- 가이드·가이드 이미지·guide-resources는 웹 강의교안 빌드에서 제외한다.
- 실제 Apps Script는 빈 폴더 ID와 가상 입력만 사용하며 API 키를 포함하지 않는다.
