// ===== Conteúdo narrativo — Fase "Mundo Vivo" =====
// Ficheiro puramente de dados, sem lógica de jogo.
// - REGION_INTRO: falas mostradas no cartão de entrada de cada região (mapa → nível).
// - BOSS_OBJECTIVE: explica ao jogador o que fazer em cada fase do combate,
//   mostrado na cinemática ANTES do combate começar (não substitui def.intro/defeatLine
//   de data-bosses.js — complementa-os com instruções claras).
// - NPC_SIGNS: um pequeno "letreiro"/personagem por nível (0-19, por artIdx),
//   que a criança encontra ao caminhar pelo nível. Aparece uma única vez.

export const REGION_INTRO = {
  educacao: {
    vanberto: "Sinto os livros a chamar por nós... o conhecimento perdeu-se algures aqui!",
    arrival: "Bem-vindo ao Reino da Educação — aqui nasceu o Dia da Criança! 📚"
  },
  saude: {
    vanberto: "Cheira a medicamento no ar... alguém aqui precisa muito da nossa ajuda!",
    arrival: "Bem-vindo ao Vale da Saúde — bem-estar, futuro e identidade esperam por ti. 🏥"
  },
  protecao: {
    vanberto: "Esta fortaleza esconde algo sombrio... vamos ter cuidado, mas com coragem!",
    arrival: "A Fortaleza da Proteção guarda a família, o refúgio e a liberdade de todos. 🛡️"
  },
  moderno: {
    vanberto: "Estamos quase lá! Sinto que o último grande desafio está bem perto...",
    arrival: "A Cidade do Mundo Moderno guarda os segredos da privacidade e do futuro digital. 🌐"
  }
};

export const BOSS_OBJECTIVE = {
  monstro_ignorancia: "Foge das bolas ❓ e salta-lhe em cima 3 vezes para o vencer!",
  virus_gigante: "Foge da bola ❓ rosa e salta-lhe em cima 3 vezes para o vencer!",
  guardiao_sombras: "Ele teleporta-se e atira orbes sombrios 🔮! Salta-lhe em cima 3 vezes assim que ele reaparecer.",
  poluidor_mecanico: "Ele patrulha depressa — apanha o ritmo e salta-lhe em cima 3 vezes para o vencer!"
};

// Diálogo de boss, agora por boss (em vez de frases genéricas sorteadas ao acaso).
// "reaction" = fala do VanBerto's ANTES do boss se apresentar (pressentir o perigo).
// "rally"    = fala do VanBerto's DEPOIS da ameaça do boss, mesmo antes do combate
//              começar — um "grito de guerra" ligado ao tema do boss.
export const BOSS_INTRO_VB = {
  monstro_ignorancia: {
    reaction: "Sinto uma névoa estranha... como se as palavras se estivessem a apagar à nossa volta!",
    rally: "Não vai resultar! Os livros são sempre mais fortes do que o esquecimento!"
  },
  virus_gigante: {
    reaction: "Ugh, sinto o ar pesado... alguma coisa aqui não está nada bem.",
    rally: "Vamos mostrar-lhe que cuidar da saúde também é um ato de coragem!"
  },
  guardiao_sombras: {
    reaction: "Está tudo tão escuro aqui dentro... mas eu sei que não estamos sozinhos.",
    rally: "As sombras não resistem quando enfrentamos o medo juntos!"
  },
  poluidor_mecanico: {
    reaction: "Cheira a fumo e óleo no ar... isto não pode continuar assim!",
    rally: "Vamos mostrar-lhe que o verde é sempre mais forte do que o cinzento!"
  }
};

// Uma única fala de vitória por boss, ligada ao direito que acabou de ser recuperado.
export const BOSS_VICTORY_VB = {
  monstro_ignorancia: "Conseguimos! O direito à educação vai continuar a brilhar! 📚✨",
  virus_gigante: "Vencemos! A saúde de todas as crianças está mais protegida! 💊",
  guardiao_sombras: "A proteção venceu as sombras! Estamos todos mais seguros! 🛡️",
  poluidor_mecanico: "O planeta agradece! Vamos continuar a cuidar dele juntos! 🌱"
};

// Frases curtas mostradas (sem parar o jogo, só um "floatie") sempre que se
// apanha um objeto de conhecimento no combate do Monstro da Ignorância —
// reforça a aprendizagem quase sem se notar, tal como pedido.
export const KNOWLEDGE_FACTS = [
  "📖 Ler ajuda-nos a pensar.",
  "🎒 A escola abre portas.",
  "🌟 Aprender é um direito.",
  "🧠 Cada livro é um super-poder.",
  "✏️ Errar também é aprender."
];

