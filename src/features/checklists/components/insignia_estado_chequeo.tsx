import { CircleCheck, PencilLine } from 'lucide-react';
import { ETIQUETAS_ESTADO_CHEQUEO } from '../constants/chequeos_diarios';
import type { EstadoChequeo } from '../types/chequeo_diario.types';

export function InsigniaEstadoChequeo({ estado }: { estado: EstadoChequeo }) {
  const finalizado = estado === 'finalizado';
  const Icono = finalizado ? CircleCheck : PencilLine;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap ${
        finalizado ? 'bg-exito/10 text-exito' : 'bg-primario/10 text-primario'
      }`}
    >
      <Icono aria-hidden strokeWidth={2} className="size-3.5" />
      {ETIQUETAS_ESTADO_CHEQUEO[estado]}
    </span>
  );
}
