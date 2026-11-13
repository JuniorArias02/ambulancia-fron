import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { TONOS, type Tono } from '../constants/estilos_inventario';

interface PropiedadesInsignia {
  tono: Tono;
  icono?: LucideIcon;
  children: ReactNode;
}

export function Insignia({ tono, icono: Icono, children }: PropiedadesInsignia) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap ${TONOS[tono]}`}
    >
      {Icono && <Icono aria-hidden strokeWidth={2} className="size-3.5" />}
      {children}
    </span>
  );
}
