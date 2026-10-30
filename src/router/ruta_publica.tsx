import { Navigate, Outlet, useLocation } from 'react-router';
import { PantallaCarga } from '../components/states/pantalla_carga';
import { RUTAS } from '../constants/rutas';
import { useSesion } from '../features/authentication/hooks/use_sesion';

function obtenerRutaOrigen(estado: unknown): string {
  if (
    typeof estado === 'object' &&
    estado !== null &&
    'desde' in estado &&
    typeof estado.desde === 'string' &&
    estado.desde.startsWith('/') &&
    !estado.desde.startsWith('//') &&
    estado.desde !== RUTAS.iniciarSesion
  ) {
    return estado.desde;
  }
  return RUTAS.inicio;
}

/** Rutas solo para usuarios sin sesión; al autenticarse redirige a la ruta de origen. */
export function RutaPublica() {
  const { estado } = useSesion();
  const ubicacion = useLocation();

  if (estado === 'verificando') {
    return <PantallaCarga mensaje="Verificando sesión…" />;
  }

  if (estado === 'autenticado') {
    return <Navigate to={obtenerRutaOrigen(ubicacion.state)} replace />;
  }

  return <Outlet />;
}
