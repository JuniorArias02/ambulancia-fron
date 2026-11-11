import { Inbox, LoaderCircle, Plus, SearchX } from 'lucide-react';
import { useState } from 'react';
import { generatePath, useNavigate } from 'react-router';
import { Paginacion } from '../../../components/data/paginacion';
import { EstadoError } from '../../../components/states/estado_error';
import { RUTAS } from '../../../constants/rutas';
import { BarraFiltrosListas } from '../components/barra_filtros_listas';
import { DialogoEstadoLista } from '../components/dialogo_estado_lista';
import { PanelCrearLista } from '../components/panel_crear_lista';
import { TablaListasChequeo } from '../components/tabla_listas_chequeo';
import { claseBotonPrimario } from '../constants/estilos_listas';
import { useFiltrosListas } from '../hooks/use_filtros_listas';
import { useListasChequeo } from '../hooks/use_listas_chequeo';
import type { ListaChequeo } from '../types/lista_chequeo.types';

type AccionActiva = { tipo: 'crear' } | { tipo: 'estado'; lista: ListaChequeo };

function Esqueleto() {
  return (
    <div role="status" aria-label="Cargando listas" className="divide-y divide-borde/60">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="flex animate-pulse items-center gap-4 px-5 py-4">
          <span className="size-9 shrink-0 rounded-xl bg-texto-secundario/10" />
          <div className="flex-1 space-y-2">
            <span className="block h-3 w-48 max-w-full rounded-full bg-texto-secundario/12" />
            <span className="block h-2.5 w-32 max-w-full rounded-full bg-texto-secundario/8" />
          </div>
          <span className="hidden h-6 w-20 rounded-full bg-texto-secundario/8 md:block" />
        </div>
      ))}
    </div>
  );
}

export function PaginaListasChequeo() {
  const navegar = useNavigate();
  const { filtros, actualizarFiltros, hayFiltrosActivos } = useFiltrosListas();
  const listas = useListasChequeo(filtros);
  // La lista activa, para avisar cuál deja de usarse al activar otra.
  const activa = useListasChequeo({ activa: true, pagina: 1, limite: 1 });
  const [accion, setAccion] = useState<AccionActiva | null>(null);
  const cerrar = () => setAccion(null);
  const abrirEditor = (lista: ListaChequeo) => void navegar(generatePath(RUTAS.detalleListaChequeo, { id: lista.id }));

  const resultado = listas.data;
  const actualizando = listas.isFetching && !listas.isPending;
  const listaActiva = activa.data?.datos[0];
  const nombreActiva = listaActiva?.nombre;

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <section aria-labelledby="titulo-listas" className="vidrio rounded-2xl">
        <header className="flex flex-col gap-4 border-b border-borde/70 px-5 pt-5 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 id="titulo-listas" className="text-xl font-semibold tracking-tight text-texto">
                Listas de chequeo
              </h2>
              <p className="mt-0.5 flex items-center gap-2 text-sm text-texto-secundario">
                {nombreActiva ? (
                  <>
                    En uso: <span className="font-medium text-texto">{nombreActiva}</span>
                  </>
                ) : activa.isSuccess ? (
                  'Ninguna lista activa: los conductores no tienen chequeo diario.'
                ) : (
                  'Lo que los conductores revisan cada día en su ambulancia.'
                )}
                {actualizando && <LoaderCircle aria-label="Actualizando" className="size-3.5 animate-spin" />}
              </p>
            </div>
            <button type="button" onClick={() => setAccion({ tipo: 'crear' })} className={claseBotonPrimario}>
              <Plus aria-hidden strokeWidth={1.75} className="size-4" />
              Nueva lista
            </button>
          </div>
          <BarraFiltrosListas filtros={filtros} alCambiar={actualizarFiltros} />
        </header>

        {listas.isPending ? (
          <Esqueleto />
        ) : listas.isError ? (
          <EstadoError
            titulo="No fue posible cargar las listas"
            mensaje={listas.error.message}
            alReintentar={() => void listas.refetch()}
          />
        ) : listas.data.datos.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <span className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-primario/8 text-primario">
              {hayFiltrosActivos ? (
                <SearchX aria-hidden strokeWidth={1.75} className="size-[22px]" />
              ) : (
                <Inbox aria-hidden strokeWidth={1.75} className="size-[22px]" />
              )}
            </span>
            <p className="text-base font-semibold text-texto">{hayFiltrosActivos ? 'Sin resultados' : 'Aún no hay listas'}</p>
            <p className="mt-1 max-w-sm text-sm text-texto-secundario">
              {hayFiltrosActivos
                ? 'Ninguna lista coincide con los filtros.'
                : 'Crea la primera con sus preguntas y opciones de calificación, y actívala.'}
            </p>
          </div>
        ) : (
          <>
            <div className={actualizando ? 'opacity-70 transition-opacity' : 'transition-opacity'}>
              <TablaListasChequeo
                listas={listas.data.datos}
                alEditar={abrirEditor}
                alCambiarEstado={(lista) => setAccion({ tipo: 'estado', lista })}
              />
            </div>
            {resultado && (
              <div className="border-t border-borde/70 px-5 py-4">
                <Paginacion
                  pagina={resultado.pagina}
                  limite={resultado.limite}
                  total={resultado.total}
                  deshabilitada={listas.isFetching}
                  alCambiarPagina={(pagina) => actualizarFiltros({ pagina })}
                />
              </div>
            )}
          </>
        )}
      </section>

      {accion?.tipo === 'crear' && <PanelCrearLista alCrear={abrirEditor} alCerrar={cerrar} />}
      {accion?.tipo === 'estado' && (
        <DialogoEstadoLista
          lista={accion.lista}
          nombreActiva={listaActiva?.id === accion.lista.id ? undefined : nombreActiva}
          alCerrar={cerrar}
        />
      )}
    </div>
  );
}
