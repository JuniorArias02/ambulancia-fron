import { zodResolver } from '@hookform/resolvers/zod';
import { Ban, Info } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';
import { AlertaError } from '../../../components/feedback/alerta_error';
import { CampoMotivo } from '../../../components/forms/campo_motivo';
import { PieFormulario } from '../../../components/forms/pie_formulario';
import { Dialogo } from '../../../components/ui/dialogo';
import { useNotificaciones } from '../../../hooks/use_notificaciones';
import { useCancelarAsignacion } from '../hooks/use_mutaciones_asignacion';
import {
  esquemaCancelarAsignacion,
  LONGITUD_MAXIMA_MOTIVO,
  type FormularioCancelarAsignacion as FormularioCancelar,
} from '../schemas/asignacion.schema';
import type { Asignacion } from '../types/asignacion.types';

interface PropiedadesDialogoCancelarAsignacion {
  asignacion: Asignacion;
  alCerrar: () => void;
}

export function DialogoCancelarAsignacion({ asignacion, alCerrar }: PropiedadesDialogoCancelarAsignacion) {
  const cancelacion = useCancelarAsignacion();
  const { notificar } = useNotificaciones();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormularioCancelar>({ resolver: zodResolver(esquemaCancelarAsignacion), defaultValues: { motivo: '' } });
  const longitudMotivo = useWatch({ control, name: 'motivo' }).length;
  const ambulancia = asignacion.ambulanciaCodigo ?? 'La ambulancia';

  const enviar = ({ motivo }: FormularioCancelar) =>
    cancelacion.mutate(
      { id: asignacion.id, motivo },
      {
        onSuccess: () => {
          notificar({ tono: 'exito', titulo: 'Despacho cancelado', descripcion: `${ambulancia} vuelve a estar disponible.` });
          alCerrar();
        },
      },
    );

  return (
    <Dialogo
      abierto
      titulo="Cancelar despacho"
      descripcion={`${ambulancia} → ${asignacion.numeroEmergencia ?? 'emergencia'}`}
      cerrable={!cancelacion.isPending}
      alCerrar={alCerrar}
    >
      <form onSubmit={handleSubmit(enviar)} noValidate>
        <div className="space-y-5 px-6 py-5">
          {cancelacion.error && <AlertaError error={cancelacion.error} />}
          <p className="flex items-start gap-2.5 rounded-xl bg-primario/5 px-4 py-3 text-[13px] text-texto">
            <Info aria-hidden strokeWidth={1.75} className="mt-0.5 size-4 shrink-0 text-primario" />
            La ambulancia vuelve a estar disponible. Si era el único servicio de la emergencia, esta queda otra vez
            recibida para despachar otra ambulancia.
          </p>
          <CampoMotivo
            id="motivo-cancelacion"
            longitud={longitudMotivo}
            longitudMaxima={LONGITUD_MAXIMA_MOTIVO}
            disabled={cancelacion.isPending}
            placeholder="Por ejemplo: se envía otra ambulancia más cercana"
            error={errors.motivo?.message}
            ayuda="Queda registrado en el servicio."
            {...register('motivo')}
          />
        </div>
        <PieFormulario
          textoEnviar="Cancelar despacho"
          textoEnviando="Cancelando…"
          icono={Ban}
          tono="peligro"
          enviando={cancelacion.isPending}
          alCancelar={alCerrar}
        />
      </form>
    </Dialogo>
  );
}
