import type { ResultadoPaginado } from '../../../types/paginacion.types';
import { LIMITE_MAXIMO } from '../constants/catalogos_inventario';

/** Recorre todas las páginas de un listado (para selectores que necesitan el catálogo completo). */
export async function listarTodasLasPaginas<T>(
  listar: (pagina: number, limite: number) => Promise<ResultadoPaginado<T>>,
): Promise<T[]> {
  const primera = await listar(1, LIMITE_MAXIMO);
  const paginas = Math.ceil(primera.total / LIMITE_MAXIMO);
  if (paginas <= 1) return primera.datos;
  const resto = await Promise.all(Array.from({ length: paginas - 1 }, (_, indice) => listar(indice + 2, LIMITE_MAXIMO)));
  return [primera, ...resto].flatMap((pagina) => pagina.datos);
}
