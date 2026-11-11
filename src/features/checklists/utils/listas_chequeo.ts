import type { FormularioCrearLista } from '../schemas/lista_chequeo.schema';
import type { DatosCrearLista, OpcionLista } from '../types/lista_chequeo.types';

/** El orden de los formularios es el de la pantalla; el backend lo toma como `orden`. */
export function aDatosCrearLista({ nombre, descripcion, items, estados }: FormularioCrearLista): DatosCrearLista {
  return {
    nombre,
    ...(descripcion ? { descripcion } : {}),
    items: items.map(({ pregunta, obligatorio, permiteObservacion }) => ({ pregunta, obligatorio, permiteObservacion })),
    estados: estados.map(({ nombre: nombreOpcion, valor }) => ({
      nombre: nombreOpcion,
      ...(valor === null ? {} : { valor }),
    })),
  };
}

/** Separa activos e inactivos, cada grupo según su `orden`. */
export function separarPorActividad<T extends { activo: boolean; orden: number }>(elementos: readonly T[]) {
  const ordenados = [...elementos].sort((a, b) => a.orden - b.orden);
  return {
    activos: ordenados.filter((elemento) => elemento.activo),
    inactivos: ordenados.filter((elemento) => !elemento.activo),
  };
}

/**
 * Nuevo orden de ids tras mover un elemento activo `desplazamiento` posiciones.
 * Los inactivos quedan al final, en su orden actual.
 */
export function moverElemento(
  activos: readonly { id: string }[],
  inactivos: readonly { id: string }[],
  indice: number,
  desplazamiento: -1 | 1,
): string[] | null {
  const destino = indice + desplazamiento;
  const ids = activos.map(({ id }) => id);
  const origen = ids[indice];
  const vecino = ids[destino];
  if (origen === undefined || vecino === undefined) return null;
  ids[indice] = vecino;
  ids[destino] = origen;
  return [...ids, ...inactivos.map(({ id }) => id)];
}

/**
 * La mejor calificación: la de mayor puntaje entre las activas. Sin puntajes, la primera
 * según el orden. Puede no haberla si ninguna está activa.
 */
export function mejorOpcion(opciones: readonly OpcionLista[]): OpcionLista | undefined {
  const { activos } = separarPorActividad(opciones);
  const conValor = activos.filter((opcion) => opcion.valor !== null);
  if (conValor.length === 0) return activos[0];
  return conValor.reduce((mejor, opcion) => ((opcion.valor ?? 0) > (mejor.valor ?? 0) ? opcion : mejor));
}
