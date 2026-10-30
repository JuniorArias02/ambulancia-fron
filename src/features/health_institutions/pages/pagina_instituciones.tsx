import { Hospital, LoaderCircle, Plus, SearchX } from 'lucide-react';
import { useState } from 'react';
import { Paginacion } from '../../../components/data/paginacion';
import { EstadoError } from '../../../components/states/estado_error';
import { useSesion } from '../../authentication/hooks/use_sesion';
import { BarraFiltrosInstituciones } from '../components/barra_filtros_instituciones';
import { DialogoEstadoInstitucion } from '../components/dialogo_estado_institucion';
import { PanelInstitucion } from '../components/panel_institucion';
import { TablaInstituciones } from '../components/tabla_instituciones';
import { useFiltrosInstituciones } from '../hooks/use_filtros_instituciones';
import { useInstituciones } from '../hooks/use_instituciones';
import type { InstitucionSalud } from '../types/institucion.types';

type AccionActiva =
  | { tipo: 'crear' }
  | { tipo: 'editar'; institucion: InstitucionSalud }
  | { tipo: 'estado'; institucion: InstitucionSalud };

export function PaginaInstituciones() {
  const { usuario } = useSesion();
  const esAdministrador = usuario?.rol === 'administrador';
  const { filtros, estado, actualizarFiltros, hayFiltrosActivos } = useFiltrosInstituciones(!esAdministrador);
  const instituciones = useInstituciones(filtros);
  const [accion, setAccion] = useState<AccionActiva | null>(null);
  const cerrarAccion = () => setAccion(null);
  const actualizando = instituciones.isFetching && !instituciones.isPending;
  const total = instituciones.data?.total;

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <section aria-labelledby="titulo-instituciones" className="vidrio rounded-2xl">
        <header className="flex flex-col gap-4 border-b border-borde/70 px-5 pt-5 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 id="titulo-instituciones" className="text-xl font-semibold tracking-tight text-texto">
                Instituciones de salud
              </h2>
              <p className="mt-0.5 flex items-center gap-2 text-sm text-texto-secundario">
                {total === undefined
                  ? 'Hospitales y clínicas que reciben pacientes.'
                  : `${total} ${total === 1 ? 'institución' : 'instituciones'}`}
                {actualizando && <LoaderCircle aria-label="Actualizando" className="size-3.5 animate-spin" />}
              </p>
            </div>
            {esAdministrador && (
              <button
                type="button"
                onClick={() => setAccion({ tipo: 'crear' })}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-primario px-4 text-sm font-semibold text-white shadow-primario transition-colors duration-150 hover:bg-primario-hover focus-visible:ring-4 focus-visible:ring-primario/25 focus-visible:outline-none"
              >
                <Plus aria-hidden strokeWidth={1.75} className="size-4" />
                Nueva institución
              </button>
            )}
          </div>
          <BarraFiltrosInstituciones
            filtros={filtros}
            estado={estado}
            mostrarEstado={esAdministrador}
            hayFiltrosActivos={hayFiltrosActivos}
            alCambiar={actualizarFiltros}
          />
        </header>

        {instituciones.isPending ? (
          <div role="status" aria-label="Cargando instituciones" className="divide-y divide-borde/60">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="flex animate-pulse items-center gap-4 px-5 py-4">
                <span className="size-9 rounded-xl bg-texto-secundario/10" />
                <span className="h-3 w-64 max-w-full rounded-full bg-texto-secundario/12" />
              </div>
            ))}
          </div>
        ) : instituciones.isError ? (
          <EstadoError
            titulo="No fue posible cargar las instituciones"
            mensaje={instituciones.error.message}
            alReintentar={() => void instituciones.refetch()}
          />
        ) : instituciones.data.datos.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <span className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-primario/8 text-primario">
              {hayFiltrosActivos ? (
                <SearchX aria-hidden strokeWidth={1.75} className="size-[22px]" />
              ) : (
                <Hospital aria-hidden strokeWidth={1.75} className="size-[22px]" />
              )}
            </span>
            <p className="text-base font-semibold text-texto">
              {hayFiltrosActivos ? 'Sin resultados' : 'Aún no hay instituciones'}
            </p>
            <p className="mt-1 max-w-sm text-sm text-texto-secundario">
              {hayFiltrosActivos
                ? 'Ninguna institución coincide con los filtros aplicados.'
                : esAdministrador
                  ? 'Registra los hospitales y clínicas a donde se trasladan los pacientes.'
                  : 'Un administrador debe registrar las instituciones.'}
            </p>
          </div>
        ) : (
          <>
            <div className={actualizando ? 'opacity-70 transition-opacity' : 'transition-opacity'}>
              <TablaInstituciones
                instituciones={instituciones.data.datos}
                acciones={
                  esAdministrador
                    ? {
                        alEditar: (institucion) => setAccion({ tipo: 'editar', institucion }),
                        alCambiarEstado: (institucion) => setAccion({ tipo: 'estado', institucion }),
                      }
                    : undefined
                }
              />
            </div>
            <div className="border-t border-borde/70 px-5 py-4">
              <Paginacion
                pagina={instituciones.data.pagina}
                limite={instituciones.data.limite}
                total={instituciones.data.total}
                deshabilitada={instituciones.isFetching}
                alCambiarPagina={(pagina) => actualizarFiltros({ pagina })}
              />
            </div>
          </>
        )}
      </section>

      {accion?.tipo === 'crear' && <PanelInstitucion institucion={null} alCerrar={cerrarAccion} />}
      {accion?.tipo === 'editar' && <PanelInstitucion institucion={accion.institucion} alCerrar={cerrarAccion} />}
      {accion?.tipo === 'estado' && <DialogoEstadoInstitucion institucion={accion.institucion} alCerrar={cerrarAccion} />}
    </div>
  );
}
