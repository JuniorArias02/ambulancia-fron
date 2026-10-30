import axios from 'axios';
import { z } from 'zod';

const esquemaCuerpoError = z.object({
  mensaje: z.union([z.string(), z.array(z.string())]),
});

const MENSAJES_POR_ESTADO: Record<number, string> = {
  401: 'Tu sesión no es válida. Inicia sesión de nuevo.',
  403: 'No tienes permisos para realizar esta acción.',
  404: 'El recurso solicitado no existe.',
  409: 'La información cambió mientras trabajabas. Actualiza e inténtalo de nuevo.',
  429: 'Demasiados intentos. Espera un minuto e inténtalo de nuevo.',
};

const MENSAJE_SIN_CONEXION =
  'No fue posible conectar con el servidor. Verifica tu conexión.';
const MENSAJE_ERROR_SERVIDOR =
  'El servidor no pudo procesar la solicitud. Inténtalo más tarde.';

export class ErrorApi extends Error {
  readonly estado: number | null;
  readonly detalles: readonly string[];

  constructor(estado: number | null, mensaje: string, detalles: string[] = []) {
    super(mensaje);
    this.name = 'ErrorApi';
    this.estado = estado;
    this.detalles = detalles;
  }
}

function mensajeDelBackend(cuerpo: unknown): string[] {
  const resultado = esquemaCuerpoError.safeParse(cuerpo);
  if (!resultado.success) return [];
  const { mensaje } = resultado.data;
  return Array.isArray(mensaje) ? mensaje : [mensaje];
}

export function normalizarError(error: unknown): ErrorApi {
  if (error instanceof ErrorApi) return error;

  if (!axios.isAxiosError(error)) {
    return new ErrorApi(null, 'Ocurrió un error inesperado.');
  }

  if (!error.response) {
    return new ErrorApi(null, MENSAJE_SIN_CONEXION);
  }

  const { status, data } = error.response;

  if (status >= 500) {
    return new ErrorApi(status, MENSAJE_ERROR_SERVIDOR);
  }

  const detalles = mensajeDelBackend(data);
  // El limitador de intentos responde en inglés; se usa el mensaje propio.
  const mensaje =
    status === 429
      ? MENSAJES_POR_ESTADO[429]
      : (detalles[0] ?? MENSAJES_POR_ESTADO[status] ?? 'La solicitud no es válida.');

  return new ErrorApi(status, mensaje ?? '', detalles);
}
