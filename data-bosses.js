// ===== Definições dos Bosses temáticos — Fase 3 =====
// Ficheiro puramente de dados — zero acoplamento ao motor do jogo.
// "afterLevel" é o índice (0-based) do nível DEPOIS do qual o boss aparece,
// exactamente como currentLevel já é usado em LEVELS — NUNCA altera o array LEVELS.
//
// quizTheme tem de corresponder a uma chave existente em QUIZ_BY_THEME (data-quiz.js).
// Confirma os nomes exactos das chaves aí antes de ativar cada boss.

export const BOSSES = [
  {
    id: "monstro_ignorancia",
    afterLevel: 4,           // aparece no fim do Mundo 1 — Reino da Educação (níveis 0-4)
    name: "Monstro da Ignorância",
    emoji: "👾",
    color: 0x8a5cff,
    // ===== Redesenho "Boss clássico à Mario" (nova) =====
    // Filosofia: arena do tamanho da janela (sem scroll), poucas plataformas,
    // e uma mecânica só — saltar-lhe em cima 3 vezes. Nada de fases, nada de
    // ataque especial, nada de fase de recolha à parte. Simples, rápido,
    // divertido. stompBoss=true liga este modo dedicado no motor do jogo;
    // os outros 3 bosses (ainda sem stompBoss) continuam exactamente iguais.
    stompBoss: true,
    stompsToDefeat: 3,       // 3 saltos na cabeça = derrotado (reaproveita def.hp)
    movementType: "patrol",  // anda devagar de um lado para o outro — nunca teletransporta, nunca desaparece
    patrolSpeed: 55,
    hopEvery: 2400,          // de vez em quando dá um pequeno salto (só visual)
    qmarkEvery: 2200,        // atira uma bola ❓ que salta devagar pelo chão
    // bossY: centro do sprite, NÃO os pés — tem de descontar a metade do
    // corpo desenhado (canvas 116px, escala 1.5, pés ~49px abaixo do centro
    // → 49*1.5≈73px) até à superfície do chão da arena (plataforma principal
    // em y=500 com 30px de altura → topo em y=485). 485-73=412. O valor
    // antigo (430) deixava o Monstro ~18px enterrado na plataforma.
    bossY: 412,
    bossScale: 1.5,          // ~2x a altura do VanBerto's — dá para saltar-lhe em cima sem dificuldade
    intro: "Sem saber, não há poder! Vou apagar tudo o que aprendeste!",
    defeatLine: "Nooo! O conhecimento é mais forte! 📚✨",
    quizTheme: "educacao",
    hp: 3,
    themeIdx: 16,              // índigo cósmico noturno
    rightRecovered: { emoji: "📚", name: "Direito à Educação" },
    // Arena simples: do tamanho da janela (960x540, sem scroll), chão
    // principal + só 2 plataformas baixas para dar alguma variedade ao salto.
    arena: {
      worldW: 960,
      platforms: [
        [480,500,960,30],   // chão principal, de ponta a ponta
        [230,400,150,20],   // plataforma baixa esquerda
        [730,400,150,20]    // plataforma baixa direita
      ],
      decor: [
        { emoji:"📖", x:90,  y:150 },
        { emoji:"📕", x:870, y:170 },
        { emoji:"❓", x:480, y:120 }
      ]
    }
  },
  {
    id: "virus_gigante",
    afterLevel: 9,            // aparece no fim do Mundo 2 — Vale da Saúde (níveis 5-9)
    name: "Vírus Gigante",
    emoji: "🦠",
    color: 0xe0409a,
    movementType: "wave",    // flutua em onda, pulsa de tamanho
    intro: "Vou espalhar-me por todo o lado!",
    defeatLine: "Argh! Vacinado... derrotado! 💉",
    collectKind: "heart",
    collectCount: 5,
    quizTheme: "identidade", // era "saude" — corrigido para bater com o Nível 10 (o último antes deste boss)
    hp: 3,
    themeIdx: 13,              // teal escuro noturno — combina com o verde-água do boss
    rightRecovered: { emoji: "💊", name: "Direito à Saúde" },
    // NOTA: acabei de ligar isto (o motor — zonas tóxicas, vírus pequenos,
    // onda de cura — já existia em dia-crianca.js, só faltava esta config).
    // Nunca foi testado em jogo real ainda — vale a pena confirmar o combate
    // do início ao fim antes de dares como certo.
    contaminatedArena: true,   // zonas tóxicas + vírus pequenos a flutuar na arena
    specialAttack: {
      emoji: "❤️",
      chargeCount: 5,
      chargeTexture: "item_heart",
      chargeTint: 0xffffff,
      chargeFacts: [
        "🩺 Ir ao médico regularmente ajuda-te a crescer forte.",
        "💧 Beber água é um dos maiores segredos de saúde.",
        "😴 Dormir bem também é cuidar do corpo.",
        "🍎 Comer fruta e vegetais dá-te energia extra.",
        "🧼 Lavar as mãos afasta muitos vírus!"
      ],
      name: "Onda da Saúde",
      visual: "wave",
      visualColor: 0x30e0a0
    }
  },
  {
    id: "guardiao_sombras",
    afterLevel: 14,          // aparece no fim do Mundo 3 — Fortaleza da Proteção (níveis 10-14)
    name: "Guardião das Sombras",
    emoji: "🌑",
    color: 0x3a3a5c,
    movementType: "teleport", // arena escura, teleporta-se entre 3 pontos
    intro: "Nas sombras, ninguém te protege!",
    defeatLine: "A luz da proteção venceu! 🛡️✨",
    collectKind: "medalha",
    collectCount: 5,
    quizTheme: "expressao", // era "protecao" — corrigido para bater com o Nível 15 (o último antes deste boss)
    hp: 3,
    themeIdx: 11,              // azul oceano noturno — fortaleza escura, sem exagerar no preto
    rightRecovered: { emoji: "🛡️", name: "Direito à Proteção" }
  },
  {
    id: "poluidor_mecanico",
    afterLevel: 18,          // Mundo 4 — Cidade do Mundo Moderno (níveis 15-19); fica 1 nível
                             // epílogo (Direitos Digitais) depois deste boss, como já era antes.
    name: "Poluidor Mecânico",
    emoji: "🏭",
    color: 0x7a8a5c,
    movementType: "patrol",
    patrolSpeed: 150,        // mais rápido — sensação industrial
    movingArena: true,       // arena com plataformas móveis (reaproveita o sistema existente)
    intro: "O planeta é meu para sujar!",
    defeatLine: "O verde venceu o cinzento! 🌱",
    collectKind: "brinquedo",
    collectCount: 5,
    quizTheme: "ambiente",
    hp: 3,
    themeIdx: 9,                // âmbar dourado enevoado — céu poluído, ainda de dia
    rightRecovered: { emoji: "🌿", name: "Ambiente Saudável" }
  }
];

// Lookup rápido por índice de nível — usado em nextLevel()
export const BOSS_BY_LEVEL = Object.fromEntries(BOSSES.map(b => [b.afterLevel, b]));
