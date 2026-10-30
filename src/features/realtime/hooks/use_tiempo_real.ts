import { useContext } from 'react';
import { ContextoTiempoReal, type ValorContextoTiempoReal } from '../providers/contexto_tiempo_real';

export function useTiempoReal(): ValorContextoTiempoReal {
  return useContext(ContextoTiempoReal);
}

/**
 * Intervalo de consulta de respaldo: con el socket en línea los avisos mantienen los datos
 * al día y no hace falta consultar; sin conexión se vuelve a consultar cada `milisegundos`.
 */
export function useIntervaloRespaldo(milisegundos: number): number | false {
  const { estado } = useTiempoReal();
  return estado === 'en_linea' ? false : milisegundos;
}
