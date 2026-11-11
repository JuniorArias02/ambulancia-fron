import { useCallback } from 'react';
import { useSearchParams } from 'react-router';

export type VistaTurnos = 'activos' | 'finalizados';

/** Vista y página del historial en la URL. */
export function useVistaTurnos() {
  const [parametros, setParametros] = useSearchParams();
  const vista: VistaTurnos = parametros.get('vista') === 'finalizados' ? 'finalizados' : 'activos';
  const numeroPagina = Number(parametros.get('pagina'));
  const pagina = Number.isInteger(numeroPagina) && numeroPagina >= 1 ? numeroPagina : 1;

  const actualizar = useCallback(
    (cambios: { vista?: VistaTurnos; pagina?: number }) =>
      setParametros(
        (actuales) => {
          const siguientes = new URLSearchParams(actuales);
          if (cambios.vista !== undefined) {
            if (cambios.vista === 'activos') siguientes.delete('vista');
            else siguientes.set('vista', cambios.vista);
            siguientes.delete('pagina');
          }
          if (cambios.pagina !== undefined) {
            if (cambios.pagina === 1) siguientes.delete('pagina');
            else siguientes.set('pagina', String(cambios.pagina));
          }
          return siguientes;
        },
        { replace: true },
      ),
    [setParametros],
  );

  return { vista, pagina, actualizar };
}
