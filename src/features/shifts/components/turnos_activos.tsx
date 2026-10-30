import { CalendarClock } from 'lucide-react';
import { EstadoError } from '../../../components/states/estado_error';
import { useAhora } from '../../../hooks/use_ahora';
import { useFlota } from '../../ambulances/hooks/use_ambulancias';
import type { Ambulancia, EstadoOperativo } from '../../ambulances/types/ambulancia.types';
import { useTurnosActivos } from '../hooks/use_turnos';
import type { Turno } from '../types/turno.types';
import { EsqueletoTurnos } from './esqueleto_turnos';
import { TarjetaTurno } from './tarjeta_turno';

export type AccionTurno =
  | { tipo: 'iniciar'; ambulanciaId?: string }
  | { tipo: 'tripulacion'; turno: Turno }
  | { tipo: 'finalizar'; turno: Turno; estadoAmbulancia?: EstadoOperativo }
  | { tipo: 'habilitar'; ambulancia: Ambulancia };

export function TurnosActivos({
  puedeArmarTripulacion,
  alAccion,
}: {
  puedeArmarTripulacion: boolean;
  alAccion: (accion: AccionTurno) => void;
}) {
  const ahora = useAhora();
  const turnos = useTurnosActivos();
  // Toda la flota, para mostrar el estado de cada ambulancia en su tarjeta.
  const ambulancias = useFlota();
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
        <p className="text-base font-semibold text-texto">Ninguna ambulancia tiene turno</p>
        <p className="mt-1 max-w-sm text-sm text-texto-secundario">
          Una ambulancia necesita tripulación antes de quedar disponible para despacho.
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
            alCambiarTripulacion={puedeArmarTripulacion ? () => alAccion({ tipo: 'tripulacion', turno }) : undefined}
            alHabilitar={ambulancia ? () => alAccion({ tipo: 'habilitar', ambulancia }) : undefined}
            alFinalizar={() =>
              alAccion({ tipo: 'finalizar', turno, estadoAmbulancia: ambulancia?.estadoOperativo })
            }
          />
        );
      })}
    </div>
  );
}
