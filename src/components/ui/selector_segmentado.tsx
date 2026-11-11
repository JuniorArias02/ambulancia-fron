import type { LucideIcon } from 'lucide-react';

export interface OpcionSegmentada<T extends string> {
  valor: T;
  texto: string;
  icono: LucideIcon;
}

interface PropiedadesSelectorSegmentado<T extends string> {
  etiqueta: string;
  valor: T;
  opciones: readonly OpcionSegmentada<T>[];
  alCambiar: (valor: T) => void;
}

/** Control segmentado para alternar vistas de una misma pantalla. */
export function SelectorSegmentado<T extends string>({
  etiqueta,
  valor,
  opciones,
  alCambiar,
}: PropiedadesSelectorSegmentado<T>) {
  return (
    <div role="group" aria-label={etiqueta} className="campo-vidrio inline-flex gap-1 rounded-xl p-1">
      {opciones.map(({ valor: opcion, texto, icono: Icono }) => {
        const activa = opcion === valor;
        return (
          <button
            key={opcion}
            type="button"
            aria-pressed={activa}
            onClick={() => alCambiar(opcion)}
            className={`inline-flex h-8 shrink-0 items-center gap-2 rounded-lg px-3 whitespace-nowrap text-sm font-medium transition-[background-color,color,box-shadow] duration-150 focus-visible:ring-2 focus-visible:ring-primario/40 focus-visible:outline-none ${
              activa ? 'bg-white text-primario shadow-vidrio' : 'text-texto-secundario hover:bg-white/70 hover:text-texto'
            }`}
          >
            <Icono aria-hidden strokeWidth={1.75} className="size-4" />
            {texto}
          </button>
        );
      })}
    </div>
  );
}
