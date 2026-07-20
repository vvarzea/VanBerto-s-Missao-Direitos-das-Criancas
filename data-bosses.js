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
    // Chão ao mesmo nível dos níveis normais (plataforma principal com topo
    // em y=506, tal como o chão de qualquer nível — ver data-levels.js) —
    // antes desta arena tinha o chão 21px mais alto (topo em y=485, igual
    // aos outros 2 bosses), o que o destacava visualmente dos níveis normais
    // que vêm mesmo antes/depois do combate.
    //
    // bossY: centro do sprite, NÃO os pés — tem de descontar a metade do
    // corpo desenhado (canvas 116px, escala 1.5, pés ~49px abaixo do centro
    // → 49*1.5≈73px) até à superfície do chão da arena (plataforma principal
    // agora em y=521 com 30px de altura → topo em y=506). 506-73=433.
    bossY: 433,
    bossScale: 1.5,          // ~2x a altura do VanBerto's — dá para saltar-lhe em cima sem dificuldade
    // A textura (116x116) tem bastante espaço vazio por cima da cabeça (o
    // corpo começa só a ~1/5 do canvas) — sem isto a barra de vida usava a
    // conta genérica (baseada no canvas inteiro) e ficava muito afastada da
    // cabeça. 72px do centro chega perto o suficiente, com uma pequena folga.
    hpBarOffset: 72,
    // Letreiro do objetivo (ver startBossFight): fica perto do chão, junto
    // ao ponto de partida do jogador — 486 é o mesmo valor por omissão dos
    // níveis normais, por isso não precisa de ajuste com a mudança de chão.
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
      // 514 = mesmo limite físico usado por omissão pelos níveis normais e
      // pelos outros bosses (ver startBossFight em dia-crianca.js) — o chão
      // principal (topo em y=506) fica ligeiramente acima deste limite,
      // exactamente como acontece nos níveis normais, por isso não precisa
      // de um valor próprio.
      worldH: 514,
      platforms: [
        [480,521,960,30],   // chão principal, de ponta a ponta — topo em y=506, igual aos níveis normais
        [230,421,150,20],   // plataforma baixa esquerda (deslocada 21px para baixo, junto com o chão)
        [730,421,150,20]    // plataforma baixa direita (idem)
      ],
      // Pedido: o VanBerto's começava sempre bem junto à margem esquerda
      // (120px, o valor por omissão). 400px fica bem mais ao centro da arena
      // (960px de largura), mas ainda fora do alcance das duas plataformas
      // baixas (155-305 e 655-805) — continua a aterrar no chão principal,
      // tal como antes, só que mais perto do meio do ecrã.
      playerStartX: 400,
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
    // Convertido para o mesmo "boss clássico à Mario" do Monstro da
    // Ignorância (ver esse comentário para a filosofia completa): arena do
    // tamanho da janela, sem scroll, e uma mecânica só — saltar-lhe em cima
    // 3 vezes. Mantém o seu próprio movimento em onda (flutua, pulsa) e a
    // bola ❓ (aqui retintada a rosa) como única diferença de personalidade.
    stompBoss: true,
    stompsToDefeat: 3,
    movementType: "wave",    // continua a flutuar em onda, pulsando de tamanho — só a forma de o vencer mudou
    // Rebalanceamento pedido: o 2º Boss estava demasiado rápido/frustrante
    // para o 4º ano. waveSpeedMult reduz a velocidade do movimento em onda
    // em ~32% (dentro do intervalo pedido de 25%-35%) sem alterar a amplitude
    // — o boss continua a percorrer a arena toda, só que mais devagar e mais
    // previsível. Perto dos extremos da onda (topo/fundo do "sen") a
    // velocidade aproxima-se naturalmente de zero, o que já dá ao jogador
    // pequenas janelas para preparar o salto, como pedido.
    // ATUALIZAÇÃO (feedback: "ainda instável, movimentos estranhos e muito
    // rápidos"): a redução acima só mexeu na frequência da onda — a
    // amplitude (raio) tinha ficado quase do tamanho da arena toda (360px
    // num mundo de 960px), por isso mesmo mais devagar, a velocidade de PICO
    // a meio da oscilação continuava bem acima da patrulha de qualquer outro
    // boss (~392px/s vs. 110-150px/s dos outros). waveRange encurta esse raio
    // e waveSpeedMult desceu mais um pouco — agora o pico ronda ~168px/s,
    // próximo dos outros bosses, sem deixar de atravessar boa parte da arena.
    waveSpeedMult: 0.5,
    waveRange: 210,
    // qmarkEvery subiu de 2400 → 2900ms — mais tempo entre ataques, para dar
    // tempo a uma criança reagir e saltar com calma em vez de reflexos de adulto.
    qmarkEvery: 2900,
    orbTexture: "boss_proj_qmark",
    orbTint: 0xe0409a,       // bola ❓ rosa, a condizer com o próprio Vírus
    // bossY: mesmo raciocínio do Monstro — chão da arena (topo em y=506)
    // menos metade do corpo desenhado. O Vírus é uma esfera com espigões,
    // sem "pés": medi o pixel mais baixo do desenho (~44px abaixo do centro
    // do canvas de 116px) em vez de adivinhar, tal como fiz para o Monstro.
    // 506 - 44*1.5 = 440.
    bossY: 440,
    bossScale: 1.5,
    hpBarOffset: 88,          // idem — medido a partir do topo real do desenho, não do canvas inteiro
    signY: 486,
    intro: "Vou espalhar-me por todo o lado!",
    defeatLine: "Argh! Vacinado... derrotado! 💉",
    quizTheme: "identidade", // era "saude" — corrigido para bater com o Nível 10 (o último antes deste boss)
    hp: 3,                     // 4→3: agora são sempre 3 saltos na cabeça, como os outros bosses "stomp"
    themeIdx: 13,              // teal escuro noturno — combina com o verde-água do boss
    rightRecovered: { emoji: "💊", name: "Direito à Saúde" },
    // Arena do tamanho do ecrã (960x540, sem scroll) — chão principal +
    // 2 plataformas baixas, tal como o Monstro da Ignorância.
    arena: {
      worldW: 960,
      worldH: 514,
      platforms: [
        [480,521,960,30],   // chão principal, de ponta a ponta — topo em y=506
        [200,421,140,20],   // plataforma baixa esquerda
        [760,421,140,20]    // plataforma baixa direita
      ],
      decor: [
        { emoji:"💧", x:90,  y:150 },
        { emoji:"🧬", x:480, y:110 },
        { emoji:"💧", x:870, y:170 }
      ]
    }
  },
  {
    id: "guardiao_sombras",
    afterLevel: 14,          // aparece no fim do Mundo 3 — Fortaleza da Proteção (níveis 10-14)
    name: "Guardião das Sombras",
    emoji: "🌑",
    color: 0x3a3a5c,
    // Mesma conversão para stompBoss — mantém o teletransporte entre 3
    // pontos (agora sempre à altura do chão, ver bossY/doBossTeleport em
    // dia-crianca.js) como a sua marca própria, mais difícil de apanhar
    // no ar do que um boss que só anda.
    stompBoss: true,
    stompsToDefeat: 3,
    movementType: "teleport",
    teleportDelay: 1700,       // mais rápido que o valor por omissão (2400) — mais difícil de prever
    qmarkEvery: 2000,          // reaproveita a bola ❓ do motor, aqui como "orbe sombrio" retintado
    orbTexture: "boss_proj_qmark",
    orbTint: 0x6a3fb5,
    // bossY: o Guardião é uma capa/robe sem pernas — medi o pixel mais baixo
    // da bainha (~43px abaixo do centro do canvas). 506 - 43*1.5 = 442.
    bossY: 442,
    bossScale: 1.5,
    hpBarOffset: 82,
    signY: 486,
    intro: "Nas sombras, ninguém te protege!",
    defeatLine: "A luz da proteção venceu! 🛡️✨",
    quizTheme: "expressao", // era "protecao" — corrigido para bater com o Nível 15 (o último antes deste boss)
    hp: 3,                     // 4→3: agora são sempre 3 saltos na cabeça
    themeIdx: 11,              // azul oceano noturno — fortaleza escura, sem exagerar no preto
    rightRecovered: { emoji: "🛡️", name: "Direito à Proteção" },
    // Arena do tamanho do ecrã, tal como o Monstro — 3 pontos de teletransporte
    // (spawnSpots) ajustados à nova largura de 960px em vez de 1600px.
    arena: {
      worldW: 960,
      worldH: 514,
      platforms: [
        [480,521,960,30],   // chão principal, de ponta a ponta — topo em y=506
        [220,421,120,20],   // plataforma baixa esquerda
        [740,421,120,20]    // plataforma baixa direita
      ],
      spawnSpots: [220, 480, 740]
    }
  },
  {
    id: "poluidor_mecanico",
    afterLevel: 18,          // Mundo 4 — Cidade do Mundo Moderno (níveis 15-19); fica 1 nível
                             // epílogo (Direitos Digitais) depois deste boss, como já era antes.
    name: "Poluidor Mecânico",
    emoji: "🏭",
    color: 0x7a8a5c,
    // Mesma conversão para stompBoss — mantém a patrulha rápida (sensação
    // industrial) mas larga as plataformas móveis e a arena poluída, para
    // caber numa única tela sem scroll, tal como os outros 3 bosses.
    stompBoss: true,
    stompsToDefeat: 3,
    movementType: "patrol",
    patrolSpeed: 150,        // mais rápido — sensação industrial
    hopEvery: 2000,
    qmarkEvery: 2000,
    orbTexture: "boss_proj_qmark",
    orbTint: 0xffd700,       // faísca/parafuso dourado, a condizer com as engrenagens
    // bossY: o Poluidor é uma caixa mecânica larga mas mais baixa que os
    // outros — medi o pixel mais baixo do corpo (~26px abaixo do centro do
    // canvas, bem menos que os outros porque não tem "cabeça" alta, só caixa
    // + chaminé). 506 - 26*1.5 = 467.
    bossY: 467,
    bossScale: 1.5,
    hpBarOffset: 82,
    signY: 486,
    intro: "O planeta é meu para sujar!",
    defeatLine: "O verde venceu o cinzento! 🌱",
    quizTheme: "ambiente",
    hp: 3,                     // 5→3: agora são sempre 3 saltos na cabeça
    themeIdx: 9,                // âmbar dourado enevoado — céu poluído, ainda de dia
    rightRecovered: { emoji: "🌿", name: "Ambiente Saudável" },
    // Arena do tamanho do ecrã, tal como o Monstro.
    arena: {
      worldW: 960,
      worldH: 514,
      platforms: [
        [480,521,960,30],   // chão principal, de ponta a ponta — topo em y=506
        [200,421,150,20],   // plataforma baixa esquerda
        [760,421,150,20]    // plataforma baixa direita
      ],
      decor: [
        { emoji:"🏭", x:90,  y:140 },
        { emoji:"⚙️", x:480, y:110 },
        { emoji:"☁️", x:870, y:160 }
      ]
    }
  }
];

// Lookup rápido por índice de nível — usado em nextLevel()
export const BOSS_BY_LEVEL = Object.fromEntries(BOSSES.map(b => [b.afterLevel, b]));
