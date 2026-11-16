import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export type TonoLinea = 'primario' | 'neutro' | 'tenue' | 'exito' | 'critico' | 'advertencia';

export interface ElementoLinea {
  id: string;
  /** Instante ISO, para `<time>`. */
  instante: string;
  /** Hora ya formateada. */
  hora: string;
  titulo: ReactNode;
  subtitulo?: ReactNode;
  contenido?: ReactNode;
  tono: TonoLinea;
  icono?: LucideIcon;
}

const CLASES_TONO: Record<TonoLinea, string> = {
  primario: 'bg-primario text-white',
  neutro: 'bg-texto-secundario/70 text-white',
  tenue: 'bg-borde text-texto-secundario',
  exito: 'bg-exito text-white',
  critico: 'bg-critico text-white',
  advertencia: 'bg-advertencia text-white',
};

/** Línea de tiempo vertical, del primero al último: intervenciones, servicio y trazabilidad. */
export function LineaTiempo({ elementos, etiqueta }: { elementos: readonly ElementoLinea[]; etiqueta: string }) {
  return (
    <ol aria-label={etiqueta} className="relative">
      {elementos.map((elemento, indice) => {
        const Icono = elemento.icono;
        const ultimo = indice === elementos.length - 1;
        return (
          <li key={elemento.id} className="relative flex gap-4 pb-5 last:pb-0">
            {!ultimo && <span aria-hidden className="absolute top-7 bottom-0 left-[13px] w-px bg-borde" />}
            <span
              aria-hidden
              className={`relative mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full ring-4 ring-white/80 ${CLASES_TONO[elemento.tono]}`}
            >
              {Icono ? <Icono strokeWidth={2} className="size-3.5" /> : <span className="size-1.5 rounded-full bg-current" />}
            </span>
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                <time dateTime={elemento.instante} className="text-[13px] font-medium text-texto-secundario tabular-nums">
                  {elemento.hora}
                </time>
                <p className="text-sm font-medium text-texto">{elemento.titulo}</p>
              </div>
              {elemento.subtitulo && <p className="text-[13px] text-texto-secundario">{elemento.subtitulo}</p>}
              {elemento.contenido}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
