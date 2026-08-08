import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const MANIFEST_PATH = path.join(ROOT, "data", "slide-manifest.json");
const CSV_PATH = path.join(ROOT, "data", "slide-manifest.csv");
const SOURCE_ROOT = path.join(ROOT, "assets", "slide-sources", "optional");

const optionalLibrary = {
  "M05-D01": {
    common: [
      [2, "[선택] 2026 AI 흐름을 네 단계로 읽기", "AI는 생성에서 끝나지 않고 여러 입력과 도구를 연결해 실행하는 방향으로 확장된다.", ["분석·예측", "생성", "멀티모달", "에이전트"]],
      [2, "[예비] AI 답변을 멈춰 세울 세 신호", "근거가 없거나 맥락이 부족하거나 판단이 필요한 답변은 사람이 검증해야 한다.", ["근거 없음", "맥락 부족", "판단 필요", "사람 검증"]],
      [3, "[심화] AI가 읽기 쉬운 자료의 네 조건", "찾기 쉽고 권한과 형식이 명확한 자료가 AI 활용의 기반이 된다.", ["찾기 쉬움", "권한 명확", "형식 일관", "재사용 가능"]],
    ],
    pairs: [
      [1, "[선택] 반복 업무 병목 카드 분류", "빈도·대기·검토·형식 기준으로 첫 자동화 후보를 고른다.", ["자주 반복", "대기 길음", "검토 많음", "형식 일정"], "[선택] 반복 콘텐츠 병목 카드 분류", "재가공·검토·채널 변형·일정 압박 기준으로 첫 개선 후보를 고른다.", ["재가공 많음", "검토 반복", "채널 변형", "일정 압박"]],
      [2, "[심화] 같은 업무를 AI 작업으로 다시 쓰기", "업무 이름보다 AI가 수행할 수 있는 동작으로 바꾸어 설명한다.", ["회의→구조화", "보고→초안", "요청→분류", "수치→분석"], "[심화] 같은 콘텐츠를 AI 작업으로 다시 쓰기", "콘텐츠 이름보다 AI가 수행할 수 있는 동작으로 바꾸어 설명한다.", ["리서치→요약", "기획→구조화", "카피→변형", "성과→분석"]],
      [4, "[예비] 첫 적용 과제의 안전한 경계", "비식별 자료와 초안 범위에서 시작하고 사람의 승인을 남긴다.", ["비식별", "초안", "사람 승인", "작게 시작"], "[예비] 첫 콘텐츠 실험의 안전한 경계", "가상 브랜드와 초안 범위에서 시작하고 사실 검토를 남긴다.", ["가상 브랜드", "초안", "사실 검토", "작게 테스트"]],
    ],
  },
  "M05-D02": {
    common: [
      [1, "[선택] 네 산출물은 목적부터 다르다", "메모·회의록·요청문·후속표는 같은 원문에서도 서로 다른 구조가 필요하다.", ["메모", "회의록", "요청문", "후속표"]],
      [2, "[예비] 녹취 오류를 찾는 세 번의 대조", "음성·녹취·최종 문서를 차례로 대조해야 의미 왜곡을 줄일 수 있다.", ["원음", "자동 녹취", "문맥 교정", "최종 문서"]],
      [3, "[심화] Gem은 세 종류 입력으로 시험한다", "정상·모호·누락 입력을 모두 시험해야 반복 사용 가능한 지침이 된다.", ["정상 입력", "모호한 입력", "누락 입력", "수정 후 재시험"]],
    ],
    pairs: [
      [2, "[선택] 회의 결과를 상태판으로 바꾸기", "결정·담당·기한·대기를 분리하면 후속 업무가 선명해진다.", ["결정", "담당", "기한", "대기"], "[선택] 콘텐츠 아이디어를 상태판으로 바꾸기", "아이디어·확정·보류·발행을 분리하면 제작 흐름이 선명해진다.", ["아이디어", "확정", "보류", "발행"]],
      [3, "[심화] 업무용 Gem의 실패 기준", "담당자나 기한을 추측하면 멈추고 확인 질문을 해야 한다.", ["담당 불명", "기한 불명", "추측 금지", "확인 질문"], "[심화] 마케팅 Gem의 실패 기준", "근거 없는 효능이나 수치를 만들면 멈추고 확인 질문을 해야 한다.", ["근거 불명", "수치 불명", "과장 금지", "확인 질문"]],
      [4, "[예비] 정보가 빠진 요청문 복구", "누락 정보를 채우기 전에는 발송 가능한 문장으로 확정하지 않는다.", ["누락 표시", "질문 생성", "답변 반영", "최종 확인"], "[예비] 근거가 빠진 카피 복구", "근거를 채우기 전에는 게시 가능한 문장으로 확정하지 않는다.", ["주장 표시", "근거 요청", "표현 조정", "최종 확인"]],
    ],
  },
  "M05-D03": {
    common: [
      [1, "[선택] 출처 품질을 네 단계로 가르기", "출처의 원본성·최신성·관련성·권한을 먼저 확인해야 답변을 신뢰할 수 있다.", ["원본성", "최신성", "관련성", "권한"]],
      [2, "[예비] 출처가 충돌할 때의 순서", "충돌 지점을 표시하고 우선 기준을 정한 뒤 보류 또는 답변한다.", ["충돌 표시", "기준 선택", "보류 판단", "근거와 답변"]],
      [3, "[심화] 오디오 요약도 원문으로 검증한다", "AI 오디오 요약은 이해 보조물이며 사실 확인은 원문 출처로 돌아가야 한다.", ["듣기", "주장 표시", "원문 대조", "수정 기록"]],
    ],
    pairs: [
      [2, "[선택] 규정 예외 질문의 답변 경계", "명시된 절차와 예외 판단을 분리하고 최종 승인을 담당자에게 남긴다.", ["명시 절차", "예외 조건", "담당 확인", "최종 승인"], "[선택] 브랜드 사실 질문의 답변 경계", "브랜드 자료의 사실과 해석을 분리하고 게시 전 담당 검토를 남긴다.", ["명시 사실", "해석", "근거 확인", "게시 승인"]],
      [3, "[심화] 승인 문서를 지식원으로 다루기", "버전과 시행일이 확인된 문서만 현재 기준으로 사용한다.", ["문서 버전", "시행일", "담당 부서", "현재 기준"], "[심화] 브랜드 가이드를 지식원으로 다루기", "버전과 적용 채널이 확인된 가이드만 현재 기준으로 사용한다.", ["가이드 버전", "적용 채널", "금지 표현", "현재 기준"]],
      [4, "[예비] 근거 없는 답변을 거절하는 문장", "답을 꾸미는 대신 확인할 자료와 담당자를 구체적으로 안내한다.", ["확인 불가", "필요 자료", "담당자", "재질문"], "[예비] 근거 없는 홍보 문구를 거절하는 문장", "주장을 꾸미는 대신 필요한 근거와 안전한 대체 표현을 제시한다.", ["근거 부족", "필요 자료", "대체 표현", "재검토"]],
    ],
  },
  "M05-D04": {
    common: [
      [2, "[선택] 도구 이름을 가린 채 먼저 비교하기", "도구 선호보다 목적·정확성·수정성·재사용성을 같은 기준으로 비교한다.", ["목적", "정확성", "수정성", "재사용성"]],
      [4, "[예비] 같은 원문을 세 청중으로 변환하기", "원문 사실은 유지하고 청중에 따라 순서와 표현만 바꾼다.", ["원문 사실", "관리자", "실무자", "외부 독자"]],
    ],
    pairs: [
      [3, "[심화] 관리자용과 실무자용 보고 분기", "같은 결과도 관리자는 판단, 실무자는 다음 행동이 먼저 보여야 한다.", ["같은 사실", "판단 요약", "실행 항목", "분기 검토"], "[심화] 경영진용과 채널용 메시지 분기", "같은 캠페인도 경영진은 근거, 채널 독자는 행동이 먼저 보여야 한다.", ["같은 사실", "성과 근거", "채널 행동", "분기 검토"]],
      [4, "[예비] 편향된 도구 비교를 바로잡기", "같은 입력과 같은 평가표를 사용해야 도구 비교가 공정해진다.", ["같은 입력", "같은 시간", "같은 기준", "차이 기록"], "[예비] 편향된 콘텐츠 비교를 바로잡기", "같은 브리프와 같은 평가표를 사용해야 콘텐츠 비교가 공정해진다.", ["같은 브리프", "같은 채널", "같은 기준", "차이 기록"]],
    ],
  },
  "M06-D01": {
    common: [
      [1, "[선택] 캐릭터 앵커는 고정값부터 정한다", "인물·의상·색·소품의 고정값을 먼저 정해야 장면 간 일관성을 지킬 수 있다.", ["인물", "의상", "색", "소품"]],
      [2, "[예비] 한글은 하이브리드로 안전하게 넣기", "생성 이미지와 정확한 한글 조판을 분리하면 시각 품질과 정확성을 함께 지킬 수 있다.", ["배경 생성", "텍스트 비우기", "한글 조판", "최종 대조"]],
    ],
    pairs: [
      [3, "[심화] 업무 교육 장면의 연속성 점검", "동작·방향·소품·화면 상태가 이어져야 절차 영상이 이해된다.", ["동작", "방향", "소품", "화면 상태"], "[심화] 브랜드 장면의 연속성 점검", "제품·인물·색·카메라 방향이 이어져야 브랜드 영상이 하나로 보인다.", ["제품", "인물", "색", "카메라"]],
      [4, "[예비] 왜곡된 장면을 원인별로 복구", "프롬프트를 전부 바꾸지 말고 인물·배경·동작 중 원인 하나만 고쳐 재시험한다.", ["인물 오류", "배경 오류", "동작 오류", "한 번에 하나"], "[예비] 흔들린 브랜드 장면을 원인별로 복구", "프롬프트를 전부 바꾸지 말고 제품·색·동작 중 원인 하나만 고쳐 재시험한다.", ["제품 오류", "색 오류", "동작 오류", "한 번에 하나"]],
    ],
  },
  "M06-D02": {
    common: [
      [2, "[선택] Vrew 편집은 대본에서 시작한다", "자동 자막은 초안으로 받아들이고 텍스트를 고치며 영상 흐름을 정리한다.", ["영상 불러오기", "자동 자막", "텍스트 편집", "내보내기"]],
      [4, "[예비] 무음과 유음으로 두 번 검수하기", "자막 가독성과 음량 균형은 서로 다른 재생 조건에서 확인해야 한다.", ["무음 재생", "자막 점검", "유음 재생", "음량 점검"]],
    ],
    pairs: [
      [3, "[심화] 업무 영상의 소리 우선순위", "안내 음성이 먼저 들리고 배경음은 이해를 방해하지 않아야 한다.", ["안내 음성", "핵심 자막", "배경음", "최종 청취"], "[심화] 브랜드 영상의 소리 우선순위", "핵심 카피와 브랜드 리듬이 들리되 메시지를 가리지 않아야 한다.", ["핵심 카피", "브랜드 리듬", "배경음", "최종 청취"]],
      [4, "[예비] 장면이 부족할 때의 최소 완성선", "새 효과를 늘리기보다 핵심 장면과 자막만으로 메시지를 완결한다.", ["핵심 장면", "필수 자막", "안전한 음악", "30초 완결"], "[예비] 소재가 부족할 때의 최소 완성선", "새 효과를 늘리기보다 대표 소재와 카피만으로 메시지를 완결한다.", ["대표 소재", "필수 카피", "안전한 음악", "30초 완결"]],
    ],
  },
  "M06-D03": {
    common: [
      [1, "[선택] 맞춤형 GPT 지침의 다섯 칸", "역할·입력·절차·출력·금지 기준을 나누어야 반복 가능한 도구가 된다.", ["역할", "입력", "절차", "출력·금지"]],
      [2, "[예비] 지식 파일에는 버전과 범위를 붙인다", "파일명만 넣지 말고 적용 범위와 기준일을 함께 기록해야 한다.", ["자료명", "버전", "기준일", "적용 범위"]],
    ],
    pairs: [
      [3, "[심화] 규정 Q&A를 반례로 시험하기", "정상 질문뿐 아니라 예외·누락·권한 밖 질문에서 멈추는지 확인한다.", ["정상", "예외", "누락", "권한 밖"], "[심화] 브랜드 카피 GPT를 반례로 시험하기", "정상 요청뿐 아니라 과장·금지어·근거 없는 요청에서 멈추는지 확인한다.", ["정상", "과장", "금지어", "근거 없음"]],
      [4, "[예비] 실패 사례를 다음 버전 지침으로 바꾸기", "실패 입력과 기대 답변을 짝지어 지침의 수정 근거로 남긴다.", ["실패 입력", "실제 답변", "기대 답변", "지침 수정"], "[예비] 이탈 카피를 다음 버전 지침으로 바꾸기", "이탈 요청과 기대 카피를 짝지어 지침의 수정 근거로 남긴다.", ["이탈 요청", "실제 카피", "기대 카피", "지침 수정"]],
    ],
  },
  "M07-D01": {
    common: [
      [1, "[선택] 요청 자동화의 네 저장 지점", "폼·응답 시트·생성 문서·처리 기록을 분리해야 흐름을 추적할 수 있다.", ["입력 폼", "응답 시트", "생성 문서", "처리 기록"]],
      [4, "[예비] 권한 확인과 공개는 다른 단계다", "편집 권한을 얻는 것과 결과를 공개하는 것은 별도 승인으로 다뤄야 한다.", ["편집 권한", "실행 권한", "공개 승인", "기록"]],
    ],
    pairs: [
      [2, "[심화] 업무 요청 입력 오류를 먼저 설계하기", "빈 값·형식 오류·중복 요청에 대한 처리 기준을 폼 단계에서 정한다.", ["빈 값", "형식 오류", "중복", "처리 기준"], "[심화] 콘텐츠 요청 입력 오류를 먼저 설계하기", "빈 브리프·채널 누락·중복 요청에 대한 처리 기준을 폼 단계에서 정한다.", ["빈 브리프", "채널 누락", "중복", "처리 기준"]],
      [4, "[예비] 권한이 없을 때의 수동 경로", "자동 실행을 강행하지 말고 초안 저장과 담당자 전달로 안전하게 전환한다.", ["실행 중지", "초안 저장", "담당 전달", "승인 후 재개"], "[예비] 게시 권한이 없을 때의 수동 경로", "자동 게시를 강행하지 말고 초안 저장과 담당자 전달로 안전하게 전환한다.", ["게시 중지", "초안 저장", "담당 전달", "승인 후 게시"]],
    ],
  },
  "M07-D02": {
    common: [
      [1, "[선택] 자동화는 수동 시험 뒤에 공개한다", "수동 실행·결과 검토·공개·실행 기록의 순서를 지켜야 오류를 작게 발견할 수 있다.", ["수동 실행", "결과 검토", "공개", "실행 기록"]],
      [3, "[예비] 오류는 한 단계씩 격리한다", "입력·변환·출력·권한 중 한 구간만 바꾸고 다시 시험해야 원인을 찾을 수 있다.", ["입력", "변환", "출력", "권한"]],
    ],
    pairs: [
      [2, "[심화] 긴급 업무 요청의 분기표", "긴급도와 승인 필요 여부를 분리해야 알림과 처리 경로가 꼬이지 않는다.", ["일반", "긴급", "승인 필요", "담당 전달"], "[심화] 채널별 콘텐츠 요청의 분기표", "채널과 게시 상태를 분리해야 제작과 승인 경로가 꼬이지 않는다.", ["블로그", "SNS", "승인 필요", "담당 전달"]],
      [4, "[예비] 실패 실행을 재현 가능한 기록으로", "입력값·실패 단계·오류 메시지·수정 결과를 함께 남긴다.", ["입력값", "실패 단계", "오류 메시지", "수정 결과"], "[예비] 실패 게시를 재현 가능한 기록으로", "브리프·실패 단계·상태 메시지·수정 결과를 함께 남긴다.", ["브리프", "실패 단계", "상태 메시지", "수정 결과"]],
    ],
  },
  "M07-D03": {
    common: [
      [1, "[선택] 지저분한 데이터의 네 얼굴", "빈 값·형식 혼합·중복·이상치를 구분해야 정제 순서를 정할 수 있다.", ["빈 값", "형식 혼합", "중복", "이상치"]],
      [3, "[예비] 사실·해석·가설을 분리하기", "관측된 값과 의미 해석과 다음 실험 가설을 한 문장에 섞지 않는다.", ["사실", "해석", "가설", "다음 확인"]],
    ],
    pairs: [
      [2, "[심화] 업무 지표의 가중치를 먼저 정하기", "완료율과 처리 시간을 같은 방향의 점수로 바꾼 뒤 가중치를 합의한다.", ["완료율", "처리 시간", "방향 통일", "가중치"], "[심화] 마케팅 지표의 가중치를 먼저 정하기", "반응률과 비용을 같은 방향의 점수로 바꾼 뒤 가중치를 합의한다.", ["반응률", "비용", "방향 통일", "가중치"]],
      [4, "[예비] 작은 표에서 시작하는 인사이트", "행을 늘리기 전에 비교 기준과 판단 질문이 분명한지 확인한다.", ["작은 표", "비교 기준", "판단 질문", "추가 데이터"], "[예비] 작은 캠페인 표에서 시작하는 인사이트", "채널을 늘리기 전에 비교 기준과 다음 실험 질문이 분명한지 확인한다.", ["작은 표", "비교 기준", "실험 질문", "추가 데이터"]],
    ],
  },
  "M08-D01": {
    common: [
      [1, "[선택] 자연어 개발의 세 문서", "문제 정의·요구사항·테스트 기준을 나누어야 수정 가능한 앱이 된다.", ["문제 정의", "요구사항", "테스트 기준", "수정 기록"]],
      [2, "[심화] PoC의 성공·수정·중단 기준", "만들기 전에 성공·수정·중단 조건을 정해야 시연 결과를 판단할 수 있다.", ["성공", "수정", "중단", "다음 결정"]],
      [3, "[예비] 비밀값은 화면 코드에서 분리한다", "API 키와 비밀값은 브라우저에 노출하지 않고 서버 측 비밀 저장소로 다룬다.", ["화면 코드", "비밀값 분리", "서버 측 저장", "공유 전 점검"]],
    ],
    pairs: [
      [2, "[선택] 업무 요청 분류기 PoC", "요청 유형·긴급도·담당 후보를 분리해 검토 가능한 초안을 만든다.", ["요청 유형", "긴급도", "담당 후보", "사람 검토"], "[선택] 마케팅 카피 평가기 PoC", "목표·채널·톤·금지 기준을 분리해 검토 가능한 평가 초안을 만든다.", ["목표", "채널", "톤", "금지 기준"]],
      [3, "[심화] 보고서 누락 점검기 PoC", "필수 항목의 존재 여부만 점검하고 내용의 옳고 그름은 사람이 판단한다.", ["필수 항목", "누락 표시", "판단 제외", "사람 확인"], "[심화] 브랜드 톤 점검기 PoC", "정의된 톤 기준의 일치 여부만 점검하고 게시 여부는 사람이 판단한다.", ["톤 기준", "이탈 표시", "게시 제외", "사람 확인"]],
      [4, "[예비] PoC가 멈춰야 할 경계", "개인정보·실제 발송·자동 승인·비밀값 노출이 보이면 시연 범위에서 제외한다.", ["개인정보", "실제 발송", "자동 승인", "비밀값"], "[예비] 콘텐츠 PoC가 멈춰야 할 경계", "실제 계정 게시·근거 없는 주장·자동 승인·비밀값 노출이 보이면 시연 범위에서 제외한다.", ["실제 게시", "근거 없는 주장", "자동 승인", "비밀값"]],
    ],
  },
  "M08-D02": {
    common: [
      [1, "[선택] 코딩 에이전트에는 경계를 먼저 준다", "작업 대상·허용 범위·완료 조건·검증 명령을 함께 제시해야 안전하게 위임할 수 있다.", ["작업 대상", "허용 범위", "완료 조건", "검증 명령"]],
      [3, "[예비] 수정 전후 차이와 테스트를 함께 본다", "코드가 바뀌었다는 사실보다 요구사항을 지키고 테스트를 통과했는지가 중요하다.", ["변경 차이", "요구사항", "자동 테스트", "사람 검토"]],
    ],
    pairs: [
      [2, "[심화] 업무 앱 입력 검증 추가", "빈 값과 잘못된 형식을 화면에서 먼저 막아 잘못된 업무 기록을 줄인다.", ["빈 값", "형식", "오류 안내", "재입력"], "[심화] 콘텐츠 앱 채널 검증 추가", "채널과 규격이 빠진 요청을 화면에서 먼저 막아 잘못된 초안을 줄인다.", ["채널", "규격", "오류 안내", "재입력"]],
      [4, "[예비] 수정 실패 시 돌아갈 지점", "작은 변경 단위와 이전 동작 기록이 있어야 실패를 안전하게 되돌릴 수 있다.", ["작은 변경", "이전 상태", "복구", "재검증"], "[예비] 카피 앱 수정 실패 시 돌아갈 지점", "작은 변경 단위와 이전 출력 기록이 있어야 실패를 안전하게 되돌릴 수 있다.", ["작은 변경", "이전 출력", "복구", "재검증"]],
    ],
  },
  "M08-D03": {
    common: [
      [1, "[선택] 검색 가능한 지식은 조각과 표지가 필요하다", "문서를 의미 단위로 나누고 제목·버전·범위 정보를 붙여야 찾기 쉬워진다.", ["의미 단위", "제목", "버전", "적용 범위"]],
      [3, "[예비] 답이 없을 때 멈추는 검색 챗봇", "근거가 없거나 출처가 충돌하면 답을 만들지 말고 확인 경로를 안내한다.", ["근거 없음", "출처 충돌", "답변 보류", "확인 경로"]],
    ],
    pairs: [
      [2, "[심화] 절차 문서의 버전 충돌 처리", "시행일과 승인 상태를 비교해 현재 절차를 고르고 이전 버전은 구분한다.", ["시행일", "승인 상태", "현재 절차", "이전 버전"], "[심화] 브랜드 가이드의 버전 충돌 처리", "적용일과 채널 범위를 비교해 현재 기준을 고르고 이전 버전은 구분한다.", ["적용일", "채널 범위", "현재 기준", "이전 버전"]],
      [4, "[예비] 권한 밖 질문의 안전한 답변", "조회 가능한 범위를 밝히고 담당 부서나 승인 문서로 연결한다.", ["조회 범위", "답변 제한", "담당 부서", "승인 문서"], "[예비] 브랜드 밖 질문의 안전한 답변", "등록된 자료의 범위를 밝히고 브랜드 담당자나 승인 가이드로 연결한다.", ["자료 범위", "답변 제한", "담당자", "승인 가이드"]],
    ],
  },
  "M08-D04": {
    common: [
      [1, "[선택] 에이전트는 읽기·쓰기·승인을 나눈다", "자료 조회와 결과 작성과 외부 실행을 분리해야 사람 승인 지점을 설계할 수 있다.", ["읽기", "쓰기", "사람 승인", "실행 기록"]],
      [3, "[예비] 자료 속 명령문을 그대로 따르지 않기", "문서 안의 지시와 사용자의 실제 요청을 구분하고 충돌하면 멈춰야 한다.", ["자료 속 지시", "사용자 요청", "충돌 확인", "실행 중지"]],
    ],
    pairs: [
      [2, "[심화] 이메일 발송 전 승인 시뮬레이션", "수신자·본문·첨부를 검토한 뒤 사람 승인 없이는 실제 발송하지 않는다.", ["수신자", "본문", "첨부", "사람 승인"], "[심화] 콘텐츠 게시 전 승인 시뮬레이션", "채널·카피·소재를 검토한 뒤 사람 승인 없이는 실제 게시하지 않는다.", ["채널", "카피", "소재", "사람 승인"]],
      [4, "[예비] 권한 오류를 안전하게 종료하기", "재시도를 반복하기보다 중단 사유와 필요한 권한을 기록해 담당자에게 넘긴다.", ["실행 중지", "오류 기록", "필요 권한", "담당 전달"], "[예비] 게시 권한 오류를 안전하게 종료하기", "재시도를 반복하기보다 중단 사유와 필요한 권한을 기록해 담당자에게 넘긴다.", ["게시 중지", "오류 기록", "필요 권한", "담당 전달"]],
    ],
  },
  "M09-D01": {
    common: [
      [1, "[선택] 발표 범위를 세 단계로 준비하기", "최소·표준·확장 경로를 미리 나누면 남은 시간에 맞춰 핵심을 지킬 수 있다.", ["최소 경로", "표준 경로", "확장 경로", "현장 선택"]],
      [2, "[심화] 같은 내용을 두 수준으로 설명하기", "초심자에게는 맥락과 순서를, 경험자에게는 기준과 예외를 더한다.", ["초심자", "맥락·순서", "경험자", "기준·예외"]],
      [4, "[예비] 시연 실패에도 수업은 계속된다", "화면·계정·네트워크 문제가 생겨도 캡처·설명·대체 실습으로 전환한다.", ["화면 캡처", "말로 설명", "대체 실습", "핵심 회수"]],
    ],
    pairs: [
      [1, "[선택] 경영지원 발표 주제 두 갈래", "업무 흐름 개선과 문서 품질 개선 중 청중 반응에 맞는 사례를 고른다.", ["업무 흐름", "문서 품질", "공통 기준", "현장 선택"], "[선택] 마케팅 발표 주제 두 갈래", "콘텐츠 제작과 성과 분석 중 청중 반응에 맞는 사례를 고른다.", ["콘텐츠 제작", "성과 분석", "공통 기준", "현장 선택"]],
      [3, "[심화] 결과보다 판단 과정을 발표하기", "문제·선택·검증·개선의 연결이 보여야 다른 업무에도 재사용할 수 있다.", ["문제", "선택", "검증", "개선"], "[심화] 결과보다 실험 과정을 발표하기", "가설·제작·검증·개선의 연결이 보여야 다른 캠페인에도 재사용할 수 있다.", ["가설", "제작", "검증", "개선"]],
      [4, "[예비] 3분 미니 강의의 완성선", "한 문장 목표와 한 사례와 한 확인 질문만 남겨도 수업은 완결된다.", ["한 문장 목표", "한 사례", "한 확인", "한 문장 회수"], "[예비] 3분 미니 피치의 완성선", "한 문장 목표와 한 근거와 한 다음 행동만 남겨도 발표는 완결된다.", ["한 문장 목표", "한 근거", "한 행동", "한 문장 회수"]],
    ],
  },
};

