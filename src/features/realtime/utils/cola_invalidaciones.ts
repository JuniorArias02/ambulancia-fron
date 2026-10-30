import type { QueryClient, QueryKey } from '@tanstack/react-query';

/** Agrupa los avisos que llegan seguidos para no recargar la misma consulta varias veces. */
const ESPERA_MS = 250;

export interface ColaInvalidaciones {
  agregar: (clave: QueryKey) => void;
  descartar: () => void;
}

export function crearColaInvalidaciones(clienteConsultas: QueryClient, esperaMs = ESPERA_MS): ColaInvalidaciones {
  const pendientes = new Map<string, QueryKey>();
  let temporizador: ReturnType<typeof setTimeout> | null = null;

  const vaciar = () => {
    temporizador = null;
    const claves = [...pendientes.values()];
    pendientes.clear();
    for (const queryKey of claves) void clienteConsultas.invalidateQueries({ queryKey });
  };

  return {
    agregar: (clave) => {
      pendientes.set(JSON.stringify(clave), clave);
      temporizador ??= setTimeout(vaciar, esperaMs);
    },
    descartar: () => {
      if (temporizador !== null) clearTimeout(temporizador);
      temporizador = null;
      pendientes.clear();
    },
  };
}
