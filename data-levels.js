// ===== Definição dos níveis e paletas visuais =====
// THEMES, LEVELS

export const THEMES = [
  // ── 20 paletas únicas — uma por nível ──────────────────────────
  { skyTop:0x1a6ab5, skyBot:0x8ed6f8, hillColor:0x2e9e52, grassTop:0x44cc6a }, //  0 · Nível  1 — azul rico de manhã
  { skyTop:0x3d1466, skyBot:0xff8c40, hillColor:0xbf3c0f, grassTop:0xd95210 }, //  1 · Nível  2 — crepúsculo roxo-laranja
  { skyTop:0x006680, skyBot:0x50e8e0, hillColor:0x0a7a6a, grassTop:0x18c0b0 }, //  2 · Nível  3 — aqua tropical
  { skyTop:0xc02880, skyBot:0xffb8d8, hillColor:0xd0408a, grassTop:0xf060aa }, //  3 · Nível  4 — rosa vibrante
  { skyTop:0x1a0060, skyBot:0xb060ff, hillColor:0x5010a0, grassTop:0x7830d8 }, //  4 · Nível  5 — lilás noturno 🌙
  { skyTop:0x7a2000, skyBot:0xffb060, hillColor:0xd05010, grassTop:0xf07030 }, //  5 · Nível  6 — laranja quente pôr-do-sol
  { skyTop:0x001a5a, skyBot:0x2090e8, hillColor:0x0050a0, grassTop:0x1878d0 }, //  6 · Nível  7 — azul noturno profundo 🌙
  { skyTop:0x5a0030, skyBot:0xff80b8, hillColor:0xb02070, grassTop:0xd83090 }, //  7 · Nível  8 — magenta rico 🌙
  { skyTop:0x0a2010, skyBot:0x40b858, hillColor:0x1a5e2a, grassTop:0x28904a }, //  8 · Nível  9 — floresta verde profunda
  { skyTop:0x5a1a00, skyBot:0xffcc60, hillColor:0xc06010, grassTop:0xe08020 }, //  9 · Nível 10 — âmbar dourado
  { skyTop:0x1a3a00, skyBot:0x90e840, hillColor:0x2e7a10, grassTop:0x4ab020 }, // 10 · Nível 11 — verde lima primavera
  { skyTop:0x001a3a, skyBot:0x4090d0, hillColor:0x004a80, grassTop:0x1060a8 }, // 11 · Nível 12 — azul oceano 🌙
  { skyTop:0x2a0050, skyBot:0xe060ff, hillColor:0x6010b0, grassTop:0x8030d0 }, // 12 · Nível 13 — violeta mágico 🌙
  { skyTop:0x004040, skyBot:0x20d8c0, hillColor:0x006858, grassTop:0x10a898 }, // 13 · Nível 14 — teal escuro 🌙
  { skyTop:0x002850, skyBot:0x60c0ff, hillColor:0x005090, grassTop:0x1080c0 }, // 14 · Nível 15 — azul celeste
  { skyTop:0x603000, skyBot:0xffd060, hillColor:0xb05800, grassTop:0xe07800 }, // 15 · Nível 16 — castanho-ouro (terra)
  { skyTop:0x1a0828, skyBot:0xa040e8, hillColor:0x4a1090, grassTop:0x6820b8 }, // 16 · Nível 17 — índigo cósmico 🌙
  { skyTop:0x003820, skyBot:0x40e870, hillColor:0x106030, grassTop:0x20a050 }, // 17 · Nível 18 — verde floresta 🌙
  { skyTop:0x600010, skyBot:0xff5040, hillColor:0xa02020, grassTop:0xd03030 }, // 18 · Nível 19 — vermelho escarlate 🌙
  { skyTop:0xff6a1a, skyBot:0xffe39a, hillColor:0xe0871a, grassTop:0x5ec85a }, // 19 · Nível 20 — FINAL festivo pôr-do-sol dourado
];

