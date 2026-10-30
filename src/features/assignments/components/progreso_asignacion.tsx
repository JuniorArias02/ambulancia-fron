import { Check } from 'lucide-react';
import type { Asignacion } from '../types/asignacion.types';
import { pasosAsignacion } from '../utils/pasos_asignacion';

const formatoHora = new Intl.DateTimeFormat('es-CO', { timeStyle: 'short' });

/** Línea de tiempo horizontal del servicio con la hora de cada paso. */
export function ProgresoAsignacion({ asignacion }: { asignacion: Asignacion }) {
  const pasos = pasosAsignacion(asignacion);
  const cancelada = asignacion.estado === 'cancelada';

  return (
    <ol aria-label="Avance del servicio" className="flex items-start">
      {pasos.map((paso, indice) => {
        const hecho = paso.en !== null || (cancelada && paso.clave === 'cancelada');
        const siguienteHecho = pasos[indice + 1]?.en != null;
        const esCancelacion = paso.clave === 'cancelada';
        return (
          <li key={paso.clave} className="relative flex min-w-0 flex-1 flex-col items-center text-center">
            {indice < pasos.length - 1 && (
              <span
                aria-hidden
                className={`absolute top-2.5 left-1/2 h-0.5 w-full ${siguienteHecho ? 'bg-primario/60' : 'bg-borde'}`}
              />
            )}
            <span
              aria-hidden
              className={`relative flex size-5 items-center justify-center rounded-full ring-4 ring-white/70 ${
                esCancelacion
                  ? 'bg-texto-secundario text-white'
                  : hecho
                    ? 'bg-primario text-white'
                    : 'border-2 border-borde bg-white'
              }`}
            >
              {hecho && <Check strokeWidth={3} className="size-3" />}
            </span>
            <span className={`mt-1.5 px-0.5 text-[11px] leading-tight font-medium ${hecho ? 'text-texto' : 'text-texto-secundario'}`}>
              {paso.etiqueta}
            </span>
            <span className="text-[11px] text-texto-secundario tabular-nums">
              {paso.en ? <time dateTime={paso.en}>{formatoHora.format(new Date(paso.en))}</time> : '—'}
              <span className="sr-only">{hecho ? ', completado' : ', pendiente'}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
