import { useCallback, useEffect, useState } from 'react';
import { normalizarError, type ErrorApi } from '../../../services/error_api';
import { obtenerFotoDocumento } from '../services/verificaciones.service';

type EstadoFoto =
  | { estado: 'cargando' }
  | { estado: 'lista'; url: string }
  | { estado: 'error'; error: ErrorApi };

interface ResultadoCarga {
  clave: string;
  url?: string;
  error?: ErrorApi;
}

/**
 * Descarga la foto como blob y expone una URL `blob:` temporal. Fuera de la caché de consultas:
 * la URL se libera al desmontar o al cambiar de foto, y cada descarga queda auditada.
 */
export function useFotoDocumento(usuarioId: string, documentoId: string) {
  const [intento, setIntento] = useState(0);
  const [resultado, setResultado] = useState<ResultadoCarga | null>(null);
  const clave = `${usuarioId}/${documentoId}/${intento}`;

  useEffect(() => {
    const control = new AbortController();
    let url: string | null = null;
    obtenerFotoDocumento(usuarioId, documentoId, control.signal).then(
      (blob) => {
        if (control.signal.aborted) return;
        url = URL.createObjectURL(blob);
        setResultado({ clave, url });
      },
      (error: unknown) => {
        if (!control.signal.aborted) setResultado({ clave, error: normalizarError(error) });
      },
    );
    return () => {
      control.abort();
      if (url) URL.revokeObjectURL(url);
    };
  }, [usuarioId, documentoId, clave]);

  const reintentar = useCallback(() => setIntento((actual) => actual + 1), []);

  // Un resultado de otra foto o de un intento anterior equivale a seguir cargando.
  let foto: EstadoFoto = { estado: 'cargando' };
  if (resultado?.clave === clave) {
    if (resultado.url) foto = { estado: 'lista', url: resultado.url };
    else if (resultado.error) foto = { estado: 'error', error: resultado.error };
  }
  return { ...foto, reintentar };
}
