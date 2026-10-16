// Ratoncitos y el gato
// Cinco ratoncitos bailan twist. Un gato negro se acerca a llevarse uno:
// si lo tocás antes de que llegue, se asusta y se va... y vuelve más rápido.
// Si llega, se lleva un ratoncito y la velocidad vuelve a empezar.
// Cuando queda uno solo, los demás vuelven por la cueva y arranca de nuevo.
import { cargarEstilos } from '../lib/estilos.js';
import { crearTwist } from '../lib/twist.js';
import { tono, cargar, reproducir, estaActivo } from '../lib/sonido.js';
import { leerArchivo, guardarArchivo } from '../lib/almacen.js';
import { decir, callar } from '../lib/voz.js';

const AUDIO_BIEN = '/webapp/assets/auto/bien.wav';
const COLORES = ['#ff6b6b', '#ffb703', '#06d6a0', '#4cc9f0', '#9b6bff'];

const VIAJE_INICIAL = 7000; // ms que tarda el gato en llegar la primera vez
const VIAJE_MINIMO = 1600;
const ACELERACION = 0.72; // cada susto, el viaje dura esto del anterior
const PAUSA_ENTRE_ATAQUES = 1100;
const BPM_BASE = 150;
const ARCHIVO_VIDEO = 'ratones:video'; // video propio cargado desde el dispositivo (no se sube)
const PRESION_LARGA = 900; // ms apretando la tele para elegir el video

const RATON_SVG = `
<svg viewBox="0 0 100 120" aria-hidden="true">
  <g class="raton__cuerpo">
    <path d="M70 102 C96 102 98 80 86 72" stroke="#c08a9a" stroke-width="4" fill="none" stroke-linecap="round"/>
    <ellipse cx="38" cy="114" rx="10" ry="5" fill="#f4a7b9"/>
    <ellipse cx="62" cy="114" rx="10" ry="5" fill="#f4a7b9"/>
    <ellipse cx="28" cy="86" rx="6" ry="11" fill="#b3b8bd" transform="rotate(20 28 86)"/>
    <ellipse cx="72" cy="86" rx="6" ry="11" fill="#b3b8bd" transform="rotate(-20 72 86)"/>
    <ellipse cx="50" cy="90" rx="22" ry="24" style="fill: var(--remera)"/>
    <ellipse cx="50" cy="94" rx="11" ry="13" fill="#fff" opacity="0.35"/>
    <circle cx="26" cy="26" r="18" fill="#9aa0a6"/>
    <circle cx="26" cy="26" r="11" fill="#f4a7b9"/>
    <circle cx="74" cy="26" r="18" fill="#9aa0a6"/>
    <circle cx="74" cy="26" r="11" fill="#f4a7b9"/>
    <circle cx="50" cy="48" r="27" fill="#b3b8bd"/>
    <g class="ojo-normal">
      <circle cx="41" cy="45" r="5" fill="#222"/><circle cx="42.6" cy="43.4" r="1.8" fill="#fff"/>
      <circle cx="59" cy="45" r="5" fill="#222"/><circle cx="60.6" cy="43.4" r="1.8" fill="#fff"/>
    </g>
    <g class="ojo-miedo">
      <circle cx="41" cy="44" r="7.5" fill="#fff" stroke="#222" stroke-width="2"/><circle cx="41" cy="44" r="2.5" fill="#222"/>
      <circle cx="59" cy="44" r="7.5" fill="#fff" stroke="#222" stroke-width="2"/><circle cx="59" cy="44" r="2.5" fill="#222"/>
    </g>
    <circle cx="50" cy="57" r="5" fill="#f08aa8"/>
    <path d="M45 58 L25 54 M45 60 L25 63 M55 58 L75 54 M55 60 L75 63" stroke="#666" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M45 64 q5 4 10 0" stroke="#555" stroke-width="2" fill="none" stroke-linecap="round"/>
  </g>
</svg>`;

