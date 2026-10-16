// Cambiá CACHE_VERSION cada vez que modifiques cualquier archivo de /webapp/:
// los assets se sirven cache-first, así que sin este cambio el iPad sigue con los viejos.
const CACHE_VERSION = 'v3';
const PREFIJO = 'cf-webapp-';
const CACHE_NAME = `${PREFIJO}${CACHE_VERSION}`;

const PRECACHE = [
  '/webapp/',
  '/webapp/styles.css',
  '/webapp/app.js',
  '/webapp/manifest.json',
  '/webapp/lib/almacen.js',
  '/webapp/lib/sonido.js',
  '/webapp/lib/voz.js',
  '/webapp/lib/estilos.js',
  '/webapp/juegos/catalogo.js',
  // Un renglón por cada archivo de cada minijuego
  '/webapp/juegos/elefante.js',
  '/webapp/juegos/elefante.css',
  '/webapp/assets/elefante/nene.png',
  '/webapp/assets/elefante/ate-ate.wav',
  '/webapp/assets/elefante/ate-1.wav',
  '/webapp/assets/elefante/ate-2.wav',
  '/webapp/juegos/vocales.js',
  '/webapp/juegos/vocales.css',
  '/webapp/juegos/auto.js',
  '/webapp/juegos/auto.css',
  '/webapp/assets/auto/bien.wav',
  '/webapp/juegos/burbujas.js',
  '/webapp/juegos/burbujas.css',
  '/webapp/icons/apple-touch-icon.png',
  '/webapp/icons/icon-192.png',
  '/webapp/icons/icon-512.png',
  '/webapp/icons/icon-512-maskable.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      // cache: 'reload' saltea la caché HTTP para guardar siempre la versión del servidor
      .then((cache) => cache.addAll(PRECACHE.map((url) => new Request(url, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((claves) => Promise.all(
        claves
          .filter((clave) => clave.startsWith(PREFIJO) && clave !== CACHE_NAME)
          .map((clave) => caches.delete(clave))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith('/webapp/')) return;

  const esPagina = request.mode === 'navigate' ||
    url.pathname === '/webapp/' || url.pathname === '/webapp/index.html';

  event.respondWith(esPagina ? redPrimero(request) : cachePrimero(request));
});

// index.html: red primero, para tomar la versión nueva cuando hay conexión
async function redPrimero(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    // Sin RequestInit: con un request de navegación, pasarle opciones tira TypeError
    const respuesta = await fetch(request);
    if (respuesta.ok) cache.put('/webapp/', respuesta.clone());
    return respuesta;
  } catch {
    return (await cache.match('/webapp/')) || Response.error();
  }
}

// Assets estáticos: caché primero; si falta, se baja y se guarda
async function cachePrimero(request) {
  const cache = await caches.open(CACHE_NAME);
  const guardada = await cache.match(request, { ignoreSearch: true });
  if (guardada) return guardada;
  try {
    const respuesta = await fetch(request);
    if (respuesta.ok) cache.put(request, respuesta.clone());
    return respuesta;
  } catch {
    return Response.error();
  }
}
