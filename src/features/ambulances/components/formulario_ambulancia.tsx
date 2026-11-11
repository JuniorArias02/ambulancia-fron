import { zodResolver } from '@hookform/resolvers/zod';
import { Hash, Info, Plus, RectangleHorizontal, Save, Tag, TriangleAlert } from 'lucide-react';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { AlertaError } from '../../../components/feedback/alerta_error';
import { CampoSelector } from '../../../components/forms/campo_selector';
import { CampoTexto } from '../../../components/forms/campo_texto';
import { PieFormulario } from '../../../components/forms/pie_formulario';
import { useNotificaciones } from '../../../hooks/use_notificaciones';
import type { ErrorApi } from '../../../services/error_api';
import { useActualizarAmbulancia, useCrearAmbulancia } from '../hooks/use_mutaciones_ambulancia';
import { useTiposAmbulancia } from '../hooks/use_tipos_ambulancia';
import {
  esquemaAmbulancia,
  type EntradaAmbulancia,
  type FormularioAmbulancia as DatosFormulario,
} from '../schemas/ambulancia.schema';
import type { Ambulancia } from '../types/ambulancia.types';
import { campoDuplicado, construirCambiosAmbulancia } from '../utils/cambios_ambulancia';
import { formatearPlaca, textoTipoAmbulancia } from '../utils/formato_ambulancia';

interface PropiedadesFormularioAmbulancia {
  /** `null` registra una ambulancia nueva. */
  ambulancia: Ambulancia | null;
  alCambiarSinGuardar: (sinGuardar: boolean) => void;
  alTerminar: () => void;
  alCancelar: () => void;
}

