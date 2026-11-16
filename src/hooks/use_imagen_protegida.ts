import { useCallback, useEffect, useEffectEvent, useState } from 'react';
import { normalizarError, type ErrorApi } from '../services/error_api';

export type EstadoImagenProtegida =
  | { estado: 'cargando' }
  | { estado: 'lista'; url: string }
  | { estado: 'error'; error: ErrorApi };

interface ResultadoCarga {
  clave: string;
  url?: string;
  error?: ErrorApi;
}

/**
 * Imagen que exige el token (no sirve en un `<img src>` directo): se descarga como blob y se
 * expone como URL `blob:` temporal. Queda fuera de la caché de consultas y del estado global;
 * la URL se libera al desmontar o al cambiar de `clave`, que identifica la imagen.
 */
export function useImagenProtegida(clave: string, cargar: (senal: AbortSignal) => Promise<Blob>) {
  const [intento, setIntento] = useState(0);
  const [resultado, setResultado] = useState<ResultadoCarga | null>(null);
  const claveIntento = `${clave}/${intento}`;
  const descargar = useEffectEvent(cargar);

  useEffect(() => {
    const control = new AbortController();
    let url: string | null = null;
    descargar(control.signal).then(
      (blob) => {
        if (control.signal.aborted) return;
        url = URL.createObjectURL(blob);
        setResultado({ clave: claveIntento, url });
      },
      (error: unknown) => {
        if (!control.signal.aborted) setResultado({ clave: claveIntento, error: normalizarError(error) });
      },
    );
    return () => {
      control.abort();
      if (url) URL.revokeObjectURL(url);
    };
  }, [claveIntento]);

  const reintentar = useCallback(() => setIntento((actual) => actual + 1), []);

  // Un resultado de otra imagen o de un intento anterior equivale a seguir cargando.
  let imagen: EstadoImagenProtegida = { estado: 'cargando' };
  if (resultado?.clave === claveIntento) {
    if (resultado.url) imagen = { estado: 'lista', url: resultado.url };
    else if (resultado.error) imagen = { estado: 'error', error: resultado.error };
  }
  return { ...imagen, reintentar };
}
