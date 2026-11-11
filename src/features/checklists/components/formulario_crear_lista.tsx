import { zodResolver } from '@hookform/resolvers/zod';
import { ListChecks, Plus, Text, X } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { AlertaError } from '../../../components/feedback/alerta_error';
import { CampoTexto } from '../../../components/forms/campo_texto';
import { PieFormulario } from '../../../components/forms/pie_formulario';
import { Interruptor } from '../../../components/ui/interruptor';
import { useNotificaciones } from '../../../hooks/use_notificaciones';
import { claseBotonIcono, claseEntradaFila } from '../constants/estilos_listas';
import { LONGITUDES_LISTA, MINIMO_OPCIONES, MINIMO_PREGUNTAS, OPCIONES_INICIALES } from '../constants/listas_chequeo';
import { useCrearListaChequeo } from '../hooks/use_mutaciones_lista_chequeo';
import {
  esquemaCrearLista,
  type EntradaCrearLista,
  type FormularioCrearLista as DatosFormulario,
} from '../schemas/lista_chequeo.schema';
import type { ListaChequeo } from '../types/lista_chequeo.types';
import { aDatosCrearLista } from '../utils/listas_chequeo';

const PREGUNTA_VACIA = { pregunta: '', obligatorio: true, permiteObservacion: true };

interface PropiedadesFormularioCrearLista {
  alCambiarSinGuardar: (sinGuardar: boolean) => void;
  alCrear: (lista: ListaChequeo) => void;
  alCancelar: () => void;
}

function ErrorFila({ id, mensaje }: { id: string; mensaje?: string }) {
  if (!mensaje) return null;
  return (
    <p id={id} className="mt-1.5 text-[13px] text-critico">
      {mensaje}
    </p>
  );
}

