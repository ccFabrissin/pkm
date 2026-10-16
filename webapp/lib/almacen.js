// localStorage con try/catch. El prefijo evita choques con el resto de cayetano.click,
// que comparte el mismo origen (y por lo tanto el mismo localStorage).
const PREFIJO = 'cf-webapp:';

export function leer(nombre, porDefecto) {
  try {
    const valor = localStorage.getItem(PREFIJO + nombre);
    return valor === null ? porDefecto : JSON.parse(valor);
  } catch {
    return porDefecto;
  }
}

// ---------- Archivos grandes (IndexedDB) ----------
// Quedan guardados solo en este dispositivo: nunca se suben a ningún lado.

function abrirBase() {
  return new Promise((ok, mal) => {
    const pedido = indexedDB.open('cf-webapp', 1);
    pedido.onupgradeneeded = () => pedido.result.createObjectStore('archivos');
    pedido.onsuccess = () => ok(pedido.result);
    pedido.onerror = () => mal(pedido.error);
  });
}

async function conAlmacen(modo, accion) {
  const base = await abrirBase();
  try {
    return await new Promise((ok, mal) => {
      const tx = base.transaction('archivos', modo);
      const pedido = accion(tx.objectStore('archivos'));
      tx.oncomplete = () => ok(pedido.result);
      tx.onerror = () => mal(tx.error);
    });
  } finally {
    base.close();
  }
}

export async function leerArchivo(nombre) {
  try {
    return (await conAlmacen('readonly', (s) => s.get(nombre))) || null;
  } catch {
    return null;
  }
}

export async function guardarArchivo(nombre, blob) {
  try {
    await conAlmacen('readwrite', (s) => s.put(blob, nombre));
    return true;
  } catch {
    return false;
  }
}

export function guardar(nombre, valor) {
  try {
    localStorage.setItem(PREFIJO + nombre, JSON.stringify(valor));
  } catch {
    // Modo privado o almacenamiento lleno: la app sigue andando, sin recordar
  }
}
