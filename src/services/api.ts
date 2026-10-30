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

api.interceptors.response.use(
  (respuesta) => respuesta,
  (error: unknown) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      !RUTAS_SIN_SESION.includes(error.config?.url ?? '')
    ) {
      manejadorNoAutorizado?.();
    }
    return Promise.reject(normalizarError(error));
  },
);
