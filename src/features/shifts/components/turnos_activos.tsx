import { CalendarClock } from 'lucide-react';
import { EstadoError } from '../../../components/states/estado_error';
import { useAhora } from '../../../hooks/use_ahora';
import { useFlota } from '../../ambulances/hooks/use_ambulancias';
import type { EstadoOperativo } from '../../ambulances/types/ambulancia.types';
import { useIntervaloRespaldo } from '../../realtime/hooks/use_tiempo_real';
import { useTurnosActivos } from '../hooks/use_turnos';
import type { Turno } from '../types/turno.types';
import { EsqueletoTurnos } from './esqueleto_turnos';
import { TarjetaTurno } from './tarjeta_turno';

/** Respaldo sin tiempo real: el estado de la ambulancia también cambia desde la app. */
const INTERVALO_RESPALDO_MS = 15_000;

export interface TurnoPorCerrar {
  turno: Turno;
  estadoAmbulancia?: EstadoOperativo;
}

export function TurnosActivos({ alCerrarTurno }: { alCerrarTurno: (seleccion: TurnoPorCerrar) => void }) {
  const ahora = useAhora();
  const turnos = useTurnosActivos();
  // Toda la flota, para mostrar el estado de cada ambulancia en su tarjeta.
  const ambulancias = useFlota(useIntervaloRespaldo(INTERVALO_RESPALDO_MS));
  const porId = new Map((ambulancias.data?.datos ?? []).map((ambulancia) => [ambulancia.id, ambulancia]));

  if (turnos.isPending) return <EsqueletoTurnos />;
  if (turnos.isError) {
    return (
      <EstadoError
        titulo="No fue posible cargar los turnos"
        mensaje={turnos.error.message}
        alReintentar={() => void turnos.refetch()}
      />
    );
  }
  if (turnos.data.datos.length === 0) {
    return (
      <div className="flex flex-col items-center px-6 py-16 text-center">
        <span className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-primario/8 text-primario">
          <CalendarClock aria-hidden strokeWidth={1.75} className="size-[22px]" />
        </span>
        <p className="text-base font-semibold text-texto">Ninguna ambulancia tiene tripulación</p>
        <p className="mt-1 max-w-sm text-sm text-texto-secundario">
          El conductor y el paramédico seleccionan su ambulancia desde la app. Aquí aparecerán en cuanto lo hagan.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 p-5 sm:grid-cols-2 xl:grid-cols-3">
      {turnos.data.datos.map((turno) => {
        const ambulancia = porId.get(turno.ambulanciaId);
        return (
          <TarjetaTurno
            key={turno.id}
            turno={turno}
            ambulancia={ambulancia}
            ahora={ahora}
            alCerrarTurno={() => alCerrarTurno({ turno, estadoAmbulancia: ambulancia?.estadoOperativo })}
          />
        );
      })}
    </div>
  );
}
