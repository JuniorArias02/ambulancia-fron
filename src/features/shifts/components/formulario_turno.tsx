import { zodResolver } from '@hookform/resolvers/zod';
import { Ambulance, Info, Play, Save, UserPlus } from 'lucide-react';
import { useEffect } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { AlertaError } from '../../../components/feedback/alerta_error';
import { CampoSelector } from '../../../components/forms/campo_selector';
import { PieFormulario } from '../../../components/forms/pie_formulario';
import { useNotificaciones } from '../../../hooks/use_notificaciones';
import { useAmbulancias } from '../../ambulances/hooks/use_ambulancias';
import { formatearPlaca } from '../../ambulances/utils/formato_ambulancia';
import {
  MAXIMO_INTEGRANTES,
  MINIMO_INTEGRANTES,
  ROL_POR_FUNCION,
  type RolTripulante,
} from '../constants/turnos';
import { useCambiarIntegrantes, useIniciarTurno } from '../hooks/use_mutaciones_turno';
import { usePersonal, useTurnosActivos } from '../hooks/use_turnos';
import { esquemaTurno, type FormularioTurno as DatosFormulario } from '../schemas/turno.schema';
import type { Turno } from '../types/turno.types';
import { opcionesPersona, personasOcupadas } from '../utils/tripulacion';
import { FilaIntegrante } from './fila_integrante';

const LIMITE_AMBULANCIAS = 100;

interface PropiedadesFormularioTurno {
  /** `null` inicia un turno; un turno abre el cambio de tripulación. */
  turno: Turno | null;
  ambulanciaInicial?: string;
  alCambiarSinGuardar: (sinGuardar: boolean) => void;
  alTerminar: () => void;
  alCancelar: () => void;
}

