import { useCallback } from 'react';
import { useSearchParams } from 'react-router';

type Valor = string | number | boolean | undefined;

/**
 * Filtros, pestañas y página en la URL, para compartir una vista y conservarla al volver.
 * Cualquier cambio que no sea de página vuelve a la primera.
 */
export function useParametrosUrl() {
  const [parametros, setParametros] = useSearchParams();

  const leer = useCallback((clave: string) => parametros.get(clave) ?? undefined, [parametros]);

  const actualizar = useCallback(
    (cambios: Record<string, Valor>) => {
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

  return { leer, actualizar };
}
