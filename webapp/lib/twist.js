// Música de fondo original estilo twist / rock and roll, generada en el momento:
// blues de 12 compases en Do con bajo "boogie", batería y acordes en los contratiempos.
// No usa archivos. Se puede cambiar el tempo mientras suena.
import { contextoAudio, estaActivo } from './sonido.js';

const RAIZ = 130.81; // Do3
const SEMI = (n) => RAIZ * 2 ** (n / 12);
const COMPASES = [0, 0, 0, 0, 5, 5, 0, 0, 7, 5, 0, 7]; // I I I I IV IV I I V IV I V
const BAJO = [0, 4, 7, 9, 10, 9, 7, 4]; // una corchea cada uno

export function crearTwist({ bpm = 150, volumen = 0.16 } = {}) {
  let ctx = null;
  let salida = null;
  let ruido = null;
  let paso = 0; // corcheas desde el principio
  let proximo = 0; // tiempo del próximo paso
  let intervalo = 0;
  let tempo = bpm;

  function prepararRuido() {
    const n = ctx.sampleRate * 0.3;
    ruido = ctx.createBuffer(1, n, ctx.sampleRate);
    const datos = ruido.getChannelData(0);
    for (let i = 0; i < n; i++) datos[i] = Math.random() * 2 - 1;
  }

  function nota(frec, t, dur, { tipo = 'triangle', vol = 0.5 } = {}) {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = tipo;
    osc.frequency.setValueAtTime(frec, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g).connect(salida);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  function golpe(t, { dur, vol, filtro, frec = 1000 }) {
    const src = ctx.createBufferSource();
    const f = ctx.createBiquadFilter();
    const g = ctx.createGain();
    src.buffer = ruido;
    f.type = filtro;
    f.frequency.value = frec;
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g).connect(salida);
    src.start(t);
    src.stop(t + dur + 0.02);
  }

  function bombo(t) {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.12);
    g.gain.setValueAtTime(0.9, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
    osc.connect(g).connect(salida);
    osc.start(t);
    osc.stop(t + 0.2);
  }

  function tocarPaso(n, t) {
    const corchea = 30 / tempo;
    const compas = Math.floor(n / 8) % COMPASES.length;
    const enCompas = n % 8;
    const grado = COMPASES[compas];

    // Bajo boogie
    nota(SEMI(grado + BAJO[enCompas]) / 2, t, corchea * 0.9, { tipo: 'triangle', vol: 0.55 });

    // Batería: bombo en 1 y 3, redoblante en 2 y 4, platillo en cada corchea
    if (enCompas % 4 === 0) bombo(t);
    if (enCompas % 4 === 2) golpe(t, { dur: 0.14, vol: 0.35, filtro: 'bandpass', frec: 1800 });
    golpe(t, { dur: 0.04, vol: enCompas % 2 ? 0.08 : 0.12, filtro: 'highpass', frec: 7000 });

    // Acorde corto en los contratiempos ("chuc")
    if (enCompas % 2 === 1) {
      [0, 4, 7, 10].forEach((s) => nota(SEMI(grado + s + 12), t, corchea * 0.5, { tipo: 'square', vol: 0.05 }));
    }

    // Una frasecita al final de cada vuelta de 4 compases
    if (compas % 4 === 3 && enCompas >= 4) {
      const frase = [12, 15, 16, 19];
      nota(SEMI(grado + frase[enCompas - 4] + 12), t, corchea * 0.8, { tipo: 'sawtooth', vol: 0.09 });
    }
  }

  function programar() {
    if (!ctx) return;
    // Si apagaron el sonido, silencio (sin cortar el ritmo)
    salida.gain.setTargetAtTime(estaActivo() ? volumen : 0, ctx.currentTime, 0.05);
    while (proximo < ctx.currentTime + 0.2) {
      tocarPaso(paso, proximo);
      proximo += 30 / tempo;
      paso += 1;
    }
  }

  return {
    empezar() {
      if (intervalo) return true;
      ctx = contextoAudio();
      if (!ctx) return false;
      if (!ruido) prepararRuido();
      salida = ctx.createGain();
      salida.gain.value = volumen;
      salida.connect(ctx.destination);
      proximo = ctx.currentTime + 0.05;
      intervalo = setInterval(programar, 50);
      programar();
      return true;
    },
    parar() {
      clearInterval(intervalo);
      intervalo = 0;
      if (salida) {
        salida.gain.setTargetAtTime(0, ctx.currentTime, 0.05);
        const s = salida;
        setTimeout(() => s.disconnect(), 300);
      }
      salida = null;
    },
    tempo(nuevo) {
      tempo = nuevo;
    },
    get sonando() {
      return Boolean(intervalo);
    },
  };
}
