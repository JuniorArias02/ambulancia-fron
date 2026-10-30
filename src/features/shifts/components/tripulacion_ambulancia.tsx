import { CalendarClock, Play } from 'lucide-react';
import { Link } from 'react-router';
import { RUTAS } from '../../../constants/rutas';
import { useAhora } from '../../../hooks/use_ahora';
import { formatearFechaHora } from '../../../utils/formato_fecha';
import { haceTiempo } from '../../../utils/tiempo_transcurrido';
import { useTurnos } from '../hooks/use_turnos';
import { ListaIntegrantes } from './lista_integrantes';

interface PropiedadesTripulacionAmbulancia {
  ambulanciaId: string;
  /** Muestra el acceso para iniciar turno (requiere el listado de personal). */
  puedeIniciarTurno: boolean;
}

/** Tripulación del turno activo de una ambulancia, para su detalle. */
export function TripulacionAmbulancia({ ambulanciaId, puedeIniciarTurno }: PropiedadesTripulacionAmbulancia) {
  const ahora = useAhora();
  const turnos = useTurnos({ ambulanciaId, estado: 'activo', pagina: 1, limite: 1 });
  const turno = turnos.data?.datos[0];

  if (turnos.isPending) {
    return <div role="status" aria-label="Cargando tripulación" className="m-5 h-20 animate-pulse rounded-xl bg-white/50" />;
  }

  if (turnos.isError) {
    return <p className="px-5 py-4 text-[13px] text-critico">No fue posible cargar la tripulación: {turnos.error.message}</p>;
  }

  if (!turno) {
    return (
      <div className="flex flex-wrap items-center gap-3 px-5 py-4">
        <p className="flex-1 text-[13px] text-texto-secundario">
          Sin turno activo: no se puede habilitar ni despachar hasta que tenga tripulación.
        </p>
        {puedeIniciarTurno && (
          <Link
            to={`${RUTAS.turnos}?iniciar=${encodeURIComponent(ambulanciaId)}`}
            className="campo-vidrio inline-flex h-9 items-center gap-2 rounded-xl px-3 text-sm font-medium text-texto transition-colors duration-150 hover:bg-white"
          >
            <Play aria-hidden strokeWidth={1.75} className="size-4" />
            Iniciar turno
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3 px-5 py-4">
      <p
        className="flex items-center gap-1.5 text-[13px] text-texto-secundario"
        title={`Desde el ${formatearFechaHora(turno.inicio)}`}
      >
        <CalendarClock aria-hidden strokeWidth={1.75} className="size-3.5" />
        En turno {haceTiempo(turno.inicio, ahora)}
      </p>
      <ListaIntegrantes integrantes={turno.integrantes} />
    </div>
  );
}
