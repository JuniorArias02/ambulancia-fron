import { ArrowLeftRight, CalendarClock, CarFront, MapPin, Siren, type LucideIcon } from 'lucide-react';

/**
 * Tipo de servicio de una emergencia. No es el tipo de ambulancia (TAB o TAM): define qué firmas
 * debe tomar el paramédico para cerrar la historia clínica.
 */
export const MODALIDADES_SERVICIO = [
  'emergencia',
  'accidente_transito',
  'traslado_programado',
  'traslado_interhospitalario',
  'atencion_en_sitio',
] as const;

export type ModalidadServicio = (typeof MODALIDADES_SERVICIO)[number];

export const MODALIDAD_POR_DEFECTO: ModalidadServicio = 'emergencia';

export const ETIQUETAS_MODALIDAD: Record<ModalidadServicio, string> = {
  emergencia: 'Emergencia',
  accidente_transito: 'Accidente de tránsito',
  traslado_programado: 'Traslado programado',
  traslado_interhospitalario: 'Traslado entre instituciones',
  atencion_en_sitio: 'Atención en sitio',
};

export const ICONOS_MODALIDAD: Record<ModalidadServicio, LucideIcon> = {
  emergencia: Siren,
  accidente_transito: CarFront,
  traslado_programado: CalendarClock,
  traslado_interhospitalario: ArrowLeftRight,
  atencion_en_sitio: MapPin,
};

export function esModalidad(valor: string | null | undefined): valor is ModalidadServicio {
  return MODALIDADES_SERVICIO.some((modalidad) => modalidad === valor);
}

/** Etiqueta de un valor que llega como texto (indicadores, ingreso); uno desconocido se muestra tal cual. */
export function etiquetaModalidad(valor: string): string {
  return esModalidad(valor) ? ETIQUETAS_MODALIDAD[valor] : valor;
}
