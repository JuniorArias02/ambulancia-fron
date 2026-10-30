import { useCallback, useEffect, useState } from 'react';

const CLAVE_CONTRAIDA = 'ambulancia.barra_lateral_contraida';

function leerContraida(): boolean {
  try {
    return localStorage.getItem(CLAVE_CONTRAIDA) === 'true';
  } catch {
    return false;
  }
}

export function useBarraLateral() {
  const [contraida, setContraida] = useState(leerContraida);
  const [abiertaMovil, setAbiertaMovil] = useState(false);

  const alternarContraccion = useCallback(() => {
    setContraida((actual) => {
      const siguiente = !actual;
      try {
        localStorage.setItem(CLAVE_CONTRAIDA, String(siguiente));
      } catch {
        // Preferencia visual: si no se puede guardar, solo dura en esta visita.
      }
      return siguiente;
    });
  }, []);

  const abrirMovil = useCallback(() => setAbiertaMovil(true), []);
  const cerrarMovil = useCallback(() => setAbiertaMovil(false), []);

  useEffect(() => {
    if (!abiertaMovil) return;
    const cerrarConEscape = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') setAbiertaMovil(false);
    };
    document.addEventListener('keydown', cerrarConEscape);
    return () => document.removeEventListener('keydown', cerrarConEscape);
  }, [abiertaMovil]);

  return { contraida, abiertaMovil, alternarContraccion, abrirMovil, cerrarMovil };
}
