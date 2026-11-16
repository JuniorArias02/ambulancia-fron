import { Ban, CircleCheck, CircleDashed, CircleSlash, Skull, type LucideIcon } from 'lucide-react';
import { ETIQUETAS_DESENLACE, ETIQUETAS_ESTADO_HISTORIA, PRIORIDADES, TRIAGE } from '../constants/catalogos_clinicos';
import type { Desenlace, EstadoHistoria, Triage } from '../types/historia_clinica.types';
import { SinDato } from './valor_o_dato';

const claseEtiqueta = 'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap';

/** Punto con el color clínico exacto, con un aro para que el negro y el amarillo se lean sobre blanco. */
export function PuntoColor({ color, tamano = 'size-2.5' }: { color: string; tamano?: string }) {
  return (
    <span
      aria-hidden
      style={{ backgroundColor: color }}
      className={`${tamano} shrink-0 rounded-full ring-2 ring-white shadow-[0_0_0_1px_rgb(16_27_45/0.12)]`}
    />
  );
}

export function EtiquetaTriage({ triage, completa = false }: { triage: Triage | null; completa?: boolean }) {
  if (!triage) return <SinDato />;
  const { etiqueta, corta, color } = TRIAGE[triage];
  return (
    <span className={`${claseEtiqueta} bg-white/70 text-texto ring-1 ring-borde/80`} title={etiqueta}>
      <PuntoColor color={color} />
      {completa ? etiqueta : corta}
    </span>
  );
}

export function EtiquetaPrioridad({ prioridad }: { prioridad: string | null }) {
  const datos = prioridad ? PRIORIDADES[prioridad] : undefined;
  if (!datos) return <SinDato />;
  return (
    <span className={`${claseEtiqueta} bg-white/70 text-texto ring-1 ring-borde/80`}>
      <PuntoColor color={datos.color} />
      Prioridad {datos.etiqueta.toLowerCase()}
    </span>
  );
}

const ESTILOS_ESTADO: Record<EstadoHistoria, { icono: LucideIcon; clases: string }> = {
  borrador: { icono: CircleDashed, clases: 'bg-primario/10 text-primario' },
  cerrada: { icono: CircleCheck, clases: 'bg-exito/10 text-exito' },
  anulada: { icono: CircleSlash, clases: 'bg-texto-secundario/10 text-texto-secundario line-through' },
};

export function EtiquetaEstadoHistoria({ estado }: { estado: EstadoHistoria }) {
  const { icono: Icono, clases } = ESTILOS_ESTADO[estado];
  return (
    <span className={`${claseEtiqueta} ${clases}`}>
      <Icono aria-hidden strokeWidth={2} className="size-3.5" />
      {ETIQUETAS_ESTADO_HISTORIA[estado]}
    </span>
  );
}

export function EtiquetaDesenlace({ desenlace }: { desenlace: Desenlace | null }) {
  if (!desenlace) return <SinDato />;
  if (desenlace === 'rechazo_traslado') {
    return (
      <span className={`${claseEtiqueta} bg-critico/10 text-critico`}>
        <Ban aria-hidden strokeWidth={2} className="size-3.5" />
        {ETIQUETAS_DESENLACE[desenlace]}
      </span>
    );
  }
  if (desenlace === 'fallecido_en_sitio') {
    return (
      <span className={`${claseEtiqueta} bg-texto/8 text-texto`}>
        <Skull aria-hidden strokeWidth={2} className="size-3.5" />
        {ETIQUETAS_DESENLACE[desenlace]}
      </span>
    );
  }
  return <span className="text-sm text-texto">{ETIQUETAS_DESENLACE[desenlace]}</span>;
}
