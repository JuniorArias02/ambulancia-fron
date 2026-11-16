import { claseControlFiltro } from './selector_filtro';
import { SelectorBuscable } from './selector_buscable';
import type { OpcionBuscable } from '../../utils/opciones_buscables';

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
