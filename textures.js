// ===== Geração de texturas Phaser/canvas — VanBerto's =====
// Extraído de dia-crianca.js. Ficheiro 100% autocontido: cada função só
// depende do parâmetro `scene` (instância Phaser) e de constantes locais.
// Não lê nem escreve nenhum estado partilhado do jogo (score, player, etc.).
// Só makeTextures() e makePlatformTextureThemed() são chamadas a partir de
// dia-crianca.js — as restantes (makePlatformTexture, makeDoorTexture,
// makeVilaosTextures, makeBossTextures, makeSparkTexture, makeItemTextures,
// makeVanBertoTexture, rrPath, rrVan, cVan, cfVan, lVan) são de uso interno
// deste módulo, por isso não são exportadas.

// ===== TEXTURAS =====

function rrPath(ctx,x,y,w,h,r){
  ctx.beginPath();
  ctx.moveTo(x+r,y);
  ctx.lineTo(x+w-r,y); ctx.arcTo(x+w,y,x+w,y+r,r);
  ctx.lineTo(x+w,y+h-r); ctx.arcTo(x+w,y+h,x+w-r,y+h,r);
  ctx.lineTo(x+r,y+h); ctx.arcTo(x,y+h,x,y+h-r,r);
  ctx.lineTo(x,y+r); ctx.arcTo(x,y,x+r,y,r);
  ctx.closePath();
}
export function makeTextures(scene){
  makePlatformTexture(scene);
  makeDoorTexture(scene);
  makeVilaosTextures(scene);
  makeBossTextures(scene);
  makeSparkTexture(scene);
  makeItemTextures(scene);
  makeVanBertoTexture(scene,"vanberto_open",false,-1);
  makeVanBertoTexture(scene,"vanberto_blink",true,-1);
  makeVanBertoTexture(scene,"vanberto_wink","wink",-1);
  makeVanBertoTexture(scene,"vanberto_happy","happy",-1);
  makeVanBertoTexture(scene,"vanberto_sad","sad",-1);
  makeVanBertoTexture(scene,"vanberto_walk1",false,0);
  makeVanBertoTexture(scene,"vanberto_walk2",false,1);
  makeVanBertoTexture(scene,"vanberto_jump",false,-1,true);
}

// Plataforma colorida estilo cartoon
function makePlatformTexture(scene){
  if(scene.textures.exists("platform_grass")) return;
  makePlatformTextureThemed(scene,"platform_grass",0);
}

// Gera uma textura de plataforma para cada tema
const PLAT_COLORS=[
  [0x0d3878,0x1e5cb8,0x6aa8ff], // tema0 azul rico
  [0x6a1800,0xc04018,0xff8850], // tema1 crepúsculo
  [0x004858,0x0090a0,0x60e8f0], // tema2 aqua profundo
  [0x780840,0xc03070,0xffa0c8], // tema3 rosa
  [0x200060,0x4810a0,0xc080ff], // tema4 lilás noturno
  [0x003a3a,0x008888,0x40e8e0], // tema5 turquesa
  [0x6a1800,0xb84010,0xff9050], // tema6 laranja quente
  [0x001040,0x0848a0,0x60b8f8], // tema7 azul noturno
  [0x580020,0xa01060,0xff80b8], // tema8 magenta rico
  [0x081808,0x185c28,0x70d870], // tema9 floresta
  [0x7a4a00,0xd9921a,0xffd86a], // tema10 final dourado
];
export function makePlatformTextureThemed(scene, key, themeIdx){
  if(scene.textures.exists(key)) return;
  const [dark, mid, light] = PLAT_COLORS[themeIdx % PLAT_COLORS.length];
  const g=scene.make.graphics({x:0,y:0,add:false});
  // Sombra exterior — mais larga e deslocada para dar profundidade
  g.fillStyle(0x000000,0.40); g.fillRoundedRect(4,25,98,8,4);
  // Corpo principal
  g.fillStyle(dark,1);        g.fillRoundedRect(0,7,100,17,5);
  // Face superior (mais clara)
  g.fillStyle(mid,1);         g.fillRoundedRect(0,0,100,12,5);
  // Brilho suave no topo (efeito vidro)
  g.fillStyle(light,0.35);    g.fillRoundedRect(4,1,92,6,3);
  // Linha de brilho no topo
  g.lineStyle(2,light,0.75);  g.beginPath(); g.moveTo(5,2); g.lineTo(95,2); g.strokePath();
  // Aresta inferior arredondada
  g.fillStyle(dark,1);        g.fillRoundedRect(0,21,100,3,{bl:5,br:5,tl:0,tr:0});
  // Contorno exterior
  g.lineStyle(2.5,dark,1);    g.strokeRoundedRect(0,0,100,24,5);
  // Realce lateral esquerdo (efeito 3D)
  g.lineStyle(1.5,light,0.28); g.beginPath(); g.moveTo(2,6); g.lineTo(2,22); g.strokePath();
  g.generateTexture(key,100,32); g.destroy();
}

