import { BadgeCheck, LocateFixed, MousePointerClick } from 'lucide-react';
import {
  DESCRIPCIONES_PRIORIDAD,
  ETIQUETAS_ORIGEN_UBICACION,
  ETIQUETAS_ESTADO_EMERGENCIA,
  ETIQUETAS_PRIORIDAD,
} from '../constants/catalogos_emergencia';
import { ESTILO_SIN_PRIORIDAD, ESTILOS_ESTADO_EMERGENCIA, ESTILOS_PRIORIDAD } from '../constants/estilos_emergencia';
import type { EstadoEmergencia, OrigenUbicacion, PrioridadEmergencia } from '../types/emergencia.types';

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

/** Reporte enviado desde la app por un ciudadano con la identidad aprobada. */
export function InsigniaReporteCiudadano({ compacta = false }: { compacta?: boolean }) {
  return (
    <span
      title={compacta ? 'Reportado por ciudadano verificado' : undefined}
      className={`${claseInsignia} bg-cian/12 text-cian-texto`}
    >
      <BadgeCheck aria-hidden strokeWidth={2} className="size-3.5" />
      {compacta ? 'Ciudadano' : 'Reportado por ciudadano verificado'}
    </span>
  );
}

/** Cómo se obtuvo el punto de un reporte ciudadano: GPS del celular o marcado en el mapa. */
export function OrigenUbicacionReporte({ origen }: { origen: OrigenUbicacion }) {
  const Icono = origen === 'gps' ? LocateFixed : MousePointerClick;
  return (
    <span className="inline-flex items-center gap-1.5 text-[13px] text-texto-secundario">
      <Icono aria-hidden strokeWidth={1.75} className="size-3.5 shrink-0" />
      {ETIQUETAS_ORIGEN_UBICACION[origen]}
    </span>
  );
}
