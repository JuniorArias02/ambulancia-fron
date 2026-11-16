import { zodResolver } from '@hookform/resolvers/zod';
import { Ban, TriangleAlert } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { AlertaError } from '../../../components/feedback/alerta_error';
import { CampoMotivo } from '../../../components/forms/campo_motivo';
import { PieFormulario } from '../../../components/forms/pie_formulario';
import { Dialogo } from '../../../components/ui/dialogo';
import { useNotificaciones } from '../../../hooks/use_notificaciones';
import { LONGITUD_MAXIMA_MOTIVO_ANULACION } from '../constants/catalogos_clinicos';
import { useAnularHistoria } from '../hooks/use_historias';

const esquema = z.object({
  motivo: z
    .string()
    .trim()
    .min(5, 'Describe el motivo con al menos 5 caracteres.')
    .max(LONGITUD_MAXIMA_MOTIVO_ANULACION, `Máximo ${LONGITUD_MAXIMA_MOTIVO_ANULACION} caracteres.`),
});

type Formulario = z.infer<typeof esquema>;

interface PropiedadesDialogoAnularHistoria {
  historiaId: string;
  numeroHistoria: string;
  alCerrar: () => void;
}

/** La historia no se borra: queda anulada, con el motivo en la trazabilidad. */
export function DialogoAnularHistoria({ historiaId, numeroHistoria, alCerrar }: PropiedadesDialogoAnularHistoria) {
  const anulacion = useAnularHistoria(historiaId);
  const { notificar } = useNotificaciones();
  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = useForm<Formulario>({ resolver: zodResolver(esquema), defaultValues: { motivo: '' } });
  const longitud = useWatch({ control, name: 'motivo' }).length;

  const enviar = ({ motivo }: Formulario) =>
    anulacion.mutate(motivo, {
      onSuccess: () => {
        notificar({ tono: 'exito', titulo: 'Historia anulada', descripcion: numeroHistoria });
        alCerrar();
      },
      onError: (error) => {
        if (error.estado === 400) setError('motivo', { message: error.detalles.join(' ') || error.message });
      },
    });

  const errorGeneral = anulacion.error && anulacion.error.estado !== 400 ? anulacion.error : null;

  return (
    <Dialogo
      abierto
      titulo="Anular historia"
      descripcion={numeroHistoria}
      cerrable={!anulacion.isPending}
      alCerrar={alCerrar}
    >
      <form onSubmit={handleSubmit(enviar)} noValidate>
        <div className="space-y-5 px-6 py-5">
          {errorGeneral && <AlertaError error={errorGeneral} />}
          <p className="flex items-start gap-2.5 rounded-xl border border-advertencia/25 bg-advertencia/8 px-4 py-3 text-[13px] text-texto">
            <TriangleAlert aria-hidden strokeWidth={1.75} className="mt-0.5 size-4 shrink-0 text-advertencia" />
            La historia no se borra: queda marcada como anulada y el motivo se ve en la trazabilidad. No se puede
            deshacer.
          </p>
          <CampoMotivo
            id="motivo-anulacion"
            longitud={longitud}
            longitudMaxima={LONGITUD_MAXIMA_MOTIVO_ANULACION}
            placeholder="Por ejemplo: historia duplicada por error"
            disabled={anulacion.isPending}
            error={errors.motivo?.message}
            ayuda="Queda registrado en la auditoría."
            {...register('motivo')}
          />
        </div>
        <PieFormulario
          textoEnviar="Anular historia"
          textoEnviando="Anulando…"
          icono={Ban}
          tono="peligro"
          enviando={anulacion.isPending}
          alCancelar={alCerrar}
        />
      </form>
    </Dialogo>
  );
}
