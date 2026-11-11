import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { claseControlFiltro, SelectorFiltro } from '../../../components/forms/selector_filtro';
import { useValorRetrasado } from '../../../hooks/use_valor_retrasado';
import type { FiltrosListasChequeo } from '../types/lista_chequeo.types';

const RETRASO_BUSQUEDA_MS = 350;

type EstadoFiltro = 'activa' | 'inactiva';
const OPCIONES_ESTADO = [
  { valor: 'activa', texto: 'Activa' },
  { valor: 'inactiva', texto: 'Inactivas' },
] as const;

interface PropiedadesBarraFiltrosListas {
  filtros: FiltrosListasChequeo;
  alCambiar: (cambios: Partial<Omit<FiltrosListasChequeo, 'limite'>>) => void;
}

export function BarraFiltrosListas({ filtros, alCambiar }: PropiedadesBarraFiltrosListas) {
  const [busqueda, setBusqueda] = useState(filtros.busqueda ?? '');
  const busquedaRetrasada = useValorRetrasado(busqueda.trim(), RETRASO_BUSQUEDA_MS);

  useEffect(() => {
    if (busquedaRetrasada !== (filtros.busqueda ?? '')) alCambiar({ busqueda: busquedaRetrasada || undefined });
  }, [busquedaRetrasada, filtros.busqueda, alCambiar]);

  const estado: EstadoFiltro | undefined =
    filtros.activa === undefined ? undefined : filtros.activa ? 'activa' : 'inactiva';

  return (
    <div role="search" className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <div className="relative min-w-0 flex-1 sm:max-w-md">
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
          placeholder="Buscar por nombre"
          aria-label="Buscar listas"
          className={`${claseControlFiltro} w-full pr-3 pl-10 placeholder:text-texto-secundario/80`}
        />
      </div>
      <SelectorFiltro<EstadoFiltro>
        etiqueta="Filtrar por estado"
        valor={estado}
        opciones={OPCIONES_ESTADO}
        textoTodos="Todas"
        alCambiar={(valor) => alCambiar({ activa: valor === undefined ? undefined : valor === 'activa' })}
      />
    </div>
  );
}
