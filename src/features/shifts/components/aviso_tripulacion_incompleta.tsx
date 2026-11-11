import { TriangleAlert } from 'lucide-react';
import type { Turno } from '../types/turno.types';
import { textoFaltante } from '../utils/tripulacion';

/** Con la tripulación incompleta la ambulancia no se puede despachar: se indica qué falta. */
export function AvisoTripulacionIncompleta({ turno }: { turno: Pick<Turno, 'tripulacionCompleta' | 'integrantes'> }) {
  const faltante = textoFaltante(turno);
  if (!faltante) return null;
  return (
    <p className="flex items-start gap-2 rounded-xl border border-advertencia/25 bg-advertencia/8 px-3 py-2 text-[13px] text-texto">
      <TriangleAlert aria-hidden strokeWidth={1.75} className="mt-0.5 size-3.5 shrink-0 text-advertencia" />
      {faltante}
    </p>
  );
}
