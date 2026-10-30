import { Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { claseControlFiltro, SelectorFiltro } from '../../../components/forms/selector_filtro';
import { useValorRetrasado } from '../../../hooks/use_valor_retrasado';
import { ESTADOS_OPERATIVOS, ETIQUETAS_ESTADO_OPERATIVO } from '../constants/estados_operativos';
import type { CambiosFiltrosAmbulancias } from '../hooks/use_filtros_ambulancias';
import type { EstadoOperativo, FiltrosAmbulancias, TipoAmbulancia } from '../types/ambulancia.types';
import { ESTILOS_ESTADO_OPERATIVO } from '../constants/estilos_estado_operativo';

const RETRASO_BUSQUEDA_MS = 350;

interface PropiedadesBarraFiltrosAmbulancias {
  filtros: FiltrosAmbulancias;
  tipos: TipoAmbulancia[] | undefined;
  hayFiltrosActivos: boolean;
  alCambiar: (cambios: CambiosFiltrosAmbulancias) => void;
}

interface PropiedadesFiltroEstado {
  valor: EstadoOperativo | undefined;
  alCambiar: (valor: EstadoOperativo | undefined) => void;
}

const claseOpcionEstado =
  'inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-3 text-[13px] font-medium whitespace-nowrap transition-[background-color,color,box-shadow] duration-150 focus-visible:ring-2 focus-visible:ring-primario/40 focus-visible:outline-none';

function FiltroEstado({ valor, alCambiar }: PropiedadesFiltroEstado) {
  return (
    <div
      role="group"
      aria-label="Filtrar por estado"
      className="campo-vidrio flex gap-1 overflow-x-auto rounded-xl p-1"
    >
      <button
        type="button"
        aria-pressed={valor === undefined}
        onClick={() => alCambiar(undefined)}
        className={`${claseOpcionEstado} ${
          valor === undefined
            ? 'bg-white text-texto shadow-vidrio'
            : 'text-texto-secundario hover:bg-white/70 hover:text-texto'
        }`}
      >
        Todos
      </button>
      {ESTADOS_OPERATIVOS.map((estado) => {
        const { icono: Icono, color } = ESTILOS_ESTADO_OPERATIVO[estado];
        const activo = estado === valor;
        return (
          <button
            key={estado}
            type="button"
            aria-pressed={activo}
            onClick={() => alCambiar(activo ? undefined : estado)}
            className={`${claseOpcionEstado} ${
              activo
                ? 'bg-white text-texto shadow-vidrio'
                : 'text-texto-secundario hover:bg-white/70 hover:text-texto'
            }`}
          >
            <Icono aria-hidden strokeWidth={2} className={`size-3.5 ${color}`} />
            {ETIQUETAS_ESTADO_OPERATIVO[estado]}
          </button>
        );
      })}
    </div>
  );
}

export function BarraFiltrosAmbulancias({
  filtros,
  tipos,
  hayFiltrosActivos,
  alCambiar,
}: PropiedadesBarraFiltrosAmbulancias) {
  const [busqueda, setBusqueda] = useState(filtros.busqueda ?? '');
  const busquedaRetrasada = useValorRetrasado(busqueda.trim(), RETRASO_BUSQUEDA_MS);

  useEffect(() => {
    if (busquedaRetrasada !== (filtros.busqueda ?? '')) {
      alCambiar({ busqueda: busquedaRetrasada || undefined });
    }
  }, [busquedaRetrasada, filtros.busqueda, alCambiar]);

  const limpiar = () => {
    setBusqueda('');
    alCambiar({ busqueda: undefined, estadoOperativo: undefined, tipoAmbulanciaId: undefined });
  };

  const opcionesTipo = (tipos ?? []).map((tipo) => ({ valor: tipo.id, texto: tipo.nombre }));

  return (
    <div role="search" className="flex flex-col gap-2 xl:flex-row xl:items-center">
      <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row">
        <div className="relative min-w-0 flex-1 sm:max-w-80">
          <Search
            aria-hidden
            strokeWidth={1.75}
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-texto-secundario"
          />
          <input
            type="search"
            value={busqueda}
            maxLength={30}
            onChange={(evento) => setBusqueda(evento.target.value)}
            placeholder="Buscar por código o placa"
            aria-label="Buscar ambulancias"
            className={`${claseControlFiltro} w-full pr-3 pl-10 placeholder:text-texto-secundario/80`}
          />
        </div>
        <SelectorFiltro<string>
          etiqueta="Filtrar por tipo"
          valor={filtros.tipoAmbulanciaId}
          opciones={opcionesTipo}
          textoTodos="Todos los tipos"
          deshabilitado={!tipos}
          alCambiar={(tipoAmbulanciaId) => alCambiar({ tipoAmbulanciaId })}
        />
      </div>

      <div className="flex min-w-0 items-center gap-2">
        <div className="min-w-0">
          <FiltroEstado
            valor={filtros.estadoOperativo}
            alCambiar={(estadoOperativo) => alCambiar({ estadoOperativo })}
          />
        </div>
        {hayFiltrosActivos && (
          <button
            type="button"
            onClick={limpiar}
            aria-label="Limpiar filtros"
            title="Limpiar filtros"
            className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl px-3 text-sm text-texto-secundario transition-colors duration-150 hover:bg-white/70 hover:text-texto"
          >
            <X aria-hidden strokeWidth={1.75} className="size-4" />
            <span className="hidden 2xl:inline">Limpiar</span>
          </button>
        )}
      </div>
    </div>
  );
}
