import { useSesion } from '../../authentication/hooks/use_sesion';

/** Solo decide qué acciones se muestran; el backend sigue autorizando cada operación. */
export function usePermisosAmbulancias() {
  const { usuario } = useSesion();
  const esAdministrador = usuario?.rol === 'administrador';
  return {
    /** Registrar y editar ambulancias. */
    puedeGestionar: esAdministrador,
    puedeCambiarEstado: esAdministrador || usuario?.rol === 'despachador',
    /** `GET /usuarios/{id}` es solo para administradores. */
    puedeVerAutores: esAdministrador,
  };
}
