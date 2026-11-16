import { FileText, LoaderCircle, SearchX } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Paginacion } from '../../../components/data/paginacion';
import { AlertaError } from '../../../components/feedback/alerta_error';
import { EstadoError } from '../../../components/states/estado_error';
import { useValorRetrasado } from '../../../hooks/use_valor_retrasado';
import { ExportarHistorias } from '../components/exportar_historias';
import { FiltrosHistorias, type OpcionesFiltros } from '../components/filtros_historias';
import { TablaHistorias } from '../components/tabla_historias';
import { LIMITES_PAGINA, RETRASO_FILTROS_MS } from '../constants/catalogos_clinicos';
import { useFiltrosHistorias } from '../hooks/use_filtros_historias';
import {
  useAmbulanciasOpciones,
  useBusquedaHistorias,
  useInstitucionesOpciones,
  useParamedicosOpciones,
} from '../hooks/use_historias';
import { construirChips } from '../utils/chips_filtros';

function EsqueletoTabla() {
  return (
    <div role="status" className="space-y-3 px-5 py-5">
      <span className="sr-only">Buscando historias…</span>
      {Array.from({ length: 6 }, (_, indice) => (
        <div key={indice} className="h-11 animate-pulse rounded-xl bg-borde/35" />
      ))}
    </div>
  );
}

function SelectorLimite({ limite, alCambiar }: { limite: number; alCambiar: (limite: number) => void }) {
  return (
    <label className="flex items-center gap-2 text-[13px] text-texto-secundario">
      Por página
      <select
        value={limite}
        onChange={(evento) => alCambiar(Number(evento.target.value))}
        className="campo-vidrio h-9 rounded-xl px-2.5 text-sm text-texto focus:outline-none focus-visible:ring-2 focus-visible:ring-primario/40"
      >
        {LIMITES_PAGINA.map((opcion) => (
          <option key={opcion} value={opcion}>
            {opcion}
          </option>
        ))}
      </select>
    </label>
  );
}

