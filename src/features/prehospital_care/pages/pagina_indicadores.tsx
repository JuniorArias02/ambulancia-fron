import { ChartColumn, LoaderCircle } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { AlertaError } from '../../../components/feedback/alerta_error';
import { EstadoError } from '../../../components/states/estado_error';
import { MODALIDADES_SERVICIO, etiquetaModalidad } from '../../../constants/modalidades_servicio';
import { RUTAS } from '../../../constants/rutas';
import { BarraSegmentada, BarrasRanking, ColumnasPorDia, type FilaRanking, type Parte } from '../components/graficas_indicadores';
import { SelectorRango } from '../components/selector_rango';
import {
  DESENLACES,
  ETIQUETAS_DESENLACE,
  ETIQUETAS_TIPO_EVENTO,
  TIPOS_EVENTO,
  TRIAGE,
  TRIAGES,
} from '../constants/catalogos_clinicos';
import { useIndicadores } from '../hooks/use_historias';
import { useTextosBusqueda } from '../providers/contexto_busqueda';
import type { Conteo, EstadisticaTiempo, IndicadoresClinicos } from '../types/historia_clinica.types';
import { formatearDuracion } from '../utils/formato_clinico';
import { ATAJOS_INDICADORES, PATRON_DIA, rangoDeAtajo } from '../utils/rangos_fecha';

const formatoNumero = new Intl.NumberFormat('es-CO');
const formatoPorcentaje = new Intl.NumberFormat('es-CO', { style: 'percent', maximumFractionDigits: 0 });
/** Posición en el catálogo; lo desconocido y "Sin dato" van al final. */
const posicion = (catalogo: readonly string[], clave: string) => {
  const indice = catalogo.indexOf(clave);
  return indice < 0 ? Number.MAX_SAFE_INTEGER : indice;
};

type FiltroBandeja = Partial<Record<'triage' | 'desenlace' | 'modalidad' | 'tipoEvento' | 'institucionDestinoId' | 'soloNn' | 'riesgoCaidaAlto' | 'firmada', string>>;

function Tarjeta({ titulo, valor, detalle, alElegir }: { titulo: string; valor: string; detalle?: string; alElegir?: () => void }) {
  const contenido = (
    <>
      <p className="text-[13px] font-medium text-texto-secundario">{titulo}</p>
      <p className="mt-1 text-3xl font-semibold tracking-tight text-texto">{valor}</p>
      {detalle && <p className="mt-0.5 text-xs text-texto-secundario">{detalle}</p>}
    </>
  );
  const clase = 'rounded-2xl border border-borde/70 bg-white/70 px-4 py-3 text-left';
  if (!alElegir) return <div className={clase}>{contenido}</div>;
  return (
    <button
      type="button"
      onClick={alElegir}
      className={`${clase} transition-colors hover:border-primario/30 hover:bg-white focus-visible:ring-2 focus-visible:ring-primario/40 focus-visible:outline-none`}
    >
      {contenido}
    </button>
  );
}

function TarjetaTiempo({ titulo, estadistica, destacada = false }: { titulo: string; estadistica: EstadisticaTiempo; destacada?: boolean }) {
  return (
    <div className={`rounded-2xl px-4 py-3 ${destacada ? 'bg-primario/8 ring-1 ring-primario/25' : 'border border-borde/70 bg-white/70'}`}>
      <p className={`text-[13px] font-medium ${destacada ? 'text-primario' : 'text-texto-secundario'}`}>{titulo}</p>
      <p className={`mt-1 font-semibold tracking-tight text-texto ${destacada ? 'text-4xl' : 'text-3xl'}`}>
        {formatearDuracion(estadistica.medianaSegundos)}
        <span className="ml-1.5 text-xs font-medium text-texto-secundario">mediana</span>
      </p>
      <p className="mt-1 text-[13px] text-texto">
        P90 <span className="font-semibold">{formatearDuracion(estadistica.p90Segundos)}</span>
        <span className="text-texto-secundario"> · promedio {formatearDuracion(estadistica.promedioSegundos)}</span>
      </p>
      <p className="mt-0.5 text-xs text-texto-secundario">
        de {formatoNumero.format(estadistica.servicios)} {estadistica.servicios === 1 ? 'servicio' : 'servicios'}
      </p>
    </div>
  );
}

function Panel({ titulo, descripcion, children, ancho = false }: { titulo: string; descripcion?: string; children: ReactNode; ancho?: boolean }) {
  return (
    <section className={`vidrio space-y-4 rounded-2xl px-5 py-5 ${ancho ? 'lg:col-span-2' : ''}`}>
      <div>
        <h3 className="text-base font-semibold text-texto">{titulo}</h3>
        {descripcion && <p className="text-xs text-texto-secundario">{descripcion}</p>}
      </div>
      {children}
    </section>
  );
}

