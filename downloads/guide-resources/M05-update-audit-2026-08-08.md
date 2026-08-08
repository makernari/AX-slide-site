# M05 최신성·직무 분리 검토

- 기준일: 2026-08-08 (Asia/Seoul)
- 범위: M05 D01~D04, 경영지원 오전 4시간·마케팅 오후 4시간
- 적용 원칙: 최종 Excel의 주제·차시 구조는 유지하고, 최신성 안내와 실습 원문·판단·산출물만 보강한다.

## 공식 자료 확인

| 항목 | 확인 내용 | 수업 반영 | 공식 출처 |
|---|---|---|---|
| Gemini Gems | 반복 작업용 맞춤 지침을 저장하는 Gems와 실험적 미니 앱을 만드는 Labs의 Gems는 용도와 제공 조건이 다르다. | D01 카드에서 두 기능을 구분하고, 계정 차이가 적은 문서형 대체 실습을 기본으로 둔다. | [Gemini Gems](https://support.google.com/gemini/answer/15235603?hl=en), [Gems from Google Labs](https://support.google.com/gemini/answer/16802014?hl=en-GB) |
| Workspace Gemini | 2026-03-10 Docs·Sheets·Slides·Drive의 새 기능이 베타로 소개됐으며 일부 기능은 플랜 조건이 있다. | 메뉴 위치나 전 계정 제공을 가정하지 않고 복사 가능한 도구 중립 결과물을 만든다. | [Workspace Gemini 업데이트](https://blog.google/products-and-platforms/products/workspace/gemini-workspace-updates-march-2026/) |
| Gemini Notebook | 2026-07-16 NotebookLM이 Gemini Notebook으로 이름이 바뀌었다. | `Gemini Notebook (NotebookLM)`으로 병기하고 출처 기반 기본 흐름은 유지한다. | [NotebookLM is now Gemini Notebook](https://blog.google/innovation-and-ai/products/gemini-notebook/notebooklm-gemini-notebook/) |
| ChatGPT Projects·GPTs·Deep research | 파일·지침·대화를 프로젝트로 묶거나 맞춤 GPT와 출처 기반 리서치를 사용할 수 있지만 계정·플랜·워크스페이스에 따라 차이가 있다. | D01·D03에서 기능 한도를 단정하지 않고 목적·입력·출력·근거·사람 검수 기준을 먼저 설계한다. | [Projects](https://help.openai.com/en/articles/10169521-projects-in-chatgpt), [GPTs](https://help.openai.com/en/articles/8554407), [Deep research](https://help.openai.com/en/articles/10500283-deep-research) |
| Claude | 2026-06-30 Sonnet 5와 2026-07-10 메모리 관련 업데이트가 공지됐다. | D04에서 모델명 서열화 대신 동일 입력·평가표의 블라인드 비교를 사용한다. | [Claude release notes](https://support.claude.com/en/articles/12138966-release-notes) |
| CLOVA Note | 개인용과 Whale Space의 계정 조건이 다르다. | 실제 화면을 복제하지 않고, 전사 텍스트를 제공하는 교육용 가상 화면과 문서형 대체 실습을 사용한다. | [CLOVA Note 시작하기](https://help.naver.com/service/24269/contents/12810?lang=ko&osType=COMMONOS) |

## 단독·연속 수강 검토

| 일차 | 경영지원 | 마케팅 | 서로 다른 핵심 판단 |
|---|---|---|---|
| D01 | 규정·기안·인수인계형 어시스턴트 | 브랜드·캠페인·콘텐츠형 어시스턴트 | 지식 원천·금지 규칙·산출물 |
| D02 | 교육 운영회의 → 공식 회의록·담당·기한·승인 질문 | NOVA-TEA 기획회의 → 콘텐츠 회의록·제작 캘린더·위험 표현표 | 원문·인물·날짜 함정·승인 책임 |
| D03 | 신청·보고·인수인계 자료 → 근거 있는 업무 절차 답변 | 브랜드 사실·채널 원칙·심의 사례 → 근거 있는 콘텐츠 답변 | 소스 팩·질문·인용 단위·오류 사례 |
| D04 | 교육 운영 보고서 후보 A/B/C 블라인드 심사 | 캠페인 개선 보고서 후보 A/B/C 블라인드 심사 | 실제 수치·위험 주장·결정 기준·완성본 |

각 시작 파일에 필요한 원문을 모두 포함해 하나만 수강해도 선행 세션이 필요 없다. 오전과 오후를 모두 들으면 공통 검수 사고를 다른 맥락에 전이하지만 입력 데이터와 정답 산출물을 반복하지 않는다.

## 제작·배포 안전 장치

- 공통 업데이트 카드 4종과 직무별 가상 화면 6종을 1600×900 SVG로 제작했다.
- 모든 화면은 `교육용 가상 화면`으로 표시하며 실제 계정·기관·개인정보를 사용하지 않는다.
- 한글 오탈자와 UI 변경 위험을 줄이기 위해 생성형 이미지 API 대신 결정론적 SVG 렌더링을 사용했다.
- 강의 사이트에는 가이드 메뉴·가이드 이미지·가이드 자료·외부 URL을 포함하지 않는다.
- 가이드의 이미지·자료 링크는 저장소 원본(raw) 경로를 사용해 GitHub Pages 배포물과 분리한다.
- 재생성 명령: `node scripts/refresh-m05-practice-and-guides.mjs`
