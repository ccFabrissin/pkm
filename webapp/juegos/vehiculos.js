// Vehículos: igual que Vocales pero con vehículos.
// El parlante dice uno ("ambulancia", "tren"...) y hay que tocarlo.
// Al acertar suena "¡Bien!", el vehículo hace su ruido y se va; cuando se van
// todos, festejo y vuelven. Dos errores seguidos: el correcto salta como pista.
import { cargarEstilos } from '../lib/estilos.js';
import { decir, callar } from '../lib/voz.js';
import { tono, cargar, reproducir } from '../lib/sonido.js';

const NOMBRE = 'Gael';
const AUDIO_BIEN = '/webapp/assets/auto/bien.wav';
const ERRORES_PARA_PISTA = 2;

const RUEDA = (cx, cy, r = 15) => `
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="#22252b"/>
  <circle cx="${cx}" cy="${cy}" r="${r * 0.5}" fill="#c9ccd1"/>
  <circle cx="${cx}" cy="${cy}" r="${r * 0.18}" fill="#8e9399"/>`;

// Todos mirando a la derecha (para dónde se van), en un lienzo de 200 × 120
const DIBUJOS = {
  policia: `
    <path d="M14 86 L16 66 Q18 56 30 54 L62 52 L84 32 Q90 27 98 27 L134 27 Q144 27 150 35 L164 52 Q184 54 188 64 L190 84 Q190 90 184 90 L20 90 Q13 90 14 86 Z" fill="#fff" stroke="#1d3557" stroke-width="3"/>
    <path d="M90 36 Q93 33 98 33 L112 33 L112 52 L72 52 Z M118 33 L132 33 Q140 33 145 40 L154 52 L118 52 Z" fill="#a8d8ff"/>
    <rect x="16" y="62" width="173" height="13" fill="#1d4ed8"/>
    <text x="102" y="72.5" font-size="10.5" font-weight="900" fill="#fff" text-anchor="middle" font-family="sans-serif">POLICÍA</text>
    <rect x="98" y="17" width="16" height="10" rx="3" fill="#e63946"/>
    <rect x="114" y="17" width="16" height="10" rx="3" fill="#3b82f6"/>
    <rect x="178" y="58" width="10" height="6" rx="2" fill="#ffe066"/>
    ${RUEDA(52, 90)}${RUEDA(152, 90)}`,

  bomberos: `
    <rect x="10" y="40" width="130" height="50" rx="6" fill="#e63946"/>
    <path d="M138 90 L138 30 Q138 24 144 24 L168 24 Q176 24 180 32 L190 56 L190 90 Z" fill="#e63946"/>
    <path d="M146 30 L166 30 Q171 30 174 36 L181 54 L146 54 Z" fill="#a8d8ff"/>
    <rect x="14" y="24" width="118" height="9" rx="3" fill="#c9ccd1"/>
    ${[26, 44, 62, 80, 98, 116].map((x) => `<rect x="${x}" y="22" width="4" height="13" fill="#8e9399"/>`).join('')}
    <rect x="10" y="68" width="180" height="7" fill="#fff"/>
    <rect x="18" y="46" width="34" height="16" rx="3" fill="#b8202c"/>
    <rect x="60" y="46" width="34" height="16" rx="3" fill="#b8202c"/>
    <rect x="150" y="17" width="20" height="8" rx="3" fill="#3b82f6"/>
    <rect x="182" y="60" width="9" height="6" rx="2" fill="#ffe066"/>
    ${RUEDA(42, 92)}${RUEDA(92, 92)}${RUEDA(162, 92)}`,

  ambulancia: `
    <path d="M10 88 L10 34 Q10 26 18 26 L136 26 Q144 26 150 32 L176 56 Q190 58 190 70 L190 88 Z" fill="#fff" stroke="#9aa3ad" stroke-width="3"/>
    <path d="M140 36 L166 58 L140 58 Z" fill="#a8d8ff"/>
    <rect x="10" y="66" width="180" height="8" fill="#e63946"/>
    <rect x="58" y="36" width="12" height="32" fill="#e63946"/>
    <rect x="48" y="46" width="32" height="12" fill="#e63946"/>
    <rect x="96" y="16" width="22" height="10" rx="3" fill="#3b82f6"/>
    <rect x="182" y="62" width="8" height="6" rx="2" fill="#ffe066"/>
    ${RUEDA(48, 90)}${RUEDA(156, 90)}`,

  avion: `
    <path d="M30 62 L14 22 L34 22 L66 56 Z" fill="#1d4ed8"/>
    <path d="M16 70 Q14 54 40 52 L160 50 Q192 52 194 64 Q192 76 160 78 L40 78 Q16 78 16 70 Z" fill="#fff" stroke="#1d3557" stroke-width="3"/>
    <path d="M172 54 Q186 56 189 62 L170 62 Z" fill="#a8d8ff"/>
    ${[60, 78, 96, 114, 132, 150].map((x) => `<circle cx="${x}" cy="62" r="4.5" fill="#a8d8ff"/>`).join('')}
    <rect x="20" y="70" width="168" height="4" fill="#3b82f6"/>
    <path d="M86 70 L60 112 L84 112 L126 70 Z" fill="#1d4ed8"/>
    <path d="M24 66 L8 76 L30 74 Z" fill="#1d4ed8"/>`,

  tren: `
    <circle cx="146" cy="10" r="7" fill="#e5e7eb"/><circle cx="158" cy="4" r="5" fill="#e5e7eb"/>
    <rect x="12" y="24" width="56" height="62" rx="4" fill="#1d4ed8"/>
    <rect x="6" y="18" width="68" height="10" rx="3" fill="#123a9c"/>
    <rect x="24" y="34" width="30" height="22" rx="3" fill="#a8d8ff"/>
    <rect x="64" y="44" width="104" height="42" rx="18" fill="#e63946"/>
    <rect x="138" y="20" width="18" height="28" fill="#2a2d33"/>
    <rect x="134" y="16" width="26" height="8" rx="2" fill="#2a2d33"/>
    <rect x="88" y="34" width="14" height="14" rx="7" fill="#ffb703"/>
    <circle cx="168" cy="62" r="9" fill="#ffe066" stroke="#2a2d33" stroke-width="3"/>
    <path d="M170 86 L192 86 L178 72 Z" fill="#2a2d33"/>
    <rect x="10" y="84" width="170" height="6" fill="#2a2d33"/>
    ${RUEDA(38, 94, 13)}${RUEDA(92, 92, 16)}${RUEDA(138, 92, 16)}`,

  camion: `
    <rect x="10" y="20" width="124" height="66" rx="5" fill="#22963a"/>
    <rect x="16" y="26" width="112" height="54" rx="3" fill="#2fb344"/>
    ${[38, 62, 86, 110].map((x) => `<line x1="${x}" y1="30" x2="${x}" y2="76" stroke="#22963a" stroke-width="3"/>`).join('')}
    <path d="M138 88 L138 42 Q138 36 144 36 L166 36 Q174 36 178 44 L190 64 L190 88 Z" fill="#2fb344"/>
    <path d="M146 42 L164 42 Q169 42 172 48 L180 62 L146 62 Z" fill="#a8d8ff"/>
    <rect x="134" y="84" width="58" height="6" rx="2" fill="#c9ccd1"/>
    <rect x="182" y="68" width="9" height="6" rx="2" fill="#ffe066"/>
    <rect x="8" y="84" width="128" height="6" fill="#1d1f22"/>
    ${RUEDA(40, 92)}${RUEDA(82, 92)}${RUEDA(164, 92)}`,

  moto: `
    <path d="M44 84 L80 62 L132 62 L158 84" stroke="#2a2d33" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M150 84 L136 36" stroke="#2a2d33" stroke-width="6" stroke-linecap="round"/>
    <path d="M128 34 L146 30" stroke="#2a2d33" stroke-width="6" stroke-linecap="round"/>
    <path d="M70 62 Q76 40 104 42 L128 46 Q134 58 126 64 L80 66 Z" fill="#e63946"/>
    <path d="M48 52 Q52 44 64 44 L92 44 Q96 50 90 54 L52 56 Z" fill="#2a2d33"/>
    <circle cx="150" cy="48" r="8" fill="#ffe066" stroke="#2a2d33" stroke-width="3"/>
    <rect x="30" y="68" width="34" height="7" rx="3" fill="#9aa3ad"/>
    ${RUEDA(44, 86, 22)}${RUEDA(158, 86, 22)}`,
};

