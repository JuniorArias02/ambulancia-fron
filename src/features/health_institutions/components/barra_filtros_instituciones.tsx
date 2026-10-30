import { Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { claseControlFiltro, SelectorFiltro } from '../../../components/forms/selector_filtro';
import { useValorRetrasado } from '../../../hooks/use_valor_retrasado';
import { ETIQUETAS_NIVEL, NIVELES_COMPLEJIDAD } from '../constants/instituciones';
import type { CambiosFiltrosInstituciones, FiltroEstadoInstitucion } from '../hooks/use_filtros_instituciones';
import type { FiltrosInstituciones } from '../types/institucion.types';

const RETRASO_BUSQUEDA_MS = 350;

const OPCIONES_NIVEL = NIVELES_COMPLEJIDAD.map((nivel) => ({ valor: nivel, texto: ETIQUETAS_NIVEL[nivel] }));
const OPCIONES_ESTADO: { valor: FiltroEstadoInstitucion; texto: string }[] = [
  { valor: 'activas', texto: 'Activas' },
  { valor: 'inactivas', texto: 'Inactivas' },
];

interface PropiedadesBarraFiltrosInstituciones {
  filtros: FiltrosInstituciones;
  estado: FiltroEstadoInstitucion | undefined;
  mostrarEstado: boolean;
  hayFiltrosActivos: boolean;
  alCambiar: (cambios: CambiosFiltrosInstituciones) => void;
}

export function BarraFiltrosInstituciones({
  filtros,
  estado,
  mostrarEstado,
  hayFiltrosActivos,
  alCambiar,
}: PropiedadesBarraFiltrosInstituciones) {
  const [busqueda, setBusqueda] = useState(filtros.busqueda ?? '');
  const busquedaRetrasada = useValorRetrasado(busqueda.trim(), RETRASO_BUSQUEDA_MS);

  useEffect(() => {
    if (busquedaRetrasada !== (filtros.busqueda ?? '')) {
      alCambiar({ busqueda: busquedaRetrasada || undefined });
    }
  }, [busquedaRetrasada, filtros.busqueda, alCambiar]);

  const limpiar = () => {
    setBusqueda('');
    alCambiar({ busqueda: undefined, estado: undefined, nivelComplejidad: undefined });
  };

  return (
    <div role="search" className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
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
          placeholder="Buscar por nombre, código o dirección"
          aria-label="Buscar instituciones"
          className={`${claseControlFiltro} w-full pr-3 pl-10 placeholder:text-texto-secundario/80`}
        />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:flex">
        <SelectorFiltro
          etiqueta="Filtrar por nivel de complejidad"
          valor={filtros.nivelComplejidad}
          opciones={OPCIONES_NIVEL}
          textoTodos="Todo nivel"
          alCambiar={(nivelComplejidad) => alCambiar({ nivelComplejidad })}
        />
        {mostrarEstado && (
          <SelectorFiltro
            etiqueta="Filtrar por estado"
            valor={estado}
            opciones={OPCIONES_ESTADO}
            textoTodos="Activas e inactivas"
            alCambiar={(siguiente) => alCambiar({ estado: siguiente })}
          />
        )}
      </div>
      {hayFiltrosActivos && (
        <button
          type="button"
          onClick={limpiar}
          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl px-3 text-sm text-texto-secundario transition-colors duration-150 hover:bg-white/70 hover:text-texto"
        >
          <X aria-hidden strokeWidth={1.75} className="size-4" />
          Limpiar filtros
        </button>
      )}
    </div>
  );
}
