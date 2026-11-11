import { ArrowRight, MessageSquareText, StickyNote } from 'lucide-react';
import { formatearFechaHora } from '../../../utils/formato_fecha';
import type { CambioVerificacion } from '../types/verificacion.types';
import { InsigniaEstadoVerificacion } from './insignia_estado_verificacion';

interface PropiedadesHistorialVerificacion {
  historial: readonly CambioVerificacion[];
  /** Para distinguir los cambios del propio ciudadano (registro y reenvíos). */
  usuarioId: string;
}

/** Del más reciente al más antiguo. */
export function HistorialVerificacion({ historial, usuarioId }: PropiedadesHistorialVerificacion) {
  const cambios = [...historial].reverse();

  if (cambios.length === 0) {
    return <p className="px-5 py-6 text-sm text-texto-secundario">Sin cambios registrados.</p>;
  }

  return (
    <ol className="px-5 py-4">
      {cambios.map((cambio, indice) => {
        const esCiudadano = cambio.responsable.id === usuarioId;
        const ultimo = indice === cambios.length - 1;
        return (
          <li key={`${cambio.ocurridoEn}-${cambio.estadoNuevo}`} className="relative flex gap-4 pb-5 last:pb-0">
            {!ultimo && <span aria-hidden className="absolute top-5 bottom-0 left-[7px] w-px bg-borde" />}
            <span
              aria-hidden
              className={`relative mt-1.5 size-[15px] shrink-0 rounded-full border-[3px] border-white shadow-vidrio ${
                indice === 0 ? 'bg-primario' : 'bg-texto-secundario/40'
              }`}
            />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                {cambio.estadoAnterior && (
                  <>
                    <InsigniaEstadoVerificacion estado={cambio.estadoAnterior} />
                    <ArrowRight aria-label="pasa a" strokeWidth={1.75} className="size-3.5 text-texto-secundario" />
                  </>
                )}
                <InsigniaEstadoVerificacion estado={cambio.estadoNuevo} />
              </div>
              <p className="text-[13px] text-texto-secundario">
                <time dateTime={cambio.ocurridoEn}>{formatearFechaHora(cambio.ocurridoEn)}</time>
                {' · '}
                <span className="font-medium text-texto">
                  {cambio.responsable.nombreCompleto ?? (esCiudadano ? 'Ciudadano' : 'Administrador')}
                </span>
                {esCiudadano && ' (ciudadano)'}
              </p>
              {cambio.motivo && (
                <p className="flex gap-2 rounded-xl bg-white/60 px-3 py-2 text-[13px] text-texto">
                  <MessageSquareText aria-hidden strokeWidth={1.75} className="mt-0.5 size-3.5 shrink-0 text-texto-secundario" />
                  <span>
                    <span className="font-medium">Motivo para el ciudadano:</span> {cambio.motivo}
                  </span>
                </p>
              )}
              {cambio.observaciones && (
                <p className="flex gap-2 rounded-xl bg-lavanda/8 px-3 py-2 text-[13px] text-texto">
                  <StickyNote aria-hidden strokeWidth={1.75} className="mt-0.5 size-3.5 shrink-0 text-lavanda" />
                  <span>
                    <span className="font-medium">Nota interna:</span> {cambio.observaciones}
                  </span>
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
