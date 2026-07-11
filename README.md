# \# Estrutura de ficheiros — VanBerto's

# 

# O jogo passou a estar dividido em vários ficheiros para facilitar a manutenção,

# usando módulos ES nativos do browser (sem build step — funciona tal e qual

# em GitHub Pages).

# 

# \## Ficheiros

# 

# \- \*\*`index.html`\*\* — carrega `dia-crianca.js` com `type="module"`.

# \- \*\*`dia-crianca.js`\*\* — motor do jogo (Phaser, física, níveis, UI, save/load).

# &#x20; Importa os dados dos 4 ficheiros de dados e os 3 módulos de sistema abaixo.

# \- \*\*`data-quiz.js`\*\* — conteúdo educativo e perguntas:

# &#x20; `HISTORY`, `QUIZ\_TIPS`, `QUIZ\_ARTICLE`, `QUIZ\_BY\_THEME`.

# &#x20; \*(Editar aqui quando quiseres mudar/acrescentar perguntas ou curiosidades.)\*

# \- \*\*`data-levels.js`\*\* — definição dos níveis e paletas visuais:

# &#x20; `THEMES`, `LEVELS`.

# &#x20; \*(Editar aqui para criar ou ajustar um nível.)\*

# \- \*\*`data-progression.js`\*\* — sistemas de progressão:

# &#x20; `MAP\_REGIONS`, `ARTEFACTS`, `ARTEFACT\_SETS`, `SET\_REACTIONS`, `ACHIEVEMENTS\_DEFS`.

# &#x20; \*(Editar aqui para mexer no mapa, álbum de artefactos ou conquistas — útil para a Fase 2/3.)\*

# \- \*\*`data-flavor.js`\*\* — frases soltas sem estrutura de jogo:

# &#x20; `PRAISE`, `PAUSE\_TIPS`, `LEVEL\_ENTRY\_PHRASES`, `DYNAMIC\_MSGS\_CORRECT`, `DYNAMIC\_MSGS\_WRONG`.

# \- \*\*`audio.js`\*\* — sistema de som (síntese WebAudio, sem ficheiros de áudio):

# &#x20; `ensureAudio`, `beep`, `SFX`, `isMuted`, `setMuted`, `toggleMuted`.

# &#x20; \*(Autónomo — não depende de nenhum outro ficheiro do jogo.)\*

# \- \*\*`stars.js`\*\* — sistema de estrelas por nível (até 3 por nível):

# &#x20; `starsForLevel`, `totalStarsEarned`, `finalizeLevelStars`, `resetLevelStarTracking`, etc.

# &#x20; \*(Só depende de `data-levels.js`.)\*

# \- \*\*`achievements.js`\*\* — sistema de conquistas (12 conquistas, guardadas em localStorage):

# &#x20; `unlockAchievement`, `checkAchievements`, `renderAchievements`, etc.

# &#x20; \*(Depende de `data-levels.js`, `data-progression.js`, `audio.js` e `stars.js`.)\*

# \- \*\*`dia-crianca.css`\*\* — estilos (sem alterações).

# \- \*\*`vanberto\_voar.png`\*\* — imagem do mascote (sem alterações).

# 

# \## Porquê módulos ES e não um script de build?

# 

# Publicas via GitHub Pages, que serve ficheiros estáticos diretamente — não há

# nenhum passo de build no teu fluxo atual. Os módulos ES (`import`/`export`)

# funcionam nativamente no browser sem precisar de nenhuma ferramenta extra:

# publicas os ficheiros tal como estão e funciona.

# 

# \## Como adicionar um novo ficheiro de dados no futuro

# 

# 1\. Cria `data-X.js` com `export const ALGO = \[...]`.

# 2\. No topo de `dia-crianca.js`, acrescenta:

# &#x20;  `import { ALGO } from "./data-X.js";`

# 3\. Usa `ALGO` normalmente no resto do código — nada mais muda.

# 

# \## Nota técnica importante

