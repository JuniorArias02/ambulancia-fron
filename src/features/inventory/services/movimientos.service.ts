import { api } from '../../../services/api';
import type { ResultadoPaginado } from '../../../types/paginacion.types';
import type {
  Alertas,
  DatosMovimiento,
  Dotacion,
  Existencia,
  FiltrosExistencias,
  FiltrosMovimientos,
  Movimiento,
} from '../types/inventario.types';
import { listarTodasLasPaginas } from './paginas';

const id = (valor: string) => encodeURIComponent(valor);

export async function listarMovimientos(filtros: FiltrosMovimientos): Promise<ResultadoPaginado<Movimiento>> {
  const { data } = await api.get<ResultadoPaginado<Movimiento>>('/inventario/movimientos', { params: filtros });
  return data;
}

export async function obtenerMovimiento(movimientoId: string): Promise<Movimiento> {
  const { data } = await api.get<Movimiento>(`/inventario/movimientos/${id(movimientoId)}`);
  return data;
}

/** Con `confirmar: true` aplica las existencias de inmediato; si no, queda en borrador. */
export async function registrarMovimiento(datos: DatosMovimiento): Promise<Movimiento> {
  const { data } = await api.post<Movimiento>('/inventario/movimientos', datos);
  return data;
}

/** Todo o nada: si no alcanza una existencia responde 409 y no aplica ninguna línea. */
export async function confirmarMovimiento(movimientoId: string): Promise<Movimiento> {
  const { data } = await api.post<Movimiento>(`/inventario/movimientos/${id(movimientoId)}/confirmar`);
  return data;
}

export async function anularMovimiento(movimientoId: string, motivo: string): Promise<Movimiento> {
  const { data } = await api.post<Movimiento>(`/inventario/movimientos/${id(movimientoId)}/anular`, { motivo });
  return data;
}

export async function listarExistencias(filtros: FiltrosExistencias): Promise<ResultadoPaginado<Existencia>> {
  const { data } = await api.get<ResultadoPaginado<Existencia>>('/inventario/existencias', { params: filtros });
  return data;
}

/** Todo lo que hay en una ubicación, para elegir qué sale de ella. */
export function listarExistenciasDeUbicacion(ubicacionId: string): Promise<Existencia[]> {
  return listarTodasLasPaginas((pagina, limite) => listarExistencias({ ubicacionId, pagina, limite }));
}

export async function obtenerDotacion(ambulanciaId: string): Promise<Dotacion> {
  const { data } = await api.get<Dotacion>(`/inventario/ambulancias/${id(ambulanciaId)}/dotacion`);
  return data;
}

/** `dias` de 0 a 365; incluye lo que ya venció. */
export async function obtenerAlertas(dias: number): Promise<Alertas> {
  const { data } = await api.get<Alertas>('/inventario/alertas', { params: { dias } });
  return data;
}
