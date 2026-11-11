import { BadgeCheck, CircleX, Hourglass, RotateCcw, ScanSearch, type LucideIcon } from 'lucide-react';
import type { EstadoVerificacion } from '../types/verificacion.types';

/** Cada estado lleva icono además de color, para no depender solo del tono. */
export const ESTILOS_ESTADO_VERIFICACION: Record<EstadoVerificacion, { icono: LucideIcon; clases: string }> = {
  pendiente: { icono: Hourglass, clases: 'bg-texto-secundario/10 text-texto-secundario' },
  en_revision: { icono: ScanSearch, clases: 'bg-primario/10 text-primario' },
  requiere_correccion: { icono: RotateCcw, clases: 'bg-advertencia/12 text-advertencia-hover' },
  verificado: { icono: BadgeCheck, clases: 'bg-exito/10 text-exito' },
  rechazado: { icono: CircleX, clases: 'bg-critico/8 text-critico' },
};