// Falas curtas do boss em marcos de HP durante o combate (não só no início/fim) —
// só o Monstro da Ignorância tem isto por agora (protótipo "vitrine").
// Cada marco tem 2-3 variações (escolhidas ao acaso pelo motor) — antes era
// uma frase fixa só, o que ficava repetitivo sempre que a criança tentava
// de novo o mesmo combate.
export const BOSS_HP_TAUNTS = {
  monstro_ignorancia: {
    atStart: ["Nunca aprenderás!", "A ignorância é eterna!", "Achas mesmo que me vais vencer?"],
    hp2: ["Isso foi sorte!", "Não contava com isso...", "Grrr, tenta outra vez!"],
    hp1: ["Não! Estou a perder!", "Isto não pode ser...", "A luz... é demasiado forte!"]
  },
  virus_gigante: {
    atStart: ["Vou multiplicar-me sem parar!", "Não me consegues apanhar!", "Espalho-me por todo o lado!"],
    hp2: ["Argh! Isso picou...", "Não contava com esse salto!", "Ainda tenho força de sobra!"],
    hp1: ["Não... os anticorpos são fortes demais!", "Isto não pode ser...", "Estou a enfraquecer!"]
  },
  guardiao_sombras: {
    atStart: ["As sombras vão engolir-te!", "Nunca me vais apanhar no ar!", "Ninguém te protege aqui!"],
    hp2: ["Impossível! Consegues ver-me na sombra?", "Isso não devia ter acontecido...", "Grrr, mais rápido da próxima vez!"],
    hp1: ["Não... a luz está a chegar a todo o lado!", "As sombras... estão a desaparecer!", "Isto não pode ser o fim!"]
  },
  poluidor_mecanico: {
    atStart: ["Vou poluir tudo ainda mais depressa!", "Não me apanhas, sou rápido demais!", "O planeta é meu para sujar!"],
    hp2: ["Essa amolgou-me a chapa!", "Não contava com essa pancada!", "Ainda tenho muitas engrenagens!"],
    hp1: ["Não... a natureza está a resistir!", "Os meus circuitos... estão a falhar!", "Isto não pode ser!"]
  }
};

// Um "letreiro"/NPC por nível — alinhado por artIdx (0-19), tal como HISTORY[].
export const NPC_SIGNS = [
  { emoji:"🎈", text:"Sabias que há dois 'Dias da Criança'? Um a 1 de junho, outro a 20 de novembro!" },
  { emoji:"📜", text:"Sabias que já existia uma declaração de 1924? A de 1959 tornou-a muito mais forte!" },
  { emoji:"🌍", text:"Sabias que Portugal ratificou a Convenção a 21 de setembro de 1990?" },
  { emoji:"⚽", text:"Sabias que brincar é um direito tão oficial como estudar? Está escrito na Convenção!" },
  { emoji:"📚", text:"A educação é uma chave que abre todas as portas do futuro!" },
  { emoji:"💊", text:"Uma alimentação saudável e check-ups regulares ajudam-te a crescer forte!" },
  { emoji:"🛡️", text:"Se alguma vez te sentires em perigo, fala sempre com um adulto de confiança." },
  { emoji:"🗣️", text:"Sabias que este direito obriga os adultos a OUVIR-te, não só a deixar-te falar?" },
  { emoji:"🌱", text:"Poupar água e reciclar são pequenas ações que constroem um futuro melhor." },
  { emoji:"🌟", text:"Sabias que UNICEF significa 'Fundo das Nações Unidas para a Infância'?" },
  { emoji:"🪪", text:"O teu nome e a tua identidade são só teus. Ninguém tos pode tirar." },
  { emoji:"🏠", text:"Todas as crianças têm direito a crescer rodeadas de carinho e cuidado." },
  { emoji:"✈️", text:"Sabias que uma criança refugiada tem sempre direito à escola?" },
  { emoji:"🚫", text:"Sabias que em Portugal só se pode trabalhar a partir dos 16 anos?" },
  { emoji:"🗽", text:"Sabias que podes discordar de um adulto, desde que o digas com respeito?" },
  { emoji:"🔒", text:"As tuas mensagens e segredos são teus. A privacidade também é um direito." },
  { emoji:"🎭", text:"Sabias que o mirandês também é uma língua oficial em Portugal?" },
  { emoji:"♿", text:"Um mundo inclusivo é um mundo onde ninguém fica para trás." },
  { emoji:"🌿", text:"Sabias que plantar uma árvore ajuda o teu direito a um ambiente saudável?" },
  { emoji:"💻", text:"Sabias que nunca deves partilhar dados pessoais ou fotos com desconhecidos online?" }
];
