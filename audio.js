// ===== Sistema de Áudio — WebAudio síntese simples (sem ficheiros de som) =====
// Isolado do resto do jogo: só sabe tocar bips e guardar o estado "muted".
// Outros módulos importam { ensureAudio, beep, SFX, isMuted, setMuted, toggleMuted }.

let audioCtx = null;
let muted = false;

export function ensureAudio() {
  if (muted) return;
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === "suspended") audioCtx.resume();
}

export function beep({ freq = 440, dur = 0.08, type = "square", vol = 0.06, slideTo = null }) {
  if (muted || !audioCtx) return;
  const t0 = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(1, slideTo), t0 + dur);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain); gain.connect(audioCtx.destination);
  osc.start(t0); osc.stop(t0 + dur + 0.02);
}

export function isMuted() { return muted; }
export function setMuted(v) { muted = !!v; }
export function toggleMuted() { muted = !muted; return muted; }

export const SFX = {
  jump()    { beep({ freq:560, dur:0.08, type:"square",   vol:0.06,  slideTo:720  }); },
  coin()    { beep({ freq:960, dur:0.06, type:"square",   vol:0.055, slideTo:1500 }); },
  hit()     { beep({ freq:220, dur:0.10, type:"sawtooth", vol:0.055, slideTo:160  }); setTimeout(() => beep({ freq:140, dur:0.14, type:"square", vol:0.05, slideTo:110 }), 120); },
  door()    { beep({ freq:700, dur:0.10, type:"triangle", vol:0.055, slideTo:1050 }); },
  doorOpen() {
    beep({ freq:300, dur:0.07, type:"square",   vol:0.05,  slideTo:360 });
    setTimeout(() => beep({ freq:480, dur:0.09, type:"triangle", vol:0.055, slideTo:720  }), 90);
    setTimeout(() => beep({ freq:560, dur:0.12, type:"triangle", vol:0.055, slideTo:840  }), 200);
    setTimeout(() => beep({ freq:840, dur:0.14, type:"triangle", vol:0.055, slideTo:1120 }), 340);
    setTimeout(() => beep({ freq:1120,dur:0.18, type:"triangle", vol:0.055, slideTo:1400 }), 490);
  },
  power()   { beep({ freq:360, dur:0.10, type:"square",   vol:0.055, slideTo:960  }); },
  bossArrive() {
    // Chegada de boss — mais grave e ameaçador que o SFX.door() genérico,
    // usado só neste momento para o distinguir de qualquer outra transição.
    beep({ freq:110, dur:0.22, type:"sawtooth", vol:0.07, slideTo:70 });
    setTimeout(() => beep({ freq:90,  dur:0.30, type:"square",   vol:0.065, slideTo:50 }), 140);
    setTimeout(() => beep({ freq:200, dur:0.12, type:"sawtooth", vol:0.05,  slideTo:160 }), 340);
  },
  life()    { beep({ freq:800, dur:0.07, type:"triangle", vol:0.055, slideTo:1100 }); },
  starMelody() {
    // Melodia Super Mario Star — sequência cromática ascendente/descendente
    // Notas: E5 F#5 G#5 A5 A#5 C6 D6 E6 (subida) + descida espelhada
    const notes = [
      {f:659, d:0.10}, {f:740, d:0.10}, {f:830, d:0.10}, {f:880, d:0.10},
      {f:932, d:0.10}, {f:1047,d:0.10}, {f:1175,d:0.10}, {f:1319,d:0.14},
      {f:1175,d:0.10}, {f:1047,d:0.10}, {f:932, d:0.10}, {f:880, d:0.10},
      {f:830, d:0.10}, {f:740, d:0.10}, {f:659, d:0.10}, {f:587, d:0.14}
    ];
    const step = 95; // ms entre notas — mais rápido que o original
    notes.forEach(({f,d},i) => {
      setTimeout(() => {
        if (!muted && audioCtx) {
          // Melodia principal (voz lead)
          beep({ freq:f, dur:d, type:"square", vol:0.055 });
          // Harmonia em terça acima (mais suave, tipo eco)
          if (i % 2 === 0) beep({ freq:f*1.26, dur:d, type:"triangle", vol:0.018 });
        }
      }, i * step);
    });
  },
  win() {
    beep({ freq:560, dur:0.07, type:"square", vol:0.055, slideTo:700 });
    setTimeout(() => beep({ freq:700, dur:0.07, type:"square", vol:0.055, slideTo:840  }), 90);
    setTimeout(() => beep({ freq:840, dur:0.10, type:"square", vol:0.055, slideTo:1120 }), 180);
  },
  gameOver() {
    [330,262,196].forEach((n,i) => setTimeout(() => beep({ freq:n, dur:0.18, type:"square", vol:0.055, slideTo:n*0.75 }), i*220));
  },
  finalWin() {
    const seq=[560,700,840,1120,1050,840,1120,1400,1260,1400,1680,1400,1680,1900,1680,1900];
    seq.forEach((n,i) => setTimeout(() =>
      beep({ freq:n, dur:i<4?0.08:i<8?0.10:0.13, type:i<8?"square":"triangle", vol:0.06, slideTo:n*1.12 }), i*95));
    setTimeout(() => beep({ freq:1900, dur:0.28, type:"triangle", vol:0.06, slideTo:2200 }), seq.length*95+80);
    // Segunda vaga — acorde final
    setTimeout(() => {
      [560,840,1120].forEach((n,i)=>setTimeout(()=>beep({freq:n,dur:0.35,type:"triangle",vol:0.05,slideTo:n*1.05}),i*60));
    }, seq.length*95+500);
  }
};
