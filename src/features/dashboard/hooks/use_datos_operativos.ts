import { useFlota } from '../../ambulances/hooks/use_ambulancias';
import { INTERVALO_ACTUALIZACION_MS } from '../../assignments/constants/asignaciones';
import { useAsignacionesActivas, useRutasActivas } from '../../assignments/hooks/use_asignaciones';
import { useEmergencias } from '../../emergencies/hooks/use_emergencias';
import { useIntervaloRespaldo } from '../../realtime/hooks/use_tiempo_real';

/** El backend admite hasta 100 por página; alcanza para las emergencias activas de una ciudad. */
const LIMITE_EMERGENCIAS = 100;

/**
 * Emergencias activas, toda la flota con su última posición, los servicios en curso y sus rutas.
 * Con tiempo real se actualizan por avisos (el GPS mueve los marcadores sin recargar);
 * sin él, se consultan cada 15 s solo mientras la pestaña está visible.
 * Solo para administrador y despachador.
 */
export function useDatosOperativos() {
  const respaldo = useIntervaloRespaldo(INTERVALO_ACTUALIZACION_MS);
  const emergencias = useEmergencias({ soloActivas: true, pagina: 1, limite: LIMITE_EMERGENCIAS }, respaldo);
  const ambulancias = useFlota(respaldo);
  const asignaciones = useAsignacionesActivas();
  const rutas = useRutasActivas();
  return { emergencias, ambulancias, asignaciones, rutas };
}