const GATO_SVG = `
<svg viewBox="0 0 160 170" aria-hidden="true">
  <g class="gato__cuerpo">
    <path d="M118 142 C160 132 152 80 138 68" stroke="#1d1d22" stroke-width="13" fill="none" stroke-linecap="round"/>
    <ellipse cx="80" cy="128" rx="40" ry="34" fill="#1d1d22"/>
    <ellipse cx="80" cy="132" rx="20" ry="20" fill="#2c2c34"/>
    <ellipse cx="58" cy="160" rx="13" ry="8" fill="#1d1d22"/>
    <ellipse cx="102" cy="160" rx="13" ry="8" fill="#1d1d22"/>
    <path d="M42 42 L50 2 L76 28 Z M118 42 L110 2 L84 28 Z" fill="#1d1d22"/>
    <path d="M50 34 L54 14 L66 28 Z M110 34 L106 14 L94 28 Z" fill="#4a3a44"/>
    <circle cx="80" cy="58" r="40" fill="#1d1d22"/>
    <g class="cara-normal">
      <ellipse cx="63" cy="55" rx="10" ry="12" fill="#ffd60a"/><ellipse cx="63" cy="55" rx="3" ry="10" fill="#111"/>
      <ellipse cx="97" cy="55" rx="10" ry="12" fill="#ffd60a"/><ellipse cx="97" cy="55" rx="3" ry="10" fill="#111"/>
      <path d="M52 40 L72 46 M108 40 L88 46" stroke="#555" stroke-width="3" stroke-linecap="round"/>
      <path d="M71 80 q9 7 9 0 q0 7 9 0" stroke="#777" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    </g>
    <g class="cara-susto">
      <circle cx="63" cy="54" r="14" fill="#ffd60a"/><circle cx="63" cy="54" r="3.5" fill="#111"/>
      <circle cx="97" cy="54" r="14" fill="#ffd60a"/><circle cx="97" cy="54" r="3.5" fill="#111"/>
      <ellipse cx="80" cy="84" rx="8" ry="10" fill="#ff8fab"/>
    </g>
    <path d="M76 70 L84 70 L80 75 Z" fill="#ff8fab"/>
    <path d="M66 72 L36 66 M66 76 L36 80 M94 72 L124 66 M94 76 L124 80" stroke="#ddd" stroke-width="2" stroke-linecap="round"/>
  </g>
</svg>`;

const azar = (min, max) => min + Math.random() * (max - min);
const elegir = (lista) => lista[Math.floor(Math.random() * lista.length)];

// ---------- Sonidos ----------
const chillido = () => tono(1800, { duracion: 0.12, volumen: 0.12, caida: 1.4 });
const bufido = () => tono(260, { duracion: 0.35, tipo: 'sawtooth', volumen: 0.12, caida: 0.5 });
const maullido = () => {
  tono(500, { duracion: 0.25, tipo: 'triangle', volumen: 0.18, caida: 1.5 });
  setTimeout(() => tono(750, { duracion: 0.35, tipo: 'triangle', volumen: 0.16, caida: 0.6 }), 230);
};

