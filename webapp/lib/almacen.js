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

export function guardar(nombre, valor) {
  try {
    localStorage.setItem(PREFIJO + nombre, JSON.stringify(valor));
  } catch {
    // Modo privado o almacenamiento lleno: la app sigue andando, sin recordar
  }
}