// id · palabra que dice la voz · color de la tarjeta
const VEHICULOS = [
  { id: 'policia', palabra: 'auto de policía', fondo: '#dbeafe' },
  { id: 'bomberos', palabra: 'camión de bomberos', fondo: '#ffe0e0' },
  { id: 'ambulancia', palabra: 'ambulancia', fondo: '#fde2e4' },
  { id: 'avion', palabra: 'avión', fondo: '#e0f2fe' },
  { id: 'tren', palabra: 'tren', fondo: '#fff1c2' },
  { id: 'camion', palabra: 'camión verde', fondo: '#dcfce7' },
  { id: 'moto', palabra: 'moto', fondo: '#f3e8ff' },
];

// ---------- Ruidos de cada uno ----------
const repetir = (veces, cada, fn) => { for (let i = 0; i < veces; i++) setTimeout(() => fn(i), i * cada); };
const RUIDOS = {
  policia: () => repetir(4, 200, (i) => tono(i % 2 ? 950 : 700, { duracion: 0.19, tipo: 'square', volumen: 0.08 })),
  ambulancia: () => repetir(4, 300, (i) => tono(i % 2 ? 780 : 600, { duracion: 0.29, volumen: 0.16 })),
  bomberos: () => { tono(450, { duracion: 0.6, tipo: 'sawtooth', volumen: 0.08, caida: 2 }); setTimeout(() => tono(900, { duracion: 0.6, tipo: 'sawtooth', volumen: 0.08, caida: 0.5 }), 600); },
  avion: () => tono(160, { duracion: 1.1, tipo: 'sawtooth', volumen: 0.07, caida: 2.6 }),
  tren: () => {
    tono(880, { duracion: 0.45, volumen: 0.12 }); tono(1108, { duracion: 0.45, volumen: 0.1 });
    repetir(4, 160, () => setTimeout(() => tono(120, { duracion: 0.1, tipo: 'triangle', volumen: 0.2, caida: 0.6 }), 480));
  },
  camion: () => repetir(2, 280, () => { tono(220, { duracion: 0.24, tipo: 'square', volumen: 0.09 }); tono(277, { duracion: 0.24, tipo: 'square', volumen: 0.08 }); }),
  moto: () => repetir(2, 380, () => tono(85, { duracion: 0.34, tipo: 'sawtooth', volumen: 0.12, caida: 2.2 })),
};

