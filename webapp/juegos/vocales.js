// Vocales: el parlante dice una vocal y hay que tocarla.
// Cada acierto la hace volar; cuando se van las 5, festejo y vuelven todas.
// Si se equivoca dos veces con la misma, la correcta salta para darle una pista.
import { cargarEstilos } from '../lib/estilos.js';
import { decir, callar } from '../lib/voz.js';
import { tono, NOTAS } from '../lib/sonido.js';

const NOMBRE = 'Gael';
// dice: lo que lee la voz. La "u" sola la leen como la conjunción ("u"), corta y
// apenas audible; estirada ("uuu") la pronuncian como la vocal.
const VOCALES = [
  { letra: 'A', color: '#ff6b6b', dice: 'a' },
  { letra: 'E', color: '#ffb703', dice: 'e' },
  { letra: 'I', color: '#06d6a0', dice: 'i' },
  { letra: 'O', color: '#4cc9f0', dice: 'o' },
  { letra: 'U', color: '#9b6bff', dice: 'uuu' },
];
const dice = (letra) => VOCALES.find((v) => v.letra === letra).dice;
const ERRORES_PARA_PISTA = 2;

const PARLANTE_SVG = `
<svg viewBox="0 0 64 64" aria-hidden="true">
  <path d="M8 24h10l14-12v40L18 40H8z" fill="currentColor" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/>
  <path class="onda onda--1" d="M40 24c4 4 4 12 0 16" fill="none" stroke="currentColor" stroke-width="4.5" stroke-linecap="round"/>
  <path class="onda onda--2" d="M47 17c8 8 8 22 0 30" fill="none" stroke="currentColor" stroke-width="4.5" stroke-linecap="round"/>
</svg>`;

const elegir = (lista) => lista[Math.floor(Math.random() * lista.length)];
const azar = (min, max) => min + Math.random() * (max - min);

function sonidoAcierto() {
  [0, 2, 4].forEach((i, n) => setTimeout(() => tono(NOTAS[i], { duracion: 0.2, volumen: 0.25 }), n * 90));
}

function sonidoError() {
  tono(220, { duracion: 0.22, tipo: 'triangle', volumen: 0.18, caida: 0.8 });
}

