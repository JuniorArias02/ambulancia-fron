import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { RegionNotificaciones } from '../components/feedback/region_notificaciones';
import {
  ContextoNotificaciones,
  type Notificacion,
  type ValorContextoNotificaciones,
} from './contexto_notificaciones';

const DURACION_MILISEGUNDOS = 5_000;

interface PropiedadesProveedorNotificaciones {
  children: ReactNode;
}

export function ProveedorNotificaciones({ children }: PropiedadesProveedorNotificaciones) {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const siguienteIdRef = useRef(0);

  const descartar = useCallback((id: number) => {
    setNotificaciones((actuales) => actuales.filter((notificacion) => notificacion.id !== id));
  }, []);

  const notificar = useCallback<ValorContextoNotificaciones['notificar']>(
    (nueva) => {
      const id = ++siguienteIdRef.current;
      setNotificaciones((actuales) => [...actuales, { ...nueva, id }]);
      window.setTimeout(() => descartar(id), DURACION_MILISEGUNDOS);
    },
    [descartar],
  );

  const valor = useMemo(() => ({ notificar }), [notificar]);

  return (
    <ContextoNotificaciones value={valor}>
      {children}
      <RegionNotificaciones notificaciones={notificaciones} alDescartar={descartar} />
    </ContextoNotificaciones>
  );
}
