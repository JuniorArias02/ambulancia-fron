/**
 * Campos de `nuevos` que difieren de `original`, para enviar solo lo que cambió en un PATCH
 * (la API deja intacto lo que no se envía).
 */
export function soloCambios<T extends object>(original: T, nuevos: Partial<T>): Partial<T> {
  const cambios: Partial<T> = {};
  for (const clave in nuevos) {
    if (Object.hasOwn(nuevos, clave) && nuevos[clave] !== original[clave]) cambios[clave] = nuevos[clave];
  }
  return cambios;
}
