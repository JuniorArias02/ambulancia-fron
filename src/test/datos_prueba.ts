import type { Ruta } from '../features/assignments/schemas/ruta.schema';

/** Datos de ejemplo compartidos por varias pruebas. */
export const rutaDePrueba: Ruta = {
  asignacionId: 'asig-1',
  ambulanciaId: 'amb-1',
  ambulanciaCodigo: 'AMB-02',
  emergenciaId: 'em-1',
  numeroEmergencia: 'EMG-20261024-0007',
  tramo: 'hacia_emergencia',
  motivo: 'despacho',
  origen: { latitud: 7.8939, longitud: -72.5078 },
  destino: { latitud: 7.907, longitud: -72.497 },
  geometria: {
    type: 'LineString',
    coordinates: [
      [-72.507726, 7.893516],
      [-72.497, 7.907],
    ],
  },
  distanciaMetros: 2532,
  duracionSegundos: 229,
  llegadaEstimada: '2026-10-24T23:55:32.756Z',
  proveedor: 'geoapify',
  calculadaEn: '2026-10-24T23:51:43.756Z',
};
