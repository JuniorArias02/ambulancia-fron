import axios from 'axios';
import { entorno } from '../config/entorno';
import { leerCredencial } from './almacen_credencial';
import { normalizarError } from './error_api';

// Un 401 en estas rutas significa credenciales incorrectas, no una sesión vencida.
const RUTAS_SIN_SESION = ['/autenticacion/iniciar-sesion'];

type ManejadorNoAutorizado = () => void;

let manejadorNoAutorizado: ManejadorNoAutorizado | null = null;

export function registrarManejadorNoAutorizado(
  manejador: ManejadorNoAutorizado,
): () => void {
  manejadorNoAutorizado = manejador;
  return () => {
    if (manejadorNoAutorizado === manejador) manejadorNoAutorizado = null;
  };
}

export const api = axios.create({
  baseURL: entorno.urlApi,
  timeout: 15_000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((configuracion) => {
  const credencial = leerCredencial();
  if (credencial) {
    configuracion.headers.set('Authorization', `Bearer ${credencial.tokenAcceso}`);
  }
  return configuracion;
});

/**
 * En las descargas (`responseType: 'blob'`) el cuerpo del error también llega como Blob:
 * se lee como JSON para no perder el `mensaje` del backend (p. ej. el 422 de una exportación).
 */
async function leerErrorEnBlob(error: unknown): Promise<void> {
  if (!axios.isAxiosError(error) || !(error.response?.data instanceof Blob)) return;
  const { response } = error;
  if (!response.data.type.includes('json')) return;
  try {
    const cuerpo: unknown = JSON.parse(await response.data.text());
    response.data = cuerpo;
  } catch {
    // Si no es JSON válido se usa el mensaje genérico del estado.
  }
}

api.interceptors.response.use(
  (respuesta) => respuesta,
  async (error: unknown) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      !RUTAS_SIN_SESION.includes(error.config?.url ?? '')
    ) {
      manejadorNoAutorizado?.();
    }
    await leerErrorEnBlob(error);
    return Promise.reject(normalizarError(error));
  },
);
