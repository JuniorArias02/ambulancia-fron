import { UserRound } from 'lucide-react';
import { ETIQUETAS_FUNCION, FUNCIONES } from '../constants/turnos';
import type { IntegranteTurno } from '../types/turno.types';

/** Tripulación ordenada por función: conductor, paramédicos, médicos. */
export function ListaIntegrantes({ integrantes }: { integrantes: IntegranteTurno[] }) {
  const ordenados = [...integrantes].sort((a, b) => FUNCIONES.indexOf(a.funcion) - FUNCIONES.indexOf(b.funcion));
  return (
    <ul className="space-y-2">
      {ordenados.map(({ usuarioId, nombreCompleto, funcion }) => (
        <li key={usuarioId} className="flex min-w-0 items-center gap-2.5 text-sm">
          <span
            aria-hidden
            className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primario/8 text-primario"
          >
            <UserRound strokeWidth={1.75} className="size-3.5" />
          </span>
          <span className="min-w-0 flex-1 truncate text-texto">{nombreCompleto ?? 'Sin nombre'}</span>
          <span className="shrink-0 rounded-md bg-texto-secundario/8 px-1.5 py-0.5 text-[11px] font-medium text-texto-secundario">
            {ETIQUETAS_FUNCION[funcion]}
          </span>
        </li>
      ))}
    </ul>
  );
}
