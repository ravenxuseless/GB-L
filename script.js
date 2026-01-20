const quiz = {
  personName: "Leonie",
  maxSelectionsPerQuestion: 2,
  minSelectionsPerQuestion: 1,
  questions: [
    {
      id: "breakfast",
      time: "11:00 – 12:00",
      title: "Frühstück",
      prompt: "Worauf hast du heute Lust zum Frühstück?",
      options: [
        "Eier-Toast",
        "Rührei",
        "Müsli",
        "Pancakes",
      ],
    },
    {
      id: "morning",
      time: "12:00 – 13:00",
      title: "Vormittag",
      prompt: "Wie starten wir entspannt in den Tag?",
      options: [
        "Im Bett chillen und ein bisschen TikTok",
        "Eine Serie anwerfen",
        "Eine kleine Sport-Runde (für unsere faulen Popos)",
      ],
    },
    {
      id: "daytime",
      time: "13:00 – 16:00",
      title: "Zeit zu zweit",
      prompt: "Wo/was fühlt sich nach einer richtig guten Zeit an?",
      options: [
        "Schlittschuhlaufen",
        "Bowling",
        "Kino",
        "Zuhause bleiben und zusammen groß kochen oder backen",
        "Schwimmbad + Sauna",
      ],
    },
    {
      id: "cooldown",
      time: "16:00 – 18:00",
      title: "Runterkommen",
      prompt: "Was passt am besten zum Runterkommen?",
      options: [
        "Kleiner Snack und wir schauen eine Serie",
        "Zusammen zeichnen",
        "Zusammen Logos bauen und alle 20 Minuten Laptops tauschen",
        "Zusammen etwas spielen (z.B. Mensch ärgere dich nicht)",
      ],
    },
    {
      id: "evening",
      time: "18:00 – 20:00",
      title: "Abendstart",
      prompt: "Wie leiten wir den Abend ein?",
      options: [
        "Kleine Massage und ein heißes Bad zusammen",
        "Zusammen Abendessen kochen",
        "Wir machen unser eigenes Ding",
        "Ich mixe uns Cocktails",
      ],
    },
    {
      id: "late",
      time: "20:00 – 24:00",
      title: "Später Abend",
      prompt: "Wie lassen wir den Tag ausklingen?",
      options: [
        "Ins Bett kuscheln und eine Serie schauen",
        "Karaoke + was trinken",
        "Spontan irgendwas machen und viel kuscheln",
        "Bei Laternenlicht coole Insta-Bilder",
      ],
    },
  ],
};

const state = {
  route: "home",
  step: -1,
  selectionsByQuestionId: new Map(),
  ttt: {
    board: Array(9).fill(null),
    turn: "X",
    winner: null,
  },
  tetris: {
    running: false,
    paused: false,
    score: 0,
    lines: 0,
    level: 1,
    dropMs: 800,
    lastDrop: 0,
    gridW: 10,
    gridH: 20,
    grid: [],
    piece: null,
    nextPiece: null,
  },
  jump: {
    level: 1,
    maxLevel: 100,
    running: false,
    won: false,
    dead: false,
    t: 0,
    seed: 1,
    world: null,
    player: null,
    input: { left: false, right: false, jump: false, jumpQueued: false },
    camX: 0,
  },
};

const els = {
  metaTitle: document.getElementById("metaTitle"),
  metaSub: document.getElementById("metaSub"),
  progressBar: document.getElementById("progressBar"),
  content: document.getElementById("content"),
  backBtn: document.getElementById("backBtn"),
  nextBtn: document.getElementById("nextBtn"),
};

function initBackgroundParticles() {
  const canvas = document.getElementById("bgParticles");
  if (!canvas) return;

  const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return;

  let dpr = 1;
  let w = 0;
  let h = 0;

  const particles = [];
  const colorStops = [
    { r: 86, g: 245, b: 176, a: 0.55 },
    { r: 184, g: 255, b: 218, a: 0.40 },
    { r: 122, g: 184, b: 255, a: 0.45 },
    { r: 199, g: 225, b: 255, a: 0.40 },
  ];

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function resize() {
    dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    w = Math.floor(window.innerWidth);
    h = Math.floor(window.innerHeight);
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const targetCount = Math.floor(Math.min(120, Math.max(45, (w * h) / 22000)));
    while (particles.length < targetCount) particles.push(makeParticle(true));
    while (particles.length > targetCount) particles.pop();
  }

  function makeParticle(randomY = false) {
    const c = colorStops[Math.floor(Math.random() * colorStops.length)];
    const baseSize = rand(4.5, 10.0);
    const glow = rand(12, 34);
    const speed = rand(0.05, 0.22);
    const drift = rand(-0.06, 0.06);
    return {
      x: rand(0, w || 1),
      y: randomY ? rand(0, h || 1) : rand(-80, -10),
      r: baseSize,
      glow,
      vx: drift,
      vy: speed,
      tw: rand(0.002, 0.007),
      t: rand(0, Math.PI * 2),
      rot: rand(0, Math.PI * 2),
      vr: rand(-0.006, 0.006),
      c,
    };
  }

  function heartPath(size) {
    const s = size;
    const topCurveHeight = s * 0.3;
    const bottomPoint = s * 0.95;

    const path = new Path2D();
    path.moveTo(0, topCurveHeight);
    path.bezierCurveTo(0, 0, -s * 0.55, 0, -s * 0.55, topCurveHeight);
    path.bezierCurveTo(-s * 0.55, s * 0.62, 0, s * 0.74, 0, bottomPoint);
    path.bezierCurveTo(0, s * 0.74, s * 0.55, s * 0.62, s * 0.55, topCurveHeight);
    path.bezierCurveTo(s * 0.55, 0, 0, 0, 0, topCurveHeight);
    path.closePath();
    return path;
  }

  function drawParticle(p) {
    p.t += p.tw;
    p.rot += p.vr;
    const pulse = 0.65 + 0.35 * Math.sin(p.t);
    const alpha = p.c.a * pulse;

    const gx = p.x;
    const gy = p.y;
    const gr = p.glow;

    const grad = ctx.createRadialGradient(gx, gy, 0, gx, gy, gr);
    grad.addColorStop(0, `rgba(${p.c.r}, ${p.c.g}, ${p.c.b}, ${alpha})`);
    grad.addColorStop(0.35, `rgba(${p.c.r}, ${p.c.g}, ${p.c.b}, ${alpha * 0.35})`);
    grad.addColorStop(1, `rgba(${p.c.r}, ${p.c.g}, ${p.c.b}, 0)`);

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(gx, gy, gr, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    const heartAlpha = Math.min(0.9, alpha + 0.18);
    ctx.fillStyle = `rgba(${p.c.r}, ${p.c.g}, ${p.c.b}, ${heartAlpha})`;
    ctx.fill(heartPath(p.r));
    ctx.restore();
  }

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(32, now - last);
    last = now;

    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = "lighter";

    for (const p of particles) {
      p.x += p.vx * (dt * 0.06);
      p.y += p.vy * (dt * 0.06);

      if (p.x < -40) p.x = w + 40;
      if (p.x > w + 40) p.x = -40;
      if (p.y > h + 60) {
        const np = makeParticle(false);
        p.x = np.x;
        p.y = np.y;
        p.r = np.r;
        p.glow = np.glow;
        p.vx = np.vx;
        p.vy = np.vy;
        p.tw = np.tw;
        p.t = np.t;
        p.c = np.c;
      }

      drawParticle(p);
    }

    ctx.globalCompositeOperation = "source-over";
    requestAnimationFrame(frame);
  }

  window.addEventListener("resize", resize);
  resize();
  requestAnimationFrame(frame);
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function totalSteps() {
  return quiz.questions.length + 2;
}

function currentStepLabel() {
  if (state.step < 0) return "";
  if (state.step >= quiz.questions.length) return "";
  return `Frage ${state.step + 1}/${quiz.questions.length}`;
}

function setProgress() {
  const max = totalSteps() - 1;
  const idx = state.step + 1;
  const pct = clamp((idx / max) * 100, 0, 100);
  els.progressBar.style.width = `${pct}%`;
}

function getSelections(questionId) {
  return state.selectionsByQuestionId.get(questionId) ?? [];
}

function setSelections(questionId, selections) {
  state.selectionsByQuestionId.set(questionId, selections);
}

function renderStart() {
  els.metaTitle.textContent = "Tages-Quiz";
  els.metaSub.textContent = "";
  els.backBtn.disabled = true;
  els.nextBtn.textContent = "Los geht's";
  els.nextBtn.style.display = "";
  els.backBtn.style.display = "";

  els.content.innerHTML = `
    <h1 class="h1">Hey ${quiz.personName}.</h1>
    <p class="p">Du stellst dir deinen Tag zusammen. Pro Abschnitt kannst du 1–2 Dinge auswählen.</p>
    <p class="p" style="margin-top:10px">Am Ende bekommst du den fertigen Ablauf mit Uhrzeiten.</p>
  `;
}

function renderHome() {
  els.metaTitle.textContent = "Start";
  els.metaSub.textContent = "";
  els.backBtn.disabled = true;
  els.nextBtn.disabled = true;
  els.backBtn.style.display = "none";
  els.nextBtn.style.display = "none";

  els.content.innerHTML = `
    <h1 class="h1">Hey ${quiz.personName}.</h1>
    <p class="p">Was möchtest du machen?</p>
    <div class="grid" style="margin-top: 16px">
      <div class="choice choice--primary" id="goBirthday" role="button" tabindex="0">
        <div class="choice__title">Ich habe Geburtstag yayyyy</div>
        <div class="choice__sub">Tag zusammenstellen</div>
      </div>
      <div class="choice" id="goGames" role="button" tabindex="0">
        <div class="choice__title">Ich wil Spieli machi</div>
        <div class="choice__sub">Mini-Spiele</div>
      </div>
    </div>
  `;

  const goBirthday = document.getElementById("goBirthday");
  const goGames = document.getElementById("goGames");

  const bind = (el, fn) => {
    if (!el) return;
    el.addEventListener("click", fn);
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        fn();
      }
    });
  };

  bind(goBirthday, () => {
    state.route = "quiz";
    state.step = -1;
    render();
  });

  bind(goGames, () => {
    state.route = "games";
    render();
  });
}

