import { ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { MenuAcciones, type AccionMenu } from '../../../components/ui/menu_acciones';

export interface Columna<T> {
  clave: string;
  encabezado: string;
  celda: (fila: T) => ReactNode;
  /** Clases de la celda y su encabezado (ancho, alineación, `hidden lg:table-cell`…). */
  clase?: string;
}

interface PropiedadesTablaInventario<T> {
  filas: readonly T[];
  columnas: readonly Columna<T>[];
  claveFila: (fila: T) => string;
  /** Nombre de la fila para lectores de pantalla ("Acciones para …", "Abrir …"). */
  etiquetaFila: (fila: T) => string;
  alSeleccionar?: (fila: T) => void;
  acciones?: (fila: T) => AccionMenu[];
  /** Resalta filas que requieren atención (p. ej. no utilizables). */
  resaltar?: (fila: T) => boolean;
}

/**
 * Tabla compacta en escritorio y lista apilada en móvil. La primera columna es el título de
 * cada elemento en móvil; las demás se muestran con su encabezado.
 */
export function TablaInventario<T>({
  filas,
  columnas,
  claveFila,
  etiquetaFila,
  alSeleccionar,
  acciones,
  resaltar,
}: PropiedadesTablaInventario<T>) {
  const [principal, ...resto] = columnas;
  const conCierre = Boolean(acciones ?? alSeleccionar);

  const cierre = (fila: T) => {
    const lista = acciones?.(fila) ?? [];
    if (lista.length > 0) return <MenuAcciones etiqueta={`Acciones para ${etiquetaFila(fila)}`} acciones={lista} />;
    if (!alSeleccionar) return null;
    return (
      <button
        type="button"
        onClick={(evento) => {
          evento.stopPropagation();
          alSeleccionar(fila);
        }}
        aria-label={`Abrir ${etiquetaFila(fila)}`}
        className="ml-auto flex size-8 items-center justify-center rounded-lg text-texto-secundario hover:bg-white hover:text-primario focus-visible:ring-2 focus-visible:ring-primario/40 focus-visible:outline-none"
      >
        <ChevronRight aria-hidden strokeWidth={1.75} className="size-4" />
      </button>
    );
  };

  return (
    <>
      <table className="hidden w-full text-left md:table">
        <thead>
          <tr className="border-b border-borde/80 text-xs font-medium tracking-wide text-texto-secundario uppercase">
            {columnas.map((columna, indice) => (
              <th key={columna.clave} scope="col" className={`py-3 font-medium ${indice === 0 ? 'pr-4 pl-5' : 'px-4'} ${columna.clase ?? ''}`}>
                {columna.encabezado}
              </th>
            ))}
            {conCierre && (
              <th scope="col" className="w-14 py-3 pr-5 pl-2">
                <span className="sr-only">Acciones</span>
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-borde/60">
          {filas.map((fila) => (
            <tr
              key={claveFila(fila)}
              onClick={alSeleccionar ? () => alSeleccionar(fila) : undefined}
              className={`transition-colors duration-150 hover:bg-white/50 ${alSeleccionar ? 'cursor-pointer' : ''} ${
                resaltar?.(fila) ? 'bg-critico/4' : ''
              }`}
            >
              {columnas.map((columna, indice) => (
                <td key={columna.clave} className={`py-3 text-sm text-texto ${indice === 0 ? 'pr-4 pl-5' : 'px-4'} ${columna.clase ?? ''}`}>
                  {columna.celda(fila)}
                </td>
              ))}
              {conCierre && <td className="py-3 pr-5 pl-2 text-right">{cierre(fila)}</td>}
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="divide-y divide-borde/60 md:hidden">
        {filas.map((fila) => (
          <li
            key={claveFila(fila)}
            onClick={alSeleccionar ? () => alSeleccionar(fila) : undefined}
            className={`flex gap-3 px-4 py-4 ${alSeleccionar ? 'cursor-pointer' : ''} ${resaltar?.(fila) ? 'bg-critico/4' : ''}`}
          >
            <div className="min-w-0 flex-1 space-y-2">
              {principal && <div className="text-sm text-texto">{principal.celda(fila)}</div>}
              <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 text-[13px]">
                {resto.map((columna) => (
                  <div key={columna.clave} className="contents">
                    <dt className="text-texto-secundario">{columna.encabezado}</dt>
                    <dd className="min-w-0 text-texto">{columna.celda(fila)}</dd>
                  </div>
                ))}
              </dl>
            </div>
            {conCierre && <div className="shrink-0">{cierre(fila)}</div>}
          </li>
        ))}
      </ul>
    </>
  );
}
