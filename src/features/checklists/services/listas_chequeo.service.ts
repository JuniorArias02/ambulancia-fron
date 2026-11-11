import { api } from '../../../services/api';
import type { ResultadoPaginado } from '../../../types/paginacion.types';
import type {
  CambiosOpcion,
  CambiosPregunta,
  DatosActualizarLista,
  DatosCrearLista,
  DatosOpcion,
  DatosPregunta,
  FiltrosListasChequeo,
  ListaChequeo,
} from '../types/lista_chequeo.types';

const RUTA = '/listas-chequeo';
const rutaLista = (id: string) => `${RUTA}/${encodeURIComponent(id)}`;

export async function listarListasChequeo(filtros: FiltrosListasChequeo): Promise<ResultadoPaginado<ListaChequeo>> {
  const { data } = await api.get<ResultadoPaginado<ListaChequeo>>(RUTA, { params: filtros });
  return data;
}

export async function obtenerListaChequeo(id: string): Promise<ListaChequeo> {
  const { data } = await api.get<ListaChequeo>(rutaLista(id));
  return data;
}

/** La lista nace inactiva. */
export async function crearListaChequeo(datos: DatosCrearLista): Promise<ListaChequeo> {
  const { data } = await api.post<ListaChequeo>(RUTA, datos);
  return data;
}

export async function actualizarListaChequeo(id: string, datos: DatosActualizarLista): Promise<ListaChequeo> {
  const { data } = await api.patch<ListaChequeo>(rutaLista(id), datos);
  return data;
}

/** Activar una lista desactiva la que estaba activa. */
export async function cambiarEstadoListaChequeo(id: string, activa: boolean): Promise<ListaChequeo> {
  const { data } = await api.patch<ListaChequeo>(`${rutaLista(id)}/estado`, { activa });
  return data;
}

// Las preguntas y opciones responden la lista completa actualizada.

export async function agregarPregunta(id: string, datos: DatosPregunta): Promise<ListaChequeo> {
  const { data } = await api.post<ListaChequeo>(`${rutaLista(id)}/items`, datos);
  return data;
}

export async function actualizarPregunta(id: string, itemId: string, cambios: CambiosPregunta): Promise<ListaChequeo> {
  const { data } = await api.patch<ListaChequeo>(`${rutaLista(id)}/items/${encodeURIComponent(itemId)}`, cambios);
  return data;
}

export async function agregarOpcion(id: string, datos: DatosOpcion): Promise<ListaChequeo> {
  const { data } = await api.post<ListaChequeo>(`${rutaLista(id)}/estados`, datos);
  return data;
}

export async function actualizarOpcion(id: string, estadoId: string, cambios: CambiosOpcion): Promise<ListaChequeo> {
  const { data } = await api.patch<ListaChequeo>(`${rutaLista(id)}/estados/${encodeURIComponent(estadoId)}`, cambios);
  return data;
}