const palettes = {
  COMMON: { bg: "#F6F7F9", ink: "#172033", accent: "#3157D5", soft: "#E8EEFF", alt: "#1C8A83" },
  BACKOFFICE: { bg: "#F6F7F9", ink: "#172033", accent: "#3157D5", soft: "#E7EFFA", alt: "#1C8A83" },
  MARKETING: { bg: "#F8F6F5", ink: "#201D2C", accent: "#E6614F", soft: "#FCE8E3", alt: "#7357C8" },
};

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function csvEscape(value) {
  const text = Array.isArray(value) ? value.join(" / ") : String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function badgeFromTitle(title) {
  return /^\[([^\]]+)\]/.exec(title)?.[1] ?? "선택";
}

function plainTitle(title) {
  return title.replace(/^\[[^\]]+\]\s*/, "");
}

function wrapText(text, maxChars = 30) {
  const words = String(text).split(" ");
  const lines = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 3);
}

function slideSvg(slide, labels) {
  const p = palettes[slide.course];
  const courseLabel = slide.course === "COMMON" ? "공통" : slide.course === "BACKOFFICE" ? "경영지원" : "마케팅";
  const title = plainTitle(slide.title);
  const badge = badgeFromTitle(slide.title);
  const messageLines = wrapText(slide.key_message, 38);
  const cardWidth = labels.length === 3 ? 520 : labels.length === 4 ? 372 : 300;
  const gap = 34;
  const totalWidth = cardWidth * labels.length + gap * (labels.length - 1);
  const startX = (2048 - totalWidth) / 2;
  const cards = labels.map((label, index) => {
    const x = startX + index * (cardWidth + gap);
    const number = String(index + 1).padStart(2, "0");
    const arrow = index < labels.length - 1
      ? `<path d="M ${x + cardWidth + 8} 672 H ${x + cardWidth + gap - 8}" stroke="${p.accent}" stroke-width="8" stroke-linecap="round"/><path d="M ${x + cardWidth + gap - 22} 658 L ${x + cardWidth + gap - 8} 672 L ${x + cardWidth + gap - 22} 686" fill="none" stroke="${p.accent}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`
      : "";
    return `${arrow}<g><rect x="${x}" y="540" width="${cardWidth}" height="265" rx="28" fill="#FFFFFF" stroke="${index === labels.length - 1 ? p.accent : "#D8DEE9"}" stroke-width="${index === labels.length - 1 ? 6 : 3}"/><circle cx="${x + 54}" cy="598" r="25" fill="${index === labels.length - 1 ? p.accent : p.soft}"/><text x="${x + 54}" y="609" text-anchor="middle" class="cardNo" fill="${index === labels.length - 1 ? "#FFFFFF" : p.accent}">${number}</text><text x="${x + cardWidth / 2}" y="696" text-anchor="middle" class="cardText" fill="${p.ink}">${escapeXml(label)}</text></g>`;
  }).join("");
  const message = messageLines.map((line, i) => `<text x="1024" y="${390 + i * 54}" text-anchor="middle" class="message" fill="${p.ink}">${escapeXml(line)}</text>`).join("");
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="2048" height="1152" viewBox="0 0 2048 1152">
  <rect width="2048" height="1152" fill="${p.bg}"/>
  <rect x="0" y="0" width="2048" height="18" fill="${p.accent}"/>
  <circle cx="1870" cy="184" r="158" fill="${p.soft}"/>
  <circle cx="1910" cy="210" r="72" fill="none" stroke="${p.alt}" stroke-width="18" opacity="0.55"/>
  <style>
    .meta{font-family:'Pretendard','Noto Sans KR','Malgun Gothic',sans-serif;font-size:27px;font-weight:700;letter-spacing:1px}
    .badge{font-family:'Pretendard','Noto Sans KR','Malgun Gothic',sans-serif;font-size:28px;font-weight:800}
    .title{font-family:'Pretendard','Noto Sans KR','Malgun Gothic',sans-serif;font-size:72px;font-weight:900;letter-spacing:-2px}
    .message{font-family:'Pretendard','Noto Sans KR','Malgun Gothic',sans-serif;font-size:38px;font-weight:600;letter-spacing:-0.8px}
    .cardNo{font-family:'Pretendard','Noto Sans KR','Malgun Gothic',sans-serif;font-size:24px;font-weight:900}
    .cardText{font-family:'Pretendard','Noto Sans KR','Malgun Gothic',sans-serif;font-size:34px;font-weight:800;letter-spacing:-1px}
    .footer{font-family:'Pretendard','Noto Sans KR','Malgun Gothic',sans-serif;font-size:23px;font-weight:650}
  </style>
  <text x="112" y="92" class="meta" fill="${p.accent}">${slide.module} · ${slide.day} · ${slide.lesson}차시 · ${courseLabel}</text>
  <rect x="112" y="132" width="128" height="54" rx="27" fill="${p.accent}"/>
  <text x="176" y="169" text-anchor="middle" class="badge" fill="#FFFFFF">${escapeXml(badge)}</text>
  <text x="112" y="278" class="title" fill="${p.ink}">${escapeXml(title)}</text>
  ${message}
  ${cards}
  <rect x="112" y="925" width="1824" height="2" fill="#D6DCE6"/>
  <text x="112" y="990" class="footer" fill="#687386">수업 운영 카드 · 핵심 흐름을 먼저 설명한 뒤 상황에 맞게 선택</text>
  <text x="1936" y="990" text-anchor="end" class="footer" fill="${p.accent}">${escapeXml(slide.id)}</text>
</svg>`;
}

function makeSlide(course, module, day, order, lesson, title, keyMessage, labels) {
  return {
    id: `${course}-${module}-${day}-S${String(order).padStart(3, "0")}`,
    course,
    module,
    day,
    lesson,
    order,
    title,
    purpose: `${badgeFromTitle(title)} 자료로 ${plainTitle(title)}의 판단 기준을 설명한다.`,
    key_message: keyMessage,
    required_content: labels.join(" / "),
    visual_type: "선택형 4단계 카드 도식",
    content_type: course === "COMMON" ? "COMMON" : "SHARED_STRUCTURE",
    image_filename: `${course}-${module}-${day}-S${String(order).padStart(3, "0")}.png`,
    prompt_status: "pending",
    image_status: "generated",
    review_status: "pending",
    _labels: labels,
  };
}

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
const existingIds = new Set(manifest.slides.map((slide) => slide.id));
const alreadyAdded = [...existingIds].some((id) => id === "COMMON-M05-D01-S020");
if (alreadyAdded) {
  console.log("optional_slide_library=already_present");
  process.exit(0);
}

for (const slide of manifest.slides) {
  if (slide.id === "COMMON-M06-D02-S003") {
    slide.title = "Vrew와 Suno는 한 제작선의 두 역할이다";
    slide.key_message = "Vrew는 음성·자막·장면 편집과 최종 내보내기를, Suno는 음악 제작을 담당한다.";
    slide.required_content = "Vrew 자동 자막·텍스트 편집 / Suno 음악 제작 / Vrew 최종 조립·내보내기";
    slide.visual_type = "2도구 production pipeline";
    slide.prompt_status = "pending";
    slide.image_status = "generated";
    slide.review_status = "pending";
  }
  if (slide.id === "COMMON-M06-D02-S017") {
    slide.title = "Vrew에서는 메시지 순서대로 완성한다";
    slide.key_message = "효과를 늘리기보다 훅–핵심–마무리 구조가 먼저 보이도록 장면과 자막을 놓고 음악을 맞춘다.";
    slide.required_content = "훅 장면 / 핵심 자막 / 마무리 장면 / 음악·음량 균형 / Vrew 내보내기";
    slide.prompt_status = "pending";
    slide.image_status = "generated";
    slide.review_status = "pending";
  }
}

const revisedSlides = [
  {
    id: "COMMON-M06-D02-S003",
    labels: ["Vrew 자막", "텍스트 편집", "Suno 음악", "Vrew 완성"],
  },
  {
    id: "COMMON-M06-D02-S017",
    labels: ["훅", "핵심", "마무리", "내보내기"],
  },
];
for (const revision of revisedSlides) {
  const slide = manifest.slides.find((item) => item.id === revision.id);
  if (!slide) throw new Error(`Missing revision target: ${revision.id}`);
  const sourceDir = path.join(ROOT, "assets", "slide-sources", "revisions", slide.module, slide.course.toLowerCase());
  fs.mkdirSync(sourceDir, { recursive: true });
  fs.writeFileSync(path.join(sourceDir, `${slide.id}.svg`), slideSvg(slide, revision.labels), "utf8");
}

const additions = [];
for (const [dayKey, config] of Object.entries(optionalLibrary)) {
  const [module, day] = dayKey.split("-");
  let order = Math.max(...manifest.slides.filter((slide) => slide.module === module && slide.day === day).map((slide) => slide.order));
  for (const [lesson, title, keyMessage, labels] of config.common) {
    order += 1;
    additions.push(makeSlide("COMMON", module, day, order, lesson, title, keyMessage, labels));
  }
  for (const [lesson, boTitle, boMessage, boLabels, mkTitle, mkMessage, mkLabels] of config.pairs) {
    order += 1;
    additions.push(makeSlide("BACKOFFICE", module, day, order, lesson, boTitle, boMessage, boLabels));
    additions.push(makeSlide("MARKETING", module, day, order, lesson, mkTitle, mkMessage, mkLabels));
  }
}

if (additions.length !== 105) throw new Error(`Expected 105 additions, found ${additions.length}`);
for (const slide of additions) {
  if (existingIds.has(slide.id)) throw new Error(`Duplicate id: ${slide.id}`);
  const sourceDir = path.join(SOURCE_ROOT, slide.module, slide.course.toLowerCase());
  fs.mkdirSync(sourceDir, { recursive: true });
  fs.writeFileSync(path.join(sourceDir, `${slide.id}.svg`), slideSvg(slide, slide._labels), "utf8");
  delete slide._labels;
}

manifest.slides.push(...additions);
manifest.slides.sort((a, b) => a.module.localeCompare(b.module) || a.day.localeCompare(b.day) || a.order - b.order || a.course.localeCompare(b.course));

const commonCount = manifest.slides.filter((slide) => slide.course === "COMMON").length;
const boCount = manifest.slides.filter((slide) => slide.course === "BACKOFFICE").length;
const mkCount = manifest.slides.filter((slide) => slide.course === "MARKETING").length;
const boOnly = manifest.slides.filter((slide) => slide.content_type === "BACKOFFICE_ONLY").length;
const mkOnly = manifest.slides.filter((slide) => slide.content_type === "MARKETING_ONLY").length;
const sharedRecords = manifest.slides.filter((slide) => slide.content_type === "SHARED_STRUCTURE").length;
manifest.summary = {
  manifest_records: manifest.slides.length,
  unique_image_assets: manifest.slides.length,
  course_deck_slides: { BACKOFFICE: commonCount + boCount, MARKETING: commonCount + mkCount },
  course_asset_counts: { COMMON: commonCount, BACKOFFICE: boCount, MARKETING: mkCount },
  content_type_counts: {
    COMMON: commonCount,
    SHARED_STRUCTURE: sharedRecords,
    SHARED_STRUCTURE_POSITIONS: sharedRecords / 2,
    BACKOFFICE_ONLY: boOnly,
    MARKETING_ONLY: mkOnly,
  },
};

fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
const fields = ["id", "course", "module", "day", "lesson", "order", "title", "purpose", "key_message", "required_content", "visual_type", "content_type", "image_filename", "prompt_status", "image_status", "review_status"];
const csv = [fields.join(","), ...manifest.slides.map((slide) => fields.map((field) => csvEscape(slide[field])).join(","))].join("\r\n") + "\r\n";
fs.writeFileSync(CSV_PATH, csv, "utf8");
console.log(`optional_slide_library=added additions=${additions.length} manifest=${manifest.slides.length} backoffice=${manifest.summary.course_deck_slides.BACKOFFICE} marketing=${manifest.summary.course_deck_slides.MARKETING}`);
