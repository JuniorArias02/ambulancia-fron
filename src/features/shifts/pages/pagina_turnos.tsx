import { History, Info, LoaderCircle, Users } from 'lucide-react';
import { useState } from 'react';
import { SelectorSegmentado, type OpcionSegmentada } from '../../../components/ui/selector_segmentado';
import { DialogoFinalizarTurno } from '../components/dialogo_finalizar_turno';
import { TurnosActivos, type TurnoPorCerrar } from '../components/turnos_activos';
import { TurnosFinalizados } from '../components/turnos_finalizados';
import { useTurnosActivos } from '../hooks/use_turnos';
import { useVistaTurnos, type VistaTurnos } from '../hooks/use_vista_turnos';

const VISTAS: OpcionSegmentada<VistaTurnos>[] = [
  { valor: 'activos', texto: 'En turno', icono: Users },
  { valor: 'finalizados', texto: 'Finalizados', icono: History },
];

/** Consulta de tripulaciones: se arman desde la app; aquí solo se puede cerrar un turno que quedó abierto. */
export function PaginaTurnos() {
  const { vista, pagina, actualizar } = useVistaTurnos();
  const turnosActivos = useTurnosActivos();
  const [porCerrar, setPorCerrar] = useState<TurnoPorCerrar | null>(null);
  const total = turnosActivos.data?.total;

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <section aria-labelledby="titulo-turnos" className="vidrio rounded-2xl">
        <header className="flex flex-col gap-4 border-b border-borde/70 px-5 pt-5 pb-4">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <div>
              <h2 id="titulo-turnos" className="text-xl font-semibold tracking-tight text-texto">
                Tripulaciones
              </h2>
              <p className="mt-0.5 flex items-center gap-2 text-sm text-texto-secundario">
                {total === undefined
                  ? 'Turnos de las ambulancias y su personal.'
                  : `${total} ${total === 1 ? 'ambulancia en turno' : 'ambulancias en turno'}`}
                {turnosActivos.isFetching && !turnosActivos.isPending && (
                  <LoaderCircle aria-label="Actualizando" className="size-3.5 animate-spin" />
                )}
              </p>
            </div>
            <SelectorSegmentado
              etiqueta="Vista"
              valor={vista}
              opciones={VISTAS}
              alCambiar={(siguiente) => actualizar({ vista: siguiente })}
            />
          </div>
          <p className="flex items-start gap-2.5 rounded-xl bg-primario/5 px-4 py-3 text-[13px] text-texto">
            <Info aria-hidden strokeWidth={1.75} className="mt-0.5 size-4 shrink-0 text-primario" />
            El conductor y el paramédico seleccionan su ambulancia desde la app. Con la tripulación completa, la ambulancia
            queda disponible sola.
          </p>
        </header>

        {vista === 'activos' ? (
          <TurnosActivos alCerrarTurno={setPorCerrar} />
        ) : (
          <TurnosFinalizados pagina={pagina} alCambiarPagina={(siguiente) => actualizar({ pagina: siguiente })} />
        )}
      </section>

      {porCerrar && (
        <DialogoFinalizarTurno
          turno={porCerrar.turno}
          estadoAmbulancia={porCerrar.estadoAmbulancia}
          alCerrar={() => setPorCerrar(null)}
        />
      )}
    </div>
  );
}
