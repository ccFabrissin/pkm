// Burbujas: suben burbujas con animales; al tocarlas explotan con un sonido.
// No hay forma de perder: cada toque da una respuesta visual y sonora.
import { leer, guardar } from '../lib/almacen.js';
import { tono, NOTAS } from '../lib/sonido.js';

const ANIMALES = ['🐶', '🐱', '🐰', '🐻', '🐼', '🐸', '🐷', '🐮', '🐵', '🐥', '🐟', '🦁', '🐘', '🦒'];
const COLORES = ['#ff8fab', '#ffd166', '#06d6a0', '#4cc9f0', '#b388eb', '#ff9f68'];

const azar = (min, max) => min + Math.random() * (max - min);
const elegir = (lista) => lista[Math.floor(Math.random() * lista.length)];

function cargarEstilos() {
  if (document.querySelector('link[data-juego="burbujas"]')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = '/webapp/juegos/burbujas.css';
  link.dataset.juego = 'burbujas';
  document.head.appendChild(link);
}

function sonidoPop() {
  const nota = elegir(NOTAS);
  tono(nota * 1.6, { duracion: 0.06, tipo: 'triangle', volumen: 0.25, caida: 0.3 });
  tono(nota, { duracion: 0.28, volumen: 0.3 });
}

function sonidoSuave() {
  tono(NOTAS[0] / 2, { duracion: 0.15, volumen: 0.12, caida: 1.5 });
}

export function iniciar(contenedor) {
  cargarEstilos();

  const escena = document.createElement('div');
  escena.className = 'burbujas';
  escena.innerHTML = '<div class="burbujas__contador" aria-label="Burbujas reventadas"><span aria-hidden="true">⭐</span> <span></span></div>';
  contenedor.appendChild(escena);
  const contadorEl = escena.querySelector('.burbujas__contador span:last-child');

  const burbujas = new Set();
  let reventadas = Number(leer('burbujas:reventadas', 0)) || 0;
  let ultimoCuadro = 0;
  let proximaBurbuja = 0;
  let cuadroId = 0;
  contadorEl.textContent = reventadas;

  function medidas() {
    const ancho = escena.clientWidth;
    const alto = escena.clientHeight;
    const lado = Math.min(ancho, alto);
    return {
      ancho,
      alto,
      diametroMin: Math.max(90, lado * 0.17),
      diametroMax: Math.max(120, lado * 0.25),
      maximo: ancho > alto ? 7 : 5,
    };
  }

  function mover(b, t) {
    const dx = Math.sin(t / 900 + b.fase) * b.vaiven;
    b.el.style.transform = `translate3d(${b.x + dx}px, ${b.y}px, 0)`;
  }

  function crearBurbuja() {
    const m = medidas();
    const d = azar(m.diametroMin, m.diametroMax);
    const color = elegir(COLORES);
    const el = document.createElement('div');
    el.className = 'burbuja';
    el.style.width = el.style.height = `${d}px`;
    el.style.setProperty('--d', `${d}px`);
    el.style.setProperty('--color', color);
    el.innerHTML = `<span class="burbuja__animal">${elegir(ANIMALES)}</span>`;

    const b = {
      el,
      d,
      color,
      x: azar(0, Math.max(0, m.ancho - d)),
      y: m.alto + azar(0, d / 2),
      velocidad: azar(45, 85), // px por segundo: lento a propósito
      fase: azar(0, Math.PI * 2),
      vaiven: azar(8, 22),
    };

    el.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      reventar(b);
    });

    burbujas.add(b);
    escena.appendChild(el);
    mover(b, 0);
  }

  function chispas(x, y, color, cantidad) {
    for (let i = 0; i < cantidad; i++) {
      const angulo = (Math.PI * 2 * i) / cantidad + azar(-0.2, 0.2);
      const distancia = azar(50, 110);
      const el = document.createElement('span');
      el.className = 'chispa';
      el.style.setProperty('--color', color);
      el.style.setProperty('--x0', `${x}px`);
      el.style.setProperty('--y0', `${y}px`);
      el.style.setProperty('--x1', `${x + Math.cos(angulo) * distancia}px`);
      el.style.setProperty('--y1', `${y + Math.sin(angulo) * distancia}px`);
      el.addEventListener('animationend', () => el.remove(), { once: true });
      escena.appendChild(el);
    }
  }

  function reventar(b) {
    if (!burbujas.has(b)) return;
    burbujas.delete(b);
    sonidoPop();
    const caja = escena.getBoundingClientRect();
    const rect = b.el.getBoundingClientRect();
    chispas(rect.left - caja.left + rect.width / 2, rect.top - caja.top + rect.height / 2, b.color, 10);
    b.el.classList.add('burbuja--revienta');
    b.el.addEventListener('animationend', () => b.el.remove(), { once: true });

    reventadas += 1;
    contadorEl.textContent = reventadas;
    guardar('burbujas:reventadas', reventadas);
  }

  // Tocar el fondo también responde, para que ningún toque quede "sin nada"
  escena.addEventListener('pointerdown', (e) => {
    const caja = escena.getBoundingClientRect();
    chispas(e.clientX - caja.left, e.clientY - caja.top, elegir(COLORES), 6);
    sonidoSuave();
  });

  function cuadro(t) {
    const dt = ultimoCuadro ? Math.min((t - ultimoCuadro) / 1000, 0.1) : 0;
    ultimoCuadro = t;
    const m = medidas();

    for (const b of burbujas) {
      b.y -= b.velocidad * dt;
      b.x = Math.min(b.x, Math.max(0, m.ancho - b.d)); // por si giró el iPad
      if (b.y < -b.d - 40) {
        burbujas.delete(b);
        b.el.remove();
      } else {
        mover(b, t);
      }
    }

    if (burbujas.size < m.maximo && t >= proximaBurbuja) {
      crearBurbuja();
      proximaBurbuja = t + azar(500, 1200);
    }

    cuadroId = requestAnimationFrame(cuadro);
  }

  // Al volver de segundo plano, que las burbujas no "salten"
  const alCambiarVisibilidad = () => { ultimoCuadro = 0; };
  document.addEventListener('visibilitychange', alCambiarVisibilidad);
  cuadroId = requestAnimationFrame(cuadro);

  return function detener() {
    cancelAnimationFrame(cuadroId);
    document.removeEventListener('visibilitychange', alCambiarVisibilidad);
    escena.remove();
  };
}
