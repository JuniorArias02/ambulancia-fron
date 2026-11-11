import { zodResolver } from '@hookform/resolvers/zod';
import { Check, LoaderCircle, Pencil, Replace, TriangleAlert, X } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { AlertaError } from '../../../components/feedback/alerta_error';
import { Interruptor } from '../../../components/ui/interruptor';
import { useNotificaciones } from '../../../hooks/use_notificaciones';
import { claseBotonIcono, claseEntradaFila } from '../constants/estilos_listas';
import { LONGITUDES_LISTA } from '../constants/listas_chequeo';
import { useMutarPregunta, useReemplazarPregunta } from '../hooks/use_mutaciones_lista_chequeo';
import { esquemaPregunta, type FormularioPregunta } from '../schemas/lista_chequeo.schema';
import type { CambiosPregunta, PreguntaLista } from '../types/lista_chequeo.types';
import { ControlesOrden } from './controles_orden';

interface PropiedadesFilaPregunta {
  listaId: string;
  pregunta: PreguntaLista;
  /** Posición entre las activas; sin valor, está desactivada. */
  numero?: number;
  puedeSubir: boolean;
  puedeBajar: boolean;
  ordenando: boolean;
  alMover: (desplazamiento: -1 | 1) => void;
}

/** Formulario en línea para cambiar el texto. */
function EdicionTexto({
  listaId,
  pregunta,
  alTerminar,
}: {
  listaId: string;
  pregunta: PreguntaLista;
  alTerminar: () => void;
}) {
  const mutacion = useMutarPregunta(listaId);
  const reemplazo = useReemplazarPregunta(listaId);
  const { notificar } = useNotificaciones();
  const [textoBloqueado, setTextoBloqueado] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormularioPregunta>({
    resolver: zodResolver(esquemaPregunta),
    defaultValues: { pregunta: pregunta.pregunta },
  });

  const enviar = ({ pregunta: texto }: FormularioPregunta) => {
    if (texto === pregunta.pregunta) {
      alTerminar();
      return;
    }
    mutacion.mutate(
      { tipo: 'actualizar', itemId: pregunta.id, cambios: { pregunta: texto } },
      {
        onSuccess: alTerminar,
        // Ya tiene respuestas: el texto no se puede cambiar, pero sí reemplazar.
        onError: (error) => {
          if (error.estado === 409) setTextoBloqueado(texto);
        },
      },
    );
  };

  const reemplazar = () => {
    if (textoBloqueado === null) return;
    reemplazo.mutate(
      { original: pregunta, pregunta: textoBloqueado },
      {
        onSuccess: () => {
          notificar({
            tono: 'exito',
            titulo: 'Pregunta reemplazada',
            descripcion: 'La anterior quedó desactivada con sus respuestas.',
          });
          alTerminar();
        },
      },
    );
  };

  const ocupado = mutacion.isPending || reemplazo.isPending;
  const errorGeneral = reemplazo.error ?? (mutacion.error?.estado === 409 ? null : mutacion.error);
  const error = errors.pregunta?.message;

  return (
    <form onSubmit={handleSubmit(enviar)} noValidate className="space-y-2">
      <div className="flex items-start gap-2">
        <input
          aria-label="Texto de la pregunta"
          maxLength={LONGITUDES_LISTA.pregunta}
          autoFocus
          disabled={ocupado || textoBloqueado !== null}
          aria-invalid={error ? true : undefined}
          className={`min-w-0 flex-1 ${claseEntradaFila(Boolean(error))}`}
          {...register('pregunta')}
        />
        <button type="submit" disabled={ocupado || textoBloqueado !== null} aria-label="Guardar texto" title="Guardar" className={`mt-1 ${claseBotonIcono} text-primario!`}>
          {mutacion.isPending ? (
            <LoaderCircle aria-hidden className="size-4 animate-spin" />
          ) : (
            <Check aria-hidden strokeWidth={2} className="size-4" />
          )}
        </button>
        <button type="button" onClick={alTerminar} disabled={ocupado} aria-label="Cancelar edición" title="Cancelar" className={`mt-1 ${claseBotonIcono}`}>
          <X aria-hidden strokeWidth={1.75} className="size-4" />
        </button>
      </div>
      {error && <p className="text-[13px] text-critico">{error}</p>}
      {errorGeneral && <AlertaError error={errorGeneral} />}
      {textoBloqueado !== null && (
        <div className="space-y-3 rounded-xl border border-advertencia/25 bg-advertencia/8 px-4 py-3 text-[13px] text-texto">
          <p className="flex items-start gap-2.5">
            <TriangleAlert aria-hidden strokeWidth={1.75} className="mt-0.5 size-4 shrink-0 text-advertencia" />
            <span>
              Esta pregunta ya tiene respuestas: su texto no se puede cambiar para no alterar el historial. Puedes
              desactivarla y crear una nueva con el texto nuevo.
            </span>
          </p>
          <div className="flex flex-wrap gap-2 pl-6.5">
            <button
              type="button"
              onClick={reemplazar}
              disabled={reemplazo.isPending}
              className="inline-flex h-9 items-center gap-2 rounded-xl bg-advertencia px-3 text-[13px] font-semibold text-white shadow-advertencia transition-colors duration-150 hover:bg-advertencia-hover disabled:opacity-60"
            >
              {reemplazo.isPending ? (
                <LoaderCircle aria-hidden className="size-4 animate-spin" />
              ) : (
                <Replace aria-hidden strokeWidth={1.75} className="size-4" />
              )}
              Desactivar y crear una nueva
            </button>
            <button
              type="button"
              onClick={alTerminar}
              disabled={reemplazo.isPending}
              className="campo-vidrio h-9 rounded-xl px-3 text-[13px] font-medium text-texto hover:bg-white"
            >
              Dejarla como está
            </button>
          </div>
        </div>
      )}
    </form>
  );
}

