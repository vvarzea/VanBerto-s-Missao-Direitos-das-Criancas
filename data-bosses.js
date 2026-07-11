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
    movementType: "blink",   // some e reaparece noutra plataforma
    intro: "Sem saber, não há poder! Vou apagar tudo o que aprendeste!",
    defeatLine: "Nooo! O conhecimento é mais forte! 📚✨",
    // Falas curtas mostradas por cima do boss a cada vida perdida — sem pausar o
    // jogo, só para dar personalidade ao combate (rageLines.angry na 1ª vida
    // perdida, rageLines.desperate na 2ª, já com o HP no mínimo).
    rageLines: { angry: "Achas que sabes assim tanto?!", desperate: "Não... o conhecimento está a vencer-me!" },
    // Ataque especial próprio — substitui completamente a lógica de "apanha a
    // estrela para atropelar o boss" (que continua a ser usada por omissão nos
    // outros bosses). Em vez disso: apanha `chargeCount` itens de conhecimento
    // (reaproveita o item_livro existente, só com um tom azulado) para carregar
    // e disparar automaticamente o Raio do Conhecimento — só ele parte o escudo.
    // Precisa de 3 cargas completas para esvaziar o hp:3 do boss.
    specialAttack: {
      name: "Raio do Conhecimento",
      chargeCount: 5,
      // Uma frase muito curta por item apanhado — quase invisível, não pausa
      // nada, só reforça a ideia por trás do combate (pedido explícito: o
      // combate também devia ensinar, sem interromper o ritmo do jogo).
      chargeFacts: [
        "📖 Ler ajuda-nos a pensar.",
        "🏫 A escola abre portas.",
        "✨ Aprender é um direito.",
        "🔑 Cada livro é uma chave.",
        "🕊️ Saber mais é ser mais livre."
      ]
    },
    collectKind: "livro",    // livros, não estrelas — a estrela ⭐ continua a ser só o power-up universal para o atingires
    collectCount: 5,
    quizTheme: "educacao",
    hp: 3,
    themeIdx: 16,              // índigo cósmico noturno
    throwsBooks: true,         // atira livros (bons e maus) enquanto foges dele
    rightRecovered: { emoji: "📚", name: "Direito à Educação" }
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
    rageLines: { angry: "Vou espalhar-me ainda mais depressa!", desperate: "Não... estou a ser derrotado!" },
    collectKind: "heart",
    collectCount: 5,
    quizTheme: "identidade", // era "saude" — corrigido para bater com o Nível 10 (o último antes deste boss)
    hp: 3,
    themeIdx: 13,              // teal escuro noturno — combina com o verde-água do boss
    rightRecovered: { emoji: "💊", name: "Direito à Saúde" }
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
    rageLines: { angry: "As sombras vão engolir-te!", desperate: "A luz... está demasiado forte!" },
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
    rageLines: { angry: "Mais fumo, mais poluição!", desperate: "As minhas engrenagens... estão a falhar!" },
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