interface PropiedadesContenido {
  datos: IndicadoresClinicos;
  actualizando: boolean;
  abrirBandeja: (filtro: FiltroBandeja, rango?: { desde: string; hasta: string }) => void;
  partes: <T extends string>(conteos: readonly Conteo[], catalogo: readonly T[], etiqueta: (clave: T) => string, filtro: 'desenlace' | 'modalidad') => Parte[];
  filasTriage: (conteos: readonly Conteo[]) => FilaRanking[];
}

function Contenido({ datos, actualizando, abrirBandeja, partes, filasTriage }: PropiedadesContenido) {
  const total = datos.totalHistorias;
  const porcentaje = (parte: number) => (total === 0 ? '—' : formatoPorcentaje.format(parte / total));
  return (
    <div className={`space-y-4 ${actualizando ? 'opacity-70 transition-opacity' : 'transition-opacity'}`}>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Tarjeta titulo="Historias" valor={formatoNumero.format(total)} detalle="Ver en la bandeja" alElegir={() => abrirBandeja({})} />
        <Tarjeta
          titulo="Firmadas"
          valor={porcentaje(datos.firmadas)}
          detalle={`${formatoNumero.format(datos.firmadas)} con la firma del profesional`}
          alElegir={() => abrirBandeja({ firmada: 'true' })}
        />
        <Tarjeta
          titulo="Rechazos del traslado"
          valor={formatoNumero.format(datos.rechazosTraslado)}
          detalle={porcentaje(datos.rechazosTraslado)}
          alElegir={() => abrirBandeja({ desenlace: 'rechazo_traslado' })}
        />
        <Tarjeta
          titulo="Pacientes NN"
          valor={formatoNumero.format(datos.pacientesSinIdentificar)}
          detalle="Sin identificar"
          alElegir={() => abrirBandeja({ soloNn: 'true' })}
        />
        <Tarjeta
          titulo="Riesgo de caída alto"
          valor={formatoNumero.format(datos.conRiesgoCaidaAlto)}
          detalle="Escala Downton"
          alElegir={() => abrirBandeja({ riesgoCaidaAlto: 'true' })}
        />
      </div>

      <Panel titulo="Tiempos de los servicios" descripcion="Ambulancias de los ingresos recibidos en el rango. P90: el 90 % tardó eso o menos.">
        <div className="grid gap-3 md:grid-cols-3">
          <TarjetaTiempo titulo="Respuesta (asignación → escena)" estadistica={datos.tiempos.respuesta} destacada />
          <TarjetaTiempo titulo="En escena" estadistica={datos.tiempos.enEscena} />
          <TarjetaTiempo titulo="Traslado (escena → destino)" estadistica={datos.tiempos.traslado} />
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel titulo="Historias por día" descripcion="Clic en un día para verlo en la bandeja." ancho>
          <ColumnasPorDia dias={datos.porDia} alElegir={(dia) => abrirBandeja({}, { desde: dia, hasta: dia })} />
        </Panel>
        <Panel titulo="Por triage">
          <BarrasRanking titulo="Historias por triage" filas={filasTriage(datos.porTriage)} vacio="Sin historias en el rango." />
        </Panel>
        <Panel titulo="Por tipo de servicio">
          <BarraSegmentada titulo="Historias por tipo de servicio" partes={partes(datos.porModalidad, MODALIDADES_SERVICIO, etiquetaModalidad, 'modalidad')} />
        </Panel>
        <Panel titulo="Por desenlace">
          <BarraSegmentada
            titulo="Historias por desenlace"
            partes={partes(datos.porDesenlace, DESENLACES, (clave) => ETIQUETAS_DESENLACE[clave], 'desenlace')}
          />
        </Panel>
        <Panel titulo="Por tipo de evento">
          <BarrasRanking
            titulo="Historias por tipo de evento"
            vacio="Sin historias en el rango."
            filas={[...datos.porTipoEvento]
              .sort((a, b) => b.total - a.total)
              .map((conteo) => {
                const tipo = TIPOS_EVENTO.find((opcion) => opcion === conteo.clave);
                return {
                  clave: conteo.clave,
                  nombre: tipo ? ETIQUETAS_TIPO_EVENTO[tipo] : 'Sin dato',
                  total: conteo.total,
                  alElegir: tipo ? () => abrirBandeja({ tipoEvento: tipo }) : undefined,
                };
              })}
          />
        </Panel>
        <Panel titulo="Instituciones de destino" ancho>
          <BarrasRanking
            titulo="Historias por institución de destino"
            vacio="Ninguna historia con traslado a una institución en el rango."
            filas={datos.institucionesDestino.map((institucion) => ({
              clave: institucion.id,
              nombre: institucion.nombre,
              total: institucion.total,
              alElegir: () => abrirBandeja({ institucionDestinoId: institucion.id }),
            }))}
          />
        </Panel>
      </div>
    </div>
  );
}