export function FilaPregunta({ listaId, pregunta, numero, puedeSubir, puedeBajar, ordenando, alMover }: PropiedadesFilaPregunta) {
  const mutacion = useMutarPregunta(listaId);
  const [editando, setEditando] = useState(false);
  const activa = pregunta.activo;

  const cambiar = (cambios: CambiosPregunta) => {
    mutacion.reset();
    mutacion.mutate({ tipo: 'actualizar', itemId: pregunta.id, cambios });
  };

  return (
    <li className={`flex gap-3 px-5 py-3.5 ${activa ? '' : 'bg-texto-secundario/4'}`}>
      {activa ? (
        <ControlesOrden
          nombre={pregunta.pregunta}
          puedeSubir={puedeSubir}
          puedeBajar={puedeBajar}
          deshabilitados={ordenando || editando}
          alMover={alMover}
        />
      ) : (
        <span aria-hidden className="w-6 shrink-0" />
      )}
      <div className="min-w-0 flex-1 space-y-2.5">
        {editando ? (
          <EdicionTexto listaId={listaId} pregunta={pregunta} alTerminar={() => setEditando(false)} />
        ) : (
          <div className="flex items-start gap-2">
            <p className={`min-w-0 flex-1 pt-1 text-sm ${activa ? 'text-texto' : 'text-texto-secundario line-through decoration-texto-secundario/40'}`}>
              {numero !== undefined && (
                <span className="mr-2 font-semibold text-texto-secundario tabular-nums">{numero}.</span>
              )}
              {pregunta.pregunta}
            </p>
            {activa && (
              <button
                type="button"
                onClick={() => setEditando(true)}
                disabled={mutacion.isPending}
                aria-label={`Editar «${pregunta.pregunta}»`}
                title="Editar texto"
                className={claseBotonIcono}
              >
                <Pencil aria-hidden strokeWidth={1.75} className="size-4" />
              </button>
            )}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <Interruptor
            etiqueta="Obligatoria"
            activo={pregunta.obligatorio}
            deshabilitado={!activa || mutacion.isPending}
            alCambiar={(obligatorio) => cambiar({ obligatorio })}
          />
          <Interruptor
            etiqueta="Admite observación"
            activo={pregunta.permiteObservacion}
            deshabilitado={!activa || mutacion.isPending}
            alCambiar={(permiteObservacion) => cambiar({ permiteObservacion })}
          />
          <Interruptor
            etiqueta="Activa"
            activo={activa}
            deshabilitado={mutacion.isPending || editando}
            alCambiar={(activo) => cambiar({ activo })}
          />
          {mutacion.isPending && <LoaderCircle aria-label="Guardando" className="size-4 animate-spin text-texto-secundario" />}
        </div>
        {mutacion.error && <AlertaError error={mutacion.error} />}
      </div>
    </li>
  );
}
