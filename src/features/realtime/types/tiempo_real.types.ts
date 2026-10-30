import type { Ruta } from '../../assignments/schemas/ruta.schema';
import type { PrioridadEmergencia } from '../../emergencies/types/emergencia.types';

/** `desactivado`: no hay servidor configurado y la interfaz consulta periódicamente. */
export type EstadoConexion = 'desactivado' | 'conectando' | 'en_linea' | 'reconectando' | 'sin_conexion';

export interface UbicacionTiempoReal {
  ambulanciaId: string;
  asignacionId: string | null;
  latitud: number;
  longitud: number;
  velocidad: number | null;
  registradaEn: string;
}

/** Solo lo que la web usa de cada aviso; el resto se vuelve a pedir al REST. */
export type EventoTiempoReal = { id: string; ocurridoEn: string } & (
  | {
      tipo: 'emergencia.creada' | 'emergencia.actualizada';
      datos: {
        emergencia: {
          id: string;
          numeroEmergencia: string;
          prioridad: PrioridadEmergencia | null;
          recibidaPor: { id: string } | null;
        };
      };
    }
  | {
      tipo: 'emergencia.posible_duplicado';
      datos: { emergenciaId: string; numeroEmergencia: string; posibles: unknown[] };
    }
  | {
      tipo: 'asignacion.creada' | 'asignacion.actualizada';
      datos: {
        asignacion: {
          id: string;
          emergenciaId: string;
          ambulanciaId: string;
          estado?: string;
          ambulanciaCodigo?: string | null;
          numeroEmergencia?: string | null;
        };
      };
    }
  | { tipo: 'ambulancia.actualizada'; datos: { ambulancia: { id: string } } }
  | { tipo: 'ambulancia.ubicacion_actualizada'; datos: UbicacionTiempoReal }
  | { tipo: 'turno.actualizado'; datos: { turno: { id: string; ambulanciaId: string } } }
  | { tipo: 'asignacion.ruta_actualizada'; datos: { ruta: Ruta } }
);

export type TipoEvento = EventoTiempoReal['tipo'];
