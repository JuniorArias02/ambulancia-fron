import { Ban, CircleCheck, CircleSlash, type LucideIcon } from 'lucide-react';
import { ETIQUETAS_ESTADO } from '../constants/estados_usuario';
import type { EstadoUsuario } from '../types/usuario.types';

const ESTILOS_ESTADO: Record<EstadoUsuario, { icono: LucideIcon; clases: string }> = {
  activo: { icono: CircleCheck, clases: 'bg-exito/10 text-exito' },
  inactivo: { icono: CircleSlash, clases: 'bg-texto-secundario/10 text-texto-secundario' },
  bloqueado: { icono: Ban, clases: 'bg-critico/8 text-critico' },
};

export function InsigniaEstadoUsuario({ estado }: { estado: EstadoUsuario }) {
  const { icono: Icono, clases } = ESTILOS_ESTADO[estado];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap ${clases}`}
    >
      <Icono aria-hidden strokeWidth={2} className="size-3.5" />
      {ETIQUETAS_ESTADO[estado]}
    </span>
  );
}