/** Indicadores del módulo clínico. Un clic en una barra abre la bandeja con ese filtro y el mismo rango. */
export function PaginaIndicadores() {
  const navegar = useNavigate();
  const [parametros, setParametros] = useSearchParams();
  const { setTextos } = useTextosBusqueda();
  const [porDefecto] = useState(() => rangoDeAtajo('ultimos_30'));
  const desdeUrl = parametros.get('desde');
  const hastaUrl = parametros.get('hasta');
  const desde = desdeUrl && PATRON_DIA.test(desdeUrl) ? desdeUrl : porDefecto.desde;
  const hasta = hastaUrl && PATRON_DIA.test(hastaUrl) ? hastaUrl : porDefecto.hasta;
  const indicadores = useIndicadores(desde, hasta);
  const actualizando = indicadores.isFetching && !indicadores.isPending;

  const cambiarRango = (rango: { desde: string | undefined; hasta: string | undefined }) => {
    const siguientes = new URLSearchParams();
    if (rango.desde) siguientes.set('desde', rango.desde);
    if (rango.hasta) siguientes.set('hasta', rango.hasta);
    setParametros(siguientes, { replace: true });
  };

  // Mismo rango y todos los estados, para que la bandeja cuente lo mismo que el indicador.
  const abrirBandeja = (filtro: FiltroBandeja, rango: { desde: string; hasta: string } = { desde, hasta }) => {
    setTextos({});
    const consulta = new URLSearchParams({ desde: rango.desde, hasta: rango.hasta, estado: 'todos' });
    for (const [clave, valor] of Object.entries(filtro)) if (valor) consulta.set(clave, valor);
    void navegar(`${RUTAS.historiasClinicas}?${consulta.toString()}`);
  };

  const partes = <T extends string>(conteos: readonly Conteo[], catalogo: readonly T[], etiqueta: (clave: T) => string, filtro: 'desenlace' | 'modalidad'): Parte[] =>
    [...conteos]
      // Orden del catálogo (el color sigue a la entidad, no a su tamaño); "Sin dato" al final.
      .sort((a, b) => posicion(catalogo, a.clave) - posicion(catalogo, b.clave))
      .map((conteo) => {
        const valor = catalogo.find((opcion) => opcion === conteo.clave);
        return {
          clave: conteo.clave,
          nombre: valor ? etiqueta(valor) : conteo.clave === 'sin_dato' ? 'Sin dato' : conteo.clave,
          total: conteo.total,
          indiceColor: valor ? catalogo.indexOf(valor) : null,
          alElegir: valor ? () => abrirBandeja({ [filtro]: valor }) : undefined,
        };
      });

  const filasTriage = (conteos: readonly Conteo[]): FilaRanking[] =>
    [...conteos]
      .sort((a, b) => b.total - a.total)
      .map((conteo) => {
        const triage = TRIAGES.find((opcion) => opcion === conteo.clave);
        return {
          clave: conteo.clave,
          nombre: triage ? TRIAGE[triage].etiqueta : 'Sin dato',
          total: conteo.total,
          color: triage ? TRIAGE[triage].color : '#94A3B8',
          alElegir: triage ? () => abrirBandeja({ triage }) : undefined,
        };
      });

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="space-y-4 pb-6">
        <header className="vidrio flex flex-col gap-4 rounded-2xl px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="flex items-center gap-2.5 text-xl font-semibold tracking-tight text-texto">
              <ChartColumn aria-hidden strokeWidth={1.75} className="size-5 text-primario" />
              Indicadores clínicos
            </h2>
            <p className="mt-0.5 flex items-center gap-2 text-sm text-texto-secundario">
              Historias abiertas en el rango, calculadas por el backend.
              {actualizando && <LoaderCircle aria-label="Actualizando" className="size-3.5 animate-spin" />}
            </p>
          </div>
          <SelectorRango key={`${desde}-${hasta}`} desde={desde} hasta={hasta} atajos={ATAJOS_INDICADORES} alCambiar={cambiarRango} />
        </header>

        {indicadores.isError && indicadores.error.estado === 422 && <AlertaError error={indicadores.error} />}

        {indicadores.isPending ? (
          <div role="status" className="grid gap-4 lg:grid-cols-2">
            <span className="sr-only">Calculando indicadores…</span>
            {Array.from({ length: 4 }, (_, indice) => (
              <div key={indice} className="h-48 animate-pulse rounded-2xl bg-white/50" />
            ))}
          </div>
        ) : indicadores.isError && indicadores.error.estado !== 422 ? (
          <section className="vidrio rounded-2xl">
            <EstadoError
              titulo={indicadores.error.estado === 403 ? 'No tienes permiso para ver los indicadores' : 'No fue posible calcular los indicadores'}
              mensaje={indicadores.error.message}
              alReintentar={() => void indicadores.refetch()}
            />
          </section>
        ) : indicadores.data ? (
          <Contenido datos={indicadores.data} actualizando={actualizando} abrirBandeja={abrirBandeja} partes={partes} filasTriage={filasTriage} />
        ) : null}
      </div>
    </div>
  );
}
