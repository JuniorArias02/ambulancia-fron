import { DESCRIPCIONES_PRIORIDAD, ETIQUETAS_ESTADO_EMERGENCIA, ETIQUETAS_PRIORIDAD } from '../constants/catalogos_emergencia';
import { ESTILO_SIN_PRIORIDAD, ESTILOS_ESTADO_EMERGENCIA, ESTILOS_PRIORIDAD } from '../constants/estilos_emergencia';
import type { EstadoEmergencia, PrioridadEmergencia } from '../types/emergencia.types';

const claseInsignia =
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap';

interface PropiedadesInsigniaPrioridad {
  prioridad: PrioridadEmergencia | null;
  /** Añade "crítica", "urgente"… al nombre del color. */
  detallada?: boolean;
}

export function InsigniaPrioridad({ prioridad, detallada = false }: PropiedadesInsigniaPrioridad) {
  const { icono: Icono, clases } = prioridad ? ESTILOS_PRIORIDAD[prioridad] : ESTILO_SIN_PRIORIDAD;
  return (
    <span className={`${claseInsignia} ${clases}`}>
      <Icono aria-hidden strokeWidth={2.25} className="size-3.5" />
      {prioridad ? (
        <>
          <span className="sr-only">Prioridad </span>
          {ETIQUETAS_PRIORIDAD[prioridad]}
          {detallada && <span className="font-normal opacity-80">· {DESCRIPCIONES_PRIORIDAD[prioridad]}</span>}
        </>
      ) : (
        'Sin clasificar'
      )}
    </span>
  );
}

export function InsigniaEstadoEmergencia({ estado }: { estado: EstadoEmergencia }) {
  const { icono: Icono, clases } = ESTILOS_ESTADO_EMERGENCIA[estado];
  return (
    <span className={`${claseInsignia} ${clases}`}>
      <Icono aria-hidden strokeWidth={2} className="size-3.5" />
      {ETIQUETAS_ESTADO_EMERGENCIA[estado]}
    </span>
  );
}
