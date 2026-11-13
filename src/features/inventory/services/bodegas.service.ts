import { api } from '../../../services/api';
import type { ResultadoPaginado } from '../../../types/paginacion.types';
import type {
  Bodega,
  ControlAlmacenamiento,
  DatosBodega,
  DatosControlAlmacenamiento,
  FiltrosBodegas,
  FiltrosControles,
  TipoUbicacion,
  UbicacionInventario,
} from '../types/inventario.types';

const id = (valor: string) => encodeURIComponent(valor);

export async function listarBodegas(filtros: FiltrosBodegas): Promise<ResultadoPaginado<Bodega>> {
  const { data } = await api.get<ResultadoPaginado<Bodega>>('/inventario/bodegas', { params: filtros });
  return data;
}

/** Crea también su ubicación de inventario. */
export async function crearBodega(datos: DatosBodega): Promise<Bodega> {
  const { data } = await api.post<Bodega>('/inventario/bodegas', datos);
  return data;
}

export async function actualizarBodega(bodegaId: string, cambios: Partial<DatosBodega>): Promise<Bodega> {
  const { data } = await api.patch<Bodega>(`/inventario/bodegas/${id(bodegaId)}`, cambios);
  return data;
}

/** Una bodega inactiva no recibe ni entrega movimientos. */
export async function cambiarEstadoBodega(bodegaId: string, activo: boolean): Promise<Bodega> {
  const { data } = await api.patch<Bodega>(`/inventario/bodegas/${id(bodegaId)}/estado`, { activo });
  return data;
}

/** Todas las ubicaciones (sin paginar), para los selectores de origen y destino. */
export async function listarUbicaciones(tipo?: TipoUbicacion): Promise<UbicacionInventario[]> {
  const { data } = await api.get<UbicacionInventario[]>('/inventario/ubicaciones', { params: { tipo } });
  return data;
}

/** Responde 201 si la crea y 200 si ya existía. */
export async function habilitarAmbulancia(ambulanciaId: string): Promise<UbicacionInventario> {
  const { data } = await api.post<UbicacionInventario>('/inventario/ubicaciones/ambulancias', { ambulanciaId });
  return data;
}

/** Solo para ubicaciones de ambulancia; las bodegas se activan desde la bodega. */
export async function cambiarEstadoUbicacion(ubicacionId: string, activa: boolean): Promise<UbicacionInventario> {
  const { data } = await api.patch<UbicacionInventario>(`/inventario/ubicaciones/${id(ubicacionId)}/estado`, { activa });
  return data;
}

export async function listarControles(filtros: FiltrosControles): Promise<ResultadoPaginado<ControlAlmacenamiento>> {
  const { data } = await api.get<ResultadoPaginado<ControlAlmacenamiento>>('/inventario/controles-almacenamiento', {
    params: filtros,
  });
  return data;
}

export async function registrarControl(datos: DatosControlAlmacenamiento): Promise<ControlAlmacenamiento> {
  const { data } = await api.post<ControlAlmacenamiento>('/inventario/controles-almacenamiento', datos);
  return data;
}
