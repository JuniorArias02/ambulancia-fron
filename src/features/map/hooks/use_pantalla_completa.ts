import { useCallback, useEffect, useState, type RefObject } from 'react';

export function usePantallaCompleta(elementoRef: RefObject<HTMLElement | null>) {
  const [activa, setActiva] = useState(false);
  const soportada = document.fullscreenEnabled;

  useEffect(() => {
    const sincronizar = () =>
      setActiva(document.fullscreenElement !== null && document.fullscreenElement === elementoRef.current);
    document.addEventListener('fullscreenchange', sincronizar);
    return () => document.removeEventListener('fullscreenchange', sincronizar);
  }, [elementoRef]);

  const alternar = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await elementoRef.current?.requestFullscreen();
      }
    } catch {
      // El navegador puede rechazar la solicitud (permisos o iframes); el mapa sigue visible.
    }
  }, [elementoRef]);

  return { activa, soportada, alternar };
}
