import { LoaderCircle, Wifi, WifiOff, type LucideIcon } from 'lucide-react';
import { useTiempoReal } from '../hooks/use_tiempo_real';
import type { EstadoConexion } from '../types/tiempo_real.types';

const ESTILOS: Record<Exclude<EstadoConexion, 'desactivado'>, { texto: string; ayuda: string; icono: LucideIcon; clases: string }> = {
  conectando: {
    texto: 'Conectando…',
    ayuda: 'Conectando con el servidor de tiempo real.',
    icono: LoaderCircle,
    clases: 'text-texto-secundario',
  },
  en_linea: {
    texto: 'En línea',
    ayuda: 'Los cambios llegan al instante.',
    icono: Wifi,
    clases: 'text-exito',
  },
  reconectando: {
    texto: 'Reconectando…',
    ayuda: 'Se perdió la conexión en tiempo real. Mientras tanto se consulta cada 15 s.',
    icono: LoaderCircle,
    clases: 'text-advertencia-hover',
  },
  sin_conexion: {
    texto: 'Sin conexión',
    ayuda: 'No hay conexión en tiempo real; se sigue intentando. Mientras tanto se consulta cada 15 s.',
    icono: WifiOff,
    clases: 'text-critico',
  },
};

/** Estado de la conexión en tiempo real; no se muestra si no hay servidor configurado. */
export function IndicadorConexion() {
  const { estado } = useTiempoReal();
  if (estado === 'desactivado') return null;

  const { texto, ayuda, icono: Icono, clases } = ESTILOS[estado];
  const girando = estado === 'conectando' || estado === 'reconectando';

  return (
    <span
      role="status"
      title={ayuda}
      className={`inline-flex h-8 items-center gap-1.5 rounded-full bg-white/60 px-2.5 text-xs font-medium ring-1 ring-white/80 ${clases}`}
    >
      <Icono aria-hidden strokeWidth={2} className={`size-3.5 ${girando ? 'animate-spin' : ''}`} />
      <span className="sr-only sm:not-sr-only">{texto}</span>
    </span>
  );
}
