// El auto: el parlante dice una parte ("motor", "rueda"...) y hay que tocarla en el auto.
// Si acierta suena "¡Bien!" y la parte hace lo suyo (la bocina toca, la luz se prende...).
// Se piden las 8 partes en orden al azar; al terminar, festejo y otra vuelta.
// Si se equivoca dos veces seguidas, la parte correcta late para darle una pista.
import { cargarEstilos } from '../lib/estilos.js';
import { decir, callar } from '../lib/voz.js';
import { tono, cargar, reproducir } from '../lib/sonido.js';

const NOMBRE = 'Gael';
const AUDIO_BIEN = '/webapp/assets/auto/bien.wav';
const ERRORES_PARA_PISTA = 2;

// id: el data-parte del dibujo · palabra: lo que dice la voz
const PARTES = [
  { id: 'motor', palabra: 'motor' },
  { id: 'rueda', palabra: 'rueda' },
  { id: 'baul', palabra: 'baúl' },
  { id: 'asiento', palabra: 'asiento' },
  { id: 'espejo', palabra: 'espejo' },
  { id: 'vidrio', palabra: 'vidrio' },
  { id: 'luz', palabra: 'luz' },
  { id: 'bocina', palabra: 'bocina' },
];

const PARLANTE_SVG = `
<svg viewBox="0 0 64 64" aria-hidden="true">
  <path d="M8 24h10l14-12v40L18 40H8z" fill="currentColor" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/>
  <path class="onda onda--1" d="M40 24c4 4 4 12 0 16" fill="none" stroke="currentColor" stroke-width="4.5" stroke-linecap="round"/>
  <path class="onda onda--2" d="M47 17c8 8 8 22 0 30" fill="none" stroke="currentColor" stroke-width="4.5" stroke-linecap="round"/>
</svg>`;

// Auto antiguo descapotable, mirando a la izquierda. Cada parte tocable es un <g class="parte">
// con una forma transparente (.toque) más grande que el dibujo, para dedos chicos.
const RUEDA = (cx) => `
  <g class="rueda-giro">
    <circle cx="${cx}" cy="338" r="64" fill="#1b1b1e"/>
    <circle cx="${cx}" cy="338" r="47" fill="#f2c200"/>
    <circle cx="${cx}" cy="338" r="40" fill="none" stroke="#d9a900" stroke-width="3"/>
    ${[0, 30, 60, 90, 120, 150].map((a) => `<line x1="${cx}" y1="300" x2="${cx}" y2="376" stroke="#c99a00" stroke-width="4" transform="rotate(${a} ${cx} 338)"/>`).join('')}
    <circle cx="${cx}" cy="338" r="13" fill="#d7dade" stroke="#9fa4ab" stroke-width="3"/>
  </g>
  <circle class="toque" cx="${cx}" cy="338" r="76"/>`;

