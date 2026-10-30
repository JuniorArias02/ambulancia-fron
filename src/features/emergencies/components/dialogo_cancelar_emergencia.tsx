import { zodResolver } from '@hookform/resolvers/zod';
import { Ban, TriangleAlert } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';
import { AlertaError } from '../../../components/feedback/alerta_error';
import { CampoMotivo } from '../../../components/forms/campo_motivo';
import { PieFormulario } from '../../../components/forms/pie_formulario';
import { Dialogo } from '../../../components/ui/dialogo';
import { useNotificaciones } from '../../../hooks/use_notificaciones';
import { useCancelarEmergencia } from '../hooks/use_mutaciones_emergencia';
import {
  esquemaCancelarEmergencia,
  LONGITUD_MAXIMA_MOTIVO,
  type FormularioCancelarEmergencia,
} from '../schemas/emergencia.schema';
import type { Emergencia } from '../types/emergencia.types';

interface PropiedadesDialogoCancelarEmergencia {
  emergencia: Emergencia;
  alCerrar: () => void;
}

export function DialogoCancelarEmergencia({ emergencia, alCerrar }: PropiedadesDialogoCancelarEmergencia) {
  const cancelacion = useCancelarEmergencia();
  const { notificar } = useNotificaciones();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormularioCancelarEmergencia>({
    resolver: zodResolver(esquemaCancelarEmergencia),
    defaultValues: { motivo: '' },
  });
  const longitudMotivo = useWatch({ control, name: 'motivo' }).length;
  // Tras un 409 o 422 la emergencia se recargó: puede que ya no se pueda cancelar.
  const yaNoCancelable = cancelacion.error?.estado === 422;

  const enviar = ({ motivo }: FormularioCancelarEmergencia) =>
    cancelacion.mutate(
      { id: emergencia.id, motivo },
      {
        onSuccess: (cancelada) => {
          notificar({ tono: 'exito', titulo: 'Emergencia cancelada', descripcion: cancelada.numeroEmergencia });
          alCerrar();
        },
      },
    );

  return (
    <Dialogo
      abierto
      titulo="Cancelar emergencia"
      descripcion={emergencia.numeroEmergencia}
      cerrable={!cancelacion.isPending}
      alCerrar={alCerrar}
    >
      <form onSubmit={handleSubmit(enviar)} noValidate>
        <div className="space-y-5 px-6 py-5">
          {cancelacion.error && <AlertaError error={cancelacion.error} />}

          <p className="flex items-start gap-2.5 rounded-xl border border-critico/20 bg-critico/6 px-4 py-3 text-[13px] text-texto">
            <TriangleAlert aria-hidden strokeWidth={1.75} className="mt-0.5 size-4 shrink-0 text-critico" />
            La emergencia dejará de estar activa y no se podrá despachar. Esta acción no se puede deshacer.
          </p>

          <CampoMotivo
            id="motivo"
            longitud={longitudMotivo}
            longitudMaxima={LONGITUD_MAXIMA_MOTIVO}
            disabled={cancelacion.isPending || yaNoCancelable}
            placeholder="Por ejemplo: el informante confirma que ya no necesita ambulancia"
            error={errors.motivo?.message}
            ayuda="Queda registrado en la auditoría."
            {...register('motivo')}
          />
        </div>

        <PieFormulario
          textoEnviar="Cancelar emergencia"
          textoEnviando="Cancelando…"
          icono={Ban}
          tono="peligro"
          enviando={cancelacion.isPending}
          deshabilitado={yaNoCancelable}
          alCancelar={alCerrar}
        />
      </form>
    </Dialogo>
  );
}
