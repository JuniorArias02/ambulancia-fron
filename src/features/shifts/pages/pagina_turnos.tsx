import { History, Info, LoaderCircle, Play, Users } from 'lucide-react';
import { useState } from 'react';
import { SelectorSegmentado, type OpcionSegmentada } from '../../../components/ui/selector_segmentado';
import { DialogoCambiarEstadoAmbulancia } from '../../ambulances/components/dialogo_cambiar_estado_ambulancia';
import { useSesion } from '../../authentication/hooks/use_sesion';
import { DialogoFinalizarTurno } from '../components/dialogo_finalizar_turno';
import { PanelTurno } from '../components/panel_turno';
import { TurnosActivos, type AccionTurno } from '../components/turnos_activos';
import { TurnosFinalizados } from '../components/turnos_finalizados';
import { useTurnosActivos } from '../hooks/use_turnos';
import { useVistaTurnos, type VistaTurnos } from '../hooks/use_vista_turnos';

const VISTAS: OpcionSegmentada<VistaTurnos>[] = [
  { valor: 'activos', texto: 'En turno', icono: Users },
  { valor: 'finalizados', texto: 'Finalizados', icono: History },
];

export function PaginaTurnos() {
  const { usuario } = useSesion();
  // Armar la tripulación exige `GET /usuarios`, que el backend solo permite al administrador.
  const puedeArmarTripulacion = usuario?.rol === 'administrador';
  const { vista, pagina, ambulanciaPorIniciar, actualizar } = useVistaTurnos();
  const turnosActivos = useTurnosActivos();
  const [accion, setAccion] = useState<AccionTurno | null>(null);

  const accionVisible: AccionTurno | null =
    accion ?? (ambulanciaPorIniciar && puedeArmarTripulacion ? { tipo: 'iniciar', ambulanciaId: ambulanciaPorIniciar } : null);
  const cerrarAccion = () => {
    setAccion(null);
    if (ambulanciaPorIniciar) actualizar({ iniciar: null });
  };
  const total = turnosActivos.data?.total;

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <section aria-labelledby="titulo-turnos" className="vidrio rounded-2xl">
        <header className="flex flex-col gap-4 border-b border-borde/70 px-5 pt-5 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
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
            {puedeArmarTripulacion && (
              <button
                type="button"
                onClick={() => setAccion({ tipo: 'iniciar' })}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-primario px-4 text-sm font-semibold text-white shadow-primario transition-colors duration-150 hover:bg-primario-hover focus-visible:ring-4 focus-visible:ring-primario/25 focus-visible:outline-none"
              >
                <Play aria-hidden strokeWidth={1.75} className="size-4" />
                Iniciar turno
              </button>
            )}
          </div>
          {!puedeArmarTripulacion && (
            <p className="flex items-start gap-2.5 rounded-xl bg-primario/5 px-4 py-3 text-[13px] text-texto">
              <Info aria-hidden strokeWidth={1.75} className="mt-0.5 size-4 shrink-0 text-primario" />
              Iniciar un turno o cambiar una tripulación requiere el listado de personal, que solo puede consultar un
              administrador. Puedes habilitar ambulancias y finalizar turnos.
            </p>
          )}
        </header>

        {vista === 'activos' ? (
          <TurnosActivos puedeArmarTripulacion={puedeArmarTripulacion} alAccion={setAccion} />
        ) : (
          <TurnosFinalizados pagina={pagina} alCambiarPagina={(siguiente) => actualizar({ pagina: siguiente })} />
        )}
      </section>

      {accionVisible?.tipo === 'iniciar' && (
        <PanelTurno turno={null} ambulanciaInicial={accionVisible.ambulanciaId} alCerrar={cerrarAccion} />
      )}
      {accionVisible?.tipo === 'tripulacion' && <PanelTurno turno={accionVisible.turno} alCerrar={cerrarAccion} />}
      {accionVisible?.tipo === 'finalizar' && (
        <DialogoFinalizarTurno
          turno={accionVisible.turno}
          estadoAmbulancia={accionVisible.estadoAmbulancia}
          alCerrar={cerrarAccion}
        />
      )}
      {accionVisible?.tipo === 'habilitar' && (
        <DialogoCambiarEstadoAmbulancia ambulancia={accionVisible.ambulancia} alCerrar={cerrarAccion} />
      )}
    </div>
  );
}