const AUTO_SVG = `
<svg class="auto" viewBox="0 0 820 420" role="img" aria-label="Auto verde antiguo">
  <!-- capota plegada atrás -->
  <path d="M640 196 C640 150 690 138 728 150 L742 196 Z" fill="#26282c"/>
  <path d="M652 190 C656 162 690 154 722 160" stroke="#3b3e44" stroke-width="5" fill="none"/>

  <!-- asiento -->
  <g class="parte" data-parte="asiento">
    <g class="asiento-dibujo">
      <path d="M492 206 L498 132 Q500 112 522 110 L590 108 Q612 108 614 130 L618 206 Z" fill="#8b4a2b"/>
      <path d="M518 128 L520 196 M556 124 L556 196 M592 126 L594 196" stroke="#6d3820" stroke-width="5" stroke-linecap="round"/>
      <path d="M506 128 Q508 118 522 118 L590 116" stroke="#b0653f" stroke-width="5" fill="none" stroke-linecap="round"/>
    </g>
    <rect class="toque" x="484" y="96" width="142" height="112" rx="16"/>
  </g>

  <!-- carrocería -->
  <path d="M318 200 L702 190 Q730 192 732 216 L734 304 L318 308 Z" fill="#2fb344"/>
  <path d="M318 214 L732 206" stroke="#7fdc8e" stroke-width="5" opacity="0.6"/>
  <path d="M432 214 L436 300 M600 210 L602 300" stroke="#1f8a33" stroke-width="4"/>
  <rect x="452" y="236" width="26" height="7" rx="3" fill="#c9ccd1"/>
  <!-- estribo -->
  <rect x="270" y="300" width="300" height="16" rx="6" fill="#1d1f22"/>

  <!-- baúl -->
  <g class="parte" data-parte="baul">
    <rect x="726" y="200" width="70" height="100" rx="14" fill="#27a03b"/>
    <rect class="baul-tapa" x="722" y="186" width="78" height="22" rx="8" fill="#1f8a33"/>
    <rect x="750" y="240" width="22" height="8" rx="4" fill="#c9ccd1"/>
    <rect class="toque" x="712" y="170" width="100" height="140" rx="16"/>
  </g>

  <!-- motor (capó) -->
  <g class="parte" data-parte="motor">
    <path d="M112 228 Q114 210 134 208 L322 198 L322 304 L112 304 Z" fill="#2fb344"/>
    <path d="M118 222 L320 210" stroke="#7fdc8e" stroke-width="5" opacity="0.6"/>
    ${[176, 200, 224, 248, 272].map((x) => `<line x1="${x}" y1="232" x2="${x}" y2="272" stroke="#1f8a33" stroke-width="7" stroke-linecap="round"/>`).join('')}
    <!-- parrilla -->
    <rect x="90" y="204" width="30" height="102" rx="10" fill="#c9ccd1"/>
    ${[218, 236, 254, 272, 290].map((y) => `<line x1="96" y1="${y}" x2="114" y2="${y}" stroke="#8e9399" stroke-width="4" stroke-linecap="round"/>`).join('')}
    <rect class="toque" x="84" y="194" width="244" height="116" rx="16"/>
  </g>
  <!-- paragolpes -->
  <rect x="66" y="296" width="44" height="14" rx="7" fill="#c9ccd1"/>

  <!-- vidrio (parabrisas) -->
  <g class="parte" data-parte="vidrio">
    <path d="M326 204 L340 82 L428 82 L414 204 Z" fill="rgba(170, 220, 255, 0.55)" stroke="#2a2d33" stroke-width="7" stroke-linejoin="round"/>
    <path class="reflejo reflejo-vidrio" d="M356 186 L370 100 L384 100 L370 186 Z" fill="#fff"/>
    <rect class="toque" x="318" y="70" width="118" height="140" rx="12"/>
  </g>

  <!-- espejo -->
  <g class="parte" data-parte="espejo">
    <path d="M338 102 L302 92" stroke="#2a2d33" stroke-width="6" stroke-linecap="round"/>
    <ellipse cx="286" cy="88" rx="22" ry="17" fill="#c9ccd1" stroke="#8e9399" stroke-width="4"/>
    <ellipse cx="286" cy="88" rx="14" ry="10" fill="#bfe6ff"/>
    <path class="reflejo reflejo-espejo" d="M278 82 L290 82" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
    <circle class="toque" cx="290" cy="90" r="40"/>
  </g>

  <!-- volante con la bocina en el centro -->
  <g class="parte" data-parte="bocina">
    <path d="M462 214 L472 168" stroke="#2a2d33" stroke-width="9" stroke-linecap="round"/>
    <circle cx="474" cy="146" r="38" fill="none" stroke="#2a2d33" stroke-width="10"/>
    <path d="M474 146 L444 132 M474 146 L504 132 M474 146 L474 182" stroke="#2a2d33" stroke-width="6" stroke-linecap="round"/>
    <circle class="bocina-boton" cx="474" cy="146" r="16" fill="#e8b100" stroke="#a37c00" stroke-width="3"/>
    <circle class="toque" cx="474" cy="148" r="52"/>
  </g>

  <!-- guardabarros y ruedas -->
  <path d="M120 310 Q132 254 212 250 Q292 254 306 310 Z" fill="#1d1f22"/>
  <path d="M500 312 Q514 254 592 250 Q670 254 684 312 Z" fill="#1d1f22"/>
  <g class="parte" data-parte="rueda">${RUEDA(212)}</g>
  <g class="parte" data-parte="rueda">${RUEDA(592)}</g>

  <!-- luz (farol) -->
  <g class="parte" data-parte="luz">
    <path class="haz" d="M96 176 L0 128 L0 236 Z" fill="rgba(255, 236, 140, 0.55)"/>
    <path d="M132 210 L126 196" stroke="#8e9399" stroke-width="7" stroke-linecap="round"/>
    <circle cx="116" cy="178" r="30" fill="#c9ccd1" stroke="#8e9399" stroke-width="4"/>
    <circle class="faro-vidrio" cx="110" cy="178" r="20" fill="#fff3b0"/>
    <circle cx="104" cy="172" r="6" fill="#fff"/>
    <circle class="toque" cx="116" cy="180" r="46"/>
  </g>
</svg>`;

