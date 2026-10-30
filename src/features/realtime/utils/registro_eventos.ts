import type { EventoTiempoReal } from '../types/tiempo_real.types';

/** Ids recordados para descartar repetidos; los más viejos se olvidan. */
const CAPACIDAD_IDS = 1_000;

/**
 * Recurso al que se refiere un aviso. La posición GPS tiene su propia secuencia para que las
 * lecturas frecuentes no oculten un cambio de estado de la misma ambulancia.
 */
export function recursoDelEvento(evento: EventoTiempoReal): string {
  switch (evento.tipo) {
    case 'emergencia.creada':
    case 'emergencia.actualizada':
      return `emergencia:${evento.datos.emergencia.id}`;
    case 'emergencia.posible_duplicado':
      return `duplicados:${evento.datos.emergenciaId}`;
    case 'asignacion.creada':
    case 'asignacion.actualizada':
      return `asignacion:${evento.datos.asignacion.id}`;
    case 'ambulancia.actualizada':
      return `ambulancia:${evento.datos.ambulancia.id}`;
    case 'ambulancia.ubicacion_actualizada':
      return `ubicacion:${evento.datos.ambulanciaId}`;
    case 'turno.actualizado':
      return `turno:${evento.datos.turno.id}`;
    case 'asignacion.ruta_actualizada':
      return `ruta:${evento.datos.ruta.asignacionId}`;
  }
}

export interface RegistroEventos {
  /** `false` si el aviso está repetido o es más viejo que el último aplicado al mismo recurso. */
  aceptar: (evento: EventoTiempoReal) => boolean;
}

export function crearRegistroEventos(capacidad = CAPACIDAD_IDS): RegistroEventos {
  const vistos = new Set<string>();
  const ultimoPorRecurso = new Map<string, number>();

  return {
    aceptar: (evento) => {
      if (vistos.has(evento.id)) return false;

      const recurso = recursoDelEvento(evento);
      const ocurrido = Date.parse(evento.ocurridoEn);
      const ultimo = ultimoPorRecurso.get(recurso);
      if (ultimo !== undefined && ocurrido < ultimo) return false;

      vistos.add(evento.id);
      if (vistos.size > capacidad) {
        const masViejo = vistos.values().next().value;
        if (masViejo !== undefined) vistos.delete(masViejo);
      }
      ultimoPorRecurso.set(recurso, ocurrido);
      return true;
    },
  };
}
