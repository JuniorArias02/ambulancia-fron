import { ArrowDown, ArrowUp } from 'lucide-react';
import { claseBotonIcono } from '../constants/estilos_listas';

interface PropiedadesControlesOrden {
  /** Texto del elemento, para el nombre accesible de los botones. */
  nombre: string;
  puedeSubir: boolean;
  puedeBajar: boolean;
  deshabilitados: boolean;
  alMover: (desplazamiento: -1 | 1) => void;
}

export function ControlesOrden({ nombre, puedeSubir, puedeBajar, deshabilitados, alMover }: PropiedadesControlesOrden) {
  return (
    <div className="flex shrink-0 flex-col">
      <button
        type="button"
        onClick={() => alMover(-1)}
        disabled={deshabilitados || !puedeSubir}
        aria-label={`Subir «${nombre}»`}
        title="Subir"
        className={`${claseBotonIcono} size-6!`}
      >
        <ArrowUp aria-hidden strokeWidth={1.75} className="size-3.5" />
      </button>
      <button
        type="button"
        onClick={() => alMover(1)}
        disabled={deshabilitados || !puedeBajar}
        aria-label={`Bajar «${nombre}»`}
        title="Bajar"
        className={`${claseBotonIcono} size-6!`}
      >
        <ArrowDown aria-hidden strokeWidth={1.75} className="size-3.5" />
      </button>
    </div>
  );
}
