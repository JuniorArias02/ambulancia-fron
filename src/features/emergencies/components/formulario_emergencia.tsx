import { zodResolver } from '@hookform/resolvers/zod';
import { Phone, Radio, Save, Siren, Tag, TriangleAlert, UserRound, UsersRound } from 'lucide-react';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { AlertaError } from '../../../components/feedback/alerta_error';
import { CampoMotivo } from '../../../components/forms/campo_motivo';
import { CampoSelector } from '../../../components/forms/campo_selector';
import { CampoTexto } from '../../../components/forms/campo_texto';
import { PieFormulario } from '../../../components/forms/pie_formulario';
import { useNotificaciones } from '../../../hooks/use_notificaciones';
import {
  esActiva,
  ETIQUETAS_FUENTE,
  ETIQUETAS_TIPO_INCIDENTE,
  FUENTES,
  TIPOS_INCIDENTE,
} from '../constants/catalogos_emergencia';
import { ESTILO_SIN_PRIORIDAD, ESTILOS_PRIORIDAD } from '../constants/estilos_emergencia';
import { useActualizarEmergencia, useCrearEmergencia } from '../hooks/use_mutaciones_emergencia';
import {
  esquemaEmergencia,
  LONGITUD_MAXIMA_DESCRIPCION,
  type EntradaEmergencia,
  type FormularioEmergencia as DatosFormulario,
} from '../schemas/emergencia.schema';
import type { Emergencia } from '../types/emergencia.types';
import {
  construirCambiosEmergencia,
  construirDatosCreacion,
  valoresFormulario,
} from '../utils/cambios_emergencia';
import { SeccionUbicacion } from './seccion_ubicacion';
import { SelectorPrioridad } from './selector_prioridad';

export interface PropiedadesFormularioEmergencia {
  /** `null` registra una emergencia nueva. */
  emergencia: Emergencia | null;
  alCambiarSinGuardar: (sinGuardar: boolean) => void;
  alTerminar: (emergencia: Emergencia) => void;
  alCancelar: () => void;
}

