import { Ban, CircleCheck, History, type LucideIcon } from 'lucide-react';
import type { EstadoFirma } from '../types/firma.types';

export const LONGITUD_MINIMA_MOTIVO_FIRMA = 5;
export const LONGITUD_MAXIMA_MOTIVO_FIRMA = 255;

export const ESTILOS_ESTADO_FIRMA: Record<EstadoFirma, { etiqueta: string; icono: LucideIcon; clases: string }> = {
  vigente: { etiqueta: 'Vigente', icono: CircleCheck, clases: 'bg-exito/10 text-exito' },
  reemplazada: { etiqueta: 'Reemplazada', icono: History, clases: 'bg-texto-secundario/10 text-texto-secundario' },
  desactivada: { etiqueta: 'Desactivada', icono: Ban, clases: 'bg-critico/10 text-critico' },
};