# 

# `dia-crianca.js` continua a ser uma única função grande (a mesma

# `window.addEventListener("DOMContentLoaded", ...)` de sempre) — só os

# \*\*blocos de dados puros\*\* (arrays/objetos sem lógica) foram extraídos.

# A física, o Phaser, os event handlers e toda a lógica do jogo continuam

# no mesmo sítio, exatamente como estavam. Isto foi deliberado: são a parte

# mais interligada e arriscada de separar, por isso ficou para uma fase

# futura, se um dia fizer sentido.

# 

# \## Bug corrigido durante esta reorganização

# 

# A conquista \*\*🥈 Explorador\*\* ("Encontra todos os segredos de um nível") nunca

# podia ser desbloqueada: a função que a ativa (`onSecretFoundForAchievements`)

# existia mas nunca era chamada a partir de `updateSecrets()`. Foi adicionada

# essa chamada, por isso esta conquista já funciona.

# 

# \## 4 Mundos a sério (nova)

# 

# O mapa passou de 6 regiões (com níveis misturados entre si) para \*\*4 mundos\*\*,

# cada um com exactamente 5 níveis seguidos e o seu próprio boss no fim:

# 

# \- \*\*Reino da Educação\*\* — níveis 1-5 → boss Monstro da Ignorância

# \- \*\*Vale da Saúde\*\* — níveis 6-10 → boss Vírus Gigante

# \- \*\*Fortaleza da Proteção\*\* — níveis 11-15 → boss Guardião das Sombras

# \- \*\*Cidade do Mundo Moderno\*\* — níveis 16-20 → boss Poluidor Mecânico

# &#x20; (este último aparece depois do nível 19 — fica ainda o nível 20,

# &#x20; "Direitos Digitais", como epílogo antes do ecrã de vitória final, tal

# &#x20; como já acontecia antes desta reorganização.)

# 

# Os 20 níveis em `data-levels.js` foram reordenados fisicamente para ficarem

# em blocos contíguos por mundo (só 5 objetos mudaram de posição — o resto

# manteve-se igual). `artIdx` (ligação a `HISTORY`/`ARTEFACTS`/`NPC\_SIGNS`) não

# muda com a posição, por isso nenhum conteúdo textual ficou desalinhado —

# confirmado pelos testes automáticos (`node tests/run-tests.mjs`, 24/24 OK).

# 

# \*\*Bloqueio entre mundos\*\*: ao terminar o último nível de um mundo (com ou

# sem boss), o jogo já não avança sozinho — mostra uma pequena celebração

# ("Mundo Completo! 🎉") e volta sempre ao mapa. O mundo seguinte só aparece

# desbloqueado no mapa depois de o anterior estar 100% concluído (a lógica de

# bloqueio do mapa já existia — `regionStatus()` — só precisava de blocos

# contíguos para funcionar como esperado).

# 

# \*\*Nota sobre progresso guardado\*\*: como 5 níveis mudaram de posição (do

# antigo "Vale da Saúde/Fortaleza" espalhados), progresso já guardado no

# browser antes desta atualização pode ficar ligeiramente desalinhado nesses

# níveis específicos. Vale a pena recomeçar o progresso (ou aceitar pequenas

# inconsistências pontuais) depois de atualizares os ficheiros.

# 

# \## Fase "Mundo Vivo" — cinemáticas, portais e NPCs (nova)

# 

# Dois ficheiros novos, 100% aditivos:

# 

# \- \*\*`data-story.js`\*\* — dados narrativos:

# &#x20; `REGION\_INTRO` (falas do cartão de entrada de cada região), `BOSS\_OBJECTIVE`

# &#x20; (explica o que fazer em cada boss), `BOSS\_INTRO\_VB` / `BOSS\_VICTORY\_VB`

# &#x20; (falas genéricas do VanBerto's antes/depois de um boss), `NPC\_SIGNS`

# &#x20; (um letreiro por nível, indexado por `artIdx`).

