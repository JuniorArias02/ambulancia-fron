import { QueryClient } from '@tanstack/react-query';
import { ErrorApi } from '../services/error_api';

const REINTENTOS_MAXIMOS = 2;

export function crearClienteConsultas(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        // Solo se reintentan fallos de red o del servidor; los 4xx no cambian al repetir.
        retry: (intentos, error) =>
          intentos < REINTENTOS_MAXIMOS &&
          (!(error instanceof ErrorApi) || error.estado === null || error.estado >= 500),
      },
      mutations: { retry: false },
    },
  });
}
