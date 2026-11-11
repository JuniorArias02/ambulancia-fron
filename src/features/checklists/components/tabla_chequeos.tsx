import { Ambulance, ChevronRight, MessageSquareText } from 'lucide-react';
import type { ChequeoDiario } from '../types/chequeo_diario.types';
import { contarObservaciones, formatearDia } from '../utils/chequeos_diarios';
import { InsigniaEstadoChequeo } from './insignia_estado_chequeo';

interface PropiedadesTablaChequeos {
  chequeos: ChequeoDiario[];
  alAbrir: (chequeo: ChequeoDiario) => void;
}

function Observaciones({ chequeo }: { chequeo: ChequeoDiario }) {
  const total = contarObservaciones(chequeo.respuestas);
  if (total === 0) return <span className="text-[13px] text-texto-secundario">Sin observaciones</span>;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-advertencia/12 px-2.5 py-1 text-xs font-medium whitespace-nowrap text-advertencia-hover">
      <MessageSquareText aria-hidden strokeWidth={2} className="size-3.5" />
      {total} {total === 1 ? 'observación' : 'observaciones'}
    </span>
  );
}

function Ambulancia({ chequeo }: { chequeo: ChequeoDiario }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm font-semibold text-texto">
      <Ambulance aria-hidden strokeWidth={1.75} className="size-4 text-primario" />
      {chequeo.ambulanciaCodigo ?? 'Ambulancia'}
    </span>
  );
}

export function TablaChequeos({ chequeos, alAbrir }: PropiedadesTablaChequeos) {
  return (
    <>
      <table className="hidden w-full text-left md:table">
        <thead>
          <tr className="border-b border-borde/80 text-xs font-medium tracking-wide text-texto-secundario uppercase">
            <th scope="col" className="py-3 pr-4 pl-5 font-medium">Fecha</th>
            <th scope="col" className="px-4 py-3 font-medium">Ambulancia</th>
            <th scope="col" className="px-4 py-3 font-medium">Conductor</th>
            <th scope="col" className="px-4 py-3 font-medium">Estado</th>
            <th scope="col" className="hidden px-4 py-3 font-medium lg:table-cell">Respuestas</th>
            <th scope="col" className="px-4 py-3 font-medium">Observaciones</th>
            <th scope="col" className="w-12 py-3 pr-5 pl-2">
              <span className="sr-only">Abrir</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-borde/60">
          {chequeos.map((chequeo) => (
            <tr
              key={chequeo.id}
              onClick={() => alAbrir(chequeo)}
              className="cursor-pointer transition-colors duration-150 hover:bg-white/50"
            >
              <td className="py-3 pr-4 pl-5 text-sm font-medium whitespace-nowrap text-texto capitalize">
                {formatearDia(chequeo.fecha)}
              </td>
              <td className="px-4 py-3">
                <Ambulancia chequeo={chequeo} />
              </td>
              <td className="px-4 py-3 text-sm text-texto">{chequeo.conductorNombre ?? '—'}</td>
              <td className="px-4 py-3">
                <InsigniaEstadoChequeo estado={chequeo.estado} />
              </td>
              <td className="hidden px-4 py-3 text-[13px] text-texto-secundario tabular-nums lg:table-cell">
                {chequeo.respuestas.length}
              </td>
              <td className="px-4 py-3">
                <Observaciones chequeo={chequeo} />
              </td>
              <td className="py-3 pr-5 pl-2 text-right">
                <button
                  type="button"
                  onClick={(evento) => {
                    evento.stopPropagation();
                    alAbrir(chequeo);
                  }}
                  aria-label={`Ver el chequeo de ${chequeo.ambulanciaCodigo ?? 'la ambulancia'} del ${formatearDia(chequeo.fecha)}`}
                  className="flex size-8 items-center justify-center rounded-lg text-texto-secundario hover:bg-white hover:text-primario focus-visible:ring-2 focus-visible:ring-primario/40 focus-visible:outline-none"
                >
                  <ChevronRight aria-hidden strokeWidth={1.75} className="size-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="divide-y divide-borde/60 md:hidden">
        {chequeos.map((chequeo) => (
          <li key={chequeo.id}>
            <button
              type="button"
              onClick={() => alAbrir(chequeo)}
              className="flex w-full items-center gap-3 px-4 py-4 text-left focus-visible:bg-white/60 focus-visible:outline-none"
            >
              <span className="min-w-0 flex-1 space-y-2">
                <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <Ambulancia chequeo={chequeo} />
                  <span className="text-[13px] text-texto-secundario capitalize">{formatearDia(chequeo.fecha)}</span>
                </span>
                <span className="block text-sm text-texto">{chequeo.conductorNombre ?? '—'}</span>
                <span className="flex flex-wrap items-center gap-2">
                  <InsigniaEstadoChequeo estado={chequeo.estado} />
                  <Observaciones chequeo={chequeo} />
                </span>
              </span>
              <ChevronRight aria-hidden strokeWidth={1.75} className="size-4 shrink-0 text-texto-secundario" />
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
