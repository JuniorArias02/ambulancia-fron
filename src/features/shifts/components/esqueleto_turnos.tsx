export function EsqueletoTurnos() {
  return (
    <div role="status" aria-label="Cargando turnos" className="grid gap-3 p-5 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="h-56 animate-pulse rounded-2xl bg-white/50" />
      ))}
    </div>
  );
}
