import { CircleAlert, CircleCheck, Info, X, type LucideIcon } from 'lucide-react';
import type { Notificacion, TonoNotificacion } from '../../providers/contexto_notificaciones';

const ESTILOS_TONO: Record<TonoNotificacion, { icono: LucideIcon; color: string }> = {
  exito: { icono: CircleCheck, color: 'text-exito' },
  error: { icono: CircleAlert, color: 'text-critico' },
  informacion: { icono: Info, color: 'text-primario' },
};

interface PropiedadesRegionNotificaciones {
  notificaciones: Notificacion[];
  alDescartar: (id: number) => void;
}

export function RegionNotificaciones({ notificaciones, alDescartar }: PropiedadesRegionNotificaciones) {
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed right-4 bottom-4 z-2000 flex w-[min(380px,calc(100vw-32px))] flex-col gap-2"
    >
      {notificaciones.map(({ id, tono, titulo, descripcion }) => {
        const { icono: Icono, color } = ESTILOS_TONO[tono];
        return (
          <div
            key={id}
            role={tono === 'error' ? 'alert' : 'status'}
            className="vidrio-fuerte pointer-events-auto flex gap-3 rounded-2xl p-4"
          >
            <Icono aria-hidden strokeWidth={1.75} className={`mt-0.5 size-[18px] shrink-0 ${color}`} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-texto">{titulo}</p>
              {descripcion && (
                <p className="mt-0.5 text-[13px] text-texto-secundario">{descripcion}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => alDescartar(id)}
              aria-label="Cerrar notificación"
              className="flex size-7 shrink-0 items-center justify-center rounded-lg text-texto-secundario hover:bg-white hover:text-texto"
            >
              <X aria-hidden strokeWidth={1.75} className="size-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
