import { Bandage, CheckCircle2, Circle, Pill, Stethoscope, TriangleAlert } from 'lucide-react';
import { useMemo } from 'react';
import {
  ETIQUETAS_DEAMBULACION,
  ETIQUETAS_ESTADO_MENTAL,
  ETIQUETAS_REGION,
  ETIQUETAS_TIPO_LESION,
  ITEMS_DOWNTON,
  PUNTAJE_MAXIMO_DOWNTON,
} from '../constants/catalogos_clinicos';
import type { Intervencion, Lesion, ValoracionDownton } from '../types/historia_clinica.types';
import { formatearFechaHora, formatearHora } from '../utils/formato_clinico';
import { LineaTiempo, type ElementoLinea } from './linea_tiempo';
import { Bloque, SinDato } from './valor_o_dato';

function Vacio({ texto }: { texto: string }) {
  return <p className="text-sm text-texto-secundario">{texto}</p>;
}

export function SeccionLesiones({ lesiones }: { lesiones: readonly Lesion[] }) {
  const porRegion = useMemo(() => {
    const grupos = new Map<string, Lesion[]>();
    for (const lesion of lesiones) grupos.set(lesion.regionCorporal, [...(grupos.get(lesion.regionCorporal) ?? []), lesion]);
    return [...grupos.entries()];
  }, [lesiones]);

  if (lesiones.length === 0) return <Vacio texto="No se registraron lesiones." />;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {porRegion.map(([region, delGrupo]) => (
        <Bloque key={region} titulo={ETIQUETAS_REGION[region] ?? region}>
          <ul className="space-y-3">
            {delGrupo.map((lesion) => (
              <li key={lesion.id} className="flex gap-3">
                <Bandage aria-hidden strokeWidth={1.75} className="mt-0.5 size-4 shrink-0 text-critico" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-texto">{ETIQUETAS_TIPO_LESION[lesion.tipoLesion] ?? lesion.tipoLesion}</p>
                  <p className="text-[13px] break-words whitespace-pre-line text-texto-secundario">
                    {lesion.descripcion ?? <SinDato />}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Bloque>
      ))}
    </div>
  );
}

export function SeccionIntervenciones({ intervenciones }: { intervenciones: readonly Intervencion[] }) {
  const elementos = useMemo<ElementoLinea[]>(() => {
    const ordenadas = [...intervenciones].sort((a, b) => {
      // Sin hora van al final, en el orden en que se registraron.
      if (!a.realizadoEn) return 1;
      if (!b.realizadoEn) return -1;
      return new Date(a.realizadoEn).getTime() - new Date(b.realizadoEn).getTime();
    });
    return ordenadas.map((intervencion) => {
      const esMedicamento = intervencion.tipo === 'medicamento';
      const dosisVia = [intervencion.dosis, intervencion.via].filter(Boolean).join(' · ');
      return {
        id: intervencion.id,
        instante: intervencion.realizadoEn ?? '',
        hora: intervencion.realizadoEn ? formatearHora(intervencion.realizadoEn) : 'Sin hora',
        titulo: esMedicamento && dosisVia ? `${intervencion.nombre} ${dosisVia}` : intervencion.nombre,
        subtitulo: `${esMedicamento ? 'Medicamento' : 'Procedimiento'} · Registró ${intervencion.registradoPor.nombreCompleto ?? 'sin dato'}`,
        contenido: intervencion.resultado ? (
          <p className="text-[13px] break-words text-texto">
            <span className="text-texto-secundario">Resultado: </span>
            {intervencion.resultado}
          </p>
        ) : undefined,
        tono: esMedicamento ? 'primario' : 'neutro',
        icono: esMedicamento ? Pill : Stethoscope,
      };
    });
  }, [intervenciones]);

  if (intervenciones.length === 0) return <Vacio texto="No se registraron procedimientos ni medicamentos." />;
  return <LineaTiempo etiqueta="Procedimientos y medicamentos" elementos={elementos} />;
}

export function SeccionDownton({ valoraciones }: { valoraciones: readonly ValoracionDownton[] }) {
  if (valoraciones.length === 0) return <Vacio texto="No se valoró el riesgo de caídas." />;
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {valoraciones.map((valoracion) => {
        const alto = valoracion.nivelRiesgo === 'alto';
        return (
          <article key={valoracion.id} className="space-y-4 rounded-2xl border border-borde/70 bg-white/70 p-5">
            <header className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-base font-semibold text-texto tabular-nums">
                  Puntaje {valoracion.puntajeTotal} / {PUNTAJE_MAXIMO_DOWNTON}
                </p>
                <p className="text-[13px] text-texto-secundario">
                  {formatearFechaHora(valoracion.evaluadaEn)} · {valoracion.registradoPor.nombreCompleto ?? 'Sin dato'}
                </p>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold uppercase ${
                  alto ? 'bg-advertencia/12 text-advertencia' : 'bg-exito/10 text-exito'
                }`}
              >
                {alto && <TriangleAlert aria-hidden strokeWidth={2} className="size-3.5" />}
                Riesgo {valoracion.nivelRiesgo}
              </span>
            </header>
            <ul className="grid gap-x-4 gap-y-1.5 sm:grid-cols-2">
              {ITEMS_DOWNTON.map(({ clave, etiqueta }) => {
                const marcado = valoracion[clave];
                const Icono = marcado ? CheckCircle2 : Circle;
                return (
                  <li key={clave} className={`flex items-center gap-2 text-[13px] ${marcado ? 'font-medium text-texto' : 'text-texto-secundario'}`}>
                    <Icono aria-hidden strokeWidth={2} className={`size-3.5 shrink-0 ${marcado ? 'text-advertencia' : ''}`} />
                    {etiqueta}
                    <span className="sr-only">{marcado ? ': sí' : ': no'}</span>
                  </li>
                );
              })}
            </ul>
            <dl className="grid gap-3 border-t border-borde/70 pt-3 text-[13px] sm:grid-cols-2">
              <div>
                <dt className="text-texto-secundario">Estado mental</dt>
                <dd className="font-medium text-texto">{ETIQUETAS_ESTADO_MENTAL[valoracion.estadoMental] ?? valoracion.estadoMental}</dd>
              </div>
              <div>
                <dt className="text-texto-secundario">Deambulación</dt>
                <dd className="font-medium text-texto">{ETIQUETAS_DEAMBULACION[valoracion.deambulacion] ?? valoracion.deambulacion}</dd>
              </div>
              {valoracion.observacion && (
                <div className="sm:col-span-2">
                  <dt className="text-texto-secundario">Observación</dt>
                  <dd className="text-texto">{valoracion.observacion}</dd>
                </div>
              )}
            </dl>
          </article>
        );
      })}
    </div>
  );
}
