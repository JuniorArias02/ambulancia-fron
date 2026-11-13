import { api } from '../../../services/api';
import type { ResultadoPaginado } from '../../../types/paginacion.types';
import type {
  DatosActualizarEquipo,
  DatosActualizarLote,
  DatosCrearEquipo,
  DatosCrearLote,
  DatosInsumo,
  DatosMantenimiento,
  DatosRegistroSanitario,
  Equipo,
  EstadoEquipo,
  FiltrosEquipos,
  FiltrosInsumos,
  FiltrosLotes,
  FiltrosRegistros,
  Insumo,
  Lote,
  Mantenimiento,
  RegistroSanitario,
} from '../types/inventario.types';
import { listarTodasLasPaginas } from './paginas';

const id = (valor: string) => encodeURIComponent(valor);

// Insumos

export async function listarInsumos(filtros: FiltrosInsumos): Promise<ResultadoPaginado<Insumo>> {
  const { data } = await api.get<ResultadoPaginado<Insumo>>('/inventario/insumos', { params: filtros });
  return data;
}

/** Catálogo completo de insumos activos, para los selectores. */
export function listarCatalogoInsumos(): Promise<Insumo[]> {
  return listarTodasLasPaginas((pagina, limite) => listarInsumos({ activo: true, pagina, limite }));
}

export async function crearInsumo(datos: DatosInsumo): Promise<Insumo> {
  const { data } = await api.post<Insumo>('/inventario/insumos', datos);
  return data;
}

/** Lo que no se envía no cambia. */
export async function actualizarInsumo(insumoId: string, cambios: Partial<DatosInsumo>): Promise<Insumo> {
  const { data } = await api.patch<Insumo>(`/inventario/insumos/${id(insumoId)}`, cambios);
  return data;
}

/** Nada se borra: se desactiva. */
export async function cambiarEstadoInsumo(insumoId: string, activo: boolean): Promise<Insumo> {
  const { data } = await api.patch<Insumo>(`/inventario/insumos/${id(insumoId)}/estado`, { activo });
  return data;
}

// Registros sanitarios

export async function listarRegistros(filtros: FiltrosRegistros): Promise<ResultadoPaginado<RegistroSanitario>> {
  const { data } = await api.get<ResultadoPaginado<RegistroSanitario>>('/inventario/registros-sanitarios', {
    params: filtros,
  });
  return data;
}

export async function crearRegistro(datos: DatosRegistroSanitario): Promise<RegistroSanitario> {
  const { data } = await api.post<RegistroSanitario>('/inventario/registros-sanitarios', datos);
  return data;
}

export async function actualizarRegistro(
  registroId: string,
  cambios: Partial<Omit<DatosRegistroSanitario, 'insumoId'>>,
): Promise<RegistroSanitario> {
  const { data } = await api.patch<RegistroSanitario>(`/inventario/registros-sanitarios/${id(registroId)}`, cambios);
  return data;
}

// Lotes

export async function listarLotes(filtros: FiltrosLotes): Promise<ResultadoPaginado<Lote>> {
  const { data } = await api.get<ResultadoPaginado<Lote>>('/inventario/lotes', { params: filtros });
  return data;
}

/** Crear un lote no suma existencias: eso lo hace una entrada. */
export async function crearLote(datos: DatosCrearLote): Promise<Lote> {
  const { data } = await api.post<Lote>('/inventario/lotes', datos);
  return data;
}

/** Los cambios de vencimiento quedan auditados. */
export async function actualizarLote(loteId: string, cambios: Partial<DatosActualizarLote>): Promise<Lote> {
  const { data } = await api.patch<Lote>(`/inventario/lotes/${id(loteId)}`, cambios);
  return data;
}

// Equipos

export async function listarEquipos(filtros: FiltrosEquipos): Promise<ResultadoPaginado<Equipo>> {
  const { data } = await api.get<ResultadoPaginado<Equipo>>('/inventario/equipos', { params: filtros });
  return data;
}

export async function crearEquipo(datos: DatosCrearEquipo): Promise<Equipo> {
  const { data } = await api.post<Equipo>('/inventario/equipos', datos);
  return data;
}

export async function actualizarEquipo(equipoId: string, cambios: Partial<DatosActualizarEquipo>): Promise<Equipo> {
  const { data } = await api.patch<Equipo>(`/inventario/equipos/${id(equipoId)}`, cambios);
  return data;
}

/** La baja es definitiva. */
export async function cambiarEstadoEquipo(equipoId: string, estado: EstadoEquipo, motivo: string | null): Promise<Equipo> {
  const { data } = await api.patch<Equipo>(`/inventario/equipos/${id(equipoId)}/estado`, { estado, motivo });
  return data;
}

export async function listarMantenimientos(equipoId: string): Promise<Mantenimiento[]> {
  const { data } = await api.get<Mantenimiento[]>(`/inventario/equipos/${id(equipoId)}/mantenimientos`);
  return data;
}

export async function registrarMantenimiento(
  equipoId: string,
  datos: DatosMantenimiento,
): Promise<{ equipo: Equipo; mantenimiento: Mantenimiento }> {
  const { data } = await api.post<{ equipo: Equipo; mantenimiento: Mantenimiento }>(
    `/inventario/equipos/${id(equipoId)}/mantenimientos`,
    datos,
  );
  return data;
}
