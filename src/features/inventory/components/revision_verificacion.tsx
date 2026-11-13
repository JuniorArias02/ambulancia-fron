import { zodResolver } from '@hookform/resolvers/zod';
import { ClipboardCheck, LoaderCircle, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { AlertaError } from '../../../components/feedback/alerta_error';
import { CampoMotivo } from '../../../components/forms/campo_motivo';
import { useNotificaciones } from '../../../hooks/use_notificaciones';
import { formatearFechaHora } from '../../../utils/formato_fecha';
import { LONGITUD_MAXIMA_RESOLUCION } from '../constants/catalogos_inventario';
import { claseBotonPrimario, claseBotonSecundario } from '../constants/estilos_inventario';
import { useMutacionInventario } from '../hooks/use_mutacion_inventario';
import { esquemaRevision, type FormularioRevision } from '../schemas/revision.schema';
import { revisarVerificacionInventario } from '../services/verificaciones.service';
import type { RevisionVerificacion, VerificacionInventario } from '../types/inventario.types';

/** Constancia fija de una revisión: no se edita ni se deshace. */
export function ConstanciaRevision({ revision }: { revision: RevisionVerificacion }) {
  return (
    <div className="rounded-2xl border border-exito/20 bg-exito/6 px-4 py-3 text-[13px] text-texto">
      <p className="flex items-start gap-2">
        <ShieldCheck aria-hidden strokeWidth={1.75} className="mt-0.5 size-4 shrink-0 text-exito" />
        <span>
          Revisada por <span className="font-semibold">{revision.revisadaPorNombre ?? 'un usuario de la central'}</span> el{' '}
          <time dateTime={revision.revisadaEn} className="font-semibold">
            {formatearFechaHora(revision.revisadaEn)}
          </time>
          .
        </span>
      </p>
      <p className="mt-2 pl-6 whitespace-pre-line">{revision.resolucion}</p>
    </div>
  );
}

interface PropiedadesFormularioRevision {
  verificacion: VerificacionInventario;
  /** Texto inicial, p. ej. con los movimientos creados en esta sesión. */
  propuesta: string;
  alRevisar: () => void;
  alCancelar: () => void;
}

function FormularioRevision({ verificacion, propuesta, alRevisar, alCancelar }: PropiedadesFormularioRevision) {
  const { notificar } = useNotificaciones();
  // Un 409 refresca el módulo (ver useMutacionInventario): el detalle mostrará la revisión ajena.
  const mutacion = useMutacionInventario(({ resolucion }: FormularioRevision) =>
    revisarVerificacionInventario(verificacion.id, resolucion),
  );
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormularioRevision>({ resolver: zodResolver(esquemaRevision), defaultValues: { resolucion: propuesta } });
  const longitud = useWatch({ control, name: 'resolucion' }).length;

  const enviar = (datos: FormularioRevision) =>
    mutacion.mutate(datos, {
      onSuccess: () => {
        notificar({
          tono: 'exito',
          titulo: 'Verificación revisada',
          descripcion: `${verificacion.ubicacionNombre ?? 'La verificación'} salió de la bandeja.`,
        });
        alRevisar();
      },
      onError: (error) => {
        if (error.estado === 409) {
          notificar({ tono: 'informacion', titulo: 'Otra persona ya la revisó', descripcion: 'Se cargó su revisión.' });
          alCancelar();
        }
      },
    });

  return (
    <form onSubmit={handleSubmit(enviar)} noValidate className="space-y-3 rounded-2xl border border-primario/20 bg-primario/4 p-4">
      {mutacion.error && mutacion.error.estado !== 409 && <AlertaError error={mutacion.error} />}
      <CampoMotivo
        id="resolucion"
        etiqueta="¿Cómo se resolvió?"
        placeholder="Faltante repuesto con MOV-…; lote vencido dado de baja con MOV-…"
        rows={4}
        longitud={longitud}
        longitudMaxima={LONGITUD_MAXIMA_RESOLUCION}
        disabled={mutacion.isPending}
        error={errors.resolucion?.message}
        ayuda="Cita los códigos de los movimientos usados. Queda como constancia y no se puede editar."
        {...register('resolucion')}
      />
      <div className="flex flex-wrap justify-end gap-2">
        <button type="button" onClick={alCancelar} disabled={mutacion.isPending} className={claseBotonSecundario}>
          Cancelar
        </button>
        <button type="submit" disabled={mutacion.isPending} className={claseBotonPrimario}>
          {mutacion.isPending ? (
            <LoaderCircle aria-hidden className="size-4 animate-spin" />
          ) : (
            <ClipboardCheck aria-hidden strokeWidth={1.75} className="size-4" />
          )}
          Marcar como revisada
        </button>
      </div>
    </form>
  );
}

interface PropiedadesRevisionVerificacion {
  verificacion: VerificacionInventario;
  propuesta: string;
  alRevisar: () => void;
}

/**
 * Cierre de una verificación con novedades: constancia si ya se revisó, o el botón para revisarla.
 * Las verificaciones `completada` o en `borrador` no se revisan.
 */
export function RevisionVerificacion({ verificacion, propuesta, alRevisar }: PropiedadesRevisionVerificacion) {
  const [revisando, setRevisando] = useState(false);

  if (verificacion.revision) return <ConstanciaRevision revision={verificacion.revision} />;
  if (!verificacion.pendienteDeRevision) return null;

  return revisando ? (
    <FormularioRevision verificacion={verificacion} propuesta={propuesta} alRevisar={alRevisar} alCancelar={() => setRevisando(false)} />
  ) : (
    <div className="flex flex-col gap-3 rounded-2xl border border-borde/70 bg-white/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-[13px] text-texto">
        Cuando hayas corregido las novedades, deja constancia de cómo se resolvieron. La revisión no cambia existencias.
      </p>
      <button type="button" onClick={() => setRevisando(true)} className={`${claseBotonPrimario} shrink-0`}>
        <ClipboardCheck aria-hidden strokeWidth={1.75} className="size-4" />
        Marcar como revisada
      </button>
    </div>
  );
}
