import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { LIMITE_POR_PAGINA } from '../constants/ambulancias';
import { ESTADOS_OPERATIVOS } from '../constants/estados_operativos';
import type { EstadoOperativo, FiltrosAmbulancias } from '../types/ambulancia.types';

const PATRON_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const LONGITUD_MAXIMA_BUSQUEDA = 30;

function esEstadoOperativo(valor: string | null): valor is EstadoOperativo {
  return ESTADOS_OPERATIVOS.some((estado) => estado === valor);
}

export type CambiosFiltrosAmbulancias = Partial<Omit<FiltrosAmbulancias, 'limite'>>;

/** Los filtros viven en la URL para poder compartirlos y conservarlos al recargar. */
export function useFiltrosAmbulancias() {
  const [parametros, setParametros] = useSearchParams();

  const filtros = useMemo<FiltrosAmbulancias>(() => {
    const estado = parametros.get('estadoOperativo');
    const tipo = parametros.get('tipoAmbulanciaId');
    const pagina = Number(parametros.get('pagina'));
    const busqueda = parametros.get('busqueda')?.trim().slice(0, LONGITUD_MAXIMA_BUSQUEDA);
    return {
      busqueda: busqueda || undefined,
      estadoOperativo: esEstadoOperativo(estado) ? estado : undefined,
      tipoAmbulanciaId: tipo && PATRON_UUID.test(tipo) ? tipo : undefined,
      pagina: Number.isInteger(pagina) && pagina >= 1 ? pagina : 1,
      limite: LIMITE_POR_PAGINA,
    };
  }, [parametros]);

  const actualizarFiltros = useCallback(
    (cambios: CambiosFiltrosAmbulancias) => {
      setParametros(
        (actuales) => {
          const siguientes = new URLSearchParams(actuales);
          for (const [clave, valor] of Object.entries(cambios)) {
            if (valor === undefined || valor === '' || (clave === 'pagina' && valor === 1)) {
              siguientes.delete(clave);
            } else {
              siguientes.set(clave, String(valor));
            }
          }
          // Cualquier cambio de filtro vuelve a la primera página.
          if (!('pagina' in cambios)) siguientes.delete('pagina');
          return siguientes;
        },
        { replace: true },
      );
    },
    [setParametros],
  );

  const hayFiltrosActivos = Boolean(
    filtros.busqueda || filtros.estadoOperativo || filtros.tipoAmbulanciaId,
  );

  return { filtros, actualizarFiltros, hayFiltrosActivos };
}
