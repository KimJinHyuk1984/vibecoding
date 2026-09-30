/* ★ 공통 관리 파일: instructor는 템플릿 원본에서만 수정해 모든 강의에 반영합니다.
 * site, levels와 otherLectures는 각 강의 저장소에서 수정합니다.
 * 동기화 스크립트는 이 파일을 덮어쓰지 않습니다. instructor 변경은 수동으로 병합합니다.
 */
window.SITE = {
  site: {
    title: "바이브코딩의 모든 것",
    subtitle: "상상한 것을 직접 만드는 13번의 수업. 프롬프트를 복사하고, 실행하고, 내 생각을 더해보세요. Google Workspace와 함께 게임부터 생활 속 서비스까지 만듭니다.",
    repo: "vibecoding"
  },
  // ── 이 아래 instructor 블록은 모든 강의 저장소에서 동일하게 유지한다 ──
  instructor: {
    name: "김진혁",
    affiliation: "동양고등학교 · 수학, 정보",
    email: "kimjh0630@naver.com",
    photo: "assets/img/instructor.jpg",
    credentials: [
      "동양고등학교 교사(수학, 정보)",
      "성균관대학교 일반대학원 수학교육전공 박사 수료",
      "서울시교육청 초중등 AI교육 연구회 부회장",
      "(2022개정 교육과정) 『데이터 과학』 교과서 집필진(올드앤뉴)",
      "(2022개정 교육과정) 『논리와 사고』 교과서 집필진(세종)",
      "AIEDAP마스터 교원(서울, 경기, 인천, 제주 권역)",
      "서울시교육청 AI융합교육 선도교사(2023~)",
      "2026학년도 서울시교육청 AI중점학교 지원단",
      "『인공지능 진로진학 교육자료』 집필진(서울시교육청, 2022)",
      "『면접보고 대학가자』 집필진(올드앤뉴, 2023)"
    ]
  },

  // ── 이 아래는 강의마다 교체한다 ──
  // 기존 16회 계획의 13·14·16회를 제외합니다. 기존 15회는 새 13회입니다.
  // 1·2회를 작성했습니다. 뒤 회차는 피드백 후 하나씩 공개합니다.
  levels: [
    { slug: "lesson-01", badge: "1회", title: "말로 만드는 나의 첫 게임", subtitle: "바이브코딩을 알아보고, 무한의 계단 게임에 나만의 아이디어를 더합니다.", kicker: "FIRST BUILD", duration: "120분 · 휴식 포함", target: "고등학생", difficulty: "입문", tags: ["Gemini", "프롬프트", "첫 게임"], accent: "neon-green", emoji: "", cover: "", status: "ready" },
    { slug: "lesson-02", badge: "2회", title: "같은 게임, 완전히 다른 스타일", subtitle: "무한의 계단을 내 세계관으로 바꾸고, 20칸 도착 규칙을 더합니다.", kicker: "REMIX", duration: "120분 · 휴식 포함", target: "고등학생", difficulty: "입문", tags: ["요구사항", "디자인", "게임 규칙"], accent: "neon-green", emoji: "", cover: "", status: "ready" },
    { slug: "lesson-03", badge: "3회", title: "우리 반 게임 랭킹", subtitle: "GAS와 Sheets를 연결해 친구들의 기록을 모으는 웹앱을 만듭니다.", kicker: "SAVE DATA", duration: "2시간", target: "고등학생", difficulty: "기초", tags: ["Apps Script", "Sheets"], accent: "neon-green", emoji: "", cover: "", status: "coming" },
    { slug: "lesson-04", badge: "4회", title: "학교 축제 부스 예약", subtitle: "신청과 취소, 정원 확인이 가능한 작은 예약 서비스를 만듭니다.", kicker: "BUILD A SERVICE", duration: "2시간", target: "고등학생", difficulty: "기초", tags: ["데이터", "예약"], accent: "neon-green", emoji: "", cover: "", status: "coming" },
    { slug: "lesson-05", badge: "5회", title: "우리 반 취향 대시보드", subtitle: "설문 응답을 모아 한눈에 볼 수 있는 결과 화면을 만듭니다.", kicker: "READ DATA", duration: "2시간", target: "고등학생", difficulty: "기초", tags: ["Forms", "Sheets"], accent: "violet", emoji: "", cover: "", status: "coming" },
    { slug: "lesson-06", badge: "6회", title: "동아리 운영 자동 비서", subtitle: "신청 내용을 일정으로 연결하고 반복 작업을 자동화합니다.", kicker: "AUTOMATE", duration: "2시간", target: "고등학생", difficulty: "기초", tags: ["Calendar", "트리거"], accent: "violet", emoji: "", cover: "", status: "coming" },
    { slug: "lesson-07", badge: "7회", title: "버튼 하나로 활동 보고서", subtitle: "기록한 데이터를 문서 양식에 넣어 보고서를 자동으로 만듭니다.", kicker: "MAKE DOCUMENTS", duration: "2시간", target: "고등학생", difficulty: "기초", tags: ["Docs", "Drive"], accent: "violet", emoji: "", cover: "", status: "coming" },
    { slug: "lesson-08", badge: "8회", title: "사진으로 찾는 분실물", subtitle: "파일을 저장하고 검색할 수 있는 분실물 게시판을 만듭니다.", kicker: "CONNECT FILES", duration: "2시간", target: "고등학생", difficulty: "활용", tags: ["Drive", "검색"], accent: "violet", emoji: "", cover: "", status: "coming" },
    { slug: "lesson-09", badge: "9회", title: "내 앱에 오늘의 학교 정보", subtitle: "외부 데이터를 가져와 급식이나 날씨를 보여주는 위젯을 만듭니다.", kicker: "CONNECT AN API", duration: "2시간", target: "고등학생", difficulty: "활용", tags: ["공공데이터", "API"], accent: "amber", emoji: "", cover: "", status: "coming" },
    { slug: "lesson-10", badge: "10회", title: "질문에 답하는 앱의 원리", subtitle: "질문과 답변을 연결하고 AI의 답변을 확인하는 방법을 배웁니다.", kicker: "UNDERSTAND AI", duration: "2시간", target: "고등학생", difficulty: "활용", tags: ["AI 응답", "검증"], accent: "amber", emoji: "", cover: "", status: "coming" },
    { slug: "lesson-11", badge: "11회", title: "고장 난 앱 구조대", subtitle: "오류를 재현하고, 원인을 좁히고, 고친 결과를 다시 확인합니다.", kicker: "DEBUG", duration: "2시간", target: "고등학생", difficulty: "활용", tags: ["오류 해결", "복구"], accent: "amber", emoji: "", cover: "", status: "coming" },
    { slug: "lesson-12", badge: "12회", title: "처음 보는 문제에 도전", subtitle: "문제를 기능으로 나누고 새로운 주제의 미니 앱을 직접 만듭니다.", kicker: "BUILD YOUR IDEA", duration: "2시간", target: "고등학생", difficulty: "도전", tags: ["기획", "독립 제작"], accent: "amber", emoji: "", cover: "", status: "coming" },
    { slug: "lesson-13", badge: "13회", title: "친구가 써보고, 내가 다시 만들기", subtitle: "앞에서 만든 앱을 친구에게 테스트받고 불편한 점을 개선합니다.", kicker: "TEST AND IMPROVE", duration: "2시간", target: "고등학생", difficulty: "도전", tags: ["사용자 테스트", "개선"], accent: "amber", emoji: "", cover: "", status: "coming" }
  ],

  // 다른 강의로 이동하는 링크 (전부 외부 절대 주소)
  otherLectures: [
    {
      title: "딥러닝 CNN으로 포트홀을 찾아라",
      url: "https://kimjinhyuk1984.github.io/pothole/",
      emoji: ""
    }
  ]
};
