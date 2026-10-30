import { useContext } from 'react';
import { ContextoSesion, type ValorContextoSesion } from '../providers/contexto_sesion';

export function useSesion(): ValorContextoSesion {
  const contexto = useContext(ContextoSesion);
  if (!contexto) {
    throw new Error('useSesion debe usarse dentro de ProveedorSesion');
  }
  return contexto;
}
