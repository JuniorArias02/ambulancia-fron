import { BadgeCheck, CircleX, LoaderCircle, RotateCcw, ScanSearch } from 'lucide-react';
import { DECISIONES_POR_ESTADO } from '../constants/verificaciones';
import type { DecisionVerificacion, EstadoVerificacion } from '../types/verificacion.types';

const claseBase =
  'inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold transition-colors duration-150 focus-visible:ring-4 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50';

interface PropiedadesAccionesVerificacion {
  estado: EstadoVerificacion;
  /** Decisión que se está enviando sin diálogo (tomar la solicitud). */
  tomando: boolean;
  deshabilitadas: boolean;
  alDecidir: (decision: DecisionVerificacion) => void;
}

/** Botones según las transiciones que acepta el backend para el estado actual. */
export function AccionesVerificacion({ estado, tomando, deshabilitadas, alDecidir }: PropiedadesAccionesVerificacion) {
  const posibles = DECISIONES_POR_ESTADO[estado];
  if (posibles.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {posibles.includes('en_revision') && (
        <button
          type="button"
          onClick={() => alDecidir('en_revision')}
          disabled={deshabilitadas}
          className={`${claseBase} campo-vidrio font-medium text-texto hover:bg-white focus-visible:ring-primario/15`}
        >
          {tomando ? (
            <LoaderCircle aria-hidden className="size-4 animate-spin" />
          ) : (
            <ScanSearch aria-hidden strokeWidth={1.75} className="size-4" />
          )}
          {tomando ? 'Tomando…' : 'Tomar solicitud'}
        </button>
      )}
      {posibles.includes('requiere_correccion') && (
        <button
          type="button"
          onClick={() => alDecidir('requiere_correccion')}
          disabled={deshabilitadas}
          className={`${claseBase} border border-advertencia/30 bg-advertencia/10 text-advertencia-hover hover:bg-advertencia/16 focus-visible:ring-advertencia/20`}
        >
          <RotateCcw aria-hidden strokeWidth={1.75} className="size-4" />
          Pedir corrección
        </button>
      )}
      {posibles.includes('rechazado') && (
        <button
          type="button"
          onClick={() => alDecidir('rechazado')}
          disabled={deshabilitadas}
          className={`${claseBase} border border-critico/25 bg-critico/8 text-critico hover:bg-critico/12 focus-visible:ring-critico/20`}
        >
          <CircleX aria-hidden strokeWidth={1.75} className="size-4" />
          Rechazar
        </button>
      )}
      {posibles.includes('verificado') && (
        <button
          type="button"
          onClick={() => alDecidir('verificado')}
          disabled={deshabilitadas}
          className={`${claseBase} bg-exito text-white shadow-exito hover:bg-exito-hover focus-visible:ring-exito/25 disabled:shadow-none`}
        >
          <BadgeCheck aria-hidden strokeWidth={1.75} className="size-4" />
          Aprobar
        </button>
      )}
    </div>
  );
}
