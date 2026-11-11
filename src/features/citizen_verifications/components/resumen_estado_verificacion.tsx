import { BadgeCheck, CircleX, Hourglass, Info, RotateCcw, type LucideIcon } from 'lucide-react';
import type { EstadoVerificacion, VerificacionDetalle } from '../types/verificacion.types';

const RESUMENES: Record<EstadoVerificacion, { icono: LucideIcon; clases: string; texto: string }> = {
  pendiente: {
    icono: Hourglass,
    clases: 'bg-primario/5 text-primario',
    texto: 'Nadie la ha tomado todavía. Puedes revisarla directamente o tomarla para avisar que la estás revisando.',
  },
  en_revision: {
    icono: Info,
    clases: 'bg-primario/5 text-primario',
    texto: 'Un administrador la está revisando.',
  },
  requiere_correccion: {
    icono: RotateCcw,
    clases: 'bg-advertencia/8 text-advertencia-hover',
    texto: 'Se espera que el ciudadano reenvíe sus fotos o datos. Volverá a «Pendientes» cuando lo haga.',
  },
  verificado: {
    icono: BadgeCheck,
    clases: 'bg-exito/8 text-exito',
    texto: 'Identidad aprobada: el ciudadano ya puede reportar emergencias.',
  },
  rechazado: {
    icono: CircleX,
    clases: 'bg-critico/6 text-critico',
    texto: 'Solicitud rechazada de forma definitiva: el ciudadano no puede reportar emergencias.',
  },
};

/** Qué significa el estado actual y, si lo hay, el motivo vigente que ve el ciudadano. */
export function ResumenEstadoVerificacion({ verificacion }: { verificacion: VerificacionDetalle }) {
  const { icono: Icono, clases, texto } = RESUMENES[verificacion.estado];
  const conMotivo = verificacion.estado === 'requiere_correccion' || verificacion.estado === 'rechazado';

  return (
    <div className={`flex items-start gap-2.5 rounded-xl px-4 py-3 text-[13px] ${clases}`}>
      <Icono aria-hidden strokeWidth={1.75} className="mt-0.5 size-4 shrink-0" />
      <div className="min-w-0 text-texto">
        <p>{texto}</p>
        {conMotivo && verificacion.motivo && (
          <p className="mt-1.5">
            <span className="font-medium">Motivo que ve el ciudadano:</span> {verificacion.motivo}
          </p>
        )}
      </div>
    </div>
  );
}
