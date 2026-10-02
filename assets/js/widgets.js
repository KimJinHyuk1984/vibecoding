/* 강의 전용 위젯. 외부 요청 없이 HTTP와 file://에서 실행합니다. */
window.WIDGETS = window.WIDGETS || {};
(function () {
  "use strict";
  function node(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
  }
  function storageKey(suffix) {
    const repo = (window.SITE && window.SITE.site && window.SITE.site.repo) || "vibecoding";
    return "lecture-work:" + repo + ":" + (document.body.dataset.level || "hub") + ":" + suffix;
  }
  function readStorage(key) {
    try { return localStorage.getItem(key); } catch (_) { return null; }
  }
  function writeStorage(key, value) {
    try { localStorage.setItem(key, value); return true; } catch (_) { return false; }
  }
  window.WIDGETS["stairs-game"] = function (host) {
    const goal = host.dataset.goal === "20" ? 20 : 0;
    const panel = node("div", "interactive-widget stairs-game");
    const top = node("div", "game-topline");
    top.append(node("h3", "", goal ? "20칸 도착 챌린지" : "무한의 계단 · 첫 도전"), node("p", "", "체험용 예제 · 제한 시간 없음"));
    const scoreboard = node("div", "stairs-scoreboard");
    const scoreLabel = node("strong", "stairs-score", "0칸");
    const facingLabel = node("span", "stairs-facing");
    const bestLabel = node("span", "stairs-best", "최고 0칸");
    scoreboard.append(scoreLabel, facingLabel, bestLabel);
    const board = node("div", "stairs-board");
    board.tabIndex = 0;
    board.setAttribute("role", "group");
    board.setAttribute("aria-label", "무한의 계단 게임. 왼쪽 방향키는 방향 전환, 오른쪽 방향키는 올라가기.");
    function svgNode(tag, attrs) {
      const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
      Object.keys(attrs).forEach(function (key) { el.setAttribute(key, attrs[key]); });
      return el;
    }
    const scene = svgNode("svg", { viewBox: "0 0 600 310", "aria-hidden": "true", focusable: "false" });
    board.append(scene);
    const status = node("p", "stairs-status");
    status.setAttribute("role", "status");
    const controls = node("div", "stairs-controls");
    const turn = node("button", "button stairs-turn", "← 방향 전환");
    const climb = node("button", "button button-primary stairs-climb", "→ 올라가기");
    const start = node("button", "button stairs-start", "시작");
    [turn, climb, start].forEach(function (button) { button.type = "button"; });
    controls.append(turn, climb, start);
    const help = node("p", "game-help", "←는 제자리에서 방향만 바꿔요. →는 바라보는 쪽으로 올라가요. 터치는 위 버튼을 사용하세요.");
    let phase = "idle";
    let facing = 1;
    let score = 0;
    let best = 0;
    let steps = [0, 1];
    let current = 0;
    function extendSteps() {
      while (steps.length < current + 8) {
        const last = steps[steps.length - 1];
        const previous = last - steps[steps.length - 2];
        let direction = Math.random() < 0.6 ? previous : -previous;
        if (last >= 4) direction = -1;
        if (last <= -4) direction = 1;
        steps.push(last + direction);
      }
    }
    function directionName(direction) { return direction === 1 ? "오른쪽" : "왼쪽"; }
    function render(message) {
      panel.dataset.state = phase;
      scoreLabel.textContent = score + "칸" + (goal ? " / 목표 20칸" : "");
      facingLabel.textContent = "바라보는 쪽: " + directionName(facing) + (facing === 1 ? " →" : " ←");
      bestLabel.textContent = "최고 " + best + "칸";
      turn.disabled = climb.disabled = phase !== "playing";
      start.textContent = phase === "idle" ? "시작" : "다시 시작";
      const nextDirection = steps[current + 1] - steps[current];
      status.textContent = message || ("다음 계단: " + directionName(nextDirection) + ". 방향을 맞추고 →로 올라가요.");
      scene.replaceChildren();
      steps.forEach(function (column, index) {
        const offset = index - current;
        if (offset < -1) return;
        scene.append(svgNode("rect", { x: 300 + column * 46 - 32, y: 258 - offset * 36, width: 64, height: 13, rx: 4, "class": "stairs-step" + (offset === 0 ? " is-current" : offset === 1 ? " is-next" : ""), "data-offset": offset }));
      });
      const player = svgNode("g", { "class": "stairs-player", transform: "translate(" + (300 + steps[current] * 46) + " 258)" });
      player.append(
        svgNode("rect", { x: -12, y: -29, width: 24, height: 27, rx: 5, "class": "stairs-body" }),
        svgNode("circle", { cx: 0, cy: -40, r: 13, "class": "stairs-head" }),
        svgNode("circle", { cx: facing * 5, cy: -42, r: 2.5, "class": "stairs-eye" }),
        svgNode("path", { d: facing === 1 ? "M 23 -34 L 34 -27 L 23 -20 Z" : "M -23 -34 L -34 -27 L -23 -20 Z", "class": "stairs-pointer" })
      );
      scene.append(player);
    }
    function restart() {
      phase = "playing"; facing = 1; score = 0; current = 0; steps = [0, 1];
      extendSteps(); render(); board.focus({ preventScroll: true });
    }
    function act(action) {
      if (phase !== "playing") return;
      if (action === "turn") {
        facing *= -1;
        render();
      } else if (steps[current + 1] - steps[current] !== facing) {
        phase = "over";
        render("게임 끝! " + score + "칸 올랐어요. 다음 계단은 " + directionName(steps[current + 1] - steps[current]) + "에 있었어요.");
      } else {
        score += 1; best = Math.max(best, score); current += 1;
        // Keep only nearby steps: the course can continue without growing the DOM.
        if (current > 2) { steps.shift(); current -= 1; }
        extendSteps();
        if (goal && score >= goal) {
          phase = "won";
          render("도착! 20칸을 완주했어요. 다시 시작하면 0칸부터 도전해요.");
        } else { render(); }
      }
      board.focus({ preventScroll: true });
    }
    start.addEventListener("click", restart);
    turn.addEventListener("click", function () { act("turn"); });
    climb.addEventListener("click", function () { act("climb"); });
    panel.addEventListener("keydown", function (event) {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      // Only the focused game owns these keys; the lesson keeps its navigation keys.
      event.preventDefault(); event.stopPropagation();
      if (!event.repeat) act(event.key === "ArrowLeft" ? "turn" : "climb");
    });
    extendSteps(); render("시작을 누르세요. 첫 계단은 오른쪽, 캐릭터도 오른쪽을 보고 있어요.");
    panel.append(top, scoreboard, board, status, controls, help);
    host.replaceChildren(panel);
  };
  window.WIDGETS["stairs-remix"] = function (host) {
    const lab = node("div", "remix-lab");
    const choices = node("div", "remix-choices");
    choices.setAttribute("role", "group");
    choices.setAttribute("aria-label", "체험 게임 테마 선택");
    const preview = node("div", "remix-preview");
    window.WIDGETS["stairs-game"](preview);
    const themes = [
      { key: "basic", label: "기본 계단", title: "무한의 계단 · 첫 도전", accent: "neon-green" },
      { key: "space", label: "우주 탐험", title: "별을 향해, 우주 계단", accent: "violet" },
      { key: "library", label: "도서관 탐험", title: "책장 꼭대기를 향해", accent: "amber" }
    ];
    const feedback = node("p", "remix-feedback");
    feedback.setAttribute("role", "status");
    function select(theme) {
      preview.dataset.remix = theme.key;
      preview.dataset.accent = theme.accent;
      preview.querySelector("h3").textContent = theme.title;
      choices.querySelectorAll("button").forEach(function (button) { button.setAttribute("aria-pressed", String(button.dataset.themeChoice === theme.key)); });
      feedback.textContent = theme.label + " 선택 · 제목·색·계단 모양만 바뀌어요. 점수와 조작은 그대로예요.";
    }
    themes.forEach(function (theme) {
      const button = node("button", "button", theme.label);
      button.type = "button";
      button.dataset.themeChoice = theme.key;
      button.addEventListener("click", function () { select(theme); });
      choices.append(button);
    });
    select(themes[0]);
    lab.append(choices, preview, feedback);
    host.replaceChildren(lab);
  };
  window.WIDGETS["ranking-lab"] = function (host) {
    const panel = node("div", "ranking-lab");
    panel.append(node("h3", "", "저장하고, 다시 읽으면 랭킹이 바뀌어요"), node("p", "ranking-caption", "이 화면 안에서만 동작하는 연습입니다. Google Sheets에 전송하지 않으며 새로고침하면 초기화돼요."));
    const form = node("form", "ranking-form");
    const nameLabel = node("label", "", "연습 별명");
    const alias = node("input", "ranking-alias");
    alias.value = "별01"; alias.required = true; alias.maxLength = 12;
    alias.pattern = "[가-힣A-Za-z0-9]{2,12}"; alias.autocomplete = "off";
    nameLabel.append(alias);
    const scoreLabel = node("label", "", "연습 칸 수");
    const score = node("input", "ranking-score");
    score.type = "number"; score.min = "0"; score.max = "10000"; score.step = "1"; score.value = "16"; score.required = true;
    scoreLabel.append(score);
    const actions = node("div", "ranking-actions");
    const save = node("button", "button button-primary ranking-save", "① 기록 저장");
    save.type = "submit";
    const read = node("button", "button ranking-read", "② 랭킹 불러오기"); read.type = "button";
    const reset = node("button", "button ranking-reset", "예제 초기화"); reset.type = "button";
    actions.append(save, read, reset); form.append(nameLabel, scoreLabel, actions);
    const status = node("p", "ranking-status", "별01의 16칸을 저장한 뒤 랭킹을 다시 불러보세요.");
    status.setAttribute("role", "status");
    const grid = node("div", "ranking-tables");
    function table(title, headings) {
      const wrapper = node("div", "ranking-table-wrap");
      const el = node("table"); el.append(node("caption", "", title));
      const head = node("thead"), row = node("tr"), body = node("tbody");
      headings.forEach(function (heading) { const cell = node("th", "", heading); cell.scope = "col"; row.append(cell); });
      head.append(row); el.append(head, body); wrapper.append(el); grid.append(wrapper);
      return body;
    }
    const rawBody = table("저장소 예시 · 최근 4행", ["별명", "칸 수"]);
    const rankBody = table("랭킹 예시 · 별명별 최고", ["순위", "별명", "칸 수"]);
    let rows = [], busy = false, submitted = false;
    function display(body, values) {
      body.replaceChildren();
      values.forEach(function (values) { const row = node("tr"); values.forEach(function (value) { row.append(node("td", "", String(value))); }); body.append(row); });
    }
    function renderRows() { display(rawBody, rows.slice(-4).map(function (row) { return [row.nickname, row.score]; })); }
    function renderRank() {
      const best = new Map();
      rows.forEach(function (row) { if (!best.has(row.nickname) || row.score > best.get(row.nickname).score) best.set(row.nickname, row); });
      const sorted = Array.from(best.values()).sort(function (a, b) { return b.score - a.score || a.order - b.order; });
      let rank = 0;
      display(rankBody, sorted.slice(0, 4).map(function (row, index) { if (!index || row.score !== sorted[index - 1].score) rank = index + 1; return [rank, row.nickname, row.score]; }));
    }
    function buttons() { save.disabled = busy || submitted; read.disabled = reset.disabled = alias.disabled = score.disabled = busy; }
    function initialize() {
      rows = [{ nickname: "별01", score: 12, order: 0 }, { nickname: "달02", score: 8, order: 1 }, { nickname: "별01", score: 6, order: 2 }];
      alias.value = "별01"; score.value = "16"; submitted = false; buttons(); renderRows(); renderRank();
      status.textContent = "별01의 16칸을 저장한 뒤 랭킹을 다시 불러보세요.";
    }
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (busy || submitted || !form.reportValidity()) return;
      if (rows.length >= 30) { status.textContent = "연습 기록이 30행이에요. 예제 초기화 후 다시 해보세요."; return; }
      const record = { nickname: alias.value.trim(), score: Number(score.value), order: rows.length };
      busy = true; buttons(); status.textContent = "저장 중… (연습 화면)";
      setTimeout(function () {
        rows.push(record); busy = false; submitted = true; buttons(); renderRows();
        status.textContent = "저장 완료! 랭킹은 아직 이전 화면이에요. ‘② 랭킹 불러오기’를 눌러주세요.";
      }, 400);
    });
    form.addEventListener("input", function () { if (!busy) { submitted = false; buttons(); } });
    read.addEventListener("click", function () { renderRank(); status.textContent = "랭킹을 다시 읽었어요. 같은 별명은 최고 기록 하나만, 같은 점수는 같은 순위예요."; });
    reset.addEventListener("click", initialize);
    initialize(); panel.append(form, status, grid); host.replaceChildren(panel);
  };
  window.WIDGETS["festival-lab"] = function (host) {
    const names = ["방탈출", "인생네컷", "미니게임"];
    const panel = node("div", "festival-lab");
    const heading = node("h3", "", "관심과 예약, 숫자가 다르게 움직여요");
    const caption = node("p", "festival-caption", "이 화면 안의 연습 · 실제 예약·시트 연결 아님 · 새로고침하면 초기화");
    const controls = node("div", "festival-controls");
    const label = node("label", "festival-choice");
    label.append(node("span", "", "체험할 부스"));
    const select = node("select", "festival-select");
    names.forEach(function (name, i) { const option = node("option", "", name); option.value = String(i); select.append(option); });
    label.append(select);
    const vote = node("button", "button festival-vote", "관심 +1표");
    const book = node("button", "button button-primary festival-book", "1명 예약");
    const cancel = node("button", "button festival-cancel", "1명 취소");
    const duel = node("button", "button festival-duel", "마지막 자리 · 2명 신청");
    const reset = node("button", "button festival-reset", "체험 초기화");
    const buttons = [vote, book, cancel, duel, reset];
    buttons.forEach(function (button) { button.type = "button"; });
    controls.append(label, vote, book, cancel, duel, reset);
    const charts = node("div", "festival-charts");
    const status = node("p", "festival-status");
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    const help = node("p", "festival-help", "두 명 신청 체험은 한 자리 남았을 때 켜져요. 막대의 기준은 관심=전체 표, 예약=정원 2명이에요.");
    let votes, booked, busy = false;
    function render(message) {
      charts.replaceChildren();
      const total = votes.reduce(function (sum, n) { return sum + n; }, 0);
      names.forEach(function (name, i) {
        const card = node("div", "festival-booth");
        card.dataset.booth = String(i);
        card.append(node("h4", "", name + " · 남은 자리 " + (2 - booked[i]) + "명"));
        [["관심", votes[i] + " / " + total + "표", total ? votes[i] / total : 0, "interest"],
          ["예약", booked[i] + " / 2명", booked[i] / 2, "booked"]].forEach(function (metric) {
          const row = node("div", "festival-metric");
          row.append(node("span", "", metric[0] + " " + metric[1]));
          const track = node("div", "festival-track");
          track.setAttribute("aria-hidden", "true");
          const bar = node("div", "festival-bar festival-bar-" + metric[3]);
          bar.style.width = metric[2] * 100 + "%";
          track.append(bar); row.append(track); card.append(row);
        });
        charts.append(card);
      });
      const chosen = Number(select.value);
      buttons.forEach(function (button) { button.disabled = busy; });
      select.disabled = busy;
      book.disabled = busy || booked[chosen] >= 2;
      cancel.disabled = busy || booked[chosen] === 0;
      duel.disabled = busy || booked[chosen] !== 1;
      panel.dataset.busy = String(busy);
      if (message) status.textContent = message;
    }
    function initialize() {
      votes = [5, 3, 2]; booked = [1, 0, 0]; select.value = "0"; busy = false;
      render("방탈출은 관심 5표, 예약 1명. 마지막 한 자리에 두 명이 신청하면 어떻게 될까요?");
    }
    select.addEventListener("change", function () { render(names[Number(select.value)] + "의 관심과 예약을 바꿔보세요."); });
    vote.addEventListener("click", function () {
      if (busy) return;
      const i = Number(select.value); votes[i]++;
      render("관심 1표를 더했어요. 예약과 남은 자리는 그대로예요.");
    });
    book.addEventListener("click", function () {
      const i = Number(select.value);
      if (busy || booked[i] >= 2) return;
      booked[i]++;
      render("연습 예약 1명이 늘었어요. 관심 표는 그대로예요.");
    });
    cancel.addEventListener("click", function () {
      const i = Number(select.value);
      if (busy || booked[i] === 0) return;
      booked[i]--;
      render("연습 예약 1명을 취소했어요. 남은 자리만 1명 늘었어요.");
    });
    duel.addEventListener("click", function () {
      const i = Number(select.value);
      if (busy || booked[i] !== 1) return;
      busy = true; render("두 신청을 차례로 확인하는 중… 실제 동시 접속은 내 앱에서 친구와 시험해요.");
      setTimeout(function () {
        booked[i]++; busy = false;
        render("연습 결과: 첫 신청 성공, 다음 신청 마감. 마지막 한 자리는 한 명에게만! 실제 서버도 이 규칙을 지켜야 해요.");
      }, 350);
    });
    reset.addEventListener("click", function () { if (!busy) initialize(); });
    panel.append(heading, caption, charts, controls, status, help);
    host.replaceChildren(panel);
    initialize();
  };
  window.WIDGETS["club-lab"] = function (host) {
    const panel = node("div", "club-lab");
    const heading = node("h3", "", "신청 한 건이 일정과 보고서로");
    const caption = node("p", "club-caption", "이 화면 안의 모의 실험 · Google 연결·실제 파일 생성 없음 · 새로고침하면 초기화");
    const summary = node("div", "club-summary");
    const current = node("p", "club-current");
    const options = node("div", "club-options");
    const autoLabel = node("label", "");
    const automatic = node("input", "club-auto"); automatic.type = "checkbox";
    autoLabel.append(automatic, document.createTextNode("새 신청의 일정 자동 등록"));
    const failLabel = node("label", "");
    const fail = node("input", "club-fail"); fail.type = "checkbox";
    failLabel.append(fail, document.createTextNode("다음 PDF 저장을 한 번 실패시키기"));
    options.append(autoLabel, failLabel);
    const actions = node("div", "club-actions");
    const submit = node("button", "button button-primary club-submit", "① 새 신청 도착");
    const calendar = node("button", "button club-calendar", "② 일정 등록");
    const result = node("button", "button club-result", "③ 활동 결과 기록");
    const report = node("button", "button club-report", "④ 보고서·PDF 만들기");
    const reset = node("button", "button club-reset", "체험 초기화");
    const buttons = [submit, calendar, result, report, reset];
    buttons.forEach(function (button) { button.type = "button"; actions.append(button); });
    const status = node("p", "club-status"); status.setAttribute("role", "status"); status.setAttribute("aria-live", "polite");
    let activities = [], busy = false;
    function latest() { return activities[activities.length - 1]; }
    function render(message) {
      const record = latest();
      const totals = [activities.length, activities.filter(function (a) { return a.event; }).length, activities.filter(function (a) { return a.doc; }).length, activities.filter(function (a) { return a.pdf; }).length];
      summary.replaceChildren();
      [["신청", totals[0], "requests"], ["일정", totals[1], "events"], ["Docs", totals[2], "docs"], ["PDF", totals[3], "pdfs"]].forEach(function (metric) {
        const item = node("div", "club-stat");
        item.append(node("span", "", metric[0]));
        const count = node("strong", "club-count-" + metric[2], String(metric[1]) + "개");
        item.append(count); summary.append(item);
      });
      current.textContent = record ? "지금 활동 " + record.id + " · 일정 " + (record.event ? "완료" : "미등록") + " · 결과 " + (record.result ? "기록됨" : "비어 있음") + " · 보고서 " + (record.pdf ? "완료" : record.doc ? "PDF 재시도 필요" : "미생성") : "① 새 신청부터 시작해요. 이후 버튼은 가장 최근 신청을 처리합니다.";
      buttons.forEach(function (button) { button.disabled = busy; });
      calendar.disabled = busy || !record;
      result.disabled = busy || !record || !record.event;
      report.disabled = busy || !record;
      automatic.disabled = fail.disabled = busy;
      panel.dataset.busy = String(busy);
      if (message) status.textContent = message;
    }
    submit.addEventListener("click", function () {
      if (busy) return;
      activities.push({id: "활동-" + (activities.length + 1), event: automatic.checked, result: false, doc: false, pdf: false});
      render(automatic.checked ? "새 신청으로 일정도 자동 등록됐어요. 이전 신청은 바꾸지 않았어요." : "새 신청이 도착했어요. 이번에는 ② 일정 등록 메뉴를 직접 눌러요.");
    });
    calendar.addEventListener("click", function () {
      const record = latest(); if (busy || !record) return;
      const existed = record.event; record.event = true;
      render(existed ? "같은 활동번호의 일정이 이미 있어요. 새로 만들지 않고 기존 일정을 사용해요." : "선택한 활동의 일정 하나를 등록했어요. 같은 버튼을 다시 눌러보세요.");
    });
    result.addEventListener("click", function () {
      const record = latest(); if (busy || !record || !record.event) return;
      record.result = true;
      render("연습 결과를 기록했어요: 4명이 식물 세 종류를 관찰함. 실제 보고서는 내가 확인한 결과를 써야 해요.");
    });
    report.addEventListener("click", function () {
      const record = latest(); if (busy || !record) return;
      if (!record.result) { render("활동 결과가 비어 있어요. ③ 결과 기록 후 보고서를 만들어요. 빈 내용을 지어내지 않아요."); return; }
      if (record.pdf) { render("같은 내용의 Docs와 PDF가 이미 있어요. 파일을 늘리지 않고 기존 결과를 사용해요."); return; }
      const shouldFail = fail.checked; fail.checked = false;
      busy = true; render(record.doc ? "이미 만든 Docs를 재사용해 PDF 저장부터 다시 하는 중…" : "기록으로 Docs를 채우고 PDF로 저장하는 중…");
      setTimeout(function () {
        record.doc = true; record.pdf = !shouldFail; busy = false;
        render(shouldFail ? "Docs는 완료, PDF는 실패했어요. ④를 다시 누르면 문서를 더 만들지 않고 PDF 단계만 이어가요." : "Docs와 PDF가 모두 완료됐어요. 같은 버튼을 다시 눌러 파일 수가 늘지 않는지 보세요.");
      }, 350);
    });
    automatic.addEventListener("change", function () { render(automatic.checked ? "이제 새로 도착하는 신청의 일정만 자동 등록돼요. 기존 신청은 그대로예요." : "자동 등록을 껐어요. 새 신청은 메뉴로 일정을 등록해야 해요."); });
    reset.addEventListener("click", function () { if (busy) return; activities = []; automatic.checked = fail.checked = false; render("처음으로 돌아왔어요. 직접 실행과 자동 실행을 비교해보세요."); });
    panel.append(heading, caption, summary, current, options, actions, status);
    host.replaceChildren(panel);
    render("먼저 직접 실행해보고, 자동 등록을 켠 뒤 새 신청을 넣어보세요.");
  };
  // 사진 선택과 저장, 검색과 상태 변경을 구분하는 브라우저 메모리 모형입니다.
  window.WIDGETS["lost-lab"] = function (host) {
    const panel = node("div", "lost-lab");
    const heading = node("h3", "", "분실물 탐정이 되어보기");
    const caption = node("p", "lost-caption", "그림으로 만든 모의 체험 · 실제 파일 업로드와 Google 연결은 하지 않아요. 새로고침하면 처음으로 돌아와요.");
    const upload = node("div", "lost-upload");
    const preview = node("p", "lost-preview", "연습 사진을 선택하면 미리보기만 준비돼요.");
    const choose = node("button", "button lost-choose", "① 연습 사진 선택");
    const save = node("button", "button button-primary lost-save", "② 등록");
    const reset = node("button", "button lost-reset", "체험 초기화");
    [choose, save, reset].forEach(function (b) { b.type = "button"; });
    upload.append(choose, save, reset, preview);
    const filters = node("div", "lost-filters");
    const searchLabel = node("label", "lost-search-label", "물건·특징·장소 검색");
    const search = node("input", "lost-search"); search.type = "search"; search.maxLength = 80; search.placeholder = "예: 체육관";
    searchLabel.append(search);
    function select(label, cls, values) {
      const wrap = node("label", "", label), control = node("select", cls);
      values.forEach(function (v) { const opt = node("option", "", v); opt.value = v; control.append(opt); });
      wrap.append(control); filters.append(wrap); return control;
    }
    filters.append(searchLabel);
    const kind = select("종류", "lost-kind", ["전체", "문구", "의류", "전자기기", "기타"]);
    const state = select("상태", "lost-state", ["보관중", "반환완료", "전체"]);
    const clear = node("button", "button lost-clear", "조건 초기화"); clear.type = "button"; filters.append(clear);
    const tools = node("div", "lost-tools");
    const failLabel = node("label", "lost-fail-label");
    const fail = node("input", "lost-fail"); fail.type = "checkbox";
    failLabel.append(fail, document.createTextNode("사진 읽기 실패 체험"));
    const count = node("p", "lost-count"); count.setAttribute("aria-live", "polite");
    tools.append(count, failLabel);
    const list = node("div", "lost-list");
    const status = node("p", "lost-status", "① 사진 선택 뒤 목록이 늘어나는지 먼저 보세요."); status.setAttribute("role", "status");
    const help = node("p", "lost-caption", "아래 반환 버튼은 운영자 동작 체험이에요. 실제 앱의 반환 처리는 운영자의 시트 메뉴에서만 합니다.");
    let items, selected = false, registered = false;
    function initial() {
      return [
        {id:"L-01",title:"검정 우산",kind:"기타",place:"체육관",detail:"손잡이에 별 무늬",shape:"umbrella",returned:false},
        {id:"L-02",title:"초록 물병",kind:"기타",place:"운동장",detail:"뚜껑에 고리",shape:"bottle",returned:false},
        {id:"L-03",title:"흰 이어폰",kind:"전자기기",place:"도서관",detail:"둥근 충전 케이스",shape:"earbuds",returned:false}
      ];
    }
    function picture(item) {
      const frame = node("div", "lost-picture");
      if (fail.checked) { frame.append(node("span", "", "사진을 불러올 수 없음")); return frame; }
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("viewBox", "0 0 180 90"); svg.setAttribute("role", "img"); svg.setAttribute("aria-label", item.title + " 모형 그림");
      const paths = {
        umbrella: "M40 45 Q90 -12 140 45 Z M90 45 V72 Q90 88 77 78 M40 45 Q55 32 65 45 Q78 32 90 45 Q102 32 115 45 Q127 32 140 45",
        bottle: "M77 19 V8 H103 V19 M70 25 Q70 19 77 19 H103 Q110 19 110 25 V74 Q110 82 102 82 H78 Q70 82 70 74 Z M70 40 H110 M70 65 H110",
        earbuds: "M60 40 H120 Q130 40 130 52 V70 Q130 80 118 80 H62 Q50 80 50 70 V52 Q50 40 60 40 Z M64 40 V20 Q64 10 74 10 Q84 10 84 20 V34 M96 34 V20 Q96 10 106 10 Q116 10 116 20 V40 M50 56 H130",
        pencil: "M35 30 H145 V70 H35 Z M35 40 H145 M130 40 V51 H138 V40 M54 53 H111"
      };
      const shape = document.createElementNS("http://www.w3.org/2000/svg", "path"); shape.setAttribute("d", paths[item.shape]); svg.append(shape); frame.append(svg); return frame;
    }
    function draw(message, returnFocus) {
      const term = search.value.trim().toLocaleLowerCase();
      const matches = items.filter(function (item) {
        return [item.title, item.place, item.detail].join(" ").toLocaleLowerCase().includes(term) && (kind.value === "전체" || item.kind === kind.value) && (state.value === "전체" || (item.returned ? "반환완료" : "보관중") === state.value);
      });
      panel.dataset.total = String(items.length); panel.dataset.registered = String(registered);
      save.disabled = !selected;
      count.textContent = "결과 " + matches.length + "개 / 전체 " + items.length + "개";
      list.replaceChildren();
      matches.forEach(function (item) {
        const card = node("article", "lost-card"); card.dataset.item = item.id;
        card.append(picture(item), node("h4", "", item.title), node("p", "lost-item-meta", item.place + " · " + item.kind), node("p", "lost-item-detail", item.detail));
        card.append(node("p", "lost-badge", item.id + " · " + (item.returned ? "반환완료" : "보관중")));
        const button = node("button", "button lost-return", item.returned ? "이미 반환완료" : "반환 처리 체험");
        button.type = "button"; button.disabled = item.returned; button.setAttribute("aria-label", item.title + " " + button.textContent);
        button.addEventListener("click", function () {
          if (item.returned) return;
          item.returned = true;
          draw(item.title + "을 반환완료로 바꿨어요. 전체 기록은 " + items.length + "개 그대로예요. 상태를 반환완료로 바꾸어 찾아보세요.", item.id);
        });
        card.append(button); list.append(card);
      });
      if (!matches.length) list.append(node("p", "lost-empty", "조건에 맞는 물건이 없어요. 조건 초기화를 눌러 다시 찾아보세요."));
      if (message) status.textContent = message;
      // 반환하면서 카드가 목록에서 사라져도 키보드 사용자의 위치를 잃지 않습니다.
      if (returnFocus) state.focus();
    }
    choose.addEventListener("click", function () {
      selected = true; preview.textContent = "미리보기: 파란 필통 · 2학년 복도 · 지퍼에 별 장식 (모형 그림). 아직 새로 저장하지 않았어요.";
      draw(registered ? "같은 연습 사진을 다시 선택했어요. 등록을 눌러도 같은 요청은 한 번만 저장돼요." : "사진 선택만으로는 목록이 늘지 않아요. ② 등록을 눌러보세요.");
    });
    save.addEventListener("click", function () {
      if (!selected) return;
      if (registered) { draw("같은 요청은 이미 저장됐어요. 사진과 물건 기록을 더 만들지 않아요."); return; }
      items.push({id:"L-04",title:"파란 필통",kind:"문구",place:"2학년 복도",detail:"지퍼에 별 장식",shape:"pencil",returned:false}); registered = true;
      preview.textContent = "파란 필통 등록 완료 · 같은 요청을 다시 눌러도 기록은 하나예요.";
      draw("파란 필통을 등록했어요. 현재 검색 조건과 다르면 목록에 안 보일 수 있어요. 같은 등록 버튼을 한 번 더 눌러보세요.");
    });
    search.addEventListener("input", function () { draw(); });
    [kind, state].forEach(function (control) { control.addEventListener("change", function () { draw(); }); });
    fail.addEventListener("change", function () { draw(fail.checked ? "사진 읽기만 실패했어요. 물건 설명과 상태는 남아요. 체크를 풀면 다시 보여요." : "사진을 다시 읽었어요. 물건 기록은 바뀌지 않았어요."); });
    function clearFilters() { search.value = ""; kind.value = "전체"; state.value = "보관중"; }
    clear.addEventListener("click", function () { clearFilters(); draw("검색 조건을 지웠어요. 보관중인 물건부터 보여요."); });
    reset.addEventListener("click", function () {
      items = initial(); selected = registered = false; fail.checked = false; clearFilters();
      preview.textContent = "연습 사진을 선택하면 미리보기만 준비돼요."; draw("처음의 연습 물건 3개로 돌아왔어요.");
    });
    items = initial(); panel.append(heading, caption, upload, filters, tools, list, status, help); draw(); host.replaceChildren(panel);
  };
  // 실제 API를 호출하지 않는 GET·캐시·부분 실패·규칙 답변 모형입니다.
  window.WIDGETS["info-lab"] = function (host) {
    const panel = node("div", "info-lab");
    const caption = node("p", "info-caption", "가상 급식·날씨로 체험해요. 실제 API·AI 호출 없음 · 캐시 보관 5분인 모형");
    const controls = node("div", "info-controls");
    function select(label, cls, options, parent) {
      const wrap = node("label", "", label), control = node("select", cls);
      options.forEach(function (entry) { const option = node("option", "", entry[1]); option.value = entry[0]; control.append(option); });
      wrap.append(control); parent.append(wrap); return control;
    }
    const date = select("연습 날짜", "info-date", [["2026-10-05", "10월 5일 (연습)"], ["2026-10-06", "10월 6일 (연습)"]], controls);
    const scenario = select("응답 상황", "info-scenario", [["normal", "정상"], ["none", "급식 자료 없음"], ["auth", "급식 인증 오류"], ["weather-error", "날씨 연결 오류"], ["null", "강수확률 값 없음"], ["zero", "강수확률 0%"]], controls);
    const lookup = node("button", "button button-primary info-lookup", "정보 조회");
    const advance = node("button", "button info-advance", "5분 지나기");
    const reset = node("button", "button info-reset", "체험 초기화");
    [lookup, advance, reset].forEach(function (button) { button.type = "button"; controls.append(button); });
    const metrics = node("p", "info-metrics");
    const cards = node("div", "info-cards");
    const questions = node("div", "info-questions");
    const question = select("조회한 자료로 질문하기", "info-question", [["meal", "급식 알려줘"], ["umbrella", "우산 필요해?"], ["unknown", "시험 범위는?"]], questions);
    const ask = node("button", "button info-ask", "규칙으로 답하기"); ask.type = "button"; questions.append(ask);
    const answer = node("p", "info-answer", "규칙 기반 답변 · AI 아님. 먼저 정보를 조회해요."); answer.setAttribute("role", "status");
    const status = node("p", "info-status"); status.setAttribute("role", "status");
    let cache = new Map(), now = 0, requests = 0, hits = 0, snapshot = null, busy = false, sequence = 0, timer;
    function blankAnswer() { answer.textContent = "규칙 기반 답변 · AI 아님. 조회한 날짜의 자료로만 답해요."; }
    function render(message) {
      panel.dataset.requests = String(requests); panel.dataset.hits = String(hits); panel.dataset.minute = String(now); panel.dataset.busy = String(busy);
      [date, scenario, lookup, advance, question, ask].forEach(function (control) { control.disabled = busy; });
      ask.disabled = busy || !snapshot;
      metrics.textContent = "외부 요청(모의) " + requests + "회 · 캐시 재사용 " + hits + "건 · 연습 시각 " + now + "분";
      cards.replaceChildren();
      ["meal", "weather"].forEach(function (source) {
        const card = node("div", "info-card info-" + source), record = snapshot && snapshot[source];
        card.append(node("h3", "", source === "meal" ? "점심 카드" : "예보 카드"));
        if (!record) { card.append(node("p", "", busy ? "불러오는 중…" : "조회 전")); }
        else {
          card.dataset.state = record.state;
          const line = node("p", "info-data", record.text);
          const origin = node("p", "info-origin", snapshot.date + " · 가상 " + (source === "meal" ? "급식" : "날씨") + " 자료");
          const stamp = node("p", "info-stamp", record.state === "error" ? "조회 실패 · 성공 자료로 보관하지 않음" : (record.cached ? "캐시 재사용" : "새로 조회") + " · 가져온 시각 " + record.fetched + "분");
          card.append(line, origin, stamp);
        }
        cards.append(card);
      });
      if (message) status.textContent = message;
    }
    function getRecord(source, pickedDate, mode) {
      if (source === "meal") {
        if (mode === "auth") return {state:"error",text:"인증 오류 · 키 설정을 확인해요."};
        if (mode === "none") return {state:"empty",text:"이 날짜의 급식 자료 없음 · 운영 여부는 별도 확인"};
        return {state:"ok",text:pickedDate === "2026-10-05" ? "쌀밥 · 미역국(5.6) · 과일" : "카레라이스(2.5.6) · 김치 · 우유(2)"};
      }
      if (mode === "weather-error") return {state:"error",text:"날씨 연결 오류 · 다시 시도해요."};
      const probability = mode === "null" ? null : mode === "zero" ? 0 : pickedDate === "2026-10-05" ? 60 : 59;
      return {state:"ok",probability:probability,text:"15–24°C · 하루 중 최대 강수확률 " + (probability === null ? "확인 불가" : probability + "%")};
    }
    lookup.addEventListener("click", function () {
      if (busy) return;
      const pickedDate = date.value, mode = scenario.value, token = ++sequence, result = {date:pickedDate};
      snapshot = null; busy = true; blankAnswer();
      ["meal", "weather"].forEach(function (source) {
        const key = source + ":" + pickedDate, saved = cache.get(key);
        if (saved && now - saved.fetched < 5) { hits += 1; result[source] = Object.assign({}, saved, {cached:true}); }
        else {
          requests += 1;
          const record = Object.assign(getRecord(source, pickedDate, mode), {fetched:now,cached:false});
          if (record.state !== "error") cache.set(key, record);
          result[source] = record;
        }
      });
      render("두 출처의 응답을 기다려요. 실제 호출은 하지 않는 모형입니다.");
      timer = setTimeout(function () {
        if (token !== sequence) return;
        snapshot = result; busy = false;
        render("같은 날짜로 다시 조회해 요청 수와 가져온 시각을 비교해요.");
      }, 300);
    });
    date.addEventListener("change", function () { snapshot = null; blankAnswer(); render("날짜가 바뀌어 이전 카드와 답변을 지웠어요. 정보 조회를 눌러요."); });
    scenario.addEventListener("change", function () { cache.clear(); snapshot = null; blankAnswer(); render("새 상황을 시험하도록 체험 캐시를 비웠어요. 정보 조회를 눌러요."); });
    advance.addEventListener("click", function () { if (busy) return; now += 5; snapshot = null; blankAnswer(); render("5분이 지나 캐시가 만료됐어요. 조회하면 외부 요청이 늘어요. 실제 캐시는 더 일찍 사라질 수도 있어요."); });
    question.addEventListener("change", blankAnswer);
    ask.addEventListener("click", function () {
      if (busy || !snapshot) return;
      let text;
      if (question.value === "unknown") text = "시험 범위는 참고 자료에 없어 답할 수 없어요.";
      else if (question.value === "meal") text = snapshot.meal.text;
      else {
        const weather = snapshot.weather;
        text = weather.state === "error" || weather.probability === null ? "날씨 값을 확인하지 못해 우산 여부를 판단할 수 없어요." : weather.probability >= 60 ? "최대 강수확률 " + weather.probability + "% · 우산을 챙겨보세요. (60% 이상이라는 연습 규칙)" : "최대 강수확률 " + weather.probability + "% · 예보를 한 번 더 확인해보세요. 비가 안 온다는 보장은 아니에요.";
      }
      answer.textContent = "규칙 답변 · AI 아님 | " + snapshot.date + " 가상 자료: " + text;
    });
    reset.addEventListener("click", function () {
      clearTimeout(timer); sequence += 1; cache.clear(); now = requests = hits = 0; snapshot = null; busy = false;
      date.value = "2026-10-05"; scenario.value = "normal"; question.value = "meal"; blankAnswer(); render("처음으로 돌아왔어요. 정보 조회부터 시작해요.");
    });
    panel.append(caption, controls, metrics, cards, questions, answer, status); render("조회 → 다시 조회 → 5분 지나기 순서로 요청 수를 비교해요."); host.replaceChildren(panel);
  };
  window.WIDGETS["lesson-checks"] = function (host) {
    const inputs = Array.from(host.querySelectorAll("input[data-check]"));
    const summary = host.querySelector(".check-summary");
    inputs.forEach(function (input) {
      input.checked = readStorage(storageKey("check:" + input.dataset.check)) === "true";
      input.addEventListener("change", function () {
        const saved = writeStorage(storageKey("check:" + input.dataset.check), String(input.checked));
        update(saved);
      });
    });
    function update(saved) {
      const count = inputs.filter(function (input) { return input.checked; }).length;
      summary.textContent = count + " / " + inputs.length + " 확인" + (count === inputs.length ? " · 모두 확인했어요!" : " · 직접 해본 항목을 체크하세요.");
      if (saved === false) summary.textContent += " 이 브라우저에서는 체크가 저장되지 않아요.";
    }
    update();
  };
  window.WIDGETS["lesson-reflection"] = function (host) {
    const fields = host.querySelectorAll("textarea[data-note]");
    const status = host.querySelector(".note-storage");
    fields.forEach(function (field) {
      field.value = readStorage(storageKey("note:" + field.dataset.note)) || "";
      field.addEventListener("input", function () {
        const saved = writeStorage(storageKey("note:" + field.dataset.note), field.value);
        status.textContent = saved ? "이 브라우저에 저장했어요. 다른 기기에서도 보려면 Docs에 옮겨두세요." : "이 브라우저에서는 저장되지 않아요. Docs에 복사해 보관하세요.";
      });
    });
    status.textContent = "기록은 이 브라우저에만 보관돼요. 작품과 함께 Docs에도 옮겨두세요.";
  };
  const mounted = new WeakSet();
  function mountWidgets(root = document) {
    const elements = Array.from(root.querySelectorAll("[data-widget]"));
    if (root instanceof Element && root.matches("[data-widget]")) elements.unshift(root);
    elements.forEach(function (host) {
      if (mounted.has(host) || host.closest("[hidden]")) return;
      const factory = Object.prototype.hasOwnProperty.call(window.WIDGETS, host.dataset.widget) ? window.WIDGETS[host.dataset.widget] : undefined;
      if (typeof factory !== "function") return;
      const fallback = Array.from(host.childNodes);
      try {
        factory(host, window.SITE || {});
        mounted.add(host);
        host.dataset.widgetReady = "true";
      } catch (_) {
        host.replaceChildren.apply(host, fallback);
        host.dataset.widgetReady = "false";
      }
    });
  }
  function init() {
    mountWidgets();
    // 명시적인 index.html 경로로 file://에서도 목록 왕복이 가능합니다.
    const back = document.querySelector(".back-to-hub");
    if (back) back.setAttribute("href", "../index.html");
    document.querySelectorAll("pre.prompt-block").forEach(function (pre) {
      const button = pre.closest(".code-block") && pre.closest(".code-block").querySelector(".copy-button");
      if (button) button.setAttribute("aria-label", pre.dataset.label + " 프롬프트 복사");
    });
    const hub = document.querySelector("[data-hub]");
    if (hub) {
      hub.querySelectorAll("a.level-card").forEach(function (card) {
        const href = card.getAttribute("href");
        if (href && href.endsWith("/")) card.setAttribute("href", href + "index.html");
      });
      const count = window.SITE && Array.isArray(window.SITE.levels) ? window.SITE.levels.length : 0;
      const note = node("p", "hub-series-note", (count ? count + "개 프로젝트 · " : "") + "1회에서 게임 만들기부터 기록 저장과 공유까지 이어갑니다.");
      const cards = hub.querySelector("[data-level-cards]");
      if (cards) cards.before(note);
    }
  }
  window.mountWidgets = mountWidgets;
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
