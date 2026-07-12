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
    // ===== Arena temática — Fase "Bosses de Verdade" =====
    // Antes, TODOS os bosses partilhavam a mesma arena genérica (3 plataformas
    // hardcoded em dia-crianca.js). Este campo "arena" é opt-in: se existir,
    // o motor usa-o; senão, cai no layout genérico de sempre — por isso os
    // outros 3 bosses continuam exactamente iguais até lhes chegar a vez.
    // Tema: "biblioteca flutuante em ruínas" — chão principal + 2 estantes
    // flutuantes laterais (à altura de voo do ataque Fake News, para o
    // agachar continuar a ser útil ali) + 1 estante central mais alta.
    arena: {
      worldW: 1700,
      platforms: [
        [850,520,1700,28],   // chão principal
        [260,400,220,22],    // estante flutuante esquerda
        [1440,400,220,22],   // estante flutuante direita
        [850,300,260,22]     // estante central, mais alta
      ],
      // Reaproveitado pelas estrelas, cargas do Raio do Conhecimento e pelo
      // "blink" do boss — 3 pontos alinhados com as 3 plataformas elevadas.
      spawnSpots: [260, 850, 1440],
      // Decoração ambiente, sem colisão — só emoji + tween, tal como
      // bossLockIcon/showFloat já fazem. Puramente visual.
      decor: [
        { emoji:"📖", x:120,  y:170 },
        { emoji:"📕", x:1580, y:210 },
        { emoji:"📗", x:850,  y:120 },
        { emoji:"📘", x:480,  y:460 },
        { emoji:"📙", x:1220, y:470 }
      ]
    },
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
        // badBookChance suavizado (era 0.25/0.42/0.55) — a versão anterior
        // ficava punitiva demais na fase final para o público-alvo (crianças):
        // um livro mau custa 1 vida E inverte os controlos ao mesmo tempo.
        badBookChance: 0.22,
        blinkDelay: 2600,
        fakeNewsAttack: false,
        // fakeNewsDelay definido em todas as fases (mesmo antes de ligar o
        // ataque) para o timer já nascer com a cadência certa quando a fase 2
        // o ativar — antes ficava sempre fixo em 2100ms, mesmo na fase 3.
        fakeNewsDelay: 2100,
        vignette: false
      },
      {
        id: "fakenews",
        atHp: 2,               // depois do 1º Raio do Conhecimento
        label: "📵 Fake News",
        bookThrowDelay: 1300,
        badBookChance: 0.33,
        blinkDelay: 2000,
        fakeNewsAttack: true,
        fakeNewsDelay: 2100,
        vignette: false
      },
      {
        id: "preconceito",
        atHp: 1,                // última vida do boss — fase final
        label: "🙈 Preconceito",
        bookThrowDelay: 950,
        badBookChance: 0.44,
        blinkDelay: 1500,
        fakeNewsAttack: true,
        // Só agora a fase final acelera de facto o Fake News também (era
        // sempre 2100 fixo antes, apesar de tudo o resto ficar mais rápido).
        fakeNewsDelay: 1500,
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
