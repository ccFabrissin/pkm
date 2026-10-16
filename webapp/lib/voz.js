// Voz sintetizada del sistema (Web Speech). En iPad las voces están en el equipo,
// así que funciona sin conexión. iPadOS solo habla después del primer toque.
import { estaActivo } from './sonido.js';

const PREFERIDAS = ['es-ar', 'es-419', 'es-us', 'es-mx', 'es-es'];
let voz = null;

const hayVoz = () => 'speechSynthesis' in window;

function elegirVoz() {
  const voces = speechSynthesis.getVoices().filter((v) => (v.lang || '').toLowerCase().startsWith('es'));
  voz = null;
  for (const lang of PREFERIDAS) {
    voz = voces.find((v) => v.lang.toLowerCase().replace('_', '-') === lang);
    if (voz) break;
  }
  voz = voz || voces[0] || null;
}

if (hayVoz()) {
  elegirVoz();
  speechSynthesis.addEventListener?.('voiceschanged', elegirVoz);
}

// Resuelve cuando terminó de hablar (o a los 4 s, por si el navegador no avisa)
export function decir(texto, { velocidad = 0.8, tono = 1.15 } = {}) {
  if (!estaActivo() || !hayVoz()) return Promise.resolve();
  return new Promise((listo) => {
    try {
      speechSynthesis.cancel();
      const frase = new SpeechSynthesisUtterance(texto);
      frase.lang = voz ? voz.lang : 'es-AR';
      if (voz) frase.voice = voz;
      frase.rate = velocidad;
      frase.pitch = tono;
      frase.onend = frase.onerror = () => listo();
      speechSynthesis.speak(frase);
      setTimeout(listo, 4000);
    } catch {
      listo();
    }
  });
}

export function callar() {
  try {
    if (hayVoz()) speechSynthesis.cancel();
  } catch {
    // nada que hacer
  }
}