export function iniciar(contenedor) {
  const estilos = cargarEstilos('ratones', '/webapp/juegos/ratones.css');
  cargar(AUDIO_BIEN);
  const musica = crearTwist({ bpm: BPM_BASE });

  const escena = document.createElement('div');
  escena.className = 'ratones-juego';
  escena.style.visibility = 'hidden';
  escena.innerHTML = `
    <div class="ratones-juego__cueva"></div>
    <div class="tele" aria-label="Tele: mantené apretado para elegir un video">
      <video class="tele__video" playsinline loop preload="auto" hidden></video>
      <div class="tele__vacia">📺<small>Mantené apretado para elegir el video</small></div>
      <div class="tele__elegir" hidden>🎬 Elegir video<input class="tele__archivo" type="file" accept="video/*,audio/*" aria-label="Elegir video"></div>
    </div>
    <div class="ratones-juego__marcador" aria-live="polite"></div>
    <div class="ratones-juego__ratones ratones--bailan"></div>
    <div class="gato" role="button" aria-label="Gato: tocalo para ahuyentarlo" hidden>${GATO_SVG}</div>`;
  contenedor.appendChild(escena);

  const capaRatones = escena.querySelector('.ratones-juego__ratones');
  const gato = escena.querySelector('.gato');
  const marcador = escena.querySelector('.ratones-juego__marcador');
  const tele = escena.querySelector('.tele');
  const video = escena.querySelector('.tele__video');
  const teleVacia = escena.querySelector('.tele__vacia');
  const inputArchivo = escena.querySelector('.tele__archivo');
  const botonElegir = escena.querySelector('.tele__elegir');
  let urlVideo = null;

  const estado = {
    ratones: [], // elementos, de izquierda a derecha
    fase: 'baile', // 'baile' | 'viene' | 'huye' | 'atrapa' | 'final'
    viaje: VIAJE_INICIAL,
    sustos: 0,
    entrada: null,
    gato: { x: 0, y: 0 },
  };

  const timers = new Set();
  const despues = (ms, fn) => {
    const id = setTimeout(() => { timers.delete(id); fn(); }, ms);
    timers.add(id);
    return id;
  };
  const cancelar = (id) => { clearTimeout(id); timers.delete(id); };
  let timerLlega = 0;
  let timerMiedo = 0;

  function medidas() {
    const w = escena.clientWidth;
    const h = escena.clientHeight;
    const ratonAlto = Math.min(h * 0.24, w * 0.14);
    return {
      w, h,
      ratonAlto,
      ratonAncho: ratonAlto * (100 / 120),
      gato: Math.min(h * 0.42, w * 0.26),
      piso: h * 0.93,
    };
  }

  // ---------- Ratoncitos ----------

  function crearRaton(color) {
    const el = document.createElement('div');
    el.className = 'raton';
    el.style.setProperty('--remera', color);
    el.innerHTML = RATON_SVG;
    el.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      asegurarMusica();
      if (el.classList.contains('raton--atrapado')) return;
      chillido();
      reiniciarAnimacion(el, 'raton--salta');
    });
    return el;
  }

  function posicionRaton(i, n, m) {
    const sep = m.ratonAncho * 1.3;
    const x = m.w / 2 - (sep * (n - 1)) / 2 + i * sep;
    return { x, y: m.piso };
  }

  function acomodarRatones() {
    const m = medidas();
    estado.ratones.forEach((el, i) => {
      const p = posicionRaton(i, estado.ratones.length, m);
      el.style.width = `${m.ratonAncho}px`;
      el.style.height = `${m.ratonAlto}px`;
      el.style.transform = `translate3d(${p.x - m.ratonAncho / 2}px, ${p.y - m.ratonAlto}px, 0)`;
    });
    marcador.textContent = '🐭'.repeat(estado.ratones.length);
  }

  // Los que faltan salen de la cueva
  function completarRatones() {
    const m = medidas();
    const usados = new Set(estado.ratones.map((el) => el.style.getPropertyValue('--remera')));
    const nuevos = COLORES.filter((c) => !usados.has(c)).map(crearRaton);
    const cuevaX = m.w / 2 - m.ratonAncho / 2;
    const cuevaY = m.h * 0.64 - m.ratonAlto;
    for (const el of nuevos) {
      el.style.width = `${m.ratonAncho}px`;
      el.style.height = `${m.ratonAlto}px`;
      el.style.transition = 'none';
      el.style.transform = `translate3d(${cuevaX}px, ${cuevaY}px, 0) scale(0.3)`;
      capaRatones.appendChild(el);
    }
    // Ordenarlos por color para que siempre queden en el mismo orden
    estado.ratones = [...capaRatones.children].sort(
      (a, b) => COLORES.indexOf(a.style.getPropertyValue('--remera')) - COLORES.indexOf(b.style.getPropertyValue('--remera')),
    );
    estado.ratones.forEach((el) => capaRatones.appendChild(el));
    void capaRatones.offsetWidth;
    nuevos.forEach((el) => { el.style.transition = ''; });
    acomodarRatones();
  }

  // ---------- Gato ----------

  function moverGato(x, y, ms = 0, curva = 'linear') {
    gato.style.transition = ms ? `transform ${ms}ms ${curva}` : 'none';
    gato.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    estado.gato = { x, y };
  }

  // Dónde está el gato ahora mismo (puede estar a mitad de camino)
  function gatoAhora() {
    const caja = escena.getBoundingClientRect();
    const r = gato.getBoundingClientRect();
    return { x: r.left - caja.left, y: r.top - caja.top };
  }

  function puntoDeEntrada(lado, m) {
    const g = m.gato;
    switch (lado) {
      case 'izq': return { x: -g, y: m.piso - g };
      case 'der': return { x: m.w, y: m.piso - g };
      case 'arriba-izq': return { x: m.w * 0.05, y: -g };
      default: return { x: m.w * 0.95 - g, y: -g }; // arriba-der
    }
  }

  const vieneDeLaIzquierda = () => estado.entrada === 'izq' || estado.entrada === 'arriba-izq';
  const ratonObjetivo = () => (vieneDeLaIzquierda() ? estado.ratones[0] : estado.ratones[estado.ratones.length - 1]);

  function puntoDeAtaque(m) {
    const n = estado.ratones.length;
    const i = vieneDeLaIzquierda() ? 0 : n - 1;
    const p = posicionRaton(i, n, m);
    const lado = vieneDeLaIzquierda() ? -1 : 1;
    const x = p.x + lado * (m.ratonAncho * 0.35 + m.gato * 0.4) - m.gato / 2;
    return { x, y: m.piso - m.gato };
  }

  function ataque() {
    if (estado.ratones.length <= 1) return;
    const m = medidas();
    estado.fase = 'viene';
    estado.entrada = elegir(['izq', 'der', 'arriba-izq', 'arriba-der']);
    gato.style.width = gato.style.height = `${m.gato}px`;
    gato.hidden = false;
    gato.className = 'gato gato--camina';
    const inicio = puntoDeEntrada(estado.entrada, m);
    moverGato(inicio.x, inicio.y);
    void gato.offsetWidth;
    const destino = puntoDeAtaque(m);
    moverGato(destino.x, destino.y, estado.viaje);
    maullido();

    timerMiedo = despues(estado.viaje * 0.55, () => capaRatones.classList.add('ratones--miedo'));
    timerLlega = despues(estado.viaje, atrapar);
  }

  function ahuyentar() {
    cancelar(timerLlega);
    cancelar(timerMiedo);
    estado.fase = 'huye';
    estado.sustos += 1;

    const aqui = gatoAhora();
    moverGato(aqui.x, aqui.y); // se congela donde estaba
    gato.className = 'gato gato--susto';
    reproducir(AUDIO_BIEN, { velocidad: azar(0.98, 1.05) });
    bufido();
    grito('¡Fuera!', aqui.x + gato.offsetWidth / 2, aqui.y);

    capaRatones.classList.remove('ratones--miedo');
    estado.ratones.forEach((el, i) => setTimeout(() => reiniciarAnimacion(el, 'raton--salta'), i * 70));

    // Vuelve más rápido la próxima vez, y la música acompaña
    estado.viaje = Math.round(Math.max(VIAJE_MINIMO, estado.viaje * ACELERACION));
    ajustarTempo();

    despues(380, () => {
      const m = medidas();
      gato.className = 'gato gato--huye';
      const salida = puntoDeEntrada(estado.entrada, m);
      moverGato(salida.x, salida.y, 600, 'ease-in');
    });
    despues(1000, () => {
      gato.hidden = true;
      estado.fase = 'baile';
    });
    despues(1000 + PAUSA_ENTRE_ATAQUES, ataque);
  }

  function atrapar() {
    estado.fase = 'atrapa';
    const raton = ratonObjetivo();
    const m = medidas();
    maullido();
    chillido();
    raton.classList.add('raton--atrapado');

    // Se van juntos por el costado más cercano
    const haciaIzq = vieneDeLaIzquierda();
    const salidaX = haciaIzq ? -m.gato - m.ratonAncho : m.w + m.ratonAncho;
    gato.className = 'gato gato--huye';
    moverGato(salidaX, estado.gato.y, 1100, 'ease-in');
    const desplazamiento = haciaIzq ? m.gato * 0.55 : -m.ratonAncho * 0.6;
    raton.style.transition = 'transform 1100ms ease-in';
    raton.style.transform = `translate3d(${salidaX + m.gato / 2 + desplazamiento}px, ${m.piso - m.ratonAlto * 1.2}px, 0)`;

    despues(1150, () => {
      gato.hidden = true;
      raton.remove();
      estado.ratones = estado.ratones.filter((el) => el !== raton);
      capaRatones.classList.remove('ratones--miedo');
      acomodarRatones();
      // Quedan menos: la dificultad vuelve a empezar
      estado.viaje = VIAJE_INICIAL;
      estado.sustos = 0;
      ajustarTempo();
      if (estado.ratones.length <= 1) final();
      else {
        estado.fase = 'baile';
        despues(1800, ataque);
      }
    });
  }

  function final() {
    estado.fase = 'final';
    despues(900, () => {
      completarRatones();
      confeti();
      reproducir(AUDIO_BIEN);
      despues(700, () => decir('¡Volvieron los ratoncitos!', { velocidad: 0.95 }));
    });
    despues(4200, () => {
      estado.fase = 'baile';
      ataque();
    });
  }

  // ---------- Detalles ----------

  function reiniciarAnimacion(el, clase) {
    el.classList.remove(clase);
    void el.offsetWidth;
    el.classList.add(clase);
    el.addEventListener('animationend', () => el.classList.remove(clase), { once: true });
  }

  function grito(texto, x, y) {
    const el = document.createElement('div');
    el.className = 'ratones-juego__grito';
    el.textContent = texto;
    el.style.left = `${x}px`;
    el.style.top = `${Math.max(8, y)}px`;
    el.addEventListener('animationend', () => el.remove(), { once: true });
    escena.appendChild(el);
  }

  function confeti() {
    const caja = escena.getBoundingClientRect();
    const cx = caja.width / 2;
    const cy = caja.height * 0.6;
    for (let i = 0; i < 24; i++) {
      const el = document.createElement('span');
      el.className = 'confeti';
      el.textContent = elegir(['⭐', '🧀', '🎉', '✨', '🎶']);
      el.style.fontSize = `${azar(28, 50)}px`;
      const angulo = azar(Math.PI, Math.PI * 2);
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

  function ajustarTempo() {
    const bpm = Math.min(200, BPM_BASE + estado.sustos * 10);
    musica.tempo(bpm);
    escena.style.setProperty('--pulso', `${60 / bpm}s`);
    // Con el video propio, la canción también se acelera un poco con cada susto
    video.playbackRate = bpm / BPM_BASE;
  }

  // ---------- Tele: video propio guardado solo en este dispositivo ----------

  const hayVideo = () => Boolean(urlVideo);

  function ponerVideo(blob) {
    if (urlVideo) URL.revokeObjectURL(urlVideo);
    urlVideo = URL.createObjectURL(blob);
    video.src = urlVideo;
    video.hidden = false;
    teleVacia.hidden = true;
    musica.parar(); // la canción del video reemplaza a la música generada
    ajustarTempo();
  }

  inputArchivo.addEventListener('change', async () => {
    const archivo = inputArchivo.files && inputArchivo.files[0];
    inputArchivo.value = '';
    botonElegir.hidden = true;
    if (!archivo) return;
    ponerVideo(archivo);
    asegurarMusica();
    await guardarArchivo(ARCHIVO_VIDEO, archivo);
  });

  // Presión larga sobre la tele: aparece el botón "Elegir video" (un toque corto no
  // hace nada, así el nene no lo abre sin querer). El selector se abre al tocar ese
  // botón: Safari en iPhone/iPad solo lo permite si lo abre el toque mismo, no un temporizador.
  let timerPresion = 0;
  let timerOcultar = 0;
  tele.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    asegurarMusica();
    if (!botonElegir.hidden) return;
    clearTimeout(timerPresion);
    timerPresion = setTimeout(() => {
      botonElegir.hidden = false;
      clearTimeout(timerOcultar);
      timerOcultar = setTimeout(() => { botonElegir.hidden = true; }, 8000);
    }, PRESION_LARGA);
  });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => tele.addEventListener(ev, () => clearTimeout(timerPresion)));
  tele.addEventListener('contextmenu', (e) => e.preventDefault());

  leerArchivo(ARCHIVO_VIDEO).then((blob) => {
    if (blob && escena.isConnected) {
      ponerVideo(blob);
      asegurarMusica();
    }
  });

  // La música necesita un toque previo en iPad: se reintenta en cada toque
  function asegurarMusica() {
    if (document.visibilityState !== 'visible') return;
    if (hayVideo()) {
      video.muted = !estaActivo();
      if (video.paused) video.play().catch(() => {});
      return;
    }
    if (!musica.sonando) musica.empezar();
  }

  gato.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    asegurarMusica();
    if (estado.fase === 'viene') ahuyentar();
  });
  escena.addEventListener('pointerdown', asegurarMusica);

  const alCambiarVisibilidad = () => {
    if (document.visibilityState === 'hidden') {
      musica.parar();
      video.pause();
    } else asegurarMusica();
  };
  document.addEventListener('visibilitychange', alCambiarVisibilidad);
  const alRedimensionar = () => acomodarRatones();
  window.addEventListener('resize', alRedimensionar);

  estilos.then(() => {
    completarRatones();
    ajustarTempo();
    escena.style.visibility = '';
    asegurarMusica();
    despues(2500, ataque); // primero un ratito de baile
  });

  return function detener() {
    timers.forEach(clearTimeout);
    clearTimeout(timerPresion);
    clearTimeout(timerOcultar);
    musica.parar();
    video.pause();
    video.removeAttribute('src');
    if (urlVideo) URL.revokeObjectURL(urlVideo);
    callar();
    document.removeEventListener('visibilitychange', alCambiarVisibilidad);
    window.removeEventListener('resize', alRedimensionar);
    escena.remove();
  };
}
