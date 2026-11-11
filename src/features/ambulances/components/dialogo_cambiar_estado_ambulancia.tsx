import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeftRight, ArrowRight, Info, RotateCw } from 'lucide-react';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { AlertaError } from '../../../components/feedback/alerta_error';
import { CampoMotivo } from '../../../components/forms/campo_motivo';
import { PieFormulario } from '../../../components/forms/pie_formulario';
import { Dialogo } from '../../../components/ui/dialogo';
import { useNotificaciones } from '../../../hooks/use_notificaciones';
import { ETIQUETAS_ESTADO_OPERATIVO, TRANSICIONES } from '../constants/estados_operativos';
import { useAmbulancia } from '../hooks/use_ambulancias';
import { useCambiarEstadoAmbulancia } from '../hooks/use_mutaciones_ambulancia';
import {
  esquemaCambioEstadoAmbulancia,
  LONGITUD_MAXIMA_MOTIVO,
  type EntradaCambioEstadoAmbulancia,
  type FormularioCambioEstadoAmbulancia,
} from '../schemas/ambulancia.schema';
import type { Ambulancia, EstadoManual } from '../types/ambulancia.types';
import { formatearPlaca } from '../utils/formato_ambulancia';
import { ESTILOS_ESTADO_OPERATIVO } from '../constants/estilos_estado_operativo';
import { InsigniaEstadoOperativo } from './insignia_estado_operativo';

const DESCRIPCIONES_DESTINO: Record<EstadoManual, string> = {
  disponible: 'Queda lista para despacho. Exige tripulación completa.',
  fuera_servicio: 'Deja de estar disponible para despacho.',
  mantenimiento: 'Deja de estar disponible mientras se revisa o repara.',
};

interface PropiedadesDialogoCambiarEstadoAmbulancia {
  ambulancia: Ambulancia;
  alCerrar: () => void;
}