// Portal de Estrela — fim do nível muito mais apelativo que uma porta
function makeDoorTexture(scene){
  if(scene.textures.exists("door_party")) return;
  const w=88, h=104, tex=scene.textures.createCanvas("door_party",w,h), ctx=tex.getContext();
  const cx=w/2, cy=h*0.46;

  // ── Aura exterior pulsante (desenhada estaticamente; a animação fica no update) ──
  // Camadas de brilho arco-íris (externas)
  const auras=[
    {r:44, c:"rgba(160,80,255,0.13)"},
    {r:38, c:"rgba(255,107,53,0.16)"},
    {r:33, c:"rgba(255,215,0,0.18)"},
  ];
  auras.forEach(a=>{
    ctx.fillStyle=a.c;
    ctx.beginPath(); ctx.arc(cx,cy,a.r,0,Math.PI*2); ctx.fill();
  });

  // ── Anéis do portal ──
  // Anel 3 — exterior lilás
  const r3g=ctx.createRadialGradient(cx,cy,24,cx,cy,38);
  r3g.addColorStop(0,"rgba(200,120,255,0.0)");
  r3g.addColorStop(0.4,"rgba(200,120,255,0.45)");
  r3g.addColorStop(0.75,"rgba(255,107,53,0.35)");
  r3g.addColorStop(1,"rgba(255,215,0,0.0)");
  ctx.fillStyle=r3g; ctx.beginPath(); ctx.arc(cx,cy,38,0,Math.PI*2); ctx.fill();

  // Anel 2 — intermédio dourado
  const r2g=ctx.createRadialGradient(cx,cy,16,cx,cy,28);
  r2g.addColorStop(0,"rgba(255,215,0,0.0)");
  r2g.addColorStop(0.5,"rgba(255,215,0,0.55)");
  r2g.addColorStop(0.85,"rgba(255,107,53,0.40)");
  r2g.addColorStop(1,"rgba(255,215,0,0.0)");
  ctx.fillStyle=r2g; ctx.beginPath(); ctx.arc(cx,cy,28,0,Math.PI*2); ctx.fill();

  // Centro do portal — vórtice azul-ciano profundo
  const vortex=ctx.createRadialGradient(cx-3,cy-3,1,cx,cy,18);
  vortex.addColorStop(0,"#ffffff");
  vortex.addColorStop(0.18,"#c0f0ff");
  vortex.addColorStop(0.42,"#40b8ff");
  vortex.addColorStop(0.70,"#1040d0");
  vortex.addColorStop(0.88,"#060830");
  vortex.addColorStop(1,"#020415");
  ctx.fillStyle=vortex; ctx.beginPath(); ctx.arc(cx,cy,18,0,Math.PI*2); ctx.fill();

  // Espirais no vórtice (6 raios curvos brancos)
  ctx.save(); ctx.translate(cx,cy);
  for(let s=0;s<6;s++){
    ctx.save(); ctx.rotate(s*Math.PI/3);
    ctx.strokeStyle="rgba(255,255,255,0.22)"; ctx.lineWidth=1.5;
    ctx.beginPath();
    ctx.moveTo(2,0);
    ctx.bezierCurveTo(6,-4, 10,-2, 14,0);
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();

  // ── Estrela grande central de 5 pontas ──
  ctx.save(); ctx.translate(cx,cy);
  // Sombra da estrela
  ctx.shadowColor="rgba(255,215,0,0.9)"; ctx.shadowBlur=18;
  const sgr=ctx.createRadialGradient(-1,-2,0,0,0,16);
  sgr.addColorStop(0,"#ffffff");
  sgr.addColorStop(0.3,"#fffbe0");
  sgr.addColorStop(0.6,"#ffd700");
  sgr.addColorStop(1,"#ff9500");
  ctx.fillStyle=sgr;
  ctx.beginPath();
  for(let j=0;j<5;j++){
    const o=Math.PI*2*j/5-Math.PI/2, inn=o+Math.PI/5;
    j===0?ctx.moveTo(Math.cos(o)*16,Math.sin(o)*16):ctx.lineTo(Math.cos(o)*16,Math.sin(o)*16);
    ctx.lineTo(Math.cos(inn)*7,Math.sin(inn)*7);
  }
  ctx.closePath(); ctx.fill();
  ctx.shadowBlur=0;
  // Brilho no centro da estrela
  ctx.fillStyle="rgba(255,255,255,0.75)";
  ctx.beginPath(); ctx.arc(-2,-3,4,0,Math.PI*2); ctx.fill();
  ctx.restore();

  // ── Partículas estáticas em redor (pequenas estrelinhas) ──
  const sparks=[
    {x:cx-30,y:cy-28,r:3.5,c:"#ffd700"},{x:cx+32,y:cy-24,r:3,c:"#ff6b35"},
    {x:cx-36,y:cy+8,r:2.5,c:"#ff80c0"},{x:cx+34,y:cy+12,r:2.5,c:"#80d0ff"},
    {x:cx-18,y:cy-40,r:3,c:"#a0ff80"},{x:cx+16,y:cy-42,r:2.5,c:"#c080ff"},
    {x:cx-4, y:cy+44,r:3.5,c:"#ffd700"},{x:cx+22,y:cy+38,r:2,c:"#ff6b35"},
    {x:cx-24,y:cy+36,r:2,c:"#80d0ff"},
  ];
  sparks.forEach(s=>{
    // Mini-estrela de 4 pontas
    ctx.save(); ctx.translate(s.x,s.y);
    ctx.fillStyle=s.c;
    ctx.shadowColor=s.c; ctx.shadowBlur=6;
    ctx.beginPath();
    for(let k=0;k<4;k++){
      const a=k*Math.PI/2-Math.PI/4, inn=a+Math.PI/4;
      k===0?ctx.moveTo(Math.cos(a)*s.r,Math.sin(a)*s.r):ctx.lineTo(Math.cos(a)*s.r,Math.sin(a)*s.r);
      ctx.lineTo(Math.cos(inn)*s.r*0.38,Math.sin(inn)*s.r*0.38);
    }
    ctx.closePath(); ctx.fill();
    ctx.shadowBlur=0;
    ctx.restore();
  });

  // ── Texto de apelo no fundo ──
  ctx.font="bold 11px 'Baloo 2', sans-serif";
  ctx.textAlign="center"; ctx.textBaseline="middle";
  ctx.fillStyle="#ffd700";
  ctx.shadowColor="rgba(0,0,0,0.8)"; ctx.shadowBlur=4;
  ctx.fillText("PORTAL!", cx, h-10);
  ctx.shadowBlur=0;

  tex.refresh();
}

// Vilões — muito mais detalhados e com personalidade própria
function makeVilaosTextures(scene){

  // helper: olhos malvados com sobrancelhas
  function evilEyes(ctx,cx,cy,eyeColor){
    // Sobrancelhas malvadas (mais espessas e inclinadas)
    ctx.strokeStyle="#000"; ctx.lineWidth=3;
    ctx.lineCap="round";
    ctx.beginPath(); ctx.moveTo(cx-14,cy-11); ctx.lineTo(cx-4,cy-6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx+14,cy-11); ctx.lineTo(cx+4,cy-6); ctx.stroke();
    // Brancos dos olhos (com sombra)
    ctx.shadowColor="rgba(0,0,0,0.4)"; ctx.shadowBlur=3;
    ctx.fillStyle="#fff";
    ctx.beginPath(); ctx.ellipse(cx-7,cy,5.5,6.5,Math.PI*0.08,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx+7,cy,5.5,6.5,-Math.PI*0.08,0,Math.PI*2); ctx.fill();
    ctx.shadowBlur=0;
    // Íris colorida
    ctx.fillStyle=eyeColor;
    ctx.beginPath(); ctx.ellipse(cx-7,cy+1,3.5,4.5,0,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx+7,cy+1,3.5,4.5,0,0,Math.PI*2); ctx.fill();
    // Pupila preta
    ctx.fillStyle="#000";
    ctx.beginPath(); ctx.ellipse(cx-7,cy+2,1.8,2.4,0,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx+7,cy+2,1.8,2.4,0,0,Math.PI*2); ctx.fill();
    // Brilho duplo na pupila (mais realista)
    ctx.fillStyle="rgba(255,255,255,0.75)";
    ctx.beginPath(); ctx.arc(cx-8,cy-0.5,1.4,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx+6,cy-0.5,1.4,0,Math.PI*2); ctx.fill();
    ctx.fillStyle="rgba(255,255,255,0.45)";
    ctx.beginPath(); ctx.arc(cx-6,cy+2,0.8,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx+8,cy+2,0.8,0,Math.PI*2); ctx.fill();
  }

  // helper: boca malvada com dentes e babas
  function evilMouth(ctx,cx,cy,color, drool=false){
    // Boca aberta (meia-lua)
    ctx.fillStyle="#1a0000";
    ctx.beginPath(); ctx.arc(cx,cy,10,0,Math.PI); ctx.fill();
    // Língua
    ctx.fillStyle="#cc2244";
    ctx.beginPath(); ctx.ellipse(cx, cy+5, 4, 3, 0, 0, Math.PI*2); ctx.fill();
    // Dentes (4 dentes irregulares)
    ctx.fillStyle="#ffffee";
    ctx.fillRect(cx-9, cy, 4, 6);
    ctx.fillRect(cx-4, cy, 4, 7);
    ctx.fillRect(cx+1, cy, 4, 6);
    ctx.fillRect(cx+6, cy, 4, 5);
    // Contorno da boca
    ctx.strokeStyle=color; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.arc(cx,cy,10,0,Math.PI); ctx.stroke();
    // Babas (detalhe de vilão perigoso)
    if(drool){
      ctx.fillStyle="rgba(200,255,200,0.7)";
      ctx.beginPath(); ctx.moveTo(cx-3,cy+8); ctx.quadraticCurveTo(cx-3,cy+14,cx-2,cy+18); ctx.quadraticCurveTo(cx+0,cy+16,cx+1,cy+8); ctx.fill();
    }
  }

  // ── Vilão Redondo — bola vermelha mais elaborada ──────────────
  if(!scene.textures.exists("vilao_round")){
    const tex=scene.textures.createCanvas("vilao_round",64,64), ctx=tex.getContext();
    const cx=32,cy=32;

    // Sombra no chão
    ctx.fillStyle="rgba(0,0,0,0.22)";
    ctx.beginPath(); ctx.ellipse(cx,cy+26,20,5,0,0,Math.PI*2); ctx.fill();

    // Halo externo para contraste em qualquer fundo
    ctx.shadowColor="rgba(200,0,0,0.60)"; ctx.shadowBlur=10;
    ctx.strokeStyle="rgba(255,255,255,0.90)"; ctx.lineWidth=4.5;
    ctx.beginPath(); ctx.arc(cx,cy,23,0,Math.PI*2); ctx.stroke();
    ctx.shadowBlur=0;
    ctx.strokeStyle="rgba(0,0,0,0.30)"; ctx.lineWidth=2;
    ctx.beginPath(); ctx.arc(cx,cy,25,0,Math.PI*2); ctx.stroke();

    // Corpo — gradiente esférico rico
    const gr=ctx.createRadialGradient(cx-8,cy-8,2,cx,cy,22);
    gr.addColorStop(0,"#ff7070");
    gr.addColorStop(0.25,"#ee1111");
    gr.addColorStop(0.65,"#bb0000");
    gr.addColorStop(1,"#6a0000");
    ctx.beginPath(); ctx.arc(cx,cy,22,0,Math.PI*2); ctx.fillStyle=gr; ctx.fill();

    // Padrão de pintas (marcas de perigo — como cogumelo venenoso)
    const spots = [[cx-8,cy-8,4.5],[cx+8,cy-5,3.5],[cx-5,cy+8,4],[cx+10,cy+7,3],[cx+1,cy-13,3]];
    spots.forEach(([px,py,pr])=>{
      ctx.fillStyle="rgba(255,255,255,0.22)";
      ctx.beginPath(); ctx.arc(px,py,pr,0,Math.PI*2); ctx.fill();
      // Borda branca da pinta
      ctx.strokeStyle="rgba(255,255,255,0.15)"; ctx.lineWidth=1;
      ctx.beginPath(); ctx.arc(px,py,pr,0,Math.PI*2); ctx.stroke();
    });

    // Brilho esférico (canto sup. esq.)
    ctx.fillStyle="rgba(255,200,200,0.40)";
    ctx.beginPath(); ctx.ellipse(cx-8,cy-9,10,14,Math.PI*0.3,0,Math.PI*2); ctx.fill();
    ctx.fillStyle="rgba(255,255,255,0.25)";
    ctx.beginPath(); ctx.ellipse(cx-10,cy-12,5,7,Math.PI*0.3,0,Math.PI*2); ctx.fill();

    // Contorno final
    ctx.strokeStyle="#6a0000"; ctx.lineWidth=2.5;
    ctx.beginPath(); ctx.arc(cx,cy,22,0,Math.PI*2); ctx.stroke();

    // Cara malvada
    evilEyes(ctx,cx,cy-3,"#ff0000");
    evilMouth(ctx,cx,cy+10,"#8a0000", false);
    tex.refresh();
  }

  // ── Vilão Espinhoso — azul muito mais detalhado ────────────────
  if(!scene.textures.exists("vilao_spike")){
    const tex=scene.textures.createCanvas("vilao_spike",64,64), ctx=tex.getContext();
    const cx=32,cy=34;

    // Sombra
    ctx.fillStyle="rgba(0,0,0,0.20)";
    ctx.beginPath(); ctx.ellipse(cx,cy+22,18,5,0,0,Math.PI*2); ctx.fill();

    // Halo azul exterior
    ctx.shadowColor="rgba(0,80,220,0.55)"; ctx.shadowBlur=10;
    ctx.strokeStyle="rgba(255,255,255,0.88)"; ctx.lineWidth=4.5;
    ctx.beginPath(); ctx.arc(cx,cy,23,0,Math.PI*2); ctx.stroke();
    ctx.shadowBlur=0;
    ctx.strokeStyle="rgba(0,0,0,0.28)"; ctx.lineWidth=2;
    ctx.beginPath(); ctx.arc(cx,cy,25,0,Math.PI*2); ctx.stroke();

    // Aura azul elétrica
    ctx.fillStyle="rgba(50,100,255,0.18)";
    ctx.beginPath(); ctx.arc(cx,cy,28,0,Math.PI*2); ctx.fill();

    // Espinhos (8 ao redor) — antes do corpo para ficarem por baixo
    ctx.fillStyle="#003090";
    ctx.shadowColor="rgba(0,60,180,0.50)"; ctx.shadowBlur=4;
    for(let si=0;si<8;si++){
      const sa=Math.PI*2*si/8 - Math.PI*0.08;
      const sx1=cx+Math.cos(sa)*20, sy1=cy+Math.sin(sa)*20;
      const sx2=cx+Math.cos(sa)*30, sy2=cy+Math.sin(sa)*30;
      const sxL=cx+Math.cos(sa+0.25)*21, syL=cy+Math.sin(sa+0.25)*21;
      const sxR=cx+Math.cos(sa-0.25)*21, syR=cy+Math.sin(sa-0.25)*21;
      ctx.beginPath(); ctx.moveTo(sx2,sy2); ctx.lineTo(sxL,syL); ctx.lineTo(sxR,syR); ctx.closePath(); ctx.fill();
    }
    ctx.shadowBlur=0;

    // Corpo principal — gradiente azul elétrico
    const gr=ctx.createRadialGradient(cx-7,cy-7,2,cx,cy,21);
    gr.addColorStop(0,"#80b0ff");
    gr.addColorStop(0.30,"#2255ee");
    gr.addColorStop(0.70,"#0030cc");
    gr.addColorStop(1,"#001080");
    ctx.beginPath(); ctx.arc(cx,cy,21,0,Math.PI*2); ctx.fillStyle=gr; ctx.fill();

    // Padrão de circuitos (linhas azuis brilhantes)
    ctx.strokeStyle="rgba(150,200,255,0.35)"; ctx.lineWidth=1;
    ctx.lineCap="round";
    [[cx-6,cy-10,cx-6,cy-3],[cx-6,cy-3,cx+4,cy-3],[cx+4,cy-3,cx+4,cy+5],
     [cx-12,cy+4,cx-4,cy+4],[cx+6,cy+8,cx+12,cy+2]].forEach(([x1,y1,x2,y2])=>{
      ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
    });
    // Nódulos dos circuitos
    ctx.fillStyle="rgba(180,220,255,0.55)";
    [[cx-6,cy-3],[cx+4,cy+5],[cx-4,cy+4]].forEach(([nx,ny])=>{
      ctx.beginPath(); ctx.arc(nx,ny,2,0,Math.PI*2); ctx.fill();
    });

    // Brilho esférico
    ctx.fillStyle="rgba(160,200,255,0.38)";
    ctx.beginPath(); ctx.ellipse(cx-7,cy-8,9,13,Math.PI*0.3,0,Math.PI*2); ctx.fill();
    ctx.fillStyle="rgba(255,255,255,0.22)";
    ctx.beginPath(); ctx.ellipse(cx-9,cy-11,5,7,Math.PI*0.3,0,Math.PI*2); ctx.fill();

    // Contorno
    ctx.strokeStyle="#001580"; ctx.lineWidth=2.5;
    ctx.beginPath(); ctx.arc(cx,cy,21,0,Math.PI*2); ctx.stroke();

    evilEyes(ctx,cx,cy-2,"#0044ff");
    evilMouth(ctx,cx,cy+10,"#001080", false);
    tex.refresh();
  }

  // ── Vilão Inseto — verde muito mais elaborado ──────────────────
  if(!scene.textures.exists("vilao_bug")){
    const tex=scene.textures.createCanvas("vilao_bug",64,64), ctx=tex.getContext();
    const cx=32,cy=30;

    // Sombra
    ctx.fillStyle="rgba(0,0,0,0.22)";
    ctx.beginPath(); ctx.ellipse(cx,cy+28,22,6,0,0,Math.PI*2); ctx.fill();

    // Halo verde exterior
    ctx.shadowColor="rgba(0,160,0,0.55)"; ctx.shadowBlur=10;
    ctx.strokeStyle="rgba(255,255,255,0.82)"; ctx.lineWidth=4.5;
    ctx.beginPath(); ctx.arc(cx,cy,23,0,Math.PI*2); ctx.stroke();
    ctx.shadowBlur=0;
    ctx.strokeStyle="rgba(0,0,0,0.22)"; ctx.lineWidth=2;
    ctx.beginPath(); ctx.arc(cx,cy,25,0,Math.PI*2); ctx.stroke();

    // Corpo principal — gradiente verde rico
    const gr=ctx.createRadialGradient(cx-6,cy-6,2,cx,cy,21);
    gr.addColorStop(0,"#90ff50");
    gr.addColorStop(0.35,"#30b020");
    gr.addColorStop(0.70,"#0d7010");
    gr.addColorStop(1,"#044806");
    ctx.beginPath(); ctx.arc(cx,cy,21,0,Math.PI*2); ctx.fillStyle=gr; ctx.fill();

    // Patas (3 de cada lado, com articulações)
    ctx.strokeStyle="#1a6010"; ctx.lineWidth=2.5; ctx.lineCap="round";
    for(let pi=0;pi<3;pi++){
      const py=cy-5+pi*7;
      // Pata esquerda — 2 segmentos com joelho
      ctx.beginPath(); ctx.moveTo(cx-21,py); ctx.lineTo(cx-28,py-5); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx-28,py-5); ctx.lineTo(cx-35,py+4); ctx.stroke();
      // Garra esquerda
      ctx.fillStyle="#064806"; ctx.beginPath(); ctx.arc(cx-35,py+4,3.5,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle="#1a6010"; ctx.lineWidth=1; ctx.stroke();
      // Pata direita
      ctx.strokeStyle="#1a6010"; ctx.lineWidth=2.5;
      ctx.beginPath(); ctx.moveTo(cx+21,py); ctx.lineTo(cx+28,py-5); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx+28,py-5); ctx.lineTo(cx+35,py+4); ctx.stroke();
      ctx.fillStyle="#064806"; ctx.beginPath(); ctx.arc(cx+35,py+4,3.5,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle="#1a6010"; ctx.lineWidth=1; ctx.stroke();
    }

    // Antenas curvas com bola brilhante
    ctx.strokeStyle="#064806"; ctx.lineWidth=2.5; ctx.lineCap="round";
    ctx.beginPath(); ctx.moveTo(cx-7,cy-20); ctx.quadraticCurveTo(cx-18,cy-36,cx-11,cy-45); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx+7,cy-20); ctx.quadraticCurveTo(cx+18,cy-36,cx+11,cy-45); ctx.stroke();
    // Bolas das antenas com brilho
    ctx.shadowColor="rgba(255,100,50,0.70)"; ctx.shadowBlur=6;
    ctx.fillStyle="#ff5520";
    ctx.beginPath(); ctx.arc(cx-11,cy-45,5.5,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx+11,cy-45,5.5,0,Math.PI*2); ctx.fill();
    ctx.shadowBlur=0;
    ctx.strokeStyle="#c04000"; ctx.lineWidth=1.2;
    ctx.beginPath(); ctx.arc(cx-11,cy-45,5.5,0,Math.PI*2); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx+11,cy-45,5.5,0,Math.PI*2); ctx.stroke();
    // Brilho nas bolas
    ctx.fillStyle="rgba(255,220,180,0.65)";
    ctx.beginPath(); ctx.arc(cx-13,cy-47,2,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx+9,cy-47,2,0,Math.PI*2); ctx.fill();

    // Segmentos do abdómen (3 anéis)
    ctx.strokeStyle="rgba(0,80,0,0.45)"; ctx.lineWidth=1.5;
    for(let s=0;s<3;s++){
      ctx.beginPath(); ctx.ellipse(cx,cy-3+s*9,16,3,0,0,Math.PI); ctx.stroke();
    }

    // Brilho esférico
    ctx.fillStyle="rgba(200,255,150,0.28)";
    ctx.beginPath(); ctx.ellipse(cx-7,cy-8,9,13,Math.PI*0.3,0,Math.PI*2); ctx.fill();
    ctx.fillStyle="rgba(255,255,255,0.20)";
    ctx.beginPath(); ctx.ellipse(cx-9,cy-11,5,7,Math.PI*0.3,0,Math.PI*2); ctx.fill();

    // Contorno final
    ctx.strokeStyle="#044806"; ctx.lineWidth=2.5;
    ctx.beginPath(); ctx.arc(cx,cy,21,0,Math.PI*2); ctx.stroke();

    evilEyes(ctx,cx,cy-2,"#00aa00");
    evilMouth(ctx,cx,cy+10,"#0a5000", true); // babas no inseto — mais assustador!
    tex.refresh();
  }
} // fim makeVilaosTextures

