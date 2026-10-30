/** Tiempo desde `desdeIso`: `Ahora`, `12 min`, `1 h 05 min`, `3 d`. */
export function tiempoTranscurrido(desdeIso: string, ahora: number): string {
  const minutos = Math.floor((ahora - new Date(desdeIso).getTime()) / 60_000);
  if (!Number.isFinite(minutos)) return '—';
  if (minutos < 1) return 'Ahora';
  if (minutos < 60) return `${minutos} min`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `${horas} h ${String(minutos % 60).padStart(2, '0')} min`;
  return `${Math.floor(horas / 24)} d`;
}

/** Para frases: `hace un momento`, `hace 12 min`. */
export function haceTiempo(desdeIso: string, ahora: number): string {
  const tiempo = tiempoTranscurrido(desdeIso, ahora);
  return tiempo === 'Ahora' ? 'hace un momento' : `hace ${tiempo}`;
}
