import { zodResolver } from '@hookform/resolvers/zod';
import { Award, Check, LoaderCircle, Pencil, X } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { AlertaError } from '../../../components/feedback/alerta_error';
import { Interruptor } from '../../../components/ui/interruptor';
import { claseBotonIcono, claseEntradaFila } from '../constants/estilos_listas';
import { LONGITUDES_LISTA } from '../constants/listas_chequeo';
import { useMutarOpcion } from '../hooks/use_mutaciones_lista_chequeo';
import { esquemaOpcion, type EntradaOpcion, type FormularioOpcion } from '../schemas/lista_chequeo.schema';
import type { CambiosOpcion, OpcionLista } from '../types/lista_chequeo.types';
import { ControlesOrden } from './controles_orden';

interface PropiedadesFilaOpcion {
  listaId: string;
  opcion: OpcionLista;
  esMejor: boolean;
  puedeSubir: boolean;
  puedeBajar: boolean;
  ordenando: boolean;
  alMover: (desplazamiento: -1 | 1) => void;
}

function EdicionOpcion({ listaId, opcion, alTerminar }: { listaId: string; opcion: OpcionLista; alTerminar: () => void }) {
  const mutacion = useMutarOpcion(listaId);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EntradaOpcion, unknown, FormularioOpcion>({
    resolver: zodResolver(esquemaOpcion),
    defaultValues: { nombre: opcion.nombre, valor: opcion.valor === null ? '' : String(opcion.valor) },
  });

  const enviar = ({ nombre, valor }: FormularioOpcion) => {
    const cambios: CambiosOpcion = {};
    if (nombre !== opcion.nombre) cambios.nombre = nombre;
    if (valor !== opcion.valor) cambios.valor = valor;
    if (Object.keys(cambios).length === 0) {
      alTerminar();
      return;
    }
    mutacion.mutate({ tipo: 'actualizar', estadoId: opcion.id, cambios }, { onSuccess: alTerminar });
  };

  const error = errors.nombre?.message ?? errors.valor?.message;

  return (
    <form onSubmit={handleSubmit(enviar)} noValidate className="space-y-2">
      <div className="flex items-start gap-2">
        <input
          aria-label="Nombre de la opción"
          maxLength={LONGITUDES_LISTA.opcion}
          autoFocus
          disabled={mutacion.isPending}
          aria-invalid={errors.nombre ? true : undefined}
          className={`min-w-0 flex-1 ${claseEntradaFila(Boolean(errors.nombre))}`}
          {...register('nombre')}
        />
        <input
          aria-label="Puntaje"
          placeholder="Puntaje"
          inputMode="numeric"
          disabled={mutacion.isPending}
          aria-invalid={errors.valor ? true : undefined}
          className={`w-20! ${claseEntradaFila(Boolean(errors.valor))}`}
          {...register('valor')}
        />
        <button type="submit" disabled={mutacion.isPending} aria-label="Guardar opción" title="Guardar" className={`mt-1 ${claseBotonIcono} text-primario!`}>
          {mutacion.isPending ? (
            <LoaderCircle aria-hidden className="size-4 animate-spin" />
          ) : (
            <Check aria-hidden strokeWidth={2} className="size-4" />
          )}
        </button>
        <button type="button" onClick={alTerminar} disabled={mutacion.isPending} aria-label="Cancelar edición" title="Cancelar" className={`mt-1 ${claseBotonIcono}`}>
          <X aria-hidden strokeWidth={1.75} className="size-4" />
        </button>
      </div>
      {error && <p className="text-[13px] text-critico">{error}</p>}
      {mutacion.error && <AlertaError error={mutacion.error} />}
    </form>
  );
}

export function FilaOpcion({ listaId, opcion, esMejor, puedeSubir, puedeBajar, ordenando, alMover }: PropiedadesFilaOpcion) {
  const mutacion = useMutarOpcion(listaId);
  const [editando, setEditando] = useState(false);
  const activa = opcion.activo;

  const cambiarActiva = (activo: boolean) => {
    mutacion.reset();
    mutacion.mutate({ tipo: 'actualizar', estadoId: opcion.id, cambios: { activo } });
  };

  return (
    <li className={`flex gap-3 px-5 py-3 ${activa ? '' : 'bg-texto-secundario/4'}`}>
      {activa ? (
        <ControlesOrden
          nombre={opcion.nombre}
          puedeSubir={puedeSubir}
          puedeBajar={puedeBajar}
          deshabilitados={ordenando || editando}
          alMover={alMover}
        />
      ) : (
        <span aria-hidden className="w-6 shrink-0" />
      )}
      <div className="min-w-0 flex-1 space-y-2">
        {editando ? (
          <EdicionOpcion listaId={listaId} opcion={opcion} alTerminar={() => setEditando(false)} />
        ) : (
          <div className="flex items-center gap-2">
            <p className="flex min-w-0 flex-1 flex-wrap items-center gap-2 text-sm">
              <span className={activa ? 'font-medium text-texto' : 'text-texto-secundario line-through decoration-texto-secundario/40'}>
                {opcion.nombre}
              </span>
              {opcion.valor !== null && (
                <span className="rounded-md bg-texto-secundario/8 px-1.5 py-0.5 text-[11px] font-medium text-texto-secundario tabular-nums">
                  {opcion.valor} pts
                </span>
              )}
              {esMejor && (
                <span className="inline-flex items-center gap-1 rounded-md bg-exito/10 px-1.5 py-0.5 text-[11px] font-medium text-exito">
                  <Award aria-hidden strokeWidth={2} className="size-3" />
                  Mejor calificación
                </span>
              )}
            </p>
            {activa && (
              <button
                type="button"
                onClick={() => setEditando(true)}
                disabled={mutacion.isPending}
                aria-label={`Editar «${opcion.nombre}»`}
                title="Editar"
                className={claseBotonIcono}
              >
                <Pencil aria-hidden strokeWidth={1.75} className="size-4" />
              </button>
            )}
            <Interruptor
              etiqueta={`${activa ? 'Desactivar' : 'Activar'} «${opcion.nombre}»`}
              etiquetaVisible={false}
              activo={activa}
              deshabilitado={mutacion.isPending || editando}
              alCambiar={cambiarActiva}
            />
          </div>
        )}
        {mutacion.error && <AlertaError error={mutacion.error} />}
      </div>
    </li>
  );
}
