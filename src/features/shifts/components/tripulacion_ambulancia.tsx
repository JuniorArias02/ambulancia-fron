import { CalendarClock } from 'lucide-react';
import { useAhora } from '../../../hooks/use_ahora';
import { formatearFechaHora } from '../../../utils/formato_fecha';
import { haceTiempo } from '../../../utils/tiempo_transcurrido';
import { useTurnos } from '../hooks/use_turnos';
import { AvisoTripulacionIncompleta } from './aviso_tripulacion_incompleta';
import { ListaIntegrantes } from './lista_integrantes';

/** Tripulación del turno activo de una ambulancia, para su detalle. */
export function TripulacionAmbulancia({ ambulanciaId }: { ambulanciaId: string }) {
  const ahora = useAhora();
  const turnos = useTurnos({ ambulanciaId, estado: 'activo', pagina: 1, limite: 1 }, { enVivo: true });
  const turno = turnos.data?.datos[0];

  if (turnos.isPending) {
    return <div role="status" aria-label="Cargando tripulación" className="m-5 h-20 animate-pulse rounded-xl bg-white/50" />;
  }

  if (turnos.isError) {
    return <p className="px-5 py-4 text-[13px] text-critico">No fue posible cargar la tripulación: {turnos.error.message}</p>;
  }

  if (!turno) {
    return (
      <p className="px-5 py-4 text-[13px] text-texto-secundario">
        Sin tripulación. El conductor y el paramédico la seleccionan desde la app.
      </p>
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
      <AvisoTripulacionIncompleta turno={turno} />
    </div>
  );
}