export function iniciar(contenedor) {
  const estilos = cargarEstilos('vocales', '/webapp/juegos/vocales.css');

  const escena = document.createElement('div');
  escena.className = 'vocales';
  escena.style.visibility = 'hidden';
  escena.innerHTML = `
    <div class="vocales__contenido">
      <button class="vocales__parlante vocales__parlante--espera" type="button" aria-label="Escuchar la vocal">${PARLANTE_SVG}</button>
      <div class="vocales__fila"></div>
    </div>`;
  contenedor.appendChild(escena);

  const parlante = escena.querySelector('.vocales__parlante');
  const fila = escena.querySelector('.vocales__fila');

  const botones = new Map();
  for (const { letra, color } of VOCALES) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'vocal';
    b.textContent = letra;
    b.style.setProperty('--color', color);
    b.setAttribute('aria-label', `Letra ${letra}`);
    fila.appendChild(b);
    botones.set(letra, b);
  }

  const estado = {
    quedan: new Set(VOCALES.map((v) => v.letra)),
    objetivo: null,
    anterior: null,
    errores: 0,
    ocupado: false,
  };

  const timers = new Set();
  const despues = (ms, fn) => {
    const id = setTimeout(() => { timers.delete(id); fn(); }, ms);
    timers.add(id);
  };

  function reiniciarAnimacion(el, clase) {
    el.classList.remove(clase);
    void el.offsetWidth;
    el.classList.add(clase);
  }

  // Animaciones cortas (error, pista): se sacan al terminar para no pisar a las demás
  function animarUnaVez(el, clase) {
    reiniciarAnimacion(el, clase);
    el.addEventListener('animationend', () => el.classList.remove(clase), { once: true });
  }

  async function decirObjetivo() {
    if (!estado.objetivo) return;
    parlante.classList.add('vocales__parlante--habla');
    await decir(dice(estado.objetivo), { velocidad: 0.7 });
    parlante.classList.remove('vocales__parlante--habla');
  }

  function siguiente() {
    if (estado.quedan.size === 0) {
      festejo();
      return;
    }
    // Al azar entre las que quedan, sin repetir la anterior si se puede
    const opciones = [...estado.quedan].filter((l) => l !== estado.anterior || estado.quedan.size === 1);
    estado.objetivo = elegir(opciones);
    estado.anterior = estado.objetivo;
    estado.errores = 0;
    estado.ocupado = false;
    decirObjetivo();
  }

  function acierto(boton, letra) {
    estado.ocupado = true;
    estado.objetivo = null;
    estado.quedan.delete(letra);
    sonidoAcierto();
    // Si antes la tocó mal, sacar esas animaciones: si no, tapan la de irse
    boton.classList.remove('vocal--mal', 'vocal--pista');
    reiniciarAnimacion(boton, 'vocal--ida');
    boton.addEventListener('animationend', () => {
      boton.classList.remove('vocal--ida');
      boton.classList.add('vocal--fuera');
    }, { once: true });
    despues(1000, siguiente);
  }

  function error(boton) {
    sonidoError();
    animarUnaVez(boton, 'vocal--mal');
    estado.errores += 1;
    if (estado.errores >= ERRORES_PARA_PISTA) {
      animarUnaVez(botones.get(estado.objetivo), 'vocal--pista');
    }
    despues(550, decirObjetivo);
  }

  function confeti() {
    const caja = escena.getBoundingClientRect();
    const cx = caja.width / 2;
    const cy = caja.height / 2;
    for (let i = 0; i < 26; i++) {
      const el = document.createElement('span');
      el.className = 'confeti';
      el.textContent = elegir(['⭐', '🌟', '🎉', '✨', '🎈']);
      el.style.fontSize = `${azar(28, 52)}px`;
      const angulo = azar(0, Math.PI * 2);
      const distancia = azar(0.25, 0.55) * Math.max(caja.width, caja.height);
      el.style.setProperty('--x0', `${cx}px`);
      el.style.setProperty('--y0', `${cy}px`);
      el.style.setProperty('--x1', `${cx + Math.cos(angulo) * distancia}px`);
      el.style.setProperty('--y1', `${cy + Math.sin(angulo) * distancia}px`);
      el.style.setProperty('--giro', `${azar(-200, 200)}deg`);
      el.addEventListener('animationend', () => el.remove(), { once: true });
      escena.appendChild(el);
    }
  }

  function festejo() {
    estado.ocupado = true;
    confeti();
    sonidoAcierto();
    despues(250, () => decir(`¡Muy bien, ${NOMBRE}!`, { velocidad: 0.9 }));
    despues(2800, nuevaRonda);
  }

  function nuevaRonda() {
    estado.quedan = new Set(VOCALES.map((v) => v.letra));
    VOCALES.forEach(({ letra }, i) => {
      const b = botones.get(letra);
      b.classList.remove('vocal--fuera', 'vocal--ida');
      b.style.animationDelay = `${i * 90}ms`;
      reiniciarAnimacion(b, 'vocal--vuelve');
      b.addEventListener('animationend', () => {
        b.classList.remove('vocal--vuelve');
        b.style.animationDelay = '';
      }, { once: true });
    });
    despues(900, siguiente);
  }

  function despertarVoz() {
    parlante.classList.remove('vocales__parlante--espera');
  }

  parlante.addEventListener('click', () => {
    despertarVoz();
    if (estado.objetivo) decirObjetivo();
    else if (!estado.ocupado) siguiente();
  });

  fila.addEventListener('pointerdown', (e) => {
    const boton = e.target.closest('.vocal');
    if (!boton) return;
    // Primer toque de todos: en iPad recién ahora puede sonar la voz, así que
    // este toque solo dice la vocal pedida (no cuenta como respuesta)
    if (parlante.classList.contains('vocales__parlante--espera')) {
      despertarVoz();
      if (estado.objetivo) decirObjetivo();
      return;
    }
    const letra = boton.textContent;
    if (estado.ocupado || !estado.quedan.has(letra)) return;
    // Todavía no sonó ninguna vocal: la que toca dice su nombre
    if (!estado.objetivo) {
      animarUnaVez(boton, 'vocal--pista');
      decir(dice(letra), { velocidad: 0.7 });
      return;
    }
    if (letra === estado.objetivo) acierto(boton, letra);
    else error(boton);
  });

  estilos.then(() => {
    escena.style.visibility = '';
    // Intenta decir la primera; en iPad puede no sonar hasta tocar el parlante
    despues(700, siguiente);
  });

  return function detener() {
    timers.forEach(clearTimeout);
    callar();
    escena.remove();
  };
}
