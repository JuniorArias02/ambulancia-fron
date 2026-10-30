import { zodResolver } from '@hookform/resolvers/zod';
import { Hash, Hospital, Layers, MapPin, Phone, Plus, Save } from 'lucide-react';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { AlertaError } from '../../../components/feedback/alerta_error';
import { CampoSelector } from '../../../components/forms/campo_selector';
import { CampoTexto } from '../../../components/forms/campo_texto';
import { PieFormulario } from '../../../components/forms/pie_formulario';
import { useNotificaciones } from '../../../hooks/use_notificaciones';
import { SelectorCoordenadas } from '../../map/components/selector_coordenadas';
import { ETIQUETAS_NIVEL, NIVELES_COMPLEJIDAD } from '../constants/instituciones';
import { useActualizarInstitucion, useCrearInstitucion } from '../hooks/use_instituciones';
import {
  esquemaInstitucion,
  type EntradaInstitucion,
  type FormularioInstitucion as DatosFormulario,
} from '../schemas/institucion.schema';
import type { InstitucionSalud } from '../types/institucion.types';
import { construirCambiosInstitucion, construirDatosCreacion, valoresFormulario } from '../utils/cambios_institucion';

interface PropiedadesFormularioInstitucion {
  /** `null` registra una institución nueva. */
  institucion: InstitucionSalud | null;
  alCambiarSinGuardar: (sinGuardar: boolean) => void;
  alTerminar: () => void;
  alCancelar: () => void;
}

export function FormularioInstitucion({
  institucion,
  alCambiarSinGuardar,
  alTerminar,
  alCancelar,
}: PropiedadesFormularioInstitucion) {
  const creacion = useCrearInstitucion();
  const actualizacion = useActualizarInstitucion();
  const mutacion = institucion ? actualizacion : creacion;
  const { notificar } = useNotificaciones();
  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    formState: { errors, isDirty },
  } = useForm<EntradaInstitucion, unknown, DatosFormulario>({
    resolver: zodResolver(esquemaInstitucion),
    defaultValues: valoresFormulario(institucion),
  });
  const latitud = useWatch({ control, name: 'latitud' });
  const longitud = useWatch({ control, name: 'longitud' });

  useEffect(() => alCambiarSinGuardar(isDirty), [isDirty, alCambiarSinGuardar]);

  // El código de habilitación es único: el 409 se muestra en su campo.
  const mostrarDuplicado = (error: { estado: number | null; message: string }) => {
    if (error.estado === 409) setError('codigoHabilitacion', { message: error.message });
  };

  const enviar = (datos: DatosFormulario) => {
    if (!institucion) {
      creacion.mutate(construirDatosCreacion(datos), {
        onSuccess: (creada) => {
          notificar({ tono: 'exito', titulo: 'Institución registrada', descripcion: creada.nombre });
          alTerminar();
        },
        onError: mostrarDuplicado,
      });
      return;
    }
    const cambios = construirCambiosInstitucion(institucion, datos);
    if (Object.keys(cambios).length === 0) {
      alTerminar();
      return;
    }
    actualizacion.mutate(
      { id: institucion.id, datos: cambios },
      {
        onSuccess: (actualizada) => {
          notificar({ tono: 'exito', titulo: 'Datos actualizados', descripcion: actualizada.nombre });
          alTerminar();
        },
        onError: mostrarDuplicado,
      },
    );
  };

  const errorGeneral = mutacion.error && mutacion.error.estado !== 409 ? mutacion.error : null;
  const bloqueado = mutacion.isPending;

  return (
    <form onSubmit={handleSubmit(enviar)} noValidate className="flex min-h-full flex-col">
      <div className="flex-1 space-y-8 px-6 py-6">
        {errorGeneral && <AlertaError error={errorGeneral} />}

        <fieldset className="space-y-5">
          <legend className="mb-4 text-sm font-semibold text-texto">Institución</legend>
          <CampoTexto
            id="nombre"
            etiqueta="Nombre"
            icono={Hospital}
            autoComplete="off"
            maxLength={180}
            disabled={bloqueado}
            error={errors.nombre?.message}
            {...register('nombre')}
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <CampoTexto
              id="codigoHabilitacion"
              etiqueta="Código de habilitación"
              icono={Hash}
              autoComplete="off"
              maxLength={50}
              obligatorio={false}
              disabled={bloqueado}
              error={errors.codigoHabilitacion?.message}
              ayuda="Código REPS. Único."
              {...register('codigoHabilitacion')}
            />
            <CampoSelector
              id="nivelComplejidad"
              etiqueta="Nivel de complejidad"
              icono={Layers}
              obligatorio={false}
              disabled={bloqueado}
              error={errors.nivelComplejidad?.message}
              {...register('nivelComplejidad')}
            >
              <option value="">Sin definir</option>
              {NIVELES_COMPLEJIDAD.map((nivel) => (
                <option key={nivel} value={nivel}>
                  {ETIQUETAS_NIVEL[nivel]}
                </option>
              ))}
            </CampoSelector>
          </div>
          <CampoTexto
            id="telefono"
            etiqueta="Teléfono"
            icono={Phone}
            type="tel"
            inputMode="tel"
            placeholder="+57 607 000 0000"
            obligatorio={false}
            disabled={bloqueado}
            error={errors.telefono?.message}
            {...register('telefono')}
          />
        </fieldset>

        <fieldset className="space-y-5">
          <legend className="mb-4 text-sm font-semibold text-texto">Ubicación</legend>
          <CampoTexto
            id="direccion"
            etiqueta="Dirección"
            icono={MapPin}
            autoComplete="off"
            maxLength={255}
            obligatorio={false}
            disabled={bloqueado}
            error={errors.direccion?.message}
            {...register('direccion')}
          />
          <SelectorCoordenadas
            latitud={latitud}
            longitud={longitud}
            registroLatitud={register('latitud', { deps: ['longitud'] })}
            registroLongitud={register('longitud', { deps: ['latitud'] })}
            alCambiar={(lat, lng) => {
              setValue('latitud', lat, { shouldDirty: true });
              setValue('longitud', lng, { shouldDirty: true });
            }}
            errorLatitud={errors.latitud?.message}
            errorLongitud={errors.longitud?.message}
            deshabilitado={bloqueado}
            etiquetaMapa="Mapa para ubicar la institución"
          />
          {institucion && (
            <p className="text-[13px] text-texto-secundario">Los campos que dejes vacíos se borrarán.</p>
          )}
        </fieldset>
      </div>

      <PieFormulario
        textoEnviar={institucion ? 'Guardar cambios' : 'Registrar institución'}
        textoEnviando={institucion ? 'Guardando…' : 'Registrando…'}
        icono={institucion ? Save : Plus}
        enviando={mutacion.isPending}
        deshabilitado={institucion !== null && !isDirty}
        alCancelar={alCancelar}
      />
    </form>
  );
}