function renderGames() {
  els.metaTitle.textContent = "Spiele";
  els.metaSub.textContent = "";
  els.backBtn.disabled = false;
  els.backBtn.style.display = "";
  els.nextBtn.style.display = "none";

  els.content.innerHTML = `
    <h1 class="h1">Spieli machi</h1>
    <p class="p">Wähle ein Spiel aus.</p>
    <div class="grid" style="margin-top: 16px">
      <div class="choice choice--primary" id="goTTT" role="button" tabindex="0">
        <div class="choice__title">TicTacToe</div>
        <div class="choice__sub">2 Spieler auf einem Gerät</div>
      </div>
      <div class="choice" id="goTetris" role="button" tabindex="0">
        <div class="choice__title">Tetris</div>
        <div class="choice__sub">Punkte sammeln</div>
      </div>
      <div class="choice" id="goDraw" role="button" tabindex="0">
        <div class="choice__title">Zeichnen</div>
        <div class="choice__sub">Malen mit Finger oder Maus</div>
      </div>
      <div class="choice" id="goJump" role="button" tabindex="0">
        <div class="choice__title">Pixel Jump</div>
        <div class="choice__sub">Hüpfen, ausweichen, 100 Level</div>
      </div>
    </div>
  `;

  const goTTT = document.getElementById("goTTT");
  const goTetris = document.getElementById("goTetris");
  const goDraw = document.getElementById("goDraw");
  const goJump = document.getElementById("goJump");

  const bind = (el, fn) => {
    if (!el) return;
    el.addEventListener("click", fn);
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        fn();
      }
    });
  };

  bind(goTTT, () => {
    resetTicTacToe();
    state.route = "game_ttt";
    render();
  });

  bind(goTetris, () => {
    state.route = "game_tetris";
    render();
  });

  bind(goDraw, () => {
    state.route = "game_draw";
    render();
  });

  bind(goJump, () => {
    state.route = "game_jump";
    if (!state.jump.running && !state.jump.world) initJumpRun(true);
    render();
  });
}

function resetTicTacToe() {
  state.ttt.board = Array(9).fill(null);
  state.ttt.turn = "X";
  state.ttt.winner = null;
}

function tttWinner(board) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  if (board.every(Boolean)) return "draw";
  return null;
}

function renderTicTacToe() {
  els.metaTitle.textContent = "TicTacToe";
  els.metaSub.textContent = "2 Spieler";
  els.backBtn.disabled = false;
  els.backBtn.style.display = "";
  els.nextBtn.style.display = "none";

  const b = state.ttt.board;
  const w = state.ttt.winner;
  const turn = state.ttt.turn;

  let status = `Am Zug: ${turn}`;
  if (w === "X" || w === "O") status = `Gewonnen: ${w}`;
  if (w === "draw") status = "Unentschieden";

  const cells = b
    .map((v, idx) => {
      const label = v ? escapeHtml(v) : "";
      return `<button class="tttCell" data-idx="${idx}" type="button" ${w ? "disabled" : ""}>${label}</button>`;
    })
    .join("");

  els.content.innerHTML = `
    <h1 class="h1">TicTacToe</h1>
    <p class="p">${escapeHtml(status)}</p>
    <div class="small">Mini-Tutorial: Tippe ein Feld an. Ihr spielt abwechselnd X und O.</div>
    <div class="tttBoard" id="tttBoard">${cells}</div>
    <div class="actions">
      <button class="btn" id="tttReset" type="button">Neu starten</button>
      <button class="btn btn--ghost" id="tttBack" type="button">Zurück zu Spielen</button>
    </div>
  `;

  const boardEl = document.getElementById("tttBoard");
  const resetBtn = document.getElementById("tttReset");
  const backBtn = document.getElementById("tttBack");

  if (boardEl) {
    boardEl.querySelectorAll(".tttCell").forEach((el) => {
      el.addEventListener("click", () => {
        const idx = Number(el.getAttribute("data-idx"));
        if (state.ttt.winner) return;
        if (state.ttt.board[idx]) return;
        state.ttt.board[idx] = state.ttt.turn;
        const win = tttWinner(state.ttt.board);
        state.ttt.winner = win;
        if (!win) state.ttt.turn = state.ttt.turn === "X" ? "O" : "X";
        render();
      });
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      resetTicTacToe();
      render();
    });
  }

  if (backBtn) {
    backBtn.addEventListener("click", () => {
      state.route = "games";
      render();
    });
  }
}

function initTetrisState() {
  const t = state.tetris;
  t.grid = Array.from({ length: t.gridH }, () => Array(t.gridW).fill(null));
  t.score = 0;
  t.lines = 0;
  t.level = 1;
  t.dropMs = 820;
  t.lastDrop = 0;
  t.running = true;
  t.paused = false;
  t.piece = null;
  t.nextPiece = null;
}

function tetrisPieces() {
  const C = {
    I: "#7ab8ff",
    O: "#b8ffda",
    T: "#56f5b0",
    S: "#7ab8ff",
    Z: "#56f5b0",
    J: "#c7e1ff",
    L: "#b8ffda",
  };
  return {
    I: { color: C.I, m: [[1, 1, 1, 1]] },
    O: { color: C.O, m: [[1, 1], [1, 1]] },
    T: { color: C.T, m: [[0, 1, 0], [1, 1, 1]] },
    S: { color: C.S, m: [[0, 1, 1], [1, 1, 0]] },
    Z: { color: C.Z, m: [[1, 1, 0], [0, 1, 1]] },
    J: { color: C.J, m: [[1, 0, 0], [1, 1, 1]] },
    L: { color: C.L, m: [[0, 0, 1], [1, 1, 1]] },
  };
}

function randPiece() {
  const keys = Object.keys(tetrisPieces());
  const k = keys[Math.floor(Math.random() * keys.length)];
  const p = tetrisPieces()[k];
  return { key: k, color: p.color, m: p.m.map((row) => row.slice()), x: 0, y: 0 };
}

function rotateMatrix(m) {
  const h = m.length;
  const w = m[0].length;
  const out = Array.from({ length: w }, () => Array(h).fill(0));
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) out[x][h - 1 - y] = m[y][x];
  }
  return out;
}

function collides(grid, piece, nx, ny, nm) {
  const m = nm || piece.m;
  for (let y = 0; y < m.length; y++) {
    for (let x = 0; x < m[y].length; x++) {
      if (!m[y][x]) continue;
      const gx = nx + x;
      const gy = ny + y;
      if (gx < 0 || gx >= grid[0].length || gy >= grid.length) return true;
      if (gy >= 0 && grid[gy][gx]) return true;
    }
  }
  return false;
}

