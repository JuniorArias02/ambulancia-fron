import { zodResolver } from '@hookform/resolvers/zod';
import { CircleX, RotateCcw, TriangleAlert } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';
import { AlertaError } from '../../../components/feedback/alerta_error';
import { CampoMotivo } from '../../../components/forms/campo_motivo';
import { PieFormulario } from '../../../components/forms/pie_formulario';
import { Dialogo } from '../../../components/ui/dialogo';
import type { ErrorApi } from '../../../services/error_api';
import {
  LONGITUD_MAXIMA_MOTIVO,
  LONGITUD_MAXIMA_OBSERVACIONES,
  MOTIVOS_PREDEFINIDOS,
} from '../constants/verificaciones';
import { esquemaDecisionConMotivo, type FormularioDecisionConMotivo } from '../schemas/decision.schema';
import type { VerificacionDetalle } from '../types/verificacion.types';

export type DecisionConMotivo = 'rechazado' | 'requiere_correccion';

const TEXTOS: Record<DecisionConMotivo, { titulo: string; enviar: string; enviando: string }> = {
  requiere_correccion: { titulo: 'Pedir corrección', enviar: 'Pedir corrección', enviando: 'Enviando…' },
  rechazado: { titulo: 'Rechazar solicitud', enviar: 'Rechazar', enviando: 'Rechazando…' },
};

interface PropiedadesDialogoMotivoDecision {
  decision: DecisionConMotivo;
  verificacion: VerificacionDetalle;
  enviando: boolean;
  error: ErrorApi | null;
  alEnviar: (datos: { motivo: string; observaciones?: string }) => void;
  alCerrar: () => void;
}

export function DialogoMotivoDecision({
  decision,
  verificacion,
  enviando,
  error,
  alEnviar,
  alCerrar,
}: PropiedadesDialogoMotivoDecision) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<FormularioDecisionConMotivo>({
    resolver: zodResolver(esquemaDecisionConMotivo),
    defaultValues: { motivo: '', observaciones: '' },
  });
  const motivo = useWatch({ control, name: 'motivo' });
  const longitudObservaciones = useWatch({ control, name: 'observaciones' }).length;
  const textos = TEXTOS[decision];
  const esRechazo = decision === 'rechazado';

  const enviar = ({ motivo: texto, observaciones }: FormularioDecisionConMotivo) =>
    alEnviar({ motivo: texto, observaciones: observaciones || undefined });

  return (
    <Dialogo
      abierto
      variante="lateral"
      titulo={textos.titulo}
      descripcion={`${verificacion.nombres} ${verificacion.apellidos}`}
      cerrable={!enviando}
      alCerrar={alCerrar}
    >
      <form onSubmit={handleSubmit(enviar)} noValidate className="flex min-h-full flex-col">
        <div className="flex-1 space-y-5 px-6 py-5">
          {error && <AlertaError error={error} />}

          {esRechazo ? (
            <p className="flex items-start gap-2.5 rounded-xl border border-critico/20 bg-critico/6 px-4 py-3 text-[13px] text-texto">
              <TriangleAlert aria-hidden strokeWidth={1.75} className="mt-0.5 size-4 shrink-0 text-critico" />
              <span>
                <span className="font-semibold">El rechazo es definitivo.</span> El ciudadano no podrá reportar
                emergencias ni volver a enviar la solicitud. Si hay dudas, pide una corrección.
              </span>
            </p>
          ) : (
            <p className="rounded-xl bg-advertencia/8 px-4 py-3 text-[13px] text-texto">
              El ciudadano verá el motivo en la app y podrá reenviar sus fotos o datos. La solicitud volverá a
              «Pendientes».
            </p>
          )}

          <fieldset disabled={enviando} className="space-y-2">
            <legend className="mb-1 text-sm font-medium text-texto">Motivos frecuentes</legend>
            <div className="flex flex-col gap-1.5">
              {MOTIVOS_PREDEFINIDOS.map((predefinido) => (
                <button
                  key={predefinido}
                  type="button"
                  aria-pressed={motivo === predefinido}
                  onClick={() => setValue('motivo', predefinido, { shouldDirty: true, shouldValidate: true })}
                  className={`rounded-xl border px-3 py-2 text-left text-[13px] transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-primario/40 focus-visible:outline-none ${
                    motivo === predefinido
                      ? 'border-primario/40 bg-primario/6 text-texto'
                      : 'border-borde/80 bg-white/50 text-texto-secundario hover:bg-white hover:text-texto'
                  }`}
                >
                  {predefinido}
                </button>
              ))}
            </div>
          </fieldset>

          <CampoMotivo
            id="motivo"
            etiqueta="Motivo para el ciudadano"
            placeholder="Escribe con claridad qué debe corregir o por qué se rechaza"
            longitud={motivo.length}
            longitudMaxima={LONGITUD_MAXIMA_MOTIVO}
            disabled={enviando}
            error={errors.motivo?.message}
            ayuda="El ciudadano verá este texto en la app. No incluyas notas internas."
            {...register('motivo')}
          />

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="observaciones" className="text-sm font-medium text-texto">
                Observaciones internas <span className="font-normal text-texto-secundario">(opcional)</span>
              </label>
              <span aria-live="polite" className="text-xs text-texto-secundario">
                {longitudObservaciones}/{LONGITUD_MAXIMA_OBSERVACIONES}
              </span>
            </div>
            <textarea
              id="observaciones"
              rows={3}
              maxLength={LONGITUD_MAXIMA_OBSERVACIONES}
              disabled={enviando}
              aria-invalid={errors.observaciones ? true : undefined}
              aria-describedby="ayuda-observaciones"
              className="campo-vidrio w-full resize-none rounded-xl px-4 py-3 text-[15px] text-texto placeholder:text-texto-secundario/80 focus:border-primario/60! focus:bg-white focus:ring-4 focus:ring-primario/12 focus:outline-none disabled:opacity-60"
              {...register('observaciones')}
            />
            <p id="ayuda-observaciones" className={`text-[13px] ${errors.observaciones ? 'text-critico' : 'text-texto-secundario'}`}>
              {errors.observaciones?.message ?? 'Solo visible para administradores.'}
            </p>
          </div>
        </div>

        <PieFormulario
          textoEnviar={textos.enviar}
          textoEnviando={textos.enviando}
          icono={esRechazo ? CircleX : RotateCcw}
          tono={esRechazo ? 'peligro' : 'advertencia'}
          enviando={enviando}
          alCancelar={alCerrar}
        />
      </form>
    </Dialogo>
  );
}
