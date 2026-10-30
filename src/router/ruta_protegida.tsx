import { Navigate, Outlet, useLocation } from 'react-router';
import { EstadoError } from '../components/states/estado_error';
import { PantallaCarga } from '../components/states/pantalla_carga';
import { RUTAS } from '../constants/rutas';
import { useSesion } from '../features/authentication/hooks/use_sesion';

export function RutaProtegida() {
  const { estado, errorVerificacion, reintentarVerificacion, cerrarSesion } = useSesion();
  const ubicacion = useLocation();

  if (estado === 'verificando') {
    return <PantallaCarga mensaje="Verificando sesión…" />;
  }

  if (estado === 'error') {
    return (
      <div className="flex min-h-dvh items-center justify-center px-4">
        <div className="vidrio rounded-3xl">
          <EstadoError
            titulo="No fue posible verificar tu sesión"
            mensaje={errorVerificacion?.message ?? 'Inténtalo de nuevo.'}
            alReintentar={reintentarVerificacion}
            accionSecundaria={{ etiqueta: 'Cerrar sesión', alPulsar: () => void cerrarSesion() }}
          />
        </div>
      </div>
    );
  }

  if (estado === 'anonimo') {
    return (
      <Navigate to={RUTAS.iniciarSesion} replace state={{ desde: ubicacion.pathname }} />
    );
  }

  return <Outlet />;
}
