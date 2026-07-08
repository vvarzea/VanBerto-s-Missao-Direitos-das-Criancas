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
  protecao: {
    vanberto: "Esta fortaleza esconde algo sombrio... vamos ter cuidado, mas com coragem!",
    arrival: "A Fortaleza da Proteção guarda o direito de brincar em segurança. 🛡️"
  },
  saude: {
    vanberto: "Cheira a remédio no ar... alguém aqui precisa muito da nossa ajuda!",
    arrival: "Bem-vindo ao Vale da Saúde — todos merecem crescer fortes e saudáveis. 🏥"
  },
  sustent: {
    vanberto: "Olha para esta floresta... o planeta também tem direitos, sabias?",
    arrival: "A Floresta da Sustentabilidade cuida da Terra para todas as crianças. 🌍"
  },
  inclusao: {
    vanberto: "Tanta gente diferente, tantas histórias diferentes... todas importam!",
    arrival: "Bem-vindo à Cidade da Inclusão — aqui ninguém fica de fora. 🤝"
  },
  direitos: {
    vanberto: "Estamos quase lá! Sinto que os últimos direitos estão bem perto...",
    arrival: "A Cidade dos Direitos guarda os segredos da família e do mundo digital. ⭐"
  }
};

export const BOSS_OBJECTIVE = {
  monstro_ignorancia: "Foge dele até apanhares uma estrela ⭐ — só assim consegues atingi-lo! Depois apanha 5 estrelas espalhadas e responde à pergunta final.",
  virus_gigante: "Foge dele até apanhares uma estrela ⭐ para o atingires! Depois apanha 5 corações ❤️ e responde à pergunta final.",
  guardiao_sombras: "Ele teleporta-se pela arena escura — apanha uma estrela ⭐ para o atingires! Depois apanha 5 medalhas 🏅 e responde à pergunta final.",
  poluidor_mecanico: "Ele patrulha depressa numa arena com plataformas móveis — apanha uma estrela ⭐ para o atingires! Depois apanha 5 brinquedos 🧸 e responde à pergunta final."
};

export const BOSS_INTRO_VB = [
  "Sinto uma energia estranha aqui... prepara-te!",
  "Espera! Algo — ou alguém — está a bloquear-nos o caminho!",
  "Cuidado! Isto não é um vilão comum...",
  "Sente-se o perigo no ar! Vamos enfrentar isto juntos!"
];

export const BOSS_VICTORY_VB = [
  "Conseguimos! Mais um direito está a salvo!",
  "Vitória! Vamos continuar a nossa missão!",
  "Excelente trabalho! O caminho está livre outra vez!"
];

// Um "letreiro"/NPC por nível — alinhado por artIdx (0-19), tal como HISTORY[].
export const NPC_SIGNS = [
  { emoji:"📜", text:"Sabias que o Dia da Criança é comemorado a 1 de junho em muitos países? 🎈" },
  { emoji:"🪧", text:"Em 1959 a ONU aprovou a Declaração dos Direitos da Criança — o primeiro grande passo!" },
  { emoji:"🌍", text:"A Convenção sobre os Direitos da Criança de 1989 é o tratado mais ratificado da história!" },
  { emoji:"⚽", text:"Brincar não é só diversão — ajuda-te a crescer, a pensar e a fazer amigos!" },
  { emoji:"📚", text:"A educação é uma chave que abre todas as portas do futuro!" },
  { emoji:"💊", text:"Uma alimentação saudável e check-ups regulares ajudam-te a crescer forte!" },
  { emoji:"🛡️", text:"Se alguma vez te sentires em perigo, fala sempre com um adulto de confiança." },
  { emoji:"🗣️", text:"A tua opinião conta! As crianças têm o direito de ser ouvidas." },
  { emoji:"🌱", text:"Pequenas ações — poupar água, reciclar — ajudam a construir um futuro melhor." },
  { emoji:"🌟", text:"A UNICEF trabalha em mais de 190 países para proteger crianças como tu!" },
  { emoji:"🪪", text:"O teu nome e a tua identidade são só teus — ninguém tos pode tirar." },
  { emoji:"🏠", text:"Todas as crianças têm direito a crescer rodeadas de carinho e cuidado." },
  { emoji:"✈️", text:"Crianças refugiadas têm exatamente os mesmos direitos que qualquer outra criança." },
  { emoji:"🚫", text:"Nenhuma criança deve ser obrigada a trabalhar — o teu trabalho é aprender e brincar!" },
  { emoji:"🗽", text:"Podes expressar as tuas ideias livremente — a tua voz é importante!" },
  { emoji:"🔒", text:"As tuas mensagens e segredos são teus — a privacidade também é um direito." },
  { emoji:"🎭", text:"Há mais de 7000 línguas no mundo — cada cultura é um tesouro único!" },
  { emoji:"♿", text:"Um mundo inclusivo é um mundo onde ninguém fica para trás." },
  { emoji:"🌿", text:"Viver num ambiente saudável é um direito de todas as crianças do mundo." },
  { emoji:"💻", text:"Online também tens direitos: à segurança, à privacidade e à informação correta." }
];
