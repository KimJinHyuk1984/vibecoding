/* ★ 공통 관리 파일: instructor는 템플릿 원본에서만 수정해 모든 강의에 반영합니다.
 * site, levels와 otherLectures는 각 강의 저장소에서 수정합니다.
 * 동기화 스크립트는 이 파일을 덮어쓰지 않습니다. instructor 변경은 수동으로 병합합니다.
 */
window.SITE = {
  site: {
    title: "바이브코딩의 모든 것",
    subtitle: "아이디어를 설명하고, 실행하고, 고치며 완성하는 프로젝트 수업. 첫 게임부터 저장과 공유까지 Google Workspace와 함께 만듭니다.",
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
  // plan2.md의 6개 프로젝트. 1~6회 본문 작성 완료. 회차별 피드백을 반영합니다.
  levels: [
    {"slug":"lesson-01","badge":"1회","title":"내 게임을 우리 반 서비스로","subtitle":"말로 만든 무한의 계단을 내 취향으로 꾸미고, 기록을 저장해 친구들과 함께 사용합니다.","kicker":"만들고, 저장하고, 함께 쓰기","duration":"","target":"고등학생","difficulty":"입문","tags":["첫 게임","Sheets 저장","공유 랭킹"],"accent":"neon-green","emoji":"","cover":"","status":"ready"},
    {"slug":"lesson-02","badge":"2회","title":"우리 학교 축제 운영 서비스","subtitle":"친구들의 관심을 조사하고, 예약과 취소를 받아 운영 현황까지 한눈에 봅니다.","kicker":"조사하고, 예약받고, 한눈에 보기","duration":"","target":"고등학생","difficulty":"기초","tags":["Forms 설문","예약·취소","대시보드"],"accent":"neon-green","emoji":"","cover":"","status":"ready"},
    {"slug":"lesson-03","badge":"3회","title":"일하는 동아리 자동 비서","subtitle":"신청을 일정과 연결하고 활동 기록을 보고서와 PDF로 완성합니다.","kicker":"연결하고, 자동으로, 문서로 남기기","duration":"","target":"고등학생","difficulty":"기초","tags":["트리거","Calendar","Docs·PDF"],"accent":"violet","emoji":"","cover":"","status":"ready"},
    {"slug":"lesson-04","badge":"4회","title":"우리 학교 분실물 센터","subtitle":"사진을 등록하고 장소·종류로 검색하며 반환 상태를 관리합니다.","kicker":"올리고, 찾고, 돌려주기","duration":"","target":"고등학생","difficulty":"활용","tags":["파일 업로드","Drive","검색"],"accent":"violet","emoji":"","cover":"","status":"ready"},
    {"slug":"lesson-05","badge":"5회","title":"우리 학교 정보 도우미","subtitle":"급식·날씨 API를 연결하고 출처가 있는 정보로 질문에 답합니다.","kicker":"요청하고, 확인하고, 답하기","duration":"","target":"고등학생","difficulty":"활용","tags":["외부 API","JSON","AI 연동"],"accent":"amber","emoji":"","cover":"","status":"ready"},
    {"slug":"lesson-06","badge":"6회","title":"내 아이디어를 실제 서비스로","subtitle":"배운 기능으로 내 앱을 만들고 오류 해결과 친구 테스트로 개선합니다.","kicker":"기획하고, 만들고, 시험하고, 개선하기","duration":"","target":"고등학생","difficulty":"도전","tags":["독립 제작","오류 해결","사용자 테스트"],"accent":"amber","emoji":"","cover":"","status":"ready"}
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
