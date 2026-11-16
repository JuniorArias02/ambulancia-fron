import { ESTILOS_ESTADO_FIRMA } from '../constants/firmas';
import type { EstadoFirma } from '../types/firma.types';

export function InsigniaEstadoFirma({ estado }: { estado: EstadoFirma }) {
  const { etiqueta, icono: Icono, clases } = ESTILOS_ESTADO_FIRMA[estado];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap ${clases}`}
    >
      <Icono aria-hidden strokeWidth={2} className="size-3.5" />
      {etiqueta}
    </span>
  );
}
