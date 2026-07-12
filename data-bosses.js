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
    collectKind: "livro",    // fallback só usado se specialAttack alguma vez for desligado
    collectCount: 5,
    quizTheme: "educacao",
    hp: 3,
    themeIdx: 16,              // índigo cósmico noturno
    throwsBooks: true,         // atira livros (bons e maus) enquanto foges dele
    rightRecovered: { emoji: "📚", name: "Direito à Educação" },
    // Ataque especial — o motor genérico (specialAttack) já existe em
    // dia-crianca.js; só faltava esta configuração. Substitui o antigo
    // "knowledgeAttack" por um objeto mais completo, mas o comportamento é o
    // mesmo: apanha 5 livros para carregar e disparar o Raio do Conhecimento.
    specialAttack: {
      emoji: "📚",
      chargeCount: 5,
      chargeTexture: "item_livro",
      chargeTint: 0xffffff,       // sem tingir — mantém as cores douradas do livro
      chargeFacts: [
        "📖 Ler ajuda-nos a pensar.",
        "🎒 A escola abre portas.",
        "🌟 Aprender é um direito.",
        "🧠 Cada livro é um super-poder.",
        "✏️ Errar também é aprender."
      ],
      name: "Raio do Conhecimento",
      visual: "beam",
      visualColor: 0xfff066
    },
    // ===== 3 fases do combate — Fase "Batalhas Épicas" =====
    // Cada fase liga-se a um HP concreto do boss (def.hp continua a ser 3 —
    // 3 acertos do Raio do Conhecimento). Em vez da escalada genérica de
    // "só fica mais rápido", cada fase muda o próprio padrão de ataque:
    // chuva de livros mais intensa, um ataque novo a partir da fase 2
    // (fake news a voar na horizontal — evitar, não apanhar) e vinheta
    // escura na fase final (o Monstro "não quer ver" que está a perder).
    phases: [
      {
        id: "nevoa",
        atHp: 3,               // vida cheia — comportamento inicial
        label: "🌫️ Névoa da Ignorância",
        bookThrowDelay: 1700,
        badBookChance: 0.25,
        blinkDelay: 2600,
        fakeNewsAttack: false,
        vignette: false
      },
      {
        id: "fakenews",
        atHp: 2,               // depois do 1º Raio do Conhecimento
        label: "📵 Fake News",
        bookThrowDelay: 1250,
        badBookChance: 0.42,
        blinkDelay: 1950,
        fakeNewsAttack: true,
        vignette: false
      },
      {
        id: "preconceito",
        atHp: 1,                // última vida do boss — fase final
        label: "🙈 Preconceito",
        bookThrowDelay: 900,
        badBookChance: 0.55,
        blinkDelay: 1450,
        fakeNewsAttack: true,
        vignette: true
      }
    ]
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
