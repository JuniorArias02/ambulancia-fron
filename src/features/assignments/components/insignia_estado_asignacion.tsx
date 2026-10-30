import { ESTILOS_ESTADO_ASIGNACION, ETIQUETAS_ESTADO_ASIGNACION } from '../constants/asignaciones';
import type { EstadoAsignacion } from '../types/asignacion.types';

export function InsigniaEstadoAsignacion({ estado }: { estado: EstadoAsignacion }) {
  const { icono: Icono, clases } = ESTILOS_ESTADO_ASIGNACION[estado];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap ${clases}`}
    >
      <Icono aria-hidden strokeWidth={2} className="size-3.5" />
      {ETIQUETAS_ESTADO_ASIGNACION[estado]}
    </span>
  );
}
