import type { QueryClient } from '@tanstack/react-query';
import type { Notificacion } from '../../../providers/contexto_notificaciones';
import type { ResultadoPaginado } from '../../../types/paginacion.types';
import { CLAVES_AMBULANCIAS } from '../../ambulances/constants/ambulancias';
import type { Ambulancia, UbicacionAmbulancia } from '../../ambulances/types/ambulancia.types';
import { CLAVES_ASIGNACIONES } from '../../assignments/constants/asignaciones';
import type { Ruta } from '../../assignments/schemas/ruta.schema';
import type { PuntoRecorrido } from '../../assignments/types/asignacion.types';
import { ETIQUETAS_PRIORIDAD } from '../../emergencies/constants/catalogos_emergencia';
import { CLAVES_EMERGENCIAS } from '../../emergencies/constants/emergencias';
import { CLAVES_TURNOS } from '../../shifts/constants/turnos';
import type { EventoTiempoReal, UbicacionTiempoReal } from '../types/tiempo_real.types';
import type { ColaInvalidaciones } from './cola_invalidaciones';

export interface ContextoAplicacion {
  clienteConsultas: QueryClient;
  cola: ColaInvalidaciones;
  notificar: (notificacion: Omit<Notificacion, 'id'>) => void;
  usuarioId: string;
}

/** Una lectura más vieja que la que ya se muestra no reemplaza la posición. */
function ubicacionMasReciente(actual: UbicacionAmbulancia | null, nueva: UbicacionTiempoReal): UbicacionAmbulancia | null {
  if (actual && Date.parse(actual.registradaEn) >= Date.parse(nueva.registradaEn)) return actual;
  return { latitud: nueva.latitud, longitud: nueva.longitud, registradaEn: nueva.registradaEn };
}

/**
 * El GPS llega hasta cada 3 s por ambulancia: se actualiza la posición en la caché en lugar de
 * recargar listados enteros. El recorrido del servicio crece con el nuevo punto.
 */
function aplicarUbicacion(clienteConsultas: QueryClient, ubicacion: UbicacionTiempoReal, idEvento: string): void {
  const conPosicion = (ambulancia: Ambulancia): Ambulancia => {
    const ultimaUbicacion = ubicacionMasReciente(ambulancia.ultimaUbicacion, ubicacion);
    return ultimaUbicacion === ambulancia.ultimaUbicacion ? ambulancia : { ...ambulancia, ultimaUbicacion };
  };

  clienteConsultas.setQueriesData<ResultadoPaginado<Ambulancia>>({ queryKey: CLAVES_AMBULANCIAS.listas }, (lista) =>
    lista
      ? {
          ...lista,
          datos: lista.datos.map((ambulancia) =>
            ambulancia.id === ubicacion.ambulanciaId ? conPosicion(ambulancia) : ambulancia,
          ),
        }
      : lista,
  );
  clienteConsultas.setQueryData<Ambulancia>(CLAVES_AMBULANCIAS.detalle(ubicacion.ambulanciaId), (ambulancia) =>
    ambulancia ? conPosicion(ambulancia) : ambulancia,
  );

  const { asignacionId } = ubicacion;
  if (asignacionId) {
    clienteConsultas.setQueryData<PuntoRecorrido[]>(CLAVES_ASIGNACIONES.recorrido(asignacionId), (puntos) => {
      if (!puntos) return puntos;
      const ultimo = puntos.at(-1);
      if (ultimo && Date.parse(ultimo.registradaEn) >= Date.parse(ubicacion.registradaEn)) return puntos;
      return [...puntos, { id: idEvento, ...ubicacion }];
    });
  }
}

/**
 * Una ruta nueva (despacho, primer GPS o desvío) reemplaza la línea de ese servicio.
 * Solo se toca la caché si el mapa ya la tiene; una ruta más vieja que la mostrada se ignora.
 */
function aplicarRuta(clienteConsultas: QueryClient, ruta: Ruta): void {
  clienteConsultas.setQueryData<Ruta[]>(CLAVES_ASIGNACIONES.rutasActivas, (rutas) => {
    if (!rutas) return rutas;
    const actual = rutas.find(({ asignacionId }) => asignacionId === ruta.asignacionId);
    if (actual && Date.parse(actual.calculadaEn) >= Date.parse(ruta.calculadaEn)) return rutas;
    return [...rutas.filter(({ asignacionId }) => asignacionId !== ruta.asignacionId), ruta];
  });
  // También la del mapa del servicio, si está abierto.
  clienteConsultas.setQueryData<Ruta | null>(CLAVES_ASIGNACIONES.ruta(ruta.asignacionId), (actual) =>
    actual === undefined || (actual && Date.parse(actual.calculadaEn) >= Date.parse(ruta.calculadaEn)) ? actual : ruta,
  );
}

