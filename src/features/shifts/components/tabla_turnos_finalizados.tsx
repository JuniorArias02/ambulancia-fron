import { generatePath, Link } from 'react-router';
import { RUTAS } from '../../../constants/rutas';
import { formatearFechaHora } from '../../../utils/formato_fecha';
import { tiempoTranscurrido } from '../../../utils/tiempo_transcurrido';
import { ETIQUETAS_FUNCION } from '../constants/turnos';
import type { Turno } from '../types/turno.types';

function textoTripulacion(turno: Turno): string {
  if (turno.integrantes.length === 0) return 'Sin integrantes';
  return turno.integrantes
    .map(({ nombreCompleto, funcion }) => `${nombreCompleto ?? 'Sin nombre'} (${ETIQUETAS_FUNCION[funcion].toLowerCase()})`)
    .join(', ');
}

function duracion(turno: Turno): string {
  return turno.fin ? tiempoTranscurrido(turno.inicio, new Date(turno.fin).getTime()) : '—';
}

export function TablaTurnosFinalizados({ turnos }: { turnos: Turno[] }) {
  return (
    <>
      <table className="hidden w-full table-fixed text-left md:table">
        <thead>
          <tr className="border-b border-borde/80 text-xs font-medium tracking-wide text-texto-secundario uppercase">
            <th scope="col" className="w-36 py-3 pr-4 pl-5 font-medium">Ambulancia</th>
            <th scope="col" className="w-44 px-4 py-3 font-medium">Inicio</th>
            <th scope="col" className="w-44 px-4 py-3 font-medium">Fin</th>
            <th scope="col" className="w-28 px-4 py-3 font-medium">Duración</th>
            <th scope="col" className="py-3 pr-5 pl-4 font-medium">Tripulación</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-borde/60">
          {turnos.map((turno) => (
            <tr key={turno.id} className="text-sm transition-colors duration-150 hover:bg-white/50">
              <td className="py-3 pr-4 pl-5 font-semibold text-texto">
                <Link to={generatePath(RUTAS.detalleAmbulancia, { id: turno.ambulanciaId })} className="hover:text-primario">
                  {turno.ambulanciaCodigo ?? '—'}
                </Link>
              </td>
              <td className="px-4 py-3 text-[13px] text-texto-secundario">{formatearFechaHora(turno.inicio)}</td>
              <td className="px-4 py-3 text-[13px] text-texto-secundario">{turno.fin ? formatearFechaHora(turno.fin) : '—'}</td>
              <td className="px-4 py-3 text-[13px] text-texto-secundario tabular-nums">{duracion(turno)}</td>
              <td className="truncate py-3 pr-5 pl-4 text-texto" title={textoTripulacion(turno)}>
                {textoTripulacion(turno)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="divide-y divide-borde/60 md:hidden">
        {turnos.map((turno) => (
          <li key={turno.id} className="space-y-1 px-4 py-4 text-sm">
            <p className="flex items-center justify-between gap-3">
              <span className="font-semibold text-texto">{turno.ambulanciaCodigo ?? '—'}</span>
              <span className="text-[13px] text-texto-secundario tabular-nums">{duracion(turno)}</span>
            </p>
            <p className="text-[13px] text-texto-secundario">
              {formatearFechaHora(turno.inicio)} → {turno.fin ? formatearFechaHora(turno.fin) : '—'}
            </p>
            <p className="text-[13px] text-texto">{textoTripulacion(turno)}</p>
          </li>
        ))}
      </ul>
    </>
  );
}
