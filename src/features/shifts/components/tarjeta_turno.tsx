import { Ambulance, ArrowLeftRight, Square, Timer, Users } from 'lucide-react';
import { generatePath, Link } from 'react-router';
import { RUTAS } from '../../../constants/rutas';
import { formatearFechaHora } from '../../../utils/formato_fecha';
import { InsigniaEstadoOperativo } from '../../ambulances/components/insignia_estado_operativo';
import type { Ambulancia } from '../../ambulances/types/ambulancia.types';
import { haceTiempo } from '../../../utils/tiempo_transcurrido';
import type { Turno } from '../types/turno.types';
import { ListaIntegrantes } from './lista_integrantes';

interface PropiedadesTarjetaTurno {
  turno: Turno;
  ambulancia: Ambulancia | undefined;
  ahora: number;
  /** Sin valor, el rol no puede cambiar la tripulación. */
  alCambiarTripulacion?: () => void;
  /** Sin valor, el rol no puede habilitar la ambulancia. */
  alHabilitar?: () => void;
  alFinalizar: () => void;
}

const claseAccion =
  'inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-[13px] font-medium transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-primario/40 focus-visible:outline-none';

export function TarjetaTurno({
  turno,
  ambulancia,
  ahora,
  alCambiarTripulacion,
  alHabilitar,
  alFinalizar,
}: PropiedadesTarjetaTurno) {
  const estado = ambulancia?.estadoOperativo;
  // Con tripulación pero sin habilitar: es el siguiente paso para poder despacharla.
  const pendienteHabilitar = estado === 'fuera_servicio' || estado === 'mantenimiento';

  return (
    <article
      aria-labelledby={`turno-${turno.id}`}
      className="vidrio-fuerte flex flex-col rounded-2xl"
    >
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

      <div className="flex-1 px-4 py-4">
        <ListaIntegrantes integrantes={turno.integrantes} />
      </div>

      <footer className="flex flex-wrap items-center gap-1.5 border-t border-borde/70 px-3 py-2.5">
        {pendienteHabilitar && alHabilitar && (
          <button type="button" onClick={alHabilitar} className={`${claseAccion} bg-primario text-white shadow-primario hover:bg-primario-hover`}>
            <ArrowLeftRight aria-hidden strokeWidth={1.75} className="size-3.5" />
            Habilitar
          </button>
        )}
        {alCambiarTripulacion && (
          <button type="button" onClick={alCambiarTripulacion} className={`${claseAccion} text-texto hover:bg-white`}>
            <Users aria-hidden strokeWidth={1.75} className="size-3.5" />
            Cambiar tripulación
          </button>
        )}
        <button type="button" onClick={alFinalizar} className={`${claseAccion} ml-auto text-critico hover:bg-critico/6`}>
          <Square aria-hidden strokeWidth={1.75} className="size-3.5" />
          Finalizar
        </button>
      </footer>
    </article>
  );
}