const formatoHora = new Intl.DateTimeFormat('es-CO', { timeStyle: 'short' });

/** La llegada y la recogida del paciente se avisan a la central: son los momentos que más importan. */
function avisarEtapa(
  asignacion: { estado?: string; ambulanciaCodigo?: string | null; numeroEmergencia?: string | null },
  ocurridoEn: string,
  notificar: ContextoAplicacion['notificar'],
): void {
  const ambulancia = asignacion.ambulanciaCodigo ?? 'La ambulancia';
  const emergencia = asignacion.numeroEmergencia ?? 'la emergencia';
  const hora = formatoHora.format(new Date(ocurridoEn));
  if (asignacion.estado === 'trasladando') {
    notificar({
      tono: 'informacion',
      titulo: 'Paciente a bordo',
      descripcion: `${ambulancia} recogió al paciente de ${emergencia} · ${hora}`,
    });
  } else if (asignacion.estado === 'en_escena') {
    notificar({ tono: 'informacion', titulo: `${ambulancia} llegó a la escena`, descripcion: `${emergencia} · ${hora}` });
  }
}

/** Traduce un aviso en las consultas afectadas. Los datos definitivos siempre vienen del REST. */
export function aplicarEvento(evento: EventoTiempoReal, { clienteConsultas, cola, notificar, usuarioId }: ContextoAplicacion): void {
  switch (evento.tipo) {
    case 'emergencia.creada':
    case 'emergencia.actualizada': {
      const { emergencia } = evento.datos;
      cola.agregar(CLAVES_EMERGENCIAS.listas);
      cola.agregar(CLAVES_EMERGENCIAS.detalle(emergencia.id));
      // Un cambio de estado puede sacar o meter emergencias en las sugerencias de duplicados.
      cola.agregar(CLAVES_EMERGENCIAS.todasDuplicadas);
      // Quien la registró ya vio su propia confirmación.
      if (evento.tipo === 'emergencia.creada' && emergencia.recibidaPor?.id !== usuarioId) {
        notificar({
          tono: 'informacion',
          titulo: 'Nueva emergencia',
          descripcion: emergencia.prioridad
            ? `${emergencia.numeroEmergencia} · prioridad ${ETIQUETAS_PRIORIDAD[emergencia.prioridad].toLowerCase()}`
            : emergencia.numeroEmergencia,
        });
      }
      return;
    }
    case 'emergencia.posible_duplicado': {
      const { emergenciaId, numeroEmergencia, posibles } = evento.datos;
      cola.agregar(CLAVES_EMERGENCIAS.duplicadas(emergenciaId));
      notificar({
        tono: 'informacion',
        titulo: 'Posible llamada repetida',
        descripcion: `${numeroEmergencia} coincide con ${posibles.length} ${
          posibles.length === 1 ? 'emergencia activa' : 'emergencias activas'
        }. Revísala en su detalle.`,
      });
      return;
    }
    case 'asignacion.creada':
    case 'asignacion.actualizada': {
      // Incluye las listas, la ruta y la bitácora del servicio.
      cola.agregar(CLAVES_ASIGNACIONES.todas);
      if (evento.tipo === 'asignacion.actualizada') avisarEtapa(evento.datos.asignacion, evento.ocurridoEn, notificar);
      return;
    }
    case 'ambulancia.actualizada': {
      const { id } = evento.datos.ambulancia;
      cola.agregar(CLAVES_AMBULANCIAS.listas);
      cola.agregar(CLAVES_AMBULANCIAS.detalle(id));
      cola.agregar(CLAVES_AMBULANCIAS.historial(id));
      return;
    }
    case 'ambulancia.ubicacion_actualizada':
      aplicarUbicacion(clienteConsultas, evento.datos, evento.id);
      return;
    case 'turno.actualizado':
      cola.agregar(CLAVES_TURNOS.todos);
      return;
    case 'asignacion.ruta_actualizada':
      aplicarRuta(clienteConsultas, evento.datos.ruta);
      return;
  }
}
