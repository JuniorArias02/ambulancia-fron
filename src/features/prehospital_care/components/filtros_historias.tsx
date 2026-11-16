import {
  ChevronDown,
  CircleCheck,
  CircleDashed,
  CircleSlash,
  FileSignature,
  FileText,
  Layers,
  Search,
  SlidersHorizontal,
  Siren,
  Stethoscope,
  X,
} from 'lucide-react';
import { useId, useState, type FormEvent, type ReactNode } from 'react';
import { FiltroBuscable } from '../../../components/forms/filtro_buscable';
import { ETIQUETAS_MODALIDAD, MODALIDADES_SERVICIO } from '../../../constants/modalidades_servicio';
import { claseControlFiltro, SelectorFiltro } from '../../../components/forms/selector_filtro';
import { SelectorSegmentado, type OpcionSegmentada } from '../../../components/ui/selector_segmentado';
import {
  CAMPOS_FECHA,
  DESENLACES,
  ESTADOS_FILTRO,
  ETIQUETAS_DESENLACE,
  ETIQUETAS_REGIMEN,
  ETIQUETAS_TIPO_EVENTO,
  REGIMENES,
  TIPOS_EVENTO,
  TRIAGE,
  TRIAGES,
} from '../constants/catalogos_clinicos';
import type { CambiosUrl } from '../hooks/use_filtros_historias';
import type { TextosBusqueda } from '../providers/contexto_busqueda';
import type { CampoFecha, EstadoFiltroHistoria, FiltrosHistorias } from '../types/historia_clinica.types';
import { ATAJOS_RANGO } from '../utils/rangos_fecha';
import { PuntoColor } from './etiquetas';
import { SelectorRango } from './selector_rango';

export interface ChipFiltro {
  clave: string;
  texto: string;
  quitar: () => void;
}

export interface OpcionesFiltros {
  ambulancias: { valor: string; texto: string; detalle?: string }[];
  instituciones: { valor: string; texto: string; detalle?: string }[];
  profesionales: { valor: string; texto: string; detalle?: string }[];
  cargando: boolean;
}

interface PropiedadesFiltrosHistorias {
  filtros: FiltrosHistorias;
  textos: TextosBusqueda;
  chips: readonly ChipFiltro[];
  opciones: OpcionesFiltros;
  masFiltrosAbiertos: boolean;
  alAlternarMasFiltros: () => void;
  alCambiar: (cambios: CambiosUrl) => void;
  alBuscar: (textos: TextosBusqueda) => void;
  alLimpiar: () => void;
}

const ICONOS_CAMPO_FECHA: Record<CampoFecha, OpcionSegmentada<CampoFecha>['icono']> = {
  atencion: Stethoscope,
  evento: Siren,
  cierre: FileSignature,
};

const OPCIONES_CAMPO_FECHA = CAMPOS_FECHA.map(({ valor, texto }) => ({ valor, texto, icono: ICONOS_CAMPO_FECHA[valor] }));

const ICONOS_ESTADO: Record<EstadoFiltroHistoria, OpcionSegmentada<EstadoFiltroHistoria>['icono']> = {
  vigentes: FileText,
  borrador: CircleDashed,
  cerrada: CircleCheck,
  anulada: CircleSlash,
  todos: Layers,
};

const OPCIONES_ESTADO = ESTADOS_FILTRO.map(({ valor, texto }) => ({ valor, texto, icono: ICONOS_ESTADO[valor] }));

const claseEtiquetaCampo = 'text-[13px] font-medium text-texto-secundario';

function CampoTexto({
  etiqueta,
  nombre,
  valor,
  placeholder,
  alCambiar,
  ayuda,
}: {
  etiqueta: string;
  nombre: keyof TextosBusqueda;
  valor: string;
  placeholder: string;
  alCambiar: (nombre: keyof TextosBusqueda, valor: string) => void;
  ayuda?: string;
}) {
  const id = useId();
  return (
    <div className="min-w-0 space-y-1.5">
      <label htmlFor={id} className={claseEtiquetaCampo}>
        {etiqueta}
      </label>
      <input
        id={id}
        type="search"
        value={valor}
        maxLength={120}
        autoComplete="off"
        spellCheck={false}
        placeholder={placeholder}
        title={ayuda}
        onChange={(evento) => alCambiar(nombre, evento.target.value)}
        className={`${claseControlFiltro} w-full px-3 placeholder:text-texto-secundario/70`}
      />
    </div>
  );
}

