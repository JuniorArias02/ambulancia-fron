import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { ESTADO_POR_DEFECTO, ESTADOS_VERIFICACION, LIMITE_POR_PAGINA } from '../constants/verificaciones';
import type { EstadoVerificacion, FiltrosVerificaciones } from '../types/verificacion.types';

export type PestanaVerificacion = EstadoVerificacion | 'todas';

const PESTANA_TODAS = 'todas';

function leerPestana(valor: string | null): PestanaVerificacion {
  if (valor === PESTANA_TODAS) return PESTANA_TODAS;
  return ESTADOS_VERIFICACION.find((estado) => estado === valor) ?? ESTADO_POR_DEFECTO;
}

/**
 * La pestaña y la página viven en la URL. La búsqueda no: puede contener un número de
 * documento, y ese dato no debe quedar en la URL ni en el historial del navegador.
 */
export function useFiltrosVerificaciones() {
  const [parametros, setParametros] = useSearchParams();
  const [busqueda, setBusqueda] = useState('');

  const pestana = leerPestana(parametros.get('estado'));
  const paginaUrl = Number(parametros.get('pagina'));
  const pagina = Number.isInteger(paginaUrl) && paginaUrl >= 1 ? paginaUrl : 1;

  const filtros = useMemo<FiltrosVerificaciones>(
    () => ({
      estado: pestana === PESTANA_TODAS ? undefined : pestana,
      busqueda: busqueda || undefined,
      pagina,
      limite: LIMITE_POR_PAGINA,
    }),
    [pestana, busqueda, pagina],
  );

  const actualizarUrl = useCallback(
    (cambios: { estado?: PestanaVerificacion; pagina?: number }) => {
      setParametros(
        (actuales) => {
          const siguientes = new URLSearchParams(actuales);
          if ('estado' in cambios) {
            if (cambios.estado === ESTADO_POR_DEFECTO) siguientes.delete('estado');
            else if (cambios.estado) siguientes.set('estado', cambios.estado);
          }
          if (cambios.pagina && cambios.pagina > 1) siguientes.set('pagina', String(cambios.pagina));
          else siguientes.delete('pagina');
          return siguientes;
        },
        { replace: true },
      );
    },
    [setParametros],
  );

  const cambiarPestana = useCallback((estado: PestanaVerificacion) => actualizarUrl({ estado }), [actualizarUrl]);
  const cambiarPagina = useCallback((nueva: number) => actualizarUrl({ pagina: nueva }), [actualizarUrl]);
  const buscar = useCallback(
    (texto: string) => {
      setBusqueda(texto);
      actualizarUrl({});
    },
    [actualizarUrl],
  );

  return { filtros, pestana, busqueda, cambiarPestana, cambiarPagina, buscar };
}