const elegir = (lista) => lista[Math.floor(Math.random() * lista.length)];
const azar = (min, max) => min + Math.random() * (max - min);
const mezclar = (lista) => lista.map((v) => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map(([, v]) => v);

// ---------- Sonidos de cada parte ----------
const EFECTOS = {
  motor() {
    for (let i = 0; i < 6; i++) setTimeout(() => tono(70 + i * 6, { duracion: 0.14, tipo: 'sawtooth', volumen: 0.18, caida: 1.3 }), i * 110);
  },
  bocina() {
    [0, 260].forEach((t) => setTimeout(() => {
      tono(370, { duracion: 0.2, tipo: 'square', volumen: 0.12 });
      tono(466, { duracion: 0.2, tipo: 'square', volumen: 0.1 });
    }, t));
  },
  rueda() { tono(300, { duracion: 0.6, tipo: 'triangle', volumen: 0.15, caida: 2.2 }); },
  luz() { tono(1318, { duracion: 0.25, volumen: 0.15 }); },
  baul() { tono(180, { duracion: 0.12, tipo: 'triangle', volumen: 0.2, caida: 0.6 }); },
  asiento() { tono(260, { duracion: 0.3, volumen: 0.2, caida: 1.8 }); },
  espejo() { tono(1568, { duracion: 0.3, volumen: 0.12 }); },
  vidrio() { tono(1175, { duracion: 0.35, volumen: 0.12, caida: 1.3 }); },
};

// Clase que se le pone al <svg> para animar la parte (ver auto.css)
const CLASE_EFECTO = {
  motor: 'auto--vibra',
  rueda: 'auto--ruedas',
  luz: 'auto--luz',
  baul: 'auto--baul',
  asiento: 'auto--asiento',
  espejo: 'auto--espejo',
  vidrio: 'auto--vidrio',
  bocina: 'auto--bocina',
};

export function iniciar(contenedor) {
  const estilos = cargarEstilos('auto', '/webapp/juegos/auto.css');
  cargar(AUDIO_BIEN);

  const escena = document.createElement('div');
  escena.className = 'auto-juego';
  escena.style.visibility = 'hidden';
  escena.innerHTML = `
    <button class="auto-juego__parlante auto-juego__parlante--espera" type="button" aria-label="Escuchar qué parte tocar">${PARLANTE_SVG}</button>
    <div class="auto-juego__escenario">${AUTO_SVG}</div>`;
  contenedor.appendChild(escena);

  const parlante = escena.querySelector('.auto-juego__parlante');
  const svg = escena.querySelector('.auto');

  const estado = { cola: [], objetivo: null, errores: 0, ocupado: false };

  const timers = new Set();
  const despues = (ms, fn) => {
    const id = setTimeout(() => { timers.delete(id); fn(); }, ms);
    timers.add(id);
  };

  function reiniciarAnimacion(el, clase) {
    el.classList.remove(clase);
    void el.getBoundingClientRect();
    el.classList.add(clase);
  }

  const gruposDe = (id) => [...svg.querySelectorAll(`.parte[data-parte="${id}"]`)];

  async function decirObjetivo() {
    if (!estado.objetivo) return;
    parlante.classList.add('auto-juego__parlante--habla');
    await decir(estado.objetivo.palabra);
    parlante.classList.remove('auto-juego__parlante--habla');
  }

  function siguiente() {
    if (estado.cola.length === 0) {
      festejo();
      return;
    }
    estado.objetivo = estado.cola.shift();
    estado.errores = 0;
    estado.ocupado = false;
    decirObjetivo();
  }

  function acierto(id) {
    estado.ocupado = true;
    estado.objetivo = null;
    reproducir(AUDIO_BIEN, { velocidad: azar(0.98, 1.04) });
    gruposDe(id).forEach((g) => reiniciarAnimacion(g, 'parte--bien'));
    const clase = CLASE_EFECTO[id];
    despues(450, () => {
      EFECTOS[id]();
      reiniciarAnimacion(svg, clase);
    });
    despues(1700, () => svg.classList.remove(clase));
    despues(1900, siguiente);
  }

  function error(grupo) {
    tono(220, { duracion: 0.22, tipo: 'triangle', volumen: 0.18, caida: 0.8 });
    reiniciarAnimacion(grupo, 'parte--mal');
    estado.errores += 1;
    if (estado.errores >= ERRORES_PARA_PISTA) {
      gruposDe(estado.objetivo.id).forEach((g) => reiniciarAnimacion(g, 'parte--pista'));
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
      el.textContent = elegir(['⭐', '🌟', '🎉', '✨', '🚗']);
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
    EFECTOS.bocina();
    reiniciarAnimacion(svg, 'auto--festejo');
    despues(400, () => decir(`¡Muy bien, ${NOMBRE}!`, { velocidad: 0.9 }));
    despues(3000, () => {
      svg.classList.remove('auto--festejo');
      nuevaRonda();
    });
  }

  function nuevaRonda() {
    estado.cola = mezclar(PARTES);
    siguiente();
  }

  const esperaVoz = () => parlante.classList.contains('auto-juego__parlante--espera');
  const despertarVoz = () => parlante.classList.remove('auto-juego__parlante--espera');

  parlante.addEventListener('click', () => {
    despertarVoz();
    if (estado.objetivo) decirObjetivo();
  });

  svg.addEventListener('pointerdown', (e) => {
    const grupo = e.target.closest('.parte');
    if (!grupo) return;
    // Primer toque de todos: en iPad recién ahora puede sonar la voz, así que
    // este toque solo dice la parte pedida (no cuenta como respuesta)
    if (esperaVoz()) {
      despertarVoz();
      decirObjetivo();
      return;
    }
    if (estado.ocupado || !estado.objetivo) return;
    if (grupo.dataset.parte === estado.objetivo.id) acierto(grupo.dataset.parte);
    else error(grupo);
  });

  estilos.then(() => {
    escena.style.visibility = '';
    despues(700, nuevaRonda);
  });

  return function detener() {
    timers.forEach(clearTimeout);
    callar();
    escena.remove();
  };
}
