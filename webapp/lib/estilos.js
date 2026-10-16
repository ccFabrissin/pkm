// Carga el CSS de un juego una sola vez. Resuelve cuando ya está aplicado:
// antes de eso las medidas de la escena no sirven.
export function cargarEstilos(id, href) {
  let link = document.querySelector(`link[data-juego="${id}"]`);
  if (link && link.sheet) return Promise.resolve();
  if (!link) {
    link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.dataset.juego = id;
    document.head.appendChild(link);
  }
  return new Promise((listo) => {
    link.addEventListener('load', listo, { once: true });
    link.addEventListener('error', listo, { once: true });
  });
}
