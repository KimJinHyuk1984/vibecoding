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
      const note = node("p", "hub-series-note", "13회 · 총 26시간 · 처음이라도 괜찮아요. 1회 소개부터 시작하세요.");
      const cards = hub.querySelector("[data-level-cards]");
      if (cards) cards.before(note);
    }
  }
  window.mountWidgets = mountWidgets;
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
