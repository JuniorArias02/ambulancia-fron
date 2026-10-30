import { api } from '../../../services/api';
import type { ResultadoPaginado } from '../../../types/paginacion.types';
import { normalizarBusqueda } from '../utils/formato_ambulancia';
import type {
  Ambulancia,
  CambioEstado,
  DatosActualizarAmbulancia,
  DatosCambioEstadoAmbulancia,
  DatosCrearAmbulancia,
  FiltrosAmbulancias,
} from '../types/ambulancia.types';

function rutaAmbulancia(id: string): string {
  return `/ambulancias/${encodeURIComponent(id)}`;
}

export async function listarAmbulancias(
  filtros: FiltrosAmbulancias,
): Promise<ResultadoPaginado<Ambulancia>> {
  const busqueda = filtros.busqueda ? normalizarBusqueda(filtros.busqueda) : undefined;
  const { data } = await api.get<ResultadoPaginado<Ambulancia>>('/ambulancias', {
    params: { ...filtros, busqueda: busqueda || undefined },
  });
  return data;
}

/** Máximo por página que admite `GET /ambulancias`. */
const LIMITE_MAXIMO = 100;

/**
 * Toda la flota: la primera página y, si hay más de 100 ambulancias, las demás.
 * Se devuelve como un único resultado paginado para tratarla igual que cualquier listado.
 */
export async function listarFlota(): Promise<ResultadoPaginado<Ambulancia>> {
  const primera = await listarAmbulancias({ pagina: 1, limite: LIMITE_MAXIMO });
  const paginas = Math.ceil(primera.total / LIMITE_MAXIMO);
  if (paginas <= 1) return primera;
  const resto = await Promise.all(
    Array.from({ length: paginas - 1 }, (_, indice) => listarAmbulancias({ pagina: indice + 2, limite: LIMITE_MAXIMO })),
  );
  const datos = [primera, ...resto].flatMap((pagina) => pagina.datos);
  return { datos, total: primera.total, pagina: 1, limite: datos.length };
}

export async function obtenerAmbulancia(id: string): Promise<Ambulancia> {
  const { data } = await api.get<Ambulancia>(rutaAmbulancia(id));
  return data;
}

export async function crearAmbulancia(datos: DatosCrearAmbulancia): Promise<Ambulancia> {
  const { data } = await api.post<Ambulancia>('/ambulancias', datos);
  return data;
}

export async function actualizarAmbulancia(
  id: string,
  datos: DatosActualizarAmbulancia,
): Promise<Ambulancia> {
  const { data } = await api.patch<Ambulancia>(rutaAmbulancia(id), datos);
  return data;
}

export async function cambiarEstadoAmbulancia(
  id: string,
  datos: DatosCambioEstadoAmbulancia,
): Promise<Ambulancia> {
  const { data } = await api.patch<Ambulancia>(`${rutaAmbulancia(id)}/estado`, datos);
  return data;
}

export async function listarHistorialEstados(
  id: string,
  pagina: number,
  limite: number,
): Promise<ResultadoPaginado<CambioEstado>> {
  const { data } = await api.get<ResultadoPaginado<CambioEstado>>(
    `${rutaAmbulancia(id)}/historial-estados`,
    { params: { pagina, limite } },
  );
  return data;
}
