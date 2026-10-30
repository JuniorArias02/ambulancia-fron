const FILAS = 6;

export function EsqueletoEmergencias() {
  return (
    <div role="status" aria-label="Cargando emergencias" className="divide-y divide-borde/60">
      {Array.from({ length: FILAS }, (_, i) => (
        <div key={i} className="flex animate-pulse items-center gap-4 px-5 py-4">
          <div className="flex-1 space-y-2">
            <span className="block h-3 w-40 max-w-full rounded-full bg-texto-secundario/12" />
            <span className="block h-2.5 w-72 max-w-full rounded-full bg-texto-secundario/8" />
          </div>
          <span className="hidden h-6 w-20 rounded-full bg-texto-secundario/8 md:block" />
          <span className="hidden h-3 w-44 rounded-full bg-texto-secundario/8 lg:block" />
          <span className="hidden h-6 w-24 rounded-full bg-texto-secundario/8 md:block" />
        </div>
      ))}
    </div>
  );
}
