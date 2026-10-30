import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { LIMITE_POR_PAGINA, NIVELES_COMPLEJIDAD } from '../constants/instituciones';
import type { FiltrosInstituciones } from '../types/institucion.types';

export type FiltroEstadoInstitucion = 'activas' | 'inactivas';

export type CambiosFiltrosInstituciones = Partial<{
  busqueda: string;
  estado: FiltroEstadoInstitucion;
  nivelComplejidad: FiltrosInstituciones['nivelComplejidad'];
  pagina: number;
}>;

const LONGITUD_MAXIMA_BUSQUEDA = 100;

/**
 * Los filtros viven en la URL. Quien no administra solo consulta las instituciones activas,
 * que son las que reciben pacientes.
 */
export function useFiltrosInstituciones(soloActivas: boolean) {
  const [parametros, setParametros] = useSearchParams();

  const estadoUrl = parametros.get('estado');
  const estado: FiltroEstadoInstitucion | undefined =
    estadoUrl === 'activas' || estadoUrl === 'inactivas' ? estadoUrl : undefined;

  const filtros = useMemo<FiltrosInstituciones>(() => {
    const pagina = Number(parametros.get('pagina'));
    const busqueda = parametros.get('busqueda')?.trim().slice(0, LONGITUD_MAXIMA_BUSQUEDA);
    const nivel = parametros.get('nivelComplejidad');
    return {
      busqueda: busqueda || undefined,
      activa: soloActivas ? true : estado === undefined ? undefined : estado === 'activas',
      nivelComplejidad: NIVELES_COMPLEJIDAD.find((opcion) => opcion === nivel),
      pagina: Number.isInteger(pagina) && pagina >= 1 ? pagina : 1,
      limite: LIMITE_POR_PAGINA,
    };
  }, [parametros, soloActivas, estado]);

  const actualizarFiltros = useCallback(
    (cambios: CambiosFiltrosInstituciones) => {
      setParametros(
        (actuales) => {
          const siguientes = new URLSearchParams(actuales);
          for (const [clave, valor] of Object.entries(cambios)) {
            if (valor === undefined || valor === '' || (clave === 'pagina' && valor === 1)) siguientes.delete(clave);
            else siguientes.set(clave, String(valor));
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

  const hayFiltrosActivos = Boolean(filtros.busqueda || filtros.nivelComplejidad || (!soloActivas && estado));

  return { filtros, estado, actualizarFiltros, hayFiltrosActivos };
}
