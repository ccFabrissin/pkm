// Despertá al elefante
// - El nene está al lado del elefante dormido. Cada toque al elefante: "ate ate".
//   Con varios toques se despierta y se va corriendo a dormir a otro lado.
// - Cuando está lejos, cada toque: "ate" y el nene camina un paso hacia él.
//   Al llegar, vuelve a empezar.
import { cargar, reproducir } from '../lib/sonido.js';

const BASE = '/webapp/assets/elefante/';
const AUDIO_ATE_ATE = BASE + 'ate-ate.wav';
const AUDIO_ATE = [BASE + 'ate-1.wav', BASE + 'ate-2.wav'];
const NENE = BASE + 'nene.png';
const NENE_PROPORCION = 282 / 579; // ancho / alto de nene.png

const TOQUES_PARA_DESPERTAR = 3;
const PASOS_PARA_LLEGAR = 3;

const azar = (min, max) => min + Math.random() * (max - min);
const variar = () => azar(0.96, 1.06); // la voz suena un poco distinta cada vez

const ELEFANTE_SVG = `
<svg class="personaje__cuerpo" viewBox="0 0 240 240" aria-hidden="true">
  <defs>
    <g id="ef-oreja">
      <path d="M78 52 C30 22 2 72 18 112 C28 138 62 140 80 118 Z" fill="#94959b"/>
      <path d="M72 64 C38 44 20 80 30 106 C38 124 60 124 72 108 Z" fill="#b4b5ba"/>
    </g>
    <g id="ef-pata">
      <ellipse cx="88" cy="208" rx="31" ry="25" fill="#9d9ea4"/>
      <ellipse cx="88" cy="212" rx="19" ry="15" fill="#5e6068"/>
      <circle cx="76" cy="196" r="5" fill="#6b6d74"/>
      <circle cx="88" cy="193" r="5" fill="#6b6d74"/>
      <circle cx="100" cy="196" r="5" fill="#6b6d74"/>
    </g>
    <g id="ef-brazo">
      <path d="M62 132 L34 152 L48 172 L66 160 Z" fill="#ebe7dc"/>
      <ellipse cx="42" cy="176" rx="14" ry="19" fill="#9d9ea4"/>
      <ellipse cx="42" cy="186" rx="9" ry="7" fill="#5e6068"/>
    </g>
    <g id="ef-ojo-cerrado">
      <path d="M90 78 q9 8 18 0" stroke="#33353b" stroke-width="4.5" fill="none" stroke-linecap="round"/>
    </g>
    <g id="ef-ojo-abierto">
      <ellipse cx="99" cy="76" rx="8" ry="9.5" fill="#26282d"/>
      <circle cx="102" cy="72" r="3" fill="#fff"/>
    </g>
    <g id="ef-colmillo">
      <path d="M103 106 C90 112 90 126 100 130 C100 120 104 114 110 110 Z" fill="#f7f4ee"/>
    </g>
  </defs>

  <!-- patas -->
  <use href="#ef-pata"/>
  <use href="#ef-pata" transform="translate(240 0) scale(-1 1)"/>

  <!-- cuerpo con remera -->
  <path d="M62 126 Q120 108 178 126 L188 198 Q120 216 52 198 Z" fill="#f5f2ea"/>
  <use href="#ef-brazo"/>
  <use href="#ef-brazo" transform="translate(240 0) scale(-1 1)"/>

  <!-- estampa: nene de pelo parado durmiendo, en rojo y blanco -->
  <g transform="translate(88 140)">
    <rect width="64" height="50" rx="9" fill="#e63b2e"/>
    <path d="M10 30 L6 18 L16 22 L14 8 L24 17 L28 4 L34 16 L42 6 L42 20 L54 14 L48 28 Z" fill="#fff"/>
    <ellipse cx="30" cy="33" rx="15" ry="10" fill="#fff"/>
    <path d="M24 34 q4 3 8 0" stroke="#e63b2e" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    <text x="50" y="44" font-size="12" font-weight="900" fill="#fff" font-family="sans-serif">z</text>
  </g>

  <!-- cabeza -->
  <g class="cabeza">
    <g class="oreja oreja--izq"><use href="#ef-oreja"/></g>
    <g class="oreja oreja--der"><use href="#ef-oreja" transform="translate(240 0) scale(-1 1)"/></g>
    <circle cx="120" cy="80" r="50" fill="#a3a4aa"/>
    <ellipse cx="92" cy="96" rx="9" ry="5" fill="#e9a0a6" opacity="0.45"/>
    <ellipse cx="148" cy="96" rx="9" ry="5" fill="#e9a0a6" opacity="0.45"/>
    <use href="#ef-colmillo"/>
    <use href="#ef-colmillo" transform="translate(240 0) scale(-1 1)"/>
    <path d="M108 98 C104 130 110 152 128 158 C140 162 148 152 141 146 C132 147 127 136 132 98 Z" fill="#a3a4aa"/>
    <path d="M110 116 q10 4 21 0 M110 128 q10 4 21 0 M113 140 q9 4 18 0" stroke="#8e8f95" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <g class="ojo-cerrado"><use href="#ef-ojo-cerrado"/><use href="#ef-ojo-cerrado" transform="translate(240 0) scale(-1 1)"/></g>
    <g class="ojo-abierto"><use href="#ef-ojo-abierto"/><use href="#ef-ojo-abierto" transform="translate(240 0) scale(-1 1)"/></g>
  </g>
</svg>`;

