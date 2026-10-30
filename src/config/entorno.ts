const NOMBRE_APLICACION_PREDETERMINADO = 'Ambulancia';
// Cúcuta, Norte de Santander.
const CENTRO_MAPA_PREDETERMINADO = { latitud: 7.8939, longitud: -72.5078 };
const ZOOM_MAPA_PREDETERMINADO = 13;

function leerRequerida(nombre: string, valor: string | undefined): string {
  if (!valor?.trim()) {
    throw new Error(`Falta la variable de entorno ${nombre}`);
  }
  return valor.trim();
}

function leerNumero(valor: string | undefined, predeterminado: number): number {
  const numero = Number(valor);
  return valor?.trim() && Number.isFinite(numero) ? numero : predeterminado;
}

export const entorno = {
  nombreAplicacion:
    import.meta.env.VITE_NOMBRE_APLICACION?.trim() || NOMBRE_APLICACION_PREDETERMINADO,
  urlApi: leerRequerida('VITE_API_URL', import.meta.env.VITE_API_URL),
  /** Servidor WebSocket; vacío desactiva el tiempo real y quedan las consultas periódicas. */
  urlTiempoReal: import.meta.env.VITE_TIEMPO_REAL_URL?.trim().replace(/\/+$/, '') ?? '',
  claveGeoapify: import.meta.env.VITE_GEOAPIFY_API_KEY?.trim() ?? '',
  /** Ciudad que se propone al ubicar direcciones; el usuario puede cambiarla en el formulario. */
  ciudadOperacion: import.meta.env.VITE_CIUDAD_OPERACION?.trim() ?? '',
  centroMapa: {
    latitud: leerNumero(
      import.meta.env.VITE_MAPA_CENTRO_LATITUD,
      CENTRO_MAPA_PREDETERMINADO.latitud,
    ),
    longitud: leerNumero(
      import.meta.env.VITE_MAPA_CENTRO_LONGITUD,
      CENTRO_MAPA_PREDETERMINADO.longitud,
    ),
  },
  zoomMapa: leerNumero(import.meta.env.VITE_MAPA_ZOOM, ZOOM_MAPA_PREDETERMINADO),
} as const;
