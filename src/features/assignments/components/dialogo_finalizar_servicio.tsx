import { zodResolver } from '@hookform/resolvers/zod';
import { CircleCheck, Info } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';
import { AlertaError } from '../../../components/feedback/alerta_error';
import { CampoMotivo } from '../../../components/forms/campo_motivo';
import { PieFormulario } from '../../../components/forms/pie_formulario';
import { Dialogo } from '../../../components/ui/dialogo';
import { useNotificaciones } from '../../../hooks/use_notificaciones';
import { ESTADOS_CIERRE_CON_OBSERVACION } from '../constants/asignaciones';
import { useMarcarAvance } from '../hooks/use_mutaciones_asignacion';
import {
  esquemaFinalizarServicio,
  LONGITUD_MAXIMA_MOTIVO,
  type FormularioFinalizarServicio,
} from '../schemas/asignacion.schema';
import type { Asignacion } from '../types/asignacion.types';

interface PropiedadesDialogoFinalizarServicio {
  asignacion: Asignacion;
  alCerrar: () => void;
}

/**
 * Finalizar libera la ambulancia y puede cerrar la emergencia: se confirma antes. Con el paciente
 * a bordo es la entrega; desde la escena o la atención es un cierre sin traslado y pide el motivo.
 */
export function DialogoFinalizarServicio({ asignacion, alCerrar }: PropiedadesDialogoFinalizarServicio) {
  const avance = useMarcarAvance();
  const { notificar } = useNotificaciones();
  const ambulancia = asignacion.ambulanciaCodigo ?? 'La ambulancia';
  const sinTraslado = ESTADOS_CIERRE_CON_OBSERVACION.includes(asignacion.estado);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormularioFinalizarServicio>({
    resolver: zodResolver(esquemaFinalizarServicio(sinTraslado)),
    defaultValues: { observacion: '' },
  });
  const longitud = useWatch({ control, name: 'observacion' }).length;

  const enviar = ({ observacion }: FormularioFinalizarServicio) =>
    avance.mutate(
      { id: asignacion.id, estado: 'finalizada', observacion: observacion || undefined },
      {
        onSuccess: () => {
          notificar({
            tono: 'exito',
            titulo: sinTraslado ? 'Servicio cerrado sin traslado' : 'Paciente entregado',
            descripcion: `${ambulancia} vuelve a estar disponible.`,
          });
          alCerrar();
        },
      },
    );

  return (
    <Dialogo
      abierto
      titulo={sinTraslado ? 'Cerrar sin traslado' : 'Paciente entregado'}
      descripcion={`${ambulancia} · ${asignacion.numeroEmergencia ?? 'emergencia'}`}
      cerrable={!avance.isPending}
      alCerrar={alCerrar}
    >
      <form onSubmit={handleSubmit(enviar)} noValidate>
        <div className="space-y-4 px-6 py-5">
          {avance.error && <AlertaError error={avance.error} />}
          <p className="flex items-start gap-2.5 rounded-xl bg-primario/5 px-4 py-3 text-[13px] text-texto">
            <Info aria-hidden strokeWidth={1.75} className="mt-0.5 size-4 shrink-0 text-primario" />
            {sinTraslado
              ? 'El paciente no se traslada (atendido en el sitio, rechazo del traslado…). '
              : 'Se registra la entrega del paciente en el destino. '}
            La ambulancia vuelve a estar disponible y la emergencia se cierra si no le quedan otros servicios activos.
          </p>
          {sinTraslado && (
            <CampoMotivo
              id="observacion-cierre"
              etiqueta="Motivo del cierre"
              longitud={longitud}
              longitudMaxima={LONGITUD_MAXIMA_MOTIVO}
              disabled={avance.isPending}
              placeholder="Por ejemplo: atendido en el sitio, sin paciente en el lugar, rechaza el traslado"
              error={errors.observacion?.message}
              ayuda="Queda registrado en la bitácora del servicio."
              {...register('observacion')}
            />
          )}
        </div>
        <PieFormulario
          textoEnviar={sinTraslado ? 'Cerrar servicio' : 'Confirmar entrega'}
          textoEnviando="Finalizando…"
          icono={CircleCheck}
          enviando={avance.isPending}
          alCancelar={alCerrar}
        />
      </form>
    </Dialogo>
  );
}
