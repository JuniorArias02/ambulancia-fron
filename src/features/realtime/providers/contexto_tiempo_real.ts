import { createContext } from 'react';
import type { EstadoConexion } from '../types/tiempo_real.types';

export interface ValorContextoTiempoReal {
  estado: EstadoConexion;
}

/** Sin proveedor (p. ej. en pruebas) se comporta como desactivado: la interfaz consulta periódicamente. */
export const ContextoTiempoReal = createContext<ValorContextoTiempoReal>({ estado: 'desactivado' });
