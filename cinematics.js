// ===== Cinemáticas — Fase "Mundo Vivo" =====
// Sistema autónomo: cria e gere o seu próprio DOM (tal como hitFlash/bonusStars
// já fazem em dia-crianca.js), sem depender de markup extra no index.html.
// Duas funções principais:
//   playCinematic(slides, onComplete)   → diálogo com barras de cinema (bosses)
//   playTitleCard(data, onComplete)     → cartão de título (entrada de região)
//
// Ambas pausam a física do lado de fora (quem chama é responsável por isso,
// tal como já acontece com showHistory/showQuiz) — este módulo só trata do ecrã.

let dialogEl = null, barTop = null, barBottom = null, dlgAvatar = null, dlgName = null, dlgText = null, dlgHint = null;
let titleEl = null;

function ensureDialogDOM() {
  if (dialogEl) return;
  barTop = document.createElement("div"); barTop.id = "cineBarTop"; barTop.className = "cine-bar cine-bar-top";
  barBottom = document.createElement("div"); barBottom.id = "cineBarBottom"; barBottom.className = "cine-bar cine-bar-bottom";
  document.body.appendChild(barTop); document.body.appendChild(barBottom);

  dialogEl = document.createElement("div");
  dialogEl.id = "cineDialog";
  dialogEl.innerHTML = `
    <div id="cineAvatar"></div>
    <div id="cineBody">
      <p id="cineName"></p>
      <p id="cineText"></p>
      <p id="cineHint">Toca para continuar ▶</p>
    </div>
    <button id="cineSkip" type="button" aria-label="Saltar">⏭ Saltar</button>
  `;
  document.body.appendChild(dialogEl);
  dlgAvatar = document.getElementById("cineAvatar");
  dlgName   = document.getElementById("cineName");
  dlgText   = document.getElementById("cineText");
  dlgHint   = document.getElementById("cineHint");
}

const SPEAKER_STYLE = {
  vb:   { name: "VanBerto's", emoji: "", cls: "cine-vb" },
  boss: { name: "???",        emoji: "👾", cls: "cine-boss" },
  npc:  { name: "",           emoji: "🪧", cls: "cine-npc" }
};

// bars=true → cinemática completa (barras pretas), usada nas cutscenes de boss antigas.
// bars=false → só a caixa de diálogo (retrato+nome+texto), sem tapar o resto do ecrã —
// usada agora no diálogo de boss, para não esconder a arena atrás das barras.
// centered=true → a caixa aparece mesmo no meio do ecrã (estilo cinematográfico),
// em vez de presa ao fundo — usada no diálogo de boss para nunca ficar por cima
// das personagens nem cortada pela borda do ecrã, seja qual for a resolução.
export function playCinematic(slides, onComplete, bars = true, centered = false) {
  if (!slides || !slides.length) { onComplete?.(); return; }
  ensureDialogDOM();
  let i = 0;
  let finished = false;
  // 1) barras entram primeiro, a estabelecer o "modo cinema"...
  if (bars) document.body.classList.add("cine-active");
  // 2) ...só depois a caixa de diálogo desliza para cima — sem isto tudo
  //    aparecia de golpe, o que dava a sensação de corte/salto brusco.
  const showTimer = setTimeout(() => { dialogEl.classList.add("cine-show"); render(); }, bars ? 220 : 0);

  function render() {
    const s = slides[i];
    const style = SPEAKER_STYLE[s.speaker] || SPEAKER_STYLE.vb;
    dialogEl.className = "cine-show " + style.cls + (centered ? " cine-center" : "");
    const avatarEmoji = s.emoji || style.emoji;
    dlgAvatar.textContent = avatarEmoji;
    dlgAvatar.style.display = avatarEmoji ? "" : "none";
    dlgName.textContent = s.name || style.name;
    dlgText.textContent = s.text || "";
    dlgHint.textContent = (i === slides.length - 1) ? "Toca para continuar ▶" : "Toca para avançar ▶";
    // s.anchor={x,y} (opcional, em pixels CSS): em vez da caixa fixa no fundo
    // do ecrã, ancora-se por cima desse ponto — usado para o boss "falar"
    // com um balão por cima da própria cabeça, em vez de uma caixa genérica
    // lá em baixo. Sem anchor, mantém-se o comportamento de sempre.
    if (s.anchor) {
      dialogEl.classList.add("cine-floating");
      dialogEl.style.left = s.anchor.x + "px";
      dialogEl.style.top = s.anchor.y + "px";
    } else {
      dialogEl.classList.remove("cine-floating");
      dialogEl.style.left = "";
      dialogEl.style.top = "";
    }
  }

  function advance() {
    if (!dialogEl.classList.contains("cine-show")) return; // ainda a entrar — ignora toques prematuros
    i++;
    if (i >= slides.length) { finish(); return; }
    render();
  }

  function finish() {
    if (finished) return;
    finished = true;
    clearTimeout(showTimer);
    dialogEl.removeEventListener("click", advance);
    document.getElementById("cineSkip").removeEventListener("click", finish);
    // Sair na ordem inversa: diálogo desce primeiro, barras fecham a seguir.
    dialogEl.classList.remove("cine-show");
    setTimeout(() => {
      if (bars) document.body.classList.remove("cine-active");
      setTimeout(() => onComplete?.(), bars ? 340 : 120);
    }, 260);
  }

  render();
  dialogEl.addEventListener("click", advance);
  document.getElementById("cineSkip").addEventListener("click", finish);
}

function ensureTitleDOM() {
  if (titleEl) return;
  titleEl = document.createElement("div");
  titleEl.id = "cineTitleCard";
  titleEl.innerHTML = `
    <div id="ctcIcon"></div>
    <p id="ctcName"></p>
    <p id="ctcSub"></p>
    <p id="ctcLine"></p>
  `;
  document.body.appendChild(titleEl);
}

// data: { icon, name, sub, lines: [string, string] }
export function playTitleCard(data, onComplete) {
  ensureTitleDOM();
  document.getElementById("ctcIcon").textContent = data.icon || "🌍";
  document.getElementById("ctcName").textContent = data.name || "";
  document.getElementById("ctcSub").textContent = data.sub || "";
  const lineEl = document.getElementById("ctcLine");
  const lines = data.lines && data.lines.length ? data.lines : [""];
  let i = 0;
  lineEl.textContent = lines[0];
  titleEl.classList.add("show");

  function advance() {
    i++;
    if (i >= lines.length) { finish(); return; }
    lineEl.textContent = lines[i];
  }
  function finish() {
    titleEl.removeEventListener("click", advance);
    titleEl.classList.remove("show");
    setTimeout(() => onComplete?.(), 320);
  }
  titleEl.addEventListener("click", advance);
  // avança sozinho ao fim de um tempo generoso, caso ninguém toque
  clearTimeout(titleEl._autoTimer);
  titleEl._autoTimer = setTimeout(() => { if (titleEl.classList.contains("show")) finish(); }, 2600 * lines.length);
}
