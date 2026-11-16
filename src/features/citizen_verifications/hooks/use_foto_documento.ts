import { useImagenProtegida } from '../../../hooks/use_imagen_protegida';
import { obtenerFotoDocumento } from '../services/verificaciones.service';

/** Cada descarga de la foto queda auditada en el backend. */
export function useFotoDocumento(usuarioId: string, documentoId: string) {
  return useImagenProtegida(`documento/${usuarioId}/${documentoId}`, (senal) =>
    obtenerFotoDocumento(usuarioId, documentoId, senal),
  );
}