// ── Bosses — silhuetas próprias, uma por boss, para deixarem de ser o
//    vilão normal aumentado. Cada textura é desenhada uma única vez. ────
function makeBossTextures(scene){
  const S = 116, C = 58;

  function bossShadow(ctx){
    ctx.fillStyle="rgba(0,0,0,0.28)";
    ctx.beginPath(); ctx.ellipse(C,S-14,34,8,0,0,Math.PI*2); ctx.fill();
  }
  function glowEye(ctx,x,y,r,color){
    ctx.shadowColor=color; ctx.shadowBlur=10;
    ctx.fillStyle=color;
    ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
    ctx.shadowBlur=0;
    ctx.fillStyle="rgba(255,255,255,0.85)";
    ctx.beginPath(); ctx.arc(x-r*0.3,y-r*0.3,r*0.32,0,Math.PI*2); ctx.fill();
  }

  // ── 1) Monstro da Ignorância — redesenho "boss clássico à Mario" (nova) ──
  // Antes: silhueta abstrata, sombria, com venda e boca cosida — assustadora
  // e difícil de "ler" à distância. Agora: uma criatura roxa, rechonchuda e
  // divertida — mistura de Goomba (simplicidade) com Bomberman (corpo
  // arredondado) — baixa e larga de propósito, para ser óbvio saltar-lhe em
  // cima. Nunca assustadora: olhos grandes com pupilas em "?", sorriso
  // malandro, braços curtos com mãos grandes, pernas pequenas e pés largos.
  function drawMonstroBody(ctx) {
    bossShadow(ctx);
    // Corpo — um só blob grande e macio, roxo, sólido (nada de fumo/abstrato)
    const gr = ctx.createRadialGradient(C-12,C-16,6,C,C-2,44);
    gr.addColorStop(0,"#ad82ff"); gr.addColorStop(0.55,"#6a3ad8"); gr.addColorStop(1,"#3a1a80");
    ctx.fillStyle = gr;
    ctx.beginPath(); ctx.ellipse(C, C-2, 40, 33, 0, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = "#2a1060"; ctx.lineWidth = 3;
    ctx.stroke();
    // Barriga — roxo mais claro
    ctx.fillStyle = "#cdb4ff";
    ctx.beginPath(); ctx.ellipse(C, C+13, 19, 14, 0, 0, Math.PI*2); ctx.fill();
    // Pernas pequenas + pés largos — anda aos pequenos saltinhos, nunca flutua
    ctx.strokeStyle = "#2a1060"; ctx.lineWidth = 2;
    [-17,17].forEach(dx=>{
      ctx.fillStyle = "#6a3ad8";
      ctx.beginPath(); ctx.ellipse(C+dx, C+35, 9, 8, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#2a1060";
      ctx.beginPath(); ctx.ellipse(C+dx, C+43, 13, 6, 0, 0, Math.PI*2); ctx.fill();
    });
  }
  // Braços curtos, mãos grandes — "wave" (a acenar/apontar, usado na pose
  // normal e confiante) ou "rest" (junto ao corpo, usado no estado de dor).
  function drawMonstroArms(ctx, mood) {
    ctx.strokeStyle = "#2a1060"; ctx.lineWidth = 2;
    if (mood === "wave") {
      [[-1,-34,-8],[1,34,-8]].forEach(([side,dx,dy])=>{
        ctx.fillStyle = "#6a3ad8";
        ctx.beginPath(); ctx.ellipse(C+dx*0.7, C+dy, 9, 15, side*0.55, 0, Math.PI*2); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.arc(C+dx, C+dy-10, 8.5, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      });
    } else {
      [-38,38].forEach(dx=>{
        ctx.fillStyle = "#6a3ad8";
        ctx.beginPath(); ctx.ellipse(C+dx, C+8, 8, 13, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.arc(C+dx, C+21, 8, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      });
    }
  }
  // Estado normal — confiante, sorriso malandro, um sobrolho levantado.
  // Pupilas em forma de "?" — reforça o tema sem precisar de mais nada.
  // Olhos + sobrolho + sorriso do estado normal, separados num helper para
  // poderem ser reutilizados nas novas variantes de animação "idle" (piscar
  // e braços em repouso) sem duplicar o desenho todo. eyesOpen=false desenha
  // os olhos fechados (piscar), mantendo a mesma zona ocular para o "?" não
  // saltar de posição quando volta a abrir.
  function drawMonstroFace(ctx, eyesOpen) {
    if (eyesOpen) {
      [-16,16].forEach(dx=>{
        ctx.fillStyle="#fffaff";
        ctx.beginPath(); ctx.ellipse(C+dx, C-10, 12, 13, 0, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle="#2a1060"; ctx.lineWidth=1.5; ctx.stroke();
        ctx.fillStyle="#2a1060"; ctx.font="bold 15px sans-serif"; ctx.textAlign="center"; ctx.textBaseline="middle";
        ctx.fillText("?", C+dx, C-8);
      });
      ctx.textBaseline="alphabetic";
    } else {
      ctx.strokeStyle="#2a1060"; ctx.lineWidth=2.5; ctx.lineCap="round";
      [-16,16].forEach(dx=>{
        ctx.beginPath(); ctx.moveTo(C+dx-9, C-9); ctx.quadraticCurveTo(C+dx, C-4, C+dx+9, C-9); ctx.stroke();
      });
    }
    // Sobrolho malandro — um levantado, o outro relaxado ("está sempre
    // convencido que vai ganhar")
    ctx.strokeStyle="#2a1060"; ctx.lineWidth=3; ctx.lineCap="round";
    ctx.beginPath(); ctx.moveTo(C-26,C-26); ctx.lineTo(C-8,C-30); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(C+8,C-22); ctx.lineTo(C+26,C-20); ctx.stroke();
    // Sorriso assimétrico, malandro — preenchido (não só contorno fino) para
    // se ler bem à distância/em jogo, com um "dente" a brilhar no canto
    // levantado, reforçando o ar convencido.
    ctx.fillStyle="#2a1060";
    ctx.beginPath();
    ctx.moveTo(C-15,C+14);
    ctx.quadraticCurveTo(C, C+29, C+22, C+9);
    ctx.quadraticCurveTo(C+2, C+21, C-15,C+14);
    ctx.fill();
    ctx.strokeStyle="#1a0a40"; ctx.lineWidth=1.5; ctx.stroke();
    ctx.fillStyle="#fffaff";
    ctx.beginPath(); ctx.moveTo(C+18,C+11); ctx.lineTo(C+23,C+9); ctx.lineTo(C+19,C+16); ctx.closePath(); ctx.fill();
  }
  if(!scene.textures.exists("boss_monstro_ignorancia")){
    const tex=scene.textures.createCanvas("boss_monstro_ignorancia",S,S), ctx=tex.getContext();
    drawMonstroBody(ctx);
    drawMonstroArms(ctx, "wave");
    drawMonstroFace(ctx, true);
    tex.refresh();
  }
  // Duas variantes novas, só para a animação "idle" (ver doBossIdleArms/
  // doBossIdleBlink em dia-crianca.js) — o Monstro deixa de ficar
  // completamente parado fora dos golpes: alterna braços "wave"/"rest" a
  // espaços regulares e pisca os olhos de vez em quando.
  if(!scene.textures.exists("boss_monstro_ignorancia_armsdown")){
    const tex=scene.textures.createCanvas("boss_monstro_ignorancia_armsdown",S,S), ctx=tex.getContext();
    drawMonstroBody(ctx);
    drawMonstroArms(ctx, "rest");
    drawMonstroFace(ctx, true);
    tex.refresh();
  }
  if(!scene.textures.exists("boss_monstro_ignorancia_blink")){
    const tex=scene.textures.createCanvas("boss_monstro_ignorancia_blink",S,S), ctx=tex.getContext();
    drawMonstroBody(ctx);
    drawMonstroArms(ctx, "wave");
    drawMonstroFace(ctx, false);
    tex.refresh();
  }
  // Estado "ouch" — usado por meio segundo sempre que leva um salto na
  // cabeça: achatamento exagerado tipo desenho animado, olhos esbugalhados,
  // boca aberta. Volta ao estado normal logo a seguir (não é uma fase — é
  // só a reação a UM golpe, reaproveitada nos 3 saltos).
  if(!scene.textures.exists("boss_monstro_ignorancia_ouch")){
    const tex=scene.textures.createCanvas("boss_monstro_ignorancia_ouch",S,S), ctx=tex.getContext();
    drawMonstroBody(ctx);
    drawMonstroArms(ctx, "rest");
    [-16,16].forEach(dx=>{
      ctx.fillStyle="#fffaff";
      ctx.beginPath(); ctx.ellipse(C+dx, C-8, 14, 15, 0, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle="#2a1060"; ctx.lineWidth=1.5; ctx.stroke();
      ctx.fillStyle="#2a1060"; ctx.font="bold 17px sans-serif"; ctx.textAlign="center"; ctx.textBaseline="middle";
      ctx.fillText("?", C+dx, C-6);
    });
    ctx.textBaseline="alphabetic";
    ctx.strokeStyle="#2a1060"; ctx.lineWidth=3; ctx.lineCap="round";
    ctx.beginPath(); ctx.moveTo(C-26,C-30); ctx.lineTo(C-8,C-22); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(C+8,C-22); ctx.lineTo(C+26,C-30); ctx.stroke();
    ctx.fillStyle="#2a1060";
    ctx.beginPath(); ctx.ellipse(C, C+21, 9, 11, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle="#ff9fdc";
    ctx.beginPath(); ctx.ellipse(C, C+25, 5, 5, 0, 0, Math.PI*2); ctx.fill();
    tex.refresh();
  }
  // Estado "sentado" — usado na sequência de derrota: senta-se no chão,
  // lê um livro que aparece à sua frente e dá um polegar para cima. Não
  // morre, não explode — só fica contente e simpático, tal como pedido.
  if(!scene.textures.exists("boss_monstro_ignorancia_sentado")){
    const tex=scene.textures.createCanvas("boss_monstro_ignorancia_sentado",S,S), ctx=tex.getContext();
    bossShadow(ctx);
    const gr = ctx.createRadialGradient(C-12,C-8,6,C,C+6,44);
    gr.addColorStop(0,"#ad82ff"); gr.addColorStop(0.55,"#6a3ad8"); gr.addColorStop(1,"#3a1a80");
    ctx.fillStyle = gr;
    ctx.beginPath(); ctx.ellipse(C, C+4, 42, 28, 0, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = "#2a1060"; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = "#cdb4ff";
    ctx.beginPath(); ctx.ellipse(C, C+17, 20, 12, 0, 0, Math.PI*2); ctx.fill();
    // Pernas cruzadas à frente, sentado
    ctx.fillStyle = "#6a3ad8"; ctx.strokeStyle="#2a1060"; ctx.lineWidth=2;
    ctx.beginPath(); ctx.ellipse(C-14, C+35, 17, 7, 0.28, 0, Math.PI*2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(C+14, C+35, 17, 7, -0.28, 0, Math.PI*2); ctx.fill(); ctx.stroke();
    // Braço junto ao corpo
    ctx.beginPath(); ctx.ellipse(C-33, C+10, 8, 13, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
    // Braço com polegar para cima
    ctx.beginPath(); ctx.ellipse(C+29, C-4, 8, 15, -0.32, 0, Math.PI*2); ctx.fill(); ctx.stroke();
    ctx.fillRect(C+29, C-26, 6, 11);
    ctx.beginPath(); ctx.arc(C+33, C-18, 7, 0, Math.PI*2); ctx.fill(); ctx.stroke();
    // Olhos contentes — curva feliz, em vez de ovais abertos
    ctx.strokeStyle="#2a1060"; ctx.lineWidth=3; ctx.lineCap="round";
    ctx.beginPath(); ctx.arc(C-16, C-6, 8, Math.PI*1.1, Math.PI*1.9); ctx.stroke();
    ctx.beginPath(); ctx.arc(C+16, C-6, 8, Math.PI*1.1, Math.PI*1.9); ctx.stroke();
    // Sorriso largo e satisfeito
    ctx.beginPath(); ctx.arc(C, C+12, 14, 0.15*Math.PI, 0.85*Math.PI); ctx.stroke();
    tex.refresh();
  }

  // ── 2) Vírus Gigante — esfera com espigões, estilo coronavírus ──────
  if(!scene.textures.exists("boss_virus_gigante")){
    const tex=scene.textures.createCanvas("boss_virus_gigante",S,S), ctx=tex.getContext();
    bossShadow(ctx);
    const bodyR=28;
    // brilho exterior dourado — o nível dele é todo em tons de verde-água,
    // por isso o corpo passou de verde para magenta/rosa (ver abaixo), e este
    // anel garante que se destaca também de qualquer outro fundo escuro.
    ctx.shadowColor="rgba(255,224,140,0.55)"; ctx.shadowBlur=14;
    ctx.strokeStyle="rgba(255,232,160,0.65)"; ctx.lineWidth=3;
    ctx.beginPath(); ctx.arc(C,C,bodyR+15,0,Math.PI*2); ctx.stroke();
    ctx.shadowBlur=0;
    // espigões
    ctx.strokeStyle="#7a1450"; ctx.lineWidth=3.5; ctx.lineCap="round";
    const spikes=12;
    for(let i=0;i<spikes;i++){
      const a=(Math.PI*2*i)/spikes;
      const x1=C+Math.cos(a)*bodyR, y1=C+Math.sin(a)*bodyR;
      const x2=C+Math.cos(a)*(bodyR+13), y2=C+Math.sin(a)*(bodyR+13);
      ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
      ctx.fillStyle= i%2===0 ? "#ffe85c" : "#ff6b5c";
      ctx.beginPath(); ctx.arc(x2,y2,4.2,0,Math.PI*2); ctx.fill();
    }
    // corpo — magenta/rosa vivo (contraste com o fundo verde-água do nível)
    const gr=ctx.createRadialGradient(C-8,C-8,3,C,C,bodyR);
    gr.addColorStop(0,"#ffd6f0"); gr.addColorStop(0.45,"#e0409a"); gr.addColorStop(1,"#5c1050");
    ctx.fillStyle=gr;
    ctx.beginPath(); ctx.arc(C,C,bodyR,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle="#3a0a30"; ctx.lineWidth=2;
    ctx.beginPath(); ctx.arc(C,C,bodyR,0,Math.PI*2); ctx.stroke();
    // padrão interior (manchas)
    ctx.fillStyle="rgba(90,10,60,0.35)";
    [[-10,-6,6],[9,-11,4],[6,9,5],[-8,10,4]].forEach(([dx,dy,r])=>{
      ctx.beginPath(); ctx.arc(C+dx,C+dy,r,0,Math.PI*2); ctx.fill();
    });
    // olhos e boca malvados simples
    ctx.fillStyle="#fff";
    ctx.beginPath(); ctx.ellipse(C-8,C-2,5,6,0,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(C+8,C-2,5,6,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle="#2a0a1a";
    ctx.beginPath(); ctx.arc(C-8,C,2.4,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(C+8,C,2.4,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle="#2a0a1a"; ctx.lineWidth=2;
    ctx.beginPath(); ctx.arc(C,C+11,7,0.1*Math.PI,0.9*Math.PI); ctx.stroke();
    tex.refresh();
  }

  // ── 3) Guardião das Sombras — capa encapuzada, olhos a brilhar ──────
  if(!scene.textures.exists("boss_guardiao_sombras")){
    const tex=scene.textures.createCanvas("boss_guardiao_sombras",S,S), ctx=tex.getContext();
    bossShadow(ctx);
    // capa — forma triangular com bainha irregular em baixo
    const gr=ctx.createLinearGradient(0,C-40,0,S-16);
    gr.addColorStop(0,"#4a4a72"); gr.addColorStop(0.5,"#2a2a48"); gr.addColorStop(1,"#0e0e1c");
    ctx.fillStyle=gr;
    ctx.beginPath();
    ctx.moveTo(C,C-40);
    ctx.lineTo(C+30,C+24);
    ctx.lineTo(C+22,C+22); ctx.lineTo(C+14,S-16); ctx.lineTo(C+5,C+26);
    ctx.lineTo(C-5,C+26); ctx.lineTo(C-14,S-16); ctx.lineTo(C-22,C+22);
    ctx.lineTo(C-30,C+24);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle="#000"; ctx.lineWidth=2; ctx.stroke();
    // capuz — sombra mais escura no topo
    ctx.fillStyle="#08081a";
    ctx.beginPath(); ctx.ellipse(C,C-18,17,20,0,0,Math.PI*2); ctx.fill();
    // olhos brilhantes dentro do capuz
    glowEye(ctx, C-7, C-18, 4.2, "#7fe0ff");
    glowEye(ctx, C+7, C-18, 4.2, "#7fe0ff");
    tex.refresh();
  }

  // ── 4) Poluidor Mecânico — robô industrial enferrujado, com chaminé ─
  if(!scene.textures.exists("boss_poluidor_mecanico")){
    const tex=scene.textures.createCanvas("boss_poluidor_mecanico",S,S), ctx=tex.getContext();
    bossShadow(ctx);
    // fumo estático por cima da chaminé
    ctx.fillStyle="rgba(120,120,110,0.45)";
    [[C-2,C-46,7],[C+3,C-54,9],[C-4,C-62,7]].forEach(([x,y,r])=>{
      ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
    });
    // chaminé
    ctx.fillStyle="#5a5a4a";
    ctx.fillRect(C-6,C-40,12,20);
    ctx.strokeStyle="#2a2a20"; ctx.lineWidth=1.5; ctx.strokeRect(C-6,C-40,12,20);
    // corpo — caixa metálica com gradiente oliva/ferrugem
    const gr=ctx.createLinearGradient(C-30,C-22,C+30,C+26);
    gr.addColorStop(0,"#9aa878"); gr.addColorStop(0.5,"#7a8a5c"); gr.addColorStop(1,"#5a6440");
    ctx.fillStyle=gr;
    rrPath(ctx,C-30,C-22,60,48,8); ctx.fill();
    ctx.strokeStyle="#3a4028"; ctx.lineWidth=2.5; ctx.stroke();
    // rebites
    ctx.fillStyle="#2f3320";
    [[-24,-16],[24,-16],[-24,20],[24,20]].forEach(([dx,dy])=>{
      ctx.beginPath(); ctx.arc(C+dx,C+dy,2.2,0,Math.PI*2); ctx.fill();
    });
    // engrenagens nos ombros
    [[-30,-2],[30,-2]].forEach(([dx,dy])=>{
      const gx=C+dx, gy=C+dy;
      ctx.fillStyle="#4a4a3a";
      for(let i=0;i<8;i++){
        const a=(Math.PI*2*i)/8;
        ctx.save(); ctx.translate(gx,gy); ctx.rotate(a);
        ctx.fillRect(-2,-11,4,5);
        ctx.restore();
      }
      ctx.beginPath(); ctx.arc(gx,gy,7,0,Math.PI*2); ctx.fill();
      ctx.fillStyle="#8a8a70"; ctx.beginPath(); ctx.arc(gx,gy,3,0,Math.PI*2); ctx.fill();
    });
    // olho único robótico, vermelho
    glowEye(ctx, C, C-2, 7, "#ff4030");
    // grelha/boca de ventilação
    ctx.strokeStyle="#2f3320"; ctx.lineWidth=2;
    for(let i=0;i<3;i++){
      ctx.beginPath(); ctx.moveTo(C-10,C+14+i*4); ctx.lineTo(C+10,C+14+i*4); ctx.stroke();
    }
    tex.refresh();
  }
  // ── Projéteis do Monstro da Ignorância — livro bom vs. livro mau ────
  // Muito diferentes ao olhar: dourado/brilhante vs. escuro/rabiscado com X vermelho.
  if(!scene.textures.exists("boss_proj_book")){
    const w=34,h=28,tex=scene.textures.createCanvas("boss_proj_book",w,h), ctx=tex.getContext();
    ctx.shadowColor="rgba(255,220,80,0.8)"; ctx.shadowBlur=9;
    // capa
    const gr=ctx.createLinearGradient(2,2,w-2,h-2);
    gr.addColorStop(0,"#fff2b0"); gr.addColorStop(0.5,"#ffd23f"); gr.addColorStop(1,"#e08a00");
    ctx.fillStyle=gr; rrPath(ctx,2,2,w-4,h-4,4); ctx.fill();
    ctx.shadowBlur=0;
    ctx.strokeStyle="#8a5200"; ctx.lineWidth=2; ctx.stroke();
    // lombada
    ctx.strokeStyle="rgba(138,82,0,0.6)"; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.moveTo(w/2,3); ctx.lineTo(w/2,h-3); ctx.stroke();
    // páginas
    ctx.fillStyle="#fffdf0";
    ctx.fillRect(5,6,w/2-6,h-12); ctx.fillRect(w/2+1,6,w/2-6,h-12);
    // brilho de "conhecimento"
    ctx.fillStyle="rgba(255,255,255,0.55)";
    ctx.beginPath(); ctx.ellipse(9,8,4,3,Math.PI/4,0,Math.PI*2); ctx.fill();
    tex.refresh();
  }
  if(!scene.textures.exists("boss_proj_badbook")){
    const w=34,h=28,tex=scene.textures.createCanvas("boss_proj_badbook",w,h), ctx=tex.getContext();
    const gr=ctx.createLinearGradient(2,2,w-2,h-2);
    gr.addColorStop(0,"#5a4a5c"); gr.addColorStop(0.5,"#3a2a3c"); gr.addColorStop(1,"#1a0e1c");
    ctx.fillStyle=gr; rrPath(ctx,2,2,w-4,h-4,4); ctx.fill();
    ctx.strokeStyle="#0a050a"; ctx.lineWidth=2; ctx.stroke();
    // rabiscos confusos
    ctx.strokeStyle="rgba(180,160,190,0.5)"; ctx.lineWidth=1;
    for(let i=0;i<3;i++){ ctx.beginPath(); ctx.moveTo(6,9+i*5); ctx.lineTo(16,7+i*6); ctx.stroke(); }
    // aviso — X vermelho bem visível
    ctx.shadowColor="rgba(255,40,40,0.7)"; ctx.shadowBlur=6;
    ctx.strokeStyle="#ff3030"; ctx.lineWidth=3.5; ctx.lineCap="round";
    ctx.beginPath(); ctx.moveTo(w-15,7); ctx.lineTo(w-3,19); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(w-3,7); ctx.lineTo(w-15,19); ctx.stroke();
    ctx.shadowBlur=0;
    tex.refresh();
  }
  // ── Bola ❓ do Monstro da Ignorância (redesenho) — rola devagar pelo chão,
  // saltitando um pouco, em vez de voar direto à cabeça. Lenta e fácil de
  // ver/evitar de propósito — nada de "aviso vermelho" agressivo aqui.
  if(!scene.textures.exists("boss_proj_qmark")){
    const w=30,h=30,tex=scene.textures.createCanvas("boss_proj_qmark",w,h), ctx=tex.getContext();
    const gr=ctx.createRadialGradient(w/2-4,h/2-4,2,w/2,h/2,15);
    gr.addColorStop(0,"#c8aeff"); gr.addColorStop(0.6,"#8a5cff"); gr.addColorStop(1,"#5228b0");
    ctx.fillStyle=gr;
    ctx.beginPath(); ctx.arc(w/2,h/2,13,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle="#2a1060"; ctx.lineWidth=2; ctx.stroke();
    ctx.fillStyle="#fff8ff"; ctx.font="bold 15px sans-serif"; ctx.textAlign="center"; ctx.textBaseline="middle";
    ctx.fillText("?", w/2, h/2+1);
    ctx.textBaseline="alphabetic";
    tex.refresh();
  }
}

function makeSparkTexture(scene){
  if(scene.textures.exists("spark_item")) return;
  const g=scene.make.graphics({x:0,y:0,add:false});
  g.fillStyle(0xffd700,1);
  g.beginPath();
  for(let _i=0;_i<5;_i++){
    const _o=Math.PI*2*_i/5-Math.PI/2, _in=_o+Math.PI/5;
    _i===0?g.moveTo(8+Math.cos(_o)*8,8+Math.sin(_o)*8):g.lineTo(8+Math.cos(_o)*8,8+Math.sin(_o)*8);
    g.lineTo(8+Math.cos(_in)*3,8+Math.sin(_in)*3);
  }
  g.closePath(); g.fillPath();
  g.generateTexture("spark_item",16,16); g.destroy();
}

function makeItemTextures(scene){
  // Estrela
  if(!scene.textures.exists("item_estrela")){
    const tex=scene.textures.createCanvas("item_estrela",36,36), ctx=tex.getContext();
    // Sombra escura por baixo para contraste com qualquer fundo
    ctx.fillStyle="rgba(0,0,0,0.35)"; ctx.shadowColor="rgba(0,0,0,0.5)"; ctx.shadowBlur=6;
    ctx.save(); ctx.translate(18,20);
    ctx.beginPath();
    for(let j=0;j<5;j++){
      const o=Math.PI*2*j/5-Math.PI/2, i=o+Math.PI/5;
      j===0?ctx.moveTo(Math.cos(o)*16,Math.sin(o)*16):ctx.lineTo(Math.cos(o)*16,Math.sin(o)*16);
      ctx.lineTo(Math.cos(i)*7,Math.sin(i)*7);
    }
    ctx.closePath(); ctx.fill(); ctx.restore(); ctx.shadowBlur=0;
    // Estrela principal
    ctx.fillStyle="#ffd700"; ctx.shadowColor="#ff6b35"; ctx.shadowBlur=8;
    ctx.save(); ctx.translate(18,18);
    ctx.beginPath();
    for(let j=0;j<5;j++){
      const o=Math.PI*2*j/5-Math.PI/2, i=o+Math.PI/5;
      j===0?ctx.moveTo(Math.cos(o)*16,Math.sin(o)*16):ctx.lineTo(Math.cos(o)*16,Math.sin(o)*16);
      ctx.lineTo(Math.cos(i)*7,Math.sin(i)*7);
    }
    ctx.closePath(); ctx.fill();
    // Contorno escuro
    ctx.strokeStyle="rgba(100,60,0,0.7)"; ctx.lineWidth=2;
    ctx.beginPath();
    for(let j=0;j<5;j++){
      const o=Math.PI*2*j/5-Math.PI/2, i=o+Math.PI/5;
      j===0?ctx.moveTo(Math.cos(o)*16,Math.sin(o)*16):ctx.lineTo(Math.cos(o)*16,Math.sin(o)*16);
      ctx.lineTo(Math.cos(i)*7,Math.sin(i)*7);
    }
    ctx.closePath(); ctx.stroke();
    ctx.restore(); ctx.shadowBlur=0;
    ctx.fillStyle="rgba(255,255,255,0.5)"; ctx.beginPath(); ctx.arc(13,11,4,0,Math.PI*2); ctx.fill();
    tex.refresh();
  }
  // Balões 🎈 flutuantes — 6 cores
  const BALAO_COLORS=[
    {hi:"#ff9080", lo:"#e84d10", stroke:"#b03000"}, // laranja-vermelho
    {hi:"#ffe080", lo:"#ffd700", stroke:"#b09000"}, // amarelo
    {hi:"#ff90d0", lo:"#e0209a", stroke:"#900060"}, // rosa
    {hi:"#90d0ff", lo:"#1a90e0", stroke:"#005090"}, // azul
    {hi:"#90ffb0", lo:"#20c060", stroke:"#008030"}, // verde
    {hi:"#d0a0ff", lo:"#9030e0", stroke:"#500090"}, // lilás
  ];
  BALAO_COLORS.forEach((bc,ci)=>{
    const key="item_balao_"+ci;
    if(scene.textures.exists(key)) return;
    const tex=scene.textures.createCanvas(key,32,46), ctx=tex.getContext();
    // Corpo do balão
    const gr=ctx.createRadialGradient(10,11,2,16,16,14);
    gr.addColorStop(0,bc.hi); gr.addColorStop(1,bc.lo);
    ctx.fillStyle=gr;
    ctx.beginPath(); ctx.ellipse(16,16,13,15,0,0,Math.PI*2); ctx.fill();
    // Contorno
    ctx.strokeStyle=bc.stroke; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.ellipse(16,16,13,15,0,0,Math.PI*2); ctx.stroke();
    // Brilho oval
    ctx.fillStyle="rgba(255,255,255,0.55)";
    ctx.beginPath(); ctx.ellipse(10,9,4,6,Math.PI/4,0,Math.PI*2); ctx.fill();
    // Brilho pequeno secundário
    ctx.fillStyle="rgba(255,255,255,0.25)";
    ctx.beginPath(); ctx.ellipse(20,11,2.5,3.5,Math.PI/5,0,Math.PI*2); ctx.fill();
    // Nozinho na base
    ctx.fillStyle=bc.lo;
    ctx.beginPath(); ctx.arc(16,31,3,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle=bc.stroke; ctx.lineWidth=1; ctx.stroke();
    // Fio
    ctx.strokeStyle=bc.stroke; ctx.lineWidth=1.2;
    ctx.beginPath(); ctx.moveTo(16,31);
    ctx.quadraticCurveTo(18,38,16,44); ctx.stroke();
    tex.refresh();
  });
  // Chupa-chupa 🍭 — desenhado em Canvas (consistente com todos os outros itens)
  if(!scene.textures.exists("item_chupachupa")){
    const tex=scene.textures.createCanvas("item_chupachupa",52,56), ctx=tex.getContext();
    const cx=26, cy=20;

    // Halo exterior colorido (brilho de candy)
    const haloGr = ctx.createRadialGradient(cx,cy,12,cx,cy,22);
    haloGr.addColorStop(0,"rgba(255,100,200,0)");
    haloGr.addColorStop(0.6,"rgba(255,80,180,0.22)");
    haloGr.addColorStop(1,"rgba(255,200,80,0.0)");
    ctx.fillStyle=haloGr;
    ctx.beginPath(); ctx.arc(cx,cy,22,0,Math.PI*2); ctx.fill();

    // Cabo — listrado como bastão de Natal (vermelho e branco alternados)
    for(let ri=0; ri<5; ri++){
      ctx.fillStyle = ri%2===0 ? "#ff1a44" : "#fff5f8";
      ctx.beginPath();
      ctx.roundRect(cx-4, cy+12+ri*5, 8, 6, ri===0?[3,3,0,0]:ri===4?[0,0,3,3]:[0]);
      ctx.fill();
    }
    // Brilho no cabo (lateral esquerda)
    ctx.fillStyle="rgba(255,255,255,0.45)";
    ctx.fillRect(cx-3, cy+13, 2, 22);
    // Contorno do cabo
    ctx.strokeStyle="#cc0030"; ctx.lineWidth=1.4;
    ctx.beginPath(); ctx.roundRect(cx-4,cy+12,8,28,3); ctx.stroke();

    // Sombra suave por baixo do berlinde
    ctx.fillStyle="rgba(180,0,80,0.20)";
    ctx.beginPath(); ctx.ellipse(cx+3,cy+5,15,5,0,0,Math.PI*2); ctx.fill();

    // Berlinde — 6 fatias arco-íris bem saturadas
    const sliceColors=[
      "#ff1a44",  // vermelho vivo
      "#ff8c00",  // laranja
      "#ffe600",  // amarelo
      "#00cc44",  // verde
      "#0088ff",  // azul
      "#cc00ff",  // violeta
    ];
    ctx.save(); ctx.translate(cx,cy);
    // Clip ao círculo para as fatias não saírem
    ctx.beginPath(); ctx.arc(0,0,17,0,Math.PI*2); ctx.clip();
    for(let si=0;si<6;si++){
      ctx.fillStyle=sliceColors[si];
      ctx.beginPath();
      ctx.moveTo(0,0);
      ctx.arc(0,0,17, si*Math.PI/3 - Math.PI*0.015, (si+1)*Math.PI/3 + Math.PI*0.015);
      ctx.closePath(); ctx.fill();
    }
    // Espiral branca por cima das fatias (dá o aspeto de twist clássico)
    ctx.strokeStyle="rgba(255,255,255,0.70)";
    ctx.lineWidth=3.5;
    ctx.lineCap="round";
    ctx.beginPath();
    for(let t=0; t<=Math.PI*1.7; t+=0.06){
      const r = t / (Math.PI*1.7) * 15;
      const x2 = Math.cos(t) * r;
      const y2 = Math.sin(t) * r;
      t===0 ? ctx.moveTo(x2,y2) : ctx.lineTo(x2,y2);
    }
    ctx.stroke();
    ctx.restore();

    // Contorno do berlinde — grosso e escuro para destacar
    ctx.shadowColor="rgba(180,0,80,0.55)"; ctx.shadowBlur=8;
    ctx.strokeStyle="#990022"; ctx.lineWidth=2.5;
    ctx.beginPath(); ctx.arc(cx,cy,17,0,Math.PI*2); ctx.stroke();
    ctx.shadowBlur=0;

    // Brilho principal (oval branco grande no canto sup. esq.)
    ctx.fillStyle="rgba(255,255,255,0.62)";
    ctx.beginPath(); ctx.ellipse(cx-6,cy-7,7,9,Math.PI*0.35,0,Math.PI*2); ctx.fill();
    // Brilho secundário mais pequeno
    ctx.fillStyle="rgba(255,255,255,0.38)";
    ctx.beginPath(); ctx.ellipse(cx-4,cy-12,3.5,4.5,Math.PI*0.3,0,Math.PI*2); ctx.fill();
    // Ponto de luz vivo no centro do brilho
    ctx.fillStyle="rgba(255,255,255,0.85)";
    ctx.beginPath(); ctx.arc(cx-8,cy-9,2.5,0,Math.PI*2); ctx.fill();

    tex.refresh();
  }
  // Brinquedo — ursinho de peluche 🧸 completo (com pernas)
  if(!scene.textures.exists("item_brinquedo")){
    const tex=scene.textures.createCanvas("item_brinquedo",44,48), ctx=tex.getContext();
    const C="#c07030", CL="#e8a860", CI="#e8905a", CD="#8b4a00";

    // --- PERNAS (atrás do corpo) ---
    ctx.fillStyle=C;
    ctx.beginPath(); ctx.ellipse(14,41,5,6,Math.PI*0.08,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(30,41,5,6,-Math.PI*0.08,0,Math.PI*2); ctx.fill();
    // Patinhas
    ctx.fillStyle=CI;
    ctx.beginPath(); ctx.ellipse(14,46,5,3,0,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(30,46,5,3,0,0,Math.PI*2); ctx.fill();

    // --- CORPO ---
    const bodyGr=ctx.createRadialGradient(19,28,2,22,28,14);
    bodyGr.addColorStop(0,CL); bodyGr.addColorStop(1,C);
    ctx.beginPath(); ctx.ellipse(22,29,13,12,0,0,Math.PI*2); ctx.fillStyle=bodyGr; ctx.fill();
    // Barriga clara
    ctx.beginPath(); ctx.ellipse(22,31,7,6,0,0,Math.PI*2); ctx.fillStyle="rgba(255,220,160,0.75)"; ctx.fill();

    // --- BRAÇOS ---
    ctx.fillStyle=C;
    ctx.beginPath(); ctx.ellipse(10,27,4,6,Math.PI*0.2,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(34,27,4,6,-Math.PI*0.2,0,Math.PI*2); ctx.fill();
    // Mãozinhas
    ctx.fillStyle=CI;
    ctx.beginPath(); ctx.arc(8,31,3.5,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(36,31,3.5,0,Math.PI*2); ctx.fill();

    // --- CABEÇA ---
    const headGr=ctx.createRadialGradient(19,15,2,22,16,11);
    headGr.addColorStop(0,CL); headGr.addColorStop(1,C);
    ctx.beginPath(); ctx.arc(22,16,11,0,Math.PI*2); ctx.fillStyle=headGr; ctx.fill();

    // Orelhas
    ctx.fillStyle=C;
    ctx.beginPath(); ctx.arc(13,8,5.5,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(31,8,5.5,0,Math.PI*2); ctx.fill();
    ctx.fillStyle=CI;
    ctx.beginPath(); ctx.arc(13,8,3,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(31,8,3,0,Math.PI*2); ctx.fill();

    // Focinho
    ctx.beginPath(); ctx.ellipse(22,20,5.5,4,0,0,Math.PI*2); ctx.fillStyle="#d08050"; ctx.fill();
    // Nariz
    ctx.beginPath(); ctx.arc(22,17.5,2.5,0,Math.PI*2); ctx.fillStyle="#2a1000"; ctx.fill();
    // Boca
    ctx.strokeStyle="#2a1000"; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.moveTo(19,21); ctx.quadraticCurveTo(22,24,25,21); ctx.stroke();

    // Olhos brilhantes
    ctx.fillStyle="#2a1000";
    ctx.beginPath(); ctx.arc(17,14,2.8,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(27,14,2.8,0,Math.PI*2); ctx.fill();
    ctx.fillStyle="#ffffff";
    ctx.beginPath(); ctx.arc(18,13,1.1,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(28,13,1.1,0,Math.PI*2); ctx.fill();

    // Contornos suaves
    ctx.strokeStyle=CD; ctx.lineWidth=1.3;
    ctx.beginPath(); ctx.arc(22,16,11,0,Math.PI*2); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(22,29,13,12,0,0,Math.PI*2); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(14,41,5,6,Math.PI*0.08,0,Math.PI*2); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(30,41,5,6,-Math.PI*0.08,0,Math.PI*2); ctx.stroke();
    tex.refresh();
  }
  // Escudo — canvas 52×58, forma classica de escudo heraldico
  if(!scene.textures.exists("item_medalha")){
    const tex=scene.textures.createCanvas("item_medalha",52,58), ctx=tex.getContext();
    const cx=26, cy=26;

    // Funcao auxiliar para desenhar a forma do escudo
    function shieldPath(ctx, x, y, w, h){
      const r=w*0.18;
      ctx.beginPath();
      ctx.moveTo(x+r, y);
      ctx.lineTo(x+w-r, y);
      ctx.quadraticCurveTo(x+w, y, x+w, y+r);
      ctx.lineTo(x+w, y+h*0.55);
      // Curva inferior que forma a ponta do escudo
      ctx.quadraticCurveTo(x+w, y+h*0.82, x+w/2, y+h);
      ctx.quadraticCurveTo(x, y+h*0.82, x, y+h*0.55);
      ctx.lineTo(x, y+r);
      ctx.quadraticCurveTo(x, y, x+r, y);
      ctx.closePath();
    }

    // Sombra exterior
    ctx.shadowColor="rgba(255,215,0,0.55)"; ctx.shadowBlur=8;
    // Borda exterior dourada
    const borderGr=ctx.createLinearGradient(0,0,0,54);
    borderGr.addColorStop(0,"#ffe060"); borderGr.addColorStop(1,"#c07000");
    ctx.fillStyle=borderGr; shieldPath(ctx,1,1,50,54); ctx.fill();
    ctx.shadowBlur=0;

    // Corpo do escudo — gradiente azul real
    const bodyGr=ctx.createLinearGradient(4,4,4,50);
    bodyGr.addColorStop(0,"#4a90e8"); bodyGr.addColorStop(0.5,"#1a50b8"); bodyGr.addColorStop(1,"#0a2878");
    ctx.fillStyle=bodyGr; shieldPath(ctx,4,4,44,50); ctx.fill();

    // Reflexo de luz no topo esquerdo
    ctx.fillStyle="rgba(255,255,255,0.28)";
    ctx.beginPath(); ctx.ellipse(16,14,9,13,Math.PI*0.15,0,Math.PI*2); ctx.fill();

    // Divisao central horizontal (cruz do escudo — faixa horizontal)
    ctx.fillStyle="rgba(255,215,0,0.22)";
    ctx.fillRect(4,24,44,6);
    // Divisao central vertical
    ctx.fillRect(23,4,6,50);

    // Estrela dourada no centro
    ctx.save(); ctx.translate(cx, cy+4);
    ctx.shadowColor="#ffd700"; ctx.shadowBlur=6;
    const sg=ctx.createRadialGradient(-1,-2,1,0,0,10);
    sg.addColorStop(0,"#ffffff"); sg.addColorStop(0.35,"#ffe060"); sg.addColorStop(1,"#ffa000");
    ctx.fillStyle=sg;
    ctx.beginPath();
    for(let j=0;j<5;j++){
      const o=Math.PI*2*j/5-Math.PI/2, inn=o+Math.PI/5;
      j===0?ctx.moveTo(Math.cos(o)*11,Math.sin(o)*11):ctx.lineTo(Math.cos(o)*11,Math.sin(o)*11);
      ctx.lineTo(Math.cos(inn)*5,Math.sin(inn)*5);
    }
    ctx.closePath(); ctx.fill();
    ctx.shadowBlur=0;
    ctx.restore();

    // Contorno exterior dourado
    ctx.strokeStyle="#ffd700"; ctx.lineWidth=2.5;
    shieldPath(ctx,4,4,44,50); ctx.stroke();
    // Linha de brilho interior
    ctx.strokeStyle="rgba(255,255,255,0.35)"; ctx.lineWidth=1.2;
    shieldPath(ctx,7,7,38,44); ctx.stroke();

    tex.refresh();
  }
  // Livro do saber — 46×44, item de recolha do Monstro da Ignorância (fase "collect").
  // Reaproveita a paleta dourada/brilhante do projétil "boss_proj_book", mas maior
  // e com mais detalhe (páginas abertas), para não parecer um projétil a voar.
  if(!scene.textures.exists("item_livro")){
    const w=46,h=44,tex=scene.textures.createCanvas("item_livro",w,h), ctx=tex.getContext();
    ctx.save(); ctx.translate(w/2,h/2+2);
    ctx.shadowColor="rgba(255,220,80,0.75)"; ctx.shadowBlur=9;
    // capa de trás (levemente rodada, dá volume ao livro aberto)
    ctx.fillStyle="#c07a10";
    ctx.beginPath(); ctx.ellipse(0,2,19,13,0,0,Math.PI*2); ctx.fill();
    ctx.shadowBlur=0;
    // página esquerda
    const grL=ctx.createLinearGradient(-19,-10,0,10);
    grL.addColorStop(0,"#fffdf0"); grL.addColorStop(1,"#ffe9a0");
    ctx.fillStyle=grL;
    ctx.beginPath();
    ctx.moveTo(0,-11); ctx.quadraticCurveTo(-20,-14,-19,0); ctx.quadraticCurveTo(-20,14,0,11); ctx.closePath(); ctx.fill();
    // página direita
    const grR=ctx.createLinearGradient(0,-10,19,10);
    grR.addColorStop(0,"#ffe9a0"); grR.addColorStop(1,"#fffdf0");
    ctx.fillStyle=grR;
    ctx.beginPath();
    ctx.moveTo(0,-11); ctx.quadraticCurveTo(20,-14,19,0); ctx.quadraticCurveTo(20,14,0,11); ctx.closePath(); ctx.fill();
    // lombada central
    ctx.strokeStyle="#8a5200"; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(0,-11); ctx.lineTo(0,11); ctx.stroke();
    // linhas de texto simuladas em cada página
    ctx.strokeStyle="rgba(138,82,0,0.45)"; ctx.lineWidth=1;
    for(let i=0;i<3;i++){
      ctx.beginPath(); ctx.moveTo(-15,-5+i*5); ctx.lineTo(-3,-5+i*5); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(3,-5+i*5); ctx.lineTo(15,-5+i*5); ctx.stroke();
    }
    // contorno geral
    ctx.strokeStyle="#8a5200"; ctx.lineWidth=1.6;
    ctx.beginPath();
    ctx.moveTo(0,-11); ctx.quadraticCurveTo(-20,-14,-19,0); ctx.quadraticCurveTo(-20,14,0,11);
    ctx.quadraticCurveTo(20,14,19,0); ctx.quadraticCurveTo(20,-14,0,-11); ctx.stroke();
    // brilho de "conhecimento" a saltar do livro
    ctx.fillStyle="rgba(255,255,255,0.6)";
    ctx.beginPath(); ctx.ellipse(-9,-8,3,2.2,Math.PI/4,0,Math.PI*2); ctx.fill();
    ctx.restore();
    tex.refresh();
  }
  // Ícones de "conhecimento" — lápis, diploma, lâmpada — desenhados a partir do
  // próprio emoji (glow por trás), para dar variedade rápida ao Monstro da
  // Ignorância sem ter de desenhar 3 ícones vetoriais à mão. Junta-se ao
  // item_livro já existente para formar o conjunto de 4 usado nesse combate.
  function makeEmojiItemTexture(scene, key, emoji, size = 44, glow = "rgba(255,220,80,0.75)") {
    if (scene.textures.exists(key)) return;
    const tex = scene.textures.createCanvas(key, size, size), ctx = tex.getContext();
    ctx.save();
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.font = `${Math.round(size*0.78)}px sans-serif`;
    ctx.shadowColor = glow; ctx.shadowBlur = 10;
    ctx.fillText(emoji, size/2, size/2+2);
    ctx.restore();
    tex.refresh();
  }
  makeEmojiItemTexture(scene, "item_lapis",   "✏️", 44, "rgba(255,180,80,0.75)");
  makeEmojiItemTexture(scene, "item_diploma", "🎓", 46, "rgba(160,140,255,0.75)");
  makeEmojiItemTexture(scene, "item_lampada", "💡", 44, "rgba(255,240,120,0.85)");
  // Borboleta — 48×40, asas coloridas com padrão
  const BUTTERFLY_COLORS=[
    {top:"#ff80c0",bot:"#e0209a",pat:"#ffd700",stroke:"#800040"}, // rosa
    {top:"#80d0ff",bot:"#1a90e0",pat:"#ffffff",stroke:"#004090"}, // azul
    {top:"#a0ff80",bot:"#20c060",pat:"#ffd700",stroke:"#006030"}, // verde
    {top:"#ffd700",bot:"#ff9500",pat:"#ffffff",stroke:"#804000"}, // laranja-dourado
    {top:"#d0a0ff",bot:"#9030e0",pat:"#ffe080",stroke:"#400080"}, // lilás
  ];
  BUTTERFLY_COLORS.forEach((bc,ci)=>{
    const key="item_borboleta_"+ci;
    if(scene.textures.exists(key)) return;
    const tex=scene.textures.createCanvas(key,48,40), ctx=tex.getContext();
    // Asa superior esquerda
    const grTL=ctx.createRadialGradient(14,14,2,12,16,14);
    grTL.addColorStop(0,bc.top); grTL.addColorStop(1,bc.bot);
    ctx.fillStyle=grTL;
    ctx.beginPath(); ctx.moveTo(24,20);
    ctx.bezierCurveTo(20,8,2,4,2,16);
    ctx.bezierCurveTo(2,24,14,26,24,20);
    ctx.fill();
    // Asa superior direita
    const grTR=ctx.createRadialGradient(34,14,2,36,16,14);
    grTR.addColorStop(0,bc.top); grTR.addColorStop(1,bc.bot);
    ctx.fillStyle=grTR;
    ctx.beginPath(); ctx.moveTo(24,20);
    ctx.bezierCurveTo(28,8,46,4,46,16);
    ctx.bezierCurveTo(46,24,34,26,24,20);
    ctx.fill();
    // Asa inferior esquerda
    ctx.fillStyle=bc.bot;
    ctx.beginPath(); ctx.moveTo(24,20);
    ctx.bezierCurveTo(18,24,4,28,6,36);
    ctx.bezierCurveTo(8,40,20,36,24,20);
    ctx.fill();
    // Asa inferior direita
    ctx.beginPath(); ctx.moveTo(24,20);
    ctx.bezierCurveTo(30,24,44,28,42,36);
    ctx.bezierCurveTo(40,40,28,36,24,20);
    ctx.fill();
    // Padrões nas asas (círculos)
    ctx.fillStyle=bc.pat; ctx.globalAlpha=0.6;
    ctx.beginPath(); ctx.arc(13,14,4,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(35,14,4,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(11,28,3,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(37,28,3,0,Math.PI*2); ctx.fill();
    ctx.globalAlpha=1;
    // Contornos das asas
    ctx.strokeStyle=bc.stroke; ctx.lineWidth=1.2;
    ctx.beginPath(); ctx.moveTo(24,20);
    ctx.bezierCurveTo(20,8,2,4,2,16);
    ctx.bezierCurveTo(2,24,14,26,24,20); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(24,20);
    ctx.bezierCurveTo(28,8,46,4,46,16);
    ctx.bezierCurveTo(46,24,34,26,24,20); ctx.stroke();
    // Corpo (abdómen)
    ctx.fillStyle="#1a1a1a";
    ctx.beginPath(); ctx.ellipse(24,20,3,10,0,0,Math.PI*2); ctx.fill();
    // Cabeça
    ctx.fillStyle="#2a2a2a";
    ctx.beginPath(); ctx.arc(24,11,3,0,Math.PI*2); ctx.fill();
    // Antenas
    ctx.strokeStyle="#1a1a1a"; ctx.lineWidth=1.2;
    ctx.beginPath(); ctx.moveTo(24,9); ctx.quadraticCurveTo(18,2,14,1); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(24,9); ctx.quadraticCurveTo(30,2,34,1); ctx.stroke();
    ctx.fillStyle=bc.pat;
    ctx.beginPath(); ctx.arc(14,1,2.5,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(34,1,2.5,0,Math.PI*2); ctx.fill();
    tex.refresh();
  });

  // Abelha — 44×40, listras amarelas e pretas, asas transparentes
  if(!scene.textures.exists("item_abelha")){
    // Abelha desenhada na horizontal (como emoji 🐝): cabeça à direita, ferrão à esquerda
    // Canvas 56×36
    const tex=scene.textures.createCanvas("item_abelha",56,36), ctx=tex.getContext();
    const bx=28, by=18; // centro

    // --- ASAS (em cima do corpo, semi-transparentes) ---
    ctx.fillStyle="rgba(210,245,255,0.80)";
    ctx.strokeStyle="rgba(80,160,220,0.85)"; ctx.lineWidth=1;
    // Asa superior esquerda (maior)
    ctx.beginPath(); ctx.ellipse(bx-2, by-11, 11, 6, Math.PI*0.15, 0, Math.PI*2);
    ctx.fill(); ctx.stroke();
    // Asa superior direita (maior)
    ctx.beginPath(); ctx.ellipse(bx+10, by-11, 11, 6, -Math.PI*0.15, 0, Math.PI*2);
    ctx.fill(); ctx.stroke();
    // Asa inferior esquerda (menor)
    ctx.beginPath(); ctx.ellipse(bx-3, by-4, 7, 4, Math.PI*0.2, 0, Math.PI*2);
    ctx.fill(); ctx.stroke();
    // Asa inferior direita (menor)
    ctx.beginPath(); ctx.ellipse(bx+9, by-4, 7, 4, -Math.PI*0.2, 0, Math.PI*2);
    ctx.fill(); ctx.stroke();

    // --- ABDÓMEN (oval horizontal, listras) ---
    const abdGr=ctx.createRadialGradient(bx-6,by-2,2,bx-4,by,12);
    abdGr.addColorStop(0,"#ffe566"); abdGr.addColorStop(1,"#d49000");
    ctx.fillStyle=abdGr;
    ctx.beginPath(); ctx.ellipse(bx-6, by, 13, 9, 0, 0, Math.PI*2); ctx.fill();
    // Listras pretas horizontais (clip ao abdómen)
    ctx.save();
    ctx.beginPath(); ctx.ellipse(bx-6, by, 13, 9, 0, 0, Math.PI*2); ctx.clip();
    ctx.fillStyle="rgba(15,15,15,0.80)";
    [-4, 1, 6].forEach(dx=>{
      ctx.fillRect(bx-6+dx-1, by-9, 3, 18);
    });
    ctx.restore();
    // Contorno abdómen
    ctx.strokeStyle="#8a5500"; ctx.lineWidth=1.2;
    ctx.beginPath(); ctx.ellipse(bx-6, by, 13, 9, 0, 0, Math.PI*2); ctx.stroke();

    // --- FERRÃO (ponta à esquerda) ---
    ctx.fillStyle="#b07800";
    ctx.beginPath();
    ctx.moveTo(bx-19, by);
    ctx.lineTo(bx-14, by-3);
    ctx.lineTo(bx-14, by+3);
    ctx.closePath(); ctx.fill();

    // --- TÓRAX (peludo, ligação entre abdómen e cabeça) ---
    const torGr=ctx.createRadialGradient(bx+7,by-2,1,bx+8,by,7);
    torGr.addColorStop(0,"#a07020"); torGr.addColorStop(1,"#4a2800");
    ctx.fillStyle=torGr;
    ctx.beginPath(); ctx.ellipse(bx+8, by, 7, 8, 0, 0, Math.PI*2); ctx.fill();
    // Pelos do tórax
    ctx.strokeStyle="rgba(220,180,0,0.55)"; ctx.lineWidth=0.9;
    for(let pi=0;pi<6;pi++){
      const pa=Math.PI*2*pi/6;
      ctx.beginPath();
      ctx.moveTo(bx+8+Math.cos(pa)*5, by+Math.sin(pa)*6);
      ctx.lineTo(bx+8+Math.cos(pa)*8, by+Math.sin(pa)*9);
      ctx.stroke();
    }

    // --- CABEÇA (à direita, amarela) ---
    const headGr=ctx.createRadialGradient(bx+17,by-2,1,bx+18,by,7);
    headGr.addColorStop(0,"#fff0a0"); headGr.addColorStop(1,"#e8a800");
    ctx.fillStyle=headGr;
    ctx.beginPath(); ctx.arc(bx+18, by, 7, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle="#8a5500"; ctx.lineWidth=1.1; ctx.stroke();

    // Olho (único, virado para a direita)
    ctx.fillStyle="#1a1000";
    ctx.beginPath(); ctx.arc(bx+21, by-1, 2.8, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle="rgba(255,255,255,0.75)";
    ctx.beginPath(); ctx.arc(bx+22, by-2, 1.1, 0, Math.PI*2); ctx.fill();

    // Antena (saindo da cabeça para a direita/cima)
    ctx.strokeStyle="#5a3000"; ctx.lineWidth=1.3;
    ctx.beginPath(); ctx.moveTo(bx+22, by-6);
    ctx.quadraticCurveTo(bx+26, by-14, bx+28, by-16); ctx.stroke();
    ctx.fillStyle="#ffd700";
    ctx.beginPath(); ctx.arc(bx+28, by-16, 2.5, 0, Math.PI*2); ctx.fill();

    tex.refresh();
  }

  // Coração — vermelho vivo, grande, com brilho e gradiente
  if(!scene.textures.exists("item_heart")){
    const tex=scene.textures.createCanvas("item_heart",44,40), ctx=tex.getContext();
    const cx=22, cy=20;

    // Função para desenhar o coração centrado
    function heartPath(){
      ctx.beginPath();
      ctx.moveTo(cx, cy+12);
      // Lado esquerdo
      ctx.bezierCurveTo(cx-2, cy+10, cx-14, cy+4, cx-14, cy-4);
      ctx.bezierCurveTo(cx-14, cy-13, cx-6, cy-15, cx, cy-8);
      // Lado direito
      ctx.bezierCurveTo(cx+6, cy-15, cx+14, cy-13, cx+14, cy-4);
      ctx.bezierCurveTo(cx+14, cy+4, cx+2, cy+10, cx, cy+12);
      ctx.closePath();
    }

    // Sombra exterior rosada
    ctx.shadowColor="rgba(255,80,80,0.55)"; ctx.shadowBlur=10;
    const hg=ctx.createRadialGradient(cx-3,cy-5,2,cx,cy,16);
    hg.addColorStop(0,"#ff6080");
    hg.addColorStop(0.4,"#ff2040");
    hg.addColorStop(0.8,"#cc0020");
    hg.addColorStop(1,"#990010");
    ctx.fillStyle=hg;
    heartPath(); ctx.fill();
    ctx.shadowBlur=0;

    // Contorno fino
    ctx.strokeStyle="rgba(140,0,20,0.5)"; ctx.lineWidth=1.2;
    heartPath(); ctx.stroke();

    // Brilho principal (oval branco no canto superior esquerdo)
    ctx.fillStyle="rgba(255,255,255,0.55)";
    ctx.beginPath(); ctx.ellipse(cx-5,cy-6,5,7,Math.PI*0.35,0,Math.PI*2); ctx.fill();

    // Brilho secundário (pequeno)
    ctx.fillStyle="rgba(255,255,255,0.30)";
    ctx.beginPath(); ctx.ellipse(cx+4,cy-3,3,4,Math.PI*0.2,0,Math.PI*2); ctx.fill();

    tex.refresh();
  }

  // Duplo Salto — asa azul luminosa com fundo circular
  if(!scene.textures.exists("item_duplosalto")){
    const tex=scene.textures.createCanvas("item_duplosalto",64,56), ctx=tex.getContext();
    const cx=32, cy=30;

    // ── Fundo circular azul-celeste ────────────────────────────
    const bg=ctx.createRadialGradient(cx,cy,1,cx,cy,24);
    bg.addColorStop(0,"#eaf9ff"); bg.addColorStop(0.4,"#7dd6ff");
    bg.addColorStop(0.85,"#1a8fe0"); bg.addColorStop(1,"#0050a0");
    ctx.fillStyle=bg;
    ctx.beginPath(); ctx.arc(cx,cy,24,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle="rgba(255,255,255,0.80)"; ctx.lineWidth=2;
    ctx.beginPath(); ctx.arc(cx,cy,23,0,Math.PI*2); ctx.stroke();

    // ── Desenho de asa (reutilizável para esq. e dir.) ─────────
    function wing(dir) { // dir = -1 esq, +1 dir
      ctx.save();
      ctx.translate(cx + dir*3, cy+2);
      ctx.scale(dir, 1);

      // Silhueta principal da asa — forma de asa de anjo
      const wg = ctx.createLinearGradient(0,-14,26,4);
      wg.addColorStop(0,"#fffbe0");
      wg.addColorStop(0.45,"#ffd740");
      wg.addColorStop(1,"#e08000");
      ctx.fillStyle = wg;
      ctx.beginPath();
      ctx.moveTo(0, 4);                         // base interior
      ctx.bezierCurveTo( 4,  4,  8, -2, 12,-10); // bordo superior
      ctx.bezierCurveTo(18,-16, 26,-14, 28, -6); // ponta da asa
      ctx.bezierCurveTo(24,  2, 16,  6,  8,  8); // bordo inferior
      ctx.bezierCurveTo( 4,  8,  0,  6,  0,  4);
      ctx.closePath();
      ctx.fill();

      // Contorno fino
      ctx.strokeStyle="rgba(160,80,0,0.50)"; ctx.lineWidth=0.8;
      ctx.stroke();

      // ── 4 penas sobrepostas ──────────────────────────────────
      const penas = [
        {x:4,  y:2,  a:-0.30, l:12, w:3.2},
        {x:9,  y:-2, a:-0.52, l:14, w:3.5},
        {x:15, y:-6, a:-0.72, l:14, w:3.2},
        {x:21, y:-9, a:-0.88, l:11, w:2.6},
      ];
      penas.forEach((p,i)=>{
        const t = i/3;
        const c1 = `rgba(255,${245-i*20},${100-i*15},0.95)`;
        const c2 = `rgba(255,${220-i*20},${60-i*10},0)`;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.a);
        const fg=ctx.createLinearGradient(0,-p.w/2, p.l, p.w/2);
        fg.addColorStop(0,c1); fg.addColorStop(0.6,c1); fg.addColorStop(1,c2);
        ctx.fillStyle=fg;
        // Pena com forma ligeiramente arqueada
        ctx.beginPath();
        ctx.moveTo(0,0);
        ctx.bezierCurveTo(p.l*0.3,-p.w*0.7, p.l*0.7,-p.w*0.5, p.l,0);
        ctx.bezierCurveTo(p.l*0.7, p.w*0.5, p.l*0.3, p.w*0.7, 0,0);
        ctx.fill();
        // Veia central
        ctx.strokeStyle="rgba(200,120,0,0.35)"; ctx.lineWidth=0.7;
        ctx.beginPath(); ctx.moveTo(1,0); ctx.lineTo(p.l-2,0); ctx.stroke();
        ctx.restore();
      });

      // Brilho topo da asa
      ctx.fillStyle="rgba(255,255,255,0.30)";
      ctx.beginPath();
      ctx.moveTo(2, 2);
      ctx.bezierCurveTo(5,-6, 14,-12, 20,-8);
      ctx.bezierCurveTo(14,-5, 6,-2, 2, 2);
      ctx.fill();

      ctx.restore();
    }

    wing(-1); // asa esquerda
    wing(1);  // asa direita

    // ── Setas ↑↑ douradas com contorno ────────────────────────
    [[cy-8],[cy+2]].forEach(([ay])=>{
      ctx.fillStyle="#ffe040"; ctx.strokeStyle="#7a4000"; ctx.lineWidth=1.2;
      ctx.beginPath();
      ctx.moveTo(cx,     ay-5);   // ponta
      ctx.lineTo(cx-5,   ay+1);
      ctx.lineTo(cx-2.5, ay+1);
      ctx.lineTo(cx-2.5, ay+5);
      ctx.lineTo(cx+2.5, ay+5);
      ctx.lineTo(cx+2.5, ay+1);
      ctx.lineTo(cx+5,   ay+1);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
    });

    // Brilho central
    ctx.fillStyle="rgba(255,255,255,0.55)";
    ctx.beginPath(); ctx.ellipse(cx,cy-6,5,4,0,0,Math.PI*2); ctx.fill();

    tex.refresh();
  }
}

// ===== VanBerto — robozinho 100% original do jogo da UE =====
function rrVan(ctx,x,y,w,h,r){
  const rr=Math.min(r,w/2,h/2);
  ctx.beginPath();ctx.moveTo(x+rr,y);ctx.arcTo(x+w,y,x+w,y+h,rr);ctx.arcTo(x+w,y+h,x,y+h,rr);ctx.arcTo(x,y+h,x,y,rr);ctx.arcTo(x,y,x+w,y,rr);ctx.closePath();
}
function cVan(ctx,x,y,r){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();}
function cfVan(ctx,x,y,r,color){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();}
function lVan(ctx,x1,y1,x2,y2){ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();}

function makeVanBertoTexture(scene,key,blink,step,armsUp){
  if(scene.textures.exists(key)) return;
  const w=96,h=96, tex=scene.textures.createCanvas(key,w,h), ctx=tex.getContext();
  ctx.clearRect(0,0,w,h);
  ctx.lineJoin="round"; ctx.lineCap="round";
  // Desloca todo o desenho 6px para baixo para o halo da antena (y≈0) não ser cortado.
  // O setOffset do corpo físico foi ajustado em igual medida para o robô ficar na mesma posição no ecrã.
  ctx.save(); ctx.translate(0, 6);
  const NAVY="#16233e", NAVY2="#26365a", OUT="#101a30";
  function white(x0,y0,x1,y1){const g=ctx.createLinearGradient(x0,y0,x1,y1);g.addColorStop(0,"#ffffff");g.addColorStop(0.55,"#e6edf7");g.addColorStop(1,"#b4c4dc");return g;}

  // ===== PERNAS (bem visíveis por baixo do tronco; passo marcado) =====
  const LIFT=8, STRIDE=3;
  let lTop=70, rTop=70, lDX=0, rDX=0;          // topo da coxa; planta=70 -> pé a y=88
  if(step===0){ lTop=70-LIFT; lDX=STRIDE; rDX=-STRIDE; }
  else if(step===1){ rTop=70-LIFT; rDX=STRIDE; lDX=-STRIDE; }
  function leg(cx,top){
    rrVan(ctx,cx-5,top,10,11,4.5); ctx.fillStyle=white(cx-5,top,cx+5,top); ctx.fill();
    ctx.lineWidth=2.6; ctx.strokeStyle=OUT; ctx.stroke();
    const fy=top+9;
    rrVan(ctx,cx-6.5,fy,13,9,4); ctx.fillStyle=NAVY; ctx.fill();
    ctx.lineWidth=2.6; ctx.strokeStyle=OUT; ctx.stroke();
    rrVan(ctx,cx-6.5,fy+2,13,2.4,1.2); ctx.fillStyle="rgba(255,255,255,0.85)"; ctx.fill();
    cfVan(ctx,cx-2.5,fy+4.5,1.4,"rgba(255,255,255,0.5)");
  }
  leg(41+lDX,lTop); leg(55+rDX,rTop);

  // ===== BRAÇOS (curtos e encostados; balançam ao contrário da perna do
  // mesmo lado — braço esquerdo para trás quando a perna esquerda avança,
  // tal como um passo natural — só nos frames de caminhar, step 0/1) =====
  // Frame de salto (armsUp=true): braços erguidos quase direitos para cima,
  // só com uma ligeira inclinação para fora — ignora o balanço de andar,
  // usa outro ângulo. (Era 2.4 rad, o que punha as mãos longe do corpo,
  // com um ar "descolado"; a 2.9 rad ficam coladas à cabeça, só saindo
  // ligeiramente para os lados.)
  const ARM_SWING = 0.24; // radianos
  const JUMP_RAISE = 2.9; // radianos — braço roda de "para baixo" para "quase direito para cima"
  let lArmSwing = 0, rArmSwing = 0;
  if(armsUp){ lArmSwing = JUMP_RAISE; rArmSwing = -JUMP_RAISE; }
  else if(step===0){ lArmSwing=-ARM_SWING; rArmSwing=ARM_SWING; }
  else if(step===1){ lArmSwing=ARM_SWING; rArmSwing=-ARM_SWING; }
  function arm(sx,swing){
    ctx.save();
    const px=sx+4.5, py=52; // pivô no ombro
    ctx.translate(px,py); ctx.rotate(swing); ctx.translate(-px,-py);
    rrVan(ctx,sx,52,9,13,4.5); ctx.fillStyle=white(sx,52,sx+9,52); ctx.fill();
    ctx.lineWidth=2.6; ctx.strokeStyle=OUT; ctx.stroke();
    const hx=sx+4.5, hy=67;
    cfVan(ctx,hx,hy,5,NAVY);
    ctx.lineWidth=2.3; ctx.strokeStyle=OUT; ctx.beginPath(); ctx.arc(hx,hy,5,0,Math.PI*2); ctx.stroke();
    cfVan(ctx,hx-2,hy+1.6,1.4,NAVY2); cfVan(ctx,hx+0.5,hy+2.4,1.4,NAVY2); cfVan(ctx,hx+2.5,hy+1.6,1.4,NAVY2);
    ctx.restore();
  }
  arm(17,lArmSwing); arm(70,rArmSwing);

  // ===== TRONCO (estreito: x26–70, igual à cabeça) =====
  rrVan(ctx,26,44,44,32,15); ctx.fillStyle=white(28,46,68,46); ctx.fill();
  ctx.save(); rrVan(ctx,26,44,44,32,15); ctx.clip();
  const wg=ctx.createLinearGradient(0,64,0,76); wg.addColorStop(0,"rgba(22,35,62,0)"); wg.addColorStop(0.4,"#1c2c4c"); wg.addColorStop(1,"#142038");
  ctx.fillStyle=wg; ctx.fillRect(26,62,44,16);
  ctx.strokeStyle="rgba(16,26,48,0.6)"; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(28,64); ctx.lineTo(68,64); ctx.stroke();
  ctx.fillStyle="rgba(255,255,255,0.5)"; ctx.beginPath(); ctx.ellipse(36,52,9,5.5,-0.5,0,Math.PI*2); ctx.fill();
  ctx.restore();
  ctx.lineWidth=3; ctx.strokeStyle=OUT; rrVan(ctx,26,44,44,32,15); ctx.stroke();

  // ===== PAINEL DO PEITO =====
  cfVan(ctx,48,56,8,NAVY);
  ctx.lineWidth=2.5; ctx.strokeStyle=OUT; ctx.beginPath(); ctx.arc(48,56,8,0,Math.PI*2); ctx.stroke();
  const dome=ctx.createRadialGradient(45.5,53.5,1,48,56,7); dome.addColorStop(0,"#aebccf"); dome.addColorStop(0.6,"#5a6a85"); dome.addColorStop(1,"#2b3a57");
  ctx.fillStyle=dome; ctx.beginPath(); ctx.arc(48,56,5.7,0,Math.PI*2); ctx.fill();
  cfVan(ctx,46,53.8,1.5,"rgba(255,255,255,0.85)");

  // ===== EAR PODS (atrás do capacete) =====
  function pod(cx){
    cfVan(ctx,cx,32,6,NAVY);
    ctx.lineWidth=2.3; ctx.strokeStyle=OUT; ctx.beginPath(); ctx.arc(cx,32,6,0,Math.PI*2); ctx.stroke();
    cfVan(ctx,cx,32,2.8,NAVY2); cfVan(ctx,cx-0.8,31,1,"rgba(255,255,255,0.6)");
  }
  pod(25); pod(71);

  // ===== ANTENA =====
  ctx.fillStyle=NAVY; ctx.beginPath(); ctx.moveTo(45,16); ctx.lineTo(51,16); ctx.lineTo(49.2,8); ctx.lineTo(46.8,8); ctx.closePath(); ctx.fill();
  const halo=ctx.createRadialGradient(48,5,1,48,5,11); halo.addColorStop(0,"rgba(90,200,255,0.55)"); halo.addColorStop(1,"rgba(90,200,255,0)");
  ctx.fillStyle=halo; ctx.beginPath(); ctx.arc(48,5,11,0,Math.PI*2); ctx.fill();
  const bg=ctx.createRadialGradient(46.3,3.5,0.5,48,5,5.5); bg.addColorStop(0,"#e6f7ff"); bg.addColorStop(0.4,"#48b4ff"); bg.addColorStop(1,"#1670d8");
  ctx.fillStyle=bg; ctx.beginPath(); ctx.arc(48,5,5.5,0,Math.PI*2); ctx.fill();
  cfVan(ctx,46.2,3.4,1.6,"#ffffff");

  // ===== CAPACETE =====
  rrVan(ctx,26,14,44,34,17); ctx.fillStyle=white(28,15,68,15); ctx.fill();
  ctx.lineWidth=3; ctx.strokeStyle=OUT; ctx.stroke();
  ctx.save(); rrVan(ctx,26,14,44,34,17); ctx.clip();
  ctx.fillStyle="rgba(255,255,255,0.6)"; ctx.beginPath(); ctx.ellipse(38,19,10,4,-0.5,0,Math.PI*2); ctx.fill(); ctx.restore();

  // ===== MOLDURA + VISEIRA =====
  rrVan(ctx,30,20,36,23,12); ctx.fillStyle=NAVY; ctx.fill();
  rrVan(ctx,32.5,22,31,19,10);
  const vg=ctx.createLinearGradient(0,22,0,41); vg.addColorStop(0,"#7fd4ff"); vg.addColorStop(0.5,"#2a9bf0"); vg.addColorStop(1,"#1366c6");
  ctx.fillStyle=vg; ctx.fill();
  ctx.save(); rrVan(ctx,32.5,22,31,19,10); ctx.clip();
  ctx.fillStyle="rgba(255,255,255,0.45)"; ctx.beginPath(); ctx.ellipse(42,25,9,3.5,-0.4,0,Math.PI*2); ctx.fill(); ctx.restore();

  // ===== OLHOS =====
  if(!blink){
    ctx.fillStyle="#0a0f1c";
    ctx.beginPath(); ctx.ellipse(41,30,3.3,4,0,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(55,30,3.3,4,0,0,Math.PI*2); ctx.fill();
    cfVan(ctx,42.3,28.4,1.5,"#fff"); cfVan(ctx,39.9,31,0.8,"#fff");
    cfVan(ctx,56.3,28.4,1.5,"#fff"); cfVan(ctx,53.9,31,0.8,"#fff");
  } else if(blink==="wink"){
    // pisca-olho brincalhão — olho esquerdo aberto normal, direito fechado num arco
    ctx.fillStyle="#0a0f1c";
    ctx.beginPath(); ctx.ellipse(41,30,3.3,4,0,0,Math.PI*2); ctx.fill();
    cfVan(ctx,42.3,28.4,1.5,"#fff"); cfVan(ctx,39.9,31,0.8,"#fff");
    ctx.lineWidth=3; ctx.strokeStyle="#0a0f1c"; ctx.lineCap="round";
    ctx.beginPath(); ctx.arc(55,31,3.5,0.15*Math.PI,0.85*Math.PI); ctx.stroke();
  } else if(blink==="happy"){
    // sorriso grande e feliz — olhos fechados em arco (mais generosos que o piscar normal)
    // + bochechas coradas, para se distinguir claramente do sorriso base neutro.
    ctx.lineWidth=3.2; ctx.strokeStyle="#0a0f1c"; ctx.lineCap="round";
    ctx.beginPath(); ctx.arc(41,31,3.9,0.10*Math.PI,0.90*Math.PI); ctx.stroke();
    ctx.beginPath(); ctx.arc(55,31,3.9,0.10*Math.PI,0.90*Math.PI); ctx.stroke();
    cfVan(ctx,33.5,35.5,3,"rgba(255,120,120,0.55)");
    cfVan(ctx,62.5,35.5,3,"rgba(255,120,120,0.55)");
  } else if(blink==="sad"){
    // sobrancelhas preocupadas (inclinadas para cima no centro) + olhos tristes + lágrima
    ctx.strokeStyle="#0a0f1c"; ctx.lineWidth=2.3; ctx.lineCap="round";
    ctx.beginPath(); ctx.moveTo(37,24); ctx.lineTo(44.5,27); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(59,24); ctx.lineTo(51.5,27); ctx.stroke();
    ctx.fillStyle="#0a0f1c";
    ctx.beginPath(); ctx.ellipse(41,32,2.8,3.1,0,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(55,32,2.8,3.1,0,0,Math.PI*2); ctx.fill();
    cfVan(ctx,42,30.7,1.1,"#fff"); cfVan(ctx,56,30.7,1.1,"#fff");
    // lagrimazinha a escorrer do olho direito
    ctx.fillStyle="#6fd0ff";
    ctx.beginPath();
    ctx.moveTo(56,35); ctx.quadraticCurveTo(59,40,56,43.5); ctx.quadraticCurveTo(53,40,56,35);
    ctx.closePath(); ctx.fill();
  } else {
    // piscar feliz — arcos ^_^
    ctx.lineWidth=3; ctx.strokeStyle="#0a0f1c";
    ctx.beginPath(); ctx.arc(41,31,3.5,0.15*Math.PI,0.85*Math.PI); ctx.stroke();
    ctx.beginPath(); ctx.arc(55,31,3.5,0.15*Math.PI,0.85*Math.PI); ctx.stroke();
  }
  // ===== BOCA — sorriso aberto e contente (variantes: maior no pisca-olho/feliz, invertida na tristeza) =====
  ctx.fillStyle="#0a0f1c";
  if(blink==="wink"){
    ctx.beginPath(); ctx.ellipse(48,36,5.6,3.6,0,0,Math.PI); ctx.fill();   // sorriso maroto, um pouco mais largo
    ctx.fillStyle="#ff7a7a";
    ctx.beginPath(); ctx.ellipse(48,37.6,2.9,1.7,0,0,Math.PI); ctx.fill();
  } else if(blink==="happy"){
    ctx.beginPath(); ctx.ellipse(48,36,6.2,4.2,0,0,Math.PI); ctx.fill();   // sorriso grande, o maior de todos
    ctx.fillStyle="#ff7a7a";
    ctx.beginPath(); ctx.ellipse(48,38,3.2,1.9,0,0,Math.PI); ctx.fill();
  } else if(blink==="sad"){
    // boca triste — arco invertido, cantos para baixo (sem preenchimento, só o traço)
    ctx.strokeStyle="#0a0f1c"; ctx.lineWidth=2.4; ctx.lineCap="round";
    ctx.beginPath(); ctx.arc(48,40,4.2,Math.PI,Math.PI*2); ctx.stroke();
  } else {
    ctx.beginPath(); ctx.ellipse(48,36,4.6,3.2,0,0,Math.PI); ctx.fill();   // metade de baixo = sorriso
    ctx.fillStyle="#ff7a7a";
    ctx.beginPath(); ctx.ellipse(48,37.4,2.4,1.5,0,0,Math.PI); ctx.fill(); // línguinha
  }

  ctx.restore();
  tex.refresh();
}