/** Bandeja "Buscar historias": solo lectura, abre con los últimos 7 días y las vigentes. */
export function PaginaHistorias() {
  const { filtros, textos, actualizar, aplicarTextos, limpiar } = useFiltrosHistorias();
  const filtrosRetrasados = useValorRetrasado(filtros, RETRASO_FILTROS_MS);
  const busqueda = useBusquedaHistorias(filtrosRetrasados);
  const [masFiltros, setMasFiltros] = useState(false);

  // Las opciones se cargan al abrir "Más filtros" o si un filtro elegido necesita su nombre.
  const necesitaOpciones =
    masFiltros || Boolean(filtros.ambulanciaId || filtros.institucionDestinoId || filtros.profesionalId);
  const ambulancias = useAmbulanciasOpciones(necesitaOpciones);
  const instituciones = useInstitucionesOpciones(necesitaOpciones);
  const paramedicos = useParamedicosOpciones(necesitaOpciones);

  const opciones = useMemo<OpcionesFiltros>(
    () => ({
      ambulancias: (ambulancias.data ?? []).map((a) => ({ valor: a.id, texto: a.codigo, detalle: a.placa })),
      instituciones: (instituciones.data ?? []).map((i) => ({ valor: i.id, texto: i.nombre, detalle: i.direccion ?? undefined })),
      profesionales: (paramedicos.data ?? []).map((p) => ({ valor: p.id, texto: `${p.nombres} ${p.apellidos}` })),
      cargando: necesitaOpciones && (ambulancias.isPending || instituciones.isPending || paramedicos.isPending),
    }),
    [ambulancias.data, instituciones.data, paramedicos.data, ambulancias.isPending, instituciones.isPending, paramedicos.isPending, necesitaOpciones],
  );

  const chips = construirChips(
    filtros,
    textos,
    {
      ambulancia: (id) => opciones.ambulancias.find((a) => a.valor === id)?.texto,
      institucion: (id) => opciones.instituciones.find((i) => i.valor === id)?.texto,
      profesional: (id) => opciones.profesionales.find((p) => p.valor === id)?.texto,
    },
    { actualizar, aplicarTextos },
  );

  const resultado = busqueda.data;
  const actualizando = busqueda.isFetching && !busqueda.isPending;
  // Un 400 o 422 es un filtro inválido: se muestra el mensaje sin perder la última lista.
  const errorDeFiltro = busqueda.error && (busqueda.error.estado === 400 || busqueda.error.estado === 422);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <section aria-labelledby="titulo-historias" className="vidrio rounded-2xl">
        <header className="space-y-5 border-b border-borde/70 px-5 pt-5 pb-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 id="titulo-historias" className="flex items-center gap-2.5 text-xl font-semibold tracking-tight text-texto">
                <FileText aria-hidden strokeWidth={1.75} className="size-5 text-primario" />
                Historias clínicas
              </h2>
              <p className="mt-0.5 flex items-center gap-2 text-sm text-texto-secundario">
                {resultado
                  ? `${resultado.total} ${resultado.total === 1 ? 'historia' : 'historias'}`
                  : 'Consulta de las atenciones prehospitalarias. Cada búsqueda queda registrada.'}
                {actualizando && (
                  <span className="inline-flex items-center gap-1.5 text-[13px]">
                    <LoaderCircle aria-hidden className="size-3.5 animate-spin" />
                    Actualizando…
                  </span>
                )}
              </p>
            </div>
            <ExportarHistorias filtros={filtrosRetrasados} total={busqueda.isPlaceholderData ? undefined : resultado?.total} />
          </div>
          <FiltrosHistorias
            filtros={filtros}
            textos={textos}
            chips={chips}
            opciones={opciones}
            masFiltrosAbiertos={masFiltros}
            alAlternarMasFiltros={() => setMasFiltros((actual) => !actual)}
            alCambiar={actualizar}
            alBuscar={aplicarTextos}
            alLimpiar={limpiar}
          />
          {errorDeFiltro && busqueda.error && <AlertaError error={busqueda.error} />}
        </header>

        {busqueda.isPending ? (
          <EsqueletoTabla />
        ) : busqueda.isError && !errorDeFiltro ? (
          <EstadoError
            titulo={busqueda.error.estado === 403 ? 'No tienes permiso para ver historias clínicas' : 'No fue posible buscar las historias'}
            mensaje={busqueda.error.message}
            alReintentar={() => void busqueda.refetch()}
          />
        ) : !resultado || resultado.datos.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <span className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-primario/8 text-primario">
              <SearchX aria-hidden strokeWidth={1.75} className="size-[22px]" />
            </span>
            <p className="text-base font-semibold text-texto">No hay historias con esos filtros</p>
            <p className="mt-1 max-w-sm text-sm text-texto-secundario">Prueba con otro rango de fechas o quita algún filtro.</p>
            <button
              type="button"
              onClick={limpiar}
              className="campo-vidrio mt-5 h-10 rounded-xl px-4 text-sm font-medium text-texto hover:bg-white"
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <>
            <div className={actualizando ? 'opacity-70 transition-opacity' : 'transition-opacity'}>
              <TablaHistorias
                historias={resultado.datos}
                orden={filtros.orden}
                alOrdenar={(orden) => actualizar({ orden: orden === 'fecha_desc' ? undefined : orden })}
              />
            </div>
            <div className="flex flex-col gap-3 border-t border-borde/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <SelectorLimite limite={filtros.limite} alCambiar={(limite) => actualizar({ limite: limite === 20 ? undefined : limite })} />
              <Paginacion
                pagina={resultado.pagina}
                limite={resultado.limite}
                total={resultado.total}
                deshabilitada={busqueda.isFetching}
                alCambiarPagina={(pagina) => actualizar({ pagina: pagina === 1 ? undefined : pagina })}
              />
            </div>
          </>
        )}
      </section>
    </div>
  );
}