const PARLANTE_SVG = `
<svg viewBox="0 0 64 64" aria-hidden="true">
  <path d="M8 24h10l14-12v40L18 40H8z" fill="currentColor" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/>
  <path class="onda onda--1" d="M40 24c4 4 4 12 0 16" fill="none" stroke="currentColor" stroke-width="4.5" stroke-linecap="round"/>
  <path class="onda onda--2" d="M47 17c8 8 8 22 0 30" fill="none" stroke="currentColor" stroke-width="4.5" stroke-linecap="round"/>
</svg>`;

const elegir = (lista) => lista[Math.floor(Math.random() * lista.length)];
const azar = (min, max) => min + Math.random() * (max - min);

export function iniciar(contenedor) {
  const estilos = cargarEstilos('vehiculos', '/webapp/juegos/vehiculos.css');
  cargar(AUDIO_BIEN);

  const escena = document.createElement('div');
  escena.className = 'vehiculos';
  escena.style.visibility = 'hidden';
  escena.innerHTML = `
    <div class="vehiculos__contenido">
      <button class="vehiculos__parlante vehiculos__parlante--espera" type="button" aria-label="Escuchar qué vehículo tocar">${PARLANTE_SVG}</button>
      <div class="vehiculos__fila"></div>
    </div>`;
  contenedor.appendChild(escena);

  const parlante = escena.querySelector('.vehiculos__parlante');
  const fila = escena.querySelector('.vehiculos__fila');

  const botones = new Map();
  for (const v of VEHICULOS) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'vehiculo';
    b.dataset.id = v.id;
    b.style.setProperty('--fondo', v.fondo);
    b.setAttribute('aria-label', v.palabra);
    b.innerHTML = `<svg viewBox="0 0 200 120" aria-hidden="true">${DIBUJOS[v.id]}</svg>`;
    fila.appendChild(b);
    botones.set(v.id, b);
  }

  const estado = {
    quedan: new Set(VEHICULOS.map((v) => v.id)),
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

  const palabraDe = (id) => VEHICULOS.find((v) => v.id === id).palabra;

  async function decirObjetivo() {
    if (!estado.objetivo) return;
    parlante.classList.add('vehiculos__parlante--habla');
    await decir(palabraDe(estado.objetivo));
    parlante.classList.remove('vehiculos__parlante--habla');
  }

  function siguiente() {
    if (estado.quedan.size === 0) {
      festejo();
      return;
    }
    const opciones = [...estado.quedan].filter((id) => id !== estado.anterior || estado.quedan.size === 1);
    estado.objetivo = elegir(opciones);
    estado.anterior = estado.objetivo;
    estado.errores = 0;
    estado.ocupado = false;
    decirObjetivo();
  }

  function acierto(boton, id) {
    estado.ocupado = true;
    estado.objetivo = null;
    estado.quedan.delete(id);
    reproducir(AUDIO_BIEN, { velocidad: azar(0.98, 1.04) });
    // Si antes lo tocó mal, sacar esas animaciones: si no, tapan la de irse
    boton.classList.remove('vehiculo--mal', 'vehiculo--pista');
    despues(450, () => {
      RUIDOS[id]();
      reiniciarAnimacion(boton, 'vehiculo--ida');
      boton.addEventListener('animationend', () => {
        boton.classList.remove('vehiculo--ida');
        boton.classList.add('vehiculo--fuera');
      }, { once: true });
    });
    despues(1900, siguiente);
  }

  function error(boton) {
    tono(220, { duracion: 0.22, tipo: 'triangle', volumen: 0.18, caida: 0.8 });
    animarUnaVez(boton, 'vehiculo--mal');
    estado.errores += 1;
    if (estado.errores >= ERRORES_PARA_PISTA) {
      animarUnaVez(botones.get(estado.objetivo), 'vehiculo--pista');
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
      el.textContent = elegir(['⭐', '🌟', '🎉', '✨', '🚦']);
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
    despues(250, () => decir(`¡Muy bien, ${NOMBRE}!`, { velocidad: 0.9 }));
    despues(2800, nuevaRonda);
  }

  function nuevaRonda() {
    estado.quedan = new Set(VEHICULOS.map((v) => v.id));
    VEHICULOS.forEach(({ id }, i) => {
      const b = botones.get(id);
      b.classList.remove('vehiculo--fuera', 'vehiculo--ida');
      b.style.animationDelay = `${i * 110}ms`;
      reiniciarAnimacion(b, 'vehiculo--vuelve');
      b.addEventListener('animationend', () => {
        b.classList.remove('vehiculo--vuelve');
        b.style.animationDelay = '';
      }, { once: true });
    });
    despues(1500, siguiente);
  }

  const esperaVoz = () => parlante.classList.contains('vehiculos__parlante--espera');
  const despertarVoz = () => parlante.classList.remove('vehiculos__parlante--espera');

  parlante.addEventListener('click', () => {
    despertarVoz();
    if (estado.objetivo) decirObjetivo();
    else if (!estado.ocupado) siguiente();
  });

  fila.addEventListener('pointerdown', (e) => {
    const boton = e.target.closest('.vehiculo');
    if (!boton) return;
    // Primer toque de todos: en iPad recién ahora puede sonar la voz, así que
    // este toque solo dice el vehículo pedido (no cuenta como respuesta)
    if (esperaVoz()) {
      despertarVoz();
      if (estado.objetivo) decirObjetivo();
      return;
    }
    const id = boton.dataset.id;
    if (estado.ocupado || !estado.quedan.has(id)) return;
    if (!estado.objetivo) {
      animarUnaVez(boton, 'vehiculo--pista');
      decir(palabraDe(id));
      return;
    }
    if (id === estado.objetivo) acierto(boton, id);
    else error(boton);
  });

  estilos.then(() => {
    escena.style.visibility = '';
    despues(700, siguiente);
  });

  return function detener() {
    timers.forEach(clearTimeout);
    callar();
    escena.remove();
  };
}
