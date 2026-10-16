// Lista de minijuegos. Para sumar uno:
//   1. Crear juegos/<id>.js con `export function iniciar(contenedor) { ...; return detener; }`
//      (y, si hace falta, juegos/<id>.css).
//   2. Agregarlo acá con `cargar`.
//   3. Sumar sus archivos a PRECACHE en sw.js y subir CACHE_VERSION.
// Los que tienen `pronto: true` se muestran en gris y todavía no se pueden abrir.

export const JUEGOS = [
  {
    id: 'elefante',
    titulo: 'Despertá al elefante',
    emoji: '🐘',
    imagen: '/webapp/assets/elefante/nene.png', // opcional: reemplaza al emoji en la portada
    color: '#b8a9e3',
    cargar: () => import('./elefante.js'),
  },
  {
    id: 'vocales',
    titulo: 'Vocales',
    emoji: '🔤',
    color: '#ffb703',
    cargar: () => import('./vocales.js'),
  },
  {
    id: 'auto',
    titulo: 'El auto bochinchero',
    emoji: '🚗',
    imagen: '/webapp/assets/auto/portada.svg',
    color: '#7cc6f2',
    cargar: () => import('./auto.js'),
  },
  {
    id: 'ratones',
    titulo: 'Ratoncitos y el gato',
    emoji: '🐭',
    color: '#ff9f68',
    cargar: () => import('./ratones.js'),
  },
  {
    id: 'burbujas',
    titulo: 'Burbujas',
    emoji: '🫧',
    color: '#4cc9f0',
    cargar: () => import('./burbujas.js'),
  },
  { id: 'animales', titulo: 'Animales y sus sonidos', emoji: '🐮', color: '#06d6a0', pronto: true },
  { id: 'colores', titulo: 'Colores', emoji: '🎨', color: '#ff8fab', pronto: true },
  { id: 'formas', titulo: 'Formas', emoji: '🔺', color: '#ffd166', pronto: true },
  { id: 'musica', titulo: 'Música', emoji: '🥁', color: '#b388eb', pronto: true },
  { id: 'pintar', titulo: 'Pintar con el dedo', emoji: '🖐️', color: '#ff9f68', pronto: true },
];
