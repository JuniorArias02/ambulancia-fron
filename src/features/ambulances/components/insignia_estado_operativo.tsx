import { ESTILOS_ESTADO_OPERATIVO } from '../constants/estilos_estado_operativo';
import { ETIQUETAS_ESTADO_OPERATIVO } from '../constants/estados_operativos';
import type { EstadoOperativo } from '../types/ambulancia.types';

export function InsigniaEstadoOperativo({ estado }: { estado: EstadoOperativo }) {
  const { icono: Icono, clases } = ESTILOS_ESTADO_OPERATIVO[estado];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap ${clases}`}
    >
      <Icono aria-hidden strokeWidth={2} className="size-3.5" />
      {ETIQUETAS_ESTADO_OPERATIVO[estado]}
    </span>
  );
}
