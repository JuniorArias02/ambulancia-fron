import type { ReactNode } from 'react';

/** Fila con filtros a la izquierda y la acción principal a la derecha, sobre un listado. */
export function BarraHerramientas({ filtros, accion }: { filtros: ReactNode; accion?: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 border-b border-borde/70 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0 flex-1">{filtros}</div>
      {accion && <div className="shrink-0">{accion}</div>}
    </div>
  );
}