export const LEVELS = [
  {
    name: "Nível 1 — O Dia da Criança",
    artIdx:0, theme:0, quizTheme:"historia", worldW:2600,
    spawn:{x:480,y:460}, doorX:2100,
    platforms:[
      {x:450,y:520,w:900,h:28},{x:1040,y:450,w:300,h:22},{x:1380,y:380,w:270,h:22},
      {x:1700,y:310,w:240,h:22},{x:2050,y:520,w:900,h:28}
    ],
    items:[{x:1040,y:400,kind:"estrela"},{x:1380,y:330,kind:"medalha"},{x:1700,y:260,kind:"brinquedo"}],
    malwares:[{x:1240,y:480,vx:0,pattern:"mini"},{x:1960,y:480,vx:-150,pattern:"patrol"}]
  },
  {
    name: "Nível 2 — A Declaração de 1959",
    artIdx:1, theme:1, quizTheme:"declaracao", worldW:2800,
    spawn:{x:480,y:460}, doorX:2350,
    platforms:[
      {x:520,y:520,w:980,h:28},{x:900,y:450,w:240,h:22},{x:1180,y:380,w:240,h:22},
      {x:1460,y:310,w:240,h:22},{x:1740,y:380,w:240,h:22},{x:2020,y:450,w:240,h:22},
      {x:2380,y:520,w:980,h:28}
    ],
    items:[{x:900,y:400,kind:"balao"},{x:1460,y:260,kind:"medalha"},{x:1740,y:330,kind:"estrela"}],
    malwares:[{x:1320,y:480,vx:0,pattern:"mini"},{x:2140,y:480,vx:-155,pattern:"patrol"}]
  },
  {
    name: "Nível 3 — A Convenção de 1989",
    artIdx:2, theme:2, quizTheme:"convencao", worldW:2900,
    spawn:{x:480,y:460}, doorX:2500,
    platforms:[
      {x:520,y:520,w:1040,h:28},{x:840,y:460,w:240,h:22},{x:1180,y:390,w:240,h:22},
      {x:1520,y:320,w:240,h:22},{x:1860,y:390,w:240,h:22},{x:2200,y:460,w:240,h:22},
      {x:2480,y:520,w:1040,h:28}
    ],
    items:[{x:840,y:220,kind:"estrela"},{x:1520,y:270,kind:"medalha"},{x:2200,y:410,kind:"brinquedo"},{x:560,y:470,kind:"heart"}],
    malwares:[{x:1000,y:480,vx:0,pattern:"mini"},{x:1700,y:480,vx:-160,pattern:"patrol"},{x:2350,y:480,vx:155,pattern:"patrol"}]
  },
  {
    name: "Nível 4 — O Direito ao Brincar",
    artIdx:3, theme:3, quizTheme:"brincar", worldW:2800,
    spawn:{x:480,y:460}, doorX:2630,
    // ══ MECÂNICA ESPECIAL: TRAMPOLINS ══
    // Plataformas mais largas (240px) e vãos mais curtos (~200px) — acessível em mobile.
    // Os trampolins são o caminho principal mas um bom salto normal chega às plataformas mais baixas.
    // Tematicamente: "brincar é essencial — sem brincar não chegas lá!"
    platforms:[
      // Ilhas separadas por vãos de ~200px — desafiante mas praticável em telemóvel
      {x:500,y:390,w:240,h:22},
      {x:880,y:430,w:240,h:22},
      {x:1260,y:370,w:240,h:22},
      {x:1640,y:420,w:240,h:22},
      {x:2020,y:360,w:240,h:22},
      {x:2400,y:410,w:240,h:22},
      // Plataforma final com o portal
      {x:2580,y:518,w:260,h:22}
    ],
    // Trampolins entre ilhas — caminho mais rápido e divertido
    trampolines:[
      {x:680,y:490},{x:1060,y:490},{x:1440,y:490},
      {x:1820,y:490},{x:2200,y:490}
    ],
    items:[
      {x:500,y:340,kind:"estrela"},{x:880,y:380,kind:"brinquedo"},
      {x:1260,y:320,kind:"medalha"},{x:1640,y:370,kind:"duplosalto"},
      {x:2020,y:310,kind:"balao"}
    ],
    malwares:[
      {x:650,y:480,vx:0,pattern:"mini"},
      {x:1030,y:480,vx:-145,pattern:"patrol"},
      {x:1410,y:480,vx:150,pattern:"patrol"},
      {x:1790,y:480,vx:-150,pattern:"jumper"},
      {x:2170,y:480,vx:145,pattern:"jumper"}
    ],
    secrets:[{x:1060,y:415,kind:"estrela",points:20}]
  },
  {
    name: "Nível 5 — O Direito à Educação",
    artIdx:4, theme:4, quizTheme:"educacao", worldW:3100,
    spawn:{x:480,y:460}, doorX:2950,
    platforms:[
      {x:520,y:520,w:1000,h:28},{x:880,y:450,w:220,h:22},{x:1160,y:380,w:220,h:22},
      {x:1460,y:310,w:220,h:22},{x:1760,y:380,w:220,h:22},{x:2060,y:450,w:220,h:22},
      {x:2360,y:380,w:220,h:22},{x:2660,y:520,w:1000,h:28}
    ],
    items:[{x:880,y:230,kind:"estrela"},{x:1460,y:260,kind:"brinquedo"},{x:2060,y:400,kind:"balao"},{x:2360,y:330,kind:"medalha"}],
    malwares:[{x:1020,y:480,vx:165},{x:1620,y:480,vx:-170},{x:2220,y:480,vx:165},{x:2820,y:480,vx:-160}],
    trampolines:[{x:1310,y:462},{x:2210,y:462}],
    secrets:[{x:740,y:470,kind:"estrela",points:20}]
  },
  {
    name: "Nível 6 — O Direito à Saúde",
    artIdx:5, theme:5, quizTheme:"saude", worldW:3100,
    spawn:{x:480,y:460}, doorX:2700,
    // Layout: ilhas a alturas variadas — umas altas, outras baixas, sem padrão regular
    platforms:[
      {x:520,y:520,w:960,h:28},
      {x:860,y:430,w:180,h:22},
      {x:1100,y:340,w:220,h:22},
      {x:1340,y:460,w:160,h:22},
      {x:1560,y:310,w:200,h:22},
      {x:1800,y:410,w:180,h:22},
      {x:2050,y:340,w:160,h:22},
      {x:2260,y:450,w:190,h:22},
      {x:2500,y:370,w:170,h:22},
      {x:2720,y:520,w:960,h:28}
    ],
    items:[{x:860,y:380,kind:"medalha"},{x:1100,y:290,kind:"duplosalto"},{x:1560,y:260,kind:"estrela"},{x:2050,y:290,kind:"brinquedo"},{x:560,y:470,kind:"heart"}],
    malwares:[{x:1010,y:480,vx:170},{x:1480,y:480,vx:-170},{x:1940,y:480,vx:172},{x:2400,y:480,vx:-168},{x:2720,y:480,vx:165}],
    trampolines:[{x:1220,y:462}],
    secrets:[{x:2160,y:355,kind:"estrela",points:20}]
  },
  {
    name: "Nível 7 — O Direito à Proteção",
    artIdx:6, theme:6, quizTheme:"protecao", worldW:3200,
    spawn:{x:480,y:460}, doorX:2850,
    // Layout: pirâmide central alta + plataformas laterais baixas
    platforms:[
      {x:520,y:520,w:960,h:28},
      {x:820,y:450,w:180,h:22},
      {x:1060,y:390,w:180,h:22},
      {x:1300,y:330,w:180,h:22},
      {x:1540,y:260,w:200,h:22},   // topo da pirâmide
      {x:1780,y:330,w:180,h:22},
      {x:2020,y:390,w:180,h:22},
      {x:2260,y:450,w:180,h:22},
      {x:2500,y:380,w:160,h:22},
      {x:2870,y:520,w:960,h:28}
    ],
    items:[{x:820,y:220,kind:"estrela"},{x:1300,y:280,kind:"balao"},{x:1540,y:210,kind:"medalha"},{x:2020,y:340,kind:"brinquedo"},{x:2500,y:330,kind:"duplosalto"}],
    malwares:[{x:970,y:480,vx:175,pattern:"patrol"},{x:1450,y:480,vx:-178,pattern:"patrol"},{x:1920,y:480,vx:177,pattern:"jumper"},{x:2360,y:480,vx:-175,pattern:"jumper"},{x:2720,y:480,vx:172}],
    secrets:[{x:680,y:462,kind:"heart"}]
  },
  {
    name: "Nível 8 — O Direito à Participação",
    artIdx:7, theme:7, quizTheme:"participacao", worldW:3300,
    spawn:{x:480,y:460}, doorX:2950,
    // Layout: "trampolim central obrigatório" — vão largo a meio onde o trampolim é o único caminho
    platforms:[
      {x:520,y:520,w:1000,h:28},
      {x:840,y:440,w:200,h:22},
      {x:1080,y:360,w:200,h:22},
      {x:1320,y:460,w:140,h:22},   // plataforma baixa antes do vão
      // Vão de 400px — só o trampolim chega ao outro lado
      {x:1880,y:460,w:140,h:22},   // plataforma baixa depois do vão
      {x:2100,y:360,w:200,h:22},
      {x:2340,y:440,w:200,h:22},
      {x:2580,y:360,w:200,h:22},
      {x:2980,y:520,w:1000,h:28}
    ],
    items:[{x:840,y:390,kind:"brinquedo"},{x:1080,y:310,kind:"estrela"},{x:1600,y:330,kind:"duplosalto"},{x:2100,y:310,kind:"balao"},{x:2580,y:310,kind:"medalha"},{x:560,y:470,kind:"heart"}],
    malwares:[{x:980,y:480,vx:180,pattern:"patrol"},{x:1580,y:480,vx:-183,pattern:"jumper"},{x:2040,y:480,vx:182,pattern:"jumper"},{x:2450,y:480,vx:-179,pattern:"jumper"},{x:2780,y:480,vx:177}],
    trampolines:[{x:1600,y:462}],
    secrets:[{x:1190,y:355,kind:"estrela",points:25}]
  },
  {
    name: "Nível 9 — O Futuro Sustentável",
    artIdx:8, theme:8, quizTheme:"futuro", worldW:3400,
    spawn:{x:480,y:460}, doorX:3050,
    // Layout: "cascata de terraços" — desce e sobe de forma orgânica, com plataformas a alturas muito variadas
    platforms:[
      {x:520,y:520,w:960,h:28},
      {x:800,y:420,w:170,h:22},
      {x:980,y:330,w:150,h:22},
      {x:1140,y:460,w:150,h:22},   // buraco entre grupos
      {x:1600,y:270,w:160,h:22},   // pico alto
      {x:1820,y:370,w:170,h:22},
      {x:2050,y:450,w:150,h:22},
      {x:2270,y:340,w:170,h:22},
      {x:2500,y:420,w:160,h:22},
      {x:2720,y:310,w:170,h:22},
      {x:3080,y:520,w:960,h:28}
    ],
    items:[{x:800,y:220,kind:"estrela"},{x:980,y:280,kind:"balao"},{x:1600,y:220,kind:"medalha"},{x:2270,y:290,kind:"brinquedo"},{x:2720,y:260,kind:"duplosalto"}],
    malwares:[{x:940,y:480,vx:185,pattern:"jumper"},{x:1490,y:480,vx:-188,pattern:"jumper"},{x:1960,y:480,vx:186,pattern:"jumper"},{x:2400,y:480,vx:-184,pattern:"jumper"},{x:2830,y:480,vx:182,pattern:"patrol"}],
    movingPlatforms:[{x:1380,y:340,w:150,h:22,rangeX:0,rangeY:70,speed:55}],
    trampolines:[{x:2160,y:462}],
    secrets:[{x:660,y:462,kind:"heart"}]
  },
  {
    name: "Nível 10 — A UNICEF e os Direitos",
    artIdx:9, theme:9, quizTheme:"unicef", worldW:3500,
    spawn:{x:480,y:460}, doorX:3100,
    platforms:[
      {x:520,y:520,w:1000,h:28},{x:920,y:442,w:185,h:22},{x:1200,y:368,w:185,h:22},
      {x:1480,y:298,w:185,h:22},{x:1760,y:368,w:185,h:22},{x:2040,y:442,w:185,h:22},
      {x:2320,y:368,w:185,h:22},{x:2600,y:442,w:185,h:22},
      {x:3150,y:520,w:1100,h:28}
    ],
    items:[{x:920,y:342,kind:"estrela"},{x:1480,y:248,kind:"medalha"},{x:2040,y:392,kind:"balao"},{x:2600,y:392,kind:"brinquedo"},{x:560,y:470,kind:"heart"}],
    malwares:[{x:1060,y:480,vx:190,pattern:"jumper"},{x:1660,y:480,vx:-195,pattern:"jumper"},{x:2260,y:480,vx:190,pattern:"jumper"},{x:2860,y:480,vx:-185,pattern:"jumper"},{x:3200,y:480,vx:188,pattern:"jumper"}],
    movingPlatforms:[
      {x:1640,y:360,w:140,h:22,rangeX:200,rangeY:0,speed:90},
      {x:2760,y:310,w:130,h:22,rangeX:0,rangeY:80,speed:60}
    ],
    trampolines:[{x:2180,y:462}],
    secrets:[{x:1150,y:430,kind:"heart"}]
  },
  {
    name: "Nível 11 — O Direito à Identidade",
    artIdx:10, theme:10, quizTheme:"identidade", worldW:3600,
    spawn:{x:480,y:460}, doorX:3200,
    // Layout: "escadinhas duplas" — dois picos com vale ao meio
    platforms:[
      {x:520,y:520,w:960,h:28},
      {x:820,y:440,w:170,h:22},
      {x:1040,y:360,w:160,h:22},
      {x:1260,y:280,w:160,h:22},   // 1º pico
      {x:1500,y:380,w:150,h:22},   // descida para o vale
      {x:1700,y:460,w:130,h:22},   // fundo do vale
      {x:1940,y:360,w:150,h:22},   // subida 2º pico
      {x:2160,y:280,w:160,h:22},   // 2º pico
      {x:2400,y:360,w:160,h:22},
      {x:2640,y:440,w:170,h:22},
      {x:2900,y:360,w:160,h:22},
      {x:3250,y:520,w:960,h:28}
    ],
    items:[{x:820,y:360,kind:"estrela"},{x:1260,y:230,kind:"duplosalto"},{x:1700,y:410,kind:"balao"},{x:2160,y:230,kind:"medalha"},{x:2640,y:390,kind:"brinquedo"},{x:560,y:470,kind:"heart"}],
    malwares:[{x:940,y:480,vx:192,pattern:"patrol"},{x:1420,y:480,vx:-196,pattern:"jumper"},{x:1830,y:480,vx:194,pattern:"jumper"},{x:2300,y:480,vx:-192,pattern:"patrol"},{x:2760,y:480,vx:190,pattern:"jumper"}],
    secrets:[{x:1600,y:370,kind:"estrela",points:25}]
  },
  {
    name: "Nível 12 — O Direito à Família",
    artIdx:11, theme:11, quizTheme:"familia", worldW:3650,
    spawn:{x:480,y:460}, doorX:3340,
    // Layout: "mini-mundos" — 3 grupos de plataformas isolados com vãos entre eles
    platforms:[
      {x:520,y:520,w:960,h:28},
      // grupo A
      {x:820,y:430,w:180,h:22},
      {x:1040,y:340,w:180,h:22},
      {x:1240,y:440,w:160,h:22},
      // vão — trampolim necessário
      {x:1640,y:350,w:180,h:22},
      {x:1860,y:440,w:160,h:22},
      // grupo B
      {x:2100,y:350,w:180,h:22},
      {x:2320,y:270,w:160,h:22},
      {x:2540,y:360,w:160,h:22},
      // grupo C
      {x:2780,y:440,w:170,h:22},
      {x:3000,y:350,w:160,h:22},
      {x:3370,y:520,w:960,h:28}
    ],
    items:[{x:820,y:380,kind:"balao"},{x:1040,y:290,kind:"estrela"},{x:1640,y:300,kind:"duplosalto"},{x:2320,y:220,kind:"medalha"},{x:2780,y:390,kind:"brinquedo"},{x:560,y:470,kind:"heart"}],
    malwares:[{x:950,y:480,vx:194,pattern:"patrol"},{x:1530,y:480,vx:-198,pattern:"jumper"},{x:1980,y:480,vx:196,pattern:"jumper"},{x:2440,y:480,vx:-194,pattern:"patrol"},{x:2880,y:480,vx:192,pattern:"jumper"}],
    trampolines:[{x:1440,y:462}],
    secrets:[{x:3110,y:263,kind:"balao",points:15}]
  },
  {
    name: "Nível 13 — Os Direitos dos Refugiados",
    artIdx:12, theme:12, quizTheme:"refugiados", worldW:3700,
    spawn:{x:480,y:460}, doorX:3300,
    // Layout: "labirinto horizontal" — plataformas em ziguezague apertado exige precisão
    platforms:[
      {x:520,y:520,w:960,h:28},
      {x:820,y:400,w:150,h:22},
      {x:1010,y:310,w:150,h:22},
      {x:1200,y:400,w:130,h:22},
      {x:1380,y:310,w:130,h:22},
      {x:1560,y:400,w:130,h:22},
      {x:1760,y:300,w:150,h:22},
      {x:2000,y:420,w:130,h:22},
      {x:2200,y:330,w:150,h:22},
      {x:2430,y:420,w:140,h:22},
      {x:2650,y:310,w:150,h:22},
      {x:2880,y:410,w:140,h:22},
      {x:3070,y:320,w:150,h:22},
      {x:3360,y:520,w:960,h:28}
    ],
    items:[{x:820,y:210,kind:"estrela"},{x:1010,y:260,kind:"balao"},{x:1760,y:250,kind:"duplosalto"},{x:2200,y:280,kind:"medalha"},{x:2650,y:260,kind:"brinquedo"}],
    malwares:[{x:1100,y:480,vx:196,pattern:"patrol"},{x:1660,y:480,vx:-200,pattern:"jumper"},{x:2100,y:480,vx:196,pattern:"patrol"},{x:2540,y:480,vx:-192,pattern:"jumper"},{x:2980,y:480,vx:194,pattern:"patrol"}],
    movingPlatforms:[{x:1560,y:370,w:120,h:22,rangeX:100,rangeY:0,speed:95}],
    secrets:[{x:680,y:462,kind:"heart"}]
  },
  {
    name: "Nível 14 — Contra o Trabalho Infantil",
    artIdx:13, theme:13, quizTheme:"trabalho", worldW:3750,
    spawn:{x:480,y:460}, doorX:3350,
    platforms:[
      {x:520,y:520,w:960,h:28},
      {x:880,y:440,w:200,h:22},
      {x:1140,y:360,w:180,h:22},
      {x:1400,y:440,w:200,h:22},
      {x:1660,y:350,w:180,h:22},
      {x:1920,y:440,w:200,h:22},
      {x:2180,y:360,w:180,h:22},
      {x:2440,y:440,w:200,h:22},
      {x:2700,y:350,w:180,h:22},
      {x:2960,y:440,w:200,h:22},
      {x:3430,y:520,w:960,h:28}
    ],
    movingPlatforms:[
      {x:1270,y:400,w:130,h:22,rangeX:120,rangeY:0,speed:80},
      {x:1790,y:380,w:130,h:22,rangeX:0,rangeY:80,speed:65},
      {x:2310,y:400,w:130,h:22,rangeX:120,rangeY:0,speed:90},
      {x:2830,y:380,w:130,h:22,rangeX:0,rangeY:80,speed:70}
    ],
    items:[
      {x:880,y:390,kind:"balao"},{x:1140,y:310,kind:"estrela"},
      {x:1660,y:300,kind:"duplosalto"},{x:2180,y:310,kind:"medalha"},
      {x:2700,y:300,kind:"brinquedo"},{x:560,y:470,kind:"heart"}
    ],
    malwares:[
      {x:980,y:480,vx:190,pattern:"patrol"},
      {x:1520,y:480,vx:-194,pattern:"jumper"},
      {x:2020,y:480,vx:192,pattern:"patrol"},
      {x:2540,y:480,vx:-190,pattern:"jumper"},
      {x:3050,y:480,vx:188,pattern:"patrol"}
    ],
    secrets:[{x:2960,y:390,kind:"estrela",points:30}]
  },
  {
    name: "Nível 15 — O Direito à Expressão",
    artIdx:14, theme:14, quizTheme:"expressao", worldW:3800,
    spawn:{x:480,y:460}, doorX:3400,
    platforms:[
      {x:520,y:520,w:1000,h:28},{x:980,y:432,w:160,h:22},{x:1260,y:350,w:160,h:22},
      {x:1540,y:274,w:160,h:22},{x:1820,y:350,w:160,h:22},{x:2100,y:432,w:160,h:22},
      {x:2380,y:350,w:160,h:22},{x:2660,y:270,w:160,h:22},{x:2940,y:350,w:160,h:22},
      {x:3220,y:432,w:160,h:22},{x:3480,y:520,w:1100,h:28}
    ],
    items:[{x:980,y:382,kind:"estrela"},{x:1540,y:224,kind:"balao"},{x:2100,y:382,kind:"brinquedo"},{x:2660,y:220,kind:"medalha"},{x:3220,y:382,kind:"duplosalto"}],
    malwares:[{x:1130,y:480,vx:200,pattern:"patrol"},{x:1760,y:480,vx:-204,pattern:"jumper"},{x:2360,y:480,vx:200,pattern:"patrol"},{x:2960,y:480,vx:-196,pattern:"jumper"},{x:3380,y:480,vx:-198,pattern:"patrol"}],
    movingPlatforms:[
      {x:1410,y:340,w:130,h:22,rangeX:190,rangeY:0,speed:110},
      {x:2230,y:280,w:120,h:22,rangeX:0,rangeY:100,speed:75},
      {x:3090,y:360,w:130,h:22,rangeX:220,rangeY:0,speed:125}
    ],
    trampolines:[{x:1690,y:462},{x:2810,y:462}],
    secrets:[{x:760,y:470,kind:"medalha"},{x:2820,y:262,kind:"estrela",points:30}]
  },
  {
    name: "Nível 16 — O Direito à Privacidade",
    artIdx:15, theme:15, quizTheme:"privacidade", worldW:3850,
    spawn:{x:480,y:460}, doorX:3450,
    // Layout: "degraus duplos" — sobe dois andares, desce dois andares, plataformas estreitas
    platforms:[
      {x:520,y:520,w:960,h:28},
      {x:820,y:440,w:150,h:22},
      {x:1020,y:360,w:140,h:22},
      {x:1200,y:280,w:150,h:22},   // 1º andar
      {x:1380,y:200,w:130,h:22},   // 2º andar (topo)
      {x:1580,y:280,w:140,h:22},
      {x:1780,y:380,w:150,h:22},
      {x:2000,y:460,w:140,h:22},   // vale
      {x:2220,y:370,w:150,h:22},
      {x:2440,y:280,w:140,h:22},   // novo pico
      {x:2640,y:190,w:130,h:22},   // topo absoluto
      {x:2860,y:290,w:140,h:22},
      {x:3080,y:390,w:150,h:22},
      {x:3300,y:450,w:150,h:22},
      {x:3530,y:520,w:960,h:28}
    ],
    items:[{x:820,y:390,kind:"balao"},{x:1380,y:150,kind:"duplosalto"},{x:1780,y:330,kind:"estrela"},{x:2440,y:230,kind:"medalha"},{x:2640,y:140,kind:"brinquedo"},{x:560,y:470,kind:"heart"}],
    malwares:[{x:940,y:480,vx:202,pattern:"patrol"},{x:1680,y:480,vx:-205,pattern:"jumper"},{x:2100,y:480,vx:202,pattern:"jumper"},{x:2760,y:480,vx:-200,pattern:"jumper"},{x:3180,y:480,vx:198,pattern:"patrol"}],
    movingPlatforms:[{x:2000,y:430,w:120,h:22,rangeX:120,rangeY:0,speed:100}],
    trampolines:[{x:1480,y:462}],
    secrets:[{x:1100,y:273,kind:"estrela",points:25}]
  },
  {
    name: "Nível 17 — O Direito à Cultura",
    artIdx:16, theme:16, quizTheme:"cultura", worldW:3900,
    spawn:{x:480,y:460}, doorX:3500,
    // Layout: "cultura em círculos" — plataformas em grupos de 3 como constelações
    platforms:[
      {x:520,y:520,w:960,h:28},
      // constelação A
      {x:820,y:420,w:155,h:22},
      {x:1020,y:330,w:155,h:22},
      {x:1220,y:420,w:140,h:22},
      // constelação B
      {x:1520,y:360,w:155,h:22},
      {x:1720,y:270,w:155,h:22},
      {x:1920,y:370,w:140,h:22},
      // constelação C
      {x:2220,y:440,w:155,h:22},
      {x:2420,y:340,w:155,h:22},
      {x:2620,y:440,w:140,h:22},
      // constelação D
      {x:3080,y:270,w:155,h:22},
      {x:3540,y:520,w:960,h:28}
    ],
    items:[{x:820,y:220,kind:"estrela"},{x:1020,y:280,kind:"balao"},{x:1720,y:220,kind:"duplosalto"},{x:2420,y:290,kind:"medalha"},{x:3080,y:220,kind:"brinquedo"},{x:560,y:470,kind:"heart"}],
    malwares:[{x:950,y:480,vx:204,pattern:"patrol"},{x:1620,y:480,vx:-208,pattern:"jumper"},{x:2120,y:480,vx:204,pattern:"patrol"},{x:2720,y:480,vx:-200,pattern:"jumper"},{x:3180,y:480,vx:-202,pattern:"patrol"}],
    movingPlatforms:[
      {x:1520,y:330,w:130,h:22,rangeX:140,rangeY:0,speed:105},
      {x:2880,y:330,w:130,h:22,rangeX:0,rangeY:90,speed:80}
    ],
    secrets:[{x:2020,y:283,kind:"estrela",points:25}]
  },
  {
    name: "Nível 18 — O Direito à Inclusão",
    artIdx:17, theme:17, quizTheme:"deficiencia", worldW:3950,
    spawn:{x:480,y:460}, doorX:3550,
    // ══ MECÂNICA ESPECIAL: ESTEIRA — PLATAFORMAS TODAS EM MOVIMENTO ══
    // Todas as plataformas intermédias se movem. Umas horizontalmente (esq/dir),
    // outras verticalmente (sobe/desce). O jogador tem de "surfar" o ritmo em vez
    // de saltar em escada estática.
    // Tematicamente: inclusão requer adaptação contínua — nada está fixo.
    platforms:[
      {x:520,y:520,w:960,h:28},     // arranque fixo
      {x:3590,y:520,w:960,h:28}     // chegada fixa
    ],
    // Todas as plataformas intermédias são móveis
    movingPlatforms:[
      // Grupo 1 — balancins horizontais lentos
      {x:900,  y:420, w:160, h:22, rangeX:140, rangeY:0,   speed:60},
      {x:1120, y:340, w:150, h:22, rangeX:0,   rangeY:110, speed:55},
      // Grupo 2 — elevadores verticais médios
      {x:1380, y:380, w:160, h:22, rangeX:120, rangeY:0,   speed:80},
      {x:1620, y:280, w:150, h:22, rangeX:0,   rangeY:130, speed:65},
      {x:1860, y:400, w:160, h:22, rangeX:110, rangeY:0,   speed:90},
      // Grupo 3 — plataformas rápidas
      {x:2120, y:320, w:145, h:22, rangeX:0,   rangeY:120, speed:75},
      {x:2360, y:250, w:150, h:22, rangeX:160, rangeY:0,   speed:100},
      {x:2600, y:370, w:145, h:22, rangeX:0,   rangeY:100, speed:85},
      // Grupo 4 — final mais caótico
      {x:2860, y:430, w:150, h:22, rangeX:130, rangeY:0,   speed:110},
      {x:3080, y:310, w:145, h:22, rangeX:0,   rangeY:120, speed:95},
      {x:3320, y:410, w:150, h:22, rangeX:140, rangeY:0,   speed:105}
    ],
    items:[
      {x:860,y:370,kind:"balao"},{x:1320,y:230,kind:"estrela"},
      {x:1520,y:180,kind:"duplosalto"},{x:2360,y:150,kind:"medalha"},
      {x:3040,y:210,kind:"brinquedo"},{x:560,y:470,kind:"heart"}
    ],
    malwares:[
      {x:980,y:480,vx:206,pattern:"patrol"},{x:1620,y:480,vx:-210,pattern:"jumper"},
      {x:2040,y:480,vx:206,pattern:"patrol"},{x:2700,y:480,vx:-202,pattern:"jumper"},
      {x:3150,y:480,vx:-204,pattern:"patrol"}
    ],
    trampolines:[{x:2480,y:510}],
    secrets:[{x:1820,y:263,kind:"estrela",points:30}]
  },
  {
    name: "Nível 19 — O Direito ao Ambiente",
    artIdx:18, theme:18, quizTheme:"ambiente", worldW:4000,
    spawn:{x:480,y:460}, doorX:3600,
    // Layout: "floresta" — muitas plataformas pequenas a alturas variadas, como ramos de árvores
    platforms:[
      {x:520,y:520,w:960,h:28},
      {x:800,y:430,w:140,h:22},
      {x:980,y:350,w:130,h:22},
      {x:1160,y:440,w:120,h:22},
      {x:1340,y:360,w:130,h:22},
      {x:1520,y:280,w:130,h:22},
      {x:1720,y:360,w:120,h:22},
      {x:1920,y:270,w:130,h:22},  // galho alto
      {x:2120,y:360,w:120,h:22},
      {x:2320,y:440,w:130,h:22},
      {x:2720,y:260,w:130,h:22},  // galho mais alto
      {x:2920,y:340,w:130,h:22},
      {x:3120,y:430,w:130,h:22},
      {x:3340,y:340,w:130,h:22},
      {x:3630,y:520,w:960,h:28}
    ],
    items:[{x:800,y:220,kind:"estrela"},{x:1520,y:230,kind:"balao"},{x:1920,y:220,kind:"duplosalto"},{x:2720,y:210,kind:"medalha"},{x:3120,y:380,kind:"brinquedo"},{x:560,y:470,kind:"heart"}],
    malwares:[{x:880,y:480,vx:208,pattern:"patrol"},{x:1440,y:480,vx:-212,pattern:"jumper"},{x:2020,y:480,vx:208,pattern:"jumper"},{x:2620,y:480,vx:-204,pattern:"jumper"},{x:3220,y:480,vx:-206,pattern:"patrol"}],
    movingPlatforms:[
      {x:1340,y:330,w:110,h:22,rangeX:80,rangeY:0,speed:90},
      {x:2520,y:320,w:110,h:22,rangeX:0,rangeY:70,speed:70},
      {x:3340,y:310,w:110,h:22,rangeX:100,rangeY:0,speed:110}
    ],
    trampolines:[{x:2220,y:462}],
    secrets:[{x:1620,y:193,kind:"estrela",points:35},{x:2820,y:173,kind:"heart"}]
  },
  {
    name: "Nível 20 — Os Direitos Digitais",
    artIdx:19, theme:19, quizTheme:"digital", worldW:4100,
    spawn:{x:480,y:460}, doorX:3700,
    // Layout: "circuito digital" — plataformas em padrão de circuito impresso: retas longas com viragens bruscas
    platforms:[
      {x:520,y:520,w:960,h:28},
      {x:900,y:440,w:300,h:22},    // bloco horizontal longo
      {x:1500,y:280,w:300,h:22},   // outro bloco longo
      {x:1920,y:360,w:130,h:22},   // viragem
      {x:2100,y:440,w:300,h:22},   // bloco longo
      {x:2700,y:260,w:300,h:22},   // bloco longo no topo
      {x:3300,y:430,w:300,h:22},   // reta final
      {x:3680,y:520,w:1100,h:28}
    ],
    items:[{x:1000,y:390,kind:"balao"},{x:1320,y:310,kind:"estrela"},{x:1650,y:230,kind:"duplosalto"},{x:2200,y:390,kind:"medalha"},{x:2800,y:210,kind:"brinquedo"},{x:560,y:470,kind:"heart"}],
    malwares:[
      {x:950,y:420,vx:130,pattern:"patrol"},{x:1100,y:420,vx:-130,pattern:"patrol"},
      {x:1580,y:260,vx:125,pattern:"patrol"},{x:1730,y:260,vx:-125,pattern:"patrol"},
      {x:2180,y:420,vx:122,pattern:"patrol"},{x:2340,y:420,vx:-122,pattern:"patrol"},
      {x:2760,y:240,vx:120,pattern:"patrol"},{x:2940,y:240,vx:-120,pattern:"patrol"},
      {x:3600,y:480,vx:-210,pattern:"jumper"}
    ],
    movingPlatforms:[
      {x:1320,y:330,w:110,h:22,rangeX:0,rangeY:60,speed:85},
      {x:2520,y:310,w:110,h:22,rangeX:120,rangeY:0,speed:115},
      {x:3120,y:310,w:110,h:22,rangeX:0,rangeY:70,speed:90}
    ],
    trampolines:[{x:1750,y:462},{x:3000,y:462}],
    secrets:[
      {x:1420,y:273,kind:"estrela",points:30},
      {x:2950,y:173,kind:"medalha"},
      {x:3550,y:343,kind:"estrela",points:40}
    ]
  },
];
