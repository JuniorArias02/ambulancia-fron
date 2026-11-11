import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLAVES_LISTAS_CHEQUEO } from '../constants/listas_chequeo';
import {
  actualizarListaChequeo,
  actualizarOpcion,
  actualizarPregunta,
  agregarOpcion,
  agregarPregunta,
  cambiarEstadoListaChequeo,
  crearListaChequeo,
} from '../services/listas_chequeo.service';
import type {
  CambiosOpcion,
  CambiosPregunta,
  DatosActualizarLista,
  DatosCrearLista,
  DatosOpcion,
  DatosPregunta,
  ListaChequeo,
  PreguntaLista,
} from '../types/lista_chequeo.types';

/** Toda mutación responde la lista completa: reemplaza el detalle y refresca la tabla. */
function useGuardarLista() {
  const clienteConsultas = useQueryClient();
  return (lista: ListaChequeo) => {
    clienteConsultas.setQueryData(CLAVES_LISTAS_CHEQUEO.detalle(lista.id), lista);
    void clienteConsultas.invalidateQueries({ queryKey: CLAVES_LISTAS_CHEQUEO.listas });
  };
}

export function useCrearListaChequeo() {
  const guardar = useGuardarLista();
  return useMutation({ mutationFn: (datos: DatosCrearLista) => crearListaChequeo(datos), onSuccess: guardar });
}

export function useActualizarListaChequeo(id: string) {
  const guardar = useGuardarLista();
  return useMutation({
    mutationFn: (datos: DatosActualizarLista) => actualizarListaChequeo(id, datos),
    onSuccess: guardar,
  });
}

export function useCambiarEstadoListaChequeo() {
  const clienteConsultas = useQueryClient();
  return useMutation({
    mutationFn: ({ id, activa }: { id: string; activa: boolean }) => cambiarEstadoListaChequeo(id, activa),
    onSuccess: (lista) => {
      clienteConsultas.setQueryData(CLAVES_LISTAS_CHEQUEO.detalle(lista.id), lista);
      // Activar una lista desactiva otra: se refrescan todas las que estén en caché.
      void clienteConsultas.invalidateQueries({ queryKey: ['listas-chequeo'] });
    },
  });
}

export type OperacionPregunta =
  | { tipo: 'agregar'; datos: DatosPregunta }
  | { tipo: 'actualizar'; itemId: string; cambios: CambiosPregunta };

export function useMutarPregunta(id: string) {
  const guardar = useGuardarLista();
  return useMutation({
    mutationFn: (operacion: OperacionPregunta) =>
      operacion.tipo === 'agregar'
        ? agregarPregunta(id, operacion.datos)
        : actualizarPregunta(id, operacion.itemId, operacion.cambios),
    onSuccess: guardar,
  });
}

export type OperacionOpcion =
  | { tipo: 'agregar'; datos: DatosOpcion }
  | { tipo: 'actualizar'; estadoId: string; cambios: CambiosOpcion };

export function useMutarOpcion(id: string) {
  const guardar = useGuardarLista();
  return useMutation({
    mutationFn: (operacion: OperacionOpcion) =>
      operacion.tipo === 'agregar'
        ? agregarOpcion(id, operacion.datos)
        : actualizarOpcion(id, operacion.estadoId, operacion.cambios),
    onSuccess: guardar,
  });
}

/**
 * Cambia el texto de una pregunta ya respondida, que el backend no permite editar (409):
 * desactiva la original y crea una nueva en su lugar, con la misma configuración.
 */
export function useReemplazarPregunta(id: string) {
  const guardar = useGuardarLista();
  const clienteConsultas = useQueryClient();
  return useMutation({
    mutationFn: async ({ original, pregunta }: { original: PreguntaLista; pregunta: string }) => {
      await actualizarPregunta(id, original.id, { activo: false });
      return agregarPregunta(id, {
        pregunta,
        orden: original.orden,
        obligatorio: original.obligatorio,
        permiteObservacion: original.permiteObservacion,
      });
    },
    onSuccess: guardar,
    // Si falla la creación, la original pudo quedar desactivada: se recarga para mostrarlo.
    onError: () => void clienteConsultas.invalidateQueries({ queryKey: CLAVES_LISTAS_CHEQUEO.detalle(id) }),
  });
}

/**
 * Guarda un nuevo orden (lista de ids). Solo se actualizan los elementos que cambian de posición;
 * la última respuesta trae la lista definitiva.
 */
export function useReordenar(id: string, tipo: 'preguntas' | 'opciones') {
  const guardar = useGuardarLista();
  return useMutation({
    mutationFn: async ({ actuales, ids }: { actuales: readonly { id: string; orden: number }[]; ids: string[] }) => {
      let ultima: ListaChequeo | null = null;
      for (const [orden, elementoId] of ids.entries()) {
        if (actuales.find((elemento) => elemento.id === elementoId)?.orden === orden) continue;
        ultima =
          tipo === 'preguntas'
            ? await actualizarPregunta(id, elementoId, { orden })
            : await actualizarOpcion(id, elementoId, { orden });
      }
      return ultima;
    },
    onSuccess: (lista) => {
      if (lista) guardar(lista);
    },
  });
}
