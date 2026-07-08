// ===== Estrelas por nível — Fase 2 =====
// Por nível, até 3 estrelas:
//  ⭐1 = encontrou pelo menos 1 segredo do nível (se o nível tiver segredos; senão concede-se ao concluir)
//  ⭐2 = completou sem perder nenhuma vida
//  ⭐3 = acertou a pergunta à primeira tentativa
// Rastreio paralelo guardado em localStorage — não interfere com pontuação nem lógica de jogo.

import { LEVELS } from "./data-levels.js";
import { loadNamespace, saveNamespace } from "./storage.js";

export let levelStars = {};           // { [levelIdx]: { secret:bool, noDamage:bool, firstTry:bool } }
let secretsFoundThisLevel = 0;        // reposto em cada loadLevel
let quizFirstTryThisLevel = false;

export function loadStars() {
  levelStars = loadNamespace("stars", {});
}
export function saveStars() {
  saveNamespace("stars", levelStars);
}
loadStars();

export function starsForLevel(idx) {
  const rec = levelStars[idx];
  if (!rec) return 0;
  return (rec.secret ? 1 : 0) + (rec.noDamage ? 1 : 0) + (rec.firstTry ? 1 : 0);
}
export function totalStarsEarned() {
  return Object.keys(levelStars).reduce((sum, k) => sum + starsForLevel(k), 0);
}
// Chamado ao entrar num nível novo — reinicia os contadores transitórios
export function resetLevelStarTracking() {
  secretsFoundThisLevel = 0;
  quizFirstTryThisLevel = false;
}
export function getSecretsFoundThisLevel() { return secretsFoundThisLevel; }
export function incrementSecretsFound() { secretsFoundThisLevel += 1; return secretsFoundThisLevel; }
export function markFirstTryThisLevel() { quizFirstTryThisLevel = true; }

// Chamado quando o nível é concluído (resposta certa, antes de markLevelCompleted)
export function finalizeLevelStars(idx, livesLostThisLevel) {
  const L = LEVELS[idx];
  const hasSecrets = !!(L && L.secrets && L.secrets.length);
  const rec = levelStars[idx] || { secret:false, noDamage:false, firstTry:false };
  // Se o nível não tem segredos, a 1ª estrela é concedida automaticamente ao concluir
  if (!hasSecrets) rec.secret = true;
  else if (secretsFoundThisLevel > 0) rec.secret = true;
  if (livesLostThisLevel === 0) rec.noDamage = true;
  if (quizFirstTryThisLevel) rec.firstTry = true;
  levelStars[idx] = rec;
  saveStars();
}

export function allLevelsFirstTry() {
  return LEVELS.every((L, i) => levelStars[i] && levelStars[i].firstTry);
}
export function allLevelsThreeStars() {
  return LEVELS.every((L, i) => starsForLevel(i) === 3);
}
export function resetAllStars() {
  levelStars = {};
  saveStars();
}
