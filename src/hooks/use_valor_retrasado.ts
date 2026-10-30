import { useEffect, useState } from 'react';

/** Devuelve el valor solo cuando deja de cambiar durante `milisegundos`. */
export function useValorRetrasado<T>(valor: T, milisegundos: number): T {
  const [retrasado, setRetrasado] = useState(valor);

  useEffect(() => {
    const temporizador = window.setTimeout(() => setRetrasado(valor), milisegundos);
    return () => window.clearTimeout(temporizador);
  }, [valor, milisegundos]);

  return retrasado;
}
