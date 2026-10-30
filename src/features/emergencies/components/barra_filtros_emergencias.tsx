import { Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { claseControlFiltro, SelectorFiltro } from '../../../components/forms/selector_filtro';
import { useValorRetrasado } from '../../../hooks/use_valor_retrasado';
import {
  ESTADOS_EMERGENCIA,
  ETIQUETAS_ESTADO_EMERGENCIA,
  ETIQUETAS_PRIORIDAD,
  ETIQUETAS_TIPO_INCIDENTE,
  PRIORIDADES,
  TIPOS_INCIDENTE,
} from '../constants/catalogos_emergencia';
import type { CambiosFiltrosEmergencias, VistaEmergencias } from '../hooks/use_filtros_emergencias';
import type { FiltrosEmergencias } from '../types/emergencia.types';

const RETRASO_BUSQUEDA_MS = 350;

const OPCIONES_PRIORIDAD = PRIORIDADES.map((prioridad) => ({
  valor: prioridad,
  texto: ETIQUETAS_PRIORIDAD[prioridad],
}));
const OPCIONES_TIPO = TIPOS_INCIDENTE.map((tipo) => ({ valor: tipo, texto: ETIQUETAS_TIPO_INCIDENTE[tipo] }));
const OPCIONES_ESTADO = ESTADOS_EMERGENCIA.map((estado) => ({
  valor: estado,
  texto: ETIQUETAS_ESTADO_EMERGENCIA[estado],
}));

interface PropiedadesBarraFiltrosEmergencias {
  vista: VistaEmergencias;
  filtros: FiltrosEmergencias;
  hayFiltrosActivos: boolean;
  alCambiar: (cambios: CambiosFiltrosEmergencias) => void;
  alLimpiar: () => void;
}

interface PropiedadesCampoFecha {
  etiqueta: string;
  valor: string | undefined;
  minimo?: string;
  maximo?: string;
  alCambiar: (valor: string | undefined) => void;
}

function CampoFecha({ etiqueta, valor, minimo, maximo, alCambiar }: PropiedadesCampoFecha) {
  return (
    <label className="flex items-center gap-2 text-[13px] text-texto-secundario">
      {etiqueta}
      <input
        type="date"
        value={valor ?? ''}
        min={minimo}
        max={maximo}
        onChange={(evento) => alCambiar(evento.target.value || undefined)}
        className={`${claseControlFiltro} min-w-0 flex-1 px-3 sm:w-40 sm:flex-none`}
      />
    </label>
  );
}

export function BarraFiltrosEmergencias({
  vista,
  filtros,
  hayFiltrosActivos,
  alCambiar,
  alLimpiar,
}: PropiedadesBarraFiltrosEmergencias) {
  const [busqueda, setBusqueda] = useState(filtros.busqueda ?? '');
  const busquedaRetrasada = useValorRetrasado(busqueda.trim(), RETRASO_BUSQUEDA_MS);

  useEffect(() => {
    if (busquedaRetrasada !== (filtros.busqueda ?? '')) {
      alCambiar({ busqueda: busquedaRetrasada || undefined });
    }
  }, [busquedaRetrasada, filtros.busqueda, alCambiar]);

  const limpiar = () => {
    setBusqueda('');
    alLimpiar();
  };

  return (
    <div role="search" className="flex flex-col gap-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative min-w-0 flex-1 sm:min-w-64">
          <Search
            aria-hidden
            strokeWidth={1.75}
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-texto-secundario"
          />
          <input
            type="search"
            value={busqueda}
            maxLength={100}
            onChange={(evento) => setBusqueda(evento.target.value)}
            placeholder="Buscar por número, descripción, dirección o informante"
            aria-label="Buscar emergencias"
            className={`${claseControlFiltro} w-full pr-3 pl-10 placeholder:text-texto-secundario/80`}
          />
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex">
          <SelectorFiltro
            etiqueta="Filtrar por prioridad"
            valor={filtros.prioridad}
            opciones={OPCIONES_PRIORIDAD}
            textoTodos="Toda prioridad"
            alCambiar={(prioridad) => alCambiar({ prioridad })}
          />
          <SelectorFiltro
            etiqueta="Filtrar por tipo de incidente"
            valor={filtros.tipoIncidente}
            opciones={OPCIONES_TIPO}
            textoTodos="Todos los tipos"
            alCambiar={(tipoIncidente) => alCambiar({ tipoIncidente })}
          />
          {vista === 'historial' && (
            <SelectorFiltro
              etiqueta="Filtrar por estado"
              valor={filtros.estado}
              opciones={OPCIONES_ESTADO}
              textoTodos="Todos los estados"
              alCambiar={(estado) => alCambiar({ estado })}
            />
          )}
        </div>
      </div>

      {(vista === 'historial' || hayFiltrosActivos) && (
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          {vista === 'historial' && (
            <fieldset className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <legend className="sr-only">Fecha de recepción</legend>
              <CampoFecha
                etiqueta="Desde"
                valor={filtros.desde}
                maximo={filtros.hasta}
                alCambiar={(desde) => alCambiar({ desde })}
              />
              <CampoFecha
                etiqueta="Hasta"
                valor={filtros.hasta}
                minimo={filtros.desde}
                alCambiar={(hasta) => alCambiar({ hasta })}
              />
            </fieldset>
          )}
          {hayFiltrosActivos && (
            <button
              type="button"
              onClick={limpiar}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl px-3 text-sm text-texto-secundario transition-colors duration-150 hover:bg-white/70 hover:text-texto sm:ml-auto"
            >
              <X aria-hidden strokeWidth={1.75} className="size-4" />
              Limpiar filtros
            </button>
          )}
        </div>
      )}
    </div>
  );
}
