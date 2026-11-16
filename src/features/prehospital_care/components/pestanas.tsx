import type { LucideIcon } from 'lucide-react';
import { useRef, type KeyboardEvent } from 'react';
import { idPestana } from '../utils/ids_pestanas';

export interface Pestana<T extends string> {
  valor: T;
  texto: string;
  icono: LucideIcon;
  /** Cantidad de registros, si aporta (p. ej. 3 tomas de signos). */
  cantidad?: number;
}

interface PropiedadesPestanas<T extends string> {
  etiqueta: string;
  pestanas: readonly Pestana<T>[];
  activa: T;
  idPanel: string;
  alCambiar: (valor: T) => void;
}

/** Pestañas accesibles (flechas, Inicio y Fin); en pantallas angostas se desplazan. */
export function Pestanas<T extends string>({ etiqueta, pestanas, activa, idPanel, alCambiar }: PropiedadesPestanas<T>) {
  const lista = useRef<HTMLDivElement>(null);

  const mover = (evento: KeyboardEvent<HTMLDivElement>) => {
    const actual = pestanas.findIndex((pestana) => pestana.valor === activa);
    const destinos: Record<string, number> = {
      ArrowRight: (actual + 1) % pestanas.length,
      ArrowLeft: (actual - 1 + pestanas.length) % pestanas.length,
      Home: 0,
      End: pestanas.length - 1,
    };
    const indice = destinos[evento.key];
    const destino = indice === undefined ? undefined : pestanas[indice];
    if (!destino) return;
    evento.preventDefault();
    alCambiar(destino.valor);
    lista.current?.querySelector<HTMLElement>(`#${idPestana(destino.valor)}`)?.focus();
  };

  return (
    <div
      ref={lista}
      role="tablist"
      aria-label={etiqueta}
      onKeyDown={mover}
      className="flex gap-1 overflow-x-auto border-b border-borde/70 px-2 [scrollbar-width:thin]"
    >
      {pestanas.map(({ valor, texto, icono: Icono, cantidad }) => {
        const seleccionada = valor === activa;
        return (
          <button
            key={valor}
            id={idPestana(valor)}
            type="button"
            role="tab"
            aria-selected={seleccionada}
            aria-controls={idPanel}
            tabIndex={seleccionada ? 0 : -1}
            onClick={() => alCambiar(valor)}
            className={`relative inline-flex h-11 shrink-0 items-center gap-2 px-3 text-sm font-medium whitespace-nowrap transition-colors duration-150 focus-visible:rounded-lg focus-visible:ring-2 focus-visible:ring-primario/40 focus-visible:outline-none ${
              seleccionada ? 'text-primario' : 'text-texto-secundario hover:text-texto'
            }`}
          >
            <Icono aria-hidden strokeWidth={1.75} className="size-4" />
            {texto}
            {cantidad !== undefined && cantidad > 0 && (
              <span
                className={`rounded-full px-1.5 text-xs tabular-nums ${seleccionada ? 'bg-primario/10 text-primario' : 'bg-borde/60 text-texto-secundario'}`}
              >
                {cantidad}
              </span>
            )}
            {seleccionada && <span aria-hidden className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-primario" />}
          </button>
        );
      })}
    </div>
  );
}
