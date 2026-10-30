import { useMatches } from 'react-router';
import { esMetadatosRuta, type MetadatosRuta } from '../types/ruta.types';

/** Metadatos de la ruta activa más profunda que los declare en `handle`. */
export function useMetadatosRuta(): MetadatosRuta | null {
  const coincidencias = useMatches();
  for (let i = coincidencias.length - 1; i >= 0; i--) {
    const { handle } = coincidencias[i] ?? {};
    if (esMetadatosRuta(handle)) return handle;
  }
  return null;
}