function mergePiece(t, grid, piece) {
  for (let y = 0; y < piece.m.length; y++) {
    for (let x = 0; x < piece.m[y].length; x++) {
      if (!piece.m[y][x]) continue;
      const gx = piece.x + x;
      const gy = piece.y + y;
      if (gy >= 0) grid[gy][gx] = piece.color;
    }
  }
  const cleared = clearLines(grid);
  if (cleared > 0) {
    t.lines += cleared;
    const points = [0, 100, 300, 500, 800][cleared] || (cleared * 200);
    t.score += points * t.level;
    // Level up every 2 cleared lines
    t.level = 1 + Math.floor(t.lines / 2);
    // Fall speed increases slightly with each level
    t.dropMs = Math.max(90, 820 - (t.level - 1) * 55);
  }
}

function clearLines(grid) {
  let cleared = 0;
  for (let y = grid.length - 1; y >= 0; y--) {
    if (grid[y].every(Boolean)) {
      grid.splice(y, 1);
      grid.unshift(Array(grid[0].length).fill(null));
      cleared++;
      y++;
    }
  }
  return cleared;
}

function spawnPiece() {
  const t = state.tetris;
  if (!t.nextPiece) t.nextPiece = randPiece();
  t.piece = t.nextPiece;
  t.nextPiece = randPiece();
  t.piece.x = Math.floor((t.gridW - t.piece.m[0].length) / 2);
  // Normal Tetris: spawn slightly above the visible grid.
  t.piece.y = -2;
  // If it already collides at the visible top row -> game over.
  if (collides(t.grid, t.piece, t.piece.x, 0)) {
    t.running = false;
    t.paused = false;
  }
}

function tetrisMove(dx) {
  const t = state.tetris;
  if (!t.running || t.paused) return;
  const p = t.piece;
  if (!p) return;
  const nx = p.x + dx;
  if (!collides(t.grid, p, nx, p.y)) p.x = nx;
}

function tetrisRotate() {
  const t = state.tetris;
  if (!t.running || t.paused) return;
  const p = t.piece;
  if (!p) return;
  const nm = rotateMatrix(p.m);
  const kicks = [0, -1, 1, -2, 2];
  for (const k of kicks) {
    if (!collides(t.grid, p, p.x + k, p.y, nm)) {
      p.x += k;
      p.m = nm;
      return;
    }
  }
}

function tetrisDrop(soft) {
  const t = state.tetris;
  if (!t.running || t.paused) return;
  const p = t.piece;
  if (!p) return;
  const ny = p.y + 1;
  if (!collides(t.grid, p, p.x, ny)) {
    p.y = ny;
    if (soft) t.score += 1;
  } else {
    // Game over if the piece locks with any block above the visible area.
    const locksAboveTop = p.m.some((row, yy) => row.some((v) => v && (p.y + yy) < 0));
    if (locksAboveTop) {
      t.running = false;
      return;
    }
    mergePiece(t, t.grid, p);
    spawnPiece();
  }
}

function tetrisHardDrop() {
  const t = state.tetris;
  if (!t.running || t.paused) return;
  const p = t.piece;
  if (!p) return;
  let dropped = 0;
  while (!collides(t.grid, p, p.x, p.y + 1)) {
    p.y += 1;
    dropped++;
  }
  t.score += dropped * 2;
  const locksAboveTop = p.m.some((row, yy) => row.some((v) => v && (p.y + yy) < 0));
  if (locksAboveTop) {
    t.running = false;
    return;
  }
  mergePiece(t, t.grid, p);
  spawnPiece();
}

function renderTetris() {
  els.metaTitle.textContent = "Tetris";
  els.metaSub.textContent = "";
  els.backBtn.disabled = false;
  els.backBtn.style.display = "";
  els.nextBtn.style.display = "none";

  const t = state.tetris;
  if (!t.grid.length) initTetrisState();
  if (!t.piece && t.running) spawnPiece();

  els.content.innerHTML = `
    <h1 class="h1">Tetris</h1>
    <p class="p" id="tetrisHud">Score: ${t.score} · Lines: ${t.lines} · Level: ${t.level}${t.paused ? " · Pause" : ""}${!t.running ? " · Game Over" : ""}</p>
    <div class="small">Mini-Tutorial: PC: Pfeile bewegen/rotieren, Space = Drop, P = Pause. Handy: Buttons unten.</div>
    <div class="tetrisWrap">
      <canvas id="tetrisCanvas" class="tetrisCanvas" aria-hidden="true"></canvas>
      <div class="tetrisSide">
        <div class="small">Nächster Stein</div>
        <canvas id="tetrisNext" class="tetrisNext" aria-hidden="true"></canvas>
        <div class="actions">
          <button class="btn" id="tetrisStart" type="button">${t.running ? "Neu" : "Start"}</button>
          <button class="btn btn--ghost" id="tetrisPause" type="button">${t.paused ? "Weiter" : "Pause"}</button>
          <button class="btn btn--ghost" id="tetrisBack" type="button">Zurück</button>
        </div>
      </div>
    </div>
    <div class="tetrisControls" id="tetrisControls">
      <button class="btn btn--ghost" data-act="left" type="button">◀</button>
      <button class="btn btn--ghost" data-act="right" type="button">▶</button>
      <button class="btn btn--ghost" data-act="rotate" type="button">⟳</button>
      <button class="btn btn--ghost" data-act="down" type="button">▼</button>
      <button class="btn" data-act="drop" type="button">Drop</button>
    </div>
    <div class="small">Tipp: Pfeiltasten/Space am PC. Am Handy die Buttons nutzen.</div>
  `;

  const c = document.getElementById("tetrisCanvas");
  const n = document.getElementById("tetrisNext");
  const startBtn = document.getElementById("tetrisStart");
  const pauseBtn = document.getElementById("tetrisPause");
  const backBtn = document.getElementById("tetrisBack");
  const controls = document.getElementById("tetrisControls");

  if (startBtn) {
    startBtn.addEventListener("click", () => {
      initTetrisState();
      spawnPiece();
      render();
    });
  }
  if (pauseBtn) {
    pauseBtn.addEventListener("click", () => {
      t.paused = !t.paused;
      render();
    });
  }
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      t.paused = true;
      state.route = "games";
      render();
    });
  }

  if (controls) {
    controls.querySelectorAll("[data-act]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const act = btn.getAttribute("data-act");
        if (act === "left") tetrisMove(-1);
        if (act === "right") tetrisMove(1);
        if (act === "rotate") tetrisRotate();
        if (act === "down") tetrisDrop(true);
        if (act === "drop") tetrisHardDrop();
        drawTetris(c, n);
        updateTetrisHud();
      });
    });
  }

  attachTetrisKeyboard();
  drawTetris(c, n);
  updateTetrisHud();
  startTetrisLoop();
}

function renderDraw() {
  els.metaTitle.textContent = "Zeichnen";
  els.metaSub.textContent = "";
  els.backBtn.disabled = false;
  els.backBtn.style.display = "";
  els.nextBtn.style.display = "none";

  els.content.innerHTML = `
    <h1 class="h1">Zeichnen</h1>
    <p class="p">Mal was schönes für Leonie.</p>
    <div class="small">Mini-Tutorial: Maus/Finger gedrückt halten und ziehen. Mit "Leeren" neu anfangen. Mit "Download" speichern.</div>
    <div class="drawWrap">
      <canvas id="drawCanvas" class="drawCanvas" aria-hidden="true"></canvas>
      <div class="drawTools">
        <button class="btn" id="drawDownload" type="button">Download</button>
        <button class="btn btn--ghost" id="drawClear" type="button">Leeren</button>
        <button class="btn btn--ghost" id="drawBack" type="button">Zurück</button>
      </div>
    </div>
  `;

  const canvas = document.getElementById("drawCanvas");
  const clearBtn = document.getElementById("drawClear");
  const downBtn = document.getElementById("drawDownload");
  const backBtn = document.getElementById("drawBack");

  initDrawCanvas(canvas);

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      clearDrawCanvas(canvas);
    });
  }

  if (downBtn) {
    downBtn.addEventListener("click", async () => {
      if (!canvas) return;
      await downloadCanvasAsPng(canvas, `Zeichnung_${new Date().toISOString().slice(0, 10)}.png`);
    });
  }

  if (backBtn) {
    backBtn.addEventListener("click", () => {
      state.route = "games";
      render();
    });
  }
}

