import { Search } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { SelectorBuscable } from '../../../components/forms/selector_buscable';
import { claseControlFiltro } from '../../../components/forms/selector_filtro';
import type { OpcionBuscable } from '../../../utils/opciones_buscables';
import { useValorRetrasado } from '../../../hooks/use_valor_retrasado';

const RETRASO_BUSQUEDA_MS = 350;

interface PropiedadesBuscador {
  etiqueta: string;
  placeholder: string;
  valor: string | undefined;
  alCambiar: (valor: string | undefined) => void;
}

/** Búsqueda con espera, para no consultar en cada tecla. */
export function Buscador({ etiqueta, placeholder, valor, alCambiar }: PropiedadesBuscador) {
  const [texto, setTexto] = useState(valor ?? '');
  const retrasado = useValorRetrasado(texto.trim(), RETRASO_BUSQUEDA_MS);

  useEffect(() => {
    if (retrasado !== (valor ?? '')) alCambiar(retrasado || undefined);
  }, [retrasado, valor, alCambiar]);

  return (
    <div className="relative min-w-0 flex-1 sm:max-w-sm sm:min-w-56">
      <Search
        aria-hidden
        strokeWidth={1.75}
        className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-texto-secundario"
      />
      <input
        type="search"
        value={texto}
        maxLength={100}
        onChange={(evento) => setTexto(evento.target.value)}
        placeholder={placeholder}
        aria-label={etiqueta}
        className={`${claseControlFiltro} w-full pr-3 pl-10 placeholder:text-texto-secundario/80`}
      />
    </div>
  );
}

interface PropiedadesCampoDia {
  etiqueta: string;
  valor?: string;
  minimo?: string;
  maximo?: string;
  alCambiar: (valor: string | undefined) => void;
}

export function CampoDia({ etiqueta, valor, minimo, maximo, alCambiar }: PropiedadesCampoDia) {
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

/** Contenedor de una barra de filtros. */
export function BarraFiltros({ children }: { children: ReactNode }) {
  return (
    <div role="search" className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      {children}
    </div>
  );
}

interface PropiedadesFiltroBuscable {
  etiqueta: string;
  valor: string | undefined;
  opciones: readonly OpcionBuscable[];
  /** Texto de la opción que quita el filtro. */
  textoTodos: string;
  alCambiar: (valor: string | undefined) => void;
}

/** Filtro para listas largas (insumos, ubicaciones): se escribe para encontrar la opción. */
export function FiltroBuscable({ etiqueta, valor, opciones, textoTodos, alCambiar }: PropiedadesFiltroBuscable) {
  return (
    <div className="relative w-full sm:w-56">
      <SelectorBuscable
        etiqueta={etiqueta}
        opciones={[{ valor: '', texto: textoTodos }, ...opciones]}
        valor={valor ?? ''}
        alCambiar={(nuevo) => alCambiar(nuevo || undefined)}
        placeholder={textoTodos}
        claseEntrada={`${claseControlFiltro} w-full pl-3 placeholder:text-texto`}
      />
    </div>
  );
}
