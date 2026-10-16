// Lanzador estilo YouTube Kids: grilla de juegos → pantalla de juego con
// "Salir" arriba a la derecha y la fila de otros juegos abajo.
// La ruta va en el hash (#/juego/<id>) para que recargar deje al chico donde estaba.
import { JUEGOS } from './juegos/catalogo.js';
import { leer, guardar } from './lib/almacen.js';
import * as sonido from './lib/sonido.js';

const inicio = document.getElementById('inicio');
const grilla = document.getElementById('grilla');
const pantallaJuego = document.getElementById('pantalla-juego');
const titulo = document.getElementById('juego-titulo');
const area = document.getElementById('juego-area');
const tira = document.getElementById('tira');

let detenerJuego = null;

// ---------- Tarjetas ----------

function tarjeta(juego) {
  const el = document.createElement('button');
  el.type = 'button';
  el.className = 'tarjeta' + (juego.pronto ? ' tarjeta--pronto' : '');
  el.style.setProperty('--color', juego.color);
  el.setAttribute('aria-label', juego.pronto ? `${juego.titulo} (pronto)` : juego.titulo);
  el.innerHTML = `
    <span class="tarjeta__portada">
      ${juego.imagen
        ? `<img class="tarjeta__imagen" src="${juego.imagen}" alt="" draggable="false"><span class="tarjeta__emoji tarjeta__emoji--chico" aria-hidden="true">${juego.emoji}</span>`
        : `<span class="tarjeta__emoji" aria-hidden="true">${juego.emoji}</span>`}
      ${juego.pronto ? '<span class="tarjeta__etiqueta">Pronto</span>' : ''}
    </span>
    <span class="tarjeta__titulo"></span>`;
  el.querySelector('.tarjeta__titulo').textContent = juego.titulo;

  el.addEventListener('click', () => {
    if (juego.pronto) {
      el.classList.remove('tarjeta--sacude');
      void el.offsetWidth; // reinicia la animación
      el.classList.add('tarjeta--sacude');
      return;
    }
    sonido.clic();
    location.hash = `#/juego/${juego.id}`;
  });
  return el;
}

grilla.replaceChildren(...JUEGOS.map(tarjeta));

// ---------- Navegación ----------

function idEnRuta() {
  const m = location.hash.match(/^#\/juego\/([\w-]+)$/);
  return m ? m[1] : null;
}

async function mostrar() {
  if (detenerJuego) {
    try { detenerJuego(); } catch (err) { console.error(err); }
    detenerJuego = null;
  }
  area.replaceChildren();

  const id = idEnRuta();
  const juego = JUEGOS.find((j) => j.id === id && !j.pronto);

  if (!juego) {
    pantallaJuego.hidden = true;
    inicio.hidden = false;
    return;
  }

  inicio.hidden = true;
  pantallaJuego.hidden = false;
  titulo.textContent = `${juego.emoji} ${juego.titulo}`;
  tira.replaceChildren(...JUEGOS.filter((j) => j !== juego).map(tarjeta));
  tira.scrollLeft = 0;

  try {
    const modulo = await juego.cargar();
    if (idEnRuta() !== id) return; // cambió de juego mientras cargaba
    detenerJuego = modulo.iniciar(area) || null;
  } catch (err) {
    console.error('No se pudo cargar el juego:', err);
    area.innerHTML = '<p class="aviso">No se pudo abrir el juego. Probá de nuevo con conexión.</p>';
  }
}

document.getElementById('salir').addEventListener('click', () => {
  sonido.clic();
  // replaceState no dispara hashchange: se llama a mostrar() a mano
  history.replaceState(null, '', location.pathname);
  mostrar();
});

window.addEventListener('hashchange', mostrar);
mostrar();

// ---------- Botón de sonido ----------

const botonSonido = document.getElementById('sonido');

function pintarSonido() {
  const activo = sonido.estaActivo();
  botonSonido.textContent = activo ? '🔊' : '🔇';
  botonSonido.setAttribute('aria-pressed', String(activo));
  botonSonido.setAttribute('aria-label', activo ? 'Apagar el sonido' : 'Prender el sonido');
}

botonSonido.addEventListener('click', () => {
  sonido.alternar();
  pintarSonido();
  sonido.clic();
});
pintarSonido();

// ---------- Banner "Agregar a pantalla de inicio" ----------

function esIPadOS() {
  // Desde iPadOS 13 Safari se presenta como Mac: se distingue por la pantalla táctil
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

function esSafari() {
  const ua = navigator.userAgent;
  return /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS|GSA|Chrome|Android/.test(ua);
}

function estaInstalada() {
  return window.navigator.standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches;
}

const banner = document.getElementById('banner');
if (esIPadOS() && esSafari() && !estaInstalada() && !leer('banner-cerrado', false)) {
  banner.hidden = false;
}
document.getElementById('banner-cerrar').addEventListener('click', () => {
  banner.hidden = true;
  guardar('banner-cerrado', true);
});

// ---------- Service worker ----------

if ('serviceWorker' in navigator) {
  // Si ya había una versión controlando la página y entra una nueva, recargar una vez
  const habiaControlador = Boolean(navigator.serviceWorker.controller);
  let recargando = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!habiaControlador || recargando) return;
    recargando = true;
    location.reload();
  });

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/webapp/sw.js', { scope: '/webapp/' })
      .catch((err) => console.error('No se pudo registrar el service worker:', err));
  });
}
