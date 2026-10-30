import { CircleCheck, Copy, CopyCheck, LoaderCircle, RotateCw } from 'lucide-react';
import { useState } from 'react';
import { generatePath, Link } from 'react-router';
import { RUTAS } from '../../../constants/rutas';
import { ETIQUETAS_CRITERIO } from '../constants/catalogos_emergencia';
import { usePosiblesDuplicadas } from '../hooks/use_emergencias';
import type { Emergencia, PosibleDuplicada } from '../types/emergencia.types';
import { textoDistancia } from '../utils/formato_emergencia';
import { haceTiempo } from '../../../utils/tiempo_transcurrido';
import { DialogoMarcarDuplicada } from './dialogo_marcar_duplicada';
import { InsigniaPrioridad } from './insignias_emergencia';

interface PropiedadesPosiblesDuplicadas {
  emergencia: Emergencia;
  ahora: number;
}

function textoCoincidencia({ distanciaMetros, criterios }: PosibleDuplicada): string {
  const partes: string[] = [];
  if (distanciaMetros !== null) partes.push(textoDistancia(distanciaMetros));
  for (const criterio of criterios) {
    if (criterio !== 'cercania' || distanciaMetros === null) partes.push(ETIQUETAS_CRITERIO[criterio]);
  }
  return partes.join(', ');
}

/** Sugerencias del backend: nunca se marca una duplicada sin que el despachador lo confirme. */
export function PosiblesDuplicadas({ emergencia, ahora }: PropiedadesPosiblesDuplicadas) {
  const sugerencias = usePosiblesDuplicadas(emergencia.id);
  const [principal, setPrincipal] = useState<Emergencia | null>(null);

  if (sugerencias.isPending) {
    return (
      <p role="status" className="vidrio flex items-center gap-2.5 rounded-2xl px-5 py-4 text-sm text-texto-secundario">
        <LoaderCircle aria-hidden className="size-4 animate-spin text-primario" />
        Buscando posibles llamadas repetidas…
      </p>
    );
  }

  if (sugerencias.isError) {
    return (
      <div role="alert" className="vidrio flex flex-wrap items-center gap-3 rounded-2xl px-5 py-4 text-sm">
        <span className="flex-1 text-texto">No fue posible buscar posibles duplicadas: {sugerencias.error.message}</span>
        <button
          type="button"
          onClick={() => void sugerencias.refetch()}
          className="campo-vidrio inline-flex h-9 items-center gap-2 rounded-xl px-3 text-sm font-medium text-texto hover:bg-white"
        >
          <RotateCw aria-hidden strokeWidth={1.75} className="size-4" />
          Reintentar
        </button>
      </div>
    );
  }

  if (sugerencias.data.length === 0) {
    return (
      <p className="vidrio flex items-center gap-2.5 rounded-2xl px-5 py-3.5 text-sm text-texto-secundario">
        <CircleCheck aria-hidden strokeWidth={1.75} className="size-4 text-exito" />
        No se encontraron emergencias activas cercanas o con la misma dirección en las últimas 2 horas.
      </p>
    );
  }

  return (
    <section
      aria-labelledby="titulo-duplicadas"
      className="vidrio rounded-2xl border-advertencia/30! bg-advertencia/[0.06]"
    >
      <header className="flex items-start gap-3 border-b border-advertencia/15 px-5 py-4">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-advertencia/12 text-advertencia-hover">
          <Copy aria-hidden strokeWidth={1.75} className="size-4" />
        </span>
        <div>
          <h3 id="titulo-duplicadas" className="text-base font-semibold text-texto">
            Puede ser la misma emergencia que…
          </h3>
          <p className="mt-0.5 text-[13px] text-texto-secundario">
            Son sugerencias. Revisa cada una y confirma solo si es el mismo incidente.
          </p>
        </div>
      </header>
      <ul className="divide-y divide-advertencia/15">
        {sugerencias.data.map((sugerencia) => {
          const candidata = sugerencia.emergencia;
          return (
            <li key={candidata.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-texto tabular-nums">{candidata.numeroEmergencia}</span>
                  <InsigniaPrioridad prioridad={candidata.prioridad} />
                  <span className="text-[13px] text-texto-secundario">
                    {haceTiempo(candidata.recibidaEn, ahora)}
                  </span>
                </p>
                <p className="mt-1 truncate text-[13px] text-texto">{candidata.descripcion}</p>
                <p className="mt-0.5 text-[13px] font-medium text-advertencia-hover">{textoCoincidencia(sugerencia)}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Link
                  to={generatePath(RUTAS.detalleEmergencia, { id: candidata.id })}
                  className="campo-vidrio inline-flex h-9 items-center rounded-xl px-3 text-sm font-medium text-texto transition-colors duration-150 hover:bg-white"
                >
                  Ver
                </Link>
                <button
                  type="button"
                  onClick={() => setPrincipal(candidata)}
                  className="inline-flex h-9 items-center gap-2 rounded-xl bg-primario px-3 text-sm font-semibold text-white shadow-primario transition-colors duration-150 hover:bg-primario-hover focus-visible:ring-4 focus-visible:ring-primario/25 focus-visible:outline-none"
                >
                  <CopyCheck aria-hidden strokeWidth={1.75} className="size-4" />
                  Es la misma emergencia
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {principal && (
        <DialogoMarcarDuplicada repetida={emergencia} principal={principal} alCerrar={() => setPrincipal(null)} />
      )}
    </section>
  );
}
