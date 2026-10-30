import { CircleCheck, Inbox, LoaderCircle, SearchX, Siren } from 'lucide-react';
import { useState } from 'react';
import { generatePath, useNavigate } from 'react-router';
import { Paginacion } from '../../../components/data/paginacion';
import { EstadoError } from '../../../components/states/estado_error';
import { RUTAS } from '../../../constants/rutas';
import { useAhora } from '../../../hooks/use_ahora';
import { BarraFiltrosEmergencias } from '../components/barra_filtros_emergencias';
import { DialogoCancelarEmergencia } from '../components/dialogo_cancelar_emergencia';
import { EsqueletoEmergencias } from '../components/esqueleto_emergencias';
import { PanelEmergencia } from '../components/panel_emergencia';
import { SelectorVistaEmergencias } from '../components/selector_vista_emergencias';
import { TablaEmergencias } from '../components/tabla_emergencias';
import { useEmergencias } from '../hooks/use_emergencias';
import { useFiltrosEmergencias, type VistaEmergencias } from '../hooks/use_filtros_emergencias';
import type { Emergencia } from '../types/emergencia.types';

type AccionActiva =
  | { tipo: 'crear' }
  | { tipo: 'editar'; emergencia: Emergencia }
  | { tipo: 'cancelar'; emergencia: Emergencia };

interface PropiedadesEstadoVacio {
  vista: VistaEmergencias;
  conFiltros: boolean;
  alLimpiarFiltros: () => void;
}

function EstadoVacio({ vista, conFiltros, alLimpiarFiltros }: PropiedadesEstadoVacio) {
  const Icono = conFiltros ? SearchX : vista === 'activas' ? CircleCheck : Inbox;
  const titulo = conFiltros ? 'Sin resultados' : vista === 'activas' ? 'No hay emergencias activas' : 'Aún no hay emergencias';
  const mensaje = conFiltros
    ? 'Ninguna emergencia coincide con los filtros aplicados.'
    : vista === 'activas'
      ? 'Las emergencias recibidas, despachadas o en atención aparecerán aquí.'
      : 'Las emergencias registradas aparecerán aquí.';
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <span className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-primario/8 text-primario">
        <Icono aria-hidden strokeWidth={1.75} className="size-[22px]" />
      </span>
      <p className="text-base font-semibold text-texto">{titulo}</p>
      <p className="mt-1 max-w-sm text-sm text-texto-secundario">{mensaje}</p>
      {conFiltros && (
        <button
          type="button"
          onClick={alLimpiarFiltros}
          className="campo-vidrio mt-5 h-10 rounded-xl px-4 text-sm font-medium text-texto hover:bg-white"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );
}

function textoTotal(total: number, vista: VistaEmergencias): string {
  if (vista === 'activas') return `${total} ${total === 1 ? 'emergencia activa' : 'emergencias activas'}`;
  return `${total} ${total === 1 ? 'emergencia' : 'emergencias'}`;
}

export function PaginaEmergencias() {
  const navegar = useNavigate();
  const ahora = useAhora();
  const { vista, filtros, actualizarFiltros, limpiarFiltros, hayFiltrosActivos } = useFiltrosEmergencias();
  const emergencias = useEmergencias(filtros);
  const [accion, setAccion] = useState<AccionActiva | null>(null);
  const cerrarAccion = () => setAccion(null);
  const irAlDetalle = (emergencia: Emergencia) =>
    void navegar(generatePath(RUTAS.detalleEmergencia, { id: emergencia.id }));

  const resultado = emergencias.data;
  const actualizando = emergencias.isFetching && !emergencias.isPending;

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <section aria-labelledby="titulo-emergencias" className="vidrio rounded-2xl">
        <header className="flex flex-col gap-4 border-b border-borde/70 px-5 pt-5 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
              <div>
                <h2 id="titulo-emergencias" className="text-xl font-semibold tracking-tight text-texto">
                  {vista === 'activas' ? 'Emergencias activas' : 'Historial de emergencias'}
                </h2>
                <p className="mt-0.5 flex items-center gap-2 text-sm text-texto-secundario">
                  {resultado ? textoTotal(resultado.total, vista) : 'Registro y seguimiento de las llamadas.'}
                  {actualizando && (
                    <span className="inline-flex items-center gap-1.5 text-[13px]">
                      <LoaderCircle aria-hidden className="size-3.5 animate-spin" />
                      Actualizando…
                    </span>
                  )}
                </p>
              </div>
              <SelectorVistaEmergencias vista={vista} alCambiar={(siguiente) => actualizarFiltros({ vista: siguiente })} />
            </div>
            <button
              type="button"
              onClick={() => setAccion({ tipo: 'crear' })}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-primario px-4 text-sm font-semibold text-white shadow-primario transition-colors duration-150 hover:bg-primario-hover focus-visible:ring-4 focus-visible:ring-primario/25 focus-visible:outline-none"
            >
              <Siren aria-hidden strokeWidth={1.75} className="size-4" />
              Nueva emergencia
            </button>
          </div>

          <BarraFiltrosEmergencias
            key={vista}
            vista={vista}
            filtros={filtros}
            hayFiltrosActivos={hayFiltrosActivos}
            alCambiar={actualizarFiltros}
            alLimpiar={limpiarFiltros}
          />
        </header>

        {emergencias.isPending ? (
          <EsqueletoEmergencias />
        ) : emergencias.isError ? (
          <EstadoError
            titulo="No fue posible cargar las emergencias"
            mensaje={emergencias.error.message}
            alReintentar={() => void emergencias.refetch()}
          />
        ) : emergencias.data.datos.length === 0 ? (
          <EstadoVacio vista={vista} conFiltros={hayFiltrosActivos} alLimpiarFiltros={limpiarFiltros} />
        ) : (
          <>
            <div className={actualizando ? 'opacity-70 transition-opacity' : 'transition-opacity'}>
              <TablaEmergencias
                emergencias={emergencias.data.datos}
                mostrarTranscurrido={vista === 'activas'}
                ahora={ahora}
                alVerDetalle={irAlDetalle}
                alEditar={(emergencia) => setAccion({ tipo: 'editar', emergencia })}
                alCancelar={(emergencia) => setAccion({ tipo: 'cancelar', emergencia })}
              />
            </div>
            <div className="border-t border-borde/70 px-5 py-4">
              <Paginacion
                pagina={emergencias.data.pagina}
                limite={emergencias.data.limite}
                total={emergencias.data.total}
                deshabilitada={emergencias.isFetching}
                alCambiarPagina={(pagina) => actualizarFiltros({ pagina })}
              />
            </div>
          </>
        )}
      </section>

      {/* Tras registrarla se abre su detalle, donde se revisan las posibles duplicadas. */}
      {accion?.tipo === 'crear' && (
        <PanelEmergencia emergencia={null} alCerrar={cerrarAccion} alGuardar={irAlDetalle} />
      )}
      {accion?.tipo === 'editar' && <PanelEmergencia emergencia={accion.emergencia} alCerrar={cerrarAccion} />}
      {accion?.tipo === 'cancelar' && (
        <DialogoCancelarEmergencia emergencia={accion.emergencia} alCerrar={cerrarAccion} />
      )}
    </div>
  );
}
