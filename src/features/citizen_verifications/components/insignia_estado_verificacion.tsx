import { ETIQUETAS_ESTADO_VERIFICACION } from '../constants/verificaciones';
import { ESTILOS_ESTADO_VERIFICACION } from '../constants/estilos_verificacion';
import type { EstadoVerificacion } from '../types/verificacion.types';

export function InsigniaEstadoVerificacion({ estado }: { estado: EstadoVerificacion }) {
  const { icono: Icono, clases } = ESTILOS_ESTADO_VERIFICACION[estado];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap ${clases}`}
    >
      <Icono aria-hidden strokeWidth={2} className="size-3.5" />
      {ETIQUETAS_ESTADO_VERIFICACION[estado]}
    </span>
  );
}
