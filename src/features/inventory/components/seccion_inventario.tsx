import { LoaderCircle, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface PropiedadesSeccionInventario {
  id: string;
  titulo: string;
  descripcion: ReactNode;
  icono?: LucideIcon;
  actualizando?: boolean;
  /** Botones a la derecha del título. */
  acciones?: ReactNode;
  /** Pestañas y filtros bajo el título. */
  controles?: ReactNode;
  children: ReactNode;
}

/** Panel de vidrio con encabezado, controles y contenido. */
export function SeccionInventario({
  id,
  titulo,
  descripcion,
  icono: Icono,
  actualizando = false,
  acciones,
  controles,
  children,
}: PropiedadesSeccionInventario) {
  return (
    <section aria-labelledby={id} className="vidrio rounded-2xl">
      <header className="flex flex-col gap-4 border-b border-borde/70 px-5 pt-5 pb-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            {Icono && (
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primario/8 text-primario">
                <Icono aria-hidden strokeWidth={1.75} className="size-5" />
              </span>
            )}
            <div className="min-w-0">
              <h2 id={id} className="text-xl font-semibold tracking-tight text-texto">
                {titulo}
              </h2>
              <p className="mt-0.5 flex items-center gap-2 text-sm text-texto-secundario">
                {descripcion}
                {actualizando && <LoaderCircle aria-label="Actualizando" className="size-3.5 shrink-0 animate-spin" />}
              </p>
            </div>
          </div>
          {acciones && <div className="flex shrink-0 flex-wrap gap-2">{acciones}</div>}
        </div>
        {controles}
      </header>
      {children}
    </section>
  );
}
