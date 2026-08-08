# M08 최신성·직무 특화·중복 수강 검토

기준일: 2026-08-08

## 1. 최종 Excel 범위

- 모듈08 상세 커리큘럼 4일·16차시를 기준으로 작성했다.
- D01: AI Studio 자연어 앱 제작과 직무 앱 리믹스·실패 테스트
- D02: Codex 파일 분석·기능 추가·실행·테스트·변경 보고
- D03: RAG 이론·문서 Q&A·정상/함정 질문·근거와 거절 평가
- D04: API·Function Calling·MCP·에이전트·권한·승인·보안

## 2. 최신 공식 근거

| 일차 | 확인 내용 | 공식 출처 | 수업 반영 |
|---|---|---|---|
| D01 | AI Studio Build의 전체 스택 런타임·서버 측 비밀값 | https://ai.google.dev/gemini-api/docs/aistudio-build-mode | 키를 클라이언트에 쓰지 않고 공유·비용 확인 |
| D01 | 서버 런타임·Secrets·Workspace 연동 | https://ai.google.dev/gemini-api/docs/aistudio-fullstack | UI와 서버 책임 분리 |
| D02 | Codex 목표·맥락·제약·완료조건과 테스트·리뷰 | https://learn.chatgpt.com/guides/best-practices | 파일 분석→최소 변경→테스트→diff |
| D02 | Codex 샌드박스·승인·네트워크 경계 | https://learn.chatgpt.com/docs/agent-approvals-security | 외부·파괴·비용 작업은 승인 |
| D03 | Gemini File Search의 분할·임베딩·검색·저장 수명 | https://ai.google.dev/gemini-api/docs/file-search | 근거ID·수명주기·삭제 확인 |
| D03 | OpenAI File Search의 vector store·파일 인용 | https://developers.openai.com/api/docs/guides/tools-file-search | 제품과 무관한 공통 RAG 평가 기준 |
| D04 | Function Calling의 도구 요청·실행·출력 흐름 | https://developers.openai.com/api/docs/guides/function-calling | 모델 요청과 실제 실행 분리 |
| D04 | MCP 사용자 동의·데이터 보호·도구 안전 | https://modelcontextprotocol.io/specification/2025-03-26/index | 읽기·쓰기·승인·로그 표시 |
| D04 | MCP 보안 공격·완화 | https://modelcontextprotocol.io/docs/2026-07-28/tutorials/security/security_best_practices | 인젝션·OAuth·로컬 서버 위험 토론 |

## 3. 단독·연속 수강 설계

| 일차 | 경영지원 | 마케팅 | 중복 방지 |
|---|---|---|---|
| D01 | NOVA 업무보고 문장 점검기 | BLOOM BITE 브랜드 톤 점검기 | 입력·판정·금지·출력 모두 분리 |
| D02 | 회의 후속조치 앱에 결과 복사 | 캠페인 카피 앱에 글자 수 | 스타터·기능·경계 테스트 분리 |
| D03 | 시설요청 운영규정 RAG | 브랜드·상품자료 RAG | 문서 조각·질문·거절 사유 분리 |
| D04 | 보고서 승인 후 메일 초안 | 브랜드 검토 후 Notion 초안 | 도구·권한·쓰기 결과 분리 |

- 각 일차는 원자료·샘플·프롬프트·템플릿·완성 예시를 포함해 단독으로 완결된다.
- 오전·오후를 연속 수강해도 가상 조직, 데이터, 기능, 실패 입력, 결과물이 반복되지 않는다.
- 실제 도구 접근이 없을 때도 HTML·문서 조각 카드·도구 카드로 같은 평가를 수행한다.

## 4. 이미지·배포 안전

- 업데이트 카드 4개와 직무별 실습 화면 8개는 1600×900 SVG다.
- 모두 교육용 가상 화면과 기준일을 표시한다.
- 가이드·가이드 이미지·실습자료는 GitHub Pages 산출물에서 제외한다.
- API 키·실제 개인정보·내부 링크·외부 발송 기능을 포함하지 않는다.