# \- \*\*`cinematics.js`\*\* — motor de cinemáticas, sem dependências:

# &#x20; `playCinematic(slides, onComplete)` mostra barras de cinema + caixa de

# &#x20; diálogo (avança ao toque, com botão "Saltar"); `playTitleCard(data, onComplete)`

# &#x20; mostra o cartão de título de uma região. Cria o seu próprio DOM em runtime,

# &#x20; tal como `hitFlash`/`bonusStars` já faziam — não foi preciso mexer no `index.html`.

# 

# O que mudou em `dia-crianca.js`:

# 

# \- \*\*Bosses\*\*: antes do combate, `startBossFight` mostra uma cinemática

# &#x20; (VanBerto's → fala do boss → objetivo claro) antes de qualquer inimigo se

# &#x20; mexer — o boss começa numa fase `"intro"` congelada. Depois de vencido,

# &#x20; mostra uma cinemática de vitória e só depois aparece um \*\*portal\*\* — o

# &#x20; jogador tem de caminhar até ele para avançar, em vez de seguir automaticamente.

# \- \*\*Regiões\*\*: ao entrar pela primeira vez numa região (pelo mapa ou a jogar

# &#x20; sequencialmente), aparece um cartão de título com o ícone/nome da região e

# &#x20; 2 falas do VanBerto's, antes do já existente ecrã de transição de nível.

# &#x20; Só aparece uma vez por região — revisitas não repetem a cinemática.

# \- \*\*Letreiros/NPCs\*\*: cada um dos 20 níveis normais tem agora um pequeno

# &#x20; letreiro/personagem que a criança encontra a caminhar (sem pausar o jogo);

# &#x20; ao aproximar-se, mostra uma curiosidade curta no balão de fala do VanBerto's.

# 

# \## Verificação feita

# 

# \- Sintaxe válida em todos os ficheiros JS (`node -c`).

# \- `dia-crianca.js`, `audio.js`, `stars.js` e `achievements.js` validam como módulos ES.

# \- `audio.js`, `stars.js` e `achievements.js` foram importados e executados isoladamente

# &#x20; em Node (com um `window` mínimo simulado) para confirmar que não há erros ao carregar.

# \- Todas as referências às antigas variáveis/funções locais (`muted`, `levelStars`,

# &#x20; `unlockedAchievements`, etc.) foram substituídas pelas funções exportadas dos módulos.

# \- Nenhum import não utilizado ficou por remover.

# 




# ## Bosses — fases de raiva, falas dinâmicas e ataque especial (nova)

Todos os bosses ganharam **3 fases de raiva** ligadas ao HP (3/2/1): a cada
vida perdida ficam mais rápidos (timers de movimento/ataque acelerados 35% e
depois 70%), mostram um ícone de emoção (😊→😠→😡) e dizem uma fala curta e
flutuante — sem pausar o jogo. O ecrã de vitória de boss também ficou mais
festivo (pose de salto do VanBerto's, segunda onda de confetti, pequeno
acorde final).

O **Monstro da Ignorância** deixou de usar a estrela ⭐ genérica para lhe
fazer dano: agora tem um ataque especial próprio, o **Raio do Conhecimento**
(`specialAttack` em `data-bosses.js`). Apanhando 5 livros de conhecimento
(tom azulado, reaproveita `item_livro`) o raio dispara sozinho — precisa de
3 cargas completas para esvaziar o hp:3 do boss. Cada item mostra uma frase
muito curta ("Ler ajuda-nos a pensar.") quase invisível, sem interromper o
ritmo. Tocar neste boss dói SEMPRE (já não há Star Power a "desbloquear" o
toque) — o único caminho é o ataque nomeado.

Estrutura pensada para se repetir noutros bosses no futuro: basta acrescentar
`specialAttack` (nome, chargeCount, chargeFacts) à definição do boss em
`data-bosses.js` — o motor do jogo já trata do resto automaticamente.
