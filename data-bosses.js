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
    // Chão alinhado com o dos outros 3 bosses (plataforma principal perto do
    // fundo do ecrã, ≈96% da altura da câmara de 540px), em vez da versão
    // anterior que o levantava 70px extra. Essa versão anterior existia só
    // para o VanBerto's e o Monstro não ficarem escondidos atrás da caixa de
    // diálogo fixa no fundo do ecrã durante a cinemática de entrada — mas
    // agora a fala do próprio Monstro flutua num balão por cima da cabeça
    // dele (ver bossDialogueAnchor em dia-crianca.js), por isso essa folga
    // deixou de ser necessária e só desperdiçava espaço no ecrã.
    //
    // bossY: centro do sprite, NÃO os pés — tem de descontar a metade do
    // corpo desenhado (canvas 116px, escala 1.5, pés ~49px abaixo do centro
    // → 49*1.5≈73px) até à superfície do chão da arena (plataforma principal
    // agora em y=500 com 30px de altura → topo em y=485). 485-73=412.
    bossY: 412,
    bossScale: 1.5,          // ~2x a altura do VanBerto's — dá para saltar-lhe em cima sem dificuldade
    // A textura (116x116) tem bastante espaço vazio por cima da cabeça (o
    // corpo começa só a ~1/5 do canvas) — sem isto a barra de vida usava a
    // conta genérica (baseada no canvas inteiro) e ficava muito afastada da
    // cabeça. 72px do centro chega perto o suficiente, com uma pequena folga.
    hpBarOffset: 72,
    // Letreiro do objetivo (ver startBossFight): fica perto do chão, junto
    // ao ponto de partida do jogador — 486 é o mesmo valor por omissão dos
    // níveis normais, já alinhado com o novo chão desta arena.
    signY: 486,
    intro: "Sem saber, não há poder! Vou apagar tudo o que aprendeste!",
    defeatLine: "Nooo! O conhecimento é mais forte! 📚✨",
    quizTheme: "educacao",
    hp: 3,
    // Tema próprio (em vez do índigo/roxo-noturno nº16, que se confundia
    // com o próprio Monstro — também roxo): castanho-ouro quente, para o
    // vilão roxo se destacar claramente do fundo.
    themeIdx: 15,
    rightRecovered: { emoji: "📚", name: "Direito à Educação" },
    // Arena simples: do tamanho da janela (960x540, sem scroll), chão
    // principal + só 2 plataformas baixas para dar alguma variedade ao salto.
    arena: {
      worldW: 960,
      // 514 = mesmo limite físico usado por omissão pelos outros bosses
      // (ver startBossFight em dia-crianca.js), com o chão principal (y=500,
      // topo em y=485) bem perto do fundo, tal como nas outras arenas — sem
      // a "almofada" extra que este boss tinha antes.
      worldH: 514,
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
    hp: 4,                     // 3→4: mais um ciclo de carga/ataque especial até o vencer
    themeIdx: 13,              // teal escuro noturno — combina com o verde-água do boss
    rightRecovered: { emoji: "💊", name: "Direito à Saúde" },
    // Arena própria — em vez de cair na genérica partilhada, com decoração
    // temática (gotas de água + ADN, ligado ao tema "vírus/saúde").
    arena: {
      worldW: 1600,
      platforms: [
        [800,500,1600,30],   // chão principal
        [280,380,200,22],
        [800,340,200,22],
        [1320,380,200,22]
      ],
      spawnSpots: [280, 800, 1320],
      decor: [
        { emoji:"💧", x:120,  y:140 },
        { emoji:"🧬", x:800,  y:100 },
        { emoji:"💧", x:1480, y:160 },
        { emoji:"🧬", x:420,  y:220 },
        { emoji:"💧", x:1180, y:230 }
      ]
    },
    // Arena contaminada: começa com 2 zonas tóxicas + 2 vírus pequenos; à
    // primeira fúria (perde a 1ª vida do boss) sobe para 3 zonas + 4 vírus —
    // o combate fica visivelmente mais perigoso a meio, não só mais rápido.
    contaminatedArena: {
      zonesBase: [ {x:520, w:200}, {x:1080, w:200} ],
      virusBase: 2,
      hazardType: "acid",
      escalations: {
        1: { zones: [ {x:420,w:180}, {x:900,w:180}, {x:1380,w:180} ], virus: 4 }
      }
    },
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
    },
    rageLines: {
      angry: "Vou multiplicar-me ainda mais!",
      desperate: "Não... os anticorpos são fortes demais!"
    }
  },
  {
    id: "guardiao_sombras",
    afterLevel: 14,          // aparece no fim do Mundo 3 — Fortaleza da Proteção (níveis 10-14)
    name: "Guardião das Sombras",
    emoji: "🌑",
    color: 0x3a3a5c,
    movementType: "teleport", // arena escura, teleporta-se entre 3 pontos
    teleportDelay: 1700,       // mais rápido que o valor por omissão (2400) — mais difícil de prever
    throwsOrbs: true,          // orbes sombrios — reaproveita o projétil ❓ do motor, retintado (ver orbTexture/orbTint)
    orbTexture: "boss_proj_qmark",
    orbTint: 0x6a3fb5,
    orbEvery: 2000,
    intro: "Nas sombras, ninguém te protege!",
    defeatLine: "A luz da proteção venceu! 🛡️✨",
    collectKind: "medalha",
    collectCount: 5,
    quizTheme: "expressao", // era "protecao" — corrigido para bater com o Nível 15 (o último antes deste boss)
    hp: 4,                     // 3→4
    themeIdx: 11,              // azul oceano noturno — fortaleza escura, sem exagerar no preto
    rightRecovered: { emoji: "🛡️", name: "Direito à Proteção" },
    // Arena escura própria — plataformas mais altas e mais estreitas que o
    // normal (110px vs 150-220 nas outras arenas), exigindo mais precisão a
    // saltar, coerente com ser o 3º boss (mais difícil que o Vírus Gigante).
    arena: {
      worldW: 1600,
      platforms: [
        [800,500,1600,30],   // chão principal
        [350,360,110,20],
        [800,300,110,20],
        [1250,360,110,20]
      ],
      spawnSpots: [350, 800, 1250]
    },
    // Ataque especial próprio: apanhar 5 escudos para o Raio da Proteção — mais
    // temático que o genérico "Star Power" e mais difícil, porque os escudos
    // têm de ser apanhados enquanto se foge do Guardião (teleporte rápido) e
    // dos orbes sombrios.
    specialAttack: {
      emoji: "🛡️",
      chargeCount: 5,
      chargeTexture: "item_medalha", // textura de escudo (ver spawnShields em dia-crianca.js)
      chargeTint: 0x60d0ff,
      chargeFacts: [
        "🛡️ Pedir ajuda a um adulto de confiança é um sinal de coragem.",
        "🏠 Toda a criança tem direito a sentir-se segura em casa.",
        "🗣️ Contar o que te incomoda a alguém de confiança protege-te.",
        "🚸 Saber a quem pedir ajuda é uma proteção poderosa.",
        "💙 Ninguém tem o direito de te fazer sentir mal ou com medo."
      ],
      name: "Raio da Proteção",
      visual: "beam",
      visualColor: 0x60d0ff
    },
    rageLines: {
      angry: "As sombras vão engolir-te!",
      desperate: "Não... a luz está a chegar a todo o lado!"
    }
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
    hp: 5,                     // o mais resistente dos 4 bosses (era 3, alvo final é 5)
    themeIdx: 9,                // âmbar dourado enevoado — céu poluído, ainda de dia
    rightRecovered: { emoji: "🌿", name: "Ambiente Saudável" },
    // Arena industrial própria (soma-se às plataformas móveis já ligadas por
    // movingArena) + decoração temática de fábrica/poluição.
    arena: {
      worldW: 1600,
      platforms: [
        [800,500,1600,30],   // chão principal
        [300,400,180,22],
        [1300,400,180,22]
      ],
      spawnSpots: [300, 800, 1300],
      decor: [
        { emoji:"🏭", x:120,  y:130 },
        { emoji:"⚙️", x:800,  y:100 },
        { emoji:"🏭", x:1480, y:150 },
        { emoji:"☁️", x:500,  y:190 },
        { emoji:"☁️", x:1100, y:200 }
      ]
    },
    // Zonas de poluição no chão — reaproveita o hazard "lava" já existente
    // (só retintado/reaproveitado como tal, não é lava a sério temática) via
    // o mesmo sistema de arena contaminada do Vírus Gigante, mas SEM vírus
    // pequenos (virusBase/virusEnraged a 0) — só o perigo no chão importa aqui.
    // Fúria final (perde a 2ª vida, o boss já "desesperado"): mais uma zona
    // de poluição — a patrulha já fica mais rápida automaticamente (speedMult
    // genérico do motor), tal como pedido.
    contaminatedArena: {
      zonesBase: [ {x:800, w:220} ],
      virusBase: 0,
      hazardType: "lava",
      escalations: {
        2: { zones: [ {x:800,w:220}, {x:1350,w:200} ], virus: 0 }
      }
    },
    specialAttack: {
      emoji: "🌱",
      chargeCount: 5,
      chargeTexture: "item_heart", // reaproveitado/retintado — sem asset novo (ver comentário do Vírus)
      chargeTint: 0x30c060,
      chargeFacts: [
        "🌱 Plantar árvores ajuda a limpar o ar que respiramos.",
        "♻️ Reciclar lixo evita que a poluição chegue à natureza.",
        "🚲 Andar de bicicleta polui muito menos do que um carro.",
        "💧 Poupar água protege rios e oceanos.",
        "🌍 Cada pequena ação ajuda a cuidar do planeta inteiro."
      ],
      name: "Onda Verde",
      visual: "wave",
      visualColor: 0x30c060
    },
    rageLines: {
      angry: "Vou poluir tudo ainda mais depressa!",
      desperate: "Não... a natureza está a resistir!"
    }
  }
];

// Lookup rápido por índice de nível — usado em nextLevel()
export const BOSS_BY_LEVEL = Object.fromEntries(BOSSES.map(b => [b.afterLevel, b]));
