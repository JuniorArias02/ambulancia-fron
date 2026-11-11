import { Ambulance, CircleAlert, ClipboardCheck, MessageSquareText, UserRound } from 'lucide-react';
import { useState } from 'react';
import { EstadoError } from '../../../components/states/estado_error';
import { Dialogo } from '../../../components/ui/dialogo';
import { SelectorSegmentado } from '../../../components/ui/selector_segmentado';
import { formatearFechaHora } from '../../../utils/formato_fecha';
import { useChequeo } from '../hooks/use_chequeos_diarios';
import { useListaChequeo } from '../hooks/use_listas_chequeo';
import type { ChequeoDiario, RespuestaChequeo } from '../types/chequeo_diario.types';
import { esNovedad, formatearDia } from '../utils/chequeos_diarios';
import { mejorOpcion } from '../utils/listas_chequeo';
import { InsigniaEstadoChequeo } from './insignia_estado_chequeo';

type Vista = 'novedades' | 'todas';

interface PropiedadesPanelChequeo {
  /** Lo que ya se conoce de la tabla, para el encabezado mientras carga el detalle. */
  resumen: ChequeoDiario;
  /** La escala de calificaciones (`/listas-chequeo`) solo la puede leer el administrador. */
  conocerEscala: boolean;
  alCerrar: () => void;
}