function SelectorTriage({ valor, alCambiar }: { valor: FiltrosHistorias['triage']; alCambiar: (cambios: CambiosUrl) => void }) {
  return (
    <div role="group" aria-label="Triage" className="flex flex-wrap gap-1.5">
      {TRIAGES.map((triage) => {
        const activo = valor === triage;
        return (
          <button
            key={triage}
            type="button"
            aria-pressed={activo}
            onClick={() => alCambiar({ triage: activo ? undefined : triage })}
            className={`inline-flex h-9 items-center gap-2 rounded-xl px-3 text-[13px] font-medium transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-primario/40 focus-visible:outline-none ${
              activo ? 'bg-primario/10 text-primario ring-1 ring-primario/30' : 'campo-vidrio text-texto hover:bg-white'
            }`}
          >
            <PuntoColor color={TRIAGE[triage].color} />
            {TRIAGE[triage].corta}
          </button>
        );
      })}
    </div>
  );
}

function Casilla({ etiqueta, marcada, alCambiar }: { etiqueta: string; marcada: boolean; alCambiar: (marcada: boolean) => void }) {
  return (
    <label className="inline-flex h-10 cursor-pointer items-center gap-2.5 text-sm text-texto">
      <input
        type="checkbox"
        checked={marcada}
        onChange={(evento) => alCambiar(evento.target.checked)}
        className="size-4 rounded border-borde accent-primario"
      />
      {etiqueta}
    </label>
  );
}

