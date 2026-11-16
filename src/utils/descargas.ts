/**
 * Entrega al usuario un archivo recibido como Blob (PDF, CSV) sin guardarlo en el navegador:
 * la URL temporal se libera apenas empieza la descarga.
 */
export function guardarArchivo(contenido: Blob, nombre: string): void {
  const url = URL.createObjectURL(contenido);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombre;
  enlace.rel = 'noopener';
  document.body.append(enlace);
  enlace.click();
  enlace.remove();
  // Se espera un turno para que el navegador alcance a leer la URL.
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

/**
 * Nombre de `Content-Disposition` (`attachment; filename="x.pdf"`). El navegador solo deja
 * leer la cabecera si el backend la expone por CORS; si no, se usa el de respaldo.
 */
export function nombreDeArchivo(cabecera: unknown, respaldo: string): string {
  if (typeof cabecera !== 'string') return respaldo;
  const utf8 = /filename\*=UTF-8''([^;]+)/i.exec(cabecera)?.[1];
  if (utf8) {
    try {
      return decodeURIComponent(utf8.replace(/"/g, ''));
    } catch {
      return respaldo;
    }
  }
  const simple = /filename="?([^";]+)"?/i.exec(cabecera)?.[1];
  return simple?.trim() || respaldo;
}
