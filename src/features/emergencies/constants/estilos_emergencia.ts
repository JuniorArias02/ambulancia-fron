import {
  Ambulance,
  ChevronDown,
  ChevronsUp,
  ChevronUp,
  CircleCheck,
  CircleDashed,
  CircleSlash,
  HeartPulse,
  PhoneIncoming,
  type LucideIcon,
} from 'lucide-react';
import type { EstadoEmergencia, PrioridadEmergencia } from '../types/emergencia.types';

interface EstiloPrioridad {
  icono: LucideIcon;
  /** Tinte suave para insignias. */
  clases: string;
  /** Franja lateral que resalta la fila en el tablero. */
  franja: string;
  /** Color literal para el marcador del mapa. */
  colorMapa: string;
}

/** La prioridad nunca depende solo del color: siempre va con icono y texto. */
export const ESTILOS_PRIORIDAD: Record<PrioridadEmergencia, EstiloPrioridad> = {
  roja: { icono: ChevronsUp, clases: 'bg-critico/10 text-critico', franja: 'bg-critico', colorMapa: '#dc2626' },
  amarilla: {
    icono: ChevronUp,
    clases: 'bg-advertencia/12 text-advertencia-hover',
    franja: 'bg-advertencia',
    colorMapa: '#d97706',
  },
  verde: { icono: ChevronDown, clases: 'bg-exito/10 text-exito', franja: 'bg-exito', colorMapa: '#16a34a' },
};

export const ESTILO_SIN_PRIORIDAD: EstiloPrioridad = {
  icono: CircleDashed,
  clases: 'bg-texto-secundario/10 text-texto-secundario',
  franja: 'bg-borde',
  colorMapa: '#64748b',
};

export const ESTILOS_ESTADO_EMERGENCIA: Record<EstadoEmergencia, { icono: LucideIcon; clases: string }> = {
  recibida: { icono: PhoneIncoming, clases: 'bg-primario/10 text-primario' },
  despachada: { icono: Ambulance, clases: 'bg-cian/12 text-cian-texto' },
  en_atencion: { icono: HeartPulse, clases: 'bg-institucional/8 text-institucional' },
  cerrada: { icono: CircleCheck, clases: 'bg-texto-secundario/10 text-texto-secundario' },
  cancelada: { icono: CircleSlash, clases: 'bg-texto-secundario/10 text-texto-secundario' },
};
