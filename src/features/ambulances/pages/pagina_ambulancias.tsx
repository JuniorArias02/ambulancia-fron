import { Inbox, LoaderCircle, Plus, SearchX } from 'lucide-react';
import { useState } from 'react';
import { generatePath, useNavigate } from 'react-router';
import { Paginacion } from '../../../components/data/paginacion';
import { EstadoError } from '../../../components/states/estado_error';
import { RUTAS } from '../../../constants/rutas';
import { BarraFiltrosAmbulancias } from '../components/barra_filtros_ambulancias';
import { DialogoCambiarEstadoAmbulancia } from '../components/dialogo_cambiar_estado_ambulancia';
import { EsqueletoAmbulancias } from '../components/esqueleto_ambulancias';
import { PanelAmbulancia } from '../components/panel_ambulancia';
import { TablaAmbulancias } from '../components/tabla_ambulancias';
import { useAmbulancias } from '../hooks/use_ambulancias';
import { useFiltrosAmbulancias } from '../hooks/use_filtros_ambulancias';
import { usePermisosAmbulancias } from '../hooks/use_permisos_ambulancias';
import { useTiposAmbulancia } from '../hooks/use_tipos_ambulancia';
import type { Ambulancia } from '../types/ambulancia.types';

type AccionActiva =
  | { tipo: 'crear' }
  | { tipo: 'editar'; ambulancia: Ambulancia }
  | { tipo: 'estado'; ambulancia: Ambulancia };

interface PropiedadesEstadoVacio {
  conFiltros: boolean;
  puedeRegistrar: boolean;
  alLimpiarFiltros: () => void;
}

function EstadoVacio({ conFiltros, puedeRegistrar, alLimpiarFiltros }: PropiedadesEstadoVacio) {
  const Icono = conFiltros ? SearchX : Inbox;
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <span className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-primario/8 text-primario">
        <Icono aria-hidden strokeWidth={1.75} className="size-[22px]" />
      </span>
      <p className="text-base font-semibold text-texto">
        {conFiltros ? 'Sin resultados' : 'Aún no hay ambulancias'}
      </p>
      <p className="mt-1 max-w-sm text-sm text-texto-secundario">
        {conFiltros
          ? 'Ninguna ambulancia coincide con los filtros aplicados.'
          : puedeRegistrar
            ? 'Registra el primer vehículo de la flota.'
            : 'Un administrador debe registrar los vehículos de la flota.'}
      </p>
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

export function PaginaAmbulancias() {
  const navegar = useNavigate();
  const { puedeGestionar, puedeCambiarEstado } = usePermisosAmbulancias();
  const { filtros, actualizarFiltros, hayFiltrosActivos } = useFiltrosAmbulancias();
  const ambulancias = useAmbulancias(filtros);
  const tipos = useTiposAmbulancia();
  const [accion, setAccion] = useState<AccionActiva | null>(null);
  const cerrarAccion = () => setAccion(null);

  const resultado = ambulancias.data;
  const actualizando = ambulancias.isFetching && !ambulancias.isPending;
  const limpiarFiltros = () =>
    actualizarFiltros({ busqueda: undefined, estadoOperativo: undefined, tipoAmbulanciaId: undefined });

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <section aria-labelledby="titulo-ambulancias" className="vidrio rounded-2xl">
        <header className="flex flex-col gap-4 border-b border-borde/70 px-5 pt-5 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 id="titulo-ambulancias" className="text-xl font-semibold tracking-tight text-texto">
                Flota de ambulancias
              </h2>
              <p className="mt-0.5 flex items-center gap-2 text-sm text-texto-secundario">
                {resultado
                  ? `${resultado.total} ${resultado.total === 1 ? 'ambulancia' : 'ambulancias'}`
                  : 'Vehículos registrados y su estado operativo.'}
                {actualizando && (
                  <span className="inline-flex items-center gap-1.5 text-[13px]">
                    <LoaderCircle aria-hidden className="size-3.5 animate-spin" />
                    Actualizando…
                  </span>
                )}
              </p>
            </div>
            {puedeGestionar && (
              <button
                type="button"
                onClick={() => setAccion({ tipo: 'crear' })}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-primario px-4 text-sm font-semibold text-white shadow-primario transition-colors duration-150 hover:bg-primario-hover focus-visible:ring-4 focus-visible:ring-primario/25 focus-visible:outline-none"
              >
                <Plus aria-hidden strokeWidth={1.75} className="size-4" />
                Nueva ambulancia
              </button>
            )}
          </div>

          <BarraFiltrosAmbulancias
            filtros={filtros}
            tipos={tipos.data}
            hayFiltrosActivos={hayFiltrosActivos}
            alCambiar={actualizarFiltros}
          />
        </header>

        {ambulancias.isPending ? (
          <EsqueletoAmbulancias />
        ) : ambulancias.isError ? (
          <EstadoError
            titulo="No fue posible cargar las ambulancias"
            mensaje={ambulancias.error.message}
            alReintentar={() => void ambulancias.refetch()}
          />
        ) : ambulancias.data.datos.length === 0 ? (
          <EstadoVacio
            conFiltros={hayFiltrosActivos}
            puedeRegistrar={puedeGestionar}
            alLimpiarFiltros={limpiarFiltros}
          />
        ) : (
          <>
            <div className={actualizando ? 'opacity-70 transition-opacity' : 'transition-opacity'}>
              <TablaAmbulancias
                ambulancias={ambulancias.data.datos}
                alVerDetalle={(ambulancia) =>
                  void navegar(generatePath(RUTAS.detalleAmbulancia, { id: ambulancia.id }))
                }
                alCambiarEstado={
                  puedeCambiarEstado
                    ? (ambulancia) => setAccion({ tipo: 'estado', ambulancia })
                    : undefined
                }
                alEditar={
                  puedeGestionar ? (ambulancia) => setAccion({ tipo: 'editar', ambulancia }) : undefined
                }
              />
            </div>
            <div className="border-t border-borde/70 px-5 py-4">
              <Paginacion
                pagina={ambulancias.data.pagina}
                limite={ambulancias.data.limite}
                total={ambulancias.data.total}
                deshabilitada={ambulancias.isFetching}
                alCambiarPagina={(pagina) => actualizarFiltros({ pagina })}
              />
            </div>
          </>
        )}
      </section>

      {accion?.tipo === 'crear' && <PanelAmbulancia ambulancia={null} alCerrar={cerrarAccion} />}
      {accion?.tipo === 'editar' && (
        <PanelAmbulancia ambulancia={accion.ambulancia} alCerrar={cerrarAccion} />
      )}
      {accion?.tipo === 'estado' && (
        <DialogoCambiarEstadoAmbulancia ambulancia={accion.ambulancia} alCerrar={cerrarAccion} />
      )}
    </div>
  );
}
