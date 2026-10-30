import { useEffect, useState } from 'react';

/** Hora actual que se renueva cada `milisegundos`, para mostrar tiempos transcurridos. */
export function useAhora(milisegundos = 30_000): number {
  const [ahora, setAhora] = useState(Date.now);

  useEffect(() => {
    const intervalo = window.setInterval(() => setAhora(Date.now()), milisegundos);
    return () => window.clearInterval(intervalo);
  }, [milisegundos]);

  return ahora;
}
