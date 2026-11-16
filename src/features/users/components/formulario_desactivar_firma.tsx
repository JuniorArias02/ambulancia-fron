import { zodResolver } from '@hookform/resolvers/zod';
import { Ban, LoaderCircle, TriangleAlert } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';
import { CampoMotivo } from '../../../components/forms/campo_motivo';
import { useNotificaciones } from '../../../hooks/use_notificaciones';
import { LONGITUD_MAXIMA_MOTIVO_FIRMA } from '../constants/firmas';
import { useDesactivarFirma } from '../hooks/use_firmas';
import { esquemaDesactivarFirma, type FormularioDesactivarFirma as DatosFormulario } from '../schemas/usuario.schema';
import type { FirmaUsuario } from '../types/firma.types';

interface PropiedadesFormularioDesactivarFirma {
  firma: FirmaUsuario;
  nombreCompleto: string;
  alTerminar: () => void;
  alCancelar: () => void;
  /** Avisa si hay un envío en curso, para no cerrar el panel a mitad. */
  alCambiarEnvio: (enviando: boolean) => void;
}

export function FormularioDesactivarFirma({
  firma,
  nombreCompleto,
  alTerminar,
  alCancelar,
  alCambiarEnvio,
}: PropiedadesFormularioDesactivarFirma) {
  const desactivacion = useDesactivarFirma(firma.usuarioId);
  const { notificar } = useNotificaciones();
  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = useForm<DatosFormulario>({
    resolver: zodResolver(esquemaDesactivarFirma),
    defaultValues: { motivo: '' },
  });
  const longitudMotivo = useWatch({ control, name: 'motivo' }).length;
  const enviando = desactivacion.isPending;

  const enviar = ({ motivo }: DatosFormulario) => {
    alCambiarEnvio(true);
    desactivacion.mutate(
      { firmaId: firma.id, motivo },
      {
        onSettled: () => alCambiarEnvio(false),
        onSuccess: () => {
          notificar({
            tono: 'exito',
            titulo: 'Firma desactivada',
            descripcion: `${nombreCompleto} debe registrar una nueva desde la app para volver a cerrar historias.`,
          });
          alTerminar();
        },
        onError: (error) => {
          if (error.estado === 400) {
            setError('motivo', { message: error.detalles.length > 0 ? error.detalles.join(' ') : error.message });
            return;
          }
          if (error.estado === 409 || error.estado === 422) {
            // El historial ya se está recargando: la firma dejó de ser la vigente.
            notificar({ tono: 'error', titulo: 'La firma cambió mientras tanto', descripcion: error.message });
            alTerminar();
            return;
          }
          notificar({ tono: 'error', titulo: 'No fue posible desactivar la firma', descripcion: error.message });
        },
      },
    );
  };

  return (
    <form
      onSubmit={handleSubmit(enviar)}
      noValidate
      aria-label="Desactivar firma"
      className="space-y-4 rounded-2xl border border-critico/20 bg-critico/4 p-4"
    >
      <p className="flex items-start gap-2.5 text-[13px] text-texto">
        <TriangleAlert aria-hidden strokeWidth={1.75} className="mt-0.5 size-4 shrink-0 text-advertencia" />
        El profesional no podrá cerrar historias hasta que registre una nueva firma desde la app. Las historias ya
        firmadas no cambian.
      </p>
      <CampoMotivo
        id="motivo-desactivar-firma"
        longitud={longitudMotivo}
        longitudMaxima={LONGITUD_MAXIMA_MOTIVO_FIRMA}
        placeholder="Por ejemplo: firma ilegible, debe registrarla de nuevo"
        disabled={enviando}
        error={errors.motivo?.message}
        ayuda="Queda en la firma y en la auditoría."
        {...register('motivo')}
      />
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={alCancelar}
          disabled={enviando}
          className="campo-vidrio h-10 rounded-xl px-4 text-sm font-medium text-texto transition-colors duration-150 hover:bg-white disabled:opacity-60"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={enviando}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-critico px-4 text-sm font-semibold text-white shadow-critico transition-colors duration-150 hover:bg-critico-hover focus-visible:ring-4 focus-visible:ring-critico/25 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
        >
          {enviando ? (
            <LoaderCircle aria-hidden className="size-4 animate-spin" />
          ) : (
            <Ban aria-hidden strokeWidth={1.75} className="size-4" />
          )}
          {enviando ? 'Desactivando…' : 'Desactivar firma'}
        </button>
      </div>
    </form>
  );
}
