import { useSesion } from '../../authentication/hooks/use_sesion';

/** Solo decide qué acciones se muestran; el backend sigue autorizando cada operación. */
export function usePermisosAmbulancias() {
  const { usuario } = useSesion();
  const esAdministrador = usuario?.rol === 'administrador';
  const esCentral = esAdministrador || usuario?.rol === 'despachador';
  return {
    /** Registrar y editar ambulancias. */
    puedeGestionar: esCentral,
    puedeCambiarEstado: esCentral,
    /** `GET /usuarios/{id}` es solo para administradores. */
    puedeVerAutores: esAdministrador,
  };
}
