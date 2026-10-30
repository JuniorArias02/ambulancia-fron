import { CircleCheck, MapPinOff, Send } from 'lucide-react';
import { InsigniaPrioridad } from '../../emergencies/components/insignias_emergencia';
import type { Emergencia } from '../../emergencies/types/emergencia.types';
import { tiempoTranscurrido } from '../../../utils/tiempo_transcurrido';

interface PropiedadesListaPendientes {
  pendientes: Emergencia[];
  /** La que está abierta en el mapa, para resaltarla en la lista. */
  seleccionadaId?: string;
  ahora: number;
  alElegir: (emergencia: Emergencia) => void;
  alDespachar: (emergencia: Emergencia) => void;
}

/** Emergencias que esperan ambulancia; también es la alternativa por teclado a los marcadores. */
export function ListaPendientes({ pendientes, seleccionadaId, ahora, alElegir, alDespachar }: PropiedadesListaPendientes) {
  if (pendientes.length === 0) {
    return (
      <p className="flex items-center gap-2.5 px-4 py-4 text-sm text-texto-secundario">
        <CircleCheck aria-hidden strokeWidth={1.75} className="size-4 shrink-0 text-exito" />
        No hay emergencias esperando ambulancia.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-borde/60">
      {pendientes.map((emergencia) => (
        <li key={emergencia.id} className="flex items-center gap-2 px-2 py-1.5">
          <button
            type="button"
            onClick={() => alElegir(emergencia)}
            aria-current={emergencia.id === seleccionadaId ? 'true' : undefined}
            className={`min-w-0 flex-1 rounded-xl px-2 py-2 text-left transition-colors duration-150 hover:bg-white focus-visible:ring-2 focus-visible:ring-primario/40 focus-visible:outline-none ${
              emergencia.id === seleccionadaId ? 'bg-white shadow-vidrio ring-1 ring-primario/25' : ''
            }`}
          >
            <span className="flex flex-wrap items-center gap-2">
              <InsigniaPrioridad prioridad={emergencia.prioridad} />
              <span className="text-sm font-semibold text-texto tabular-nums">{emergencia.numeroEmergencia}</span>
              <span className="text-[13px] text-texto-secundario tabular-nums">
                {tiempoTranscurrido(emergencia.recibidaEn, ahora)}
              </span>
            </span>
            <span className="mt-1 flex items-center gap-1.5 truncate text-[13px] text-texto-secundario">
              {!emergencia.coordenadas && <MapPinOff aria-label="Sin coordenadas" strokeWidth={1.75} className="size-3.5 shrink-0" />}
              <span className="truncate">{emergencia.direccion ?? emergencia.descripcion}</span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => alDespachar(emergencia)}
            aria-label={`Despachar ambulancia a ${emergencia.numeroEmergencia}`}
            title="Despachar"
            className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primario text-white shadow-primario transition-colors duration-150 hover:bg-primario-hover focus-visible:ring-4 focus-visible:ring-primario/25 focus-visible:outline-none"
          >
            <Send aria-hidden strokeWidth={1.75} className="size-4" />
          </button>
        </li>
      ))}
    </ul>
  );
}