export function DialogoCambiarEstadoAmbulancia({
  ambulancia: conocida,
  alCerrar,
}: PropiedadesDialogoCambiarEstadoAmbulancia) {
  // Se lee de la caché para reflejar el estado real si otro usuario lo cambió.
  const consulta = useAmbulancia(conocida.id, conocida);
  const ambulancia = consulta.data ?? conocida;
  const cambio = useCambiarEstadoAmbulancia();
  const { notificar } = useNotificaciones();
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<EntradaCambioEstadoAmbulancia, unknown, FormularioCambioEstadoAmbulancia>({
    resolver: zodResolver(esquemaCambioEstadoAmbulancia),
    defaultValues: { estado: '', motivo: '' },
  });

  const opciones = TRANSICIONES[ambulancia.estadoOperativo];
  const estadoElegido = useWatch({ control, name: 'estado' });
  const longitudMotivo = useWatch({ control, name: 'motivo' }).length;
  // Otro usuario la cambió al mismo tiempo. Un `422` (p. ej. sin tripulación completa) es un error normal.
  const conflicto = cambio.error?.estado === 409;

  // Si el estado cambió mientras tanto, la opción elegida puede haber dejado de ser válida.
  useEffect(() => {
    if (estadoElegido && !opciones.some((opcion) => opcion === estadoElegido)) {
      setValue('estado', '');
    }
  }, [opciones, estadoElegido, setValue]);

  const enviar = (datos: FormularioCambioEstadoAmbulancia) =>
    cambio.mutate(
      { id: ambulancia.id, datos },
      {
        onSuccess: (actualizada) => {
          notificar({
            tono: 'exito',
            titulo: 'Estado actualizado',
            descripcion: `${actualizada.codigo} ahora está ${ETIQUETAS_ESTADO_OPERATIVO[
              actualizada.estadoOperativo
            ].toLowerCase()}.`,
          });
          alCerrar();
        },
        onError: (error) => {
          if (error.estado === 404) {
            notificar({ tono: 'error', titulo: 'La ambulancia ya no existe', descripcion: error.message });
            alCerrar();
          }
        },
      },
    );

  return (
    <Dialogo
      abierto
      titulo="Cambiar estado"
      descripcion={`${ambulancia.codigo} · ${formatearPlaca(ambulancia.placa)}`}
      cerrable={!cambio.isPending}
      alCerrar={alCerrar}
    >
      <form onSubmit={handleSubmit(enviar)} noValidate>
        <div className="space-y-5 px-6 py-5">
          {cambio.error &&
            (conflicto ? (
              <div
                role="alert"
                className="flex gap-3 rounded-xl border border-advertencia/25 bg-advertencia/8 px-4 py-3 text-sm text-texto"
              >
                <RotateCw aria-hidden strokeWidth={1.75} className="mt-0.5 size-4 shrink-0 text-advertencia" />
                <div className="min-w-0">
                  <p>{cambio.error.message}</p>
                  <p className="mt-0.5 text-[13px] text-texto-secundario">
                    {consulta.isFetching
                      ? 'Consultando su estado actual…'
                      : 'Se muestra su estado actual. Revisa y vuelve a intentarlo.'}
                  </p>
                </div>
              </div>
            ) : (
              cambio.error.estado !== 404 && <AlertaError error={cambio.error} />
            ))}

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[13px] text-texto-secundario">Estado actual</span>
            <InsigniaEstadoOperativo estado={ambulancia.estadoOperativo} />
            {estadoElegido && (
              <>
                <ArrowRight aria-label="pasa a" strokeWidth={1.75} className="size-4 text-texto-secundario" />
                <InsigniaEstadoOperativo estado={estadoElegido} />
              </>
            )}
          </div>

          {opciones.length === 0 ? (
            <p className="flex items-start gap-2.5 rounded-xl bg-primario/5 px-4 py-3 text-[13px] text-texto">
              <Info aria-hidden strokeWidth={1.75} className="mt-0.5 size-4 shrink-0 text-primario" />
              La ambulancia está en servicio. Su estado lo actualiza el sistema al terminar la atención.
            </p>
          ) : (
            <>
              <fieldset disabled={cambio.isPending} className="space-y-2">
                <legend className="mb-2 flex items-center gap-1 text-sm font-medium text-texto">
                  Nuevo estado
                  <span aria-hidden className="text-critico">*</span>
                </legend>
                <div className="grid gap-2">
                  {opciones.map((estado) => {
                    const { icono: Icono, color } = ESTILOS_ESTADO_OPERATIVO[estado];
                    const seleccionado = estado === estadoElegido;
                    return (
                      <label
                        key={estado}
                        className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 transition-colors duration-150 has-focus-visible:ring-2 has-focus-visible:ring-primario/40 ${
                          seleccionado
                            ? 'border-primario/40 bg-primario/6'
                            : 'border-borde/80 bg-white/50 hover:bg-white'
                        }`}
                      >
                        <input
                          type="radio"
                          value={estado}
                          className="sr-only"
                          aria-describedby={errors.estado ? 'error-estado' : undefined}
                          {...register('estado')}
                        />
                        <Icono aria-hidden strokeWidth={1.75} className={`mt-0.5 size-[18px] shrink-0 ${color}`} />
                        <span className="min-w-0">
                          <span className="block text-sm font-medium text-texto">
                            {ETIQUETAS_ESTADO_OPERATIVO[estado]}
                          </span>
                          <span className="mt-0.5 block text-[13px] text-texto-secundario">
                            {DESCRIPCIONES_DESTINO[estado]}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
                {errors.estado && (
                  <p id="error-estado" className="text-[13px] text-critico">
                    {errors.estado.message}
                  </p>
                )}
              </fieldset>

              <CampoMotivo
                id="motivo"
                longitud={longitudMotivo}
                longitudMaxima={LONGITUD_MAXIMA_MOTIVO}
                disabled={cambio.isPending}
                placeholder="Por ejemplo: revisión de frenos, regreso del taller…"
                error={errors.motivo?.message}
                ayuda="Queda registrado en el historial de la ambulancia."
                {...register('motivo')}
              />
            </>
          )}
        </div>

        <PieFormulario
          textoEnviar="Cambiar estado"
          textoEnviando="Guardando…"
          icono={ArrowLeftRight}
          enviando={cambio.isPending}
          deshabilitado={opciones.length === 0 || consulta.isFetching}
          alCancelar={alCerrar}
        />
      </form>
    </Dialogo>
  );
}
