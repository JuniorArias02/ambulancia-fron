const FILAS = 6;

export function EsqueletoAmbulancias() {
  return (
    <div role="status" aria-label="Cargando ambulancias" className="divide-y divide-borde/60">
      {Array.from({ length: FILAS }, (_, i) => (
        <div key={i} className="flex animate-pulse items-center gap-4 px-5 py-4">
          <span className="size-9 shrink-0 rounded-xl bg-texto-secundario/10" />
          <div className="flex-1 space-y-2">
            <span className="block h-3 w-28 max-w-full rounded-full bg-texto-secundario/12" />
            <span className="block h-2.5 w-20 max-w-full rounded-full bg-texto-secundario/8" />
          </div>
          <span className="hidden h-6 w-20 rounded-lg bg-texto-secundario/8 md:block" />
          <span className="hidden h-6 w-28 rounded-full bg-texto-secundario/8 md:block" />
        </div>
      ))}
    </div>
  );
}