export function FormularioEmergencia({
  emergencia,
  alCambiarSinGuardar,
  alTerminar,
  alCancelar,
}: PropiedadesFormularioEmergencia) {
  const creacion = useCrearEmergencia();
  const actualizacion = useActualizarEmergencia();
  const mutacion = emergencia ? actualizacion : creacion;
  const { notificar } = useNotificaciones();
  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    trigger,
    formState: { errors, isDirty, isSubmitted },
  } = useForm<EntradaEmergencia, unknown, DatosFormulario>({
    resolver: zodResolver(esquemaEmergencia),
    defaultValues: valoresFormulario(emergencia),
  });

  useEffect(() => alCambiarSinGuardar(isDirty), [isDirty, alCambiarSinGuardar]);

  const inactiva = emergencia !== null && !esActiva(emergencia.estado);
  const bloqueado = mutacion.isPending || inactiva;
  const prioridad = useWatch({ control, name: 'prioridad' });
  const longitudDescripcion = useWatch({ control, name: 'descripcion' }).length;
  const colorMarcador = (prioridad ? ESTILOS_PRIORIDAD[prioridad] : ESTILO_SIN_PRIORIDAD).colorMapa;

  const enviar = (datos: DatosFormulario) => {
    if (!emergencia) {
      creacion.mutate(construirDatosCreacion(datos), {
        onSuccess: (creada) => {
          notificar({ tono: 'exito', titulo: 'Emergencia registrada', descripcion: creada.numeroEmergencia });
          alTerminar(creada);
        },
      });
      return;
    }

    const cambios = construirCambiosEmergencia(emergencia, datos);
    if (Object.keys(cambios).length === 0) {
      alTerminar(emergencia);
      return;
    }
    actualizacion.mutate(
      { id: emergencia.id, datos: cambios },
      {
        onSuccess: (actualizada) => {
          notificar({ tono: 'exito', titulo: 'Datos corregidos', descripcion: actualizada.numeroEmergencia });
          alTerminar(actualizada);
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit(enviar)} noValidate className="flex min-h-full flex-col">
      <div className="flex-1 space-y-8 px-6 py-6">
        {mutacion.error && <AlertaError error={mutacion.error} />}
        {mutacion.error?.estado === 409 && (
          <p className="text-[13px] text-texto-secundario">
            Se cargó la versión más reciente. Revisa tus cambios y guarda de nuevo.
          </p>
        )}

        {inactiva && (
          <p className="flex items-start gap-2.5 rounded-xl border border-advertencia/25 bg-advertencia/8 px-4 py-3 text-[13px] text-texto">
            <TriangleAlert aria-hidden strokeWidth={1.75} className="mt-0.5 size-4 shrink-0 text-advertencia" />
            La emergencia ya no está activa y no se puede corregir.
          </p>
        )}

        <fieldset className="space-y-5">
          <legend className="mb-4 text-sm font-semibold text-texto">Reporte</legend>
          <div className="grid gap-5 sm:grid-cols-2">
            <CampoSelector
              id="fuente"
              etiqueta="Fuente"
              icono={Radio}
              disabled={bloqueado}
              error={errors.fuente?.message}
              {...register('fuente')}
            >
              <option value="" disabled>
                Selecciona la fuente
              </option>
              {FUENTES.map((fuente) => (
                <option key={fuente} value={fuente}>
                  {ETIQUETAS_FUENTE[fuente]}
                </option>
              ))}
            </CampoSelector>
            <CampoSelector
              id="tipoIncidente"
              etiqueta="Tipo de incidente"
              icono={Tag}
              obligatorio={false}
              disabled={bloqueado}
              error={errors.tipoIncidente?.message}
              {...register('tipoIncidente')}
            >
              <option value="">Sin definir</option>
              {TIPOS_INCIDENTE.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {ETIQUETAS_TIPO_INCIDENTE[tipo]}
                </option>
              ))}
            </CampoSelector>
          </div>

          <fieldset disabled={bloqueado}>
            <SelectorPrioridad valor={prioridad} registro={register('prioridad')} />
          </fieldset>

          <CampoMotivo
            id="descripcion"
            etiqueta="Descripción"
            rows={4}
            longitud={longitudDescripcion}
            longitudMaxima={LONGITUD_MAXIMA_DESCRIPCION}
            placeholder="Qué ocurrió, estado de los pacientes y cualquier dato útil para la tripulación"
            disabled={bloqueado}
            error={errors.descripcion?.message}
            ayuda="Mínimo 5 caracteres."
            {...register('descripcion')}
          />
        </fieldset>

        <SeccionUbicacion
          register={register}
          control={control}
          setValue={setValue}
          getValues={getValues}
          trigger={trigger}
          errors={errors}
          revalidar={isSubmitted}
          deshabilitada={bloqueado}
          colorMarcador={colorMarcador}
        />

        <fieldset className="space-y-5">
          <legend className="mb-4 text-sm font-semibold text-texto">Informante y víctimas</legend>
          <div className="grid gap-5 sm:grid-cols-2">
            <CampoTexto
              id="informanteNombre"
              etiqueta="Nombre del informante"
              icono={UserRound}
              autoComplete="off"
              maxLength={150}
              obligatorio={false}
              disabled={bloqueado}
              error={errors.informanteNombre?.message}
              {...register('informanteNombre')}
            />
            <CampoTexto
              id="informanteTelefono"
              etiqueta="Teléfono del informante"
              icono={Phone}
              type="tel"
              inputMode="tel"
              autoComplete="off"
              placeholder="+57 300 123 4567"
              obligatorio={false}
              disabled={bloqueado}
              error={errors.informanteTelefono?.message}
              {...register('informanteTelefono')}
            />
          </div>
          <div className="sm:w-1/2 sm:pr-2.5">
            <CampoTexto
              id="numeroVictimas"
              etiqueta="Número de víctimas"
              icono={UsersRound}
              inputMode="numeric"
              autoComplete="off"
              maxLength={3}
              obligatorio={false}
              disabled={bloqueado}
              error={errors.numeroVictimas?.message}
              ayuda={emergencia ? 'Déjalo vacío si no se conoce.' : 'Opcional.'}
              {...register('numeroVictimas')}
            />
          </div>
          {emergencia && (
            <p className="text-[13px] text-texto-secundario">
              Los campos que dejes vacíos se borrarán de la emergencia.
            </p>
          )}
        </fieldset>
      </div>

      <PieFormulario
        textoEnviar={emergencia ? 'Guardar cambios' : 'Registrar emergencia'}
        textoEnviando={emergencia ? 'Guardando…' : 'Registrando…'}
        icono={emergencia ? Save : Siren}
        enviando={mutacion.isPending}
        deshabilitado={inactiva || (emergencia !== null && !isDirty)}
        alCancelar={alCancelar}
      />
    </form>
  );
}
