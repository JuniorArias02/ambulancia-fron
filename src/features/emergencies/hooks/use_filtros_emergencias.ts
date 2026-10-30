import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { ESTADOS_EMERGENCIA, PRIORIDADES, TIPOS_INCIDENTE } from '../constants/catalogos_emergencia';
import { LIMITE_POR_PAGINA } from '../constants/emergencias';
import type { FiltrosEmergencias } from '../types/emergencia.types';
import { esDiaValido } from '../utils/formato_emergencia';

/** `activas`: tablero operativo. `historial`: todas, con filtros de estado y fechas. */
export type VistaEmergencias = 'activas' | 'historial';

const LONGITUD_MAXIMA_BUSQUEDA = 100;

function deCatalogo<T extends string>(catalogo: readonly T[], valor: string | null): T | undefined {
  return catalogo.find((opcion) => opcion === valor);
}

export type CambiosFiltrosEmergencias = Partial<
  Omit<FiltrosEmergencias, 'limite' | 'soloActivas'> & { vista: VistaEmergencias }
>;

/** Los filtros viven en la URL para poder compartirlos y conservarlos al recargar. */
export function useFiltrosEmergencias() {
  const [parametros, setParametros] = useSearchParams();

  const vista: VistaEmergencias = parametros.get('vista') === 'historial' ? 'historial' : 'activas';

  const filtros = useMemo<FiltrosEmergencias>(() => {
    const pagina = Number(parametros.get('pagina'));
    const busqueda = parametros.get('busqueda')?.trim().slice(0, LONGITUD_MAXIMA_BUSQUEDA);
    const desde = parametros.get('desde');
    const hasta = parametros.get('hasta');
    const enHistorial = vista === 'historial';
    return {
      busqueda: busqueda || undefined,
      // El estado y las fechas solo aplican al historial; el tablero muestra las activas.
      estado: enHistorial ? deCatalogo(ESTADOS_EMERGENCIA, parametros.get('estado')) : undefined,
      soloActivas: enHistorial ? undefined : true,
      prioridad: deCatalogo(PRIORIDADES, parametros.get('prioridad')),
      tipoIncidente: deCatalogo(TIPOS_INCIDENTE, parametros.get('tipoIncidente')),
      desde: enHistorial && desde && esDiaValido(desde) ? desde : undefined,
      hasta: enHistorial && hasta && esDiaValido(hasta) ? hasta : undefined,
      pagina: Number.isInteger(pagina) && pagina >= 1 ? pagina : 1,
      limite: LIMITE_POR_PAGINA,
    };
  }, [parametros, vista]);

  const actualizarFiltros = useCallback(
    (cambios: CambiosFiltrosEmergencias) => {
      setParametros(
        (actuales) => {
          const siguientes = new URLSearchParams(actuales);
          for (const [clave, valor] of Object.entries(cambios)) {
            const predeterminado =
              (clave === 'pagina' && valor === 1) || (clave === 'vista' && valor === 'activas');
            if (valor === undefined || valor === '' || predeterminado) {
              siguientes.delete(clave);
            } else {
              siguientes.set(clave, String(valor));
            }
          }
          if ('vista' in cambios) {
            for (const clave of ['estado', 'desde', 'hasta']) siguientes.delete(clave);
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
    filtros.busqueda ||
      filtros.estado ||
      filtros.prioridad ||
      filtros.tipoIncidente ||
      filtros.desde ||
      filtros.hasta,
  );

  const limpiarFiltros = useCallback(
    () =>
      actualizarFiltros({
        busqueda: undefined,
        estado: undefined,
        prioridad: undefined,
        tipoIncidente: undefined,
        desde: undefined,
        hasta: undefined,
      }),
    [actualizarFiltros],
  );

  return { vista, filtros, actualizarFiltros, limpiarFiltros, hayFiltrosActivos };
}