function Campo({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
  return (
    <div className="min-w-0 space-y-1.5">
      <p className={claseEtiquetaCampo}>{etiqueta}</p>
      {children}
    </div>
  );
}

const valorBooleano = (valor: boolean | undefined) => (valor === undefined ? undefined : valor ? 'si' : 'no');
const deBooleano = (valor: string | undefined) => (valor === 'si' ? true : valor === 'no' ? false : undefined);

/** Los textos se buscan con Enter o "Buscar"; los selects, al cambiar. */
export function FiltrosHistorias({
  filtros,
  textos,
  chips,
  opciones,
  masFiltrosAbiertos,
  alAlternarMasFiltros,
  alCambiar,
  alBuscar,
  alLimpiar,
}: PropiedadesFiltrosHistorias) {
  const [borrador, setBorrador] = useState<TextosBusqueda>(textos);
  const [textosAplicados, setTextosAplicados] = useState(textos);
  // Si los textos cambian desde fuera (limpiar o quitar un chip), el borrador se pone al día.
  if (textosAplicados !== textos) {
    setTextosAplicados(textos);
    setBorrador(textos);
  }
  const cambiarTexto = (nombre: keyof TextosBusqueda, valor: string) =>
    setBorrador((actual) => ({ ...actual, [nombre]: valor }));

  const buscar = (evento: FormEvent) => {
    evento.preventDefault();
    alBuscar(borrador);
  };

  const idPanel = useId();
  const cantidadAvanzados = chips.filter((chip) => !['ingreso', 'numeroHistoria', 'documento', 'nombre'].includes(chip.clave)).length;

  return (
    <form role="search" aria-label="Buscar historias clínicas" onSubmit={buscar} noValidate className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <SelectorRango
          key={`${filtros.desde}-${filtros.hasta}`}
          desde={filtros.desde ?? ''}
          hasta={filtros.hasta ?? ''}
          atajos={ATAJOS_RANGO}
          alCambiar={alCambiar}
        />
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-[13px] whitespace-nowrap text-texto-secundario">Fecha de</span>
          <SelectorSegmentado
            etiqueta="Fecha por la que se busca y se ordena"
            valor={filtros.campoFecha ?? 'atencion'}
            opciones={OPCIONES_CAMPO_FECHA}
            alCambiar={(campoFecha) => alCambiar({ campoFecha: campoFecha === 'atencion' ? undefined : campoFecha })}
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[repeat(4,minmax(0,1fr))_auto] xl:items-end">
        <CampoTexto etiqueta="N.º de ingreso" nombre="ingreso" valor={borrador.ingreso ?? ''} placeholder="EMG-20261114 o 0003" alCambiar={cambiarTexto} />
        <CampoTexto etiqueta="N.º de historia" nombre="numeroHistoria" valor={borrador.numeroHistoria ?? ''} placeholder="HC-20261025-0001" alCambiar={cambiarTexto} />
        <CampoTexto
          etiqueta="Documento del paciente"
          nombre="documento"
          valor={borrador.documento ?? ''}
          placeholder="Número exacto"
          ayuda="Se ignoran puntos, guiones y espacios"
          alCambiar={cambiarTexto}
        />
        <CampoTexto
          etiqueta="Nombre o apellido"
          nombre="nombre"
          valor={borrador.nombre ?? ''}
          placeholder="Ej.: carlos per"
          ayuda="Mínimo 2 letras; cada palabra busca el inicio de un nombre o apellido"
          alCambiar={cambiarTexto}
        />
        <button
          type="submit"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primario px-5 text-sm font-semibold text-white shadow-primario transition-colors duration-150 hover:bg-primario-hover focus-visible:ring-4 focus-visible:ring-primario/25 focus-visible:outline-none sm:col-span-2 xl:col-span-1"
        >
          <Search aria-hidden strokeWidth={1.75} className="size-4" />
          Buscar
        </button>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="overflow-x-auto">
          <SelectorSegmentado
            etiqueta="Estado de la historia"
            valor={filtros.estado ?? 'vigentes'}
            opciones={OPCIONES_ESTADO}
            alCambiar={(estado) => alCambiar({ estado: estado === 'vigentes' ? undefined : estado })}
          />
        </div>
        <button
          type="button"
          onClick={alAlternarMasFiltros}
          aria-expanded={masFiltrosAbiertos}
          aria-controls={idPanel}
          className={`inline-flex h-10 items-center gap-2 self-start rounded-xl px-4 text-sm font-medium transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-primario/40 focus-visible:outline-none md:self-auto ${
            masFiltrosAbiertos ? 'bg-primario/10 text-primario' : 'campo-vidrio text-texto hover:bg-white'
          }`}
        >
          <SlidersHorizontal aria-hidden strokeWidth={1.75} className="size-4" />
          Más filtros
          {cantidadAvanzados > 0 && (
            <span className="rounded-full bg-primario px-1.5 text-xs font-semibold text-white tabular-nums">{cantidadAvanzados}</span>
          )}
          <ChevronDown aria-hidden strokeWidth={1.75} className={`size-4 transition-transform duration-150 ${masFiltrosAbiertos ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {masFiltrosAbiertos && (
        <div id={idPanel} className="grid gap-4 rounded-2xl border border-borde/70 bg-white/50 p-4 sm:grid-cols-2 lg:grid-cols-3">
          <Campo etiqueta="Triage">
            <SelectorTriage valor={filtros.triage} alCambiar={alCambiar} />
          </Campo>
          <Campo etiqueta="Desenlace">
            <SelectorFiltro
              etiqueta="Desenlace"
              valor={filtros.desenlace}
              opciones={DESENLACES.map((valor) => ({ valor, texto: ETIQUETAS_DESENLACE[valor] }))}
              textoTodos="Todos"
              alCambiar={(desenlace) => alCambiar({ desenlace })}
            />
          </Campo>
          <Campo etiqueta="Tipo de evento">
            <SelectorFiltro
              etiqueta="Tipo de evento"
              valor={filtros.tipoEvento}
              opciones={TIPOS_EVENTO.map((valor) => ({ valor, texto: ETIQUETAS_TIPO_EVENTO[valor] }))}
              textoTodos="Todos"
              alCambiar={(tipoEvento) => alCambiar({ tipoEvento })}
            />
          </Campo>
          <Campo etiqueta="Tipo de servicio">
            <SelectorFiltro
              etiqueta="Tipo de servicio"
              valor={filtros.modalidad}
              opciones={MODALIDADES_SERVICIO.map((valor) => ({ valor, texto: ETIQUETAS_MODALIDAD[valor] }))}
              textoTodos="Todos"
              alCambiar={(modalidad) => alCambiar({ modalidad })}
            />
          </Campo>
          <Campo etiqueta="Ambulancia">
            <FiltroBuscable
              etiqueta="Ambulancia"
              valor={filtros.ambulanciaId}
              opciones={opciones.ambulancias}
              textoTodos={opciones.cargando ? 'Cargando…' : 'Todas'}
              alCambiar={(ambulanciaId) => alCambiar({ ambulanciaId })}
            />
          </Campo>
          <Campo etiqueta="Institución de destino">
            <FiltroBuscable
              etiqueta="Institución de destino"
              valor={filtros.institucionDestinoId}
              opciones={opciones.instituciones}
              textoTodos={opciones.cargando ? 'Cargando…' : 'Todas'}
              alCambiar={(institucionDestinoId) => alCambiar({ institucionDestinoId })}
            />
          </Campo>
          <Campo etiqueta="Profesional (creó o cerró)">
            <FiltroBuscable
              etiqueta="Profesional"
              valor={filtros.profesionalId}
              opciones={opciones.profesionales}
              textoTodos={opciones.cargando ? 'Cargando…' : 'Todos'}
              alCambiar={(profesionalId) => alCambiar({ profesionalId })}
            />
          </Campo>
          <CampoTexto
            etiqueta="EPS o aseguradora"
            nombre="eps"
            valor={borrador.eps ?? ''}
            placeholder="Una parte del nombre; Enter para buscar"
            alCambiar={cambiarTexto}
          />
          <Campo etiqueta="Régimen de afiliación">
            <SelectorFiltro
              etiqueta="Régimen de afiliación"
              valor={filtros.regimen}
              opciones={REGIMENES.map((valor) => ({ valor, texto: ETIQUETAS_REGIMEN[valor] }))}
              textoTodos="Todos"
              alCambiar={(regimen) => alCambiar({ regimen })}
            />
          </Campo>
          <Campo etiqueta="Firma">
            <SelectorFiltro
              etiqueta="Firma"
              valor={valorBooleano(filtros.firmada)}
              opciones={[
                { valor: 'si', texto: 'Con firma' },
                { valor: 'no', texto: 'Sin firma' },
              ]}
              textoTodos="Con o sin firma"
              alCambiar={(valor) => alCambiar({ firmada: deBooleano(valor) })}
            />
          </Campo>
          <div className="flex flex-col justify-end gap-1 sm:col-span-2 lg:col-span-3 lg:flex-row lg:gap-6">
            <Casilla
              etiqueta="Con riesgo de caída alto"
              marcada={filtros.riesgoCaidaAlto === true}
              alCambiar={(marcada) => alCambiar({ riesgoCaidaAlto: marcada ? true : undefined })}
            />
            <Casilla
              etiqueta="Solo pacientes sin identificar (NN)"
              marcada={filtros.soloNn === true}
              alCambiar={(marcada) => alCambiar({ soloNn: marcada ? true : undefined })}
            />
          </div>
        </div>
      )}

      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[13px] text-texto-secundario">Filtros activos:</span>
          {chips.map((chip) => (
            <span
              key={chip.clave}
              className="inline-flex h-8 items-center gap-1 rounded-full bg-primario/8 pr-1 pl-3 text-[13px] font-medium text-texto"
            >
              {chip.texto}
              <button
                type="button"
                onClick={chip.quitar}
                aria-label={`Quitar filtro ${chip.texto}`}
                title="Quitar filtro"
                className="flex size-6 items-center justify-center rounded-full text-texto-secundario transition-colors hover:bg-white hover:text-critico focus-visible:ring-2 focus-visible:ring-primario/40 focus-visible:outline-none"
              >
                <X aria-hidden strokeWidth={2} className="size-3.5" />
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={alLimpiar}
            className="ml-1 text-[13px] font-medium text-primario hover:text-primario-hover hover:underline"
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </form>
  );
}