export function FormularioAmbulancia({
  ambulancia,
  alCambiarSinGuardar,
  alTerminar,
  alCancelar,
}: PropiedadesFormularioAmbulancia) {
  const tipos = useTiposAmbulancia();
  const creacion = useCrearAmbulancia();
  const actualizacion = useActualizarAmbulancia();
  const mutacion = ambulancia ? actualizacion : creacion;
  const { notificar } = useNotificaciones();
  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isDirty },
  } = useForm<EntradaAmbulancia, unknown, DatosFormulario>({
    resolver: zodResolver(esquemaAmbulancia),
    defaultValues: {
      codigo: ambulancia?.codigo ?? '',
      placa: ambulancia ? formatearPlaca(ambulancia.placa) : '',
      tipoAmbulanciaId: ambulancia?.tipo.id ?? '',
    },
  });

  useEffect(() => alCambiarSinGuardar(isDirty), [isDirty, alCambiarSinGuardar]);

  const enServicio = ambulancia?.estadoOperativo === 'en_servicio';
  const bloqueado = mutacion.isPending || enServicio;
  const tipoSeleccionado = useWatch({ control, name: 'tipoAmbulanciaId' });
  const descripcionTipo = tipos.data?.find((tipo) => tipo.id === tipoSeleccionado)?.descripcion;

  const mostrarErrorEnCampo = (error: ErrorApi) => {
    if (error.estado === 409) {
      setError(campoDuplicado(error.message), { message: error.message });
    } else if (error.estado === 422 && /tipo/i.test(error.message)) {
      setError('tipoAmbulanciaId', { message: error.message });
      void tipos.refetch();
    }
  };

  const enviar = (datos: DatosFormulario) => {
    if (!ambulancia) {
      creacion.mutate(datos, {
        onSuccess: (creada) => {
          notificar({
            tono: 'exito',
            titulo: 'Ambulancia registrada',
            descripcion: `${creada.codigo} queda fuera de servicio hasta tener tripulación completa.`,
          });
          alTerminar();
        },
        onError: mostrarErrorEnCampo,
      });
      return;
    }

    const cambios = construirCambiosAmbulancia(ambulancia, datos);
    if (Object.keys(cambios).length === 0) {
      alTerminar();
      return;
    }
    actualizacion.mutate(
      { id: ambulancia.id, datos: cambios },
      {
        onSuccess: (actualizada) => {
          notificar({ tono: 'exito', titulo: 'Datos actualizados', descripcion: actualizada.codigo });
          alTerminar();
        },
        onError: mostrarErrorEnCampo,
      },
    );
  };

  const error = mutacion.error;
  const errorEnCampo =
    error && (error.estado === 409 || (error.estado === 422 && /tipo/i.test(error.message)));
  const errorGeneral = error && !errorEnCampo ? error : null;

  return (
    <form onSubmit={handleSubmit(enviar)} noValidate className="flex min-h-full flex-col">
      <div className="flex-1 space-y-8 px-6 py-6">
        {errorGeneral && <AlertaError error={errorGeneral} />}

        {enServicio && (
          <p className="flex items-start gap-2.5 rounded-xl border border-advertencia/25 bg-advertencia/8 px-4 py-3 text-[13px] text-texto">
            <TriangleAlert aria-hidden strokeWidth={1.75} className="mt-0.5 size-4 shrink-0 text-advertencia" />
            La ambulancia está en servicio. Podrás editarla cuando termine la atención.
          </p>
        )}

        <fieldset className="space-y-5">
          <legend className="mb-4 text-sm font-semibold text-texto">Identificación</legend>
          <div className="grid gap-5 sm:grid-cols-2">
            <CampoTexto
              id="codigo"
              etiqueta="Código interno"
              icono={Hash}
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              placeholder="AMB-01"
              maxLength={30}
              disabled={bloqueado}
              error={errors.codigo?.message}
              ayuda="Letras, números y guiones. Se guarda en mayúsculas."
              {...register('codigo')}
            />
            <CampoTexto
              id="placa"
              etiqueta="Placa"
              icono={RectangleHorizontal}
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              placeholder="ABC 123"
              maxLength={7}
              disabled={bloqueado}
              error={errors.placa?.message}
              ayuda="3 letras y 3 números."
              {...register('placa')}
            />
          </div>
        </fieldset>

        <fieldset className="space-y-5">
          <legend className="mb-4 text-sm font-semibold text-texto">Clasificación</legend>
          <CampoSelector
            id="tipoAmbulanciaId"
            etiqueta="Tipo de ambulancia"
            icono={Tag}
            disabled={bloqueado || !tipos.isSuccess}
            error={
              errors.tipoAmbulanciaId?.message ??
              (tipos.isError ? 'No fue posible cargar los tipos. Cierra e inténtalo de nuevo.' : undefined)
            }
            ayuda={tipos.isPending ? 'Cargando tipos…' : (descripcionTipo ?? undefined)}
            {...register('tipoAmbulanciaId')}
          >
            <option value="" disabled>
              Selecciona un tipo
            </option>
            {tipos.data?.map((tipo) => (
              <option key={tipo.id} value={tipo.id}>
                {textoTipoAmbulancia(tipo)}
              </option>
            ))}
          </CampoSelector>
        </fieldset>

        {!ambulancia && (
          <div className="flex items-start gap-3 rounded-xl bg-primario/5 px-4 py-3">
            <Info aria-hidden strokeWidth={1.75} className="mt-0.5 size-4 shrink-0 text-primario" />
            <p className="text-[13px] text-texto-secundario">
              Toda ambulancia nueva queda <span className="font-medium text-texto">fuera de servicio</span>.
              Pasa a disponible sola cuando el conductor y el paramédico la seleccionan desde la app.
            </p>
          </div>
        )}
      </div>

      <PieFormulario
        textoEnviar={ambulancia ? 'Guardar cambios' : 'Registrar ambulancia'}
        textoEnviando={ambulancia ? 'Guardando…' : 'Registrando…'}
        icono={ambulancia ? Save : Plus}
        enviando={mutacion.isPending}
        deshabilitado={enServicio || (ambulancia !== null && !isDirty)}
        alCancelar={alCancelar}
      />
    </form>
  );
}
