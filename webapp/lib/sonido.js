// Sonidos generados con Web Audio: no hace falta bajar archivos.
import { leer, guardar } from './almacen.js';

let ctx = null;
let activo = leer('sonido', true);

export const estaActivo = () => activo;

export function alternar() {
  activo = !activo;
  guardar('sonido', activo);
  return activo;
}

function crearContexto() {
  try {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  } catch {
    ctx = null;
  }
  return ctx;
}

function contexto() {
  if (!activo) return null;
  const c = crearContexto();
  // iPadOS deja el contexto suspendido hasta que hay un toque
  if (c && c.state === 'suspended') c.resume().catch(() => {});
  return c;
}

// Para quien necesite programar sonidos a mano (por ejemplo, música de fondo).
// Devuelve null si el sonido está apagado.
export function contextoAudio() {
  return contexto();
}

// ---------- Clips de audio (archivos) ----------

const clips = new Map();

// Baja y decodifica un archivo una sola vez; las siguientes llamadas reusan la promesa
export function cargar(url) {
  if (!clips.has(url)) {
    const promesa = (async () => {
      const c = crearContexto();
      if (!c) return null;
      const datos = await (await fetch(url)).arrayBuffer();
      return c.decodeAudioData(datos);
    })().catch((err) => {
      console.error('No se pudo cargar el audio', url, err);
      clips.delete(url);
      return null;
    });
    clips.set(url, promesa);
  }
  return clips.get(url);
}

export async function reproducir(url, { velocidad = 1, volumen = 1 } = {}) {
  const c = contexto();
  if (!c) return;
  const buffer = await cargar(url);
  if (!buffer) return;
  const fuente = c.createBufferSource();
  const gan = c.createGain();
  fuente.buffer = buffer;
  fuente.playbackRate.value = velocidad;
  gan.gain.value = volumen;
  fuente.connect(gan).connect(c.destination);
  fuente.start();
}

export function tono(frecuencia, { duracion = 0.18, tipo = 'sine', volumen = 0.3, caida = 1 } = {}) {
  const c = contexto();
  if (!c) return;
  const t = c.currentTime;
  const osc = c.createOscillator();
  const gan = c.createGain();
  osc.type = tipo;
  osc.frequency.setValueAtTime(frecuencia, t);
  osc.frequency.exponentialRampToValueAtTime(frecuencia * caida, t + duracion);
  gan.gain.setValueAtTime(0.0001, t);
  gan.gain.exponentialRampToValueAtTime(volumen, t + 0.01);
  gan.gain.exponentialRampToValueAtTime(0.0001, t + duracion);
  osc.connect(gan).connect(c.destination);
  osc.start(t);
  osc.stop(t + duracion + 0.02);
}

// Pentatónica de Do: cualquier combinación suena bien
export const NOTAS = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];

export function clic() {
  tono(NOTAS[2], { duracion: 0.12, tipo: 'triangle', volumen: 0.2 });
}