function initDrawCanvas(canvas) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  const cssW = Math.min(820, Math.max(280, window.innerWidth - 80));
  const cssH = Math.round(cssW * 0.62);
  canvas.width = Math.floor(cssW * dpr);
  canvas.height = Math.floor(cssH * dpr);
  canvas.style.width = `${cssW}px`;
  canvas.style.height = `${cssH}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // background
  const bg = ctx.createLinearGradient(0, 0, cssW, cssH);
  bg.addColorStop(0, "rgba(4,7,15,0.85)");
  bg.addColorStop(1, "rgba(4,7,15,0.55)");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, cssW, cssH);

  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  let drawing = false;
  let last = null;

  function posFromEvent(e) {
    const rect = canvas.getBoundingClientRect();
    const p = e.touches && e.touches[0] ? e.touches[0] : e;
    return { x: (p.clientX - rect.left), y: (p.clientY - rect.top) };
  }

  function start(e) {
    drawing = true;
    last = posFromEvent(e);
  }

  function move(e) {
    if (!drawing) return;
    e.preventDefault();
    const cur = posFromEvent(e);
    const dx = cur.x - last.x;
    const dy = cur.y - last.y;
    const speed = Math.min(1, Math.sqrt(dx * dx + dy * dy) / 24);
    const w = 3.5 + speed * 5.0;
    ctx.lineWidth = w;
    const g = ctx.createLinearGradient(last.x, last.y, cur.x, cur.y);
    g.addColorStop(0, "rgba(122,184,255,0.85)");
    g.addColorStop(1, "rgba(86,245,176,0.80)");
    ctx.strokeStyle = g;
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(cur.x, cur.y);
    ctx.stroke();
    last = cur;
  }

  function end() {
    drawing = false;
    last = null;
  }

  canvas.onpointerdown = (e) => start(e);
  canvas.onpointermove = (e) => move(e);
  canvas.onpointerup = () => end();
  canvas.onpointercancel = () => end();

  canvas.addEventListener("touchstart", (e) => start(e), { passive: true });
  canvas.addEventListener("touchmove", (e) => move(e), { passive: false });
  canvas.addEventListener("touchend", () => end());
}

function clearDrawCanvas(canvas) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const rect = canvas.getBoundingClientRect();
  const w = rect.width;
  const h = rect.height;
  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, "rgba(4,7,15,0.85)");
  bg.addColorStop(1, "rgba(4,7,15,0.55)");
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
}

let jumpLoopHandle = null;
let jumpKeyboardAttached = false;

function initJumpRun(resetLevel = false) {
  const j = state.jump;
  if (resetLevel) j.level = 1;
  j.running = true;
  j.won = false;
  j.dead = false;
  j.t = 0;
  j.seed = (j.level * 9973) ^ 0x5a5a;
  j.input.left = false;
  j.input.right = false;
  j.input.jump = false;
  j.input.jumpQueued = false;
  j.world = generateJumpLevel(j.level, j.seed);
  j.player = {
    x: j.world.startX,
    y: j.world.startY,
    w: j.world.tile * 0.7,
    h: j.world.tile * 0.9,
    vx: 0,
    vy: 0,
    onGround: false,
  };
  j.camX = 0;
}

function renderJumpRun() {
  els.metaTitle.textContent = "Pixel Jump";
  els.metaSub.textContent = "";
  els.backBtn.disabled = false;
  els.backBtn.style.display = "";
  els.nextBtn.style.display = "none";

  const j = state.jump;
  if (!j.world) initJumpRun(true);

  const status = j.dead ? "Game Over" : j.won ? "Level geschafft!" : "";
  const nextLabel = j.won ? (j.level >= j.maxLevel ? "Fertig" : "Nächstes Level") : "Restart";

  els.content.innerHTML = `
    <h1 class="h1">Pixel Jump</h1>
    <p class="p" id="jumpHud">Level: ${j.level}/${j.maxLevel}${status ? " · " + status : ""}</p>
    <div class="small">Mini-Tutorial: PC: A/D oder ◀/▶ laufen, Space/▲ springen. Handy: Buttons unten. Ziel: zur Flagge kommen. Spikes = tot.</div>
    <div class="jumpWrap">
      <canvas id="jumpCanvas" class="jumpCanvas" aria-hidden="true"></canvas>
      <div class="jumpTools">
        <button class="btn" id="jumpAction" type="button">${nextLabel}</button>
        <button class="btn btn--ghost" id="jumpBack" type="button">Zurück</button>
      </div>
      <div class="jumpControls" id="jumpControls">
        <button class="btn btn--ghost" data-act="left" type="button">◀</button>
        <button class="btn btn--ghost" data-act="right" type="button">▶</button>
        <button class="btn" data-act="jump" type="button">▲</button>
      </div>
    </div>
  `;

  const canvas = document.getElementById("jumpCanvas");
  const actionBtn = document.getElementById("jumpAction");
  const backBtn = document.getElementById("jumpBack");
  const controls = document.getElementById("jumpControls");

  if (actionBtn) {
    actionBtn.addEventListener("click", () => {
      const jj = state.jump;
      if (jj.won) {
        if (jj.level < jj.maxLevel) {
          jj.level += 1;
          initJumpRun(false);
        }
      } else {
        initJumpRun(false);
      }
      render();
    });
  }

  if (backBtn) {
    backBtn.addEventListener("click", () => {
      state.route = "games";
      render();
    });
  }

  if (controls) {
    const press = (act, down) => {
      const jj = state.jump;
      if (act === "left") jj.input.left = down;
      if (act === "right") jj.input.right = down;
      if (act === "jump") {
        jj.input.jump = down;
        if (down) jj.input.jumpQueued = true;
      }
    };

    controls.querySelectorAll("[data-act]").forEach((btn) => {
      const act = btn.getAttribute("data-act");
      btn.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        press(act, true);
      });
      btn.addEventListener("pointerup", (e) => {
        e.preventDefault();
        press(act, false);
      });
      btn.addEventListener("pointercancel", (e) => {
        e.preventDefault();
        press(act, false);
      });
      btn.addEventListener("pointerleave", (e) => {
        e.preventDefault();
        press(act, false);
      });
    });
  }

  attachJumpKeyboard();
  resizeJumpCanvas(canvas);
  drawJump(canvas);
  startJumpLoop();
}

function updateJumpHud() {
  if (state.route !== "game_jump") return;
  const j = state.jump;
  const el = document.getElementById("jumpHud");
  if (!el) return;
  const status = j.dead ? "Game Over" : j.won ? "Level geschafft!" : "";
  el.textContent = `Level: ${j.level}/${j.maxLevel}${status ? " · " + status : ""}`;
  const btn = document.getElementById("jumpAction");
  if (btn) btn.textContent = j.won ? (j.level >= j.maxLevel ? "Fertig" : "Nächstes Level") : "Restart";
}

function resizeJumpCanvas(canvas) {
  if (!canvas) return;
  const j = state.jump;
  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  const cssW = Math.min(900, Math.max(280, window.innerWidth - 80));
  const cssH = Math.round(cssW * 0.55);
  canvas.width = Math.floor(cssW * dpr);
  canvas.height = Math.floor(cssH * dpr);
  canvas.style.width = `${cssW}px`;
  canvas.style.height = `${cssH}px`;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  j.viewW = cssW;
  j.viewH = cssH;
}

function startJumpLoop() {
  if (jumpLoopHandle) return;
  let last = performance.now();
  const loop = (ts) => {
    if (state.route !== "game_jump") {
      jumpLoopHandle = null;
      return;
    }
    const dt = Math.min(32, ts - last);
    last = ts;
    if (state.jump.running && !state.jump.won && !state.jump.dead) {
      stepJump(dt / 1000);
    }
    const canvas = document.getElementById("jumpCanvas");
    drawJump(canvas);
    updateJumpHud();
    jumpLoopHandle = requestAnimationFrame(loop);
  };
  jumpLoopHandle = requestAnimationFrame(loop);
}

function attachJumpKeyboard() {
  if (jumpKeyboardAttached) return;
  jumpKeyboardAttached = true;

  window.addEventListener("keydown", (e) => {
    if (state.route !== "game_jump") return;
    const j = state.jump;
    if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") {
      j.input.left = true;
      e.preventDefault();
    }
    if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") {
      j.input.right = true;
      e.preventDefault();
    }
    if (e.key === "ArrowUp" || e.key === " " || e.key.toLowerCase() === "w") {
      j.input.jump = true;
      j.input.jumpQueued = true;
      e.preventDefault();
    }
    if (e.key.toLowerCase() === "r") {
      initJumpRun(false);
      render();
    }
  });

  window.addEventListener("keyup", (e) => {
    if (state.route !== "game_jump") return;
    const j = state.jump;
    if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") j.input.left = false;
    if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") j.input.right = false;
    if (e.key === "ArrowUp" || e.key === " " || e.key.toLowerCase() === "w") j.input.jump = false;
  });

  window.addEventListener("resize", () => {
    if (state.route !== "game_jump") return;
    const canvas = document.getElementById("jumpCanvas");
    resizeJumpCanvas(canvas);
  });
}

function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generateJumpLevel(level, seed) {
  const rand = mulberry32(seed);
  const tile = 16;
  const baseLen = 70;
  const len = Math.min(180, baseLen + level * 2);
  const floorY = 12;
  const h = 16;

  const solids = [];
  const spikes = [];

  const gapChance = Math.min(0.55, 0.10 + level * 0.006);
  const maxGap = Math.min(6, 2 + Math.floor(level / 10));
  const spikeChance = Math.min(0.55, 0.06 + level * 0.007);
  const platChance = Math.min(0.35, 0.05 + level * 0.003);

  let x = 0;
  while (x < len) {
    let gap = 0;
    if (x > 6 && rand() < gapChance) gap = 1 + Math.floor(rand() * maxGap);
    const segLen = 5 + Math.floor(rand() * 8);
    if (gap > 0) x += gap;
    const runLen = Math.min(segLen, len - x);
    if (runLen <= 0) break;

    solids.push({ x, y: floorY, w: runLen, h: 2 });

    for (let i = 0; i < runLen; i++) {
      if (x + i > 8 && rand() < spikeChance) spikes.push({ x: x + i, y: floorY - 1 });
    }

    if (level >= 6 && rand() < platChance) {
      const pw = 3 + Math.floor(rand() * 5);
      const py = floorY - (3 + Math.floor(rand() * 4));
      const px = x + 2 + Math.floor(rand() * Math.max(1, runLen - 4));
      const moving = level >= 20 && rand() < Math.min(0.55, (level - 18) * 0.02);
      solids.push({ x: px, y: py, w: Math.min(pw, len - px - 1), h: 1, moving, a: moving ? rand() * Math.PI * 2 : 0 });
    }

    x += runLen;
  }

  const goalX = len - 4;
  const goalY = floorY - 3;

  return {
    tile,
    w: len,
    h,
    floorY,
    solids,
    spikes,
    goal: { x: goalX, y: goalY, w: 1, h: 3 },
    startX: tile * 3,
    startY: tile * (floorY - 4),
  };
}

function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

function stepJump(dt) {
  const j = state.jump;
  const w = j.world;
  const p = j.player;
  if (!w || !p) return;

  j.t += dt;

  const accel = 2200;
  const maxVx = 260;
  const friction = 0.86;
  const gravity = 1800;
  const jumpV = 520;
  const coyote = 0.08;

  if (p.coyoteT === undefined) p.coyoteT = 0;

  if (j.input.left) p.vx -= accel * dt;
  if (j.input.right) p.vx += accel * dt;
  if (!j.input.left && !j.input.right) p.vx *= friction;
  p.vx = Math.max(-maxVx, Math.min(maxVx, p.vx));

  p.vy += gravity * dt;

  if (p.onGround) p.coyoteT = coyote;
  else p.coyoteT = Math.max(0, p.coyoteT - dt);

  if (j.input.jumpQueued) {
    if (p.onGround || p.coyoteT > 0) {
      p.vy = -jumpV;
      p.onGround = false;
      p.coyoteT = 0;
    }
    j.input.jumpQueued = false;
  }

  if (!j.input.jump && p.vy < 0) p.vy *= 0.92;

  for (const s of w.solids) {
    if (!s.moving) continue;
    const amp = Math.min(5, 1 + Math.floor(j.level / 15));
    const speed = 0.8 + Math.min(1.8, j.level * 0.02);
    s.a += dt * speed;
    s.x += Math.sin(s.a) * dt * amp;
    s.x = Math.max(0, Math.min(w.w - 2, s.x));
  }

  p.x += p.vx * dt;
  resolveSolids(p, w, true);
  p.y += p.vy * dt;
  p.onGround = false;
  resolveSolids(p, w, false);

  const maxFall = w.tile * (w.h + 6);
  if (p.y > maxFall) {
    j.dead = true;
    return;
  }

  for (const sp of w.spikes) {
    const sx = sp.x * w.tile;
    const sy = sp.y * w.tile;
    if (rectsOverlap(p.x, p.y, p.w, p.h, sx + 3, sy + 6, w.tile - 6, w.tile - 6)) {
      j.dead = true;
      return;
    }
  }

  const gx = w.goal.x * w.tile;
  const gy = w.goal.y * w.tile;
  if (rectsOverlap(p.x, p.y, p.w, p.h, gx, gy, w.goal.w * w.tile, w.goal.h * w.tile)) {
    j.won = true;
  }

  const centerX = p.x + p.w * 0.5;
  const targetCam = centerX - (j.viewW || 600) * 0.35;
  j.camX += (targetCam - j.camX) * 0.08;
  const maxCam = w.w * w.tile - (j.viewW || 600);
  j.camX = Math.max(0, Math.min(maxCam, j.camX));
}

function resolveSolids(p, w, horizontal) {
  const tile = w.tile;
  const px = p.x;
  const py = p.y;
  const pw = p.w;
  const ph = p.h;

  for (const s of w.solids) {
    const sx = s.x * tile;
    const sy = s.y * tile;
    const sw = s.w * tile;
    const sh = s.h * tile;
    if (!rectsOverlap(px, py, pw, ph, sx, sy, sw, sh)) continue;
    const overlapX1 = (px + pw) - sx;
    const overlapX2 = (sx + sw) - px;
    const overlapY1 = (py + ph) - sy;
    const overlapY2 = (sy + sh) - py;
    const ox = Math.min(overlapX1, overlapX2);
    const oy = Math.min(overlapY1, overlapY2);

    if (horizontal) {
      if (ox < oy) {
        if (overlapX1 < overlapX2) p.x -= ox;
        else p.x += ox;
        p.vx = 0;
      }
    } else {
      if (oy <= ox) {
        if (overlapY1 < overlapY2) {
          p.y -= oy;
          p.vy = 0;
          p.onGround = true;
        } else {
          p.y += oy;
          p.vy = 0;
        }
      }
    }
  }
}

function drawJump(canvas) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const j = state.jump;
  const w = j.world;
  const p = j.player;
  if (!w || !p) return;

  const vw = j.viewW || canvas.getBoundingClientRect().width;
  const vh = j.viewH || canvas.getBoundingClientRect().height;

  const bg = ctx.createLinearGradient(0, 0, vw, vh);
  bg.addColorStop(0, "rgba(4,7,15,0.90)");
  bg.addColorStop(1, "rgba(4,7,15,0.55)");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, vw, vh);

  const camX = j.camX || 0;
  const tile = w.tile;

  ctx.save();
  ctx.translate(-camX, 0);

  for (const s of w.solids) {
    const x = s.x * tile;
    const y = s.y * tile;
    const ww = s.w * tile;
    const hh = s.h * tile;
    const g = ctx.createLinearGradient(x, y, x + ww, y + hh);
    g.addColorStop(0, "rgba(122,184,255,0.22)");
    g.addColorStop(1, "rgba(86,245,176,0.18)");
    ctx.fillStyle = g;
    ctx.fillRect(x, y, ww, hh);
    ctx.strokeStyle = "rgba(184,225,255,0.18)";
    ctx.strokeRect(x + 0.5, y + 0.5, ww - 1, hh - 1);
  }

  for (const sp of w.spikes) {
    const x = sp.x * tile;
    const y = sp.y * tile;
    ctx.fillStyle = "rgba(86,245,176,0.75)";
    ctx.beginPath();
    ctx.moveTo(x + 2, y + tile);
    ctx.lineTo(x + tile * 0.5, y + 2);
    ctx.lineTo(x + tile - 2, y + tile);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "rgba(122,184,255,0.25)";
    ctx.fillRect(x + 3, y + tile - 3, tile - 6, 2);
  }

  const gx = w.goal.x * tile;
  const gy = w.goal.y * tile;
  ctx.fillStyle = "rgba(199,225,255,0.75)";
  ctx.fillRect(gx + tile * 0.4, gy, tile * 0.12, w.goal.h * tile);
  ctx.fillStyle = "rgba(122,184,255,0.65)";
  ctx.beginPath();
  ctx.moveTo(gx + tile * 0.52, gy + tile * 0.4);
  ctx.lineTo(gx + tile * 1.25, gy + tile * 0.7);
  ctx.lineTo(gx + tile * 0.52, gy + tile * 1.0);
  ctx.closePath();
  ctx.fill();

  const pg = ctx.createLinearGradient(p.x, p.y, p.x + p.w, p.y + p.h);
  pg.addColorStop(0, "rgba(122,184,255,0.95)");
  pg.addColorStop(1, "rgba(86,245,176,0.88)");
  ctx.fillStyle = pg;
  ctx.fillRect(p.x, p.y, p.w, p.h);
  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.strokeRect(p.x + 0.5, p.y + 0.5, p.w - 1, p.h - 1);

  ctx.restore();

  if (j.dead || j.won) {
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fillRect(0, 0, vw, vh);
    ctx.fillStyle = "rgba(184,225,255,0.95)";
    ctx.font = "700 22px Comic Sans MS";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(j.dead ? "Game Over" : "Level geschafft!", vw * 0.5, vh * 0.5);
  }
}

let tetrisLoopHandle = null;
function startTetrisLoop() {
  if (tetrisLoopHandle) return;
  const loop = (ts) => {
    const t = state.tetris;
    if (state.route !== "game_tetris") {
      tetrisLoopHandle = null;
      return;
    }
    if (t.running && !t.paused) {
      if (!t.lastDrop) t.lastDrop = ts;
      const elapsed = ts - t.lastDrop;
      if (elapsed >= t.dropMs) {
        t.lastDrop = ts;
        tetrisDrop(false);
      }
    }
    const c = document.getElementById("tetrisCanvas");
    const n = document.getElementById("tetrisNext");
    drawTetris(c, n);
    updateTetrisHud();
    tetrisLoopHandle = requestAnimationFrame(loop);
  };
  tetrisLoopHandle = requestAnimationFrame(loop);
}

function updateTetrisHud() {
  if (state.route !== "game_tetris") return;
  const t = state.tetris;
  const el = document.getElementById("tetrisHud");
  if (!el) return;
  el.textContent = `Score: ${t.score} · Lines: ${t.lines} · Level: ${t.level}${t.paused ? " · Pause" : ""}${!t.running ? " · Game Over" : ""}`;
}

let tetrisKeyboardAttached = false;
function attachTetrisKeyboard() {
  if (tetrisKeyboardAttached) return;
  tetrisKeyboardAttached = true;
  window.addEventListener("keydown", (e) => {
    if (state.route !== "game_tetris") return;
    const t = state.tetris;
    if (!t.running) return;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      tetrisMove(-1);
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      tetrisMove(1);
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      tetrisRotate();
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      tetrisDrop(true);
    }
    if (e.key === " ") {
      e.preventDefault();
      tetrisHardDrop();
    }
    if (e.key.toLowerCase() === "p") {
      t.paused = !t.paused;
    }
  });
}

function drawTetris(canvas, nextCanvas) {
  const t = state.tetris;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const cell = 28;
  const pad = 10;
  const w = t.gridW * cell + pad * 2;
  const h = t.gridH * cell + pad * 2;
  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  canvas.width = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "rgba(4,7,15,0.55)";
  ctx.fillRect(0, 0, w, h);

  for (let y = 0; y < t.gridH; y++) {
    for (let x = 0; x < t.gridW; x++) {
      const col = t.grid[y][x];
      if (!col) continue;
      drawTetrisCell(ctx, pad + x * cell, pad + y * cell, cell, col);
    }
  }

  if (t.piece) {
    for (let y = 0; y < t.piece.m.length; y++) {
      for (let x = 0; x < t.piece.m[y].length; x++) {
        if (!t.piece.m[y][x]) continue;
        const gx = t.piece.x + x;
        const gy = t.piece.y + y;
        if (gy < 0) continue;
        drawTetrisCell(ctx, pad + gx * cell, pad + gy * cell, cell, t.piece.color);
      }
    }
  }

  ctx.strokeStyle = "rgba(160,215,255,0.10)";
  for (let x = 0; x <= t.gridW; x++) {
    ctx.beginPath();
    ctx.moveTo(pad + x * cell, pad);
    ctx.lineTo(pad + x * cell, pad + t.gridH * cell);
    ctx.stroke();
  }
  for (let y = 0; y <= t.gridH; y++) {
    ctx.beginPath();
    ctx.moveTo(pad, pad + y * cell);
    ctx.lineTo(pad + t.gridW * cell, pad + y * cell);
    ctx.stroke();
  }

  if (nextCanvas) {
    const nctx = nextCanvas.getContext("2d");
    if (nctx) {
      const nc = 22;
      const nw = 6 * nc;
      const nh = 6 * nc;
      nextCanvas.width = Math.floor(nw * dpr);
      nextCanvas.height = Math.floor(nh * dpr);
      nextCanvas.style.width = `${nw}px`;
      nextCanvas.style.height = `${nh}px`;
      nctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      nctx.clearRect(0, 0, nw, nh);
      nctx.fillStyle = "rgba(4,7,15,0.55)";
      nctx.fillRect(0, 0, nw, nh);
      if (t.nextPiece) {
        const m = t.nextPiece.m;
        const ox = Math.floor((6 - m[0].length) / 2);
        const oy = Math.floor((6 - m.length) / 2);
        for (let y = 0; y < m.length; y++) {
          for (let x = 0; x < m[y].length; x++) {
            if (!m[y][x]) continue;
            drawTetrisCell(nctx, (ox + x) * nc, (oy + y) * nc, nc, t.nextPiece.color);
          }
        }
      }
    }
  }
}

function drawTetrisCell(ctx, x, y, s, col) {
  const g = ctx.createLinearGradient(x, y, x + s, y + s);
  g.addColorStop(0, "rgba(255,255,255,0.22)");
  g.addColorStop(1, "rgba(0,0,0,0.22)");
  ctx.fillStyle = col;
  ctx.fillRect(x + 1, y + 1, s - 2, s - 2);
  ctx.fillStyle = g;
  ctx.fillRect(x + 1, y + 1, s - 2, s - 2);
  ctx.strokeStyle = "rgba(238,246,255,0.18)";
  ctx.strokeRect(x + 1.5, y + 1.5, s - 3, s - 3);
}

function toggleOption(question, optionIndex) {
  const selected = new Set(getSelections(question.id));
  const key = optionIndex;

  if (selected.has(key)) {
    selected.delete(key);
    setSelections(question.id, Array.from(selected));
    return { ok: true };
  }

  if (selected.size >= quiz.maxSelectionsPerQuestion) {
    return { ok: false, reason: `Maximal ${quiz.maxSelectionsPerQuestion} auswählen.` };
  }

  selected.add(key);
  setSelections(question.id, Array.from(selected));
  return { ok: true };
}

function renderQuestion(stepIndex) {
  const q = quiz.questions[stepIndex];
  const selected = new Set(getSelections(q.id));

  els.metaTitle.textContent = q.title;
  els.metaSub.textContent = `${q.time} · ${currentStepLabel()}`;
  els.backBtn.disabled = false;
  els.nextBtn.textContent = stepIndex === quiz.questions.length - 1 ? "Zum Ergebnis" : "Weiter";

  const optionsHtml = q.options
    .map((label, idx) => {
      const isSelected = selected.has(idx);
      return `
        <div class="option ${isSelected ? "option--selected" : ""}" data-idx="${idx}" role="button" tabindex="0">
          <div class="option__check">${isSelected ? "✓" : ""}</div>
          <div class="option__label">${escapeHtml(label)}</div>
        </div>
      `;
    })
    .join("");

  els.content.innerHTML = `
    <h1 class="h1">${escapeHtml(q.prompt)}</h1>
    <p class="p">Wähle 1–2 Optionen.</p>
    <div class="notice" id="notice"></div>
    <div class="grid" id="options">${optionsHtml}</div>
    <div class="small">Tipp: Du kannst eine Option wieder abwählen.</div>
  `;

  const noticeEl = document.getElementById("notice");
  const optionsEl = document.getElementById("options");

  function showNotice(text) {
    noticeEl.textContent = text;
    noticeEl.style.display = "block";
    window.setTimeout(() => {
      noticeEl.style.display = "none";
    }, 1600);
  }

  function onPick(idx) {
    const res = toggleOption(q, idx);
    if (!res.ok) showNotice(res.reason);
    render();
  }

  optionsEl.querySelectorAll(".option").forEach((el) => {
    const idx = Number(el.getAttribute("data-idx"));
    el.addEventListener("click", () => onPick(idx));
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onPick(idx);
      }
    });
  });
}

function renderResult() {
  els.metaTitle.textContent = "Dein Plan";
  els.metaSub.textContent = "";
  els.backBtn.disabled = false;
  els.nextBtn.textContent = "Neu starten";

  const summary = quiz.questions
    .map((q) => {
      const picks = getSelections(q.id)
        .sort((a, b) => a - b)
        .map((idx) => q.options[idx])
        .filter(Boolean);

      const itemsText = picks.length ? picks.join(" · ") : "(nichts gewählt)";

      return `
        <div class="slot">
          <div class="slot__top">
            <div class="slot__title">${escapeHtml(q.title)}</div>
            <div class="slot__time">${escapeHtml(q.time)}</div>
          </div>
          <div class="slot__items">${escapeHtml(itemsText)}</div>
        </div>
      `;
    })
    .join("");

  els.content.innerHTML = `
    <h1 class="h1">Alles klar, ${quiz.personName}.</h1>
    <p class="p">Hier ist dein Tag, so wie du ihn gewählt hast.</p>
    <div class="actions">
      <button class="btn" id="downloadCardBtn" type="button">Als Bild downloaden</button>
      <button class="btn btn--ghost" id="toggleCardPreviewBtn" type="button">Karte anzeigen</button>
    </div>
    <canvas class="resultCardCanvas" id="resultCardCanvas" aria-hidden="true"></canvas>
    <div class="summary">${summary}</div>
  `;

  const downloadBtn = document.getElementById("downloadCardBtn");
  const toggleBtn = document.getElementById("toggleCardPreviewBtn");
  const canvas = document.getElementById("resultCardCanvas");

  function buildCardModel() {
    return quiz.questions.map((q) => {
      const picks = getSelections(q.id)
        .sort((a, b) => a - b)
        .map((idx) => q.options[idx])
        .filter(Boolean);
      return {
        title: q.title,
        time: q.time,
        items: picks,
      };
    });
  }

  function ensureCardRendered() {
    if (!canvas) return null;
    if (canvas.dataset.rendered === "true") return canvas;
    const model = buildCardModel();
    renderResultCardToCanvas(canvas, { name: quiz.personName, model });
    canvas.dataset.rendered = "true";
    return canvas;
  }

  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      const c = ensureCardRendered();
      if (!c) return;
      const isHidden = c.style.display === "none" || !c.style.display;
      c.style.display = isHidden ? "block" : "none";
      toggleBtn.textContent = isHidden ? "Karte ausblenden" : "Karte anzeigen";
    });
  }

  if (downloadBtn) {
    downloadBtn.addEventListener("click", async () => {
      const c = ensureCardRendered();
      if (!c) return;
      await downloadCanvasAsPng(c, `Leonie_Tag_${new Date().toISOString().slice(0, 10)}.png`);
    });
  }
}

function renderResultCardToCanvas(canvas, { name, model }) {
  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  const width = 1080;
  const height = 1350;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);

  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const r = 44;
  roundRect(ctx, 0, 0, width, height, r);
  ctx.clip();

  const bg = ctx.createLinearGradient(0, 0, 0, height);
  bg.addColorStop(0, "#030612");
  bg.addColorStop(0.45, "#050a18");
  bg.addColorStop(1, "#02040b");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  const neb1 = ctx.createRadialGradient(width * 0.28, height * 0.20, 0, width * 0.28, height * 0.20, height * 0.55);
  neb1.addColorStop(0, "rgba(122,184,255,0.22)");
  neb1.addColorStop(1, "rgba(122,184,255,0)");
  ctx.fillStyle = neb1;
  ctx.fillRect(0, 0, width, height);

  const neb2 = ctx.createRadialGradient(width * 0.78, height * 0.62, 0, width * 0.78, height * 0.62, height * 0.55);
  neb2.addColorStop(0, "rgba(86,245,176,0.16)");
  neb2.addColorStop(1, "rgba(86,245,176,0)");
  ctx.fillStyle = neb2;
  ctx.fillRect(0, 0, width, height);

  drawStarBokeh(ctx, width, height);
  drawFloatingHearts(ctx, width, height);
  drawGrain(ctx, width, height);

  ctx.fillStyle = "rgba(255,255,255,0.06)";
  ctx.fillRect(0, 0, width, height);

  const cardPad = 64;
  const innerX = cardPad;
  const innerY = cardPad;
  const innerW = width - cardPad * 2;

  const canvasFontFamily = '"Comic Sans MS", "Comic Sans", cursive';

  const panel = ctx.createLinearGradient(innerX, innerY, innerX + innerW, innerY + height * 0.4);
  panel.addColorStop(0, "rgba(255,255,255,0.10)");
  panel.addColorStop(1, "rgba(255,255,255,0.04)");
  ctx.fillStyle = panel;
  ctx.strokeStyle = "rgba(160,215,255,0.18)";
  ctx.lineWidth = 2;
  roundRect(ctx, innerX, innerY, innerW, height - cardPad * 2, 34);
  ctx.fill();
  ctx.stroke();

  const glowTop = ctx.createRadialGradient(width * 0.5, innerY + 20, 0, width * 0.5, innerY + 20, 420);
  glowTop.addColorStop(0, "rgba(199,225,255,0.18)");
  glowTop.addColorStop(1, "rgba(199,225,255,0)");
  ctx.fillStyle = glowTop;
  ctx.fillRect(0, 0, width, height);

  ctx.shadowColor = "rgba(0,0,0,0.35)";
  ctx.shadowBlur = 14;
  ctx.shadowOffsetY = 10;
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  roundRect(ctx, innerX + 10, innerY + 10, innerW - 20, height - cardPad * 2 - 20, 28);
  ctx.fill();
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  const title = `Happy Birthday Schatz dein Tag <3`;
  const titleX = innerX + 36;
  const titleY = innerY + 92;
  const titleMaxW = innerW - 72;

  ctx.fillStyle = "rgba(238,246,255,0.95)";
  const titleResult = drawFittedTitle(ctx, title, titleX, titleY, titleMaxW, {
    fontWeight: 800,
    maxFontSize: 54,
    minFontSize: 36,
    family: canvasFontFamily,
  });

  ctx.fillStyle = "rgba(238,246,255,0.70)";
  ctx.font = `600 28px ${canvasFontFamily}`;
  const subtitleY = titleResult.lines === 2 ? innerY + 148 : innerY + 132;
  ctx.fillText(name, titleX, subtitleY);

  let y = innerY + 180;
  const lineX = innerX + 36;
  const lineW = innerW - 72;

  for (const slot of model) {
    y += 20;
    const slotH = 132;
    ctx.fillStyle = "rgba(4,7,15,0.36)";
    ctx.strokeStyle = "rgba(160,215,255,0.14)";
    ctx.lineWidth = 2;
    roundRect(ctx, lineX, y, lineW, slotH, 22);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "rgba(238,246,255,0.92)";
    ctx.font = `800 30px ${canvasFontFamily}`;
    ctx.fillText(slot.title, lineX + 22, y + 44);

    ctx.fillStyle = "rgba(199,225,255,0.72)";
    ctx.font = `700 22px ${canvasFontFamily}`;
    ctx.fillText(slot.time, lineX + lineW - 22 - ctx.measureText(slot.time).width, y + 44);

    const items = (slot.items && slot.items.length) ? slot.items.join(" · ") : "—";
    ctx.fillStyle = "rgba(238,246,255,0.78)";
    ctx.font = `600 24px ${canvasFontFamily}`;
    y = drawWrappedText(ctx, items, lineX + 22, y + 78, lineW - 44, 30);
    y -= 78;
    y += slotH;

    if (y > height - 220) break;
  }

  // footer intentionally left blank
}

function measureTextWidth(ctx, text, font) {
  const prev = ctx.font;
  ctx.font = font;
  const w = ctx.measureText(text).width;
  ctx.font = prev;
  return w;
}

function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = String(text).split(/\s+/);
  let line = "";
  let yy = y;
  for (let i = 0; i < words.length; i++) {
    const test = line ? `${line} ${words[i]}` : words[i];
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, yy);
      line = words[i];
      yy += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, yy);
  return yy;
}

function drawFittedTitle(ctx, text, x, y, maxWidth, opts) {
  const weight = opts?.fontWeight ?? 800;
  const maxFontSize = opts?.maxFontSize ?? 54;
  const minFontSize = opts?.minFontSize ?? 34;
  const family = opts?.family ?? '"Comic Sans MS", "Comic Sans", cursive, ui-sans-serif, system-ui';

  function setFont(size) {
    ctx.font = `${weight} ${size}px ${family}`;
  }

  // Try single-line scaling first
  let size = maxFontSize;
  setFont(size);
  while (ctx.measureText(text).width > maxWidth && size > minFontSize) {
    size -= 2;
    setFont(size);
  }

  if (ctx.measureText(text).width <= maxWidth) {
    ctx.fillText(text, x, y);
    return { lines: 1, fontSize: size };
  }

  // If still too wide: wrap into two lines and scale both lines
  const words = String(text).split(/\s+/);
  let best = null;
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(" ");
    const b = words.slice(i).join(" ");
    const w = Math.max(ctx.measureText(a).width, ctx.measureText(b).width);
    if (!best || w < best.w) best = { a, b, w };
  }

  size = maxFontSize;
  setFont(size);
  while (best && best.w > maxWidth && size > minFontSize) {
    size -= 2;
    setFont(size);
    best.w = Math.max(ctx.measureText(best.a).width, ctx.measureText(best.b).width);
  }

  const lineHeight = Math.round(size * 1.08);
  if (best) {
    ctx.fillText(best.a, x, y);
    ctx.fillText(best.b, x, y + lineHeight);
  } else {
    ctx.fillText(text, x, y);
  }
  return { lines: 2, fontSize: size };
}

function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function drawStarField(ctx, w, h) {
  const n = 170;
  for (let i = 0; i < n; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const r = 0.6 + Math.random() * 1.6;
    const a = 0.08 + Math.random() * 0.22;
    const isBlue = Math.random() < 0.55;
    const c = isBlue ? `rgba(199,225,255,${a})` : `rgba(184,255,218,${a * 0.85})`;
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawStarBokeh(ctx, w, h) {
  ctx.save();
  ctx.globalCompositeOperation = "screen";

  // Many tiny stars
  drawStarField(ctx, w, h);

  // Large soft bokeh stars like the reference image
  const big = 26;
  for (let i = 0; i < big; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const size = 70 + Math.random() * 170;
    const rot = Math.random() * Math.PI;
    const isGreen = Math.random() < 0.45;

    // base glow
    const glow = ctx.createRadialGradient(x, y, 0, x, y, size);
    glow.addColorStop(0, isGreen ? "rgba(86,245,176,0.24)" : "rgba(122,184,255,0.24)");
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();

    // white core
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);

    // chromatic fringing (blue/green offsets)
    ctx.globalAlpha = 0.55;
    drawSoftStar(ctx, -10, 6, size * 0.55, "rgba(122,184,255,0.55)");
    drawSoftStar(ctx, 10, -6, size * 0.55, "rgba(86,245,176,0.40)");
    ctx.globalAlpha = 0.75;
    drawSoftStar(ctx, 0, 0, size * 0.52, "rgba(255,255,255,0.65)");
    ctx.globalAlpha = 1;

    ctx.restore();
  }

  ctx.restore();
}

function drawSoftStar(ctx, ox, oy, radius, color) {
  const spikes = 4;
  const outerRadius = radius;
  const innerRadius = radius * 0.38;
  ctx.beginPath();
  let rot = Math.PI / 2 * 3;
  let x = ox;
  let y = oy;
  const step = Math.PI / spikes;
  ctx.moveTo(ox, oy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    x = ox + Math.cos(rot) * outerRadius;
    y = oy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;
    x = ox + Math.cos(rot) * innerRadius;
    y = oy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(ox, oy - outerRadius);
  ctx.closePath();

  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 30;
  ctx.fill();
  ctx.shadowBlur = 0;
}

function drawGrain(ctx, w, h) {
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;
  // subtle film grain
  for (let i = 0; i < data.length; i += 4) {
    const n = (Math.random() - 0.5) * 14;
    data[i] = Math.min(255, Math.max(0, data[i] + n));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + n));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + n));
  }
  ctx.putImageData(imageData, 0, 0);
}

function drawFloatingHearts(ctx, w, h) {
  const m = 28;
  for (let i = 0; i < m; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const size = 10 + Math.random() * 18;
    const rot = (Math.random() - 0.5) * 0.9;
    const isGreen = Math.random() < 0.45;
    const col = isGreen ? { r: 86, g: 245, b: 176 } : { r: 122, g: 184, b: 255 };

    const glow = ctx.createRadialGradient(x, y, 0, x, y, size * 2.4);
    glow.addColorStop(0, `rgba(${col.r},${col.g},${col.b},0.18)`);
    glow.addColorStop(1, `rgba(${col.r},${col.g},${col.b},0)`);
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, size * 2.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.fillStyle = `rgba(${col.r},${col.g},${col.b},0.22)`;
    ctx.fill(heartPathCanvas(size));
    ctx.restore();
  }
}

function heartPathCanvas(size) {
  const s = size;
  const topCurveHeight = s * 0.3;
  const bottomPoint = s * 0.95;

  const path = new Path2D();
  path.moveTo(0, topCurveHeight);
  path.bezierCurveTo(0, 0, -s * 0.55, 0, -s * 0.55, topCurveHeight);
  path.bezierCurveTo(-s * 0.55, s * 0.62, 0, s * 0.74, 0, bottomPoint);
  path.bezierCurveTo(0, s * 0.74, s * 0.55, s * 0.62, s * 0.55, topCurveHeight);
  path.bezierCurveTo(s * 0.55, 0, 0, 0, 0, topCurveHeight);
  path.closePath();
  return path;
}

function downloadCanvasAsPng(canvas, filename) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) return resolve();
      // Prefer native share on mobile (works well on iOS/Android when available)
      const tryShare = async () => {
        try {
          const file = new File([blob], filename, { type: "image/png" });
          if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({ files: [file], title: "Dein Tag", text: "" });
            return true;
          }
        } catch {
          // ignore
        }
        return false;
      };

      const fallbackDownload = () => {
        const url = URL.createObjectURL(blob);

        // Standard download (Android/desktop)
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.rel = "noopener";
        document.body.appendChild(a);
        a.click();
        a.remove();

        // iOS Safari sometimes ignores download; open image in new tab as fallback
        window.setTimeout(() => {
          window.open(url, "_blank", "noopener,noreferrer");
          window.setTimeout(() => URL.revokeObjectURL(url), 4000);
        }, 250);
      };

      Promise.resolve(tryShare()).then((shared) => {
        if (!shared) fallbackDownload();
        resolve();
      });
    }, "image/png");
  });
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  // service workers require http(s) or localhost; file:// won't work
  if (location.protocol === "file:") return;
  navigator.serviceWorker.register("./sw.js").catch(() => {
    // ignore
  });
}

function canGoNext() {
  if (state.step < 0) return true;
  if (state.step >= quiz.questions.length) return true;

  const q = quiz.questions[state.step];
  const picks = getSelections(q.id);
  return picks.length >= quiz.minSelectionsPerQuestion;
}

function updateNavDisabled() {
  els.nextBtn.disabled = !canGoNext();
}

function render() {
  setProgress();

  if (state.route === "home") {
    els.progressBar.style.width = "0%";
    renderHome();
    return;
  }

  if (state.route === "games") {
    els.progressBar.style.width = "0%";
    renderGames();
    return;
  }

  if (state.route === "game_ttt") {
    els.progressBar.style.width = "0%";
    renderTicTacToe();
    return;
  }

  if (state.route === "game_tetris") {
    els.progressBar.style.width = "0%";
    renderTetris();
    return;
  }

  if (state.route === "game_draw") {
    els.progressBar.style.width = "0%";
    renderDraw();
    return;
  }

  if (state.route === "game_jump") {
    els.progressBar.style.width = "0%";
    renderJumpRun();
    return;
  }

  if (state.step < 0) {
    renderStart();
    updateNavDisabled();
    return;
  }

  if (state.step >= 0 && state.step < quiz.questions.length) {
    renderQuestion(state.step);
    updateNavDisabled();
    return;
  }

  renderResult();
  updateNavDisabled();
}

function goNext() {
  if (state.route !== "quiz") return;
  if (state.step >= quiz.questions.length) {
    reset();
    return;
  }

  if (!canGoNext()) {
    render();
    return;
  }

  state.step += 1;
  render();
}

function goBack() {
  if (state.route === "games") {
    state.route = "home";
    render();
    return;
  }

  if (state.route === "game_ttt" || state.route === "game_tetris" || state.route === "game_draw" || state.route === "game_jump") {
    state.route = "games";
    render();
    return;
  }

  if (state.route === "quiz" && state.step <= -1) {
    state.route = "home";
    render();
    return;
  }
  state.step -= 1;
  render();
}

function reset() {
  state.route = "home";
  state.step = -1;
  state.selectionsByQuestionId.clear();
  render();
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

els.nextBtn.addEventListener("click", goNext);
els.backBtn.addEventListener("click", goBack);

initBackgroundParticles();
registerServiceWorker();
render();
