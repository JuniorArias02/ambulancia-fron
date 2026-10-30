import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { NOMBRES_ROLES, type NombreRol } from '../../../types/rol.types';
import { ESTADOS_USUARIO } from '../constants/estados_usuario';
import { LIMITE_POR_PAGINA } from '../constants/usuarios';
import type { EstadoUsuario, FiltrosUsuarios } from '../types/usuario.types';

function esEstado(valor: string | null): valor is EstadoUsuario {
  return ESTADOS_USUARIO.some((estado) => estado === valor);
}

function esRol(valor: string | null): valor is NombreRol {
  return NOMBRES_ROLES.some((rol) => rol === valor);
}

type CambiosFiltros = Partial<Omit<FiltrosUsuarios, 'limite'>>;

/** Los filtros viven en la URL para poder compartirlos y conservarlos al recargar. */
export function useFiltrosUsuarios() {
  const [parametros, setParametros] = useSearchParams();

  const filtros = useMemo<FiltrosUsuarios>(() => {
    const estado = parametros.get('estado');
    const rol = parametros.get('rol');
    const pagina = Number(parametros.get('pagina'));
    const busqueda = parametros.get('busqueda')?.trim();
    return {
      busqueda: busqueda || undefined,
      estado: esEstado(estado) ? estado : undefined,
      rol: esRol(rol) ? rol : undefined,
      pagina: Number.isInteger(pagina) && pagina >= 1 ? pagina : 1,
      limite: LIMITE_POR_PAGINA,
    };
  }, [parametros]);

  const actualizarFiltros = useCallback(
    (cambios: CambiosFiltros) => {
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

  const hayFiltrosActivos = Boolean(filtros.busqueda || filtros.estado || filtros.rol);

  return { filtros, actualizarFiltros, hayFiltrosActivos };
}
