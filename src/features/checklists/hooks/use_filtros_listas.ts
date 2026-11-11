import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { LIMITE_LISTAS } from '../constants/listas_chequeo';
import type { FiltrosListasChequeo } from '../types/lista_chequeo.types';

type CambiosFiltrosListas = Partial<Omit<FiltrosListasChequeo, 'limite'>>;

/** Los filtros viven en la URL para conservarlos al volver del editor. */
export function useFiltrosListas() {
  const [parametros, setParametros] = useSearchParams();

  const filtros = useMemo<FiltrosListasChequeo>(() => {
    const activa = parametros.get('activa');
    const pagina = Number(parametros.get('pagina'));
    const busqueda = parametros.get('busqueda')?.trim();
    return {
      activa: activa === 'true' ? true : activa === 'false' ? false : undefined,
      busqueda: busqueda || undefined,
      pagina: Number.isInteger(pagina) && pagina >= 1 ? pagina : 1,
      limite: LIMITE_LISTAS,
    };
  }, [parametros]);

  const actualizarFiltros = useCallback(
    (cambios: CambiosFiltrosListas) => {
      setParametros(
        (actuales) => {
          const siguientes = new URLSearchParams(actuales);
          for (const [clave, valor] of Object.entries(cambios)) {
            if (valor === undefined || valor === '' || (clave === 'pagina' && valor === 1)) siguientes.delete(clave);
            else siguientes.set(clave, String(valor));
          }
          if (!('pagina' in cambios)) siguientes.delete('pagina');
          return siguientes;
        },
        { replace: true },
      );
    },
    [setParametros],
  );

  return { filtros, actualizarFiltros, hayFiltrosActivos: filtros.activa !== undefined || Boolean(filtros.busqueda) };
}
