import { useContext } from 'react';
import {
  ContextoNotificaciones,
  type ValorContextoNotificaciones,
} from '../providers/contexto_notificaciones';

export function useNotificaciones(): ValorContextoNotificaciones {
  const contexto = useContext(ContextoNotificaciones);
  if (!contexto) {
    throw new Error('useNotificaciones debe usarse dentro de ProveedorNotificaciones');
  }
  return contexto;
}
