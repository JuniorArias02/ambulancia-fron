export interface PuntoMapa {
  latitud: number;
  longitud: number;
}

const RADIO_TIERRA_METROS = 6_371_000;

/** Acepta coma o punto decimal; devuelve `null` si el texto no es una coordenada válida. */
export function leerCoordenada(texto: string, limite: number): number | null {
  const limpio = texto.trim().replace(',', '.');
  const valor = Number(limpio);
  return limpio !== '' && Number.isFinite(valor) && Math.abs(valor) <= limite ? valor : null;
}

export function puntoDesdeTexto(latitud: string, longitud: string): PuntoMapa | null {
  const lat = leerCoordenada(latitud, 90);
  const lng = leerCoordenada(longitud, 180);
  return lat !== null && lng !== null ? { latitud: lat, longitud: lng } : null;
}

/** Hasta 6 decimales (~10 cm), dentro de los 7 que admite el backend. */
export function redondearCoordenada(valor: number): number {
  return Math.round(valor * 1e6) / 1e6;
}

/** Distancia en línea recta (fórmula del haversine); no es la distancia por vía. */
export function distanciaEnLineaRecta(origen: PuntoMapa, destino: PuntoMapa): number {
  const aRadianes = (grados: number) => (grados * Math.PI) / 180;
  const dLat = aRadianes(destino.latitud - origen.latitud);
  const dLng = aRadianes(destino.longitud - origen.longitud);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(aRadianes(origen.latitud)) * Math.cos(aRadianes(destino.latitud)) * Math.sin(dLng / 2) ** 2;
  return 2 * RADIO_TIERRA_METROS * Math.asin(Math.sqrt(a));
}
