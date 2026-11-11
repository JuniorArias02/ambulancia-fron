import { Ambulance, Square, Timer } from 'lucide-react';
import { generatePath, Link } from 'react-router';
import { RUTAS } from '../../../constants/rutas';
import { formatearFechaHora } from '../../../utils/formato_fecha';
import { haceTiempo } from '../../../utils/tiempo_transcurrido';
import { InsigniaEstadoOperativo } from '../../ambulances/components/insignia_estado_operativo';
import type { Ambulancia } from '../../ambulances/types/ambulancia.types';
import type { Turno } from '../types/turno.types';
import { AvisoTripulacionIncompleta } from './aviso_tripulacion_incompleta';
import { ListaIntegrantes } from './lista_integrantes';

interface PropiedadesTarjetaTurno {
  turno: Turno;
  ambulancia: Ambulancia | undefined;
  ahora: number;
  alCerrarTurno: () => void;
}

/** Tripulación de una ambulancia, solo de consulta: la arman el conductor y el paramédico desde la app. */
export function TarjetaTurno({ turno, ambulancia, ahora, alCerrarTurno }: PropiedadesTarjetaTurno) {
  const estado = ambulancia?.estadoOperativo;

  return (
    <article aria-labelledby={`turno-${turno.id}`} className="vidrio-fuerte flex flex-col rounded-2xl">
      <header className="flex items-start gap-3 px-4 pt-4">
        <span aria-hidden className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primario/10 text-primario">
          <Ambulance strokeWidth={1.75} className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 id={`turno-${turno.id}`} className="truncate text-base font-semibold text-texto">
            <Link
              to={generatePath(RUTAS.detalleAmbulancia, { id: turno.ambulanciaId })}
              className="rounded hover:text-primario focus-visible:ring-2 focus-visible:ring-primario/40 focus-visible:outline-none"
            >
              {turno.ambulanciaCodigo ?? 'Ambulancia'}
            </Link>
          </h3>
          <p
            className="mt-0.5 flex items-center gap-1.5 text-[13px] text-texto-secundario"
            title={`Desde el ${formatearFechaHora(turno.inicio)}`}
          >
            <Timer aria-hidden strokeWidth={1.75} className="size-3.5" />
            En turno {haceTiempo(turno.inicio, ahora)}
          </p>
        </div>
        {estado && <InsigniaEstadoOperativo estado={estado} />}
      </header>

      <div className="flex-1 space-y-3 px-4 py-4">
        <ListaIntegrantes integrantes={turno.integrantes} />
        <AvisoTripulacionIncompleta turno={turno} />
      </div>

      <footer className="flex justify-end border-t border-borde/70 px-3 py-2.5">
        <button
          type="button"
          onClick={alCerrarTurno}
          className="inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-[13px] font-medium text-critico transition-colors duration-150 hover:bg-critico/6 focus-visible:ring-2 focus-visible:ring-critico/30 focus-visible:outline-none"
        >
          <Square aria-hidden strokeWidth={1.75} className="size-3.5" />
          Cerrar turno
        </button>
      </footer>
    </article>
  );
}
