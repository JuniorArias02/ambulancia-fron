import { CircleCheck, PowerOff, Siren, Wrench, type LucideIcon } from 'lucide-react';
import type { EstadoOperativo } from '../types/ambulancia.types';

interface EstiloEstado {
  icono: LucideIcon;
  /** Tinte suave para insignias. */
  clases: string;
  /** Color del texto o del icono sin fondo. */
  color: string;
}

/** El estado nunca depende solo del color: siempre va con icono y texto. */
export const ESTILOS_ESTADO_OPERATIVO: Record<EstadoOperativo, EstiloEstado> = {
  disponible: { icono: CircleCheck, clases: 'bg-exito/10 text-exito', color: 'text-exito' },
  en_servicio: { icono: Siren, clases: 'bg-primario/10 text-primario', color: 'text-primario' },
  fuera_servicio: {
    icono: PowerOff,
    clases: 'bg-texto-secundario/10 text-texto-secundario',
    color: 'text-texto-secundario',
  },
  mantenimiento: { icono: Wrench, clases: 'bg-advertencia/10 text-advertencia', color: 'text-advertencia' },
};