export function FormularioTurno({
  turno,
  ambulanciaInicial,
  alCambiarSinGuardar,
  alTerminar,
  alCancelar,
}: PropiedadesFormularioTurno) {
  const inicio = useIniciarTurno();
  const cambio = useCambiarIntegrantes();
  const mutacion = turno ? cambio : inicio;
  const { notificar } = useNotificaciones();
  const conductores = usePersonal('conductor');
  const asistenciales = usePersonal('paramedico');
  const turnosActivos = useTurnosActivos();
  const ambulancias = useAmbulancias({ pagina: 1, limite: LIMITE_AMBULANCIAS });

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isDirty },
  } = useForm<DatosFormulario>({
    resolver: zodResolver(esquemaTurno),
    defaultValues: {
      ambulanciaId: turno?.ambulanciaId ?? ambulanciaInicial ?? '',
      integrantes: turno?.integrantes.map(({ funcion, usuarioId }) => ({ funcion, usuarioId })) ?? [
        { funcion: 'conductor', usuarioId: '' },
        { funcion: 'paramedico', usuarioId: '' },
      ],
    },
  });
  const filas = useFieldArray({ control, name: 'integrantes' });
  const integrantes = useWatch({ control, name: 'integrantes' });

  useEffect(() => alCambiarSinGuardar(isDirty), [isDirty, alCambiarSinGuardar]);

  const activos = turnosActivos.data?.datos ?? [];
  const ocupadas = personasOcupadas(activos, turno?.id);
  const ambulanciasConTurno = new Set(activos.map(({ ambulanciaId }) => ambulanciaId));
  const personalPorRol = { conductor: conductores.data ?? [], paramedico: asistenciales.data ?? [] };
  const errorPersonal = conductores.error ?? asistenciales.error;
  const cargandoPersonal = conductores.isPending || asistenciales.isPending;
  const bloqueado = mutacion.isPending || cargandoPersonal;

  const enviar = (datos: DatosFormulario) => {
    if (turno) {
      cambio.mutate(
        { id: turno.id, integrantes: datos.integrantes },
        {
          onSuccess: (actualizado) => {
            notificar({ tono: 'exito', titulo: 'Tripulación actualizada', descripcion: actualizado.ambulanciaCodigo ?? undefined });
            alTerminar();
          },
        },
      );
      return;
    }
    inicio.mutate(datos, {
      onSuccess: (iniciado) => {
        notificar({
          tono: 'exito',
          titulo: 'Turno iniciado',
          descripcion: `${iniciado.ambulanciaCodigo ?? 'La ambulancia'} ya tiene tripulación. Habilítala cuando esté lista.`,
        });
        alTerminar();
      },
    });
  };

  const errorTripulacion = errors.integrantes?.message ?? errors.integrantes?.root?.message;

  return (
    <form onSubmit={handleSubmit(enviar)} noValidate className="flex min-h-full flex-col">
      <div className="flex-1 space-y-8 px-6 py-6">
        {mutacion.error && <AlertaError error={mutacion.error} />}
        {errorPersonal && <AlertaError error={errorPersonal} />}

        {!turno && (
          <fieldset className="space-y-4">
            <legend className="mb-4 text-sm font-semibold text-texto">Ambulancia</legend>
            <CampoSelector
              id="ambulanciaId"
              etiqueta="Ambulancia"
              icono={Ambulance}
              disabled={bloqueado || !ambulancias.isSuccess}
              error={
                errors.ambulanciaId?.message ??
                (ambulancias.isError ? 'No fue posible cargar las ambulancias.' : undefined)
              }
              ayuda={ambulancias.isPending ? 'Cargando ambulancias…' : 'Las que ya tienen turno no se pueden elegir.'}
              {...register('ambulanciaId')}
            >
              <option value="" disabled>
                Selecciona la ambulancia
              </option>
              {ambulancias.data?.datos.map((ambulancia) => {
                const conTurno = ambulanciasConTurno.has(ambulancia.id);
                return (
                  <option key={ambulancia.id} value={ambulancia.id} disabled={conTurno}>
                    {ambulancia.codigo} · {formatearPlaca(ambulancia.placa)} · {ambulancia.tipo.nombre}
                    {conTurno ? ' — ya tiene turno' : ''}
                  </option>
                );
              })}
            </CampoSelector>
          </fieldset>
        )}

        <fieldset className="space-y-4">
          <legend className="mb-1 text-sm font-semibold text-texto">Tripulación</legend>
          <p className="text-[13px] text-texto-secundario">
            Un conductor y al menos un paramédico o médico, hasta {MAXIMO_INTEGRANTES} personas.
          </p>

          <ul className="space-y-3">
            {filas.fields.map((fila, indice) => {
              const funcion = integrantes[indice]?.funcion ?? fila.funcion;
              const elegidasEnOtras = new Set(
                integrantes.filter((_, otra) => otra !== indice).map(({ usuarioId }) => usuarioId),
              );
              return (
                <FilaIntegrante
                  key={fila.id}
                  indice={indice}
                  registroFuncion={register(`integrantes.${indice}.funcion`, {
                    // Si la nueva función exige otro rol, la persona elegida deja de ser válida.
                    onChange: (evento: { target: { value: string } }) => {
                      const nueva: RolTripulante = evento.target.value === 'conductor' ? 'conductor' : 'paramedico';
                      if (nueva !== ROL_POR_FUNCION[funcion]) setValue(`integrantes.${indice}.usuarioId`, '');
                    },
                  })}
                  registroPersona={register(`integrantes.${indice}.usuarioId`)}
                  opciones={opcionesPersona(personalPorRol[ROL_POR_FUNCION[funcion]], ocupadas, elegidasEnOtras)}
                  error={errors.integrantes?.[indice]?.usuarioId?.message}
                  deshabilitada={bloqueado}
                  alQuitar={filas.fields.length > MINIMO_INTEGRANTES ? () => filas.remove(indice) : undefined}
                />
              );
            })}
          </ul>

          {errorTripulacion && (
            <p role="alert" className="text-[13px] text-critico">
              {errorTripulacion}
            </p>
          )}

          {filas.fields.length < MAXIMO_INTEGRANTES && (
            <button
              type="button"
              onClick={() => filas.append({ funcion: 'paramedico', usuarioId: '' })}
              disabled={bloqueado}
              className="campo-vidrio inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-medium text-texto transition-colors duration-150 hover:bg-white disabled:opacity-60"
            >
              <UserPlus aria-hidden strokeWidth={1.75} className="size-4" />
              Agregar tripulante
            </button>
          )}
          {cargandoPersonal && <p className="text-[13px] text-texto-secundario">Cargando personal…</p>}
        </fieldset>

        {!turno && (
          <div className="flex items-start gap-3 rounded-xl bg-primario/5 px-4 py-3">
            <Info aria-hidden strokeWidth={1.75} className="mt-0.5 size-4 shrink-0 text-primario" />
            <p className="text-[13px] text-texto-secundario">
              Iniciar el turno no habilita la ambulancia: después cámbiale el estado a{' '}
              <span className="font-medium text-texto">disponible</span>.
            </p>
          </div>
        )}
      </div>

      <PieFormulario
        textoEnviar={turno ? 'Guardar tripulación' : 'Iniciar turno'}
        textoEnviando={turno ? 'Guardando…' : 'Iniciando…'}
        icono={turno ? Save : Play}
        enviando={mutacion.isPending}
        deshabilitado={cargandoPersonal || Boolean(errorPersonal) || (turno !== null && !isDirty)}
        alCancelar={alCancelar}
      />
    </form>
  );
}
