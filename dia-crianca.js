/*************************************************
 * VanBerto's — O Dia da Criança 🎈
 * Professora: Vanda Várzea
 *
 * Jogo educativo sobre os Direitos das Crianças
 * e o Dia da Criança — 1 de Junho.
 *
 * 20 níveis · 3 opções por pergunta · Segunda tentativa
 * VanBerto's: mascote colorida com fato de festa
 *************************************************/

import { HISTORY, QUIZ_TIPS, QUIZ_ARTICLE, QUIZ_BY_THEME } from "./data-quiz.js";
import { THEMES, LEVELS } from "./data-levels.js";
import { MAP_REGIONS, ARTEFACTS, ARTEFACT_SETS, SET_REACTIONS, ACHIEVEMENTS_DEFS } from "./data-progression.js";
import { PRAISE, PAUSE_TIPS, LEVEL_ENTRY_PHRASES, DYNAMIC_MSGS_CORRECT, DYNAMIC_MSGS_WRONG,
         VB_LEVEL_INTRO, VB_HIT, VB_QUIZ_CORRECT, VB_QUIZ_WRONG, VB_STAR_POWER, VB_PERFECT_LEVEL } from "./data-flavor.js";
import { ensureAudio, beep, SFX, isMuted, setMuted, toggleMuted } from "./audio.js";
import { starsForLevel, totalStarsEarned, resetLevelStarTracking, finalizeLevelStars,
         resetAllStars } from "./stars.js";
import { unlockedAchievements, checkAchievements, onSecretFoundForAchievements,
         onHistoryReadForAchievements, onCorrectAnswerForAchievements, renderAchievements,
         resetAchievements, showAchievementToast } from "./achievements.js";
import { BOSS_BY_LEVEL } from "./data-bosses.js";
import { REGION_INTRO, BOSS_OBJECTIVE, BOSS_INTRO_VB, BOSS_VICTORY_VB, NPC_SIGNS, BOSS_HP_TAUNTS } from "./data-story.js";
import { playTitleCard, playCinematic } from "./cinematics.js";
import { loadNamespace, saveNamespace } from "./storage.js";
import { makeTextures, makePlatformTextureThemed } from "./textures.js";
import { initBackground, applyBackground, drawSun, drawStars, drawCloud,
         updateTrail, updateFootsteps, updateDoorGlow, updatePlatformDecor,
         spawnPlatformDecor, resetDoorGlow, clearPlatformDecor, hideDoorGlow,
         clouds, bgConfetti, NIGHT_THEMES } from "./background.js";

window.addEventListener("DOMContentLoaded", () => {

  // ===== DOM =====
  const startOverlay   = document.getElementById("startOverlay");
  const howOverlay     = document.getElementById("howOverlay");
  const quizOverlay    = document.getElementById("quizOverlay");
  const historyOverlay = document.getElementById("historyOverlay");
  const historyText    = document.getElementById("historyText");
  const btnHistory     = document.getElementById("btnHistory");
  const quizQuestion   = document.getElementById("quizQuestion");
  const quizAnswers    = document.getElementById("quizAnswers");
  const quizFeedback   = document.getElementById("quizFeedback");
  const quizExplanation= document.getElementById("quizExplanation");
  const btnCloseQuiz   = document.getElementById("btnCloseQuiz");
  const btnStart       = document.getElementById("btnStart");
  const btnHow         = document.getElementById("btnHow");
  const btnCloseHow    = document.getElementById("btnCloseHow");
  const btnMute        = document.getElementById("btnMute");
  const btnPause       = document.getElementById("btnPause");
  const btnRestart     = document.getElementById("btnRestartLevel");
  const btnRestartGame = document.getElementById("btnRestartGame");
  const playerNameInput= document.getElementById("playerName");
  const gameOverOverlay= document.getElementById("gameOverOverlay");
  const winOverlay     = document.getElementById("winOverlay");

  const hitFlash   = document.createElement("div"); hitFlash.id = "hitFlash";   document.body.appendChild(hitFlash);
  const bonusStars = document.createElement("div"); bonusStars.id = "bonusStars"; document.body.appendChild(bonusStars);

  let playerName = "";

  let _vbTimer=null;
  function vbSay(text,type="intro",duration=3400){
    if(document.body.classList.contains("hc-mode"))return;
    const el=document.getElementById("vbSpeech"),textEl=document.getElementById("vbSpeechText");
    if(!el||!textEl)return;
    if(_vbTimer){clearTimeout(_vbTimer);_vbTimer=null;}
    textEl.textContent=text;el.className="vb-"+type;void el.offsetWidth;
    el.classList.add("vb-show");
    _vbTimer=setTimeout(()=>{el.classList.remove("vb-show");_vbTimer=null;},duration);
  }
  function vbSayRandom(arr,type,duration){vbSay(arr[Math.floor(Math.random()*arr.length)],type,duration);}

  // Diálogo de boss (entrada/derrota) — usa a caixa de diálogo de cinematics.js
  // (retrato + nome + texto, avança ao toque) SEM as barras pretas, para não
  // tapar a arena. Antes disto usava o balão vbSay (canto inferior direito,
  // pensado para dicas rápidas) — ficava pequeno, avançava sozinho por tempo
  // e longe da ação; agora fica centrado, legível, e o jogador controla o ritmo.
  function playBossDialogue(slides, onComplete) {
    playCinematic(slides, onComplete, false);
  }

  // Calcula, em pixels CSS de ecrã, o ponto por cima da cabeça do boss —
  // usado para o balão de fala dele flutuar ali em vez de ficar fixo no
  // fundo do ecrã (ver s.anchor em cinematics.js). Devolve null se não
  // houver boss vivo no momento (ex.: diálogo de vitória, já destruído em
  // startBossQuizPhase) — nesse caso a fala cai de volta na caixa normal.
  function bossDialogueAnchor() {
    if (!bossState || !bossState.sprite || !bossState.sprite.active) return null;
    const b = bossState.sprite, def = bossState.def;
    const cam = sceneRef.cameras.main;
    const canvas = sceneRef.game.canvas;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    const scaleX = rect.width / 960, scaleY = rect.height / 540;
    // Mesma referência da barra de vida (hpBarOffset) + folga extra para o
    // balão não colar à barra de vida.
    const aboveHead = (def.hpBarOffset != null ? def.hpBarOffset : ((b.displayHeight/2||40)+42)) + 46;
    let x = rect.left + (b.x - cam.scrollX) * scaleX;
    const y = rect.top + (b.y - aboveHead - cam.scrollY) * scaleY;
    // Não deixar o balão sair do ecrã pelas laterais.
    x = Math.max(rect.left+130, Math.min(rect.right-130, x));
    return { x, y };
  }

  // ===== Guardar =====
  // "settings" guarda apenas preferências (som, alto contraste) — nunca
  // progresso de jogo. O progresso em curso (nível/pontos/vidas a meio de
  // uma partida) não é persistido de propósito: quem quer retomar usa o
  // Mapa, que já sabe até onde cada jogador chegou.

  // ===== Gestão de overlay-open (desativa touch quando overlay visível) =====
  function updateOverlayOpenClass() {
    const anyOpen = !startOverlay.classList.contains("hidden")
      || !howOverlay.classList.contains("hidden")
      || !quizOverlay.classList.contains("hidden")
      || !historyOverlay.classList.contains("hidden")
      || !document.getElementById("gameOverOverlay").classList.contains("hidden")
      || !document.getElementById("winOverlay").classList.contains("hidden")
      || !document.getElementById("reviewOverlay").classList.contains("hidden")
      || !document.getElementById("mainStoryOverlay")?.classList.contains("hidden")
      || !document.getElementById("mapOverlay")?.classList.contains("hidden")
      || !document.getElementById("achievementsOverlay")?.classList.contains("hidden")
      || !document.getElementById("albumOverlay")?.classList.contains("hidden")
      || !document.getElementById("statsOverlay")?.classList.contains("hidden")
      || !document.getElementById("optionsOverlay")?.classList.contains("hidden")
      || !document.getElementById("certificateOverlay")?.classList.contains("hidden")
      || !document.getElementById("artefactGalleryOverlay")?.classList.contains("hidden");
    document.body.classList.toggle("overlay-open", anyOpen);
  }
  // Observer para detetar mudanças nos overlays
  const _overlayObserver = new MutationObserver(updateOverlayOpenClass);
  [startOverlay, howOverlay, quizOverlay, historyOverlay,
   document.getElementById("gameOverOverlay"), document.getElementById("winOverlay"),
   document.getElementById("reviewOverlay"),
   document.getElementById("mainStoryOverlay"), document.getElementById("mapOverlay"),
   document.getElementById("achievementsOverlay"), document.getElementById("albumOverlay"),
   document.getElementById("statsOverlay"), document.getElementById("optionsOverlay"),
   document.getElementById("certificateOverlay"), document.getElementById("artefactGalleryOverlay")
  ].forEach(el => { if(el) _overlayObserver.observe(el, { attributes: true, attributeFilter: ["class"] }); });
  updateOverlayOpenClass();
  function saveGame() {
    const s = loadNamespace("settings", {});
    s.muted = isMuted();
    saveNamespace("settings", s);
  }
  function loadGame() {
    const s = loadNamespace("settings", {});
    if (typeof s.muted === "boolean") setMuted(s.muted);
  }

  // ===== Elogios =====
  function pickPraise() { return PRAISE[Math.floor(Math.random() * PRAISE.length)]; }

  function showFloat(scene, x, y, msg, color="#ff6b35") {
    const t = scene.add.text(x, y, msg, { fontSize:"24px", fontStyle:"900", color, stroke:"#fff8e0", strokeThickness:5 }).setOrigin(0.5).setDepth(999);
    scene.tweens.add({ targets:t, y:y-44, alpha:0, duration:640, ease:"Sine.easeOut", onComplete:()=>t.destroy() });
  }

  // ===== Quiz stats =====
  const quizStats = { total:0, correct:0, everWrong:false, errors:[], errorsByTheme:{} };
  const usedQuizByLevel = {};
  const usedQuizByTheme = {}; // anti-repetição global por tema (cross-nível)
  let lastQuizTheme = "historia";

  function resetQuizStats() { quizStats.total=0; quizStats.correct=0; quizStats.everWrong=false; quizStats.errors=[]; quizStats.errorsByTheme={}; }

  function pickQuizForLevel(levelIdx, theme) {
    const pool = QUIZ_BY_THEME[theme] || QUIZ_BY_THEME["historia"];
    // Rastreio global por tema — evita repetir a mesma pergunta em níveis diferentes com o mesmo tema
    if (!usedQuizByTheme[theme]) usedQuizByTheme[theme] = new Set();
    const usedGlobal = usedQuizByTheme[theme];
    if (usedGlobal.size >= pool.length) usedGlobal.clear(); // esgotou — reiniciar
    const candidates = pool.map((_,i) => i).filter(i => !usedGlobal.has(i));
    const pick = candidates.length > 0
      ? candidates[Math.floor(Math.random() * candidates.length)]
      : Math.floor(Math.random() * pool.length);
    usedGlobal.add(pick);
    if (!usedQuizByLevel[levelIdx]) usedQuizByLevel[levelIdx] = new Set();
    usedQuizByLevel[levelIdx].add(pick);
    return pool[pick];
  }

  // ===== "Sabias que…?" — 10 curiosidades sobre o Dia da Criança =====

  let pausedByTeacher = false;
  let _overlayPaused  = false; // true quando um overlay de consulta (mapa, conquistas, etc.) está aberto
  // true enquanto o Mapa/Conquistas está aberto por cima do ecrã de vitória (winOverlay
  // fica escondido nesse intervalo — ver botões "🗺️ Mapa"/"🏆 Conquistas" do winOverlay
  // e closeOverlay()). Sem isto, o overlay novo abria por trás do ecrã de vitória (mesmo
  // z-index, mas o winOverlay vem depois no HTML) e ficava invisível/impossível de usar.
  let _winOverlaySubOpen = false;

  function showHistory(levelIndex, onDone) {
    // HISTORY[] está alinhado com os 20 níveis "de direitos" (0-19), não com a
    // posição bruta na LEVELS (que inclui os bosses). Por isso resolvemos pelo
    // artIdx do nível — os bosses não têm artIdx, por isso simplesmente não mostram história.
    const Lh = LEVELS[levelIndex];
    const histIdx = (Lh && Lh.artIdx != null) ? Lh.artIdx : levelIndex;
    const entry = HISTORY[histIdx] || null;
    if (!entry) { awaitingQuiz=false; if (sceneRef) revealPlayerEntrance(sceneRef); onDone?.(); return; }
    awaitingStory = true;
    // Cancelar qualquer fala pendente do VanBerto's (ex: setTimeout do nível anterior)
    // para o balão não aparecer "pendurado" por cima do cartão "Sabias que...?".
    if (_vbTimer) { clearTimeout(_vbTimer); _vbTimer = null; }
    document.getElementById("vbSpeech")?.classList.remove("vb-show");
    historyText.innerHTML = `<strong class="history-title">${entry.title}</strong>\n${entry.text}`;
    historyOverlay.classList.remove("hidden");
    if (sceneRef) sceneRef.physics.pause();
    // Tap no fundo escuro (fora do cartão) também fecha — evita bloqueio em mobile
    historyOverlay.onclick = (e) => { if(e.target === historyOverlay) btnHistory.onclick?.(); };
    const _historyWatchdog = setTimeout(() => { if(!historyOverlay.classList.contains("hidden")) btnHistory.onclick?.(); }, 15000);
    btnHistory.onclick = () => {
      clearTimeout(_historyWatchdog);
      historyOverlay.onclick = null;
      historyOverlay.classList.add("hidden");
      awaitingStory = false;
      awaitingQuiz = false; // nível pronto a jogar — só agora desbloqueamos hits e porta
      // Rastrear leitura de curiosidade para conquistas e estatísticas
      onHistoryReadForAchievements(mapProgress.levelsCompleted.length);
      if(typeof globalStats !== "undefined") {
        globalStats.curiositiesRead += 1;
        saveGlobalStats();
      }
      if (sceneRef && !pausedByTeacher
          && startOverlay.classList.contains("hidden")
          && quizOverlay.classList.contains("hidden")) {
        sceneRef.physics.resume();
        revealPlayerEntrance(sceneRef);
      }
      onDone?.();
    };
  }

  // ===== Dicas =====

  // ===== Artigo da Convenção por tema =====

  // ===== Perguntas — 3 opções, 1 certa + explicação =====

  // ===== TEMAS visuais — colorido e alegre =====

  // ===== Níveis (10) =====

  // ===== MAPA DA AVENTURA — Fase 1 (agora com 4 mundos, cada um com o seu boss) =====
  // Agrupa os 20 níveis existentes em 4 mundos temáticos, em blocos contíguos.
  // Cada mundo só desbloqueia depois do anterior estar 100% concluído — ver
  // regionStatus()/isLastLevelOfRegion() mais abaixo.
  // =====================================================

  let mapProgress = { highestLevelReached: 0, levelsCompleted: [] };

  function loadMapProgress() {
    const d = loadNamespace("map", {});
    if (typeof d.highestLevelReached === "number") mapProgress.highestLevelReached = d.highestLevelReached;
    if (Array.isArray(d.levelsCompleted)) mapProgress.levelsCompleted = d.levelsCompleted;
  }
  function saveMapProgress() {
    saveNamespace("map", mapProgress);
  }
  loadMapProgress(); // carregar logo no arranque — disponível mesmo antes do Phaser iniciar
  // Chamado quando um nível é concluído (porta aberta com sucesso)
  function markLevelCompleted(idx) {
    if (!mapProgress.levelsCompleted.includes(idx)) mapProgress.levelsCompleted.push(idx);
    if (idx + 1 > mapProgress.highestLevelReached) mapProgress.highestLevelReached = idx + 1;
    saveMapProgress();
  }

  // Devolve a região (de MAP_REGIONS) a que um nível pertence, ou null se nenhuma
  // (ex.: níveis "soltos" ainda não atribuídos a nenhuma região).
  function regionForLevel(idx) {
    return MAP_REGIONS.find(r => r.levels.includes(idx)) || null;
  }

  // O jogo só avança automaticamente DENTRO do mesmo mundo. Ao terminar o
  // último nível de um mundo (com ou sem boss), o jogador volta sempre ao
  // mapa — só entra no mundo seguinte por escolha própria.
  function isLastLevelOfRegion(idx) {
    const r = regionForLevel(idx);
    return !!(r && r.levels.length && r.levels[r.levels.length - 1] === idx);
  }
  function celebrateWorldComplete(region, onDone) {
    if (!region) { onDone?.(); return; }
    ensureAudio(); SFX.win();
    playTitleCard({
      icon: region.icon,
      name: `${region.name} — Completo! 🎉`,
      sub: region.sub,
      lines: ["Mais um mundo protegido! Escolhe no mapa para onde vamos a seguir."]
    }, onDone);
  }

  function regionStatus(region) {
    if (region.levels.length === 0) return "done"; // Base — sempre acessível/concluída visualmente
    const allDone = region.levels.every(i => mapProgress.levelsCompleted.includes(i));
    const anyReachable = region.levels.some(i => i <= mapProgress.highestLevelReached);
    if (allDone) return "done";
    if (anyReachable) return "current";
    return "locked";
  }

  function renderMap() {
    const grid = document.getElementById("mapRegionsGrid");
    if (!grid) return;
    grid.innerHTML = "";
    let totalLevels = 0, totalDone = 0;
    MAP_REGIONS.forEach(region => {
      if (region.levels.length) totalLevels += region.levels.length;
    });
    totalDone = mapProgress.levelsCompleted.length;

    MAP_REGIONS.forEach(region => {
      const status = regionStatus(region);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `map-region map-region--${status}`;
      const doneCount = region.levels.filter(i => mapProgress.levelsCompleted.includes(i)).length;
      let badge = "";
      if (region.levels.length === 0) {
        badge = "🏠";
      } else if (status === "done") {
        badge = "✅ Completo";
      } else if (status === "current") {
        badge = `${doneCount}/${region.levels.length}`;
      } else {
        badge = "🔒";
      }
      btn.innerHTML = `
        <div class="map-region-icon">${region.icon}</div>
        <div class="map-region-body">
          <p class="map-region-name">${region.name}</p>
          <p class="map-region-sub">${region.sub}</p>
        </div>
        <div class="map-region-badge">${badge}</div>
      `;
      if (status === "locked") {
        btn.disabled = true;
      } else {
        btn.onclick = () => {
          ensureAudio(); SFX.coin();
          // Determina o primeiro nível por concluir nesta região (ou o último, se já tudo feito)
          let targetLevel = region.levels.find(i => !mapProgress.levelsCompleted.includes(i));
          if (targetLevel === undefined) targetLevel = region.levels[region.levels.length - 1] ?? 0;
          startLevelFromMap(targetLevel);
        };
      }
      grid.appendChild(btn);
    });

    const pct = totalLevels > 0 ? Math.round((totalDone / totalLevels) * 100) : 0;
    const pctEl = document.getElementById("mapProgressPct");
    const fillEl = document.getElementById("mapProgressFill");
    const starsEl = document.getElementById("mapStarsTotal");
    if (pctEl) pctEl.textContent = `${pct}%`;
    if (fillEl) fillEl.style.width = `${pct}%`;
    if (starsEl) starsEl.textContent = String(score || 0);
  }

  // Mostra o cartão de entrada de região (ícone + nome + 2 falas do VanBerto's)
  // antes da transição normal de nível — dá ao mapa um verdadeiro sentido de "mundo".
  function playRegionTitleCard(region, onComplete) {
    if (!region || !REGION_INTRO[region.id]) { onComplete?.(); return; }
    const intro = REGION_INTRO[region.id];
    playTitleCard({ icon: region.icon, name: region.name, sub: region.sub, lines: [intro.vanberto, intro.arrival] }, onComplete);
  }

  // Envolve playLevelTransition: se o próximo nível pertence a uma região diferente
  // da atual, mostra primeiro o cartão de título dessa região.
  function enterLevelWithStory(scene, nextIdx, onMidpoint, onComplete) {
    const prevRegion = regionForLevel(currentLevel);
    const newRegion = regionForLevel(nextIdx);
    const crossingRegion = newRegion && (!prevRegion || prevRegion.id !== newRegion.id) && newRegion.levels[0] === nextIdx;
    if (crossingRegion) {
      playRegionTitleCard(newRegion, () => playLevelTransition(scene, nextIdx, onMidpoint, onComplete));
    } else {
      playLevelTransition(scene, nextIdx, onMidpoint, onComplete);
    }
  }

  // Arranca (ou continua) o jogo Phaser diretamente num nível escolhido no mapa
  function startLevelFromMap(idx) {
    document.getElementById("mapOverlay")?.classList.add("hidden");
    startOverlay.classList.add("hidden");
    // Sem isto, _overlayPaused ficava preso a "true" (só closeOverlay() o repõe),
    // e o update() do jogo trava a velocidade do robot a 0 para sempre a partir
    // daqui — era por isso que o robot deixava de se mexer ao entrar num nível
    // escolhido no mapa (ex.: nível 6, logo a seguir a completar o Mundo 1).
    _overlayPaused = false;
    document.body.classList.add("game-started");
    const begin = () => {
      currentLevel = idx;
      const startTransition = () => playLevelTransition(sceneRef, idx,
        () => { loadLevel(sceneRef, idx); saveGame(); },
        () => { showHistory(idx, () => { if (!pausedByTeacher) sceneRef.physics.resume(); }); }
      );
      // Vindo do mapa, entrar numa região mostra sempre o seu cartão de título —
      // é literalmente o jogador a escolher "entrar" naquele mundo.
      playRegionTitleCard(regionForLevel(idx), startTransition);
    };
    if (!window.__dc_game) {
      initPhaser();
      const waitScene = setInterval(() => {
        if (sceneRef) {
          clearInterval(waitScene);
          if (playerNameHUD) {
            playerNameHUD.textContent = playerName ? `⭐ ${playerName}` : "";
            playerNameHUD.style.display = playerName ? "block" : "none";
          }
          begin();
        }
      }, 50);
    } else if (sceneRef) {
      begin();
    }
  }

  // Popup curto "Direito recuperado!" — mostrado ao concluir um nível
  // =====================================================
  // ===== SISTEMA DE ARTEFACTOS MÁGICOS =====
  // 20 artefactos únicos — um por direito recuperado.
  // Cada artefacto tem: emoji visual, nome curto, cor temática,
  // fala do VanBerto e conjunto temático para bónus.
  // =====================================================

  // Nomes dos conjuntos e bónus

  // Reacções extras do VanBerto ao completar cada conjunto

  let collectedArtefacts = {}; // { [artIdx]: true } — chave é o índice no ARTEFACTS (0-19), não a posição em LEVELS

  function loadArtefacts() {
    collectedArtefacts = loadNamespace("artefacts", {});
  }
  function saveArtefacts() {
    saveNamespace("artefacts", collectedArtefacts);
  }
  loadArtefacts();

  // =====================================================
  // ===== RESET COMPLETO DE PROGRESSO =====
  // Função única chamada por TODOS os pontos de "recomeçar" (menu inicial
  // "Começar", "Jogar de novo" no ecrã de vitória, "Jogar de novo" no
  // certificado, e "Apagar progresso" nas Estatísticas), para garantir que
  // todos têm exatamente o mesmo comportamento: mapa, álbum, conquistas,
  // estrelas e estatísticas globais voltam sempre a 0. Pensado para vários
  // alunos jogarem sucessivamente no mesmo dispositivo sem herdar o
  // progresso do jogador anterior.
  // =====================================================
  function resetAllProgress() {
    // Progresso do mapa da aventura
    mapProgress = { highestLevelReached: 0, levelsCompleted: [] };
    saveMapProgress();
    // Álbum dos Direitos
    collectedArtefacts = {};
    saveArtefacts();
    // Conquistas (achievements.js) — desbloqueios + contadores internos
    resetAchievements();
    // Estrelas por nível (stars.js)
    resetAllStars();
    // Estatísticas globais (tempo de jogo, inimigos, quiz, curiosidades…)
    if (typeof globalStats !== "undefined") {
      globalStats.totalPlayTime = 0;
      globalStats.enemiesDefeated = 0;
      globalStats.quizTotal = 0;
      globalStats.quizCorrect = 0;
      globalStats.quizWrong = 0;
      globalStats.curiositiesRead = 0;
      globalStats.starsCollectedTotal = 0;
      globalStats.levelsCompleted = 0;
      globalStats.gamesPlayed = 0;
      if (typeof saveGlobalStats === "function") saveGlobalStats();
    }
    // Preferência de som — mantém o comportamento anterior (reset também a apaga,
    // voltando ao som ligado por omissão); o alto contraste NÃO é tocado aqui.
    const s = loadNamespace("settings", {});
    delete s.muted;
    saveNamespace("settings", s);
    resetQuizStats();
    Object.keys(usedQuizByLevel).forEach(k => usedQuizByLevel[k].clear());
    Object.keys(usedQuizByTheme).forEach(k => usedQuizByTheme[k].clear());
  }

  // Verifica se um conjunto de 5 artefactos ficou completo agora
  function checkSetBonus(levelIdx) {
    const art  = ARTEFACTS[levelIdx];
    if (!art) return;
    const setId = art.set;
    const setLevels = ARTEFACTS.map((a,i) => a.set === setId ? i : -1).filter(i => i >= 0);
    const allDone = setLevels.every(i => collectedArtefacts[i]);
    if (!allDone) return;
    // Já tinha sido dado antes?
    const setBonusKey = `set_bonus_${setId}`;
    if (collectedArtefacts[setBonusKey]) return;
    collectedArtefacts[setBonusKey] = true;
    saveArtefacts();
    const setData = ARTEFACT_SETS[setId];
    score += setData.bonus;
    if (scoreText) scoreText.setText(`🌟 Pontos: ${score}`);
    // Mostrar popup de conjunto após 3.5s (depois do artefacto desaparecer)
    setTimeout(() => showSetBonusPopup(setId, setData), 3600);
  }

  // Popup de bónus de conjunto
  function showSetBonusPopup(setId, setData) {
    const el = document.getElementById("setBonusOverlay");
    if (!el) return;
    document.getElementById("sbIcon").textContent  = setData.icon;
    document.getElementById("sbName").textContent  = setData.name;
    document.getElementById("sbBonus").textContent = `+${setData.bonus} pontos`;
    document.getElementById("sbMsg").textContent   = SET_REACTIONS[setId] || "Fantástico!";
    el.classList.add("show");
    ensureAudio();
    // Som de fanfarra (acorde ascendente)
    [0,80,160,260].forEach((t,i) => setTimeout(() =>
      beep({freq:[700,900,1100,1400][i], dur:0.18, type:"triangle", vol:0.07, slideTo:[900,1100,1400,1800][i]}), t));
    setTimeout(() => el.classList.remove("show"), 3800);
  }

  // =====================================================
  // ===== POPUP ÉPICO DE ARTEFACTO =====
  // Substitui o showRightRecovered simples por uma
  // animação de 3.2s com artefacto, nome e fala do VanBerto.
  // =====================================================
  function showRightRecovered(levelIdx) {
    // ARTEFACTS[] e HISTORY[] estão alinhados pelos 20 níveis "de direitos" (0-19),
    // não pela posição bruta em LEVELS (que inclui os 3 bosses). Por isso usamos
    // o artIdx do nível para tudo o que é artefacto/história — levelIdx continua a
    // servir para tudo o que é específico da posição (LEVELS[], contador "Nível X").
    const L = LEVELS[levelIdx];
    const artIdx = (L && L.artIdx != null) ? L.artIdx : levelIdx;
    const art = ARTEFACTS[artIdx];
    if (!art) return;

    // Marcar como colectado e guardar
    collectedArtefacts[artIdx] = true;
    saveArtefacts();
    updateArtOrbs();

    const overlay = document.getElementById("artefactRevealOverlay");
    if (!overlay) return;

    // Conteúdo base
    document.getElementById("arRevEmoji").textContent  = art.emoji;
    document.getElementById("arRevName").textContent   = art.name;
    document.getElementById("arRevShort").textContent  = "✅ Desbloqueado";

    // Artigo da Convenção
    const articleEl = document.getElementById("arRevArticle");
    const article = L ? (QUIZ_ARTICLE[L.quizTheme] || null) : null;
    if (articleEl) {
      if (article) {
        articleEl.textContent = "📋 " + article;
        articleEl.style.display = "";
      } else {
        articleEl.style.display = "none";
      }
    }

    // Curiosidade — texto breve do HISTORY
    const curioEl = document.getElementById("arRevCurio");
    const hist = HISTORY[artIdx];
    if (curioEl && hist) {
      // Primeira frase do texto histórico (até ao primeiro ponto final)
      const firstSentence = hist.text.split(/\.\s/)[0] + ".";
      curioEl.textContent = "💡 " + firstSentence;
      curioEl.style.display = "";
    } else if (curioEl) {
      curioEl.style.display = "none";
    }

    // Estatísticas: pontos ganhos + nível
    const statsEl = document.getElementById("arRevStats");
    if (statsEl) {
      const total = Object.values(collectedArtefacts).filter(Boolean).length;
      statsEl.innerHTML =
        "🌟 +" + (score > 0 ? score : "—") + " pontos &nbsp;|&nbsp; " +
        "🏅 " + total + "/20 direitos &nbsp;|&nbsp; " +
        "📊 Nível " + (levelIdx + 1);
      statsEl.style.display = "";
    }

    // Fala do VanBerto
    document.getElementById("arRevSpeech").textContent = "“" + art.vanberto + "”";

    // Cor temática
    overlay.style.setProperty("--art-color", art.color);
    overlay.style.setProperty("--art-glow",  art.glow);

    overlay.classList.add("show");
    ensureAudio();
    [0,110,230,370,540].forEach((t,i) => setTimeout(() =>
      beep({freq:[440,554,660,880,1100][i], dur:0.14, type:"triangle", vol:0.07, slideTo:[554,660,880,1100,1400][i]}), t));
    spawnArtefactParticles(overlay, art.color);

    // Fechar pelo botão OU após 7s (mais tempo para ler)
    let _closed = false;
    function _closeReveal() {
      if (_closed) return; _closed = true;
      overlay.classList.remove("show");
      checkSetBonus(artIdx);
    }
    const btn = document.getElementById("arRevClose");
    if (btn) { btn.onclick = _closeReveal; }
    setTimeout(_closeReveal, 7000);
  }

  // Partículas de CSS no popup do artefacto
  function spawnArtefactParticles(container, color) {
    const host = document.getElementById("arRevParticles");
    if (!host) return;
    host.innerHTML = "";
    for (let i = 0; i < 18; i++) {
      const p = document.createElement("div");
      const angle = (i / 18) * 360;
      const dist  = 55 + Math.random() * 45;
      const size  = 5 + Math.random() * 7;
      const dur   = 0.6 + Math.random() * 0.5;
      const delay = Math.random() * 0.25;
      p.style.cssText = `
        position:absolute; width:${size}px; height:${size}px;
        border-radius:50%; background:${color};
        left:50%; top:50%;
        box-shadow:0 0 6px ${color};
        animation:artParticleBurst ${dur}s ${delay}s ease-out forwards;
        --ax:${Math.cos(angle*Math.PI/180)*dist}px;
        --ay:${Math.sin(angle*Math.PI/180)*dist}px;
      `;
      host.appendChild(p);
    }
  }

  // =====================================================
  // ===== HUD DE ORBES — faixa de artefactos no jogo =====
  // 20 orbes pequenos no canto inferior, em Phaser.
  // =====================================================
  let _artOrbsEl=null;
  function createArtOrbs(scene){
    if(_artOrbsEl){_artOrbsEl.remove();_artOrbsEl=null;}
    const strip=document.createElement("div");strip.id="artOrbsHUD";
    strip.style.cssText="position:fixed;bottom:6px;left:50%;transform:translateX(-50%);display:flex;gap:3px;align-items:center;z-index:110;pointer-events:none;";
    document.body.appendChild(strip);_artOrbsEl=strip;updateArtOrbs();
  }
  function updateArtOrbs(){
    if(!_artOrbsEl)return;_artOrbsEl.innerHTML="";
    // Percorrer LEVELS (ordem física, Nível 1→20) em vez de ARTEFACTS (ordem
    // fixa por artIdx) — desde a reorganização em 4 mundos, essas duas ordens
    // já não coincidem para vários níveis (ex: "Nível 4 — Participação" tem
    // artIdx:7). Sem isto, o orbe de um nível aparecia na posição do seu
    // artIdx antigo em vez da posição do nível a que agora corresponde.
    LEVELS.forEach((L)=>{
      const i=L.artIdx; if(i==null) return;
      const art=ARTEFACTS[i]; if(!art) return;
      const got=!!collectedArtefacts[i],orb=document.createElement("div");orb.title=art.name;
      if(got){
        // THEMES[i] (não L.theme) — theme e artIdx são sempre o mesmo valor
        // em data-levels.js, por isso THEMES[i] dá sempre a cor certa.
        const theme=THEMES[i]??THEMES[0];
        const skyCol="#"+theme.skyBot.toString(16).padStart(6,"0");
        const grassCol="#"+theme.grassTop.toString(16).padStart(6,"0");
        orb.style.cssText="width:18px;height:18px;border-radius:50%;background:"+skyCol+";box-shadow:0 0 5px "+grassCol+"99,0 0 2px rgba(255,255,255,0.5) inset;border:1.5px solid "+grassCol+";display:flex;align-items:center;justify-content:center;font-size:10px;line-height:1;";
        orb.textContent=art.emoji;
      }else{
        orb.style.cssText="width:18px;height:18px;border-radius:50%;background:rgba(30,30,60,0.55);border:1px solid rgba(100,100,140,0.35);display:flex;align-items:center;justify-content:center;font-size:9px;line-height:1;color:rgba(120,120,160,0.5);";
        orb.textContent="·";
      }
      _artOrbsEl.appendChild(orb);
    });
  }

  // =====================================================
  // ===== GALERIA FINAL =====
  // Mostrada antes do winOverlay — desfila todos os artefactos.
  // =====================================================
  function showArtefactGallery(onDone) {
    const overlay = document.getElementById("artefactGalleryOverlay");
    if (!overlay) { onDone?.(); return; }

    const grid = document.getElementById("agGrid");
    if (grid) {
      grid.innerHTML = "";
      ARTEFACTS.forEach((art, i) => {
        const got = !!collectedArtefacts[i];
        const cell = document.createElement("div");
        cell.className = "ag-cell" + (got ? " ag-cell--got" : " ag-cell--miss");
        cell.style.setProperty("--art-color", art.color);
        cell.style.setProperty("--art-glow",  art.glow);
        cell.style.animationDelay = (i * 60) + "ms";
        cell.innerHTML = `
          <div class="ag-emoji">${got ? art.emoji : "🔒"}</div>
          <div class="ag-name">${got ? art.short : "?"}</div>
        `;
        // Tooltip com fala ao hover (desktop)
        if (got) cell.title = art.vanberto;
        grid.appendChild(cell);
      });
    }

    const total = ARTEFACTS.length;
    const got   = Object.keys(collectedArtefacts).filter(k => !k.includes("set_")).length;
    const pctEl = document.getElementById("agPct");
    if (pctEl) pctEl.textContent = `${got}/${total} direitos recuperados`;

    overlay.classList.remove("hidden");
    overlay.classList.add("show");
    ensureAudio();
    // Fanfarra final
    [0,150,300,500,700,950].forEach((t,i) =>
      setTimeout(() => beep({freq:[440,550,660,880,1100,1320][i], dur:0.2, type:"triangle", vol:0.07, slideTo:[550,660,880,1100,1320,1600][i]}), t));

    document.getElementById("btnAgContinue")?.addEventListener("click", () => {
      overlay.classList.remove("show");
      overlay.classList.add("hidden");
      onDone?.();
    }, { once: true });
  }

  // =====================================================
  // ===== ÁLBUM DOS DIREITOS — Fase 2 =====
  // Cada direito desbloqueado (= nível concluído) gera uma carta,
  // usando os dados já existentes em HISTORY e QUIZ_ARTICLE.
  // =====================================================
  function renderAlbum() {
    const grid = document.getElementById("albumGrid");
    if (!grid) return;
    grid.innerHTML = "";
    let unlockedCount = 0;
    const normalLevels = LEVELS.map((L, idx) => ({ L, idx }));
    normalLevels.forEach(({ L, idx }) => {
      const artIdx = (L.artIdx != null) ? L.artIdx : idx;
      const entry = HISTORY[artIdx];
      const unlocked = mapProgress.levelsCompleted.includes(idx);
      if (unlocked) unlockedCount += 1;
      const card = document.createElement("div");
      card.className = `album-card ${unlocked ? "album-card--unlocked" : "album-card--locked"}`;
      const stars = starsForLevel(idx);
      const starsHTML = unlocked
        ? `<p class="album-card-stars">${"⭐".repeat(stars)}${"☆".repeat(3 - stars)}</p>`
        : "";
      if (unlocked && entry) {
        const article = QUIZ_ARTICLE[L.quizTheme];
        const artEmoji = ARTEFACTS[artIdx]?.emoji || entry.title.split(" ")[0];
        card.innerHTML = `
          <div class="album-card-icon">${artEmoji}</div>
          <p class="album-card-name">${entry.title}</p>
          ${article ? `<p class="album-card-article">📜 ${article}</p>` : ""}
          <p class="album-card-desc">${entry.text}</p>
          <p class="album-card-more">👆 Toca para ler tudo</p>
          ${starsHTML}
        `;
        card.onclick = () => {
          const expanding = !card.classList.contains("album-card--expanded");
          card.classList.toggle("album-card--expanded", expanding);
          const moreEl = card.querySelector(".album-card-more");
          if (moreEl) moreEl.textContent = expanding ? "👆 Toca para fechar" : "👆 Toca para ler tudo";
        };
      } else {
        card.innerHTML = `
          <div class="album-card-icon">🔒</div>
          <p class="album-card-name">Direito por descobrir</p>
          <p class="album-card-desc">Recupera este direito para desbloquear a carta.</p>
        `;
      }
      grid.appendChild(card);
    });
    const pct = Math.round((unlockedCount / normalLevels.length) * 100);
    const pctEl = document.getElementById("albumProgressPct");
    const fillEl = document.getElementById("albumProgressFill");
    if (pctEl) pctEl.textContent = `${pct}%`;
    if (fillEl) fillEl.style.width = `${pct}%`;
  }

  // ===== Phaser =====
  let sceneRef=null, currentLevel=0;
  let shadowGfx;
  let powerHaloGfx;
  let sunAngle = 0;
  let trailSprites = [];
  let balloons=[], critters=[], enemyTimers=[];
  let bossTimers=[];
  let movingPlatforms=[], trampolines=[], secretDoors=[], hazards=[];
  let currentSign = null; // { x,y,obj,badge,triggered,text } — letreiro/NPC do nível atual
  let player, platforms, itemsGroup, malwareGroup, door, doorOverlap=null;
  // Janela (timestamp de scene.time.now) durante a qual applyVanBertoTexture() não deve
  // substituir a textura — usada pelo piscar de olhos idle e pelo pisca-olho ao toque,
  // para não serem imediatamente sobrepostos pela animação normal no frame seguinte.
  let _eyeOverrideUntil = 0;
  // Fase "entrada visível só quando o jogo arranca": loadLevel() já posiciona
  // e alinha o VanBerto's ao chão, mas mantém-no invisível (alpha 0). A
  // animação de "pop" (fade-in + estica-encolhe) só corre quando o "Sabias
  // que...?" fecha e o jogo arranca de verdade — ver revealPlayerEntrance(),
  // chamada a partir de showHistory(). Isto evita qualquer desalinhamento
  // visível ENQUANTO a física está pausada (nesse período nada corrige a
  // posição automaticamente, ao contrário do que acontece já em jogo).
  let _pendingEntranceReveal = false;
  let cursors, keySpace, keyS;
  let isCrouching = false; // ===== Agachar — nova funcionalidade =====
  let hudText, scoreText, heartsGfx, tipText, itemCountText;
  let progressBg, progressFill, powerIndicator, playerNameHUD;
  let pauseOverlayGfx, pauseVanImg, pauseLabel;
  let transitionGfx, transitionLabel;
  let score=0, lives=3, livesLostThisLevel=0;
  const MAX_LIVES=5;
  let itemsCollected=0, itemsTotal=0;
  let extraShieldCounted=false; // garante que o escudo extra (spawnShields) só entra no total UMA vez por nível
  let collectedItemIndices=new Set(); // índices dos itens já apanhados neste nível
  let _hudDirty=true; // flag: só redesenha HUD quando algo mudou
  let touch={left:false,right:false,jump:false,crouch:false};
  let awaitingQuiz=false, awaitingStory=false;
  let _doorWatchdogTimer=null, _landingCheckTimer=null, _levelAtDoorTrigger=-1;
  let powered=false, poweredTimer=null, powerCountdown=null, invuln=false;
  let starPower=false, starPowerTimer=null, starPowerCountdown=null, starPowerCountVal=0;
  let doubleJumpActive=false, doubleJumpUsed=false; // duplo salto power-up
  // Coyote time + buffer de salto — torna o salto mais "justo" para as crianças
  let coyoteUntil=0, jumpBufferedUntil=0;
  const COYOTE_MS=110, JUMP_BUFFER_MS=130;
  let currentLevelTip = "⭐ Apanha estrelas e chega ao Portal ✨!";
  const GRAVITY=1100;

  const config = {
    type: Phaser.AUTO,
    width: 960, height: 540,
    parent: "game",
    backgroundColor: "#000000",
    transparent: true,
    physics: { default:"arcade", arcade:{ gravity:{y:GRAVITY}, debug:false, overlapBias:12, tileBias:32 } },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 960, height: 540
    },
    scene: { preload, create, update }
  };

  function preload() {
    // PNG externa desativada: a imagem vanberto_voar.png não é quadrada (420×537px)
    // e o jogo força-a num quadrado 72×72, o que a deixa esticada/distorcida.
    // Por isso usamos sempre o robô desenhado em Canvas ("vanberto_open"), que é
    // o que aparece corretamente tanto localmente como online.
    // this.load.image("vanberto_png", "vanberto_voar.png");
  }

  function initPhaser() {
    if (window.__dc_game) return;
    const game = new Phaser.Game(config);
    window.__dc_game = game;
  }

  function create() {
    sceneRef = this;
    cursors  = this.input.keyboard.createCursorKeys();
    keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    keyS     = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S); // tecla alternativa para agachar
    // Impede o browser de fazer scroll da página com as setas — ↓ agora tem
    // função no jogo (agachar), por isso a captura evita "tremor" da página
    // tal como já acontecia com as outras setas.
    this.input.keyboard.addCapture([
      Phaser.Input.Keyboard.KeyCodes.UP, Phaser.Input.Keyboard.KeyCodes.DOWN,
      Phaser.Input.Keyboard.KeyCodes.LEFT, Phaser.Input.Keyboard.KeyCodes.RIGHT,
      Phaser.Input.Keyboard.KeyCodes.SPACE
    ]);

    this.physics.world.setBounds(0, 0, 2600, 514);
    this.cameras.main.setBounds(0, 0, 2600, 540);

    makeTextures(this);
    initBackground(this);

    shadowGfx = this.add.graphics().setDepth(1);
    powerHaloGfx = this.add.graphics().setDepth(2);

    // HUD
    hudText      = this.add.text(14, 10, "", { fontSize:"16px", fontStyle:"900", color:"#fff5e0", stroke:"#200040", strokeThickness:4 }).setScrollFactor(0).setDepth(100);
    scoreText    = this.add.text(14, 32, "", { fontSize:"14px", fontStyle:"900", color:"#ffd700", stroke:"#200040", strokeThickness:3 }).setScrollFactor(0).setDepth(100);
    // Nome do jogador — elemento HTML fixo (não Phaser), acima de tudo
    playerNameHUD = document.getElementById("playerNameHtml");
    heartsGfx    = this.add.graphics().setScrollFactor(0).setDepth(100);
    tipText      = this.add.text(14, 74, "", { fontSize:"13px", fontStyle:"800", color:"#ff6b35", stroke:"#fff5e0", strokeThickness:3 }).setScrollFactor(0).setDepth(100);
    itemCountText= this.add.text(14, 92, "", { fontSize:"12px", fontStyle:"800", color:"#fff5e0", stroke:"#200040", strokeThickness:2 }).setScrollFactor(0).setDepth(100);

    progressBg   = this.add.graphics().setScrollFactor(0).setDepth(100);
    progressFill = this.add.graphics().setScrollFactor(0).setDepth(100);
    progressBg.fillStyle(0x000000, 0.20);
    progressBg.fillRoundedRect(8, 110, 230, 10, 5);

    powerIndicator = this.add.text(960-14, 52, "", { fontSize:"14px", fontStyle:"900", color:"#ffd700", stroke:"#200040", strokeThickness:4 }).setScrollFactor(0).setDepth(102).setOrigin(1,0);

    // ── HUD de orbes dos artefactos ────────────────────────────────
    createArtOrbs(this);

    // Assinatura da professora — dentro da faixa castanha do chão, muito subtil
    this.add.text(960-8, 536, "Professora Vanda Várzea", {
      fontSize:"8px", fontStyle:"italic", color:"#f5d9a8",
      stroke:"#3a1a00", strokeThickness:1
    }).setScrollFactor(0).setDepth(100).setOrigin(1,1).setAlpha(0.55);

    pauseOverlayGfx = this.add.graphics().setScrollFactor(0).setDepth(500);
    // pauseVanImg e pauseLabel removidos — substituídos pelo overlay HTML #pauseInfoOverlay

    transitionGfx   = this.add.graphics().setScrollFactor(0).setDepth(800).setAlpha(0);
    transitionLabel = this.add.text(480, 270, "", { fontSize:"32px", fontStyle:"900", color:"#ffd700", stroke:"#200040", strokeThickness:8, align:"center" }).setOrigin(0.5).setScrollFactor(0).setDepth(801).setAlpha(0);

    platforms    = this.physics.add.staticGroup();
    itemsGroup   = this.physics.add.group({ allowGravity:false });
    malwareGroup = this.physics.add.group();

    // Usar a PNG original do VanBerto's como sprite de jogo se disponível,
    // senão cair no Canvas gerado como fallback
    const vanKey = this.textures.exists("vanberto_png") ? "vanberto_png" : "vanberto_open";
    player = this.physics.add.sprite(480, 460, vanKey);
    // Redimensionar a PNG para 72×72 no jogo (tamanho visual idêntico ao Canvas anterior)
    if (vanKey === "vanberto_png") {
      player.setDisplaySize(72, 72);
      player.body.setSize(44, 52);
      player.body.setOffset(
        (player.width  - 44) / 2,
        (player.height - 52) / 2 + 4
      );
    } else {
      player.setCollideWorldBounds(true);
      player.body.setSize(44, 48);
      player.body.setOffset(26, 46);
    }
    player.setCollideWorldBounds(true);
    // Guardar se está a usar a PNG para ajustar animações
    player.setData("usingPng", vanKey === "vanberto_png");

    // Tocar/clicar no VanBerto's faz-lhe um pisca-olho — pequena interação
    // divertida, sem qualquer efeito na jogabilidade (score, vidas, etc.).
    player.setInteractive({ useHandCursor: true });
    player.on("pointerdown", () => triggerVanBertoWink(this));

    this.physics.add.collider(player, platforms);
    this.physics.add.overlap(player, itemsGroup, onCollectItem, null, this);
    this.physics.add.collider(malwareGroup, platforms);
    this.physics.add.overlap(player, malwareGroup, (p,m)=>onHitMalware(p,m), null, this);

    // Lerp 1.0 = snap instantâneo; loadLevel repõe 0.08 após posicionar
    this.cameras.main.startFollow(player, true, 1.0, 1.0);
    this.cameras.main.setDeadzone(140, 90);

    // Pausar a física e escoder o VanBerto's já aqui, logo após a criação —
    // sem isto, entre este ponto e a chamada a loadLevel() (que só acontece
    // ~350ms depois, no midpoint do ecrã de transição) a gravidade já estava
    // a puxar o robô para baixo sem nenhuma plataforma criada ainda, e via-se
    // essa queda por trás do overlay de transição enquanto ele ainda estava
    // semitransparente (fade de 0→1 em 300ms). loadLevel() já pausa a física
    // de novo (idempotente) e showHistory() é quem sempre a resume — este
    // pause() extra só cobre a janela entre create() e o primeiro loadLevel().
    player.setAlpha(0);
    this.physics.pause();

    createTouchInput(this);
    scheduleBlink(this);
    loadGame();
    btnMute.textContent = isMuted() ? "🔇 Som: OFF" : "🔊 Som: ON";
    // Level loaded by btnStart

    if (btnPause && btnRestart) {
      btnPause.onclick = () => {
        if (!sceneRef) return;
        pausedByTeacher = !pausedByTeacher;
        if (pausedByTeacher) {
          sceneRef.physics.pause(); btnPause.textContent = "▶ Continuar"; showPauseScreen(true);
        } else {
          if (!awaitingQuiz && startOverlay.classList.contains("hidden") && historyOverlay.classList.contains("hidden"))
            sceneRef.physics.resume();
          btnPause.textContent = "⏸ Pausa"; showPauseScreen(false);
        }
      };
      btnRestart.onclick = () => {
        if (!sceneRef) return;
        const lvlName = LEVELS[currentLevel]?.name || `Nível ${currentLevel+1}`;
        if (!confirm(`⚠️ Reiniciar o ${lvlName}?\nO progresso neste nível perde-se.`)) return;
        pausedByTeacher=false; btnPause.textContent="⏸ Pausa"; showPauseScreen(false);
        quizOverlay.classList.add("hidden"); btnCloseQuiz.classList.add("hidden");
        historyOverlay.classList.add("hidden");
        // Matar todos os tweens pendentes (porta e robot) para evitar que callbacks antigos
        // disparem showQuiz no nível novo se o botão for pressionado durante a animação da porta
        try { sceneRef.tweens.killAll(); } catch {}
        _doorAnimRunning = false;
        touch.left=touch.right=touch.jump=touch.crouch=false;
        loadLevel(sceneRef,currentLevel);
        showHistory(currentLevel, () => { awaitingQuiz=false; if(!pausedByTeacher) sceneRef.physics.resume(); });
        saveGame();
      };
    }

    if (btnRestartGame) {
      btnRestartGame.onclick = () => {
        if (!sceneRef) return;
        pausedByTeacher=false; btnPause.textContent="⏸ Pausa"; showPauseScreen(false);
        quizOverlay.classList.add("hidden"); btnCloseQuiz.classList.add("hidden");
        historyOverlay.classList.add("hidden");
        // Matar todos os tweens pendentes antes de reiniciar
        try { sceneRef.tweens.killAll(); } catch {}
        _doorAnimRunning = false;
        touch.left=touch.right=touch.jump=touch.crouch=false;
        score=0; lives=3; livesLostThisLevel=0;
        resetQuizStats(); Object.keys(usedQuizByLevel).forEach(k=>usedQuizByLevel[k].clear()); Object.keys(usedQuizByTheme).forEach(k=>usedQuizByTheme[k].clear());
        scoreText.setText(`🌟 Pontos: ${score}`); updateHearts();
        loadLevel(sceneRef,0);
        showHistory(0, () => { awaitingQuiz=false; if(!pausedByTeacher) sceneRef.physics.resume(); });
        saveGame();
      };
    }

    // Botão "Ir para nível" — seletor de nível para a professora (protegido por PIN)
    const TEACHER_PIN = "3583";
    const btnGoToLevel = document.getElementById("btnGoToLevel");
    if (btnGoToLevel) {
      btnGoToLevel.onclick = () => {
        if (!sceneRef) return;
        const pin = prompt("🔒 Código da professora:");
        if (pin === null) return;
        if (pin !== TEACHER_PIN) { alert("❌ Código incorreto."); return; }
        const levelNames = LEVELS.map((l,i)=>`${i+1}. ${l.name.replace(/^Nível \d+\s*[—–-]\s*/,"")}`).join("\n");
        const input = prompt(
          `🎯 Ir para qual nível? (1-${LEVELS.length})\n\n${levelNames}`,
          String(currentLevel + 1)
        );
        if (input === null) return; // cancelou
        const idx = parseInt(input, 10) - 1;
        if (isNaN(idx) || idx < 0 || idx >= LEVELS.length) {
          alert(`❌ Nível inválido. Escolhe entre 1 e ${LEVELS.length}.`); return;
        }
        pausedByTeacher=false; btnPause.textContent="⏸ Pausa"; showPauseScreen(false);
        quizOverlay.classList.add("hidden"); btnCloseQuiz.classList.add("hidden");
        historyOverlay.classList.add("hidden"); awaitingQuiz=false;
        // Cancelar timers da porta antes de mudar de nível
        if(_doorWatchdogTimer){ try{_doorWatchdogTimer.remove(false);}catch{} _doorWatchdogTimer=null; }
        if(_landingCheckTimer){ try{_landingCheckTimer.remove(false);}catch{} _landingCheckTimer=null; }
        // Remover overlap da porta antiga antes da transição para evitar disparo acidental
        if(doorOverlap){ try{ sceneRef.physics.world.removeCollider(doorOverlap); }catch{} doorOverlap=null; }
        touch.left=touch.right=touch.jump=touch.crouch=false;
        livesLostThisLevel=0;
        sceneRef.physics.resume();
        playLevelTransition(sceneRef, idx,
          () => { loadLevel(sceneRef, idx); saveGame(); },
          () => { showHistory(idx, () => { if(!pausedByTeacher) sceneRef.physics.resume(); }); }
        );
      };
    }


    // Botão "Mapa" — disponível durante o jogo, pausa a física e mostra o mapa por cima
    const btnInGameMap = document.getElementById("btnInGameMap");
    if (btnInGameMap) {
      btnInGameMap.onclick = () => {
        if (!sceneRef) return;
        openOverlay("mapOverlay", renderMap);
      };
    }

    // Botões de acesso rápido durante o jogo — usam as funções globais expostas via window.__vb_*
    const _quickBtn = (id, fn) => {
      const el = document.getElementById(id);
      if (el) el.onclick = () => { if (fn) fn(); };
    };
    _quickBtn("btnInGameAchievements", () => window.__vb_openAchievements?.());
    _quickBtn("btnInGameAlbum",        () => window.__vb_openAlbum?.());
    _quickBtn("btnInGameStats",        () => window.__vb_openStats?.());
    _quickBtn("btnInGameOptions",      () => window.__vb_openOptions?.());
    _quickBtn("btnInGameHow",          () => window.__vb_openHow?.());

    // Botão hamburger mobile — abre/fecha painel suspenso
    const btnTeacherMenu = document.getElementById("btnTeacherMenu");
    const teacherMenuPanel = document.getElementById("teacherMenuPanel");
    if (btnTeacherMenu && teacherMenuPanel) {
      btnTeacherMenu.onclick = (e) => {
        e.stopPropagation();
        teacherMenuPanel.classList.toggle("open");
        if (teacherMenuPanel.classList.contains("open")) {
          // Pausar a física enquanto o menu está aberto
          _overlayPaused = true;
          if (sceneRef && startOverlay.classList.contains("hidden")) sceneRef.physics.pause();
          touch.left = touch.right = touch.jump = touch.crouch = false;

          // Injectar badges de progresso em tempo real
          const _badge = (id, text) => {
            const el = document.getElementById(id);
            if (!el) return;
            el.querySelector(".tmenu-badge")?.remove();
            if (text) {
              const b = document.createElement("span");
              b.className = "tmenu-badge";
              b.textContent = text;
              el.appendChild(b);
            }
          };
          const mapPct = LEVELS.length > 0
            ? Math.round((mapProgress.levelsCompleted.length / LEVELS.length) * 100) : 0;
          _badge("mBtnMap", mapPct + "%");
          const achvDone = ACHIEVEMENTS_DEFS.filter(a => unlockedAchievements[a.id]).length;
          _badge("mBtnAchievements", achvDone + "/" + ACHIEVEMENTS_DEFS.length);
          _badge("mBtnAlbum", mapProgress.levelsCompleted.length + "/" + LEVELS.length);
          _badge("mBtnStats", "⭐ " + totalStarsEarned() + "/" + (LEVELS.length * 3));
          const mBtnPauseEl = document.getElementById("mBtnPause");
          if (mBtnPauseEl) mBtnPauseEl.textContent = (pausedByTeacher ? "▶ Continuar" : "⏸ Pausa");
        } else {
          // Retomar ao fechar o menu
          _overlayPaused = false;
          if (sceneRef && startOverlay.classList.contains("hidden")
              && !pausedByTeacher && !awaitingQuiz && !awaitingStory
              && quizOverlay.classList.contains("hidden")
              && historyOverlay.classList.contains("hidden")) {
            sceneRef.physics.resume();
          }
        }
      };
      // Fechar ao clicar fora — e retomar a física
      document.addEventListener("click", (e) => {
        if (!teacherMenuPanel.contains(e.target) && e.target !== btnTeacherMenu) {
          if (teacherMenuPanel.classList.contains("open")) {
            teacherMenuPanel.classList.remove("open");
            _overlayPaused = false;
            if (sceneRef && startOverlay.classList.contains("hidden")
                && !pausedByTeacher && !awaitingQuiz && !awaitingStory
                && quizOverlay.classList.contains("hidden")
                && historyOverlay.classList.contains("hidden")) {
              sceneRef.physics.resume();
            }
          }
        }
      });
      // Ligar botões do painel aos originais
      const mirror = (mId, origId) => {
        const m = document.getElementById(mId);
        const o = document.getElementById(origId);
        if (m && o) m.onclick = () => { o.click(); teacherMenuPanel.classList.remove("open"); };
      };      mirror("mBtnFullscreen", "btnFullscreenGame");
      mirror("mBtnTouch",      "btnTouchToggle");
      mirror("mBtnPause",      "btnPause");
      mirror("mBtnMap",        "btnInGameMap");
      mirror("mBtnLevel",      "btnRestartLevel");
      mirror("mBtnGoToLevel",  "btnGoToLevel");
      mirror("mBtnRestart",    "btnRestartGame");

      // Botões de acesso rápido — chamam diretamente as funções expostas
      const _panelBtn = (id, fn) => {
        const el = document.getElementById(id);
        if (el) el.onclick = () => { teacherMenuPanel.classList.remove("open"); fn?.(); };
      };
      _panelBtn("mBtnAchievements", () => window.__vb_openAchievements?.());
      _panelBtn("mBtnAlbum",        () => window.__vb_openAlbum?.());
      _panelBtn("mBtnStats",        () => window.__vb_openStats?.());
      _panelBtn("mBtnOptions",      () => window.__vb_openOptions?.());
      _panelBtn("mBtnHow",          () => window.__vb_openHow?.());
    }
  }

  // Dicas de pausa rotativas
  let _pauseTipIdx = 0;

  function showPauseScreen(on) {
    const overlay = document.getElementById("pauseInfoOverlay");
    if (!overlay) return;
    if (pauseOverlayGfx) {
      if (on) {
        pauseOverlayGfx.clear();
        pauseOverlayGfx.fillStyle(0x000000, 0.55);
        pauseOverlayGfx.fillRect(0, 0, 960, 540);
      } else {
        pauseOverlayGfx.clear();
      }
    }
    if (on) {
      const lvl = currentLevel + 1;
      const lvlName = (typeof LEVELS !== "undefined" && LEVELS[currentLevel]?.name) ? LEVELS[currentLevel].name : `Nível ${lvl}`;
      const total = (typeof LEVELS !== "undefined") ? LEVELS.length : 20;
      const el = id => document.getElementById(id);
      if (el("pauseLevel"))    el("pauseLevel").textContent    = lvlName;
      if (el("pauseScore"))    el("pauseScore").textContent    = score ?? 0;
      if (el("pauseLives"))    el("pauseLives").textContent    = (lives ?? 3) + " ❤️".repeat(Math.min(lives ?? 3, 5)).replace(/ /g,"");
      if (el("pauseProgress")) el("pauseProgress").textContent = `${lvl} / ${total}`;
      // Dica contextual: priorizar dicas dos níveis especiais
      let tipIdx;
      if (currentLevel === 6)  tipIdx = 8;  // nível trampolins (Direito ao Brincar) — atualizado depois de mover este nível para o Reino da Educação
      else if (currentLevel === 17) tipIdx = 10; // nível esteira (Direito à Inclusão) — corrigido: estava a apontar para o índice 19 (Direitos Digitais), que não tem esta mecânica
      else { _pauseTipIdx = (_pauseTipIdx + 1) % 8; tipIdx = _pauseTipIdx; }
      if (el("pauseTip")) el("pauseTip").innerHTML = PAUSE_TIPS[tipIdx];
      overlay.classList.remove("hidden");
      document.body.classList.add("overlay-open");
    } else {
      overlay.classList.add("hidden");
      document.body.classList.remove("overlay-open");
    }
  }

  // ===== UPDATE =====
  function updateCritters() {
    if(player){
      const px=player.x, py=player.y;
      const now=sceneRef.time.now*0.001;
      critters.forEach(c=>{
        if(c.collected||!c.sprite||!c.sprite.active) return;

        // Garantir velocidade mínima robusta — nunca ficam paradas
        if(Math.abs(c.speedX) < 0.7) c.speedX = (c.speedX >= 0 ? 1 : -1) * 0.7;
        if(Math.abs(c.speedY) < 0.5) c.speedY = (c.speedY >= 0 ? 1 : -1) * 0.5;
        // Acumular angulo proprio por critter
        if(c.angle === undefined) c.angle = c.phase;
        c.angle += c.isBee ? 0.06 : 0.04;
        c.x += c.speedX;
        c.y += c.speedY * Math.sin(c.angle);
        // Rebater nas bordas
        if(c.x < 40) { c.x=40; c.speedX=Math.abs(c.speedX); }
        if(c.x > c.worldW-40) { c.x=c.worldW-40; c.speedX=-Math.abs(c.speedX); }
        if(c.y < 30)  { c.y=30;  c.speedY= Math.abs(c.speedY); }
        if(c.y > 310) { c.y=310; c.speedY=-Math.abs(c.speedY); }
        const sc=c.isBee?0.75:0.80;
        // Batimento de asas — scaleY oscilante
        const wingFlap=1+Math.sin(now*(c.isBee?18:9)+c.wingPhase)*(c.isBee?0.18:0.12);
        c.sprite.setFlipX(c.speedX < 0);
        c.sprite.setScale(sc, sc*wingFlap);
        c.sprite.setPosition(c.x, c.y);
        // Colisao com o jogador — hitbox ligeiramente maior para facilitar apanhar
        const pb=player.body;
        if(pb.right>c.x-32&&pb.left<c.x+32&&pb.bottom>c.y-26&&pb.top<c.y+26){
          c.collected=true; c.sprite.destroy(); c.sprite=null;
          const pts=c.isBee?15:10;
          score+=pts; scoreText.setText(`🌟 Pontos: ${score}`);
          showFloat(sceneRef,px,py-68,c.isBee?`🐝 Abelha +${pts}`:`🦋 Borboleta +${pts}`,c.isBee?"#ffd700":"#ff80c0");
          if(Math.random()<0.4) showFloat(sceneRef,px,py-100,pickPraise(),"#ffd700");
          ensureAudio(); SFX.coin();
          const tint=c.isBee?[0xffd700,0xff9500,0xffffff]:[0xff80c0,0xd0a0ff,0x80d0ff,0xffffff];
          const pt=sceneRef.add.particles(0,0,"spark_item",{x:px,y:py,speed:{min:50,max:170},lifespan:380,quantity:c.isBee?14:12,scale:{start:0.9,end:0},gravityY:280,tint});
          sceneRef.time.delayedCall(280,()=>pt.destroy());
          saveGame();
          // Respawnar após 5-9 segundos — usar session para ignorar se o nível mudou
          const wW=LEVELS[currentLevel]?.worldW||2600;
          const mySession = c.session;
          sceneRef.time.delayedCall(5000+Math.random()*4000,()=>{
            // Ignorar se o nível foi reiniciado ou mudou (nova session)
            if(mySession !== _critterSession) return;
            if(!c.collected) return;
            c.collected=false;
            c.x=120+Math.random()*(wW-240); c.y=60+Math.random()*260;
            // Garantir velocidade mínima robusta no respawn
            const dir = Math.random() < 0.5 ? 1 : -1;
            c.speedX = dir * (0.7 + Math.random() * 0.6);
            c.speedY = (Math.random() < 0.5 ? 1 : -1) * (0.5 + Math.random() * 0.5);
            c.angle = Math.random() * Math.PI * 2;
            c.sprite=sceneRef.add.image(c.x,c.y,c.key).setDepth(2).setScale(c.isBee?0.75:0.80).setAlpha(0.92);
          });
        }
      });
    }
  }

  function update() {
    const _updOverlay = awaitingQuiz || awaitingStory
      || !startOverlay.classList.contains('hidden')
      || !historyOverlay.classList.contains('hidden')
      || !quizOverlay.classList.contains('hidden');
    if (!_updOverlay) {
      updateCritters();
      updateTrampolines(sceneRef);
      updateSecrets(sceneRef);
      updateHazards(sceneRef);
      updateSigns();
      if (inBossFight) updateBossFight(sceneRef);
    }
    updateMovingPlatforms(sceneRef);
    const _overlayOpen = awaitingQuiz || awaitingStory || _overlayPaused
      || !startOverlay.classList.contains("hidden")
      || !historyOverlay.classList.contains("hidden")
      || !quizOverlay.classList.contains("hidden")
      || !document.getElementById("gameOverOverlay").classList.contains("hidden")
      || !document.getElementById("winOverlay").classList.contains("hidden");
    if (_overlayOpen) {
      // ── Watchdog anti-bloqueio ──────────────────────────────────────────────
      // Deteta awaitingQuiz=true sem nenhum overlay visível E sem transição de
      // nível a decorrer. O threshold é 6000ms — acima do tempo máximo da
      // animação da porta/portal (≈3.5s, já a incluir a dança do robô antes
      // de ser sugado) mas abaixo de qualquer bloqueio real. Era 3000ms,
      // calibrado para a animação antiga (≈1640ms, sem dança) — ficava
      // apertado demais depois de a dança ser acrescentada e disparava a meio
      // da transição, impedindo o quiz de aparecer e devolvendo o jogador ao
      // mesmo nível.
      const _noVisibleOverlay =
            historyOverlay.classList.contains("hidden")
         && quizOverlay.classList.contains("hidden")
         && startOverlay.classList.contains("hidden")
         && document.getElementById("gameOverOverlay").classList.contains("hidden")
         && document.getElementById("winOverlay").classList.contains("hidden")
         // Ecrãs mostrados depois do winOverlay (galeria de artefactos, certificado)
         // também têm de "contar" como overlay visível — senão o watchdog conclui
         // (ao fim do threshold) que o jogo ficou preso por engano e retoma a física
         // por trás do certificado/galeria, deixando o VanBerto's a apanhar dano
         // invisível. Bug corrigido: adicionadas as verificações abaixo.
         && (document.getElementById("certificateOverlay")?.classList.contains("hidden") ?? true)
         && (document.getElementById("artefactGalleryOverlay")?.classList.contains("hidden") ?? true)
         && (document.getElementById("reviewOverlay")?.classList.contains("hidden") ?? true)
         && (document.getElementById("levelTransitionOverlay")?.style.display || "none") === "none"
         && !document.getElementById("artefactRevealOverlay")?.classList.contains("show");
      if ((awaitingQuiz || awaitingStory) && !_overlayPaused && _noVisibleOverlay) {
        if (!sceneRef._wdStart) sceneRef._wdStart = Date.now();
        if (Date.now() - sceneRef._wdStart > 6000) {
          sceneRef._wdStart = 0;
          awaitingQuiz = false;
          awaitingStory = false;
          if (!pausedByTeacher) sceneRef.physics.resume();
        }
      } else {
        sceneRef._wdStart = 0;
      }
      // ───────────────────────────────────────────────────────────────────────
      exitCrouch();
      player.setVelocityX(0); applyVanBertoTexture(sceneRef); updateShadow(); return;
    }
    sceneRef._wdStart = 0;
    // Watchdog: retomar física só se não houver nenhuma razão legítima de pausa
    if (!pausedByTeacher && !awaitingStory && !awaitingQuiz && !_overlayPaused
        && sceneRef.physics.world.isPaused) {
      sceneRef.physics.resume();
    }
    let leftDown=cursors.left.isDown||touch.left;
    let rightDown=cursors.right.isDown||touch.right;
    if (sceneRef.time.now < controlsInvertedUntil) { const _t=leftDown; leftDown=rightDown; rightDown=_t; }

    // ===== Agachar — nova funcionalidade =====
    // ↓ / S / botão touch. Reduz a hitbox (esquiva ataques altos como os
    // livros do boss ou o "Fake News" na horizontal, e permite passar por
    // baixo de plataformas baixas), mas trava o salto e anda mais devagar —
    // não dá para atravessar um nível todo agachado sem custo nenhum.
    const downHeld = cursors.down.isDown || (keyS && keyS.isDown) || touch.crouch;
    const wasCrouching = isCrouching;
    isCrouching = !!downHeld && !awaitingQuiz && !awaitingStory;
    if (isCrouching !== wasCrouching) setCrouchHitbox(player, isCrouching);

    let speed=powered?320:280;
    if (isCrouching) speed *= 0.55;

    if (leftDown&&!rightDown) { player.setVelocityX(-speed); player.setFlipX(true);  player.setAngle(-2); }
    else if (rightDown&&!leftDown) { player.setVelocityX(speed); player.setFlipX(false); player.setAngle(2); }
    else { player.setVelocityX(0); player.setAngle(0); }
    // Só aplica escala se não estiver a piscar (invuln) para não interromper o tween de alpha
    if(!invuln){
      if(player.getData("usingPng")){
        const ps = powered ? 72*1.18 : 72;
        if (isCrouching) player.setDisplaySize(ps*1.08, ps*0.6);
        else player.setDisplaySize(ps, ps);
      } else {
        const baseScale = powered?1.18:1.0;
        if (isCrouching) player.setScale(baseScale*1.08, baseScale*0.6);
        else player.setScale(baseScale);
      }
    }

    // ── COYOTE TIME + BUFFER DE SALTO ────────────────────────────
    const now=sceneRef.time.now;
    const onGround=player.body.blocked.down;
    if(onGround){ coyoteUntil=now+COYOTE_MS; doubleJumpUsed=false; }

    // Deteção de "carregar saltar" (flanco, não "premido") — guarda o pedido por uns ms
    let jumpJustPressed=false;
    if(Phaser.Input.Keyboard.JustDown(cursors.up))  jumpJustPressed=true;
    if(Phaser.Input.Keyboard.JustDown(keySpace))    jumpJustPressed=true;
    if(touch.jump){ jumpJustPressed=true; touch.jump=false; }
    if(jumpJustPressed) jumpBufferedUntil=now+JUMP_BUFFER_MS;

    const wantJump  = now<=jumpBufferedUntil;                  // pedido (flanco) ainda dentro da janela
    const jumpHeld  = cursors.up.isDown||keySpace.isDown;      // tecla mantida (saltar segurando no chão)
    const canGround = now<=coyoteUntil;                        // ainda dá para saltar do "chão" (inclui coyote)

    if ((wantJump||jumpHeld) && canGround && !isCrouching) {
      // Salto normal — chão, coyote time (acabou de sair da plataforma) ou tecla mantida
      player.setVelocityY(powered?-680:-650); ensureAudio(); SFX.jump();
      jumpBufferedUntil=0; coyoteUntil=0; doubleJumpUsed=false;
      sceneRef.tweens.add({targets:player,scaleY:powered?1.26:1.11,scaleX:powered?1.11:0.95,duration:120,yoyo:true});
    } else if (wantJump&&!onGround&&doubleJumpActive&&!doubleJumpUsed&&!isCrouching) {
      // DUPLO SALTO — só com toque/tecla NOVO no ar (flanco), nunca por manter premido
      doubleJumpUsed=true; jumpBufferedUntil=0;
      player.setVelocityY(-920); // muito mais alto que o salto normal (-650)
      ensureAudio();
      // Som especial duplo (acorde ascendente)
      beep({freq:520,dur:0.07,type:"triangle",vol:0.07,slideTo:880});
      setTimeout(()=>beep({freq:880,dur:0.12,type:"triangle",vol:0.07,slideTo:1200}),70);
      // Explosão de asas — círculo de partículas douradas/azuis
      const burst=sceneRef.add.particles(0,0,"spark_item",{
        x:player.x, y:player.y+10,
        speed:{min:60,max:200}, angle:{min:0,max:360},
        lifespan:420, quantity:20, scale:{start:1.1,end:0}, gravityY:120,
        tint:[0xffd700,0xffffff,0x80d0ff,0xffe080,0x40c0ff]
      });
      sceneRef.time.delayedCall(300,()=>burst.destroy());
      // Squash & stretch exagerado para sentir o impulso
      sceneRef.tweens.add({targets:player,scaleY:0.6,scaleX:1.4,duration:80,yoyo:true,
        onComplete:()=>{ player.setScale(1); }});
      showFloat(sceneRef,player.x,player.y-60,"🦅 DUPLO SALTO!","#ffd700");
    }

    // Rastro de partículas de asa enquanto doubleJumpActive e no ar
    if (doubleJumpActive && player && !player.body.blocked.down) {
      if (!sceneRef._wingTrailTimer) sceneRef._wingTrailTimer = 0;
      sceneRef._wingTrailTimer += sceneRef.sys.game.loop.delta;
      if (sceneRef._wingTrailTimer > 80) {
        sceneRef._wingTrailTimer = 0;
        const t = sceneRef.add.particles(0,0,"spark_item",{
          x:player.x, y:player.y+8,
          speed:{min:15,max:50}, angle:{min:80,max:100},
          lifespan:220, quantity:3, scale:{start:0.7,end:0}, gravityY:60,
          tint:[0xffd700,0x80d0ff,0xffffff]
        });
        sceneRef.time.delayedCall(180,()=>t.destroy());
      }
    } else if (!doubleJumpActive && sceneRef._wingTrailTimer !== undefined) {
      sceneRef._wingTrailTimer = 0;
    }

    // Efeito visual estrela: tint arco-íris rápido (dourado/laranja/branco) — como Super Mario
    if (starPower && player && !invuln) {
      if (!sceneRef._starBlinkTimer) sceneRef._starBlinkTimer = 0;
      sceneRef._starBlinkTimer += sceneRef.sys.game.loop.delta;
      // Ciclo de cores arco-íris a cada 80ms: amarelo→laranja→branco→ciano→laranja→amarelo
      const starColors = [0xffd700, 0xff9500, 0xffffff, 0x80ffff, 0xff6b35, 0xffd700];
      if (sceneRef._starBlinkTimer > 80) {
        sceneRef._starBlinkTimer = 0;
        if (!sceneRef._starColorIdx) sceneRef._starColorIdx = 0;
        sceneRef._starColorIdx = (sceneRef._starColorIdx + 1) % starColors.length;
        player.setTint(starColors[sceneRef._starColorIdx]);
        if (!awaitingQuiz) player.setAlpha(1); // visível durante star power, mas não durante quiz
      }
      // Rastro de estrelinhas douradas enquanto move
      if (Math.abs(player.body.velocity.x) > 30 || Math.abs(player.body.velocity.y) > 60) {
        if (!sceneRef._starTrailTimer) sceneRef._starTrailTimer = 0;
        sceneRef._starTrailTimer += sceneRef.sys.game.loop.delta;
        if (sceneRef._starTrailTimer > 60) {
          sceneRef._starTrailTimer = 0;
          const t = sceneRef.add.particles(0,0,"spark_item",{
            x:player.x, y:player.y+4,
            speed:{min:20,max:80}, angle:{min:0,max:360},
            lifespan:280, quantity:4, scale:{start:0.9,end:0}, gravityY:80,
            tint:[0xffd700,0xffffff,0xff9500,0xffe080]
          });
          sceneRef.time.delayedCall(200,()=>t.destroy());
        }
      }
    } else if (!starPower && !invuln && player) {
      sceneRef._starBlinkTimer = 0;
      sceneRef._starColorIdx  = 0;
      sceneRef._starTrailTimer = 0;
      // Repõe alpha e limpa tint (só se não há outro power ativo)
      if (!powered) player.clearTint();
      // Só repõe alpha se o robot estiver visível no jogo (não durante animação de porta/quiz)
      if (player.alpha < 0.9 && !awaitingQuiz) player.setAlpha(1);
    }

    applyVanBertoTexture(sceneRef);
    updatePowerHalo(sceneRef);
    updateShadow();

    if (progressFill&&LEVELS[currentLevel]) {
      if (_hudDirty) { updateHUD(LEVELS[currentLevel]); _hudDirty=false; }
      else { updateProgressBar(LEVELS[currentLevel]); } // só a posição do marcador
    }

    // Animar sol (rotação lenta dos raios)
    sunAngle += 0.004;
    drawSun(sunAngle);

    // Animar estrelas noturnas (piscar) — durante um boss, segue o tema do boss
    if (inBossFight && bossState) {
      if (NIGHT_THEMES.has(bossState.def.themeIdx)) drawStars(bossState.def.themeIdx, 1600);
    } else if(LEVELS[currentLevel]&&NIGHT_THEMES.has(LEVELS[currentLevel].theme)) {
      drawStars(LEVELS[currentLevel].theme, LEVELS[currentLevel].worldW||2600);
    }

    // Animar nuvens
    clouds.forEach(c=>{
      c.x += c.speed;
      if(c.x > c.worldW+120) c.x=-120;
      drawCloud(c.gfx,c.x,c.y,c.scale,c.alpha,c.type||"cumulo");
    });

    // Trail de movimento (super modo ou no ar)
    updateTrail(sceneRef);

    // Partículas de passo quando corre no chão
    updateFootsteps(sceneRef, player, powered);

    // Halo da porta quando o player está perto
    updateDoorGlow(sceneRef, door, player);

    // Decorações animadas nas plataformas
    updatePlatformDecor(sceneRef);

    // Confetes de fundo — deriva suave
    bgConfetti.forEach(c=>{
      if(!c.gfx||!c.gfx.active) return;
      c.gfx.y = c.baseY + Math.sin(sceneRef.time.now*0.0008+c.phase)*18;
    });

    // Itens sem rotação — apenas flutuam

    // Animar e verificar colisão dos balões flutuantes apanháveis
    if(player){
      const px=player.x, py=player.y;
      balloons.forEach(b=>{
        if(b.collected||!b.sprite) return;
        // Movimento flutuante — sobem pelo ar com deriva lateral
        b.y -= 0.45 + b.speed * 0.12;
        b.x += Math.sin(b.y * 0.018 + b.phase) * 0.6;
        if(b.y < -50){ b.y=560; b.x=80+Math.random()*((LEVELS[currentLevel]?.worldW||2600)-160); }
        b.sprite.setPosition(b.x, b.y);
        b.sprite.setAngle(0);
        // Oscilação suave de alpha
        b.sprite.setAlpha(0.82+Math.sin(Date.now()*0.003+b.phase)*0.12);
        // Colisão com jogador
        const pb=player.body;
        const bLeft=b.x-20, bRight=b.x+20, bTop=b.y-28, bBot=b.y+10;
        if(pb.right>bLeft&&pb.left<bRight&&pb.bottom>bTop&&pb.top<bBot){
          b.collected=true;
          b.sprite.destroy(); b.sprite=null;
          score+=10; scoreText.setText(`🌟 Pontos: ${score}`);
          showFloat(sceneRef,px,py-68,"🎈 Balão +10","#ff6b35");
          if(Math.random()<0.35) showFloat(sceneRef,px,py-100,pickPraise(),"#ffd700");
          ensureAudio(); SFX.coin();
          const tint=[0xff6b35,0xffd700,0xff80c0,0x80d0ff];
          const p=sceneRef.add.particles(0,0,"spark_item",{x:px,y:py,speed:{min:60,max:160},lifespan:340,quantity:12,scale:{start:0.9,end:0},gravityY:300,tint});
          sceneRef.time.delayedCall(240,()=>p.destroy());
          saveGame();
          // Respawnar lá em baixo após 4-7 segundos
          const worldW=LEVELS[currentLevel]?.worldW||2600;
          // _critterSession (não currentLevel!) — currentLevel não muda ao entrar
          // num boss, por isso comparar só com currentLevel deixava passar respawns
          // "fantasma" de balões apanhados mesmo antes do boss começar.
          const _balloonSession=_critterSession;
          sceneRef.time.delayedCall(4000+Math.random()*3000,()=>{
            if(_balloonSession!==_critterSession) return; // nível/boss mudou — ignorar
            if(!b.collected) return;
            b.collected=false;
            b.x=80+Math.random()*(worldW-160); b.y=560;
            const newKey="item_balao_"+Math.floor(Math.random()*6);
            b.sprite=sceneRef.add.image(b.x,b.y,newKey).setDepth(1).setScale(0.85).setAlpha(0.92);
          });
        }
      });
    }

    // Animar borboletas e abelhas apanháveis
    malwareGroup.getChildren().forEach(m=>{
      if (!m.active || !m.body) return;
      const isBoss = !!m.getData("isBoss"); // bosses não devem girar como os vilões pequenos
      const pat = m.getData("pattern") || "patrol";
      const spd = m.getData("speed") || 120;
      const dir = m.getData("dir") || 1;  // direcao guardada

      if (pat === "mini") {
        const minL = m.getData("minLeft")  ?? (m.x - 120);
        const minR = m.getData("minRight") ?? (m.x + 120);
        if (m.x <= minL || m.body.blocked.left)  { m.setVelocityX(spd);  m.setData("dir", 1); }
        if (m.x >= minR || m.body.blocked.right) { m.setVelocityX(-spd); m.setData("dir", -1); }
        if (Math.abs(m.body.velocity.x) < 8) { m.setVelocityX(spd * dir); }
        if (!isBoss) m.rotation += 0.012;
      } else {
        if (m.body.blocked.left)  { m.setVelocityX(spd);  m.setData("dir", 1); }
        if (m.body.blocked.right) { m.setVelocityX(-spd); m.setData("dir", -1); }
        if (door && m.x > door.x - 220 && m.body.velocity.x > 0) { m.setVelocityX(-spd); m.setData("dir", -1); }
        // Impede vilões de cair em zonas de perigo (lava/ácido/abismo) — inverte na borda da plataforma
        // Só ativa em níveis com hazards, para não afetar o comportamento normal
        if (hazards.length && m.body.onFloor()) {
          // Sonda um passo à frente, ao nível do chão do vilão
          const probeX = m.x + (m.body.velocity.x > 0 ? 32 : -32);
          const feetY  = m.body.bottom;
          // 1) Verificar se há plataforma sólida sob esse ponto (margem generosa de 30px)
          const hasPlatformAhead = platforms.getChildren().some(p => {
            if (!p.body) return false;
            return probeX >= p.body.left && probeX <= p.body.right &&
                   feetY  >= p.body.top  - 30 && feetY <= p.body.bottom + 30;
          });
          // 2) Verificar se o passo à frente cai numa zona de lava/perigo
          const inHazardAhead = hazards.some(h =>
            probeX >= h.x - h.w / 2 && probeX <= h.x + h.w / 2
          );
          if (!hasPlatformAhead || inHazardAhead) {
            const newDir = m.body.velocity.x > 0 ? -1 : 1;
            m.setVelocityX(spd * newDir);
            m.setData("dir", newDir);
          }
        }
        // Watchdog robusto: se parou, usar direção guardada
        if (Math.abs(m.body.velocity.x) < 8) { m.setVelocityX(spd * (m.getData("dir") || 1)); }
        if (!isBoss) m.rotation += pat === "jumper" ? 0.038 : 0.022;
      }
      if (m.body.velocity.x < -2) m.setFlipX(true);
      else if (m.body.velocity.x > 2) m.setFlipX(false);
    });
  }

  function updateShadow() {
    if (!shadowGfx||!player) return;
    shadowGfx.clear();
    if (awaitingQuiz) return;
    const px=player.x,py=player.y; let groundY=520;
    platforms.getChildren().forEach(p=>{
      if(!p.body) return;
      if(px>=p.body.left&&px<=p.body.right&&p.body.top>py&&p.body.top<groundY) groundY=p.body.top;
    });
    const dist=Math.max(0,groundY-py), alpha=Math.max(0,0.28-dist*0.001), sc=Math.max(0.3,1-dist*0.003);
    shadowGfx.fillStyle(0x000000,alpha); shadowGfx.fillEllipse(player.x,groundY+2,44*sc,10*sc);
  }

  function updatePowerHalo(scene) {
    if (!powerHaloGfx||!player) return;
    powerHaloGfx.clear();
    // Esconder halo durante animação da porta ou quiz
    if (awaitingQuiz) return;

    // ── Barra de Star Power por cima do robô ─────────────────────
    if (starPower) {
      const barW = 46, barH = 6;
      const bx = player.x - barW/2;
      // Se o escudo também estiver ativo, a barra da estrela fica uma linha acima
      const by = powered ? player.y - 66 : player.y - 54;
      const pct = Math.max(0, starPowerCountVal / 8);
      // Halo estelar à volta do robô — cor arco-íris pulsante
      const t2 = scene.time.now * 0.006;
      const pulse2 = 0.45 + Math.sin(t2 * 1.3) * 0.45;
      powerHaloGfx.lineStyle(3, 0xffd700, 0.65 * pulse2);
      powerHaloGfx.strokeCircle(player.x, player.y, 38 + pulse2 * 5);
      powerHaloGfx.lineStyle(2, 0xffe080, 0.40 * pulse2);
      powerHaloGfx.strokeCircle(player.x, player.y, 28 + pulse2 * 3);
      // Fundo escuro
      powerHaloGfx.fillStyle(0x000000, 0.50);
      powerHaloGfx.fillRoundedRect(bx-1, by-1, barW+2, barH+2, 4);
      // Preenchimento — amarelo→laranja→vermelho conforme acaba
      const starBarColor = pct > 0.5 ? 0xffd700 : pct > 0.25 ? 0xff9500 : 0xff3300;
      powerHaloGfx.fillStyle(starBarColor, 0.95);
      powerHaloGfx.fillRoundedRect(bx, by, Math.max(3, barW * pct), barH, 3);
      // Brilho
      powerHaloGfx.fillStyle(0xffffff, 0.35);
      powerHaloGfx.fillRoundedRect(bx, by, Math.max(3, barW * pct), barH/2, 3);
      // Ícone ⭐ à esquerda da barra (círculo dourado — fillStar não existe em Phaser)
      powerHaloGfx.fillStyle(0xffd700, 0.9);
      powerHaloGfx.fillCircle(bx - 8, by + barH/2, 5);
    }

    if (!powered) return;
    const t = scene.time.now * 0.004;
    const pulse = 0.55 + Math.sin(t) * 0.45;
    // Halo exterior — azul royal
    powerHaloGfx.lineStyle(4, 0x4488ff, 0.55 * pulse);
    powerHaloGfx.strokeCircle(player.x, player.y, 34 + pulse * 6);
    // Halo interior — azul claro
    powerHaloGfx.lineStyle(2.5, 0x88ccff, 0.7 * pulse);
    powerHaloGfx.strokeCircle(player.x, player.y, 26 + pulse * 4);
    // Barra de tempo por cima do robô
    const barW = 46, barH = 6;
    const bx = player.x - barW/2, by = player.y - 54;
    const pct = Math.max(0, poweredCountdownVal / 8);
    // Fundo da barra
    powerHaloGfx.fillStyle(0x000000, 0.45);
    powerHaloGfx.fillRoundedRect(bx-1, by-1, barW+2, barH+2, 4);
    // Preenchimento — azul vivo → azul claro → vermelho conforme acaba
    const barColor = pct > 0.5 ? 0x2266ff : pct > 0.25 ? 0x55aaff : 0xff4400;
    powerHaloGfx.fillStyle(barColor, 0.92);
    powerHaloGfx.fillRoundedRect(bx, by, Math.max(3, barW * pct), barH, 3);
    // Brilho no topo da barra
    powerHaloGfx.fillStyle(0xffffff, 0.30);
    powerHaloGfx.fillRoundedRect(bx, by, Math.max(3, barW * pct), barH/2, 3);
  }

  // ===== Balões flutuantes apanháveis =====
  function spawnBalloons(scene,worldW) {
    balloons.forEach(b=>{ if(b.sprite) b.sprite.destroy(); if(b.gfx) b.gfx.destroy(); });
    balloons=[];
    const count=6+(currentLevel%4);
    for(let i=0;i<count;i++){
      const x=80+Math.random()*(worldW-160);
      const y=80+Math.random()*380; // espalhados pelo ar
      const bKey="item_balao_"+(i%6);
      const sprite=scene.add.image(x,y,bKey).setDepth(1).setScale(0.85).setAlpha(0.92);
      balloons.push({
        sprite, x, y,
        colorKey:bKey, speed:0.4+Math.random()*0.7,
        phase:Math.random()*Math.PI*2,
        collected:false
      });
    }
  }
  function drawBalloon() {} // mantida para compatibilidade

  // ===== Borboletas e Abelhas apanháveis =====
  // Calcula posições das flores do chão para poder enviar borboletas até lá
  function getFlowerPositions(worldW) {
    const flowers = [];
    for(let fi=0; fi<Math.floor(worldW/38); fi++){
      flowers.push({ x: 18+fi*38+(fi%4)*5, y: 507+(fi%2)*2 });
    }
    return flowers;
  }

  let _critterSession = 0; // incrementado a cada loadLevel para invalidar respawns pendentes

  function spawnCritters(scene, worldW){
    _critterSession++; // invalidar todos os delayedCall de respawn anteriores
    critters.forEach(c=>{ if(c.sprite&&c.sprite.active) c.sprite.destroy(); });
    critters=[];
    const count = 3 + Math.floor(currentLevel / 2); // 3 no nível 1, até ~12 nos últimos
    const session = _critterSession;
    for(let i=0; i<count; i++){
      // Alternar: metade são borboletas, metade são abelhas
      const isBee = (i % 2 === 0);
      const colorIdx = i % 5;
      const key = isBee ? "item_abelha" : "item_borboleta_"+colorIdx;
      const x = 120 + Math.random() * (worldW - 240);
      const y = 60 + Math.random() * 260;
      const sprite = scene.add.image(x, y, key)
        .setDepth(2).setScale(isBee ? 0.75 : 0.80).setAlpha(0.92);
      critters.push({
        sprite, x, y, isBee, key,
        speedX: (Math.random() < 0.5 ? 1 : -1) * (0.7 + Math.random() * 0.6),
        speedY: (Math.random() < 0.5 ? 1 : -1) * (0.5 + Math.random() * 0.5),
        phase: Math.random() * Math.PI * 2,
        wingPhase: Math.random() * Math.PI * 2,
        collected: false, worldW,
        session // identificador de sessão para cancelar respawns obsoletos
      });
    }
  }

  // ===== Escudos extra distribuídos pelo nível =====
  // Cria 2-3 escudos adicionais espalhados pelo mapa (além do que já está em L.items),
  // posicionados acima das plataformas existentes para ficarem acessíveis.
  // Os escudos ficam no itemsGroup normal e são tratados como "medalha".
  function spawnShields(scene, L) {
    if (currentLevel < 3) return;

    const spawnX = L.spawn?.x ?? 0;
    const plats = L.platforms.filter(p => p.w < 600 && Math.abs(p.x - spawnX) > 200); // excluir plataforma de arranque
    if (!plats.length) return;

    // Ordenar da esquerda para a direita — queremos o escudo perto do início
    const sorted = [...plats].sort((a, b) => a.x - b.x);

    // Primeira plataforma que não tenha NENHUM item de L.items dentro dos seus limites
    // (margem de 8px para dar espaço ao sprite do item)
    const p = sorted.find(pl => {
      const left  = pl.x - pl.w / 2 - 8;
      const right = pl.x + pl.w / 2 + 8;
      return L.items.every(it => it.x < left || it.x > right);
    });
    if (!p) return;

    const sx = p.x;
    const sy = p.y - 52;
    const obj = itemsGroup.create(sx, sy, "item_medalha");
    obj.setDepth(2);
    scene.tweens.add({ targets: obj, y: sy - 8, duration: 940, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
    obj.setData("kind", "medalha");
    obj.setData("itemIdx", -1); // -1 = escudo extra, não entra no collectedItemIndices
    // Este escudo não está em L.items, por isso não entrava na contagem de
    // "⭐ Itens: X/Y" — o HUD dizia p.ex. "4" quando na verdade havia 5 para
    // apanhar. Ao criá-lo aqui, o total é corrigido (uma única vez por nível).
    if (!extraShieldCounted) {
      extraShieldCounted = true;
      itemsTotal += 1;
      if (itemCountText) itemCountText.setText(`⭐ Itens: ${itemsCollected}/${itemsTotal}`);
    }
  }
  // ===== PLATAFORMAS MÓVEIS =====
  function spawnMovingPlatforms(scene, L) {
    movingPlatforms.forEach(mp => {
      if (mp.sprite && mp.sprite.active) mp.sprite.destroy();
      if (mp.gfx    && mp.gfx.active)   mp.gfx.destroy();
    });
    movingPlatforms = [];
    const defs = L.movingPlatforms || [];
    if (!defs.length) return;
    const themeIdx = (L.theme || 0) % THEMES.length;
    const platKey  = "platform_t" + themeIdx;
    if (!scene.textures.exists(platKey)) makePlatformTextureThemed(scene, platKey, themeIdx);
    defs.forEach(def => {
      const speed  = def.speed  || 80;
      const rangeX = def.rangeX || 0;
      const rangeY = def.rangeY || 0;
      const spr = scene.physics.add.image(def.x, def.y, platKey)
        .setDisplaySize(def.w, def.h || 22).setDepth(2).setImmovable(true);
      spr.body.allowGravity = false;
      const collider1 = scene.physics.add.collider(player, spr);
      const collider2 = scene.physics.add.collider(malwareGroup, spr);
      const gfx = scene.add.graphics().setDepth(3);
      movingPlatforms.push({
        sprite: spr, gfx, collider1, collider2,
        originX: def.x, originY: def.y,
        rangeX, rangeY, speed, dirX: 1, dirY: 1
      });
    });
  }

  function updateMovingPlatforms(scene) {
    if (!movingPlatforms.length) return;
    const dt = scene.sys.game.loop.delta * 0.001;
    movingPlatforms.forEach(mp => {
      if (!mp.sprite || !mp.sprite.active) return;
      if (mp.rangeX > 0) {
        mp.sprite.x += mp.dirX * mp.speed * dt;
        if (mp.sprite.x >= mp.originX + mp.rangeX) { mp.sprite.x = mp.originX + mp.rangeX; mp.dirX = -1; }
        if (mp.sprite.x <= mp.originX - mp.rangeX) { mp.sprite.x = mp.originX - mp.rangeX; mp.dirX =  1; }
      }
      if (mp.rangeY > 0) {
        mp.sprite.y += mp.dirY * (mp.speed * 0.6) * dt;
        if (mp.sprite.y >= mp.originY + mp.rangeY) { mp.sprite.y = mp.originY + mp.rangeY; mp.dirY = -1; }
        if (mp.sprite.y <= mp.originY - mp.rangeY) { mp.sprite.y = mp.originY - mp.rangeY; mp.dirY =  1; }
      }
      // Arrastar o jogador se estiver em cima
      if (player && player.body && player.body.blocked.down) {
        const pb = player.body, sb = mp.sprite.body;
        const onTop = pb.right > sb.left && pb.left < sb.right && Math.abs(pb.bottom - sb.top) < 8;
        if (onTop) {
          if (mp.rangeX > 0) player.x += mp.dirX * mp.speed * dt;
          if (mp.rangeY > 0 && mp.dirY < 0) player.y += mp.dirY * (mp.speed * 0.6) * dt;
        }
      }
      mp.sprite.body.reset(mp.sprite.x, mp.sprite.y);
      // Setas indicadoras
      mp.gfx.clear();
      mp.gfx.lineStyle(2, 0xffd700, 0.55);
      const cx = mp.sprite.x, cy = mp.sprite.y - 18;
      if (mp.rangeX > 0) {
        mp.gfx.beginPath(); mp.gfx.moveTo(cx-10,cy); mp.gfx.lineTo(cx+10,cy); mp.gfx.strokePath();
        mp.gfx.fillStyle(0xffd700, 0.55);
        mp.gfx.fillTriangle(cx-13,cy, cx-7,cy-3, cx-7,cy+3);
        mp.gfx.fillTriangle(cx+13,cy, cx+7,cy-3, cx+7,cy+3);
      } else {
        mp.gfx.beginPath(); mp.gfx.moveTo(cx,cy-8); mp.gfx.lineTo(cx,cy+8); mp.gfx.strokePath();
        mp.gfx.fillStyle(0xffd700, 0.55);
        mp.gfx.fillTriangle(cx,cy-11, cx-3,cy-5, cx+3,cy-5);
        mp.gfx.fillTriangle(cx,cy+11, cx-3,cy+5, cx+3,cy+5);
      }
    });
  }

  function clearMovingPlatforms() {
    movingPlatforms.forEach(mp => {
      if (mp.collider1) { try{ sceneRef.physics.world.removeCollider(mp.collider1); }catch{} }
      if (mp.collider2) { try{ sceneRef.physics.world.removeCollider(mp.collider2); }catch{} }
      if (mp.sprite && mp.sprite.active) mp.sprite.destroy();
      if (mp.gfx    && mp.gfx.active)   mp.gfx.destroy();
    });
    movingPlatforms = [];
  }

  // ===== TRAMPOLINS =====
  function _drawTrampoline(gfx, x, y, compressed) {
    gfx.clear();
    const w = 72, topY = compressed ? y - 4 : y;
    gfx.lineStyle(4, 0xa0a0a0, 0.9);
    gfx.beginPath(); gfx.moveTo(x-w*0.4, topY+14); gfx.lineTo(x-w*0.28, topY); gfx.strokePath();
    gfx.beginPath(); gfx.moveTo(x+w*0.4, topY+14); gfx.lineTo(x+w*0.28, topY); gfx.strokePath();
    const springColors = [0xffd700, 0xff6b35];
    for (let si=0; si<3; si++) {
      gfx.fillStyle(springColors[si%2], 0.9);
      gfx.fillRect(x-5, topY+(compressed?2:4)+si*(compressed?2:3), 10, compressed?2:2.5);
    }
    const arcY = compressed ? topY-2 : topY-6;
    gfx.fillStyle(0xff6b35, 0.95);
    gfx.fillRoundedRect(x-w/2, arcY, w, 9, 4);
    gfx.fillStyle(0xffffff, 0.28);
    gfx.fillRoundedRect(x-w/2+4, arcY+1, w-8, 4, 3);
    gfx.lineStyle(1.5, 0xffd700, 0.55);
    for (let ri=-20; ri<=20; ri+=10) {
      gfx.beginPath(); gfx.moveTo(x+ri, arcY+2); gfx.lineTo(x+ri+5, arcY+7); gfx.strokePath();
    }
    if (!compressed) { gfx.fillStyle(0xffd700, 0.70); gfx.fillCircle(x, arcY-8, 5); }
  }

  function spawnTrampolines(scene, L) {
    trampolines.forEach(t => { if (t.gfx && t.gfx.active) t.gfx.destroy(); });
    trampolines = [];
    const defs = L.trampolines || [];
    if (!defs.length) return;
    defs.forEach(def => {
      const gfx = scene.add.graphics().setDepth(3);
      _drawTrampoline(gfx, def.x, def.y, false);
      trampolines.push({ x: def.x, y: def.y, gfx, cooldown: 0 });
    });
  }

  function updateTrampolines(scene) {
    if (!trampolines.length || !player || !player.body) return;
    const now = scene.time.now;
    trampolines.forEach(t => {
      if (!t.gfx || !t.gfx.active || t.cooldown > now) return;
      const pb = player.body;
      const hit = pb.right > t.x-38 && pb.left < t.x+38 &&
                  pb.bottom > t.y-20 && pb.bottom < t.y+12 &&
                  pb.velocity.y >= 0;
      if (!hit) return;
      player.setVelocityY(powered ? -1200 : -960);
      t.cooldown = now + 600;
      _drawTrampoline(t.gfx, t.x, t.y, true);
      scene.time.delayedCall(140, () => { if (t.gfx && t.gfx.active) _drawTrampoline(t.gfx, t.x, t.y, false); });
      const burst = scene.add.particles(0, 0, "spark_item", {
        x: t.x, y: t.y-10, speed:{min:40,max:140}, angle:{min:200,max:340},
        lifespan:320, quantity:12, scale:{start:0.9,end:0}, gravityY:200,
        tint:[0xff6b35,0xffd700,0xffffff]
      });
      scene.time.delayedCall(240, () => burst.destroy());
      ensureAudio();
      showFloat(scene, player.x, player.y-60, "🌟 Trampolim!", "#ffd700");
    });
  }

  function clearTrampolines() {
    trampolines.forEach(t => { if (t.gfx && t.gfx.active) t.gfx.destroy(); });
    trampolines = [];
  }

  // ===== ZONAS DE PERIGO (lava / ácido / abismo) =====
  // Cada hazard: { x, w, y, gfx, kind }
  // kind: "lava" | "acid" | "void"
  // O player perde uma vida instantaneamente se tocar (a não ser que invuln ou powered)

  function spawnHazards(scene, L) {
    hazards = [];
    const defs = L.hazards || [];
    if (!defs.length) return;

    defs.forEach(def => {
      const kind   = def.kind || "lava";
      const gfx    = scene.add.graphics().setDepth(2).setScrollFactor(1);
      _drawHazard(gfx, def.x, def.y ?? 510, def.w, kind, scene.time.now);
      // Animação de ondulação — recria a cada 120ms
      const timer = scene.time.addEvent({
        delay: 120, loop: true,
        callback: () => {
          if (!gfx || !gfx.active) return;
          _drawHazard(gfx, def.x, def.y ?? 510, def.w, kind, scene.time.now);
        }
      });
      hazards.push({ x: def.x, y: def.y ?? 510, w: def.w, gfx, kind, timer });
    });
  }

  function _drawHazard(gfx, x, y, w, kind, now) {
    gfx.clear();
    const t = now * 0.003;
    const half = w / 2;

    if (kind === "lava") {
      // Base: laranja escuro → vermelho
      gfx.fillStyle(0xcc2200, 1);
      gfx.fillRect(x - half, y, w, 30);
      // Camada brilhante — laranja quente
      gfx.fillStyle(0xff5500, 0.85);
      gfx.fillRect(x - half, y, w, 18);
      // Bolhas/ondas animadas
      gfx.fillStyle(0xff8800, 0.9);
      for (let i = 0; i < Math.floor(w / 22); i++) {
        const bx = x - half + 11 + i * 22 + Math.sin(t + i * 1.3) * 6;
        const by = y + 4 + Math.sin(t * 1.4 + i * 0.9) * 3;
        gfx.fillCircle(bx, by, 6 + Math.sin(t * 2 + i) * 2);
      }
      // Brilho topo — linha amarela pulsante
      gfx.fillStyle(0xffdd00, 0.55 + Math.sin(t * 3) * 0.2);
      gfx.fillRect(x - half, y, w, 3);
      // Faíscas individuais
      gfx.fillStyle(0xffee88, 0.85);
      for (let i = 0; i < 5; i++) {
        const sx = x - half + ((i * 137 + Math.floor(t * 8)) % w);
        const sy = y - 2 - ((Math.floor(t * 6 + i * 3)) % 8);
        gfx.fillCircle(sx, sy, 2);
      }
      // Label 🔥 — texto Phaser não funciona em graphics, usamos círculo como símbolo visual
    } else if (kind === "acid") {
      // Verde ácido tóxico
      gfx.fillStyle(0x004400, 1);
      gfx.fillRect(x - half, y, w, 30);
      gfx.fillStyle(0x00aa00, 0.85);
      gfx.fillRect(x - half, y, w, 18);
      // Ondas verdes
      gfx.fillStyle(0x44ff44, 0.75);
      for (let i = 0; i < Math.floor(w / 18); i++) {
        const bx = x - half + 9 + i * 18 + Math.sin(t * 1.2 + i * 1.5) * 5;
        const by = y + 5 + Math.sin(t * 1.8 + i * 0.7) * 3;
        gfx.fillCircle(bx, by, 5 + Math.sin(t * 2.5 + i) * 1.5);
      }
      gfx.fillStyle(0x88ff88, 0.45 + Math.sin(t * 4) * 0.18);
      gfx.fillRect(x - half, y, w, 3);
      // Bolhas de gás a subir
      gfx.fillStyle(0x00ff66, 0.6);
      for (let i = 0; i < 4; i++) {
        const bx2 = x - half + ((i * 79 + Math.floor(t * 5)) % w);
        const by2 = y - 1 - ((Math.floor(t * 4 + i * 4)) % 10);
        gfx.fillCircle(bx2, by2, 2.5);
      }
    } else {
      // void — abismo escuro com aura
      gfx.fillStyle(0x000000, 1);
      gfx.fillRect(x - half, y, w, 30);
      gfx.fillStyle(0x220044, 0.8);
      gfx.fillRect(x - half, y, w, 8);
      // Estrelinhas no abismo
      gfx.fillStyle(0xffffff, 0.5 + Math.sin(t * 2) * 0.3);
      for (let i = 0; i < 6; i++) {
        const sx = x - half + ((i * 53 + Math.floor(t * 2)) % w);
        const sy = y + 6 + (i % 3) * 6;
        gfx.fillCircle(sx, sy, 1.5);
      }
    }
  }

  function updateHazards(scene) {
    if (!hazards.length || !player || !player.body) return;
    if (invuln) return; // já protegido
    hazards.forEach(h => {
      const pb = player.body;
      const half = h.w / 2;
      const inX = pb.right > h.x - half + 4 && pb.left < h.x + half - 4;
      const inY = pb.bottom >= h.y - 2 && pb.top < h.y + 20;
      if (!inX || !inY) return;
      // Toca na lava — tratar como hit de inimigo sem knockback horizontal fixo
      hitByHazard(scene, h);
    });
  }

  function hitByHazard(scene, h) {
    if (invuln || awaitingQuiz || _overlayPaused || pausedByTeacher) return;
    ensureAudio(); SFX.hit();
    hitFlash.classList.add("active"); setTimeout(() => hitFlash.classList.remove("active"), 200);
    scene.cameras.main.shake(180, 0.010);

    // Salto de knockback para cima
    player.setVelocityX(0);
    player.setVelocityY(-500);

    // Flash visual no jogador
    scene.tweens.add({
      targets: player,
      angle: { from: -20, to: 20 },
      duration: 70, yoyo: true, repeat: 2,
      ease: "Sine.easeInOut",
      onComplete: () => { if (player) player.setAngle(0); }
    });

    if (powered) { clearPower(scene); setInvuln(scene, 800); tipText.setText("🛡️ Escudo usado! Cuidado."); return; }

    lives -= 1; updateHearts(); livesLostThisLevel++; _hudDirty = true;
    invuln = true;
    triggerVanBertoSad(scene);

    const hazardNames = { lava: "🔥 Lava!", acid: "☠️ Ácido!", void: "🌑 Abismo!" };
    showFloat(scene, player.x, player.y - 60, hazardNames[h.kind] || "⚠️ Perigo!", "#ff4400");

    scene.time.delayedCall(420, () => {
      if (!player) return;
      const L = LEVELS[currentLevel];
      touch.left = touch.right = touch.jump = touch.crouch = false;
      player.setVelocity(0, 0);
      player.setPosition(L.spawn.x, L.spawn.y);
      snapPlayerToGround();
      if (lives <= 0) { showGameOver(); return; }
      setInvuln(scene, 2000);
      const spawnFlash = scene.add.graphics().setDepth(10);
      spawnFlash.fillStyle(0xffffff, 0.7);
      spawnFlash.fillCircle(L.spawn.x, L.spawn.y, 30);
      scene.tweens.add({ targets: spawnFlash, alpha: 0, scaleX: 2.5, scaleY: 2.5,
        duration: 400, ease: "Quad.easeOut", onComplete: () => spawnFlash.destroy() });
      tipText.setText("⚡ Protegido por 2s!");
    });

    if (lives <= 0) return;
    collectedItemIndices.clear();
    itemsCollected = 0;
    itemCountText.setText(`⭐ Itens: ${itemsCollected}/${itemsTotal}`);
    const keyMap = { estrela:"item_estrela", balao:"item_chupachupa", brinquedo:"item_brinquedo",
                     medalha:"item_medalha", heart:"item_heart", duplosalto:"item_duplosalto" };
    LEVELS[currentLevel].items.forEach((it, idx) => {
      const exists = itemsGroup.getChildren().some(o => o.getData("itemIdx") === idx);
      if (exists) return;
      const _km = keyMap[it.kind]; const _key = (typeof _km === "function" ? _km() : _km) || "item_estrela";
      const obj = itemsGroup.create(it.x, it.y, _key);
      obj.setDepth(2);
      scene.tweens.add({ targets:obj, y:obj.y-8, duration:940, yoyo:true, repeat:-1, ease:"Sine.easeInOut" });
      obj.setData("kind", it.kind);
      obj.setData("itemIdx", idx);
    });
    const hasExtraShield = itemsGroup.getChildren().some(o => o.getData("itemIdx") === -1);
    if (!hasExtraShield) spawnShields(scene, LEVELS[currentLevel]);
    saveGame();
  }

  function clearHazards() {
    hazards.forEach(h => {
      if (h.gfx && h.gfx.active) h.gfx.destroy();
      if (h.timer) h.timer.remove(false);
    });
    hazards = [];
  }

  // ===== PASSAGENS SECRETAS =====
  function spawnSecrets(scene, L) {
    secretDoors.forEach(s => {
      if (s.gfx  && s.gfx.active)  s.gfx.destroy();
      if (s.item && s.item.active)  s.item.destroy();
    });
    secretDoors = [];
    const defs = L.secrets || [];
    if (!defs.length) return;
    defs.forEach(def => {
      const kind   = def.kind   || "estrela";
      const points = def.points || 0;
      // Criar textura própria para o marcador de segredo (mais visível que emoji)
      const mkKey = "secret_marker";
      if (!scene.textures.exists(mkKey)) {
        const mt = scene.textures.createCanvas(mkKey, 36, 40), mc = mt.getContext();
        // Fundo vermelho vivo com borda amarela
        mc.fillStyle = "#cc0000";
        mc.beginPath(); mc.roundRect(1, 1, 34, 34, 7); mc.fill();
        mc.strokeStyle = "#ffd700"; mc.lineWidth = 2.5;
        mc.beginPath(); mc.roundRect(1, 1, 34, 34, 7); mc.stroke();
        // Ponto de interrogação branco em negrito
        mc.fillStyle = "#ffffff";
        mc.font = "bold 26px Arial";
        mc.textAlign = "center"; mc.textBaseline = "middle";
        mc.fillText("?", 18, 17);
        // Pontinho inferior
        mc.beginPath(); mc.arc(18, 33, 3, 0, Math.PI*2);
        mc.fillStyle = "#ffd700"; mc.fill();
        mt.refresh();
      }
      const gfx = scene.add.image(def.x, def.y - 34, mkKey)
        .setOrigin(0.5).setDepth(4).setAlpha(1);
      scene.tweens.add({ targets:gfx, alpha:{from:0.80,to:1}, scaleX:{from:1,to:1.20}, scaleY:{from:1,to:1.20},
        duration:700, yoyo:true, repeat:-1, ease:"Sine.easeInOut" });
      secretDoors.push({ x:def.x, y:def.y, kind, points, gfx, item:null, triggered:false });
    });
  }

  function updateSecrets(scene) {
    if (!secretDoors.length || !player || !player.body) return;
    secretDoors.forEach(s => {
      if (s.triggered) return;
      const pb = player.body;
      const near = pb.right > s.x-32 && pb.left < s.x+32 && pb.bottom > s.y-60 && pb.top < s.y+10;
      if (!near) return;
      s.triggered = true;
      // Rastrear para a conquista "Explorador" (encontrar todos os segredos do nível)
      onSecretFoundForAchievements((LEVELS[currentLevel]?.secrets || []).length);
      if (s.gfx && s.gfx.active) {
        scene.tweens.add({ targets:s.gfx, alpha:0, y:s.y-60, duration:400,
          onComplete:()=>{ if(s.gfx&&s.gfx.active) s.gfx.destroy(); } });
      }

      // ── Flash de ecrã amarelo ──────────────────────────────────
      const flash = scene.add.graphics().setDepth(200).setScrollFactor(0);
      flash.fillStyle(0xffd700, 0.55);
      flash.fillRect(0, 0, 960, 540);
      scene.tweens.add({ targets:flash, alpha:0, duration:350,
        onComplete:()=>flash.destroy() });

      // ── Explosão de raios dourados MUITO mais visível ──────────
      const rays = scene.add.graphics().setDepth(5);
      rays.fillStyle(0xffd700, 0.80);
      for (let ri=0; ri<12; ri++) {
        const a = (Math.PI*2*ri)/12;
        rays.fillTriangle(s.x, s.y-20,
          s.x+Math.cos(a)*80, s.y-20+Math.sin(a)*80,
          s.x+Math.cos(a+0.22)*80, s.y-20+Math.sin(a+0.22)*80);
      }
      // Segundo anel de raios mais curtos
      rays.fillStyle(0xffffff, 0.60);
      for (let ri=0; ri<8; ri++) {
        const a = (Math.PI*2*ri)/8 + Math.PI/8;
        rays.fillTriangle(s.x, s.y-20,
          s.x+Math.cos(a)*40, s.y-20+Math.sin(a)*40,
          s.x+Math.cos(a+0.30)*40, s.y-20+Math.sin(a+0.30)*40);
      }
      scene.tweens.add({ targets:rays, alpha:0, scaleX:1.8, scaleY:1.8,
        duration:600, ease:"Sine.easeOut", onComplete:()=>rays.destroy() });

      // ── Burst de partículas douradas + coloridas ───────────────
      const burst = scene.add.particles(0,0,"spark_item",{
        x:s.x, y:s.y-20,
        speed:{min:80,max:260}, angle:{min:0,max:360},
        lifespan:520, quantity:30, scale:{start:1.2,end:0}, gravityY:180,
        tint:[0xffd700,0xffffff,0xff9500,0xff80c0,0x80d0ff,0xffe080]
      });
      scene.time.delayedCall(380,()=>burst.destroy());

      // ── Item bónus ─────────────────────────────────────────────
      const keyMap = { estrela:"item_estrela", medalha:"item_medalha", heart:"item_heart", brinquedo:"item_brinquedo", duplosalto:"item_duplosalto", balao:"item_balao_0" };
      const it = itemsGroup.create(s.x, s.y-40, keyMap[s.kind]||"item_estrela");
      it.setDepth(3);
      it.setData("kind", s.kind);
      it.setData("itemIdx", -99);
      it.setData("secretPoints", s.points);
      s.item = it;
      // Este item bónus (recompensa por encontrar um segredo) não está em
      // L.items, por isso não entrava na contagem "⭐ Itens: X/Y" — mas ao
      // ser apanhado incrementa itemsCollected na mesma (ver onCollectItem),
      // fazendo o total mostrado ficar errado. Corrigido aqui, com a mesma
      // regra do apanhar (heart não conta).
      if (s.kind !== "heart") {
        itemsTotal += 1;
        if (itemCountText) itemCountText.setText(`⭐ Itens: ${itemsCollected}/${itemsTotal}`);
      }
      // Item aparece com pop de escala
      it.setScale(0.1);
      scene.tweens.add({ targets:it, scaleX:1, scaleY:1, duration:300, ease:"Back.easeOut" });
      scene.tweens.add({ targets:it, y:it.y-8, duration:940, yoyo:true, repeat:-1, ease:"Sine.easeInOut", delay:300 });

      // ── Texto MUITO MAIOR e mais visível ──────────────────────
      const lbl = scene.add.text(s.x, s.y-60, "🔍 SEGREDO!", {
        fontSize:"26px", fontStyle:"900", color:"#ffd700",
        stroke:"#200040", strokeThickness:7
      }).setOrigin(0.5).setDepth(200).setAlpha(0).setScale(0.5);
      scene.tweens.add({ targets:lbl, alpha:1, scaleX:1.3, scaleY:1.3, y:s.y-100,
        duration:300, ease:"Back.easeOut",
        onComplete:()=>scene.time.delayedCall(1600, ()=>{
          scene.tweens.add({ targets:lbl, alpha:0, y:s.y-130, duration:300,
            onComplete:()=>lbl.destroy() });
        }) });

      // ── Som especial de segredo — fanfarra curta ──────────────
      ensureAudio();
      beep({freq:440, dur:0.06, type:"square",   vol:0.07, slideTo:660});
      setTimeout(()=>beep({freq:660, dur:0.06, type:"square",   vol:0.07, slideTo:880}),  70);
      setTimeout(()=>beep({freq:880, dur:0.10, type:"triangle", vol:0.07, slideTo:1320}), 140);
      setTimeout(()=>beep({freq:1320,dur:0.18, type:"triangle", vol:0.07, slideTo:1760}), 260);

      showFloat(scene, s.x, s.y-140, `✨ +${s.points||10} pontos!`, "#ffe080");
    });
  }

  function clearSecrets() {
    secretDoors.forEach(s => {
      if (s.gfx  && s.gfx.active)  s.gfx.destroy();
      if (s.item && s.item.active)  s.item.destroy();
    });
    secretDoors = [];
  }

  // ===== Letreiros/NPCs — Fase "Mundo Vivo" =====
  // Um pequeno elemento por nível normal (não em arenas de boss). O jogador
  // só precisa de caminhar perto para o "ler" — sem menu, sem pausa forçada.
  function clearSign() {
    if (currentSign) {
      try{ currentSign.obj?.destroy(); }catch{}
      try{ currentSign.badge?.destroy(); }catch{}
    }
    currentSign = null;
  }
  // Cria o letreiro (emoji + badge "!") numa posição dada — partilhado entre
  // os letreiros normais dos níveis (NPC_SIGNS) e o letreiro do objetivo do boss.
  function _createSignAt(scene, x, y, emoji, text) {
    // padding evita que o emoji (glifo largo/duplo) seja cortado pela caixa
    // de render que o Phaser calcula automaticamente para o texto.
    const obj = scene.add.text(x, y, emoji, {
      fontSize:"30px", padding:{ x:10, y:10 }
    }).setOrigin(0.5).setDepth(2);
    scene.tweens.add({ targets:obj, y:y-8, duration:1100, yoyo:true, repeat:-1, ease:"Sine.easeInOut" });
    const badge = scene.add.text(x+16, y-22, "!", {
      fontSize:"15px", fontStyle:"900", color:"#ffe060", stroke:"#200040", strokeThickness:4,
      padding:{ x:6, y:6 }
    }).setOrigin(0.5).setDepth(3);
    scene.tweens.add({ targets:badge, scaleX:{from:0.8,to:1.15}, scaleY:{from:0.8,to:1.15}, duration:520, yoyo:true, repeat:-1, ease:"Sine.easeInOut" });
    return { x, y, obj, badge, wasNear:false, activeLbl:null, text };
  }
  function spawnLevelSign(scene, L, idx) {
    clearSign();
    const entry = NPC_SIGNS[L.artIdx != null ? L.artIdx : idx];
    if (!entry) return;
    // L.signX/L.signY permitem afinar a posição do letreiro num nível específico
    // (por defeito fica a spawn.x+240, mas nalguns níveis isso cai debaixo de
    // uma plataforma elevada — ver Nível 3 em data-levels.js).
    let x = (typeof L.signX === "number") ? L.signX : L.spawn.x + 240;
    const y = (typeof L.signY === "number") ? L.signY : 486;
    // Afastar o letreiro das bordas do nível — perto do início/fim, a câmara
    // fica "encostada" ao limite do mundo e o balão de texto (até 220px de
    // largura) pode acabar parcialmente fora da área visível.
    const SIGN_MARGIN = 160;
    x = Phaser.Math.Clamp(x, SIGN_MARGIN, L.worldW - SIGN_MARGIN);
    currentSign = _createSignAt(scene, x, y, entry.emoji, entry.text);
  }
  // Letreiro do objetivo do boss — mesma UX dos letreiros normais (aproxima-te
  // para "ler"), em vez de depender só do diálogo inicial, que passa depressa.
  function spawnBossSign(scene, x, y, emoji, text) {
    clearSign();
    currentSign = _createSignAt(scene, x, y, emoji, text);
  }
  function updateSigns() {
    if (!currentSign || !player) return;
    const dx = Math.abs(player.x - currentSign.x), dy = Math.abs(player.y - currentSign.y);
    const near = dx <= 130 && dy <= 170;
    // Volta a mostrar a informação sempre que o jogador ENTRA na zona do
    // letreiro (não só na primeira vez) — dispara na transição longe→perto,
    // por isso não repete a cada frame enquanto o jogador está parado ali.
    if (near && !currentSign.wasNear) {
      currentSign.wasNear = true;
      showSignMessage(currentSign);
    } else if (!near) {
      currentSign.wasNear = false;
    }
  }
  function showSignMessage(sign) {
    // Se já houver uma mensagem deste letreiro a meio (ex.: o jogador saiu e
    // voltou a entrar muito depressa), substitui-a em vez de empilhar as duas.
    if (sign.activeLbl) { try { sign.activeLbl.destroy(); } catch {} sign.activeLbl = null; }
    // Texto aparece junto ao próprio letreiro (não no balão do VanBerto's) — só
    // um sítio a mostrar a informação, em vez de duplicar em dois locais.
    const lbl = sceneRef.add.text(sign.x, sign.y-56, sign.text, {
      fontSize:"13px", fontStyle:"800", color:"#baffef", stroke:"#062a28", strokeThickness:4,
      align:"center", wordWrap:{width:200, useAdvancedWrap:true},
      padding:{ x:10, y:8 }
    }).setOrigin(0.5).setDepth(200).setAlpha(0).setScale(0.7);
    sign.activeLbl = lbl;
    sceneRef.tweens.add({ targets:lbl, alpha:1, scaleX:1, scaleY:1, y:sign.y-70, duration:260, ease:"Back.easeOut" });
    sceneRef.time.delayedCall(4200, () => {
      if (!lbl.active) return;
      sceneRef.tweens.add({ targets:lbl, alpha:0, duration:300, onComplete:()=>{ try{lbl.destroy();}catch{} if(sign.activeLbl===lbl) sign.activeLbl=null; } });
    });
  }

  function difficultyFactor(idx) {
    let f = 1 + idx * 0.02;
    if (idx >= 8)  f += (idx - 8)  * 0.015;
    if (idx >= 14) f += (idx - 14) * 0.02;
    return Math.min(1.35, f); // cap mais baixo — 1.35 em vez de 1.85
  }

  // ===== Carregar nível =====
  function loadLevel(scene,idx){
    currentLevel=idx;
    controlsInvertedUntil = 0;
    const L=LEVELS[currentLevel];
    const T=THEMES[L.theme%THEMES.length];

    scene.physics.world.setBounds(0,0,L.worldW,514);
    scene.cameras.main.setBounds(0,0,L.worldW,540);

    enemyTimers.forEach(t=>{try{t.remove(false);}catch{}}); enemyTimers=[];
    bossTimers.forEach(t=>{try{t.remove(false);}catch{}}); bossTimers=[];
    platforms.clear(true,true);itemsGroup.clear(true,true);
    malwareGroup.clear(true,true);
    clearBossArenaDecor(); // segurança: sem isto, os "livros flutuantes" do Monstro
                            // ficavam órfãos no ecrã depois de se vencer o boss
    if(door){door.destroy();door=null;}
    spawnLevelSign(scene, L, idx);

    // Recriar HUD de orbes (profundidade sobrevive ao clear das plataformas)
    createArtOrbs(scene);

    // Manter awaitingQuiz=true e física pausada durante todo o setup do nível.
    // O chamador (nextLevel → showHistory callback) é responsável por fazer resume().
    // Evita que o overlap da porta dispare no 1º frame antes do player estar no spawn.
    // Cancelar timers da porta pendentes antes de qualquer setup do nível
    if(_doorWatchdogTimer){ try{_doorWatchdogTimer.remove(false);}catch{} _doorWatchdogTimer=null; }
    if(_landingCheckTimer){ try{_landingCheckTimer.remove(false);}catch{} _landingCheckTimer=null; }
    awaitingQuiz=true; invuln=false; clearPower(scene); clearDoubleJump(scene); clearStarPower(scene); livesLostThisLevel=0; _doorAnimRunning=false; resetLevelStarTracking();
    isCrouching=false; setCrouchHitbox(player, false);
    scene.physics.pause();
    // Garantir que halo e sombra estão visíveis no início do nível
    if(powerHaloGfx) powerHaloGfx.setVisible(true);
    if(shadowGfx)    shadowGfx.setVisible(true);
    itemsCollected=0; itemsTotal=L.items.filter(it=>it.kind!=="heart").length; extraShieldCounted=false;
    collectedItemIndices=new Set();
    _hudDirty=true; updateHUD(L); applyBackground(scene,L.theme%THEMES.length,L.worldW,L.hazards||[]);

    L.platforms.forEach(p=>{
      const themeIdx = L.theme % THEMES.length;
      const platKey = "platform_t"+themeIdx;
      if(!scene.textures.exists(platKey)) makePlatformTextureThemed(scene, platKey, themeIdx);
      const plat=platforms.create(p.x,p.y,platKey);
      plat.displayWidth=p.w; plat.displayHeight=p.h; plat.refreshBody();
      if(plat.body){plat.body.checkCollision.left=false;plat.body.checkCollision.right=false;}
    });

    door=scene.physics.add.staticSprite(L.doorX,448,"door_party").setDisplaySize(88,104);
    door.refreshBody(); // sincronizar hitbox físico com o tamanho visual (setDisplaySize não o faz automaticamente)
    door.clearTint();
    // Guardar referência ao collider para o poder destruir no momento do toque (evita re-disparo no móvel)
    if(doorOverlap) { try{ scene.physics.world.removeCollider(doorOverlap); }catch{} doorOverlap=null; }
    let _doorTriggered=false; // guarda local — evita disparo duplo no mesmo frame
    const _spawnX = L.spawn.x; // guardar spawn para verificação de distância mínima
    doorOverlap = scene.physics.add.overlap(player,door,()=>{
      if(awaitingQuiz||_doorTriggered||invuln) return;
      // Segurança: ignorar overlap se o player ainda está perto do spawn (evita disparo falso no 1º frame após resume)
      if(Math.abs(player.x - _spawnX) < 200) return;
      _doorTriggered=true;
      try{ scene.physics.world.removeCollider(doorOverlap); doorOverlap=null; }catch{}
      tryOpenDoor(scene);
    },null,scene);
    scene.tweens.add({targets:door,alpha:{from:1,to:0.82},duration:900,yoyo:true,repeat:-1});

    // Decorações animadas nas plataformas
    spawnPlatformDecor(scene, platforms);

    const keyMap={
      estrela:"item_estrela",
      balao:"item_chupachupa",
      brinquedo:"item_brinquedo",medalha:"item_medalha",heart:"item_heart",
      duplosalto:"item_duplosalto"
    };
    // Velocidade de rotação por tipo de item — removida (itens ficam fixos)
    const rotSpeeds={};
    L.items.forEach((it,idx)=>{
      const _km=keyMap[it.kind]; const _key=typeof _km==="function"?_km():(_km||"item_estrela");
      const obj=itemsGroup.create(it.x,it.y,_key);
      obj.setDepth(2);
      scene.tweens.add({targets:obj,y:obj.y-8,duration:940,yoyo:true,repeat:-1,ease:"Sine.easeInOut"});
      obj.setData("kind",it.kind);
      obj.setData("itemIdx",idx);
    });

    // Halo da porta (criado aqui, atualizado no update)
    resetDoorGlow(scene);

    const df=difficultyFactor(currentLevel);
    L.malwares.forEach(m=>spawnVilao(scene,m.x,480,m.vx,df,m.pattern||"patrol"));

    // Garantir que os 3 tipos de vilao aparecem SEMPRE em todos os niveis
    if(L.platforms.length>=5) {
      const mid  = L.platforms[Math.floor(L.platforms.length/2)];
      const q1   = L.platforms[Math.floor(L.platforms.length/4)];
      const q3   = L.platforms[Math.floor(L.platforms.length*3/4)];

      // Tipo 1 - vilao_round (mini/redondo): sempre presente, zona central
      spawnVilao(scene, mid.x, 480, (currentLevel%2===0)?120:-120, df, "mini");

      // Tipo 2 - vilao_spike (patrol): sempre presente no 1/4 do nivel
      spawnVilao(scene, q1.x, 480, (currentLevel%2===0)?-170:170, df, "patrol");

      // Tipo 3 - vilao_bug (jumper): sempre presente no 3/4 do nivel (a partir do nivel 2)
      if(currentLevel>=2){
        spawnVilao(scene, q3.x, 480, (currentLevel%2===0)?190:-190, df, "jumper");
      }
      // Segundo jumper extra a partir do nivel 4
      if(currentLevel>=4){
        const qEx = L.platforms[Math.floor(L.platforms.length*2/3)];
        spawnVilao(scene, qEx.x, 480, (currentLevel%2===0)?-200:200, df, "jumper");
      }
      // Terceiro jumper e patrol extra nos ultimos 6 niveis (14-20)
      if(currentLevel>=14){
        const qLate = L.platforms[Math.floor(L.platforms.length*5/6)] || q3;
        spawnVilao(scene, qLate.x, 480, (currentLevel%2===0)?210:-210, df, "jumper");
        spawnVilao(scene, q1.x+200, 480, (currentLevel%2===0)?-160:160, df, "patrol");
      }
      // Ultimo nivel — viloes em todos os quartos
      if(currentLevel>=19){
        spawnVilao(scene, mid.x+300, 480, (currentLevel%2===0)?220:-220, df, "jumper");
        spawnVilao(scene, mid.x-300, 480, (currentLevel%2===0)?-180:180, df, "patrol");
      }
    }

    spawnBalloons(scene,L.worldW);
    spawnCritters(scene,L.worldW);
    spawnShields(scene,L);
    clearMovingPlatforms(); spawnMovingPlatforms(scene,L);
    clearTrampolines();     spawnTrampolines(scene,L);
    clearSecrets();         spawnSecrets(scene,L);
    clearHazards();         spawnHazards(scene,L);

    player.setAlpha(0); player.setAngle(0); player.setFlipX(false); player.setOrigin(0.5,0.5); player.setDepth(3);
    // Importante: manter o tamanho NORMAL aqui (não o "achatado" do pop de
    // entrada) — snapPlayerToGround(), chamado mais abaixo, precisa de medir
    // o corpo físico ao tamanho real. A animação de "pop" (encolhida→normal)
    // só é aplicada mais tarde por revealPlayerEntrance(), quando o jogo
    // realmente arranca — nunca aqui, enquanto a física ainda está pausada
    // e nada corrigiria um eventual desalinhamento entretanto.
    if(player.getData("usingPng")){
      player.setDisplaySize(72, 72);
    } else {
      player.setScale(1);
    }
    player.setPosition(L.spawn.x, L.spawn.y); player.setVelocity(0, 0);
    if (player.body) player.body.reset(L.spawn.x, L.spawn.y); // forçar corpo físico para o spawn imediatamente
    // Snap instantâneo da câmara para o spawn, depois repor lerp suave para o jogo.
    // Importante: centrar em L.spawn.y (posição real do VanBerto's), não num Y fixo —
    // um valor fixo (ex: 270) não corresponde ao chão do nível, o que fazia o
    // VanBerto's aparecer "afundado" perto do fundo do ecrã ao arrancar o nível
    // (visível sobretudo no ecrã "Sabias que...?", que aparece antes de a câmara
    // ter tempo de se corrigir sozinha a seguir o jogador).
    scene.cameras.main.startFollow(player, true, 1.0, 1.0);
    scene.cameras.main.centerOn(L.spawn.x, L.spawn.y);
    scene.time.delayedCall(50, () => scene.cameras.main.startFollow(player, true, 0.08, 0.08));
    touch.left=touch.right=touch.jump=touch.crouch=false;
    // Alinhar já o VanBerto's ao chão (mesmo cálculo que antes corria 80ms
    // depois) — mas sem o revelar. Enquanto o cartão de transição/"Sabias
    // que...?" estiver a decorrer, a física continua pausada, por isso
    // nada vai desalinhar isto entretanto. A animação de entrada (fade-in +
    // "pop") só corre em revealPlayerEntrance(), chamada quando o jogo
    // realmente arranca (ver showHistory).
    snapPlayerToGround();
    _pendingEntranceReveal = true;

    const TIPS = [
      "🌟 Apanha estrelas e chega ao Portal ✨!",
      "🎈 Apanha balões no ar e chupa-chupas nas plataformas!",
      "🧸 A Convenção de 1989 protege todas as crianças!",
      "🦘 USA OS TRAMPOLINS! Os vãos são intransponíveis sem eles!",
      "📚 Apanha itens e chega ao Portal ✨!",
      "💊 Todas as crianças têm direito à saúde!",
      "🛡️ Evita os vilões e protege os teus direitos!",
      "🗣️ A tua opinião conta! Chega à porta!",
      "🌱 O futuro sustentável depende de ti!",
      "🌍 A UNICEF defende todas as crianças do mundo!",
      "🪪 Toda a criança tem direito a um nome e identidade!",
      "👨‍👩‍👧 A família é o primeiro lugar de amor e segurança!",
      "✈️ Crianças refugiadas têm os mesmos direitos que todas!",
      "🔥 CUIDADO COM A LAVA! Mantém-te nas plataformas — não caias!",
      "🗣️ A tua voz importa — tens direito à expressão!",
      "🔒 A tua privacidade online é um direito — protege-a!",
      "🌍 Cada língua e cultura é um tesouro único!",
      "🏃 As plataformas MOVEM-SE! Observa o ritmo antes de saltar!",
      "🌱 O planeta precisa de ti — cuida do ambiente!",
      "💻 Os teus direitos existem também no mundo digital!"
    ];
    currentLevelTip = (TIPS[currentLevel] || TIPS[0]) + (currentLevel >= 6 ? " ⚠️ Cuidado!" : "");
    tipText.setText(currentLevelTip);
    ensureAudio(); SFX.door(); saveGame();
  }

  /*
   * spawnVilao — 3 padrões de comportamento:
   *   "mini"    → patrulha zona pequena (±120px), devagar, sem saltar (mais fácil, níveis 1-3)
   *   "patrol"  → patrulha horizontal normal (médio, níveis 1-8)
   *   "jumper"  → patrulha E salta frequentemente (difícil, níveis 7-10)
   */
  function spawnVilao(scene, x, y, vx, df, pattern="patrol") {
    const keyMap = { mini:"vilao_round", patrol:"vilao_spike", jumper:"vilao_bug" };
    const keys = ["vilao_round","vilao_spike","vilao_bug"];
    const key = keyMap[pattern] || keys[Math.floor(Math.random()*keys.length)];

    const v = malwareGroup.create(x, y, key);
    v.setCollideWorldBounds(true);
    v.setBounce(0);
    // Tamanho distinto por tipo: mini=pequeno, patrol=médio, jumper=grande
    if (pattern === "mini") {
      v.setDisplaySize(36, 36); v.body.setSize(34, 34, true);
    } else if (pattern === "jumper") {
      v.setDisplaySize(58, 58); v.body.setSize(54, 54, true);
    } else {
      v.setDisplaySize(48, 48); v.body.setSize(48, 48, true);
    }
    v.setDepth(2);
    v.setData("pattern", pattern);
    v.setData("originX", x);
    v.setData("originY", y);

    if (pattern === "mini") {
      const miniSpeed = 60 + Math.random() * 40;
      v.setVelocityX(miniSpeed);
      v.setData("speed", miniSpeed);
      v.setData("dir", 1);
      v.setData("minLeft",  x - 120);
      v.setData("minRight", x + 120);
    } else if (pattern === "jumper") {
      const spd = Math.round(Math.abs(vx) * df * 0.60) || 120;
      v.setVelocityX(vx >= 0 ? spd : -spd);
      v.setData("speed", spd);
      v.setData("dir", vx >= 0 ? 1 : -1);
    } else {
      const spd = Math.round(Math.abs(vx) * df) || 120;
      v.setVelocityX(vx >= 0 ? spd : -spd);
      v.setData("speed", spd);
      v.setData("dir", vx >= 0 ? 1 : -1);
    }

    // Saltos periódicos — só patrol e jumper
    if (pattern === "patrol" || pattern === "jumper") {
      const jumpInterval = pattern === "jumper"
        ? 1400 + Math.random() * 700
        : 2200 + Math.random() * 1400;

      const outerTimer = scene.time.addEvent({
        delay: 400 + Math.random() * 1000,
        callback: () => {
          const innerTimer = scene.time.addEvent({
            delay: jumpInterval, loop: true,
            callback: () => {
              if (!v.active || !v.body) return;
              if (!v.body.blocked.down) return;
              if (pattern === "jumper" && player) {
                // Salto inteligente: força proporcional à altura do jogador
                const dy = v.y - player.y; // positivo se jogador está acima
                const targetForce = dy > 30
                  ? -Math.min(780, Math.sqrt(2 * 1100 * (dy + 30)) + 60)
                  : -380;
                // Virar na direção do jogador ao saltar
                const dirX = player.x > v.x ? 1 : -1;
                const spd2 = v.getData("speed") || 150;
                v.setVelocityX(dirX * spd2);
                v.setVelocityY(targetForce);
              } else {
                v.setVelocityY(-420 - Math.random() * 80);
              }
            }
          });
          enemyTimers.push(innerTimer);
        }
      });
      enemyTimers.push(outerTimer);
    }

    // Timer anti-stuck: verifica posição real a cada 600ms
    let lastX = v.x;
    const stuckTimer = scene.time.addEvent({
      delay: 600, loop: true,
      callback: () => {
        if (!v.active || !v.body) return;
        const moved = Math.abs(v.x - lastX);
        if (moved < 4) {
          // Verdadeiramente parado — forçar velocidade na direção guardada
          const d = v.getData("dir") || 1;
          const s = v.getData("speed") || 120;
          v.setVelocityX(s * d);
        } else {
          // Atualizar dir com base no movimento real
          if (v.x > lastX) v.setData("dir", 1);
          else v.setData("dir", -1);
        }
        lastX = v.x;
      }
    });
    enemyTimers.push(stuckTimer);

    // Animações visuais
    if (pattern === "mini") {
      // Rotação lenta + pulsação suave — menos ameaçador
      scene.tweens.add({targets:v, angle:{from:-8,to:8},
        duration:1100+Math.random()*400, yoyo:true, repeat:-1, ease:"Sine.easeInOut"});
      scene.tweens.add({targets:v, scaleX:{from:0.92,to:1.08}, scaleY:{from:1.08,to:0.92},
        duration:900+Math.random()*300, yoyo:true, repeat:-1, ease:"Sine.easeInOut"});

    } else if (pattern === "patrol") {
      scene.tweens.add({targets:v, angle:{from:-6,to:6},
        duration:700+Math.random()*300, yoyo:true, repeat:-1, ease:"Sine.easeInOut"});
      scene.tweens.add({targets:v, scaleX:{from:1.0,to:1.15}, scaleY:{from:1.0,to:1.15},
        duration:500+Math.random()*200, yoyo:true, repeat:-1, ease:"Sine.easeInOut"});

    } else if (pattern === "jumper") {
      scene.tweens.add({targets:v, angle:{from:-12,to:12},
        duration:320+Math.random()*160, yoyo:true, repeat:-1, ease:"Sine.easeInOut"});
      scene.tweens.add({targets:v, scaleX:{from:0.95,to:1.20}, scaleY:{from:1.20,to:0.95},
        duration:380+Math.random()*120, yoyo:true, repeat:-1, ease:"Sine.easeInOut"});

    }
  }



  function updateHUD(L) {
    hudText.setText(`${L.name}  (${currentLevel+1}/${LEVELS.length})`);
    scoreText.setText(`🌟 Pontos: ${score}`);
    updateHearts();
    itemCountText.setText(`⭐ Itens: ${itemsCollected}/${itemsTotal}`);
    if(powerIndicator&&!powered) powerIndicator.setText("");
    if(playerNameHUD){
      playerNameHUD.textContent = playerName ? `⭐ ${playerName}` : "";
      playerNameHUD.style.display = playerName ? "block" : "none";
    }
    updateProgressBar(L);
  }

  function updateProgressBar(L) {
    if(!progressFill) return;
    progressFill.clear();
    const BAR_X=8,BAR_Y=110,BAR_W=230,BAR_H=10;
    const levelPct=currentLevel/LEVELS.length;
    const levelNextPct=(currentLevel+1)/LEVELS.length;
    progressFill.fillStyle(0x200040,0.55);
    progressFill.fillRoundedRect(BAR_X,BAR_Y,Math.max(4,Math.round(BAR_W*levelPct)),BAR_H,5);
    if(player&&L){
      const worldW=L.worldW||2600,doorX=L.doorX||worldW-200,spawnX=L.spawn?.x||120;
      const px=Math.max(spawnX,Math.min(player.x,doorX));
      const inLevelPct=(px-spawnX)/Math.max(1,doorX-spawnX);
      const segStart=BAR_X+Math.round(BAR_W*levelPct);
      const segEnd=BAR_X+Math.round(BAR_W*levelNextPct);
      const segW=segEnd-segStart;
      progressFill.fillStyle(0xff6b35,0.9);
      progressFill.fillRoundedRect(segStart,BAR_Y,Math.max(3,Math.round(segW*inLevelPct)),BAR_H,5);
      const markerX=segStart+Math.round(segW*inLevelPct);
      progressFill.fillStyle(0x200040,1); progressFill.fillCircle(markerX,BAR_Y+BAR_H/2,6);
      progressFill.fillStyle(0xffd700,1); progressFill.fillCircle(markerX,BAR_Y+BAR_H/2,3);
      progressFill.fillStyle(0xff6b35,1); progressFill.fillRect(segEnd-5,BAR_Y+1,8,BAR_H-2);
    }
  }

  function updateHearts(){
    if(!heartsGfx) return;
    heartsGfx.clear();
    const startX=14,y=56,size=12,gap=17;
    for(let i=0;i<MAX_LIVES;i++){
      const x=startX+i*gap, full=i<lives;
      const r=size*0.52;
      heartsGfx.fillStyle(full?0xe84d10:0xffc0a0,full?1:0.4);
      heartsGfx.fillCircle(x-r*0.55,y-r*0.18,r); heartsGfx.fillCircle(x+r*0.55,y-r*0.18,r);
      heartsGfx.fillTriangle(x-size,y-r*0.1,x+size,y-r*0.1,x,y+size*1.05);
      if(full){heartsGfx.fillStyle(0xffffff,0.3);heartsGfx.fillCircle(x-r*0.3,y-r*0.5,r*0.3);}
    }
  }

  // Anima a entrada do VanBerto's (fade-in + "pop" estica-encolhe) — chamada
  // só quando o jogo realmente arranca (ver showHistory), nunca enquanto o
  // cartão de transição ou o "Sabias que...?" ainda estão visíveis. Os pés
  // ficam sempre presos ao chão durante a animação (ver pinFeet), mesmo que
  // esta corra já com a física em andamento.
  function revealPlayerEntrance(scene) {
    if (!_pendingEntranceReveal) return;
    _pendingEntranceReveal = false;
    if (!player) return;
    const groundY = player.y;
    const finalH  = player.displayHeight;
    const pinFeet = () => { player.y = groundY - (player.displayHeight - finalH) / 2; };
    const onComplete = () => {
      pinFeet();
      if (sceneRef && !sceneRef.physics.world.isPaused) player.setVelocityY(-160);
    };
    if (player.getData("usingPng")) {
      scene.tweens.add({
        targets: player,
        alpha: { from: 0, to: 1 },
        displayWidth:  { from: 72*0.6, to: 72 },
        displayHeight: { from: 72*1.3, to: 72 },
        duration: 320, ease: "Back.easeOut",
        onUpdate: pinFeet,
        onComplete
      });
    } else {
      scene.tweens.add({
        targets: player,
        alpha: { from: 0, to: 1 },
        scaleX: { from: 0.6, to: 1 },
        scaleY: { from: 1.3, to: 1 },
        duration: 320, ease: "Back.easeOut",
        onUpdate: pinFeet,
        onComplete
      });
    }
  }

  // ===== Agachar — hitbox e reposição =====
  // Ajusta o corpo físico (não só o visual) quando o estado de agachado muda,
  // seguindo o mesmo padrão de valores fixos que snapPlayerToGround() já usa
  // — os pés ficam sempre no mesmo sítio, só a altura do corpo encolhe.
  function setCrouchHitbox(playerObj, crouching){
    if (!playerObj || !playerObj.body) return;
    if (playerObj.getData("usingPng")) {
      if (crouching) { playerObj.body.setSize(44,28); playerObj.body.setOffset(14,38); }
      else            { playerObj.body.setSize(44,52); playerObj.body.setOffset(14,14); }
    } else {
      if (crouching) { playerObj.body.setSize(44,24); playerObj.body.setOffset(26,70); }
      else            { playerObj.body.setSize(44,48); playerObj.body.setOffset(26,46); }
    }
  }
  // Força a saída do estado agachado (chamado sempre que o jogo pausa a física
  // por outras razões — quiz, porta, transição — para nunca ficar "preso"
  // visualmente encolhido nem com a hitbox pequena por engano).
  function exitCrouch(){
    if (!isCrouching) return;
    isCrouching = false;
    if (player) { setCrouchHitbox(player, false); player.setScale(1); }
  }

  function snapPlayerToGround(){
    if(!player?.body||!platforms) return;
    // Nota: NÃO usar updateFromGameObject() aqui — esta função corre 80ms
    // depois do início do nível, ENQUANTO o "pop" de entrada ainda está a
    // meio (o VanBerto's começa achatado/pequeno e só depois anima até ao
    // tamanho normal). updateFromGameObject() copiava esse tamanho
    // temporário e distorcido para o corpo físico, o que desalinhava o
    // cálculo do chão e fazia o VanBerto's aparecer meio enterrado no
    // passeio/relva assim que o nível arrancava. Repor sempre o hitbox
    // definido em create() garante que o alinhamento ao chão usa o
    // tamanho real do personagem, independentemente da animação em curso.
    if(player.getData("usingPng")){
      player.body.setSize(44,52);
      player.body.setOffset((72-44)/2,(72-52)/2+4);
    } else {
      player.body.setSize(44,48);
      player.body.setOffset(26,46);
    }
    const pb=player.body; let best=null,bestTop=Infinity;
    platforms.getChildren().forEach(p=>{
      if(!p.body) return;
      if(pb.right>p.body.left&&pb.left<p.body.right){
        const top=p.body.top;
        if(top>=pb.bottom-2&&top<bestTop){bestTop=top;best=p;}
      }
    });
    if(best){const dy=pb.bottom-(best.body.top-1);player.setVelocity(0,0);player.y-=dy;player.body.updateFromGameObject();}
  }

  // ===== Porta + Quiz =====
  function tryOpenDoor(scene){
    if(awaitingQuiz) return;
    awaitingQuiz=true;
    // Parar melodia da estrela ao chegar à porta
    if(_starMelodyInterval){ clearInterval(_starMelodyInterval); _starMelodyInterval=null; }
    // Cancelar TODOS os timers/tweens que possam alterar alpha/scale do player
    if(scene && scene.tweens) scene.tweens.killTweensOf(player);
    if(invulnBlinkEvent){ invulnBlinkEvent.remove(false); invulnBlinkEvent=null; }
    if(invulnEndEvent){   invulnEndEvent.remove(false);   invulnEndEvent=null; }
    if(starPowerTimer){   starPowerTimer.remove(false);   starPowerTimer=null; }
    if(starPowerCountdown){ starPowerCountdown.remove(false); starPowerCountdown=null; }
    if(poweredTimer){     poweredTimer.remove(false);     poweredTimer=null; }
    if(powerCountdown){   powerCountdown.remove(false);   powerCountdown=null; }
    if(doubleJumpTimer){  doubleJumpTimer.remove(false);  doubleJumpTimer=null; }
    if(doubleJumpCountdown){ doubleJumpCountdown.remove(false); doubleJumpCountdown=null; }
    invuln=false; starPower=false; powered=false; doubleJumpActive=false;
    player.setAlpha(1); player.setScale(1); player.clearTint();
    // Remover overlap da porta imediatamente — antes de qualquer resume() da física
    if(doorOverlap){ try{ scene.physics.world.removeCollider(doorOverlap); }catch{} doorOverlap=null; }
    // Esconder halo e sombra imediatamente — não redesenhar durante animação
    if(powerHaloGfx) { powerHaloGfx.clear(); powerHaloGfx.setVisible(false); }
    if(shadowGfx)    { shadowGfx.clear();    shadowGfx.setVisible(false); }
    player.setVelocityX(0);
    player.setFlipX(false);
    touch.left=touch.right=touch.jump=touch.crouch=false;
    const doorOrigX = door.x;
    // Garantir que a física está ativa para o body.blocked atualizar corretamente
    scene.physics.resume();
    let waited = 0;
    let _animStarted = false; // guarda — impede startDoorAnimation de ser chamado duas vezes
    if(_landingCheckTimer){ try{_landingCheckTimer.remove(false);}catch{} _landingCheckTimer=null; }
    _landingCheckTimer = scene.time.addEvent({
      delay: 16, loop: true,
      callback: () => {
        if(_animStarted) return;
        waited += 16;
        const onGround = player.body && player.body.blocked.down;
        // No móvel o body.blocked pode não atualizar — forçar após 200ms
        if (onGround || waited >= 200) {
          _animStarted = true;
          if(_landingCheckTimer){ try{_landingCheckTimer.remove(false);}catch{} _landingCheckTimer=null; }
          player.setVelocity(0, 0);
          snapPlayerToGround();
          scene.physics.pause();
          ensureAudio(); SFX.doorOpen();
          startDoorAnimation(scene, doorOrigX);
        }
      }
    });
    // Timeout de segurança: se ao fim de 7s o quiz ainda não apareceu, desbloquear
    // (antes eram 4s — a dança do robô antes do portal sugar acrescenta ~800ms à
    // sequência normal, e 4s ficava demasiado apertado, disparando o watchdog a
    // meio da animação e cortando a transição de nível)
    // Guarda snapshot do nível para evitar disparo no nível seguinte
    _levelAtDoorTrigger = currentLevel;
    if(_doorWatchdogTimer){ try{_doorWatchdogTimer.remove(false);}catch{} _doorWatchdogTimer=null; }
    _doorWatchdogTimer = scene.time.delayedCall(7000, () => {
      _doorWatchdogTimer = null;
      if (!awaitingQuiz) return; // já resolveu normalmente
      if (currentLevel !== _levelAtDoorTrigger) return; // já avançou de nível
      if (awaitingStory) return; // história ainda visível — não interferir
      const quizVisible = !quizOverlay.classList.contains("hidden");
      if (!quizVisible) {
        // Quiz não apareceu — desbloquear o jogo
        awaitingQuiz = false;
        _doorAnimRunning = false;
        if(powerHaloGfx) powerHaloGfx.setVisible(true);
        if(shadowGfx)    shadowGfx.setVisible(true);
        scene.physics.resume();
        // Recriar o overlap da porta para nova tentativa
        if(doorOverlap) { try{ scene.physics.world.removeCollider(doorOverlap); }catch{} doorOverlap=null; }
        let _retryTriggered=false;
        doorOverlap = scene.physics.add.overlap(player, door, () => {
          if(awaitingQuiz||_retryTriggered||invuln) return;
          if(Math.abs(player.x - door.x) > 120) return; // segurança extra: só activa perto da porta
          _retryTriggered=true;
          try{ scene.physics.world.removeCollider(doorOverlap); doorOverlap=null; }catch{}
          tryOpenDoor(scene);
        }, null, scene);
      }
    });
  }

  let _doorAnimRunning = false;
  function startDoorAnimation(scene, doorOrigX){
    // Impedir execução dupla — só pode correr uma vez por abertura de porta
    if(_doorAnimRunning) return;
    _doorAnimRunning = true;
    door.setOrigin(0.5, 0.5);
    door.x = doorOrigX;

    // FASE 1 — portal pulsa para indicar que está a ativar
    scene.tweens.add({
      targets: door,
      scaleX: { from: 1, to: 1.18 },
      scaleY: { from: 1, to: 1.18 },
      duration: 120, yoyo: true, repeat: 3,
      ease: "Sine.easeInOut",
      onComplete: () => {
        door.x = doorOrigX;
        door.setScale(1);

        // Brilho dourado no chão à frente do portal
        const glow = scene.add.graphics().setDepth(10);
        glow.fillStyle(0xffd700, 0.7);
        glow.fillEllipse(doorOrigX, door.y + 36, 90, 20);
        scene.tweens.add({ targets: glow, alpha: { from: 0.7, to: 0 }, duration: 600,
          onComplete: () => glow.destroy() });

        // Burst de partículas ao ativar o portal
        const portalBurst = scene.add.particles(0, 0, "spark_item", {
          x: doorOrigX, y: door.y - 20,
          speed: { min: 60, max: 200 }, lifespan: 500, quantity: 22,
          scale: { start: 1.1, end: 0 }, gravityY: 60,
          angle: { min: 0, max: 360 },
          tint: [0xffd700, 0xa060ff, 0x80d0ff, 0xff6b35, 0xffffff]
        });
        scene.time.delayedCall(400, () => portalBurst.destroy());

        // FASE 1.5 — o VanBerto's faz a dança do robô antes de ser sugado
        playVanBertoDance(scene, () => {

        // FASE 2 — portal gira e cresce (ativação)
        scene.tweens.add({
          targets: door,
          angle: { from: 0, to: 360 },
          scaleX: { from: 1, to: 1.3 },
          scaleY: { from: 1, to: 1.3 },
          duration: 400, ease: "Back.easeIn",
          onComplete: () => {

            // FASE 3 — robot voa para o portal (spin + encolhe)
            player.setDepth(2);
            player.setFlipX(false);

            // Pequenas partículas do portal ao absorver
            const burst = scene.add.particles(0, 0, "spark_item", {
              x: doorOrigX, y: door.y - 10,
              speed: { min: 30, max: 120 },
              lifespan: 400, quantity: 14,
              scale: { start: 0.8, end: 0 },
              gravityY: -40,
              angle: { min: 0, max: 360 },
              tint: [0xffd700, 0xa060ff, 0xffffff, 0x80d0ff]
            });
            scene.time.delayedCall(320, () => burst.destroy());

            // Robot desloca-se até ao portal enquanto gira
            scene.tweens.add({
              targets: player,
              x: doorOrigX,
              y: door.y - 18,
              duration: 280, ease: "Sine.easeIn",
              onComplete: () => {

                // FASE 4 — robot entra no portal: gira e desaparece no vórtice
                scene.tweens.add({
                  targets: player,
                  scaleX: { from: player.scaleX, to: 0.05 },
                  scaleY: { from: player.scaleY, to: 0.05 },
                  angle:  { from: 0, to: 720 },
                  alpha: { from: 1, to: 0 },
                  duration: 280, ease: "Sine.easeIn",
                  onComplete: () => {
                    // Robot está completamente dentro da porta
                    // Matar todos os tweens (invuln, star power, etc.) para nenhum restaurar o alpha
                    if(scene && scene.tweens) scene.tweens.killTweensOf(player);
                    if(invulnBlinkEvent){ invulnBlinkEvent.remove(false); invulnBlinkEvent=null; }
                    if(invulnEndEvent){   invulnEndEvent.remove(false);   invulnEndEvent=null; }
                    invuln = false;
                    player.setOrigin(0.5, 0.5);
                    player.setScale(1);
                    player.setAlpha(0); // manter invisível enquanto o quiz está aberto
                    player.setDepth(3);
                    // Esconder porta completamente durante o quiz
                    door.setOrigin(0.5, 0.5);
                    door.x = doorOrigX;
                    door.setScale(1);
                    door.setAlpha(0);

                    // Label "Responde!"
                    const label = scene.add.text(doorOrigX, door.y - 70, "✨ Responde! ✨", {
                      fontSize: "20px", fontStyle: "900",
                      color: "#ffd700", stroke: "#200040", strokeThickness: 5
                    }).setOrigin(0.5).setDepth(20).setAlpha(0);
                    scene.tweens.add({
                      targets: label, alpha: 1, y: door.y - 88,
                      duration: 240, ease: "Back.easeOut",
                      onComplete: () => scene.time.delayedCall(280, () => {
                        scene.tweens.add({ targets: label, alpha: 0, duration: 160,
                          onComplete: () => label.destroy() });
                      })
                    });

                    // FASE 5 — mostrar quiz
                    scene.time.delayedCall(560, () => {
                      if(!awaitingQuiz) return; // segurança: só mostrar se ainda estamos à espera
                      _doorAnimRunning = false; // reset para próxima porta
                      lastQuizTheme = LEVELS[currentLevel].quizTheme;
                      showQuiz(pickQuizForLevel(currentLevel, LEVELS[currentLevel].quizTheme), (ok) => {
                        if(ok){
                          ensureAudio();
                          if(currentLevel===LEVELS.length-1) SFX.finalWin(); else SFX.win();
                          finalizeLevelStars(currentLevel, livesLostThisLevel);
                          markLevelCompleted(currentLevel);
                          // Reavaliar conquistas AGORA, com a contagem de níveis já atualizada
                          // (a chamada dentro de showQuiz() corre antes de markLevelCompleted,
                          // por isso "Guardião", "Mestre" e "Lenda" nunca desbloqueavam — bug corrigido).
                          checkAchievements(mapProgress.levelsCompleted.length);
                          showRightRecovered(currentLevel);
                          nextLevel(scene);
                        }
                      });
                    });
                  }
                });
              }
            });
          }
        });

        }); // fim playVanBertoDance (FASE 1.5)
      }
    });
  }

  // Frases motivacionais por nível — mostradas na transição de entrada

  function playLevelTransition(scene, nextIdx, onMidpoint, onComplete){
    const nextL = LEVELS[nextIdx];
    if(!nextL){ onMidpoint?.(); onComplete?.(); return; }

    const ov    = document.getElementById("levelTransitionOverlay");
    const panel = document.getElementById("levelTransitionPanel");
    const elNum    = document.getElementById("ltNum");
    const elTitle  = document.getElementById("ltTitle");
    const elPhrase = document.getElementById("ltPhrase");
    const elName   = document.getElementById("ltName");
    if(!ov){ onMidpoint?.(); onComplete?.(); return; }

    // Cor do céu do nível seguinte
    const T      = THEMES[nextL.theme] || THEMES[0];
    const topHex = T.skyTop;
    const botHex = T.skyBot;
    const topR=(topHex>>16)&0xff, topG=(topHex>>8)&0xff, topB=topHex&0xff;
    const botR=(botHex>>16)&0xff, botG=(botHex>>8)&0xff, botB=botHex&0xff;
    const midR=Math.round((topR+botR)/2), midG=Math.round((topG+botG)/2), midB=Math.round((topB+botB)/2);
    const brightness = 0.299*midR + 0.587*midG + 0.114*midB;
    const isDark = brightness < 110;

    const topCss = `rgb(${topR},${topG},${topB})`;
    const botCss = `rgb(${botR},${botG},${botB})`;
    const textCol  = isDark ? "#ffd700" : "#1a0040";
    const subCol   = isDark ? "#ffe0b0" : "#3a0868";
    const nameCol  = isDark ? "#fff5e0" : "#200050";
    const numCol   = isDark ? "rgba(255,215,0,0.80)" : "rgba(40,0,80,0.65)";
    const borderCol= isDark ? "rgba(255,215,0,0.35)" : "rgba(255,255,255,0.45)";

    // Aplicar estilos dinâmicos
    ov.style.background    = `linear-gradient(180deg, ${topCss} 0%, ${botCss} 100%)`;
    panel.style.borderColor = borderCol;
    panel.style.background  = isDark ? "rgba(0,0,0,0.40)" : "rgba(255,255,255,0.18)";

    elNum.style.color    = numCol;
    elNum.textContent    = `Nível ${nextIdx+1} / ${LEVELS.length}`;
    elTitle.style.color  = textCol;
    elTitle.textContent  = nextL.name.replace(/^Nível \d+\s*[—–-]\s*/, "");
    elPhrase.style.color = subCol;
      {
      elPhrase.textContent = LEVEL_ENTRY_PHRASES[nextIdx] || "Vai em frente! 🎈";
    }
    elName.style.color   = nameCol;
    elName.textContent   = playerName ? `✨ Vai, ${playerName}! ✨` : "✨ Vai lá! ✨";

    // Mostrar overlay com fade-in CSS
    ov.style.opacity   = "0";
    ov.style.display   = "flex";
    ov.style.transition= "opacity 0.30s ease";
    ov.style.cursor    = "pointer";
    requestAnimationFrame(()=>{ ov.style.opacity = "1"; });

    let midpointDone = false;
    function runMidpoint() {
      if (midpointDone) return;
      midpointDone = true;
      clearTimeout(midTimer);
      onMidpoint?.();
    }
    const midTimer = setTimeout(runMidpoint, 350);

    let hidden = false;
    function hidePanel() {
      if (hidden) return;
      hidden = true;
      runMidpoint();
      ov.style.cursor = "";
      ov.removeEventListener("click", hidePanel);
      ov.removeEventListener("touchstart", hidePanel);
      ov.style.opacity = "0";
      setTimeout(()=>{ ov.style.display = "none"; onComplete?.(); }, 320);
    }

    // Manter visível 2 s; clique ou toque avança imediatamente
    const hideTimer = setTimeout(hidePanel, 2000);
    ov.addEventListener("click", hidePanel);
    ov.addEventListener("touchstart", hidePanel, { passive: true });

    ov._midTimer  = midTimer;
    ov._hideTimer = hideTimer;
  }

  // =====================================================================
  // ===== BOSSES TEMÁTICOS — Fase 3 (bloco 100% aditivo) =====
  // Não altera LEVELS nem currentLevel numbering. O boss acontece "entre"
  // dois níveis já existentes — currentLevel não avança durante o combate.
  // =====================================================================
  let inBossFight = false;
  let bossState = null; // { def, sprite, hp, phase, collected, onComplete, hitCooldownUntil }
  let bossOverlay = null; // rectangle usado pelo Guardião das Sombras
  let bossLockIcon = null; // 🔒/⭐ flutuante por cima do boss — lembrete visual permanente,
                           // sem depender de o jogador ler o texto do objetivo
  let bossRageIcon = null; // 😠/😡 flutuante por cima do boss — mostra a fase de raiva atual
  let controlsInvertedUntil = 0; // usado pelo "livro mau" do Monstro da Ignorância
  let bossVignette = null; // moldura escura nos cantos — usada pela fase final de def.phases (ex.: "Preconceito")
  let bossArenaDecor = []; // elementos ambiente (emoji+tween) da arena temática — ver def.arena.decor

  // Cartão que desliza rapidamente do topo do ecrã e desaparece sozinho —
  // usado na chegada do boss ("⚠️ NOME DO BOSS") e na vitória ("✅ VITÓRIA!").
  // Não bloqueia nada (não precisa de toque) — é só um flourish visual rápido.
  function showBossBanner(scene, text, color = "#ffffff") {
    const label = scene.add.text(800, -40, text, {
      fontSize: "30px", fontStyle: "900", color, stroke: "#1a0025", strokeThickness: 7
    }).setOrigin(0.5).setDepth(50).setScrollFactor(0).setAlpha(0);
    scene.tweens.add({
      targets: label, y: 54, alpha: 1, duration: 380, ease: "Back.easeOut",
      onComplete: () => {
        scene.time.delayedCall(1400, () => {
          if (!label.active) return;
          scene.tweens.add({ targets: label, y: -40, alpha: 0, duration: 320, ease: "Sine.easeIn",
            onComplete: () => { try{label.destroy();}catch{} } });
        });
      }
    });
  }

  function startBossFight(scene, levelJustCompleted, onComplete) {
    const def = BOSS_BY_LEVEL[levelJustCompleted];
    if (!def) { onComplete(); return; } // sem boss neste ponto — segue o fluxo normal

    inBossFight = true;
    controlsInvertedUntil = 0;
    // Se houver uma barra de vida de uma tentativa anterior (ex.: repetir o
    // combate depois de perder todas as vidas), destruir ANTES de substituir
    // bossState — senão a referência perde-se e a barra antiga fica órfã no ecrã.
    destroyBossHpBar();
    // Começa em "intro": todos os timers/movimentos do boss (que verificam
    // phase!=="platform") ficam inertes enquanto decorre a cinemática de entrada.
    bossState = { def, hp: def.hp, phase: "intro", collected: 0, onComplete, hitCooldownUntil: 0, rageLevel: 0, speedMult: 1 };

    // Limpar o palco tal como loadLevel já faz — arena dedicada, isolada do nível anterior
    enemyTimers.forEach(t=>{try{t.remove(false);}catch{}}); enemyTimers=[];
    bossTimers.forEach(t=>{try{t.remove(false);}catch{}}); bossTimers=[];
    platforms.clear(true,true); itemsGroup.clear(true,true); malwareGroup.clear(true,true);
    clearMovingPlatforms();
    clearTrampolines(); // sem isto, um trampolim do nível anterior ficava "pendurado" na arena do boss
    // Decorações do nível anterior (balões, borboletas/abelhas, flores nas plataformas) —
    // sem isto ficavam por destruir e continuavam visíveis/a voar durante o boss.
    // _critterSession++ ANTES de limpar os arrays: sem isto, um balão/abelha/borboleta
    // apanhado pouco antes do boss começar reaparecia sozinho (o seu delayedCall de
    // respawn ainda estava pendente) já sem estar no array ativo — ficava então uma
    // imagem "fantasma" para sempre parada e impossível de apanhar, porque updateCritters()
    // e o loop dos balões só percorrem o array atual, e o próprio loadLevel seguinte também
    // só destrói o que está nesse array atual. Era esta a causa de abelhas/borboletas/balões
    // "parados" que apareciam ocasionalmente depois de um combate de boss.
    _critterSession++;
    balloons.forEach(b=>{ if(b.sprite) b.sprite.destroy(); if(b.gfx) b.gfx.destroy(); }); balloons=[];
    critters.forEach(c=>{ if(c.sprite&&c.sprite.active) c.sprite.destroy(); }); critters=[];
    clearPlatformDecor();
    clearSign();
    if(bossOverlay){ try{bossOverlay.destroy();}catch{} bossOverlay=null; }
    if(bossLockIcon){ try{bossLockIcon.destroy();}catch{} bossLockIcon=null; }
    if(bossRageIcon){ try{bossRageIcon.destroy();}catch{} bossRageIcon=null; }
    if(bossVignette){ try{bossVignette.destroy();}catch{} bossVignette=null; } // vinheta de fase (ex.: Preconceito)
    clearToxicZones();
    clearMiniViruses();
    clearBossArenaDecor(); // decoração ambiente temática (ver def.arena.decor)
    if(door){ door.destroy(); door=null; }

    // ===== Arena — Fase "Bosses de Verdade" =====
    // def.arena (opt-in, data-bosses.js) permite a cada boss ter o seu próprio
    // tamanho de mundo e layout de plataformas, em vez da arena genérica
    // partilhada por todos. Bosses sem def.arena (ainda) caem exactamente no
    // layout de sempre — zero impacto nos combates que ainda não foram lá.
    const worldW = def.arena?.worldW || 1600;
    // worldH (opt-in, ver data-bosses.js): normalmente o chão de uma arena
    // fica quase colado ao limite físico do mundo (514) — mas ao levantar o
    // chão do Monstro da Ignorância (ver arena.platforms) sobrou uma "zona
    // morta" enorme por baixo da plataforma. Como o jogador tem
    // setCollideWorldBounds(true), se alguma vez fosse ali parar (ex.: um
    // choque/knockback a atravessar a plataforma fina), ficava preso lá
    // embaixo, sem conseguir voltar a subir através do chão sólido por cima
    // dele. Um worldH ajustado ao chão real da arena elimina essa zona morta.
    const worldH = def.arena?.worldH || 514;
    scene.physics.world.setBounds(0,0,worldW,worldH);
    scene.cameras.main.setBounds(0,0,worldW,540);

    // Fundo dedicado à arena do boss — antes disto o ecrã ficava com o fundo do
    // nível anterior (desenhado para outro worldW), daí parecer "preso" e desalinhado.
    const themeIdx = (def.themeIdx != null) ? def.themeIdx : (LEVELS[currentLevel] ? LEVELS[currentLevel].theme % THEMES.length : 0);
    applyBackground(scene, themeIdx, worldW, []);

    const platKey = "platform_t"+themeIdx;
    if(!scene.textures.exists(platKey)) makePlatformTextureThemed(scene, platKey, themeIdx);
    const arenaPlatforms = def.arena?.platforms || [[800,520,1600,28],[300,380,220,24],[1300,380,220,24]];
    arenaPlatforms.forEach(([x,y,w,h])=>{
      const plat = platforms.create(x,y,platKey);
      plat.displayWidth=w; plat.displayHeight=h; plat.refreshBody();
      if(plat.body){plat.body.checkCollision.left=false;plat.body.checkCollision.right=false;}
    });

    // Decoração ambiente da arena (ex.: livros flutuantes na biblioteca do
    // Monstro) — puramente visual, sem colisão, criada DEPOIS das plataformas
    // para ficar por cima do fundo mas atrás do jogador/boss (depth 1).
    if (def.arena?.decor) spawnBossArenaDecor(scene, def.arena.decor);

    player.setAlpha(1); player.setAngle(0);
    // y=200: bem acima do chão de QUALQUER arena de boss (incluindo arenas
    // "levantadas" como a do Monstro da Ignorância) — snapPlayerToGround(),
    // logo a seguir, só encontra uma plataforma se ela estiver ao/abaixo dos
    // pés do jogador; um valor fixo demasiado baixo (ex.: 460) deixava de
    // funcionar sempre que uma arena movia o chão principal para mais acima,
    // fazendo o VanBerto's ficar preso a meio da plataforma em vez de em cima.
    player.setPosition(120,200); player.setVelocity(0,0);
    if(player.body) player.body.reset(120,200);
    // Alinhar já ao chão da arena (mesmo cálculo usado no arranque de nível
    // normal, via snapPlayerToGround). Sem isto, o VanBerto's ficava com os
    // pés "enterrados" na plataforma logo à entrada — visível sobretudo
    // durante a cinemática, porque a física ainda está pausada nesse momento
    // e nada o corrigia a tempo (só quando a física retomava é que a colisão
    // o empurrava para cima, já a meio da cena).
    snapPlayerToGround();
    scene.cameras.main.startFollow(player,true,0.08,0.08);

    spawnBossSprite(scene, def, worldW-200);
    createBossHpBar(scene, def);
    if (def.stompBoss) {
      // Boss "clássico à Mario": sem estrela, sem carga — o único jeito de
      // lhe fazer dano é saltar-lhe em cima (ver handleBossMalwareCollision).
    } else if (def.specialAttack) {
      // Bosses com ataque especial próprio (ex.: Monstro da Ignorância) não usam
      // a lógica genérica de "apanha a estrela para atropelar o boss" — em vez
      // disso recolhem itens temáticos que carregam um ataque nomeado.
      bossState.chargeCollected = 0;
      spawnChargeItem(scene);
      const chargeTimer = scene.time.addEvent({ delay: 950, loop: true, callback: () => spawnChargeItem(scene) });
      bossTimers.push(chargeTimer);
    } else {
      spawnBossStarItem(scene);
      const starTimer = scene.time.addEvent({ delay: 1000, loop: true, callback: () => spawnBossStarItem(scene) });
      bossTimers.push(starTimer);
    }
    if (def.contaminatedArena) {
      // Vírus Gigante: a arena fica contaminada — zonas tóxicas fixas no chão
      // + vírus pequenos a flutuar, ambos independentes do boss principal.
      spawnToxicZones(scene);
      spawnMiniViruses(scene, 3);
      const virusTimer = scene.time.addEvent({ delay: 3000, loop: true, callback: () => maintainMiniViruses(scene, 3) });
      bossTimers.push(virusTimer);
    }

    // Entrada com mais impacto — antes o boss só "aparecia" sem drama nenhum.
    scene.cameras.main.shake(220, 0.012);
    const arriveBurst = scene.add.particles(0, 0, "spark_item", {
      x: worldW-200, y: 380, speed:{min:80,max:260}, lifespan:700, quantity:34,
      scale:{start:1.2,end:0}, gravityY:120, angle:{min:0,max:360},
      tint:[def.color, 0x000000, 0xffffff]
    });
    scene.time.delayedCall(600, () => { try{arriveBurst.destroy();}catch{} });
    showBossBanner(scene, `⚠️ ${def.name.toUpperCase()} ⚠️`, "#ff9090");

    if (def.movingArena) {
      spawnMovingPlatforms(scene, {
        theme: LEVELS[currentLevel] ? LEVELS[currentLevel].theme : 0,
        movingPlatforms: [
          { x: 550, y: 430, w: 190, h: 22, rangeX: 220, speed: 95 },
          { x: 1050, y: 430, w: 190, h: 22, rangeY: 90, speed: 75 }
        ]
      });
    }
    if (def.movementType === "blink") {
      const blinkTimer = scene.time.addEvent({ delay: 2600, loop: true, callback: () => doBossBlink(scene) });
      bossTimers.push(blinkTimer); bossState.blinkTimer = blinkTimer; bossState.blinkBaseDelay = 2600;
    } else if (def.movementType === "teleport") {
      // Véu de sombra suave, ligado à cor do próprio boss (não um bloco opaco fixo)
      bossOverlay = scene.add.rectangle(worldW/2, 257, worldW, 514, def.color, 0.16).setDepth(1);
      scene.tweens.add({ targets: bossOverlay, alpha:{from:0.75,to:1}, duration:1900, yoyo:true, repeat:-1, ease:"Sine.easeInOut" });
      const teleTimer = scene.time.addEvent({ delay: 2400, loop: true, callback: () => doBossTeleport(scene) });
      bossTimers.push(teleTimer); bossState.teleTimer = teleTimer; bossState.teleBaseDelay = 2400;
    }
    if (def.throwsBooks) {
      const bookTimer = scene.time.addEvent({ delay: 1700, loop: true, callback: () => doBossThrowBook(scene) });
      bossTimers.push(bookTimer); bossState.bookTimer = bookTimer; bossState.bookBaseDelay = 1700;
    }
    if (def.stompBoss) {
      // "De vez em quando faz um pequeno salto" — puramente visual (não é
      // um ataque, só personalidade) — e uma bola ❓ lenta pelo chão.
      const hopTimer = scene.time.addEvent({ delay: def.hopEvery || 2400, loop: true, callback: () => doBossHop(scene) });
      bossTimers.push(hopTimer); bossState.hopTimer = hopTimer;
      const qmarkTimer = scene.time.addEvent({ delay: def.qmarkEvery || 2200, loop: true, callback: () => doBossRollQmark(scene) });
      bossTimers.push(qmarkTimer); bossState.qmarkTimer = qmarkTimer;
    }

    hudText.setText(`${def.emoji} ${def.name}`);
    itemCountText.setText("");
    tipText.setText("🎬 " + def.name + " apareceu!");
    ensureAudio(); SFX.bossArrive();

    // Mantém awaitingQuiz=true (já estava) durante a cinemática — assim update()
    // não avança o boss/timers/vilões enquanto o diálogo decorre.
    const objective = BOSS_OBJECTIVE[def.id] || "Foge dele até apanhares uma estrela ⭐ para o atingires!";
    // A explicação do objetivo já não vai no diálogo (passava depressa demais) —
    // passa a ser um letreiro, tal como nos níveis normais: o jogador aproxima-se
    // e "lê-o" ao seu ritmo. Só a apresentação dramática (VanBerto's + boss) fica no diálogo.
    // 3 falas em vez de 2: o VanBerto's reage ANTES do boss se apresentar, e responde
    // com um "grito de guerra" DEPOIS — dá a sensação de cena, não de anúncio a passar depressa.
    const introVB = BOSS_INTRO_VB[def.id] || { reaction: "Sinto algo estranho aqui...", rally: "Vamos enfrentar isto juntos!" };
    playBossDialogue([
      { speaker:"vb",   text: introVB.reaction },
      { speaker:"boss", name: def.name, emoji: def.emoji, text: def.intro, anchor: bossDialogueAnchor() },
      { speaker:"vb",   text: introVB.rally }
    ], () => {
      if (!bossState) return; // segurança: nível pode ter sido reiniciado entretanto
      bossState.phase = "platform";
      if (def.phases) enterBossPhase(scene, def, def.hp); // fase 1 (vida cheia)
      const objEmoji = def.stompBoss ? "👣" : (def.specialAttack ? (def.specialAttack.emoji || "⚡") : "⭐");
      tipText.setText(objEmoji + " " + objective);
      awaitingQuiz = false; awaitingStory = false;
      scene.physics.resume();
      // Letreiro do objetivo — perto do ponto de partida do jogador na arena,
      // para ser o primeiro coisa que encontra ao começar a andar.
      spawnBossSign(scene, 280, def.signY != null ? def.signY : 486, objEmoji, objective);
      if (def.stompBoss) {
        // Sem estrela, sem carga — o HUD mostra logo o progresso dos saltos.
        itemCountText.setText(`👣 Saltos: 0/${def.hp}`);
      } else if (!def.specialAttack) {
        // Lembrete visual permanente por cima do boss — 🔒 enquanto não podes
        // tocar-lhe, ⭐ assim que apanhas o poder da estrela. Substitui/completa
        // o texto do objetivo, que passa depressa e nem todos leem a tempo.
        // (Bosses com ataque especial próprio mostram o progresso da carga no
        // HUD — itemCountText — em vez deste ícone, porque tocar-lhes dói SEMPRE,
        // não há um estado "desbloqueado" por toque.)
        if (bossLockIcon) { try{bossLockIcon.destroy();}catch{} }
        bossLockIcon = scene.add.text(0, 0, "🔒", { fontSize:"24px" }).setOrigin(0.5).setDepth(6);
        scene.tweens.add({ targets:bossLockIcon, scaleX:{from:0.85,to:1.15}, scaleY:{from:0.85,to:1.15},
          duration:520, yoyo:true, repeat:-1, ease:"Sine.easeInOut" });
      } else {
        itemCountText.setText(`⚡ Carga: 0/${def.specialAttack.chargeCount}`);
      }
    });
  }

  // ===== Fases de combate por HP — Fase "Batalhas Épicas" =====
  // Genérico e opt-in: só bosses com def.phases (por agora, só o Monstro da
  // Ignorância) passam por aqui. Bosses sem def.phases continuam a usar
  // bossEnterRage() como antes — zero impacto nos outros 3 combates.
  // Cada fase pode redefinir a cadência de ataques (bookThrowDelay/blinkDelay/
  // badBookChance), ligar o ataque de "fake news" (a partir da fase 2) e a
  // vinheta escura da fase final — tudo lido de data-bosses.js, sem valores
  // mágicos aqui dentro.
  function enterBossPhase(scene, def, hp) {
    if (!bossState || !def.phases) return;
    const phase = def.phases.find(p => p.atHp === hp) || def.phases[def.phases.length - 1];
    if (!phase || bossState.currentPhaseId === phase.id) return; // já estamos nesta fase
    bossState.currentPhaseId = phase.id;
    bossState.badBookChance = phase.badBookChance;

    // Cadência dos ataques já existentes — cada fase tem os seus próprios valores
    // (mais rápido a cada fase), em vez do multiplicador genérico de bossEnterRage.
    if (bossState.bookTimer) bossState.bookTimer.delay = phase.bookThrowDelay;
    if (bossState.blinkTimer) bossState.blinkTimer.delay = phase.blinkDelay;

    // Ataque de "fake news" — liga na fase que o pedir e fica ativo até ao fim
    // do combate (não se desliga entre fases 2→3), mas agora a CADÊNCIA
    // atualiza-se a cada fase (fase.fakeNewsDelay) tal como já acontecia com
    // os livros e o blink — antes ficava sempre fixo em 2100ms, mesmo na
    // fase final, que era suposto ser a mais intensa.
    if (phase.fakeNewsAttack) {
      if (!bossState.fakeNewsTimer) {
        const fnTimer = scene.time.addEvent({ delay: phase.fakeNewsDelay || 2100, loop: true, callback: () => doBossThrowFakeNews(scene) });
        bossTimers.push(fnTimer); bossState.fakeNewsTimer = fnTimer;
      } else if (phase.fakeNewsDelay) {
        bossState.fakeNewsTimer.delay = phase.fakeNewsDelay;
      }
    }

    // Vinheta escura — representa o boss a "não querer ver" que está a perder.
    // Bordas do ecrã escurecem com um leve pulsar, sem nunca esconder o centro
    // (onde o jogador e os itens continuam bem visíveis).
    if (phase.vignette && !bossVignette) {
      // Vinheta real fixa ao ecrã (scrollFactor 0) — molduras escuras nos 4
      // lados, deixando uma "janela" iluminada ao centro, onde jogador e itens
      // continuam sempre bem visíveis. Acompanha o ecrã, não o mundo, para
      // funcionar em qualquer ponto da arena, não só perto do centro.
      const W = 960, H = 540, margin = 170;
      const g = scene.add.graphics().setScrollFactor(0).setDepth(40).setAlpha(0);
      g.fillStyle(0x050014, 0.62);
      g.fillRect(0, 0, W, margin);              // topo
      g.fillRect(0, H - (margin - 60), W, margin - 60); // fundo (janela mais alta que larga)
      g.fillRect(0, 0, margin, H);               // esquerda
      g.fillRect(W - margin, 0, margin, H);      // direita
      bossVignette = g;
      scene.tweens.add({ targets: g, alpha: 1, duration: 900, ease: "Sine.easeOut" });
      scene.tweens.add({ targets: g, alpha: { from: 0.8, to: 1 }, duration: 1400, delay: 900, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
    }

    // Sprite do boss reage visualmente à mudança de fase — um "glitch" rápido
    // de transparência (fase 2, "sinal a falhar") ou um tingir avermelhado
    // pulsante (fase 3, "corrupção"), sem precisar de nenhuma arte nova.
    const b = bossState.sprite;
    if (b && b.active) {
      scene.tweens.killTweensOf(b);
      if (phase.id === "fakenews") {
        scene.tweens.add({ targets:b, alpha:{from:1,to:0.25}, duration:70, yoyo:true, repeat:5 });
      } else if (phase.id === "preconceito") {
        b.setTint(0xff5050);
        scene.tweens.add({ targets:b, alpha:{from:1,to:0.4}, duration:120, yoyo:true, repeat:5,
          onComplete: () => { if (b.active) { b.setAlpha(1); b.setTint(def.color); } } });
      }
      const pulseScale = (def.movementType === "wave") ? b.scaleX : (b.scaleX * 1.22);
      scene.tweens.add({ targets:b, scaleX:pulseScale, scaleY:pulseScale, duration:160, yoyo:true, repeat:1, ease:"Sine.easeOut" });
    }

    // Fala curta e própria da fase — reaproveita BOSS_HP_TAUNTS (data-story.js),
    // já escrito mas nunca antes ligado ao motor.
    const tauntKey = phase.atHp === 3 ? "atStart" : (phase.atHp === 2 ? "hp2" : "hp1");
    const taunts = BOSS_HP_TAUNTS[def.id] || {};
    const tauntEntry = taunts[tauntKey];
    if (tauntEntry) {
      const tauntText = Array.isArray(tauntEntry) ? tauntEntry[Math.floor(Math.random()*tauntEntry.length)] : tauntEntry;
      showFloat(scene, b ? b.x : bossState.baseX, (b ? b.y : bossState.baseY) - 74, tauntText, "#ff9090");
    }

    // Aviso curto de fase no HUD (não bloqueia nada, só um flourish rápido)
    if (phase.label) showBossBanner(scene, phase.label, "#ffd280");
    scene.cameras.main.shake(phase.id === "preconceito" ? 220 : 150, phase.id === "preconceito" ? 0.012 : 0.008);
  }

  // ---- Ataque "Fake News" (fases 2-3 do Monstro da Ignorância): um ❌ voa na
  // horizontal de um lado ao outro da arena — evitar, nunca apanhar. Reaproveita
  // a textura escura do livro mau (já pensada para parecer "informação errada"),
  // só que agora em voo reto em vez de arco lançado pelo boss — para se sentir
  // como um ataque novo, não um livro mau a mais. ----
  function doBossThrowFakeNews(scene) {
    if (!inBossFight || !bossState || bossState.phase !== "platform") return;
    const fromLeft = Math.random() < 0.5;
    const y = 340 + Math.random() * 90;
    const x = fromLeft ? -20 : 1620;
    const news = itemsGroup.create(x, y, "boss_proj_badbook");
    news.setDepth(2).setData("bossProjBad", true).setAngle(fromLeft ? -12 : 12);
    news.body.setAllowGravity(false);
    news.setVelocityX(fromLeft ? 340 : -340);
    news.setAngularVelocity(fromLeft ? -200 : 200);
    scene.time.delayedCall(2600, () => { if (news.active) news.destroy(); });
  }

  function spawnBossSprite(scene, def, x) {
    const texKey = "boss_"+def.id;
    const hasCustomTex = scene.textures.exists(texKey);
    // bossY (opt-in, ver data-bosses.js) permite a um boss ficar fixo à
    // altura do chão da sua arena, em vez de flutuar sempre a meio do ecrã —
    // usado pelo Monstro da Ignorância, que "anda" e nunca flutua.
    const y = def.bossY != null ? def.bossY : 380;
    const boss = malwareGroup.create(x, y, hasCustomTex ? texKey : "vilao_bug");
    boss.setScale(hasCustomTex ? (def.bossScale || 1.55) : 2.2);
    if (!hasCustomTex) boss.setTint(def.color); // rede de segurança, caso a textura não tenha carregado
    boss.setData("isBoss", true);
    boss.body.setAllowGravity(false);
    boss.setCollideWorldBounds(true); boss.setBounce(1,0);
    bossState.sprite = boss;
    bossState.baseX = x; bossState.baseY = y;

    if (def.movementType === "wave") {
      boss.setVelocity(0,0);
      const pulseScale = boss.scaleX * 1.18; // pulsa ~18% maior, proporcional à escala base
      scene.tweens.add({ targets: boss, scaleX: pulseScale, scaleY: pulseScale, duration: 700, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
    } else if (def.movementType === "blink" || def.movementType === "teleport") {
      boss.setVelocity(0,0);
    } else {
      boss.setVelocityX(-(def.patrolSpeed || 110));
    }
  }

  // ===== Decoração ambiente da arena de boss — Fase "Bosses de Verdade" =====
  // Puramente visual (sem colisão, sem grupo de física): emoji + tween, tal
  // como bossLockIcon/showFloat já fazem. Reaproveitável por qualquer boss via
  // def.arena.decor = [{emoji,x,y,size?}], sem precisar de nenhum asset novo.
  function spawnBossArenaDecor(scene, defs) {
    clearBossArenaDecor();
    (defs || []).forEach(d => {
      const t = scene.add.text(d.x, d.y, d.emoji, { fontSize: (d.size||26)+"px" })
        .setOrigin(0.5).setDepth(1).setAlpha(0.85);
      // Flutuação lenta + leve balanço — cada elemento com timing próprio para
      // não parecerem todos sincronizados (sensação mais orgânica).
      scene.tweens.add({ targets:t, y:d.y-14, duration:1400+Math.random()*600, yoyo:true, repeat:-1, ease:"Sine.easeInOut" });
      scene.tweens.add({ targets:t, angle:{from:-6,to:6}, duration:1800+Math.random()*500, yoyo:true, repeat:-1, ease:"Sine.easeInOut" });
      bossArenaDecor.push(t);
    });
  }
  function clearBossArenaDecor() {
    bossArenaDecor.forEach(t => { try{ if(t.active) t.destroy(); }catch{} });
    bossArenaDecor = [];
  }

  // Barra de vida do boss — flutua por cima do sprite, cor muda conforme a vida
  // restante (verde → dourado → vermelho), para dar feedback visual claro do
  // progresso do combate sem o jogador ter de contar hits.
  function createBossHpBar(scene, def) {
    if (!bossState) return;
    bossState.hpBarW = 100; bossState.hpBarH = 12;
    if (bossState.hpBarBg) { try{bossState.hpBarBg.destroy();}catch{} }
    if (bossState.hpBarFill) { try{bossState.hpBarFill.destroy();}catch{} }
    bossState.hpBarBg = scene.add.graphics().setDepth(6);
    bossState.hpBarFill = scene.add.graphics().setDepth(7);
    // Cresce de 0 até cheia em vez de aparecer já cheia — pequeno detalhe que
    // dá a sensação de "a vida a ser carregada", como em jogos profissionais.
    bossState.hpGrowFactor = 0;
    scene.tweens.add({ targets: bossState, hpGrowFactor: 1, duration: 550, ease: "Cubic.easeOut", onUpdate: drawBossHpBar });
    drawBossHpBar();
  }
  function drawBossHpBar() {
    if (!bossState || !bossState.hpBarBg || !bossState.hpBarFill || !bossState.sprite || !bossState.sprite.active) return;
    const b = bossState.sprite;
    const w = bossState.hpBarW, h = bossState.hpBarH;
    const def = bossState.def;
    // hpBarOffset (opt-in, ver data-bosses.js): distância fixa entre o centro
    // do sprite e a barra, para bosses cuja textura tem muito espaço vazio
    // por cima da cabeça desenhada (ex.: o Monstro da Ignorância, baixo e
    // rechonchudo dentro de um canvas quadrado) — sem isto, a conta genérica
    // (displayHeight/2 + 42) media a partir do topo do canvas "vazio", não do
    // topo real da cabeça, e a barra ficava a flutuar bem longe do boss.
    const x = b.x - w/2;
    const y = (def && def.hpBarOffset != null) ? (b.y - def.hpBarOffset) : (b.y - (b.displayHeight/2 || 40) - 42);
    bossState.hpBarBg.clear();
    bossState.hpBarBg.fillStyle(0x1a1a2e, 0.85);
    bossState.hpBarBg.fillRoundedRect(x, y, w, h, 5);
    bossState.hpBarBg.lineStyle(2, 0xffffff, 0.9);
    bossState.hpBarBg.strokeRoundedRect(x, y, w, h, 5);
    bossState.hpBarFill.clear();
    const growFactor = bossState.hpGrowFactor != null ? bossState.hpGrowFactor : 1;
    const pct = Math.max(0, bossState.hp / bossState.def.hp) * growFactor;
    const fillColor = pct > 0.5 ? 0x60e060 : (pct > 0.25 ? 0xffd700 : 0xff5050);
    bossState.hpBarFill.fillStyle(fillColor, 1);
    bossState.hpBarFill.fillRoundedRect(x+2, y+2, Math.max(0,(w-4)*pct), h-4, 3);
  }
  function destroyBossHpBar() {
    if (!bossState) return;
    if (bossState.hpBarBg)   { try{bossState.hpBarBg.destroy();}catch{}   bossState.hpBarBg = null; }
    if (bossState.hpBarFill) { try{bossState.hpBarFill.destroy();}catch{} bossState.hpBarFill = null; }
  }

  // Mantém sempre uma estrela ⭐ disponível na arena enquanto o boss não foi enfraquecido —
  // usa o fluxo normal de onCollectItem (kind:"estrela", SEM bossCollect) para que o
  // giveStarPower() já existente dispare tal como em qualquer nível normal.
  function spawnBossStarItem(scene) {
    if (!inBossFight || !bossState || bossState.phase !== "platform") return;
    const hasStar = itemsGroup.getChildren().some(o => o.active && o.getData("kind")==="estrela" && !o.getData("bossCollect"));
    if (hasStar) return;
    // arena.spawnSpots (opt-in, ver data-bosses.js) permite a cada boss definir
    // os seus próprios pontos, alinhados com a sua arena temática — sem isso,
    // cai no comportamento genérico de sempre.
    const arenaSpots = bossState.def.arena?.spawnSpots;
    const spots = arenaSpots && arenaSpots.length ? arenaSpots : [280, 1320];
    const x = spots[Math.floor(Math.random()*spots.length)];
    const it = itemsGroup.create(x, 340, "item_estrela");
    it.setDepth(2).setData("kind","estrela").setData("itemIdx",-1);
    scene.tweens.add({targets:it,y:it.y-8,duration:820,yoyo:true,repeat:-1,ease:"Sine.easeInOut"});
  }

  // Itens de carga do ataque especial de cada boss (📚 Monstro / ❤️ Vírus...) —
  // reaproveita texturas já existentes com um tom próprio (definido em
  // specialAttack.chargeTexture/chargeTint), para se distinguir dos itens da
  // fase de recolha pós-derrota. Ao contrário da estrela (só 1 de cada vez),
  // mantemos até 2 em simultâneo — com 5 para apanhar, um só de cada vez
  // tornaria o ritmo demasiado lento.
  function spawnChargeItem(scene) {
    if (!inBossFight || !bossState || bossState.phase !== "platform" || !bossState.def.specialAttack) return;
    const sa = bossState.def.specialAttack;
    const already = itemsGroup.getChildren().filter(o => o.active && o.getData("bossCharge")).length;
    if (already >= 2) return;
    const arenaSpots = bossState.def.arena?.spawnSpots;
    const spots = arenaSpots && arenaSpots.length ? arenaSpots : [280, 800, 1320];
    const x = spots[Math.floor(Math.random()*spots.length)];
    const tex = sa.chargeTexture || "item_livro";
    const tint = sa.chargeTint != null ? sa.chargeTint : 0x80d8ff;
    const it = itemsGroup.create(x, 330 + Math.random()*40, tex);
    it.setDepth(2).setTint(tint).setData("kind","carga").setData("bossCharge", true);
    scene.tweens.add({targets:it,y:it.y-10,duration:760,yoyo:true,repeat:-1,ease:"Sine.easeInOut"});
    scene.tweens.add({targets:it,angle:{from:-6,to:6},duration:900,yoyo:true,repeat:-1,ease:"Sine.easeInOut"});
  }

  // ---- Arena contaminada (Vírus Gigante): zonas tóxicas + vírus pequenos ----
  // 100% aditivo e opt-in via def.contaminatedArena — não afeta bosses normais.
  let bossToxicZones = [];
  let bossMiniViruses = [];

  function spawnToxicZones(scene) {
    clearToxicZones();
    const spots = [ {x:520, w:200}, {x:1080, w:200} ];
    spots.forEach(s => {
      const gfx = scene.add.graphics().setDepth(2);
      _drawHazard(gfx, s.x, 496, s.w, "acid", scene.time.now);
      const timer = scene.time.addEvent({
        delay: 120, loop: true,
        callback: () => { if (gfx.active) _drawHazard(gfx, s.x, 496, s.w, "acid", scene.time.now); }
      });
      bossToxicZones.push({ x:s.x, y:496, w:s.w, gfx, timer });
    });
  }
  function clearToxicZones() {
    bossToxicZones.forEach(z => { try{z.gfx.destroy();}catch{} try{ z.timer && z.timer.remove(false); }catch{} });
    bossToxicZones = [];
  }
  // Verifica se o jogador está numa zona tóxica — reaproveita bossHitPlayer
  // (dano seguro dentro da arena de boss) em vez do hitByHazard normal (que
  // reiniciaria o jogador no spawn do NÍVEL, não da arena).
  function updateToxicZones() {
    if (!bossToxicZones.length || !player || !player.body || invuln) return;
    const pb = player.body;
    bossToxicZones.some(z => {
      const half = z.w/2;
      const inX = pb.right > z.x - half + 4 && pb.left < z.x + half - 4;
      const inY = pb.bottom >= z.y - 2 && pb.top < z.y + 24;
      if (inX && inY) { bossHitPlayer(sceneRef, null, "☠️ Zona tóxica!"); return true; }
      return false;
    });
  }
  function spawnMiniViruses(scene, count) {
    for (let i=0;i<count;i++){
      const x = 350 + Math.random()*900;
      const v = malwareGroup.create(x, 320 + Math.random()*100, "vilao_round");
      v.setScale(0.7).setTint(0x30c060).setData("isMiniHazard", true);
      v.body.setAllowGravity(false);
      v.setCollideWorldBounds(true); v.setBounce(1,1);
      const dirX = Math.random() < 0.5 ? -1 : 1, dirY = Math.random() < 0.5 ? -1 : 1;
      v.setVelocity(dirX * (40+Math.random()*40), dirY * (20+Math.random()*20));
      bossMiniViruses.push(v);
    }
  }
  function maintainMiniViruses(scene, desiredCount) {
    if (!inBossFight || !bossState || bossState.phase !== "platform" || !bossState.def.contaminatedArena) return;
    bossMiniViruses = bossMiniViruses.filter(v => v && v.active);
    const missing = desiredCount - bossMiniViruses.length;
    if (missing > 0) spawnMiniViruses(scene, missing);
  }
  function clearMiniViruses() {
    bossMiniViruses.forEach(v => { try{ if(v.active) v.destroy(); }catch{} });
    bossMiniViruses = [];
  }


  // ---- Movimento "blink" (Monstro da Ignorância): some e reaparece noutro sítio ----
  function doBossBlink(scene) {
    if (!inBossFight || !bossState || bossState.phase !== "platform") return;
    const b = bossState.sprite;
    if (!b || !b.active) return;
    scene.tweens.add({ targets:b, alpha:0, duration:220, onComplete: () => {
      if (!bossState || !bossState.sprite || !bossState.sprite.active) return;
      const arenaSpots = bossState.def.arena?.spawnSpots;
      const spots = arenaSpots && arenaSpots.length ? arenaSpots : [350, 800, 1250];
      const nx = spots[Math.floor(Math.random()*spots.length)];
      b.x = nx; b.y = 380;
      if (b.body) b.body.reset(nx, 380);
      showFloat(scene, nx, 320, "❓", "#8a5cff");
      scene.tweens.add({ targets:b, alpha:1, duration:220 });
    }});
  }

  // ---- Movimento "teleport" (Guardião das Sombras): salta entre 3 pontos fixos ----
  function doBossTeleport(scene) {
    if (!inBossFight || !bossState || bossState.phase !== "platform") return;
    const b = bossState.sprite;
    if (!b || !b.active) return;
    const arenaSpots = bossState.def.arena?.spawnSpots;
    const spots = arenaSpots && arenaSpots.length ? arenaSpots : [300, 800, 1300];
    const nx = spots[Math.floor(Math.random()*spots.length)];
    scene.cameras.main.flash(120, 20, 20, 50);
    b.x = nx; b.y = 380;
    if (b.body) b.body.reset(nx, 380);
    ensureAudio(); beep({freq:220,dur:0.10,type:"sawtooth",vol:0.05,slideTo:120});
  }

  // ---- Livros do Monstro da Ignorância: a maioria são bons (dourados, apanha!),
  // um em cada 4 é mau (escuro com X vermelho, foge!) — bem distintos visualmente
  // de propósito, para uma criança conseguir decidir só a olhar, sem ler nada. ----
  function doBossThrowBook(scene) {
    if (!inBossFight || !bossState || bossState.phase !== "platform") return;
    const b = bossState.sprite;
    if (!b || !b.active) return;
    const badChance = (bossState.badBookChance != null) ? bossState.badBookChance : 0.25;
    const isBad = Math.random() < badChance;
    const key = isBad ? "boss_proj_badbook" : "boss_proj_book";
    const book = itemsGroup.create(b.x, b.y, key);
    book.setDepth(2).setData(isBad ? "bossProjBad" : "bossProjGood", true);
    book.body.setAllowGravity(true);
    book.body.setGravityY(260);
    const towardPlayer = player.x < b.x ? -1 : 1;
    book.setVelocity(towardPlayer * (110 + Math.random()*60), -220 - Math.random()*60);
    book.setAngularVelocity(isBad ? 260 : 160);
    scene.time.delayedCall(3200, () => { if (book.active) book.destroy(); });
  }

  // ---- Movimento do Monstro da Ignorância (redesenho): anda devagar pela
  // arena e, de vez em quando, dá um pequeno salto — só personalidade
  // visual, nunca desaparece nem teletransporta. ----
  function doBossHop(scene) {
    if (!inBossFight || !bossState || bossState.phase !== "platform") return;
    const b = bossState.sprite;
    if (!b || !b.active) return;
    const baseY = bossState.def.bossY != null ? bossState.def.bossY : bossState.baseY;
    scene.tweens.add({ targets:b, y: baseY-34, duration:180, yoyo:true, ease:"Quad.easeOut" });
  }

  // ---- Ataque do Monstro da Ignorância (redesenho): bolas ❓ que saltitam
  // devagar pelo chão — lentas e fáceis de ver/evitar, nunca voam direto à
  // cabeça do jogador. Substituem os livros/fake news do combate antigo. ----
  function doBossRollQmark(scene) {
    if (!inBossFight || !bossState || bossState.phase !== "platform") return;
    const b = bossState.sprite;
    if (!b || !b.active) return;
    const towardPlayer = player.x < b.x ? -1 : 1;
    const q = itemsGroup.create(b.x, b.y - 10, "boss_proj_qmark");
    q.setDepth(2).setData("bossProjQmark", true);
    q.body.setAllowGravity(true);
    q.body.setGravityY(480);
    q.body.setBounce(0.5, 0);
    q.body.setCollideWorldBounds(true);
    q.setVelocity(towardPlayer * 90, -120);
    q.setAngularVelocity(towardPlayer * 130);
    scene.physics.add.collider(q, platforms);
    scene.time.delayedCall(4500, () => { if (q.active) q.destroy(); });
  }

  // Reação exagerada tipo desenho animado quando o Monstro leva um salto na
  // cabeça: achata-se por meio segundo (textura + squash) e volta ao normal.
  function squishMonstro(scene, b) {
    if (!b || !b.active) return;
    const normalTex = b.texture.key;
    const ouchKey = "boss_" + bossState.def.id + "_ouch";
    if (scene.textures.exists(ouchKey)) b.setTexture(ouchKey);
    const baseScaleY = b.scaleY, baseScaleX = b.scaleX;
    scene.tweens.add({
      targets: b, scaleY: baseScaleY * 0.55, scaleX: baseScaleX * 1.2,
      duration: 130, yoyo: true, ease: "Quad.easeOut",
      onComplete: () => {
        if (b.active && scene.textures.exists(normalTex)) b.setTexture(normalTex);
        if (b.active) { b.scaleY = baseScaleY; b.scaleX = baseScaleX; }
      }
    });
  }

  // Deteta se o jogador está a saltar em cima do Monstro (queda + por cima
  // da cabeça) ou a tocar-lhe de lado — mecânica "3 saltos na cabeça",
  // reaproveitando damageBoss()/bossHitPlayer() já existentes para o resto.
  function handleStompBossTouch(b) {
    if (sceneRef.time.now < bossState.hitCooldownUntil) return true;
    const pBody = player.body;
    const playerBottom = player.y + (pBody.halfHeight || 24);
    const bossTop = b.y - (b.displayHeight/2 || 60);
    const isFalling = pBody.velocity.y > 0;
    if (isFalling && playerBottom <= bossTop + 22) {
      bossState.hitCooldownUntil = sceneRef.time.now + 550;
      player.setVelocityY(-380);
      squishMonstro(sceneRef, b);
      ensureAudio(); beep({freq:500,dur:0.09,type:"square",vol:0.07,slideTo:900});
      damageBoss(sceneRef, b.x, b.y-70, "👣 Salto certeiro!", 0.008);
    } else {
      bossHitPlayer(sceneRef, b, "🙈 Cuidado com o Monstro!");
    }
    return true;
  }

  // ---- Sequência de derrota do Monstro da Ignorância (redesenho): não
  // morre, não explode — senta-se, lê um livro que aparece à sua frente e
  // dá um polegar para cima, antes de seguir para a pergunta final. ----
  function startBossStompDefeat() {
    if (!bossState) return;
    bossState.phase = "defeat";
    const b = bossState.sprite;
    const def = bossState.def;
    if (b) { b.setVelocity(0,0); if (b.body) b.body.setEnable(false); }
    destroyBossHpBar();
    itemCountText.setText("");
    tipText.setText("");
    const sentadoKey = "boss_" + def.id + "_sentado";
    sceneRef.time.delayedCall(250, () => {
      if (!b || !b.active) return;
      if (sceneRef.textures.exists(sentadoKey)) b.setTexture(sentadoKey);
      showFloat(sceneRef, b.x, b.y-70, "😊", "#ffe066");
    });
    sceneRef.time.delayedCall(900, () => {
      if (!b || !b.active) return;
      const book = sceneRef.add.text(b.x, b.y-16, "📖", { fontSize:"26px" }).setOrigin(0.5).setDepth(6);
      sceneRef.tweens.add({ targets:book, y:book.y-6, duration:520, yoyo:true, repeat:2, ease:"Sine.easeInOut",
        onComplete: () => { try{book.destroy();}catch{} } });
    });
    sceneRef.time.delayedCall(2050, () => {
      if (!b || !b.active) return;
      showFloat(sceneRef, b.x, b.y-70, "👍", "#8fffb0");
    });
    sceneRef.time.delayedCall(2650, () => { if (bossState && bossState.phase === "defeat") startBossQuizPhase(); });
  }

  function updateBossFight(scene) {
    if (!inBossFight || !bossState || !bossState.sprite || !bossState.sprite.active) return;
    if (bossState.phase !== "platform") return;
    const b = bossState.sprite;
    const mt = bossState.def.movementType;
    // O ícone de raiva (😠/😡) acompanha o boss, tal como a barra de vida —
    // sem isto ficava preso no sítio onde apareceu, mesmo com o boss em movimento.
    if (bossRageIcon) {
      bossRageIcon.x = b.x;
      bossRageIcon.y = b.y - (b.displayHeight/2 || 40) - 26;
    }
    const speedMult = bossState.speedMult || 1;
    if (mt === "wave") {
      const t = scene.time.now * 0.0016 * speedMult;
      const range = 480;
      b.x = bossState.baseX - 700 + Math.sin(t) * range; // oscila em torno do centro da arena
      b.y = bossState.baseY + Math.sin(t*1.7) * 44;
      if (b.body) b.body.reset(b.x, b.y);
    } else if (mt === "patrol" || !mt) {
      const speed = (bossState.def.patrolSpeed || 110) * speedMult;
      // Margem relativa ao worldW da própria arena — antes estava fixa em
      // 1600, o que dava um raio de patrulha errado em arenas mais pequenas
      // (ex.: a arena "tamanho da janela" do Monstro da Ignorância, 960px).
      const worldW = bossState.def.arena?.worldW || 1600;
      const margin = Math.min(250, worldW * 0.26);
      if (b.x < margin) b.setVelocityX(speed);
      if (b.x > worldW - margin) b.setVelocityX(-speed);
    }
    // "blink" e "teleport" são geridos pelos timers próprios (doBossBlink/doBossTeleport)

    drawBossHpBar();

    // Ícone 🔒/⭐ acompanha o boss e reflete se já podes tocar-lhe ou não
    if (bossLockIcon && bossLockIcon.active) {
      bossLockIcon.setPosition(b.x, b.y - (b.displayHeight/2 || 40) - 18);
      const wantIcon = starPower ? "⭐" : "🔒";
      if (bossLockIcon.text !== wantIcon) bossLockIcon.setText(wantIcon);
    }
    if (bossState.def.contaminatedArena) updateToxicZones();
  }

  // ---- Fases de raiva: chamado quando o boss perde uma vida (level 1 = zangado,
  // level 2 = desesperado). Só dispara uma vez por fase (rageLevel só sobe). ----
  function bossEnterRage(scene, level) {
    if (!bossState || bossState.rageLevel >= level) return;
    bossState.rageLevel = level;
    bossState.speedMult = level === 1 ? 1.35 : 1.7;
    const def = bossState.def, b = bossState.sprite;

    // Acelerar os timers de movimento/ataque já existentes — o boss não ganha
    // ataques novos, só fica mais rápido e imprevisível, o que é suficiente
    // para se sentir a escalada sem complicar o combate para uma criança.
    if (bossState.blinkTimer) bossState.blinkTimer.delay = bossState.blinkBaseDelay / bossState.speedMult;
    if (bossState.teleTimer)  bossState.teleTimer.delay  = bossState.teleBaseDelay  / bossState.speedMult;
    if (bossState.bookTimer)  bossState.bookTimer.delay  = bossState.bookBaseDelay  / bossState.speedMult;

    // Ícone de emoção por cima do boss — 😠 zangado, 😡 desesperado — substitui
    // o 🔒/⭐ só por um instante (bossLockIcon continua a atualizar-se por cima).
    if (bossRageIcon) { try{bossRageIcon.destroy();}catch{} }
    const emo = level === 1 ? "😠" : "😡";
    bossRageIcon = scene.add.text(b ? b.x : bossState.baseX, (b ? b.y - (b.displayHeight/2||40) - 26 : bossState.baseY), emo, { fontSize:"26px" }).setOrigin(0.5).setDepth(8);
    scene.tweens.add({ targets:bossRageIcon, scaleX:{from:0.7,to:1.3}, scaleY:{from:0.7,to:1.3}, duration:260, yoyo:true, repeat:2, ease:"Back.easeOut" });

    // Reação de câmara mais forte quanto mais zangado — sem exagerar, só o
    // suficiente para se notar a diferença entre as duas fases.
    scene.cameras.main.shake(level===1?160:240, level===1?0.008:0.014);
    scene.cameras.main.flash(level===1?140:200, 255, level===1?150:70, 60);

    // Fala curta do boss, flutuante por cima dele — não pausa o jogo nem abre
    // diálogo, só reforça a personalidade durante o combate, como pedido.
    const lines = def.rageLines || {};
    const text = level === 1 ? (lines.angry || "Ainda não acabou!") : (lines.desperate || "Não... não pode ser!");
    showFloat(scene, b ? b.x : bossState.baseX, (b ? b.y : bossState.baseY) - 74, text, level===1 ? "#ffae42" : "#ff4040");

    ensureAudio();
    beep({ freq: level===1?260:200, dur:0.16, type:"sawtooth", vol:0.06, slideTo: level===1?140:90 });
  }

  // Dano ao boss (1 HP) reutilizável — tanto o toque com Star Power (bosses normais)
  // como o Raio do Conhecimento (bosses com ataque especial) passam por aqui, para
  // as fases de raiva e o fim do combate funcionarem sempre da mesma forma.
  function damageBoss(scene, x, y, label = "💥 Boss atingido!", shakeAmount = 0.006) {
    if (!bossState) return;
    bossState.hp -= 1;
    scene.cameras.main.shake(100, shakeAmount);
    score += 20; scoreText.setText(`🌟 Pontos: ${score}`);
    showFloat(scene, x, y, label, "#ff6b35");
    const hitsTaken = bossState.def.hp - bossState.hp;
    if (bossState.def.stompBoss) {
      // Boss "clássico à Mario": sem fases nem escalada de raiva — só o
      // contador de saltos no HUD e uma fala curta reaproveitada (taunts).
      const stomps = hitsTaken;
      itemCountText.setText(`👣 Saltos: ${Math.max(0,stomps)}/${bossState.def.hp}`);
      const taunts = BOSS_HP_TAUNTS[bossState.def.id];
      if (taunts && bossState.hp > 0) {
        const key = bossState.hp === 2 ? "hp2" : bossState.hp === 1 ? "hp1" : "atStart";
        const pool = taunts[key];
        if (pool && pool.length) showFloat(scene, x, y-30, pool[Math.floor(Math.random()*pool.length)], "#ff9090");
      }
    } else if (bossState.def.phases) {
      // Bosses com fases próprias não usam a escalada genérica — cada
      // acerto muda de fase com comportamento próprio.
      if (bossState.hp > 0) enterBossPhase(scene, bossState.def, bossState.hp);
    } else if (hitsTaken > 0 && bossState.hp > 0) {
      bossEnterRage(scene, Math.min(2, hitsTaken));
    }
    if (bossState.hp <= 0) {
      if (bossState.def.stompBoss) startBossStompDefeat();
      else startBossCollectPhase();
    }
  }

  // Chamado a partir do TOPO de onHitMalware — intercepta QUALQUER colisão com o boss
  // OU com um vírus pequeno da arena contaminada, antes de qualquer lógica de dano
  // normal correr (evita usar LEVELS[currentLevel] com dados do nível já terminado,
  // e evita teleportar o jogador de volta ao spawn do nível a meio de um combate).
  function handleBossMalwareCollision(malwareObj) {
    if (!inBossFight || !malwareObj || bossState.phase !== "platform") return false;
    const isBoss = malwareObj.getData("isBoss");
    const isMini = malwareObj.getData("isMiniHazard");
    if (!isBoss && !isMini) return false;
    if (invuln) return true; // já protegido — ignora este toque, sem reprocessar dano

    if (isMini) {
      // Vírus pequeno da arena contaminada — com Star Power esmaga-se como um
      // vilão normal (sem afetar o HP do boss principal); sem Star Power, dói
      // como qualquer outro toque, mas o vírus continua vivo (o timer de
      // manutenção repõe o número desejado, não é preciso geri-lo aqui).
      if (starPower) {
        ensureAudio(); beep({freq:600,dur:0.05,type:"square",vol:0.07,slideTo:200});
        const ex = sceneRef.add.particles(0,0,"spark_item",{
          x:malwareObj.x, y:malwareObj.y, speed:{min:70,max:200}, angle:{min:0,max:360},
          lifespan:340, quantity:14, scale:{start:0.9,end:0}, tint:[0x30c060,0xffffff]
        });
        sceneRef.time.delayedCall(280, () => { try{ex.destroy();}catch{} });
        score += 15; scoreText.setText(`🌟 Pontos: ${score}`);
        showFloat(sceneRef, malwareObj.x, malwareObj.y-40, "💥 Vírus eliminado!", "#30c060");
        bossMiniViruses = bossMiniViruses.filter(v => v !== malwareObj);
        malwareObj.destroy();
      } else {
        bossHitPlayer(sceneRef, malwareObj, "🦠 Cuidado com os vírus!");
      }
      return true;
    }

    // Boss "clássico à Mario" (ex.: Monstro da Ignorância, redesenho): nem
    // Star Power nem ataque especial — o único jeito de lhe fazer dano é
    // saltar-lhe em cima. Um toque de lado dói na mesma.
    if (bossState.def.stompBoss) return handleStompBossTouch(malwareObj);

    // Bosses com ataque especial próprio não têm um estado "desbloqueado por
    // Star Power" — o único jeito de lhe fazer dano é o ataque nomeado,
    // disparado ao completar a carga. Tocar-lhe dói SEMPRE.
    if (starPower && !bossState.def.specialAttack) {
      // Reaproveita a mesma sensação de "atropelar vilão" que já existe no jogo
      if(sceneRef.time.now < bossState.hitCooldownUntil) return true; // debita 1x por toque
      bossState.hitCooldownUntil = sceneRef.time.now + 500;
      ensureAudio(); beep({freq:600,dur:0.05,type:"square",vol:0.07,slideTo:200});
      damageBoss(sceneRef, malwareObj.x, malwareObj.y-60);
    } else {
      // Sem Star Power (ou num boss de ataque especial), tocar no boss agora DÓI
      // a sério — antes só empurrava, o que tornava os bosses demasiado
      // inofensivos. Perde-se uma vida, tal como ao tocar num vilão normal, com
      // o mesmo knockback e i-frames.
      const warn = bossState.def.specialAttack
        ? `⚡ Precisas do ${bossState.def.specialAttack.name}!`
        : "⭐ Precisas de Star Power!";
      bossHitPlayer(sceneRef, malwareObj, warn);
    }
    return true; // sinaliza a onHitMalware para NÃO aplicar a lógica normal de dano
  }

  // Dano do boss (toque direto ou projétil mau) — perde-se 1 vida, sofre-se um
  // knockback e fica-se protegido por instantes (i-frames), reaproveitando a
  // mesma sensação de onHitMalware. warnMsg é o aviso mostrado por cima da
  // perda de vida (varia consoante veio de um toque ou de um projétil).
  function bossHitPlayer(scene, sourceObj, warnMsg) {
    if (invuln || lives <= 0) return;
    ensureAudio(); SFX.hit();
    hitFlash.classList.add("active"); setTimeout(()=>hitFlash.classList.remove("active"),200);
    const knockDir = (sourceObj && sourceObj.x < player.x) ? 1 : -1;
    player.setVelocityX(knockDir * 300);
    player.setVelocityY(-320);
    scene.cameras.main.shake(160, 0.010);
    scene.cameras.main.flash(120,180,40,40);
    scene.tweens.add({
      targets: player,
      angle: { from: knockDir * -22, to: knockDir * 22 },
      duration: 80, yoyo: true, repeat: 2,
      ease: "Sine.easeInOut",
      onComplete: () => { if(player) player.setAngle(0); }
    });
    lives -= 1; updateHearts(); livesLostThisLevel++; _hudDirty = true;
    triggerVanBertoSad(scene);
    if (heartsGfx) scene.tweens.add({targets:heartsGfx,x:{from:-4,to:4},duration:60,yoyo:true,repeat:3,ease:"Sine.easeInOut",onComplete:()=>{if(heartsGfx)heartsGfx.x=0;}});
    invuln = true; // bloqueia novos toques já durante o voo de knockback
    if (warnMsg) showFloat(scene, player.x, player.y-60, warnMsg, "#ffd700");
    showFloat(scene, player.x, player.y-90, "💥 -1 Vida!", "#ff5050");
    if (lives <= 0) {
      scene.time.delayedCall(400, () => { if (lives<=0) showGameOver(); });
      return;
    }
    scene.time.delayedCall(400, () => {
      if (!player || !inBossFight) return;
      setInvuln(scene, 1400);
      tipText.setText("⚡ Protegido por instantes!");
    });
  }

  function startBossCollectPhase() {
    bossState.phase = "collect";
    const b = bossState.sprite;
    b.setVelocity(0,0); b.body.setEnable(false); b.setAlpha(0.35);
    if (bossLockIcon) { try{bossLockIcon.destroy();}catch{} bossLockIcon=null; } // boss já não é tocável — ícone deixa de fazer sentido
    if (bossRageIcon) { try{bossRageIcon.destroy();}catch{} bossRageIcon=null; }
    destroyBossHpBar(); // vida chegou a 0 — a barra já não tem função a partir daqui
    if (bossState.def.contaminatedArena) { clearToxicZones(); clearMiniViruses(); } // arena "cura-se" ao vencer o boss
    itemsGroup.getChildren().slice().forEach(o => { if((o.getData("kind")==="estrela" || o.getData("bossCharge")) && !o.getData("bossCollect")) o.destroy(); });
    const keyMap = { estrela:"item_estrela", heart:"item_heart", medalha:"item_medalha",
                     brinquedo:"item_brinquedo", balao:"item_chupachupa", livro:"item_livro" };
    const key = keyMap[bossState.def.collectKind] || "item_estrela";
    for (let i=0;i<bossState.def.collectCount;i++){
      const collectWorldW = bossState.def.arena?.worldW || 1600;
      const x = 250 + i*((collectWorldW-500)/bossState.def.collectCount);
      const it = itemsGroup.create(x, 300+Math.random()*80, key);
      it.setDepth(2).setData("kind", bossState.def.collectKind).setData("bossCollect", true);
      sceneRef.tweens.add({targets:it,y:it.y-8,duration:940,yoyo:true,repeat:-1,ease:"Sine.easeInOut"});
    }
    tipText.setText("⭐ Apanha tudo para enfraquecer o boss de vez!");
    itemCountText.setText(`${bossState.def.emoji} Itens: 0/${bossState.def.collectCount}`);
    vbSayRandom(VB_STAR_POWER,"info",3000);
  }

  // Chamado a partir do TOPO de onCollectItem
  function handleBossItemCollect(itemObj) {
    if (!inBossFight) return false;
    if (itemObj.getData("bossProjGood")) {
      itemObj.destroy();
      score += 10; scoreText.setText(`🌟 Pontos: ${score}`);
      ensureAudio(); SFX.coin();
      showFloat(sceneRef, player.x, player.y-68, "📖 +10 Sabedoria!", "#ffd700");
      return true;
    }
    if (itemObj.getData("bossProjBad")) {
      itemObj.destroy();
      if (invuln) return true; // já protegido — livro mau não conta durante i-frames
      ensureAudio(); beep({freq:180,dur:0.16,type:"sawtooth",vol:0.06,slideTo:80});
      // 1200ms (era 1500) — o livro mau já custa 1 vida + i-frames de 1400ms;
      // uma inversão mais curta reduz o risco de a criança ainda estar
      // confusa com os controlos quando os i-frames acabam.
      controlsInvertedUntil = sceneRef.time.now + 1200;
      bossHitPlayer(sceneRef, null, "😵 Informação errada!");
      return true;
    }
    if (itemObj.getData("bossCharge")) {
      handleChargeItemCollect(itemObj);
      return true;
    }
    if (itemObj.getData("bossProjQmark")) {
      itemObj.destroy();
      if (invuln) return true; // já protegido — ignora durante os i-frames
      ensureAudio(); beep({freq:220,dur:0.12,type:"square",vol:0.06,slideTo:120});
      bossHitPlayer(sceneRef, null, "❓ Apanhado por uma bola de dúvidas!");
      return true;
    }
    if (!itemObj.getData("bossCollect")) return false;
    itemObj.destroy();
    bossState.collected += 1;
    score += 10; scoreText.setText(`🌟 Pontos: ${score}`);
    ensureAudio(); SFX.coin();
    showFloat(sceneRef, player.x, player.y-68, `+1 (${bossState.collected}/${bossState.def.collectCount})`, "#ffd700");
    itemCountText.setText(`${bossState.def.emoji} Itens: ${bossState.collected}/${bossState.def.collectCount}`);
    if (bossState.collected >= bossState.def.collectCount) startBossQuizPhase();
    return true;
  }

  // Recolha de um item de carga (📚 do Monstro da Ignorância, por agora). Cada
  // item mostra uma curiosidade muito curta e quase invisível (não pausa nada),
  // reforçando a ideia de que o conhecimento é a arma — só ao apanhar o número
  // definido em specialAttack.chargeCount é que o ataque nomeado dispara sozinho.
  function handleChargeItemCollect(itemObj) {
    itemObj.destroy();
    if (!bossState || !bossState.def.specialAttack) return;
    const sa = bossState.def.specialAttack;
    bossState.chargeCollected = (bossState.chargeCollected || 0) + 1;
    score += 10; scoreText.setText(`🌟 Pontos: ${score}`);
    ensureAudio(); SFX.coin();
    const facts = sa.chargeFacts || [];
    const fact = facts.length ? facts[(bossState.chargeCollected - 1) % facts.length] : `+1 (${bossState.chargeCollected}/${sa.chargeCount})`;
    showFloat(sceneRef, player.x, player.y-68, fact, "#80d8ff");
    itemCountText.setText(`⚡ Carga: ${bossState.chargeCollected}/${sa.chargeCount}`);
    if (bossState.chargeCollected >= sa.chargeCount) fireBossSpecialAttack(sceneRef);
  }

  // O ataque especial em si — dispara automaticamente assim que a carga enche.
  // Visual configurável por boss (specialAttack.visual): "beam" (padrão, usado
  // pelo Monstro da Ignorância) ou "wave" (Onda da Saúde do Vírus Gigante, que
  // também limpa as zonas tóxicas da arena). Reaproveita damageBoss() para o
  // dano em si, para as fases de raiva reagirem exatamente como num boss normal.
  function fireBossSpecialAttack(scene) {
    if (!bossState || !bossState.sprite || !bossState.sprite.active) return;
    const sa = bossState.def.specialAttack;
    bossState.chargeCollected = 0;
    // Limpar itens de carga por apanhar, para a arena não ficar com "sobras"
    // enquanto decorre a animação do ataque.
    itemsGroup.getChildren().slice().forEach(o => { if (o.getData("bossCharge")) o.destroy(); });

    const b = bossState.sprite;
    const glowColor = sa.visualColor != null ? sa.visualColor : 0x80d8ff;
    itemCountText.setText(`⚡ ${sa.name}!`);
    showFloat(scene, player.x, player.y-90, `⚡ ${sa.name}!`, "#80d8ff");

    if (sa.visual === "wave") {
      // Onda da Saúde: um anel que se expande a partir do VanBerto's — sem
      // precisar de nenhuma textura nova, só Graphics redesenhado por frame.
      const ringGfx = scene.add.graphics().setDepth(9);
      const ringState = { r: 10 };
      scene.tweens.add({
        targets: ringState, r: 620, duration: 480, ease: "Cubic.easeOut",
        onUpdate: () => {
          if (!ringGfx.active) return;
          ringGfx.clear();
          ringGfx.lineStyle(8, glowColor, 0.65);
          ringGfx.strokeCircle(player.x, player.y - 20, ringState.r);
          ringGfx.lineStyle(3, 0xffffff, 0.6);
          ringGfx.strokeCircle(player.x, player.y - 20, ringState.r);
        },
        onComplete: () => { try{ringGfx.destroy();}catch{} }
      });
      // A onda "cura" a arena — limpa as zonas tóxicas e volta a semeá-las
      // pouco depois, para o desafio voltar sem deixar a arena limpa para sempre.
      if (bossState.def.contaminatedArena) {
        clearToxicZones();
        scene.time.delayedCall(4000, () => {
          if (inBossFight && bossState && bossState.phase === "platform" && bossState.def.contaminatedArena) spawnToxicZones(scene);
        });
      }
    } else {
      // Raio (padrão): uma linha grossa que cresce do jogador até ao boss e
      // desaparece rapidamente.
      const beamGfx = scene.add.graphics().setDepth(9);
      beamGfx.lineStyle(6, glowColor, 0.95);
      beamGfx.beginPath();
      beamGfx.moveTo(player.x, player.y - 20);
      beamGfx.lineTo(b.x, b.y);
      beamGfx.strokePath();
      beamGfx.lineStyle(2, 0xffffff, 0.9);
      beamGfx.beginPath();
      beamGfx.moveTo(player.x, player.y - 20);
      beamGfx.lineTo(b.x, b.y);
      beamGfx.strokePath();
      scene.tweens.add({ targets: beamGfx, alpha: 0, duration: 340, delay: 90, onComplete: () => { try{beamGfx.destroy();}catch{} } });
    }

    scene.cameras.main.flash(200, (glowColor>>16)&255, (glowColor>>8)&255, glowColor&255);
    scene.cameras.main.shake(160, 0.010);
    ensureAudio();
    beep({ freq:440, dur:0.10, type:"square", vol:0.06, slideTo:1200 });
    setTimeout(() => beep({ freq:900, dur:0.16, type:"triangle", vol:0.06, slideTo:1600 }), 90);

    const impactBurst = scene.add.particles(0, 0, "spark_item", {
      x: b.x, y: b.y, speed:{min:100,max:260}, lifespan:520, quantity:26,
      scale:{start:1.1,end:0}, angle:{min:0,max:360}, tint:[glowColor, 0xffffff, 0xffd700]
    });
    scene.time.delayedCall(90, () => {
      damageBoss(scene, b.x, b.y-60, "💥 Atingido!", 0.012);
      scene.time.delayedCall(500, () => { try{impactBurst.destroy();}catch{} });
    });
  }

  // ===== Flourish de vitória próprio de cada boss — Fase "Batalhas Épicas" =====
  // Substitui/complementa o confetti genérico por algo ligado ao tema do boss
  // vencido. Zero assets novos: só emoji + tweens, reaproveitando o padrão já
  // usado em showFloat/showBossBanner. Só o Monstro tem flourish próprio por
  // agora — os outros 3 bosses continuam só com o confetti genérico até
  // chegarmos à vez deles.
  function playBossVictoryFlourish(scene, def) {
    if (def.id === "monstro_ignorancia") {
      // "A luz do conhecimento": clarão quente + livros a subir e a dissipar-se,
      // como a névoa da ignorância a desfazer-se.
      scene.cameras.main.flash(420, 255, 246, 214);
      const cx = scene.cameras.main.worldView.centerX;
      for (let i = 0; i < 6; i++) {
        scene.time.delayedCall(i * 90, () => {
          if (!scene || !scene.add) return;
          const bx = cx - 150 + Math.random() * 300;
          const t = scene.add.text(bx, 420, "📚", { fontSize: "30px" }).setOrigin(0.5).setDepth(30).setAlpha(0);
          scene.tweens.add({ targets: t, y: 180, alpha: { from: 0, to: 1 }, duration: 900, ease: "Sine.easeOut" });
          scene.tweens.add({ targets: t, alpha: 0, duration: 300, delay: 700, onComplete: () => { try { t.destroy(); } catch {} } });
        });
      }
    }
  }

  function startBossQuizPhase() {
    bossState.phase = "quiz";
    if(bossState.sprite) bossState.sprite.destroy();
    const pool = QUIZ_BY_THEME[bossState.def.quizTheme] || QUIZ_BY_THEME["historia"];
    const quiz = pool[Math.floor(Math.random()*pool.length)];
    awaitingQuiz = true;
    sceneRef.physics.pause();
    player.setAlpha(0);
    tipText.setText("❓ Responde para derrotar o boss de vez!");
    // showQuiz() já trata de tentativas repetidas até acertar — só precisamos do done(true)
    showQuiz(quiz, () => {
      const def = bossState.def;
      const finished = bossState.onComplete;
      ensureAudio(); SFX.win();
      player.setAlpha(1);
      // Pequena "pose de vitória" — dois saltinhos rápidos do VanBerto's, para
      // o jogador sentir que o herói também está a celebrar, não só o ecrã.
      sceneRef.tweens.add({ targets: player, y: player.y - 24, duration: 170, yoyo: true, repeat: 1, ease: "Sine.easeOut" });
      if(bossOverlay){ try{bossOverlay.destroy();}catch{} bossOverlay=null; }
      if(bossLockIcon){ try{bossLockIcon.destroy();}catch{} bossLockIcon=null; }
      if(bossRageIcon){ try{bossRageIcon.destroy();}catch{} bossRageIcon=null; }
      if(bossVignette){ try{bossVignette.destroy();}catch{} bossVignette=null; }
      clearToxicZones(); clearMiniViruses();
      destroyBossHpBar();
      inBossFight = false; bossState = null;
      // NOTA: bossArenaDecor (livros flutuantes) fica de propósito durante a
      // celebração/confetti — sai já a seguir, em loadLevel() do próximo nível
      // (ou defensivamente lá, caso o fluxo mude no futuro).
      // Limpar o HUD do combate ANTES da cinemática — sem isto ficavam valores
      // congelados (ex.: "Itens: 5/5", a dica do quiz) visíveis por trás do diálogo.
      hudText.setText("🏆 Vitória!");
      itemCountText.setText("");
      tipText.setText("");
      // Momento de celebração — flash dourado + confetti no ecrã, logo após o
      // boss ser derrotado e antes do diálogo de despedida. Sem isto, vencer um
      // boss não tinha nenhum "clímax" visual, ao contrário do ecrã de vitória
      // final do jogo (que já tem confetti).
      sceneRef.cameras.main.flash(280, 255, 215, 60);
      playBossVictoryFlourish(sceneRef, def);
      const bossConfetti = sceneRef.add.particles(0, 0, "spark_item", {
        x: player.x, y: player.y - 40,
        speed: { min: 90, max: 260 }, lifespan: 900, quantity: 30,
        scale: { start: 1.1, end: 0 }, gravityY: 160,
        angle: { min: 0, max: 360 },
        tint: [0xffd700, 0xff6b35, 0x80d0ff, 0xffffff, 0x60ff80]
      });
      sceneRef.time.delayedCall(750, () => { try{bossConfetti.destroy();}catch{} });
      // Segunda onda de confetti, um pouco depois e com a cor do próprio boss
      // misturada — dá a sensação de uma celebração maior em vez de um único
      // burst instantâneo, sem exigir arte nova nenhuma.
      sceneRef.time.delayedCall(400, () => {
        const bossConfetti2 = sceneRef.add.particles(0, 0, "spark_item", {
          x: player.x, y: player.y - 30,
          speed: { min: 70, max: 220 }, lifespan: 1000, quantity: 26,
          scale: { start: 1, end: 0 }, gravityY: 140,
          angle: { min: 0, max: 360 },
          tint: [def.color, 0xffd700, 0xff80c0, 0x80ffea, 0xffffff]
        });
        sceneRef.time.delayedCall(900, () => { try{bossConfetti2.destroy();}catch{} });
      });
      // Pequeno acorde final a fechar a vitória — mais festivo do que o SFX.win()
      // sozinho, sem chegar ao exagero do fanfarrão do fim de jogo (finalWin()).
      setTimeout(() => {
        [880,1108,1318].forEach((f,i) => setTimeout(() =>
          beep({ freq:f, dur:0.22, type:"triangle", vol:0.05, slideTo:f*1.05 }), i*45));
      }, 300);
      // Cartão "✅ VITÓRIA!" a deslizar do topo — o mesmo tipo de flourish do
      // cartão de chegada do boss, para fechar a cena com o mesmo impacto com
      // que começou (antes só havia confetti, sem nenhum destaque de texto).
      showBossBanner(sceneRef, "✅ VITÓRIA!", "#8fffb0");
      // Toast "Direito Recuperado!" — nomeia concretamente o direito que este boss
      // guardava (em vez de só confetti genérico), reaproveitando o visual das
      // conquistas (achv-toast) que já existe e já é usado neste jogo.
      if (def.rightRecovered) {
        showAchievementToast({ tier: def.rightRecovered.emoji, name: def.rightRecovered.name }, "🎉 Direito Recuperado!");
      }
      // awaitingQuiz continua true durante a cinemática de vitória — só liberta
      // o jogador quando o portal for criado, a seguir ao diálogo.
      playBossDialogue([
        { speaker:"boss", name:def.name, emoji:def.emoji, text: def.defeatLine },
        { speaker:"vb", text: BOSS_VICTORY_VB[def.id] || "Conseguimos! Mais um direito está a salvo!" }
      ], () => {
        awaitingQuiz = false;
        scene_resumeAfterBoss();
        tipText.setText("🌀 Caminha até ao portal para continuares a aventura!");
        spawnBossPortal(sceneRef, finished, def.color);
      });
    });
  }

  // Portal que aparece na arena depois de um boss derrotado — o jogador tem de
  // caminhar até ele para avançar, em vez de seguir automaticamente para o
  // próximo nível. Reaproveita a mesma coreografia em fases da porta normal
  // (startDoorAnimation): aviso a pulsar → giro/crescimento com antecipação →
  // burst de partículas → jogador é puxado e desaparece no vórtice.
  // Centrado na arena (tal como o portal fica sempre bem visível a meio de um
  // nível normal) e SEM tinta — usa o mesmo "door_party" com o mesmo aspeto
  // exato da porta normal, para não parecer um objeto diferente. "color" só é
  // usado agora no brilho das partículas à volta, para manter alguma
  // identidade do boss sem alterar o próprio portal.
  function spawnBossPortal(scene, onEnter, color = 0x9060ff) {
    const px = 800, py = 380;
    const portal = scene.physics.add.staticSprite(px, py, "door_party").setDisplaySize(88,104);
    portal.clearTint();
    portal.refreshBody();
    scene.tweens.add({ targets:portal, scaleX:{from:1,to:1.1}, scaleY:{from:1,to:1.1}, duration:700, yoyo:true, repeat:-1, ease:"Sine.easeInOut" });
    const ring = scene.add.particles(0,0,"spark_item",{
      x:px, y:py, speed:{min:20,max:60}, lifespan:900, quantity:1, frequency:120,
      scale:{start:0.7,end:0}, tint:[color,0xffd700,0xffffff]
    });
    const lbl = scene.add.text(px, py-88, "🌀 Portal!", { fontSize:"16px", fontStyle:"900", color:"#e0c8ff", stroke:"#200040", strokeThickness:5 }).setOrigin(0.5).setDepth(20);
    scene.tweens.add({ targets:lbl, y:py-98, duration:900, yoyo:true, repeat:-1, ease:"Sine.easeInOut" });

    let triggered = false;
    let ov = null;
    ov = scene.physics.add.overlap(player, portal, () => {
      if (triggered) return;
      triggered = true;
      try{ scene.physics.world.removeCollider(ov); }catch{}
      try{ ring.stop(); }catch{}
      scene.tweens.killTweensOf(lbl);
      scene.tweens.add({ targets:lbl, alpha:0, duration:200, onComplete:()=>lbl.destroy() });
      ensureAudio(); SFX.doorOpen();
      scene.physics.pause();

      // FASE 1 — aviso: o portal pulsa depressa antes de "acordar"
      scene.tweens.killTweensOf(portal);
      scene.tweens.add({
        targets: portal,
        scaleX: { from: portal.scaleX, to: portal.scaleX * 1.18 },
        scaleY: { from: portal.scaleY, to: portal.scaleY * 1.18 },
        duration: 110, yoyo: true, repeat: 2,
        ease: "Sine.easeInOut",
        onComplete: () => {
          portal.setScale(1);

          // Burst de partículas na ativação (mesma sensação da porta normal)
          const burst = scene.add.particles(0, 0, "spark_item", {
            x: px, y: py - 10,
            speed: { min: 60, max: 200 }, lifespan: 500, quantity: 22,
            scale: { start: 1.1, end: 0 }, gravityY: 60,
            angle: { min: 0, max: 360 },
            tint: [color, 0xffd700, 0xffffff, 0x80d0ff]
          });
          scene.time.delayedCall(420, () => { try{burst.destroy();}catch{} });

          // FASE 1.5 — o VanBerto's faz a dança do robô antes de ser sugado
          playVanBertoDance(scene, () => {

          // FASE 2 — o portal gira e cresce (efeito de antecipação), só depois é que "suga"
          scene.tweens.add({
            targets: portal,
            angle: { from: 0, to: 360 },
            scaleX: { from: 1, to: 1.3 },
            scaleY: { from: 1, to: 1.3 },
            duration: 380, ease: "Back.easeIn",
            onComplete: () => {

              // FASE 3 — jogador é puxado para o centro do portal e desaparece no vórtice
              scene.tweens.add({
                targets: player, x: portal.x, y: portal.y - 10,
                scaleX: 0.05, scaleY: 0.05, angle: 720, alpha: 0,
                duration: 380, ease: "Sine.easeIn",
                onComplete: () => {
                  if (scene && scene.tweens) scene.tweens.killTweensOf(player);
                  player.setAlpha(0); player.setAngle(0); player.setScale(1);
                  try{ ring.destroy(); }catch{}
                  try{ portal.destroy(); }catch{}
                  onEnter();
                }
              });
            }
          });

          }); // fim playVanBertoDance (FASE 1.5)
        }
      });
    }, null, scene);
  }

  function scene_resumeAfterBoss() {
    if (sceneRef) sceneRef.physics.resume();
  }

  function nextLevel(scene){
    const next=currentLevel+1;
    // Cancelar timers da porta antes da transição — evita watchdog disparar no nível seguinte
    if(_doorWatchdogTimer){ try{_doorWatchdogTimer.remove(false);}catch{} _doorWatchdogTimer=null; }
    if(_landingCheckTimer){ try{_landingCheckTimer.remove(false);}catch{} _landingCheckTimer=null; }
    document.getElementById("artefactRevealOverlay")?.classList.remove("show");
    document.getElementById("setBonusOverlay")?.classList.remove("show");
    // Garantir robot invisível ANTES de fechar o quiz overlay
    scene.tweens.killTweensOf(player);
    player.setAlpha(0);
    player.setVelocity(0,0);
    if(door?.active) door.setAlpha(0);
    quizOverlay.classList.add("hidden"); btnCloseQuiz.classList.add("hidden");
    // Manter awaitingQuiz=true durante TODA a transição — o loadLevel trata de o resetar.
    // Se fosse false aqui, havia uma janela de ~750ms em que o jogador (invisível mas com
    // corpo físico ativo) podia ser atingido por um vilão e perder uma vida indevidamente.
    awaitingQuiz=true;
    scene.physics.pause();

    if(livesLostThisLevel===0){
      score+=50; bonusStars.textContent="⭐⭐⭐\n+50 Nível Perfeito!";
      bonusStars.classList.add("show"); setTimeout(()=>bonusStars.classList.remove("show"),2000);
    }
    livesLostThisLevel=0;

    setTimeout(()=>{
      if(next>=LEVELS.length){scene.physics.resume();showVictoryScreen(scene);return;}
      score+=100; scoreText.setText(`🌟 Pontos: ${score}`); _hudDirty=true;

      const goToNextLevel = () => {
        const justFinished = currentLevel; // ainda não foi atualizado por loadLevel
        if (isLastLevelOfRegion(justFinished)) {
          awaitingQuiz = false; awaitingStory = false;
          celebrateWorldComplete(regionForLevel(justFinished), () => {
            openOverlay("mapOverlay", renderMap);
          });
          return;
        }
        enterLevelWithStory(scene,next,
          ()=>{ loadLevel(scene,next); },
          ()=>{ showHistory(next,()=>{
            if(!pausedByTeacher) scene.physics.resume();
          }); }
        );
      };

      if (BOSS_BY_LEVEL[currentLevel]) {
        startBossFight(scene, currentLevel, goToNextLevel);
      } else {
        goToNextLevel();
      }
      saveGame();
    },750);
  }

  function _hideBossHUD(){ /* reservado para bosses futuros */ }

  function showGameOver(){
    try{sceneRef.physics.pause();}catch{}
    awaitingQuiz=true; touch.left=touch.right=touch.jump=touch.crouch=false;
    try{player.setVelocity(0,0);}catch{}
    _hideBossHUD();
    document.getElementById("artefactRevealOverlay")?.classList.remove("show");
    document.getElementById("setBonusOverlay")?.classList.remove("show");
    ensureAudio(); SFX.gameOver();
    document.getElementById("gameOverOverlay").classList.remove("hidden");
  }

  function startConfetti(durationMs=5000){
    const el=document.getElementById("confetti"); if(!el) return;
    el.classList.remove("hidden"); el.innerHTML="";
    const emojis=["🎈","✨","⭐","🌟","🧸","🎁","🎊","🎉","🏆","🎀","🌈","💫","🥳","🎆","🎇","🪅","🏅","🎵","🎶","❤️","🌺","🦋","🐝"];
    const vw=Math.max(320,window.innerWidth||800);
    // Muito mais confetis na vitoria final
    const isMobile=window.matchMedia("(max-width:768px)").matches;
    const confettiCount=isMobile?180:400;
    for(let i=0;i<confettiCount;i++){
      const s=document.createElement("span");
      s.textContent=emojis[i%emojis.length];
      s.style.left=(Math.random()*vw)+"px";
      // Tamanhos variados para profundidade visual
      const sz=12+Math.floor(Math.random()*20);
      s.style.fontSize=sz+"px";
      s.style.animationDuration=(1.8+Math.random()*4.5)+"s";
      s.style.animationDelay=(Math.random()*3.5)+"s";
      s.style.opacity=(0.75+Math.random()*0.25).toFixed(2);
      el.appendChild(s);
    }
    setTimeout(()=>{el.classList.add("hidden");el.innerHTML="";},durationMs);
  }

  function showVictoryScreen(scene){
    try{scene.physics.pause();}catch{}
    awaitingQuiz=true;
    touch.left=touch.right=touch.jump=touch.crouch=false;
    try{clearPower(scene);}catch{}
    try{clearStarPower(scene);}catch{}
    try{clearDoubleJump(scene);}catch{}
    if(powerHaloGfx){try{powerHaloGfx.clear();powerHaloGfx.setVisible(false);}catch{}}
    if(shadowGfx){try{shadowGfx.clear();shadowGfx.setVisible(false);}catch{}}
    hideDoorGlow();
    const _gameDiv=document.getElementById("game");
    if(_gameDiv) _gameDiv.style.visibility="hidden";
    ensureAudio(); SFX.finalWin(); startConfetti(28000);
    // Galeria de artefactos → depois ecrã de vitória
    showArtefactGallery(() => {
      const pct=quizStats.total?Math.round((quizStats.correct/quizStats.total)*100):0;
      let medal="🥉 Bronze — missão concluída!";
      if(pct>=70) medal="🥈 Prata — muito bem!";
      if(pct>=90) medal="🥇 Ouro — excelente!";
      const master=(!quizStats.everWrong&&quizStats.total>0)?" 🌟 Defensor Perfeito dos Direitos!":"";
      document.getElementById("winPlayerName").textContent=playerName||"Herói das Crianças";
      document.getElementById("winScore").textContent=score;
      document.getElementById("winPct").textContent=`${quizStats.correct}/${quizStats.total} (${pct}%)`;
      document.getElementById("winMedal").textContent=medal+master;

      // ── Tabela de temas com erros — aparece logo se existirem ───────
      const THEME_LABELS={
        historia:"O Dia da Criança",declaracao:"Declaração de 1959",
        convencao:"Convenção de 1989",brincar:"Direito ao Brincar",
        educacao:"Direito à Educação",saude:"Direito à Saúde",
        protecao:"Direito à Proteção",participacao:"Participação",
        futuro:"Futuro Sustentável",unicef:"UNICEF",
        identidade:"Identidade",familia:"Família",
        refugiados:"Refugiados",trabalho:"Trabalho Infantil",
        expressao:"Expressão",privacidade:"Privacidade",
        cultura:"Cultura",deficiencia:"Inclusão",
        ambiente:"Ambiente",digital:"Mundo Digital"
      };
      const winThemeErrors=document.getElementById("winThemeErrors");
      const winThemeTable=document.getElementById("winThemeTable");
      const hasThemeErrors=Object.keys(quizStats.errorsByTheme||{}).length>0;
      if(winThemeErrors&&winThemeTable){
        if(hasThemeErrors){
          winThemeErrors.style.display="block";
          winThemeTable.innerHTML="";
          const hdr=document.createElement("tr");
          hdr.innerHTML=`<th style="text-align:left;padding:3px 6px;border-bottom:1px solid rgba(255,215,0,0.3);color:#ffd700;font-size:11px;">Tema</th><th style="text-align:center;padding:3px 6px;border-bottom:1px solid rgba(255,215,0,0.3);color:#ffd700;font-size:11px;">Erros</th>`;
          winThemeTable.appendChild(hdr);
          Object.entries(quizStats.errorsByTheme).sort((a,b)=>b[1]-a[1]).forEach(([theme,count])=>{
            const tr=document.createElement("tr");
            const label=THEME_LABELS[theme]||theme;
            const bg=count>=3?"rgba(255,80,50,0.12)":count===2?"rgba(255,160,50,0.08)":"transparent";
            const col=count>=3?"#ff6050":count===2?"#ffaa40":"#a0ffb0";
            tr.innerHTML=`<td style="padding:5px 6px;background:${bg};border-radius:4px 0 0 4px;">${label}</td><td style="text-align:center;padding:5px 6px;background:${bg};font-weight:700;color:${col};border-radius:0 4px 4px 0;">${count}</td>`;
            winThemeTable.appendChild(tr);
          });
        } else {
          winThemeErrors.style.display="none";
        }
      }

      // ── Botão "Ver erros" — visível apenas se houver erros ──────────
      const btnReview=document.getElementById("btnReviewMode");
      if(btnReview){
        if(quizStats.errors&&quizStats.errors.length>0){
          btnReview.style.display="block";
          btnReview.textContent=`📋 Ver ${quizStats.errors.length} erro${quizStats.errors.length>1?"s":""}`;
          btnReview.onclick=()=>{
            const reviewList=document.getElementById("reviewList");
            if(reviewList){
              reviewList.innerHTML="";
              quizStats.errors.forEach((e,i)=>{
                const pool=QUIZ_BY_THEME[e.theme]||[];
                const orig=pool.find(q=>q.q===e.q);
                const exp=orig?.exp||"";
                const art=QUIZ_ARTICLE[e.theme];
                const div=document.createElement("div");
                div.className="review-question";
                div.innerHTML=`
                  ${art?`<div style="margin-bottom:5px;"><span class="quiz-article-badge">📜 ${art}</span></div>`:""}
                  <div class="review-question-text">${i+1}. ${e.level} — ${e.q}</div>
                  <div class="review-wrong">❌ A tua resposta: <strong>${e.wrong}</strong></div>
                  <div class="review-correct">✅ Resposta certa: <strong>${e.correct}</strong></div>
                  ${exp?`<div class="review-explanation">💡 ${exp}</div>`:""}
                `;
                reviewList.appendChild(div);
              });
            }
            document.getElementById("reviewOverlay").classList.remove("hidden");
            document.getElementById("winOverlay")?.classList.add("hidden");
          };
        } else {
          btnReview.style.display="none";
        }
      }
      const btnCloseReview=document.getElementById("btnCloseReview");
      if(btnCloseReview){
        btnCloseReview.onclick=()=>{
          document.getElementById("reviewOverlay").classList.add("hidden");
          document.getElementById("winOverlay")?.classList.remove("hidden");
        };
      }
      // Grelha dos direitos conquistados
      const _rg=document.getElementById("winRightsGrid");
      if(_rg){
        _rg.innerHTML="";
        ARTEFACTS.forEach((art,i)=>{
          const done=!!collectedArtefacts[i];
          const div=document.createElement("div");
          div.className="win-right-card"+(done?" win-right-done":" win-right-locked");
          div.innerHTML=done
            ?`<span class="wrc-emoji">${art.emoji}</span><span class="wrc-name">${art.short}</span>`
            :`<span class="wrc-emoji">🔒</span><span class="wrc-name">???</span>`;
          div.title=done?art.name:"Direito por descobrir";
          _rg.appendChild(div);
        });
      }
      // Abrir sempre no separador Relatório
      document.querySelectorAll(".win-tab").forEach((t,i)=>t.classList.toggle("active",i===0));
      document.querySelectorAll(".win-panel").forEach((p,i)=>p.classList.toggle("active",i===0));
      // Ligar os separadores (Relatório / Direitos) aos respetivos painéis
      document.querySelectorAll(".win-tab").forEach(tabBtn=>{
        tabBtn.onclick=()=>{
          const targetId=tabBtn.dataset.panel;
          document.querySelectorAll(".win-tab").forEach(t=>t.classList.toggle("active",t===tabBtn));
          document.querySelectorAll(".win-panel").forEach(p=>p.classList.toggle("active",p.id===targetId));
        };
      });
      // ── Botões extra: Mapa e Conquistas (aditivo, reaproveita ecrãs já existentes) ──
      // Escondem o winOverlay ao abrir (ver _winOverlaySubOpen); closeOverlay() volta a
      // mostrá-lo automaticamente assim que o Mapa/Conquistas é fechado.
      if(typeof btnWinRestart !== "undefined" && btnWinRestart && !document.getElementById("btnWinMap")){
        const extraWrap=document.createElement("div");
        extraWrap.style.cssText="display:flex;gap:8px;justify-content:center;margin-top:8px;flex-wrap:wrap;";
        const mk=(id,label,fn)=>{
          const b=document.createElement("button");
          b.id=id; b.className="btn"; b.textContent=label;
          b.onclick=fn;
          return b;
        };
        extraWrap.appendChild(mk("btnWinMap","🗺️ Mapa",()=>{
          // Esconder o winOverlay antes de abrir o mapa — caso contrário o mapa abre
          // por trás dele (mesmo z-index, mas o winOverlay vem depois no HTML) e fica
          // invisível. closeOverlay("mapOverlay") repõe o winOverlay automaticamente.
          document.getElementById("winOverlay")?.classList.add("hidden");
          _winOverlaySubOpen = true;
          openOverlay("mapOverlay",renderMap);
        }));
        extraWrap.appendChild(mk("btnWinAchievements","🏆 Conquistas",()=>{
          document.getElementById("winOverlay")?.classList.add("hidden");
          _winOverlaySubOpen = true;
          openAchievementsScreen();
        }));
        btnWinRestart.parentElement.appendChild(extraWrap);
      }
      document.getElementById("winOverlay").classList.remove("hidden");
    }); // fim showArtefactGallery
  }

  function showQuiz(quiz,done,isRetry){
    quizOverlay.classList.remove("hidden");
    const _qTheme = LEVELS[currentLevel]?.quizTheme;
    const _article = QUIZ_ARTICLE[_qTheme];
    const _badgeHTML = _article ? `<span class="quiz-article-badge">📜 ${_article}</span><br>` : "";
    quizQuestion.innerHTML = _badgeHTML + (isRetry ? "🔄 Segunda tentativa! " : "") + quiz.q;
    quizAnswers.innerHTML=""; quizFeedback.textContent=""; quizFeedback.style.color="#ff6b35";
    quizExplanation.textContent=""; quizExplanation.classList.add("hidden");
    // Limpar sempre o btnCloseQuiz ao abrir nova pergunta — evita cliques acidentais
    btnCloseQuiz.classList.add("hidden"); btnCloseQuiz.onclick=null;

    const correct=quiz.a.filter(x=>x.ok), wrong=quiz.a.filter(x=>!x.ok);
    for(let i=wrong.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[wrong[i],wrong[j]]=[wrong[j],wrong[i]];}
    const opts=[...correct.slice(0,1),...wrong.slice(0,2)];
    for(let i=opts.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[opts[i],opts[j]]=[opts[j],opts[i]];}

    let answered=false;
    opts.forEach(ans=>{
      const b=document.createElement("button");
      b.className="btn"; b.textContent=ans.t;
      b.setAttribute("aria-label",`Resposta: ${ans.t}`);
      b.onclick=()=>{
        if(answered) return; answered=true;
        ensureAudio(); if(!isRetry) quizStats.total+=1;

        quizAnswers.querySelectorAll(".btn").forEach(btn=>{
          btn.disabled=true;
          if(btn.textContent===correct[0].t){
            btn.style.background="rgba(20,80,20,0.75)";
            btn.style.borderColor="#4caf50";
            btn.style.color="#b8ffb8";
          } else if(btn===b&&!ans.ok){
            btn.style.background="rgba(100,20,20,0.75)";
            btn.style.borderColor="#c0392b";
            btn.style.color="#ffb8b8";
          } else { btn.style.opacity="0.35"; }
        });

        if(ans.ok){
          if(!isRetry) quizStats.correct+=1;
          // Rastrear para estatísticas globais
          if(typeof globalStats !== "undefined") {
            if(!isRetry){
              globalStats.quizTotal += 1;
              globalStats.quizCorrect += 1;
              saveGlobalStats();
            }
            showDynamicMsg(DYNAMIC_MSGS_CORRECT);
          }
          // Rastrear conquistas (a reavaliação com a contagem de níveis é feita
          // depois de markLevelCompleted, no done(ok) — ver nextLevel/showQuiz)
          onCorrectAnswerForAchievements(!isRetry);
          checkAchievements(mapProgress.levelsCompleted.length);
          btnCloseQuiz.classList.add("hidden"); btnCloseQuiz.onclick=null;
          quizFeedback.textContent=isRetry?"✅ Conseguiste na segunda tentativa! 💪":"✅ Muito bem!";
          quizFeedback.style.color="#208050";
          SFX.coin();
          vbSayRandom(VB_QUIZ_CORRECT,"good",3200);
          // Mostrar SEMPRE: explicação do quiz E/OU dica do tema
          const tipFact = QUIZ_TIPS[LEVELS[currentLevel]?.quizTheme] || "";
          const expText = quiz.exp ? "💡 " + quiz.exp : "";
          const combined = expText || (tipFact ? "📌 Recorda: " + tipFact : "");
          if(combined){
            quizExplanation.textContent = combined;
            quizExplanation.classList.remove("hidden");
            btnCloseQuiz.classList.remove("hidden");
            btnCloseQuiz.textContent = "Continuar ▶";
            btnCloseQuiz.onclick=()=>{
              btnCloseQuiz.classList.add("hidden"); btnCloseQuiz.onclick=null;
              // Esconder robot ANTES de fechar o overlay
              if(sceneRef&&player){ sceneRef.tweens.killTweensOf(player); player.setAlpha(0); }
              quizOverlay.classList.add("hidden"); done(true);
            };
          } else {
            setTimeout(()=>{
              // Esconder robot ANTES de fechar o overlay
              if(sceneRef&&player){ sceneRef.tweens.killTweensOf(player); player.setAlpha(0); }
              quizOverlay.classList.add("hidden"); done(true);
            },900);
          }
        } else {
          quizStats.everWrong=true; SFX.hit();
          // Rastrear para estatísticas globais (só conta na primeira tentativa)
          if(!isRetry && typeof globalStats !== "undefined") {
            globalStats.quizTotal += 1;
            globalStats.quizWrong += 1;
            saveGlobalStats();
            showDynamicMsg(DYNAMIC_MSGS_WRONG);
          }
          if(sceneRef&&player){sceneRef.tweens.add({targets:player,angle:{from:-10,to:10},duration:80,yoyo:true,repeat:4,ease:"Sine.easeInOut",onComplete:()=>{if(player)player.setAngle(0);}});}
          vbSayRandom(VB_QUIZ_WRONG,"wrong",3200);

          quizStats.errors=quizStats.errors||[];
          if(!isRetry) {
            const qTheme = LEVELS[currentLevel]?.quizTheme || "historia";
            quizStats.errors.push({level:LEVELS[currentLevel]?.name||`Nível ${currentLevel+1}`,theme:qTheme,q:quiz.q,wrong:ans.t,correct:correct[0].t});
            quizStats.errorsByTheme[qTheme] = (quizStats.errorsByTheme[qTheme]||0) + 1;
          }
          if(quiz.exp){quizExplanation.textContent="💡 "+quiz.exp;quizExplanation.classList.remove("hidden");}
          const tip=QUIZ_TIPS[LEVELS[currentLevel]?.quizTheme]||"";
          quizFeedback.textContent="❌ Quase! A resposta certa era: "+correct[0].t+"\nTenta outra pergunta!";
          if(tip) quizFeedback.textContent+=`\n💡 Lembra-te: ${tip}`;
          quizFeedback.style.color="#e84d10";
          btnCloseQuiz.classList.remove("hidden"); btnCloseQuiz.textContent="🔄 Tentar outra pergunta";
          btnCloseQuiz.onclick=()=>{
            btnCloseQuiz.classList.add("hidden");
            showQuiz(pickQuizForLevel(currentLevel,LEVELS[currentLevel].quizTheme),done,true);
          };
        }
      };
      quizAnswers.appendChild(b);
    });
  }

  // ===== Itens =====
  const ITEM_LABELS={
    estrela:    {label:"⭐ STAR POWER! 8s",      color:"#ffd700"},
    balao:      {label:"🍭 Chupa-chupa +10",    color:"#e0209a"},
    brinquedo:  {label:"🧸 Brinquedo +10",      color:"#a050ff"},
    medalha:    {label:"🛡️ Escudo! PROTEGIDO",  color:"#ffd700"},
    duplosalto: {label:"🦅 Duplo Salto! 10s",   color:"#80d0ff"},
    heart:      {label:"❤️ +1 Vida!",           color:"#e84d10"}
  };

  // Cores das partículas por tipo de item
  const ITEM_TINTS={
    estrela:    [0xffd700, 0xffe980, 0xffffff, 0xff6b35],
    balao:      [0xe0209a, 0xff80c0, 0xffd700, 0x9030e0],
    brinquedo:  [0xa050ff, 0xff80c0, 0xffd700, 0xffffff],
    medalha:    [0xffd700, 0xffe980, 0xffffff, 0xff9500],
    duplosalto: [0x80d0ff, 0xffffff, 0xffd700, 0xa0e8ff],
    heart:      [0xff2040, 0xff6080, 0xffffff, 0xe84d10]
  };

  function onCollectItem(playerObj,itemObj){
    if (handleBossItemCollect(itemObj)) return;
    if(awaitingQuiz) return;
    const kind=itemObj.getData("kind");
    const idx=itemObj.getData("itemIdx");
    const secretBonus = itemObj.getData("secretPoints") || 0;
    if(idx !== undefined && idx >= 0) collectedItemIndices.add(idx);
    itemObj.destroy();
    const totalPoints = 10 + secretBonus;
    score += totalPoints; scoreText.setText(`🌟 Pontos: ${score}`); _hudDirty=true;
    if(kind!=="heart"){ itemsCollected=Math.min(itemsCollected+1,itemsTotal); itemCountText.setText(`⭐ Itens: ${itemsCollected}/${itemsTotal}`); }
    const lbl=ITEM_LABELS[kind]||{label:"+10 ⭐",color:"#ff6b35"};
    showFloat(sceneRef,playerObj.x,playerObj.y-68,lbl.label,lbl.color);
    if(Math.random()<0.35) showFloat(sceneRef,playerObj.x,playerObj.y-100,pickPraise(),"#ffd700");
    ensureAudio(); SFX.coin();
    // Burst de partículas com cores específicas por tipo
    const tint = ITEM_TINTS[kind] || [0xffd700,0xff6b35,0xffffff,0xa0ff80];
    const qty  = kind==="medalha" ? 22 : kind==="heart" ? 18 : 14;
    const p=sceneRef.add.particles(0,0,"spark_item",{x:playerObj.x,y:playerObj.y,speed:{min:60,max:190},lifespan:420,quantity:qty,scale:{start:1.1,end:0},gravityY:380,tint});
    sceneRef.time.delayedCall(300,()=>p.destroy());
    if(kind==="medalha"){givePower(sceneRef);tipText.setText("🛡️ ESCUDO ATIVO: VanBerto's está protegido e aumentado!");}
    if(kind==="duplosalto"){giveDoubleJump(sceneRef);}
    if(kind==="estrela"){giveStarPower(sceneRef);}
    if(kind==="heart"){
      if(lives<MAX_LIVES){
        lives+=1; updateHearts(); ensureAudio(); SFX.life();
        tipText.setText("❤️ Ganhaste uma vida extra!");
        triggerVanBertoHappy(sceneRef);
        if(heartsGfx&&sceneRef) sceneRef.tweens.add({targets:heartsGfx,scaleX:{from:1,to:1.25},scaleY:{from:1,to:1.25},duration:140,yoyo:true,repeat:1,ease:"Back.easeOut"});
      } else { showFloat(sceneRef,playerObj.x,playerObj.y-100,"❤️ MÁXIMO!","#e84d10"); }
    }
    saveGame();
  }

  function onHitMalware(playerObj, malwareObj){
    if (handleBossMalwareCollision(malwareObj)) return;
    if(invuln||awaitingQuiz||_overlayPaused||pausedByTeacher) return;

    // ── STAR POWER: atropela o vilão ─────────────────────────────
    if(starPower && malwareObj && malwareObj.active){
      ensureAudio();
      beep({freq:600,dur:0.05,type:"square",vol:0.07,slideTo:200});
      // Explosão no sítio do vilão
      const ex=sceneRef.add.particles(0,0,"spark_item",{
        x:malwareObj.x, y:malwareObj.y,
        speed:{min:80,max:240}, angle:{min:0,max:360},
        lifespan:380, quantity:18, scale:{start:1.1,end:0}, gravityY:200,
        tint:[0xffd700,0xff6b35,0xff0000,0xffffff]
      });
      sceneRef.time.delayedCall(280,()=>ex.destroy());
      sceneRef.cameras.main.shake(100,0.006);
      score+=50; scoreText.setText(`🌟 Pontos: ${score}`); _hudDirty=true;
      showFloat(sceneRef,malwareObj.x,malwareObj.y-50,"💥 +50","#ff6b35");
      // Rastrear inimigo derrotado
      if(typeof globalStats !== "undefined") {
        globalStats.enemiesDefeated += 1;
        saveGlobalStats();
      }
      // Destruir o vilão (com respawn depois de 4s, como os outros)
      malwareObj.setActive(false).setVisible(false);
      malwareObj.body.setEnable(false);
      const _cs=_critterSession;
      sceneRef.time.delayedCall(4000,()=>{
        if(_cs!==_critterSession||!malwareObj) return;
        malwareObj.setPosition(malwareObj.getData("originX")||malwareObj.x,
                               malwareObj.getData("originY")||malwareObj.y);
        malwareObj.setActive(true).setVisible(true);
        malwareObj.body.setEnable(true);
        // Proteger o jogador por 1s se estiver perto do ponto de respawn
        if(player && !invuln){
          const ox = malwareObj.getData("originX") || malwareObj.x;
          const oy = malwareObj.getData("originY") || malwareObj.y;
          if(Math.hypot(player.x-ox, player.y-oy) < 140) setInvuln(sceneRef, 1000);
        }
      });
      return;
    }

    ensureAudio(); SFX.hit();
    hitFlash.classList.add("active"); setTimeout(()=>hitFlash.classList.remove("active"),200);

    // ── Knockback visual ──────────────────────────────────────
    // Direção oposta ao vilão; se não há referência usa esquerda
    const knockDir = (malwareObj && malwareObj.x < playerObj.x) ? 1 : -1;
    player.setVelocityX(knockDir * 320);
    player.setVelocityY(-340);
    sceneRef.cameras.main.shake(180, 0.009);
    // Flash vermelho no player + giro
    sceneRef.tweens.add({
      targets: player,
      angle: { from: knockDir * -25, to: knockDir * 25 },
      duration: 80, yoyo: true, repeat: 2,
      ease: "Sine.easeInOut",
      onComplete: () => { if(player) player.setAngle(0); }
    });
    // ─────────────────────────────────────────────────────────

    if(powered){clearPower(sceneRef);setInvuln(sceneRef,800);tipText.setText("🛡️ Escudo usado! Cuidado.");return;}
    lives-=1; updateHearts(); livesLostThisLevel++; _hudDirty=true;
    triggerVanBertoSad(sceneRef);
    if(heartsGfx&&sceneRef) sceneRef.tweens.add({targets:heartsGfx,x:{from:-4,to:4},duration:60,yoyo:true,repeat:3,ease:"Sine.easeInOut",onComplete:()=>{if(heartsGfx)heartsGfx.x=0;}});
    // Marca invuln imediatamente para bloquear hits durante o voo de knockback
    invuln=true;
    // Após o voo de knockback, teletransportar e iniciar 2s de proteção completa
    sceneRef.time.delayedCall(400, () => {
      if(!player) return;
      const L=LEVELS[currentLevel];
      touch.left=touch.right=touch.jump=touch.crouch=false;
      player.setVelocity(0,0); player.setPosition(L.spawn.x,L.spawn.y); snapPlayerToGround();
      if(lives<=0){showGameOver();return;}
      // Iniciar invulnerabilidade de 2s a partir do spawn (não do hit)
      setInvuln(sceneRef, 2000);
      // Flash de "reaparecimento" — círculo de luz no spawn
      const spawnFlash = sceneRef.add.graphics().setDepth(10);
      spawnFlash.fillStyle(0xffffff, 0.7);
      spawnFlash.fillCircle(L.spawn.x, L.spawn.y, 30);
      sceneRef.tweens.add({ targets: spawnFlash, alpha: 0, scaleX: 2.5, scaleY: 2.5,
        duration: 400, ease: "Quad.easeOut",
        onComplete: () => spawnFlash.destroy() });
      tipText.setText("⚡ Protegido por 2s!");
      vbSayRandom(VB_HIT,"hit",3000);
    });
    if(lives<=0) return; // evitar correr o resto se já vai para game over
    // Ao perder uma vida, os itens voltam a aparecer — EXCETO os corações já apanhados
    const heartIndicesCollected = new Set(
      [...collectedItemIndices].filter(idx => LEVELS[currentLevel].items[idx]?.kind === "heart")
    );
    collectedItemIndices.clear();
    heartIndicesCollected.forEach(idx => collectedItemIndices.add(idx));
    itemsCollected = 0;
    itemCountText.setText(`⭐ Itens: ${itemsCollected}/${itemsTotal}`);
    const keyMap={
      estrela:"item_estrela",
      balao:"item_chupachupa",
      brinquedo:"item_brinquedo",medalha:"item_medalha",heart:"item_heart",
      duplosalto:"item_duplosalto"
    };
    LEVELS[currentLevel].items.forEach((it,idx)=>{
      if(it.kind==="heart" && heartIndicesCollected.has(idx)) return;
      const exists=itemsGroup.getChildren().some(o=>o.getData("itemIdx")===idx);
      if(exists) return;
      const _km=keyMap[it.kind]; const _key=typeof _km==="function"?_km():(_km||"item_estrela");
      const obj=itemsGroup.create(it.x,it.y,_key);
      obj.setDepth(2);
      sceneRef.tweens.add({targets:obj,y:obj.y-8,duration:940,yoyo:true,repeat:-1,ease:"Sine.easeInOut"});
      obj.setData("kind",it.kind);
      obj.setData("itemIdx",idx);
    });
    // Recriar também os escudos extra (itemIdx === -1) se já não existir nenhum no mapa
    const hasExtraShield=itemsGroup.getChildren().some(o=>o.getData("itemIdx")===-1);
    if(!hasExtraShield) spawnShields(sceneRef, LEVELS[currentLevel]);
    saveGame();
  }

  let invulnBlinkEvent=null, invulnEndEvent=null;

  function setInvuln(scene,ms){
    // Cancelar timers anteriores para evitar conflito de alpha
    if(invulnBlinkEvent){ invulnBlinkEvent.remove(false); invulnBlinkEvent=null; }
    if(invulnEndEvent){   invulnEndEvent.remove(false);   invulnEndEvent=null; }

    invuln=true;
    player.setAlpha(1);
    const blinks=Math.floor(ms/160);
    let blinkCount=0;
    invulnBlinkEvent=scene.time.addEvent({
      delay:80,
      repeat:blinks*2,
      callback:()=>{
        blinkCount++;
        // Só pisca se invuln ainda estiver ativo (evita sobrepor o reset final)
        if(!invuln) return;
        if(blinkCount%2===1) player.setAlpha(0.25);
        else player.setAlpha(1);
      }
    });
    invulnEndEvent=scene.time.delayedCall(ms,()=>{
      // Cancelar o blink event primeiro, para garantir que não dispara mais
      if(invulnBlinkEvent){ invulnBlinkEvent.remove(false); invulnBlinkEvent=null; }
      invuln=false;
      player.setAlpha(1);
      player.setScale(powered?1.18:1.0);
      // Só limpar o tint se não houver poder ativo com cor própria
      if(!starPower && !doubleJumpActive) {
        player.clearTint();
      }
      invulnEndEvent=null;
    });
  }

  let poweredCountdownVal=0;
  function givePower(scene){
    powered=true; SFX.power();
    player.clearTint();
    if(powerIndicator) powerIndicator.setText("🛡️ ESCUDO 8s");
    if(poweredTimer) poweredTimer.remove(false);
    if(powerCountdown) powerCountdown.remove(false);
    poweredCountdownVal=8;
    powerCountdown=scene.time.addEvent({delay:1000,loop:true,callback:()=>{
      poweredCountdownVal--;
      if(powerIndicator) powerIndicator.setText(`🛡️ ESCUDO ${poweredCountdownVal}s`);
      if(poweredCountdownVal<=0){clearPower(scene);}
    }});
    poweredTimer=scene.time.delayedCall(8000,()=>clearPower(scene));
  }
  function clearPower(scene){
    powered=false;
    if(poweredTimer){poweredTimer.remove(false);poweredTimer=null;}
    if(powerCountdown){powerCountdown.remove(false);powerCountdown=null;}
    if(player){
      player.clearTint();
      // Só repõe escala, alpha e mata tweens se não estiver em invuln
      // (mover killTweensOf para dentro evita matar o blink event de invulnerabilidade
      // e deixar o alpha preso em 0.25)
      if(!invuln){
        if(scene&&scene.tweens) scene.tweens.killTweensOf(player);
        player.setScale(1.0); player.setAlpha(1);
      }
    }
    if(powerIndicator) powerIndicator.setText("");
    if(tipText) tipText.setText(currentLevelTip);
  }

  let doubleJumpTimer=null, doubleJumpCountdown=null, doubleJumpCountVal=0;
  function giveDoubleJump(scene){
    doubleJumpActive=true; doubleJumpUsed=false;
    ensureAudio(); SFX.power();
    if(powerIndicator) powerIndicator.setText("🦅 DUPLO SALTO 10s");
    if(doubleJumpTimer)    doubleJumpTimer.remove(false);
    if(doubleJumpCountdown) doubleJumpCountdown.remove(false);
    doubleJumpCountVal=10;
    doubleJumpCountdown=scene.time.addEvent({delay:1000,loop:true,callback:()=>{
      doubleJumpCountVal--;
      if(powerIndicator) powerIndicator.setText(`🦅 DUPLO SALTO ${doubleJumpCountVal}s`);
      if(doubleJumpCountVal<=0) clearDoubleJump(scene);
    }});
    doubleJumpTimer=scene.time.delayedCall(10000,()=>clearDoubleJump(scene));
    tipText.setText("🦅 DUPLO SALTO ATIVO: carrega ↑ novamente no ar!");
  }
  function clearDoubleJump(scene){
    doubleJumpActive=false; doubleJumpUsed=false;
    if(doubleJumpTimer){doubleJumpTimer.remove(false);doubleJumpTimer=null;}
    if(doubleJumpCountdown){doubleJumpCountdown.remove(false);doubleJumpCountdown=null;}
    if(!powered&&powerIndicator) powerIndicator.setText("");
    if(tipText) tipText.setText(currentLevelTip);
  }

  // ===== STAR POWER — atropela vilões por 8s =====
  let _starMelodyInterval = null;
  function giveStarPower(scene){
    starPower=true;
    ensureAudio();
    if(powerIndicator) powerIndicator.setText("⭐ STAR POWER 8s");
    tipText.setText("⭐ STAR POWER: atropela os maus!");
    if(starPowerTimer)    starPowerTimer.remove(false);
    if(starPowerCountdown) starPowerCountdown.remove(false);
    // Tocar melodia imediatamente e depois em loop a cada 1520ms (16 notas × 95ms)
    SFX.starMelody();
    if(_starMelodyInterval) clearInterval(_starMelodyInterval);
    _starMelodyInterval = setInterval(()=>{ if(starPower) SFX.starMelody(); }, 1520);
    window._dc_starMelodyInterval = _starMelodyInterval; // exposto para visibilitychange
    starPowerCountVal=8;
    starPowerCountdown=scene.time.addEvent({delay:1000,loop:true,callback:()=>{
      starPowerCountVal--;
      if(powerIndicator) powerIndicator.setText(`⭐ STAR POWER ${starPowerCountVal}s`);
      if(starPowerCountVal<=0) clearStarPower(scene);
    }});
    starPowerTimer=scene.time.delayedCall(8000,()=>clearStarPower(scene));
    // Piscar apenas — sem tint de cor
    if(player) player.clearTint();
    vbSayRandom(VB_STAR_POWER,"star",2800);
  }
  function clearStarPower(scene){
    starPower=false;
    if(starPowerTimer){starPowerTimer.remove(false);starPowerTimer=null;}
    if(starPowerCountdown){starPowerCountdown.remove(false);starPowerCountdown=null;}
    if(_starMelodyInterval){ clearInterval(_starMelodyInterval); _starMelodyInterval=null; }
    window._dc_starMelodyInterval = null;
    if(player){ player.clearTint(); player.setAlpha(1); }
    // Limpar estado visual arco-íris
    if(sceneRef){ sceneRef._starBlinkTimer=0; sceneRef._starColorIdx=0; sceneRef._starTrailTimer=0; }
    if(!powered&&!doubleJumpActive&&powerIndicator) powerIndicator.setText("");
    if(tipText) tipText.setText(currentLevelTip);
  }

  // ===== Touch =====
  function createTouchInput(scene){
    let downAt=0, anyTouchBtnActive=false; const TAP_MS=190;
    const _teacherPanel = document.getElementById("teacherMenuPanel");
    const _isTeacherMenuOpen = () => _teacherPanel && _teacherPanel.classList.contains("open");
    // O toque direto no ecra (swipe) so funciona quando os botoes NAO estao visiveis
    const _canvasTouchAllowed = () => {
      const state = window._dc_touchState || "auto";
      if (state === "on") return false;  // botoes forcados — usar so botoes
      if (state === "off") return true;  // botoes ocultos — usar toque no ecra
      // "auto": verificar se os botoes estao visiveis (touch device portrait)
      const tc = document.getElementById("touchControls");
      return !(tc && getComputedStyle(tc).display !== "none");
    };
    scene.input.on("pointerdown",(p)=>{ensureAudio();if(anyTouchBtnActive||_isTeacherMenuOpen())return;if(!_canvasTouchAllowed())return;if(player&&player.getBounds&&player.getBounds().contains(p.worldX,p.worldY))return;downAt=scene.time.now;touch.left=p.x<scene.scale.width/2;touch.right=!touch.left;});
    scene.input.on("pointerup",()=>{if(anyTouchBtnActive||_isTeacherMenuOpen())return;if(!_canvasTouchAllowed()){touch.left=false;touch.right=false;return;}const held=scene.time.now-downAt;touch.left=false;touch.right=false;if(held<=TAP_MS)touch.jump=true;});
    scene.input.on("pointerout",()=>{touch.left=false;touch.right=false;touch.jump=false;});
    const btnL=document.getElementById("btnLeft"),btnR=document.getElementById("btnRight"),btnJ=document.getElementById("btnJump"),btnC=document.getElementById("btnCrouch");
    if(btnL&&btnR&&btnJ){
      const activeBtns=new Set(), updateActive=()=>{anyTouchBtnActive=activeBtns.size>0;};
      const press=(btn,action,val)=>{
        const start=(e)=>{e.preventDefault();ensureAudio();touch[action]=val;btn.classList.add("pressed");activeBtns.add(btn.id);updateActive();};
        const end=(e)=>{e.preventDefault();touch[action]=false;btn.classList.remove("pressed");activeBtns.delete(btn.id);updateActive();};
        btn.addEventListener("touchstart",start,{passive:false});btn.addEventListener("touchend",end,{passive:false});btn.addEventListener("touchcancel",end,{passive:false});
        btn.addEventListener("mousedown",start);btn.addEventListener("mouseup",end);btn.addEventListener("mouseleave",end);
      };
      press(btnL,"left",true); press(btnR,"right",true);
      if(btnC) press(btnC,"crouch",true);
      const jumpStart=(e)=>{e.preventDefault();ensureAudio();touch.jump=true;btnJ.classList.add("pressed");activeBtns.add(btnJ.id);updateActive();};
      const jumpEnd=(e)=>{e.preventDefault();touch.jump=false;btnJ.classList.remove("pressed");activeBtns.delete(btnJ.id);updateActive()};
      btnJ.addEventListener("touchstart",jumpStart,{passive:false});btnJ.addEventListener("touchend",jumpEnd,{passive:false});btnJ.addEventListener("touchcancel",jumpEnd,{passive:false});
      btnJ.addEventListener("mousedown",jumpStart);btnJ.addEventListener("mouseup",jumpEnd);btnJ.addEventListener("mouseleave",jumpEnd);
    }
  }

  // ===== Animação VanBerto =====
  function scheduleBlink(scene){
    const blinkOnce=()=>{
      if(!player) return;
      if(player.getData("usingPng")){
        // PNG mode: piscar com fade rápido de alpha (0.85) e scaleY ligeiro
        const origAlpha = player.alpha;
        scene.tweens.add({
          targets: player,
          scaleY: { from: player.scaleY, to: player.scaleY * 0.85 },
          alpha:  { from: origAlpha, to: Math.max(0.7, origAlpha - 0.15) },
          duration: 60, yoyo: true,
          onComplete: () => { if(player) player.setAlpha(origAlpha); }
        });
      } else {
        // De vez em quando (≈35%) o piscar idle é antes um pisca-olho brincalhão —
        // reaproveita exatamente o mesmo mecanismo, só troca a textura usada.
        const isWink = Math.random() < 0.35;
        const dur = isWink ? 220 : 120;
        _eyeOverrideUntil = scene.time.now + dur;
        player.setTexture(isWink ? "vanberto_wink" : "vanberto_blink");
        scene.time.delayedCall(dur,()=>{if(player)applyVanBertoTexture(scene);});
      }
      scene.time.delayedCall(2200+Math.floor(Math.random()*2600),blinkOnce);
    };
    scene.time.delayedCall(1800,blinkOnce);
  }

  // Pisca-olho ao tocar/clicar no VanBerto's — interação direta, independente do
  // ciclo idle acima. Ignorado durante overlays/quiz/pausa e em modo PNG (sem textura própria).
  let _vbWinkBusy = false;
  function triggerVanBertoWink(scene){
    if(!player || player.getData("usingPng") || _vbWinkBusy) return;
    if(awaitingQuiz || awaitingStory || pausedByTeacher || _overlayPaused) return;
    if(!startOverlay.classList.contains("hidden") || !historyOverlay.classList.contains("hidden")) return;
    _vbWinkBusy = true;
    ensureAudio(); beep({freq:1000,dur:0.05,type:"triangle",vol:0.045,slideTo:1300});
    _eyeOverrideUntil = scene.time.now + 320;
    player.setTexture("vanberto_wink");
    showFloat(scene, player.x, player.y-46, "😉", "#ffd700");
    scene.time.delayedCall(320, () => {
      _vbWinkBusy = false;
      if(player) applyVanBertoTexture(scene);
    });
  }

  // Sorriso grande ao acontecer algo bom (ex: apanhar um coração) — reação breve,
  // não interativa, só reforça positivamente o momento.
  function triggerVanBertoHappy(scene, duration=650){
    if(!player || player.getData("usingPng")) return;
    if(!startOverlay.classList.contains("hidden") || !historyOverlay.classList.contains("hidden")) return;
    _eyeOverrideUntil = scene.time.now + duration;
    player.setTexture("vanberto_happy");
    scene.time.delayedCall(duration, () => { if(player) applyVanBertoTexture(scene); });
  }

  // Cara triste ao perder uma vida — dura o suficiente para se ver durante o
  // knockback e o teletransporte de volta ao spawn, sem se prolongar depois disso.
  function triggerVanBertoSad(scene, duration=900){
    if(!player || player.getData("usingPng")) return;
    _eyeOverrideUntil = scene.time.now + duration;
    player.setTexture("vanberto_sad");
    // Ligeiro tom avermelhado enquanto a cara triste dura — reforça visualmente
    // a dor do "ai!" além da expressão. Restaura a cor certa a seguir (sem
    // atropelar star power/duplo salto, que têm as suas próprias cores).
    player.setTint(0xffaaaa);
    scene.time.delayedCall(duration, () => {
      if(!player) return;
      applyVanBertoTexture(scene);
      if(!starPower && !doubleJumpActive) player.clearTint();
    });
  }

  function applyVanBertoTexture(scene){
    if(!player||!player.body) return;
    if(scene.time.now < _eyeOverrideUntil) return; // não interromper um piscar/pisca-olho em curso
    if(awaitingQuiz||!startOverlay.classList.contains("hidden")||!historyOverlay.classList.contains("hidden")){
      if(player.getData("usingPng")){
        // PNG: estado parado — mostrar sem inclinação
        if(!invuln) { player.setScale(powered ? 1.18 : 1.0); }
      } else {
        if(player.texture.key!=="vanberto_open") player.setTexture("vanberto_open");
      }
      return;
    }
    const onGround=!!player.body.blocked.down, moving=Math.abs(player.body.velocity.x)>5;

    if(player.getData("usingPng")){
      // PNG mode: animar com squash/stretch e bob vertical
      const baseScale = powered ? 1.18 : 1.0;
      const displayW = 72 * baseScale;
      const displayH = 72 * baseScale;
      if(onGround && moving){
        // Bob de andar — passo alternado a cada 140ms com squash/stretch suave
        const step = Math.floor(scene.time.now / 140) % 4;
        // 4 fases: 0=neutro, 1=comprime (foot down), 2=neutro, 3=estica (push off)
        const bobY  = [0, 3, 0, -4][step];
        const scaleX = [1.0, 1.08, 1.0, 0.93][step];
        const scaleY = [1.0, 0.92, 1.0, 1.09][step];
        if(!invuln){
          player.setDisplaySize(displayW * scaleX, displayH * scaleY);
        }
        // Deslocar o sprite ligeiramente para cima/baixo no bob
        // (usamos a posição Y base + bobY — só visual, não afeta body)
        player.y += bobY * 0.15; // suave, não o frame inteiro
      } else if(onGround){
        // Parado — animar respiração leve
        const breathe = 0.5 + Math.sin(scene.time.now * 0.002) * 0.5;
        const scaleXb = 1.0 + breathe * 0.012;
        const scaleYb = 1.0 - breathe * 0.010;
        if(!invuln) player.setDisplaySize(displayW * scaleXb, displayH * scaleYb);
      } else {
        // No ar — esticar ligeiramente na vertical
        const vy = player.body.velocity.y;
        const stretch = vy < 0 ? 1.10 : (vy > 200 ? 0.88 : 1.0);
        const squeeze = vy < 0 ? 0.90 : (vy > 200 ? 1.12 : 1.0);
        if(!invuln) player.setDisplaySize(displayW * squeeze, displayH * stretch);
      }
    } else {
      // Canvas mode — comportamento original
      if(onGround&&moving){
        const step=Math.floor(scene.time.now/140)%2;
        const tex=step===0?"vanberto_walk1":"vanberto_walk2";
        if(player.texture.key!==tex) player.setTexture(tex);
      } else if(!onGround){
        // No ar (a saltar ou a cair) — braços erguidos, tipo "hurra!"
        if(player.texture.key!=="vanberto_jump") player.setTexture("vanberto_jump");
      } else { if(player.texture.key!=="vanberto_open") player.setTexture("vanberto_open"); }
    }
  }

  // ===== Dança do robô — antes de ser sugado pelo portal =====
  // Pequena coreografia (~4 passos, uma "dança do robô" clássica: saltinho +
  // rotação alternada esquerda/direita) tocada logo depois do portal acordar
  // e ANTES de começar a "sugar" o VanBerto's (fases de giro/encolher já
  // existentes). Puramente visual e não mexe no body físico — o jogo já está
  // em pausa nesta altura (scene.physics.pause() já foi chamado antes), tal
  // como o resto da animação de entrada no portal.
  //
  // IMPORTANTE: onComplete tem de disparar SEMPRE, exatamente uma vez, ou o
  // resto da animação do portal (e a transição de nível) fica presa. Por
  // isso os passos da dança em si (tweens, beeps, troca de textura) estão
  // isolados em try/catch e onComplete só é chamado a partir de UM único
  // temporizador de segurança com a duração total já prevista — nunca a
  // partir do fim de cada passo individual.
  function playVanBertoDance(scene, onComplete, beats = 4) {
    if (!player || !scene) { onComplete?.(); return; }
    const baseX = player.x, baseY = player.y;
    let usingPng = false;
    try { usingPng = !!(player.getData && player.getData("usingPng")); } catch (e) {}
    try { ensureAudio(); } catch (e) {}

    const beatMs = 190;
    const totalMs = beatMs * (beats + 1);

    function doBeat(i) {
      if (i >= beats || !player) return;
      try {
        const dir = i % 2 === 0 ? 1 : -1;
        scene.tweens.add({
          targets: player,
          y: baseY - 14,
          angle: dir * 16,
          duration: beatMs * 0.5,
          ease: "Sine.easeOut",
          yoyo: true
        });
        beep({ freq: 500 + i * 60, dur: 0.06, type: "square", vol: 0.05, slideTo: 700 + i * 60 });
        if (!usingPng && player.setTexture) player.setTexture(i % 2 === 0 ? "vanberto_happy" : "vanberto_wink");
        if (i % 2 === 0) showFloat(scene, baseX, baseY - 46, "🎵", "#ffd700");
      } catch (e) { /* nunca deixar um erro visual travar a dança */ }
      scene.time.delayedCall(beatMs, () => doBeat(i + 1));
    }
    doBeat(0);

    // Único ponto de saída — garante sempre a continuação do portal.
    scene.time.delayedCall(totalMs + 60, () => {
      try {
        if (player) {
          player.setAngle(0);
          player.y = baseY;
          if (!usingPng && player.setTexture) player.setTexture("vanberto_open");
        }
      } catch (e) {}
      onComplete?.();
    });
  }

  // ===== Texturas — ver textures.js =====

  // ===== Fundo, parallax e decorações — ver background.js =====

  // ===== Botões UI =====
  btnMute.onclick=()=>{const m=toggleMuted();btnMute.textContent=m?"🔇 Som: OFF":"🔊 Som: ON";if(!m){ensureAudio();SFX.coin();}saveGame();};

  // Botão 📱 Botões — disponível antes e durante o jogo
  // touchState exposto em window para createTouchInput poder consultar
  window._dc_touchState = "auto";
  (()=>{
    const applyTouchState = (state) => {
      window._dc_touchState = state;
      document.body.classList.toggle("force-touch", state === "on");
      document.body.classList.toggle("hide-touch",  state === "off");
      const lbl =
        state === "on"  ? "📱 Botões: ON"  :
        state === "off" ? "📱 Botões: OFF" : "📱 Botões: AUTO";
      ["btnTouchToggle","mBtnTouch","btnTouchToggleStart"].forEach(id => {
        const el = document.getElementById(id); if (el) el.textContent = lbl;
      });
    };
    const handleClick = () => {
      const tc = document.getElementById("touchControls");
      const autoVisible = tc && getComputedStyle(tc).display !== "none";
      const cur = window._dc_touchState;
      let next;
      if (cur === "auto") { next = autoVisible ? "off" : "on"; }
      else if (cur === "on") { next = "off"; }
      else { next = "auto"; }
      applyTouchState(next);
    };
    ["btnTouchToggle","mBtnTouch","btnTouchToggleStart"].forEach(id => {
      const el = document.getElementById(id); if (el) el.onclick = handleClick;
    });
  })();
  btnHow.onclick = () => { openOverlay("howOverlay"); };
  btnCloseHow.onclick = () => { closeOverlay("howOverlay"); };
  window.__vb_openHow = () => { openOverlay("howOverlay"); };

  // ===== Ecrã todo =====
  const isIOS=/iP(hone|ad|od)/.test(navigator.userAgent);

  function toggleFullscreen(){
    if(isIOS){ alert("No iPhone/iPad usa 'Partilhar' → 'Adicionar ao ecrã de início'."); return; }
    if(!document.fullscreenElement&&!document.webkitFullscreenElement){
      const el=document.documentElement;
      if(el.requestFullscreen) el.requestFullscreen();
      else if(el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    } else {
      if(document.exitFullscreen) document.exitFullscreen();
      else if(document.webkitExitFullscreen) document.webkitExitFullscreen();
    }
  }
  function updateFsButtons(full){
    const lbl=full?"✕ Ecrã normal":"⛶ Ecrã todo";
    const b1=document.getElementById("btnFullscreen");
    const b2=document.getElementById("btnFullscreenGame");
    if(b1) b1.textContent=lbl;
    if(b2) b2.textContent=lbl;
  }
  document.addEventListener("fullscreenchange",()=>updateFsButtons(!!document.fullscreenElement));
  document.addEventListener("webkitfullscreenchange",()=>updateFsButtons(!!document.webkitFullscreenElement));
  const btnFs=document.getElementById("btnFullscreen");
  const btnFsGame=document.getElementById("btnFullscreenGame");
  if(btnFs) btnFs.onclick=toggleFullscreen;
  if(btnFsGame) btnFsGame.onclick=toggleFullscreen;
  window.addEventListener("keydown",e=>{ if(e.key?.toLowerCase()==="f"&&!e.target.matches("input")) toggleFullscreen(); });

  // ===== Pausa — tecla P =====
  // Reaproveita o mesmo botão/lógica de sempre (btnPause.onclick já trata de
  // tudo: física, texto do botão, ecrã de pausa) — a tecla só simula o clique.
  window.addEventListener("keydown", e => {
    if (e.key?.toLowerCase() === "p" && !e.target.matches("input") && btnPause) btnPause.click();
  });

  // ===== Alto Contraste — tecla H =====
  (()=>{
    let hcOn = false;
    function applyHC(on) {
      hcOn = on;
      document.body.classList.toggle("hc-mode", on);
      const s = loadNamespace("settings", {});
      s.hc = on;
      saveNamespace("settings", s);
    }
    // Restaurar preferência guardada
    if (loadNamespace("settings", {}).hc === true) applyHC(true);
    // Tecla H
    window.addEventListener("keydown", e => {
      if (e.key?.toLowerCase() === "h" && !e.target.matches("input")) {
        applyHC(!hcOn);
      }
    });
  })();

  btnStart.onclick=()=>{
    ensureAudio();SFX.coin();
    playerName=(playerNameInput?.value||"").trim();
    currentLevel=0;score=0;lives=3;livesLostThisLevel=0;
    // "Começar" é sempre um recomeço total — ver resetAllProgress()
    resetAllProgress();
    startOverlay.classList.add("hidden");

    const beginAdventure = () => {
      document.body.classList.add("game-started");
      if (!window.__dc_game) {
        initPhaser();
        const waitScene = setInterval(() => {
          if (sceneRef) {
            clearInterval(waitScene);
            if(playerNameHUD){
              playerNameHUD.textContent = playerName ? `⭐ ${playerName}` : "";
              playerNameHUD.style.display = playerName ? "block" : "none";
            }
            playLevelTransition(sceneRef, 0,
              () => { loadLevel(sceneRef, 0); saveGame(); },
              () => { showHistory(0, () => {
                if(!pausedByTeacher) sceneRef.physics.resume();
                setTimeout(()=>vbSay(VB_LEVEL_INTRO[0],"intro",4000),800);
              }); }
            );
          }
        }, 50);
      } else if (sceneRef) {
        playLevelTransition(sceneRef, 0,
          () => { loadLevel(sceneRef, 0); saveGame(); },
          () => { showHistory(0, () => {
            if(!pausedByTeacher) sceneRef.physics.resume();
            setTimeout(()=>vbSay(VB_LEVEL_INTRO[0],"intro",4000),800);
          }); }
        );
      }
    };

    // Mostrar a história principal (narrativa de introdução) antes do nível 1
    const mainStoryOverlay = document.getElementById("mainStoryOverlay");
    const btnMainStoryContinue = document.getElementById("btnMainStoryContinue");
    if (mainStoryOverlay && btnMainStoryContinue) {
      mainStoryOverlay.classList.remove("hidden");
      btnMainStoryContinue.onclick = () => {
        ensureAudio(); SFX.door();
        mainStoryOverlay.classList.add("hidden");
        beginAdventure();
      };
    } else {
      beginAdventure();
    }
  };

  // ===== Menu Principal / In-game — botão Mapa =====
  document.getElementById("btnOpenMap")?.addEventListener("click", () => {
    ensureAudio(); SFX.coin();
    openOverlay("mapOverlay", renderMap);
  });
  document.getElementById("btnCloseMap")?.addEventListener("click", () => {
    closeOverlay("mapOverlay");
  });

  // =====================================================
  // ===== ESTATÍSTICAS GLOBAIS — rastreio persistente =====
  // =====================================================
  let globalStats = {
    totalPlayTime: 0,        // segundos
    enemiesDefeated: 0,
    quizTotal: 0,
    quizCorrect: 0,
    quizWrong: 0,
    curiositiesRead: 0,
    starsCollectedTotal: 0,
    levelsCompleted: 0,
    gamesPlayed: 0
  };
  let _statsSessionStart = Date.now();

  function loadGlobalStats() {
    const d = loadNamespace("globalStats", {});
    Object.keys(globalStats).forEach(k => {
      if (typeof d[k] === "number") globalStats[k] = d[k];
    });
  }
  function saveGlobalStats() {
    saveNamespace("globalStats", globalStats);
  }
  function updatePlayTime() {
    const elapsed = Math.floor((Date.now() - _statsSessionStart) / 1000);
    globalStats.totalPlayTime += elapsed;
    _statsSessionStart = Date.now();
    saveGlobalStats();
  }
  loadGlobalStats();

  // =====================================================
  // ===== MENSAGENS DINÂMICAS (feedback contextual) =====
  // =====================================================

  function showDynamicMsg(msgs, duration = 2400) {
    // Não mostrar no alto contraste (distração)
    if (document.body.classList.contains("hc-mode")) return;
    const overlay = document.getElementById("dynamicMsgOverlay");
    const textEl  = document.getElementById("dynamicMsgText");
    if (!overlay || !textEl) return;
    textEl.textContent = msgs[Math.floor(Math.random() * msgs.length)];
    overlay.classList.add("show");
    setTimeout(() => overlay.classList.remove("show"), duration);
  }

  // =====================================================
  // ===== UTILITÁRIO: pausar/retomar física ao abrir overlays =====
  // Qualquer ecrã que abre por cima do jogo deve pausar a física.
  // =====================================================

  // IDs dos overlays secundários (não o jogo nem o quiz/história que têm fluxo próprio)
  const SECONDARY_OVERLAYS = [
    "mapOverlay", "achievementsOverlay", "albumOverlay",
    "statsOverlay", "optionsOverlay", "howOverlay",
    "reviewOverlay", "artefactGalleryOverlay",
  ];

  // Fecha todos os overlays secundários antes de abrir um novo — evita sobreposições
  function closeAllSecondaryOverlays() {
    SECONDARY_OVERLAYS.forEach(id => {
      document.getElementById(id)?.classList.add("hidden");
    });
  }

  // Abre um overlay secundário garantindo que os outros estão fechados
  function openOverlay(id, beforeOpen) {
    closeAllSecondaryOverlays();
    pauseForOverlay();
    beforeOpen?.();
    document.getElementById(id)?.classList.remove("hidden");
  }

  // Fecha um overlay secundário e retoma a física
  function closeOverlay(id) {
    document.getElementById(id)?.classList.add("hidden");
    resumeAfterOverlay();
    // Se este overlay foi aberto a partir do ecrã de vitória (botões "Mapa"/"Conquistas"
    // do fim de jogo), o winOverlay tinha sido escondido para o novo overlay ficar visível
    // por cima — ver _winOverlaySubOpen mais abaixo. Repõe-lo agora que o utilizador fechou.
    if (_winOverlaySubOpen) {
      _winOverlaySubOpen = false;
      document.getElementById("winOverlay")?.classList.remove("hidden");
    }
  }

  function pauseForOverlay() {
    if (sceneRef && startOverlay.classList.contains("hidden")) {
      _overlayPaused = true;
      sceneRef.physics.pause();
    }
  }
  function resumeAfterOverlay() {
    if (!sceneRef) return;
    _overlayPaused = false;
    if (startOverlay.classList.contains("hidden")
        && !pausedByTeacher && !awaitingQuiz && !awaitingStory
        && quizOverlay.classList.contains("hidden")
        && historyOverlay.classList.contains("hidden")) {
      sceneRef.physics.resume();
    }
  }

  // =====================================================
  // ===== CONQUISTAS =====
  // =====================================================
  function openAchievementsScreen() {
    ensureAudio(); SFX.coin();
    openOverlay("achievementsOverlay", renderAchievements);
  }
  window.__vb_openAchievements = openAchievementsScreen;
  document.getElementById("btnAchievements")?.addEventListener("click", openAchievementsScreen);
  document.getElementById("btnCloseAchievements")?.addEventListener("click", () => {
    closeOverlay("achievementsOverlay");
  });

  // =====================================================
  // ===== ÁLBUM =====
  // =====================================================
  function openAlbumScreen() {
    ensureAudio(); SFX.coin();
    openOverlay("albumOverlay", renderAlbum);
  }
  window.__vb_openAlbum = openAlbumScreen;
  document.getElementById("btnAlbum")?.addEventListener("click", openAlbumScreen);
  document.getElementById("btnCloseAlbum")?.addEventListener("click", () => {
    closeOverlay("albumOverlay");
  });

  // =====================================================
  // ===== ESTATÍSTICAS — ecrã completo =====
  // =====================================================
  function renderStats() {
    const el = document.getElementById("statsContent");
    if (!el) return;
    updatePlayTime();

    const totalMinutes = Math.floor(globalStats.totalPlayTime / 60);
    const totalSeconds = globalStats.totalPlayTime % 60;
    const timeStr = totalMinutes > 0 ? `${totalMinutes}m ${totalSeconds}s` : `${totalSeconds}s`;
    const accuracy     = globalStats.quizTotal > 0 ? Math.round((globalStats.quizCorrect / globalStats.quizTotal) * 100) : 0;
    const levelsTotal  = LEVELS.length;
    const levelsComp   = mapProgress.levelsCompleted.length;
    const totalStars   = levelsTotal * 3;
    const earnedStars  = totalStarsEarned();
    const achvUnlocked = ACHIEVEMENTS_DEFS.filter(a => unlockedAchievements[a.id]).length;
    const pctLevels    = Math.round(levelsComp / levelsTotal * 100);
    const pctStars     = Math.round(earnedStars / totalStars * 100);
    const pctAchv      = Math.round(achvUnlocked / ACHIEVEMENTS_DEFS.length * 100);

    // ── Donut SVG de precisão ──────────────────────────────────────────
    function donutSVG(pct, color, bg) {
      const r = 36, cx = 44, cy = 44, stroke = 10;
      const circ = 2 * Math.PI * r;
      const dash = (pct / 100) * circ;
      return `<svg class="stats-donut-svg" width="88" height="88" viewBox="0 0 88 88">
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${bg}" stroke-width="${stroke}"/>
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="${stroke}"
          stroke-dasharray="${dash} ${circ}" stroke-dashoffset="${circ/4}"
          stroke-linecap="round" style="transition:stroke-dasharray .6s ease"/>
        <text x="${cx}" y="${cy+5}" text-anchor="middle" font-family="Baloo 2,sans-serif"
          font-size="16" font-weight="900" fill="${color}">${pct}%</text>
      </svg>`;
    }

    // ── Barras horizontais ─────────────────────────────────────────────
    function barChart(items) {
      const max = Math.max(...items.map(i => i.val), 1);
      return `<div class="stats-bar-chart">${items.map(({label, val, color}) => `
        <div class="stats-bar-row">
          <span class="stats-bar-row-label">${label}</span>
          <div class="stats-bar-row-track">
            <div class="stats-bar-row-fill" style="width:${Math.round(val/max*100)}%;background:${color}"></div>
          </div>
          <span class="stats-bar-row-val">${val}</span>
        </div>`).join("")}</div>`;
    }

    el.innerHTML = `
      <!-- ── Gráficos resumo ── -->
      <p class="stats-section-title">📊 Resumo Visual</p>
      <div class="stats-charts-row">
        <div class="stats-chart-block">
          ${donutSVG(accuracy, "#4dff91", "rgba(77,255,145,0.15)")}
          <p class="stats-chart-label">Precisão no Quiz</p>
          <p class="stats-chart-value">${globalStats.quizCorrect}✅ ${globalStats.quizWrong}❌</p>
        </div>
        <div class="stats-chart-block">
          ${donutSVG(pctStars, "#ffd700", "rgba(255,215,0,0.15)")}
          <p class="stats-chart-label">Estrelas Obtidas</p>
          <p class="stats-chart-value">${earnedStars} / ${totalStars} ⭐</p>
        </div>
        <div class="stats-chart-block">
          ${donutSVG(pctLevels, "#60c8ff", "rgba(96,200,255,0.15)")}
          <p class="stats-chart-label">Níveis Concluídos</p>
          <p class="stats-chart-value">${levelsComp} / ${levelsTotal} 🏁</p>
        </div>
        <div class="stats-chart-block">
          ${donutSVG(pctAchv, "#ff80c0", "rgba(255,128,192,0.15)")}
          <p class="stats-chart-label">Conquistas</p>
          <p class="stats-chart-value">${achvUnlocked} / ${ACHIEVEMENTS_DEFS.length} 🏆</p>
        </div>
      </div>

      <!-- ── Barras — Jogo ── -->
      <p class="stats-section-title">🎮 Jogo</p>
      ${barChart([
        { label:"👾 Inimigos",    val: globalStats.enemiesDefeated, color:"#ff6b35" },
        { label:"📖 Curiosidades",val: globalStats.curiositiesRead,  color:"#60c8ff" },
        { label:"🎮 Partidas",    val: globalStats.gamesPlayed,      color:"#ff80c0" },
        { label:"🌟 Pontos",      val: score || 0,                   color:"#ffd700" },
      ])}
      <div class="stats-grid">
        <div class="stats-item">
          <span class="stats-item-icon">⏱️</span>
          <div class="stats-item-body">
            <p class="stats-item-label">Tempo de Jogo</p>
            <p class="stats-item-value">${timeStr}</p>
          </div>
        </div>
      </div>

      <!-- ── Barras — Quiz ── -->
      <p class="stats-section-title">❓ Quiz</p>
      ${barChart([
        { label:"📋 Respondidas", val: globalStats.quizTotal,   color:"#a0a0ff" },
        { label:"✅ Certas",      val: globalStats.quizCorrect, color:"#4dff91" },
        { label:"❌ Erradas",     val: globalStats.quizWrong,   color:"#ff5555" },
      ])}
    `;
  }

  function openStatsScreen() {
    ensureAudio(); SFX.coin();
    openOverlay("statsOverlay", renderStats);
  }
  window.__vb_openStats = openStatsScreen;
  document.getElementById("btnStats")?.addEventListener("click", openStatsScreen);
  document.getElementById("btnCloseStats")?.addEventListener("click", () => {
    closeOverlay("statsOverlay");
  });
  document.getElementById("btnResetStats")?.addEventListener("click", () => {
    if (!confirm("⚠️ Apagar todas as estatísticas, conquistas, estrelas e progresso?\nEsta ação não pode ser desfeita.")) return;
    resetAllProgress();
    renderStats();
  });

  // =====================================================
  // ===== OPÇÕES — ecrã completo =====
  // =====================================================
  function syncOptionsUI() {
    const btnSound = document.getElementById("optBtnSound");
    const btnHC    = document.getElementById("optBtnHC");
    const btnTouch = document.getElementById("optBtnTouch");
    const btnFS    = document.getElementById("optBtnFS");
    if (btnSound) {
      btnSound.textContent = isMuted() ? "🔇 OFF" : "🔊 ON";
      btnSound.classList.toggle("active", !isMuted());
    }
    const hcOn = document.body.classList.contains("hc-mode");
    if (btnHC) {
      btnHC.textContent = hcOn ? "⬛ ON" : "⬛ OFF";
      btnHC.classList.toggle("active", hcOn);
    }
    const forceTouch = document.body.classList.contains("force-touch");
    const hideTouch  = document.body.classList.contains("hide-touch");
    if (btnTouch) {
      if (forceTouch) btnTouch.textContent = "📱 ON (forçado)";
      else if (hideTouch) btnTouch.textContent = "📱 OFF";
      else btnTouch.textContent = "📱 AUTO";
    }
    if (btnFS) {
      const isFS = !!(document.fullscreenElement || document.webkitFullscreenElement);
      btnFS.textContent = isFS ? "⛶ Sair" : "⛶ Entrar";
      btnFS.classList.toggle("active", isFS);
    }
  }

  function openOptionsScreen() {
    ensureAudio(); SFX.coin();
    openOverlay("optionsOverlay", syncOptionsUI);
  }
  window.__vb_openOptions = openOptionsScreen;
  document.getElementById("btnOptions")?.addEventListener("click", openOptionsScreen);
  document.getElementById("btnCloseOptions")?.addEventListener("click", () => {
    closeOverlay("optionsOverlay");
  });

  // Botões dentro de Opções
  document.getElementById("optBtnSound")?.addEventListener("click", () => {
    ensureAudio();
    const m = toggleMuted();
    btnMute.textContent = m ? "🔇 Som: OFF" : "🔊 Som: ON";
    saveGame();
    syncOptionsUI();
  });
  document.getElementById("optBtnHC")?.addEventListener("click", () => {
    const hcOn = document.body.classList.contains("hc-mode");
    document.body.classList.toggle("hc-mode", !hcOn);
    const s = loadNamespace("settings", {});
    s.hc = !hcOn;
    saveNamespace("settings", s);
    syncOptionsUI();
  });
  document.getElementById("optBtnTouch")?.addEventListener("click", () => {
    // Ciclar: AUTO → ON → OFF → AUTO
    const forceTouch = document.body.classList.contains("force-touch");
    const hideTouch  = document.body.classList.contains("hide-touch");
    if (!forceTouch && !hideTouch) {
      document.body.classList.add("force-touch");
    } else if (forceTouch) {
      document.body.classList.remove("force-touch");
      document.body.classList.add("hide-touch");
    } else {
      document.body.classList.remove("hide-touch");
    }
    syncOptionsUI();
  });
  document.getElementById("optBtnFS")?.addEventListener("click", () => {
    toggleFullscreen();
    setTimeout(syncOptionsUI, 300);
  });

  // =====================================================
  // ===== CERTIFICADO FINAL =====
  // =====================================================
  function showCertificate() {
    const overlay = document.getElementById("certificateOverlay");
    if (!overlay) return;

    // Nome
    const certName = document.getElementById("certPlayerName");
    if (certName) certName.textContent = playerName || "Herói das Crianças";

    // Pontuação
    const certScore = document.getElementById("certScore");
    if (certScore) certScore.textContent = score;

    // Percentagem
    const pct = quizStats.total > 0 ? Math.round((quizStats.correct / quizStats.total) * 100) : 0;
    const certCorrect = document.getElementById("certCorrect");
    if (certCorrect) certCorrect.textContent = `${pct}%`;

    // Medalha
    const certMedal = document.getElementById("certMedal");
    if (certMedal) {
      certMedal.textContent = pct === 100 ? "🥇 Perfeito" : pct >= 80 ? "🥈 Excelente" : pct >= 60 ? "🥉 Bom" : "📚 A Melhorar";
    }

    // Estrelas — novo
    const certStars = document.getElementById("certStars");
    if (certStars) {
      const earned = totalStarsEarned();
      const total  = LEVELS.length * 3;
      certStars.textContent = `${earned}/${total}`;
    }

    // Data
    const certDate = document.getElementById("certDate");
    if (certDate) {
      const now = new Date();
      certDate.textContent = now.toLocaleDateString("pt-PT", { day:"numeric", month:"long", year:"numeric" });
    }

    overlay.classList.remove("hidden");
    ensureAudio(); SFX.finalWin();
  }

  document.getElementById("btnWinCertificate")?.addEventListener("click", () => {
    document.getElementById("winOverlay")?.classList.add("hidden");
    showCertificate();
  });

  // "Voltar" — fecha certificado e volta ao ecrã de vitória
  document.getElementById("btnCertBack")?.addEventListener("click", () => {
    document.getElementById("certificateOverlay")?.classList.add("hidden");
    document.getElementById("winOverlay")?.classList.remove("hidden");
  });

  // "Jogar de novo" — fecha tudo e recomeça
  document.getElementById("btnCertRestart")?.addEventListener("click", () => {
    document.getElementById("certificateOverlay")?.classList.add("hidden");
    document.getElementById("confetti")?.classList.add("hidden");
    const _gameDiv = document.getElementById("game");
    if (_gameDiv) _gameDiv.style.visibility = "";
    try{sceneRef.scene.resume();}catch{}
    if (powerHaloGfx) { powerHaloGfx.clear(); powerHaloGfx.setVisible(true); }
    if (shadowGfx) shadowGfx.setVisible(true);
    lives=3; score=0; currentLevel=0; livesLostThisLevel=0;
    // "Jogar de novo" é sempre um recomeço total — ver resetAllProgress()
    resetAllProgress();
    awaitingQuiz=true;
    scoreText?.setText("🌟 Pontos: 0"); updateHearts?.();
    document.body.classList.add("game-started");
    playLevelTransition(sceneRef, 0,
      () => { loadLevel(sceneRef, 0); saveGame(); },
      () => { showHistory(0, () => { awaitingQuiz=false; if(!pausedByTeacher) sceneRef?.physics.resume(); }); }
    );
  });

  document.getElementById("btnCertPrint")?.addEventListener("click", () => {
    window.print();
  });

  // =====================================================
  // ===== RASTREIO DE EVENTOS PARA ESTATÍSTICAS =====
  // Integra com eventos já existentes no jogo
  // =====================================================

  // Expor globalmente para ser chamado no lugar certo
  window.__vb_trackEnemyDefeat = function() {
    if(typeof globalStats !== "undefined") {
      globalStats.enemiesDefeated += 1;
      saveGlobalStats();
    }
  };

  // Salvar tempo de jogo ao fechar/esconder
  window.addEventListener("beforeunload", () => { updatePlayTime(); });

  // =====================================================
  // Compatibilidade: openComingSoon ainda existe mas nunca
  // deve ser chamado (substituímos todos os botões acima)
  // =====================================================
  function openComingSoon(title, text) {
    // fallback: não deve ser chamado
    console.warn("openComingSoon chamado para:", title);
  }

  const btnRetry=document.getElementById("btnRetry"), btnExit=document.getElementById("btnExit");
  if(btnRetry) btnRetry.onclick=()=>{
    gameOverOverlay.classList.add("hidden");
    lives=3; livesLostThisLevel=0; updateHearts();
    // Perder durante um combate de boss só reinicia a arena do boss (com a
    // pontuação já ganha até ali preservada), em vez do nível inteiro — não
    // faz sentido obrigar a repetir toda a plataforma só para tentar de novo
    // um combate que acontece no fim.
    if (inBossFight && bossState && bossState.def) {
      const bossOnComplete = bossState.onComplete;
      const levelForBoss = currentLevel;
      startBossFight(sceneRef, levelForBoss, bossOnComplete);
      saveGame();
      return;
    }
    score=0;resetQuizStats();
    Object.keys(usedQuizByLevel).forEach(k=>usedQuizByLevel[k].clear());
    Object.keys(usedQuizByTheme).forEach(k=>usedQuizByTheme[k].clear());
    scoreText.setText(`🌟 Pontos: ${score}`);
    const retryLevel = currentLevel ?? 0;
    loadLevel(sceneRef, retryLevel);
    showHistory(retryLevel, () => { awaitingQuiz=false; if(!pausedByTeacher) sceneRef.physics.resume(); });
    saveGame();
  };
  if(btnExit) btnExit.onclick=()=>{
    gameOverOverlay.classList.add("hidden");try{sceneRef.physics.pause();}catch{}
    lives=3;score=0;resetQuizStats();livesLostThisLevel=0;
    startOverlay.classList.remove("hidden");
  };

  const btnWinRestart=document.getElementById("btnWinRestart");
  if(btnWinRestart) btnWinRestart.onclick=()=>{
    winOverlay.classList.add("hidden");
    document.getElementById("confetti")?.classList.add("hidden");
    // Restaurar canvas e retomar loop Phaser
    const _gameDiv2=document.getElementById("game");
    if(_gameDiv2) _gameDiv2.style.visibility="";
    try{sceneRef.scene.resume();}catch{}
    if(powerHaloGfx){powerHaloGfx.clear();powerHaloGfx.setVisible(true);}
    if(shadowGfx) shadowGfx.setVisible(true);
    lives=3;score=0;currentLevel=0;livesLostThisLevel=0;
    // "Jogar de novo" é sempre um recomeço total — ver resetAllProgress()
    resetAllProgress();
    awaitingQuiz=true;
    scoreText?.setText(`🌟 Pontos: 0`); updateHearts?.();
    document.body.classList.add("game-started");
    playLevelTransition(sceneRef, 0,
      () => { loadLevel(sceneRef, 0); saveGame(); },
      () => { showHistory(0, () => { awaitingQuiz=false; if(!pausedByTeacher) sceneRef?.physics.resume(); }); }
    );
  };

  // =====================================================
  // ===== CONTAR PARTIDAS em Nova Aventura =====
  // =====================================================
  const _origBtnStart_onclick = btnStart.onclick;
  btnStart.addEventListener("click", () => {
    if(typeof globalStats !== "undefined") {
      globalStats.gamesPlayed += 1;
      _statsSessionStart = Date.now();
      saveGlobalStats();
    }
  });

  // =====================================================
  // ===== VANBERTO'S PERSONALITY — piscar olhos HTML =====
  // =====================================================
  (function initVanbertoPersonality() {
    function blinkRobots() {
      document.querySelectorAll(
        ".win-robot-img, .pause-robot-img, .gameover-robot-img, .main-story-robot-img, .certificate-robot-img"
      ).forEach(img => {
        const origFilter = img.style.filter || "";
        img.style.transition = "filter 0.04s";
        img.style.filter = origFilter + " brightness(0.1)";
        setTimeout(() => { img.style.filter = origFilter; }, 80);
      });
    }
    function schedBlink() {
      const delay = 2000 + Math.random() * 3000;
      setTimeout(() => { blinkRobots(); schedBlink(); }, delay);
    }
    schedBlink();

    // Partículas brilhantes na história principal
    const particlesEl = document.querySelector(".main-story-particles");
    if (particlesEl) {
      const styleTag = document.createElement("style");
      styleTag.textContent = `
        @keyframes msParticle0 { 0%{transform:translate(0,0)scale(0);opacity:0}30%{opacity:1}100%{transform:translate(-28px,-34px)scale(0.3);opacity:0} }
        @keyframes msParticle1 { 0%{transform:translate(0,0)scale(0);opacity:0}30%{opacity:1}100%{transform:translate(22px,-28px)scale(0.3);opacity:0} }
        @keyframes msParticle2 { 0%{transform:translate(0,0)scale(0);opacity:0}30%{opacity:1}100%{transform:translate(-14px,-42px)scale(0.3);opacity:0} }
        @keyframes msParticle3 { 0%{transform:translate(0,0)scale(0);opacity:0}30%{opacity:1}100%{transform:translate(30px,-18px)scale(0.3);opacity:0} }
      `;
      document.head.appendChild(styleTag);
      let pIdx = 0;
      setInterval(() => {
        const p = document.createElement("div");
        const colors = ["#ffd700","#ff80ff","#80d0ff","#a0ff80","#ffa0a0"];
        p.style.cssText = `
          position:absolute;width:6px;height:6px;border-radius:50%;
          background:${colors[pIdx%colors.length]};
          left:${25+Math.random()*50}%;top:${35+Math.random()*40}%;
          opacity:0;pointer-events:none;
          animation:msParticle${pIdx%4} ${0.9+Math.random()*0.5}s ease-out forwards;
        `;
        particlesEl.appendChild(p);
        setTimeout(() => p.remove(), 1500);
        pIdx++;
      }, 350);
    }
  })();

  // =====================================================
  // ===== ATUALIZAÇÃO DOS OVERLAYS NO MutationObserver =====
  // =====================================================
  [
    document.getElementById("achievementsOverlay"),
    document.getElementById("albumOverlay"),
    document.getElementById("statsOverlay"),
    document.getElementById("optionsOverlay"),
    document.getElementById("certificateOverlay"),
  ].forEach(el => {
    if (el) _overlayObserver.observe(el, { attributes: true, attributeFilter: ["class"] });
  });

  // =====================================================
  // ===== Pausa automática ao mudar de separador =====
  // =====================================================
  // Nota: isto tem de viver AQUI DENTRO do fecho (closure) do
  // DOMContentLoaded, não a seguir a ele — antes estava fora, e por isso
  // `awaitingQuiz`/`pausedByTeacher`/`_doorAnimRunning` não existiam nesse
  // âmbito (o `typeof awaitingQuiz !== "undefined"` era sempre falso, nunca
  // detetava nada). Na prática isso significava que, ao voltar ao separador
  // com o VanBerto's a meio de uma transição (ex.: mesmo a tocar o portal),
  // a física ficava para sempre em pausa — nem o portal reagia, nem sequer
  // era possível perder uma vida, porque nenhuma colisão física corre com o
  // mundo em pausa. Corrigido: agora lê o estado real do jogo e, se não
  // houver nenhum overlay/animação genuinamente a decorrer, desbloqueia logo.
  document.addEventListener("visibilitychange", () => {
    try {
      if (!sceneRef) return;
      if (document.hidden) {
        sceneRef.physics.pause();
        if (_starMelodyInterval) { clearInterval(_starMelodyInterval); _starMelodyInterval = null; window._dc_starMelodyInterval = null; }
        if (typeof updatePlayTime === "function") updatePlayTime();
      } else {
        const overlays = ["startOverlay","quizOverlay","historyOverlay","gameOverOverlay","winOverlay",
          "achievementsOverlay","albumOverlay","statsOverlay","optionsOverlay","certificateOverlay",
          "artefactGalleryOverlay","reviewOverlay"];
        const anyOpen = overlays.some(id => { const el = document.getElementById(id); return el && !el.classList.contains("hidden"); });
        // Cinemáticas (cinematics.js) criam o seu próprio DOM fora dos overlays
        // acima — sem isto, voltar ao separador a meio de um diálogo de boss
        // ou de um cartão de título de região também retomava a física demasiado
        // cedo, antes de o jogador ter tocado para avançar.
        const cineShowing = !!document.getElementById("cineDialog")?.classList.contains("cine-show")
          || document.body.classList.contains("cine-active")
          || !!document.getElementById("cineTitleCard")?.classList.contains("show");
        const isPaused = !!pausedByTeacher;
        if (anyOpen || isPaused || cineShowing || _doorAnimRunning) return; // razão legítima para continuar em pausa
        // Nada visível a bloquear — se ainda assim awaitingQuiz/awaitingStory
        // tiverem ficado presos a true (por termos saído mesmo a meio de uma
        // transição breve), desbloqueia já em vez de esperar até 6s pelo
        // watchdog do update().
        if (awaitingQuiz || awaitingStory) { awaitingQuiz = false; awaitingStory = false; }
        sceneRef.physics.resume();
      }
    } catch {}
  });

});

// Resize
window.addEventListener("resize",()=>{try{if(window.__dc_game?.scale)window.__dc_game.scale.refresh();}catch{}});