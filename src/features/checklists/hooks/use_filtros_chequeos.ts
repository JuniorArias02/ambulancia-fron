import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { esDiaValido } from '../../emergencies/utils/formato_emergencia';
import { ESTADOS_CHEQUEO, LIMITE_CHEQUEOS } from '../constants/chequeos_diarios';
import type { FiltrosChequeos } from '../types/chequeo_diario.types';

type CambiosFiltrosChequeos = Partial<Omit<FiltrosChequeos, 'limite'>>;

const PATRON_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function leerId(valor: string | null): string | undefined {
  return valor && PATRON_UUID.test(valor) ? valor : undefined;
}

function leerDia(valor: string | null): string | undefined {
  return valor && esDiaValido(valor) ? valor : undefined;
}

/** Los filtros viven en la URL para compartir una consulta, p. ej. el historial de una ambulancia. */
export function useFiltrosChequeos() {
  const [parametros, setParametros] = useSearchParams();

  const filtros = useMemo<FiltrosChequeos>(() => {
    const pagina = Number(parametros.get('pagina'));
    return {
      ambulanciaId: leerId(parametros.get('ambulanciaId')),
      conductorId: leerId(parametros.get('conductorId')),
      estado: ESTADOS_CHEQUEO.find((estado) => estado === parametros.get('estado')),
      desde: leerDia(parametros.get('desde')),
      hasta: leerDia(parametros.get('hasta')),
      pagina: Number.isInteger(pagina) && pagina >= 1 ? pagina : 1,
      limite: LIMITE_CHEQUEOS,
    };
  }, [parametros]);

  const actualizarFiltros = useCallback(
    (cambios: CambiosFiltrosChequeos) => {
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

  const { ambulanciaId, conductorId, estado, desde, hasta } = filtros;
  const hayFiltrosActivos = Boolean(ambulanciaId || conductorId || estado || desde || hasta);

  return { filtros, actualizarFiltros, hayFiltrosActivos };
}