function Calificacion({ respuesta, mejorId }: { respuesta: RespuestaChequeo; mejorId: string | undefined }) {
  const clases =
    mejorId === undefined
      ? 'bg-texto-secundario/10 text-texto'
      : respuesta.estadoId === mejorId
        ? 'bg-exito/10 text-exito'
        : 'bg-advertencia/12 text-advertencia-hover';
  return (
    <span className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${clases}`}>
      {respuesta.calificacion ?? 'Sin calificación'}
    </span>
  );
}

function FilaRespuesta({ respuesta, mejorId }: { respuesta: RespuestaChequeo; mejorId: string | undefined }) {
  const novedad = esNovedad(respuesta, mejorId);
  return (
    <li
      className={`rounded-2xl border px-4 py-3 ${
        novedad ? 'border-advertencia/25 bg-advertencia/6' : 'border-borde/70 bg-white/60'
      }`}
    >
      <div className="flex items-start gap-3">
        <p className="min-w-0 flex-1 text-sm font-medium text-texto">{respuesta.pregunta ?? 'Pregunta sin texto'}</p>
        <Calificacion respuesta={respuesta} mejorId={mejorId} />
      </div>
      {respuesta.tieneObservacion && respuesta.observacion && (
        <p className="mt-2 flex gap-2 rounded-xl bg-white/80 px-3 py-2 text-[13px] text-texto">
          <MessageSquareText aria-hidden strokeWidth={1.75} className="mt-0.5 size-3.5 shrink-0 text-advertencia" />
          <span>
            <span className="sr-only">Observación: </span>
            {respuesta.observacion}
          </span>
        </p>
      )}
      <p className="mt-1.5 text-xs text-texto-secundario">
        Respondida el <time dateTime={respuesta.respondidoEn}>{formatearFechaHora(respuesta.respondidoEn)}</time>
      </p>
    </li>
  );
}

export function PanelChequeo({ resumen, conocerEscala, alCerrar }: PropiedadesPanelChequeo) {
  const consulta = useChequeo(resumen.id);
  const lista = useListaChequeo(resumen.listaChequeoId, conocerEscala);
  const [vista, setVista] = useState<Vista>('todas');

  const chequeo = consulta.data ?? resumen;
  const mejorId = lista.data ? mejorOpcion(lista.data.estados)?.id : undefined;
  const novedades = chequeo.respuestas.filter((respuesta) => esNovedad(respuesta, mejorId));
  const visibles = vista === 'novedades' ? novedades : chequeo.respuestas;
  const pendientes = lista.data
    ? chequeo.pendientes.map((id) => lista.data.items.find((item) => item.id === id)?.pregunta ?? 'Pregunta desactivada')
    : [];

  return (
    <Dialogo
      abierto
      variante="lateral"
      titulo={`Chequeo del ${formatearDia(chequeo.fecha)}`}
      descripcion={
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <span className="inline-flex items-center gap-1.5 font-medium text-texto">
            <Ambulance aria-hidden strokeWidth={1.75} className="size-4 text-primario" />
            {chequeo.ambulanciaCodigo ?? 'Ambulancia'}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <UserRound aria-hidden strokeWidth={1.75} className="size-4" />
            {chequeo.conductorNombre ?? 'Conductor'}
          </span>
          <InsigniaEstadoChequeo estado={chequeo.estado} />
        </span>
      }
      alCerrar={alCerrar}
    >
      <div className="space-y-4 px-6 py-5">
        <dl className="grid grid-cols-2 gap-3 text-[13px]">
          <div>
            <dt className="text-texto-secundario">Iniciado</dt>
            <dd className="mt-0.5 text-texto">{chequeo.iniciadoEn ? formatearFechaHora(chequeo.iniciadoEn) : '—'}</dd>
          </div>
          <div>
            <dt className="text-texto-secundario">Finalizado</dt>
            <dd className="mt-0.5 text-texto">
              {chequeo.finalizadoEn ? formatearFechaHora(chequeo.finalizadoEn) : 'Aún en curso'}
            </dd>
          </div>
        </dl>

        {consulta.isPending ? (
          <div role="status" aria-label="Cargando respuestas" className="space-y-2">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-2xl bg-white/50" />
            ))}
          </div>
        ) : consulta.isError ? (
          <EstadoError
            titulo="No fue posible cargar el chequeo"
            mensaje={consulta.error.message}
            alReintentar={() => void consulta.refetch()}
          />
        ) : (
          <>
            {chequeo.estado === 'borrador' && chequeo.pendientes.length > 0 && (
              <div className="flex items-start gap-2.5 rounded-xl bg-primario/5 px-4 py-3 text-[13px] text-texto">
                <CircleAlert aria-hidden strokeWidth={1.75} className="mt-0.5 size-4 shrink-0 text-primario" />
                <div>
                  <p>
                    Faltan {chequeo.pendientes.length}{' '}
                    {chequeo.pendientes.length === 1 ? 'pregunta obligatoria' : 'preguntas obligatorias'} por responder.
                  </p>
                  {pendientes.length > 0 && (
                    <ul className="mt-1 list-disc pl-4 text-texto-secundario">
                      {pendientes.map((pregunta, indice) => (
                        <li key={`${pregunta}-${indice}`}>{pregunta}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-texto">
                <span className="font-semibold">{novedades.length}</span>{' '}
                {novedades.length === 1 ? 'novedad' : 'novedades'} de {chequeo.respuestas.length}{' '}
                {chequeo.respuestas.length === 1 ? 'respuesta' : 'respuestas'}
              </p>
              {chequeo.respuestas.length > 0 && (
                <SelectorSegmentado<Vista>
                  etiqueta="Respuestas a mostrar"
                  valor={vista}
                  opciones={[
                    { valor: 'todas', texto: 'Todas', icono: ClipboardCheck },
                    { valor: 'novedades', texto: 'Novedades', icono: CircleAlert },
                  ]}
                  alCambiar={setVista}
                />
              )}
            </div>
            <p className="text-xs text-texto-secundario">
              {mejorId
                ? 'Se resaltan las respuestas con observación y las calificaciones distintas de la mejor.'
                : 'Se resaltan las respuestas con observación.'}
            </p>

            {visibles.length === 0 ? (
              <p className="rounded-2xl bg-white/50 px-4 py-8 text-center text-sm text-texto-secundario">
                {chequeo.respuestas.length === 0 ? 'El conductor aún no ha respondido.' : 'Sin novedades: todo en orden.'}
              </p>
            ) : (
              <ul className="space-y-2">
                {visibles.map((respuesta) => (
                  <FilaRespuesta key={respuesta.itemId} respuesta={respuesta} mejorId={mejorId} />
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </Dialogo>
  );
}
