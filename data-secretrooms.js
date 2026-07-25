// ===== Salas secretas (arco-cortina de festa) =====
// SECRET_ROOMS — uma entrada por nível (chave = índice em LEVELS, 0-based).
// Cada sala é um "quarto" isolado, à parte do nível normal (mesma técnica já
// usada nas arenas de boss: troca-se mundo/câmara/plataformas, sem nunca
// destruir o que já existe no nível principal — por isso itens já apanhados
// e vilões já derrotados no nível principal NUNCA são repostos ao voltar).
//
// Campos de cada sala:
//   worldW/worldH — tamanho do "quarto" (espaço próprio, isolado do nível)
//   spawnX/spawnY — onde o VanBerto's aparece ao entrar
//   platforms     — chão/plataformas do quarto (mesmo formato de data-levels.js)
//   items         — bónus a apanhar (mesmo formato de data-levels.js; kind
//                   "estrela"/"medalha"/"balao"/"brinquedo"/"duplosalto"/"heart")
//   exitArch      — posição do 2º arco, que devolve o jogador ao nível normal
//   curiosity     — { emoji, text } mostrado como um letreiro dentro do quarto
//                   (mesmo sistema visual dos letreiros normais — aproximar
//                   para ler, sem pausar o jogo). Factos verificados em
//                   julho de 2026 (UNICEF/OIT/ONU) e escolhidos para NÃO
//                   repetir o que já está em HISTORY[] para o mesmo nível.

export const SECRET_ROOMS = {
  // Nível 3 — A Convenção de 1989
  2: {
    worldW: 720, worldH: 514,
    spawnX: 90, spawnY: 460,
    platforms: [ {x:360, y:520, w:720, h:28} ],
    items: [
      {x:240, y:430, kind:"estrela"},
      {x:480, y:430, kind:"medalha"}
    ],
    exitArch: {x:630, y:486},
    curiosity: {
      emoji: "🌍",
      text: "A Convenção sobre os Direitos da Criança foi ratificada por 196 países — só os Estados Unidos nunca a ratificaram!"
    }
  },
  // Nível 9 — O Direito à Educação
  8: {
    worldW: 720, worldH: 514,
    spawnX: 90, spawnY: 460,
    platforms: [ {x:360, y:520, w:720, h:28} ],
    items: [
      {x:240, y:430, kind:"estrela"},
      {x:480, y:430, kind:"brinquedo"}
    ],
    exitArch: {x:630, y:486},
    curiosity: {
      emoji: "📚",
      text: "Aos 17 anos, Malala Yousafzai tornou-se a pessoa mais jovem da História a receber o Prémio Nobel da Paz, por lutar pelo direito das raparigas à educação."
    }
  },
  // Nível 13 — Contra o Trabalho Infantil
  12: {
    worldW: 720, worldH: 514,
    spawnX: 90, spawnY: 460,
    platforms: [ {x:360, y:520, w:720, h:28} ],
    items: [
      {x:240, y:430, kind:"medalha"},
      {x:480, y:430, kind:"balao"}
    ],
    exitArch: {x:630, y:486},
    curiosity: {
      emoji: "📉",
      text: "Desde o ano 2000, o número de crianças em trabalho infantil no mundo caiu quase para metade: de 246 milhões para 138 milhões (dados de 2024, OIT/UNICEF)."
    }
  },
  // Nível 20 — Os Direitos Digitais
  19: {
    worldW: 720, worldH: 514,
    spawnX: 90, spawnY: 460,
    platforms: [ {x:360, y:520, w:720, h:28} ],
    items: [
      {x:240, y:430, kind:"estrela"},
      {x:480, y:430, kind:"duplosalto"}
    ],
    exitArch: {x:630, y:486},
    curiosity: {
      emoji: "🌐",
      text: "Cerca de 1 em cada 3 utilizadores de internet no mundo é uma criança (UNICEF)."
    }
  }
};
