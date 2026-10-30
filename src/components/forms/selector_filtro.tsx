import { ChevronDown } from 'lucide-react';

export const claseControlFiltro =
  'campo-vidrio h-10 rounded-xl text-sm text-texto transition-[border-color,box-shadow] duration-150 focus:border-primario/60! focus:bg-white focus:ring-4 focus:ring-primario/12 focus:outline-none';

export interface OpcionFiltro<T extends string> {
  valor: T;
  texto: string;
}

interface PropiedadesSelectorFiltro<T extends string> {
  etiqueta: string;
  valor: T | undefined;
  opciones: readonly OpcionFiltro<T>[];
  textoTodos: string;
  deshabilitado?: boolean;
  alCambiar: (valor: T | undefined) => void;
}

/** Selector compacto de una barra de filtros; la opción vacía quita el filtro. */
export function SelectorFiltro<T extends string>({
  etiqueta,
  valor,
  opciones,
  textoTodos,
  deshabilitado = false,
  alCambiar,
}: PropiedadesSelectorFiltro<T>) {
  return (
    <div className="relative">
      <select
        aria-label={etiqueta}
        value={valor ?? ''}
        disabled={deshabilitado}
        onChange={(evento) =>
          alCambiar(opciones.find((opcion) => opcion.valor === evento.target.value)?.valor)
        }
        className={`${claseControlFiltro} w-full appearance-none pr-9 pl-3 disabled:opacity-60 sm:w-44`}
      >
        <option value="">{textoTodos}</option>
        {opciones.map((opcion) => (
          <option key={opcion.valor} value={opcion.valor}>
            {opcion.texto}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden
        strokeWidth={1.75}
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-texto-secundario"
      />
    </div>
  );
}