// Resuelve cuando el CSS ya está aplicado: antes de eso las medidas de la escena no sirven
function cargarEstilos() {
  let link = document.querySelector('link[data-juego="elefante"]');
  if (link && link.sheet) return Promise.resolve();
  if (!link) {
    link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/webapp/juegos/elefante.css';
    link.dataset.juego = 'elefante';
    document.head.appendChild(link);
  }
  return new Promise((listo) => {
    link.addEventListener('load', listo, { once: true });
    link.addEventListener('error', listo, { once: true });
  });
}

export function iniciar(contenedor) {
  const estilos = cargarEstilos();
  [AUDIO_ATE_ATE, ...AUDIO_ATE].forEach(cargar);

  const escena = document.createElement('div');
  escena.className = 'elefante-juego';
  escena.style.visibility = 'hidden'; // se muestra cuando cargó el CSS

  const elefante = document.createElement('div');
  elefante.className = 'personaje elefante elefante--durmiendo';
  elefante.setAttribute('role', 'button');
  elefante.setAttribute('aria-label', 'Elefante durmiendo: tocalo para despertarlo');
  elefante.innerHTML = ELEFANTE_SVG;

  const nene = document.createElement('div');
  nene.className = 'personaje nene';
  nene.innerHTML = `<div class="personaje__cuerpo"><img src="${NENE}" alt="El nene" draggable="false"></div>`;

  escena.append(elefante, nene);
  contenedor.appendChild(escena);

  // Posiciones en fracciones del ancho/alto: x = centro, y = donde apoyan los pies
  const estado = {
    modo: 'cerca', // 'cerca' | 'ocupado' | 'lejos'
    toques: 0,
    pasos: 0,
    elef: { x: 0.7, y: 0.86 },
    nene: { x: 0.3, y: 0.88 }, // solo define de qué lado arranca: se acomoda al lado del elefante
    vueltas: 0,
  };
  const timers = new Set();
  const despues = (ms, fn) => {
    const id = setTimeout(() => { timers.delete(id); fn(); }, ms);
    timers.add(id);
  };

  function medidas() {
    const w = escena.clientWidth;
    const h = escena.clientHeight;
    const elefLado = Math.min(w * 0.34, h * 0.52);
    const neneAlto = Math.min(h * 0.55, elefLado * 1.3);
    return { w, h, elefLado, neneAlto, neneAncho: neneAlto * NENE_PROPORCION };
  }

  // Dónde se para el nene para quedar al lado del elefante, del lado de donde viene
  function ladoDelElefante() {
    const m = medidas();
    // Pegado pero sin taparlo: el elefante tiene que quedar fácil de tocar
    const separacion = (m.elefLado * 0.5 + m.neneAncho * 0.42) / m.w;
    let lado = estado.nene.x <= estado.elef.x ? -1 : 1;
    let x = estado.elef.x + lado * separacion;
    const margen = m.neneAncho / 2 / m.w;
    if (x < margen || x > 1 - margen) {
      lado = -lado;
      x = estado.elef.x + lado * separacion;
    }
    return { x, y: Math.min(estado.elef.y + 0.02, 0.99) };
  }

  function pintar() {
    const m = medidas();
    elefante.style.width = elefante.style.height = `${m.elefLado}px`;
    elefante.style.transform =
      `translate3d(${estado.elef.x * m.w - m.elefLado / 2}px, ${estado.elef.y * m.h - m.elefLado}px, 0)`;
    elefante.style.zIndex = Math.round(estado.elef.y * 100);

    nene.style.width = `${m.neneAncho}px`;
    nene.style.height = `${m.neneAlto}px`;
    nene.style.transform =
      `translate3d(${estado.nene.x * m.w - m.neneAncho / 2}px, ${estado.nene.y * m.h - m.neneAlto}px, 0)`;
    nene.style.zIndex = Math.round(estado.nene.y * 100) + 1;
    // No se espeja la imagen: el "10" de la camiseta quedaría al revés
  }

  function reiniciarAnimacion(el, clase) {
    el.classList.remove(clase);
    void el.offsetWidth;
    el.classList.add(clase);
  }

  function globo(texto) {
    const m = medidas();
    const el = document.createElement('div');
    el.className = 'globo';
    el.textContent = texto;
    el.style.fontSize = `${Math.max(20, m.neneAlto * 0.09)}px`;
    el.style.left = `${estado.nene.x * m.w}px`;
    el.style.top = `${Math.max(8, estado.nene.y * m.h - m.neneAlto - 40)}px`;
    el.style.zIndex = 300;
    el.addEventListener('animationend', () => el.remove(), { once: true });
    escena.appendChild(el);
  }

  function zeta() {
    if (!elefante.classList.contains('elefante--durmiendo')) return;
    const m = medidas();
    const el = document.createElement('span');
    el.className = 'zeta';
    el.textContent = 'z';
    el.style.fontSize = `${m.elefLado * azar(0.1, 0.16)}px`;
    el.style.left = `${estado.elef.x * m.w + m.elefLado * 0.22}px`;
    el.style.top = `${estado.elef.y * m.h - m.elefLado * 0.95}px`;
    el.style.zIndex = 200;
    el.addEventListener('animationend', () => el.remove(), { once: true });
    escena.appendChild(el);
  }
  const intervaloZeta = setInterval(zeta, 1100);

  function nuevoLugar() {
    const m = medidas();
    const margenX = (m.elefLado / 2 + 12) / m.w;
    // Puede ir a cualquier altura, siempre que entren él y el nene parado a su lado
    const minY = (Math.max(m.elefLado, m.neneAlto) + 12) / m.h;
    const maxY = 0.97;
    // Distancia real en píxeles, en cualquier dirección (horizontal, vertical o diagonal)
    const distancia = (l) => Math.hypot((l.x - estado.nene.x) * m.w, (l.y - estado.nene.y) * m.h);
    // No tan exigente como para que en pantallas bajas solo pueda irse de costado
    const lejos = Math.max(m.elefLado * 1.2, Math.min(m.w, m.h) * 0.4);
    // Entre varios lugares al azar, uno de los que quedan lejos del nene (así tiene que caminar);
    // si ninguno lo está, el más lejano
    const candidatos = Array.from({ length: 40 }, () => ({
      x: azar(margenX, 1 - margenX),
      y: minY < maxY ? azar(minY, maxY) : maxY,
    }));
    const lejanos = candidatos.filter((l) => distancia(l) > lejos);
    if (lejanos.length) return lejanos[Math.floor(Math.random() * lejanos.length)];
    return candidatos.reduce((a, b) => (distancia(b) > distancia(a) ? b : a));
  }

  function despertar() {
    estado.modo = 'ocupado';
    elefante.classList.remove('elefante--durmiendo');
    elefante.classList.add('elefante--despierto');
    elefante.setAttribute('aria-label', 'Elefante despierto');

    despues(900, () => {
      estado.elef = nuevoLugar();
      elefante.classList.add('elefante--corre');
      pintar();
    });

    despues(900 + 1350, () => {
      elefante.classList.remove('elefante--corre', 'elefante--despierto');
      elefante.classList.add('elefante--durmiendo');
      elefante.setAttribute('aria-label', 'Elefante durmiendo: tocalo para despertarlo');
      estado.modo = 'lejos';
      estado.pasos = PASOS_PARA_LLEGAR;
      estado.toques = 0;
      estado.vueltas += 1;
    });
  }

  function caminarUnPaso() {
    const destino = ladoDelElefante();
    const f = 1 / estado.pasos;
    estado.nene = {
      x: estado.nene.x + (destino.x - estado.nene.x) * f,
      y: estado.nene.y + (destino.y - estado.nene.y) * f,
    };
    estado.pasos -= 1;
    reiniciarAnimacion(nene, 'nene--camina');
    pintar();
    if (estado.pasos === 0) {
      estado.modo = 'cerca';
      estado.toques = 0;
    }
  }

  elefante.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    if (estado.modo === 'ocupado') return;

    reiniciarAnimacion(elefante, 'elefante--se-mueve');
    zeta();

    if (estado.modo === 'cerca') {
      reproducir(AUDIO_ATE_ATE, { velocidad: variar() });
      globo('¡ate ate!');
      reiniciarAnimacion(nene, 'nene--salta');
      estado.toques += 1;
      if (estado.toques >= TOQUES_PARA_DESPERTAR) {
        estado.modo = 'ocupado';
        despues(500, despertar);
      }
    } else {
      reproducir(AUDIO_ATE[estado.pasos % AUDIO_ATE.length], { velocidad: variar() });
      globo('¡ate!');
      caminarUnPaso();
    }
  });

  nene.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    reiniciarAnimacion(nene, 'nene--salta');
  });

  // Arranca con el nene al lado del elefante
  estilos.then(() => {
    estado.nene = ladoDelElefante();
    pintar();
    escena.style.visibility = '';
    // Recién después de ubicarlo se activa la transición, para que no "entre caminando"
    requestAnimationFrame(() => nene.classList.add('nene--listo'));
  });
  const alRedimensionar = () => pintar();
  window.addEventListener('resize', alRedimensionar);

  return function detener() {
    clearInterval(intervaloZeta);
    timers.forEach(clearTimeout);
    window.removeEventListener('resize', alRedimensionar);
    escena.remove();
  };
}