export function FormularioCrearLista({ alCambiarSinGuardar, alCrear, alCancelar }: PropiedadesFormularioCrearLista) {
  const creacion = useCrearListaChequeo();
  const { notificar } = useNotificaciones();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty },
  } = useForm<EntradaCrearLista, unknown, DatosFormulario>({
    resolver: zodResolver(esquemaCrearLista),
    defaultValues: {
      nombre: '',
      descripcion: '',
      items: [PREGUNTA_VACIA],
      estados: OPCIONES_INICIALES.map((opcion) => ({ ...opcion })),
    },
  });
  const preguntas = useFieldArray({ control, name: 'items' });
  const opciones = useFieldArray({ control, name: 'estados' });

  useEffect(() => alCambiarSinGuardar(isDirty), [isDirty, alCambiarSinGuardar]);

  const enviar = (datos: DatosFormulario) =>
    creacion.mutate(aDatosCrearLista(datos), {
      onSuccess: (lista) => {
        notificar({
          tono: 'exito',
          titulo: 'Lista creada',
          descripcion: `${lista.nombre} queda inactiva hasta que la actives.`,
        });
        alCrear(lista);
      },
    });

  const enviando = creacion.isPending;

  return (
    <form onSubmit={handleSubmit(enviar)} noValidate className="flex min-h-full flex-col">
      <div className="flex-1 space-y-8 px-6 py-6">
        {creacion.error && <AlertaError error={creacion.error} />}

        <fieldset disabled={enviando} className="space-y-5">
          <legend className="mb-4 text-sm font-semibold text-texto">Datos de la lista</legend>
          <CampoTexto
            id="nombre"
            etiqueta="Nombre"
            icono={ListChecks}
            placeholder="Chequeo diario"
            maxLength={LONGITUDES_LISTA.nombre}
            error={errors.nombre?.message}
            {...register('nombre')}
          />
          <CampoTexto
            id="descripcion"
            etiqueta="Descripción"
            icono={Text}
            obligatorio={false}
            placeholder="Antes del turno"
            maxLength={LONGITUDES_LISTA.descripcion}
            error={errors.descripcion?.message}
            {...register('descripcion')}
          />
        </fieldset>

        <fieldset disabled={enviando} className="space-y-3">
          <legend className="mb-1 text-sm font-semibold text-texto">Preguntas</legend>
          <p className="text-[13px] text-texto-secundario">
            Lo que el conductor revisa en la ambulancia, en este orden.
          </p>
          <ol className="space-y-3">
            {preguntas.fields.map((campo, indice) => {
              const error = errors.items?.[indice]?.pregunta?.message;
              const idError = `error-pregunta-${indice}`;
              return (
                <li key={campo.id} className="rounded-2xl border border-borde/80 bg-white/50 p-3">
                  <div className="flex items-start gap-2">
                    <span className="mt-2.5 w-5 shrink-0 text-right text-[13px] font-semibold text-texto-secundario tabular-nums">
                      {indice + 1}.
                    </span>
                    <div className="min-w-0 flex-1">
                      <input
                        aria-label={`Pregunta ${indice + 1}`}
                        placeholder="¿Nivel de aceite?"
                        maxLength={LONGITUDES_LISTA.pregunta}
                        aria-invalid={error ? true : undefined}
                        aria-describedby={error ? idError : undefined}
                        className={claseEntradaFila(Boolean(error))}
                        {...register(`items.${indice}.pregunta`)}
                      />
                      <ErrorFila id={idError} mensaje={error} />
                    </div>
                    <button
                      type="button"
                      onClick={() => preguntas.remove(indice)}
                      disabled={preguntas.fields.length <= MINIMO_PREGUNTAS}
                      aria-label={`Quitar la pregunta ${indice + 1}`}
                      title="Quitar"
                      className={`mt-1 ${claseBotonIcono}`}
                    >
                      <X aria-hidden strokeWidth={1.75} className="size-4" />
                    </button>
                  </div>
                  <div className="mt-2.5 flex flex-wrap gap-x-5 gap-y-2 pl-7">
                    <Controller
                      control={control}
                      name={`items.${indice}.obligatorio`}
                      render={({ field }) => (
                        <Interruptor
                          etiqueta="Obligatoria"
                          activo={field.value}
                          deshabilitado={enviando}
                          alCambiar={field.onChange}
                        />
                      )}
                    />
                    <Controller
                      control={control}
                      name={`items.${indice}.permiteObservacion`}
                      render={({ field }) => (
                        <Interruptor
                          etiqueta="Admite observación"
                          activo={field.value}
                          deshabilitado={enviando}
                          alCambiar={field.onChange}
                        />
                      )}
                    />
                  </div>
                </li>
              );
            })}
          </ol>
          {errors.items?.root?.message && <p className="text-[13px] text-critico">{errors.items.root.message}</p>}
          <button
            type="button"
            onClick={() => preguntas.append(PREGUNTA_VACIA)}
            className="inline-flex h-9 items-center gap-2 rounded-xl px-3 text-sm font-medium text-primario transition-colors duration-150 hover:bg-primario/6"
          >
            <Plus aria-hidden strokeWidth={1.75} className="size-4" />
            Agregar pregunta
          </button>
        </fieldset>

        <fieldset disabled={enviando} className="space-y-3">
          <legend className="mb-1 text-sm font-semibold text-texto">Opciones de calificación</legend>
          <p className="text-[13px] text-texto-secundario">
            Con qué califica cada pregunta. El puntaje es opcional; el mayor es la mejor calificación.
          </p>
          <ol className="space-y-2">
            {opciones.fields.map((campo, indice) => {
              const errorNombre = errors.estados?.[indice]?.nombre?.message;
              const errorValor = errors.estados?.[indice]?.valor?.message;
              return (
                <li key={campo.id}>
                  <div className="flex items-start gap-2">
                    <input
                      aria-label={`Nombre de la opción ${indice + 1}`}
                      placeholder="Bien"
                      maxLength={LONGITUDES_LISTA.opcion}
                      aria-invalid={errorNombre ? true : undefined}
                      className={`min-w-0 flex-1 ${claseEntradaFila(Boolean(errorNombre))}`}
                      {...register(`estados.${indice}.nombre`)}
                    />
                    <input
                      aria-label={`Puntaje de la opción ${indice + 1}`}
                      placeholder="Puntaje"
                      inputMode="numeric"
                      aria-invalid={errorValor ? true : undefined}
                      className={`w-24! ${claseEntradaFila(Boolean(errorValor))}`}
                      {...register(`estados.${indice}.valor`)}
                    />
                    <button
                      type="button"
                      onClick={() => opciones.remove(indice)}
                      disabled={opciones.fields.length <= MINIMO_OPCIONES}
                      aria-label={`Quitar la opción ${indice + 1}`}
                      title="Quitar"
                      className={`mt-1 ${claseBotonIcono}`}
                    >
                      <X aria-hidden strokeWidth={1.75} className="size-4" />
                    </button>
                  </div>
                  <ErrorFila id={`error-opcion-${indice}`} mensaje={errorNombre ?? errorValor} />
                </li>
              );
            })}
          </ol>
          {errors.estados?.root?.message && <p className="text-[13px] text-critico">{errors.estados.root.message}</p>}
          <button
            type="button"
            onClick={() => opciones.append({ nombre: '', valor: '' })}
            className="inline-flex h-9 items-center gap-2 rounded-xl px-3 text-sm font-medium text-primario transition-colors duration-150 hover:bg-primario/6"
          >
            <Plus aria-hidden strokeWidth={1.75} className="size-4" />
            Agregar opción
          </button>
        </fieldset>
      </div>

      <PieFormulario
        textoEnviar="Crear lista"
        textoEnviando="Creando…"
        icono={Plus}
        enviando={enviando}
        alCancelar={alCancelar}
      />
    </form>
  );
}
