import { ArrowRight, CircleCheck, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';

interface PropiedadesPanelAlerta<T> {
  id: string;
  titulo: string;
  icono: LucideIcon;
  elementos: readonly T[];
  clave: (elemento: T) => string;
  fila: (elemento: T) => ReactNode;
  textoVacio: string;
  enlace: { texto: string; ruta: string };
  /** Cuántos se muestran; el resto se ve en la pantalla enlazada. */
  maximo?: number;
}

/** Lista corta de una alerta del inventario, con enlace a la pantalla donde se resuelve. */
export function PanelAlerta<T>({ id, titulo, icono: Icono, elementos, clave, fila, textoVacio, enlace, maximo = 6 }: PropiedadesPanelAlerta<T>) {
  const visibles = elementos.slice(0, maximo);
  const conAlertas = elementos.length > 0;
  return (
    <section aria-labelledby={id} className="vidrio-fuerte flex flex-col rounded-2xl">
      <header className="flex items-center gap-2.5 border-b border-borde/70 px-5 py-4">
        <span
          aria-hidden
          className={`flex size-8 items-center justify-center rounded-lg ${conAlertas ? 'bg-advertencia/12 text-advertencia-hover' : 'bg-exito/10 text-exito'}`}
        >
          <Icono strokeWidth={1.75} className="size-4" />
        </span>
        <h3 id={id} className="min-w-0 flex-1 text-base font-semibold text-texto">
          {titulo}
        </h3>
        <span className={`text-sm font-semibold tabular-nums ${conAlertas ? 'text-advertencia-hover' : 'text-texto-secundario'}`}>
          {elementos.length >= 100 ? '100+' : elementos.length}
        </span>
      </header>
      {conAlertas ? (
        <ul className="flex-1 divide-y divide-borde/60">
          {visibles.map((elemento) => (
            <li key={clave(elemento)} className="px-5 py-3">
              {fila(elemento)}
            </li>
          ))}
        </ul>
      ) : (
        <p className="flex flex-1 items-center gap-2 px-5 py-6 text-sm text-texto-secundario">
          <CircleCheck aria-hidden strokeWidth={1.75} className="size-4 text-exito" />
          {textoVacio}
        </p>
      )}
      <Link
        to={enlace.ruta}
        className="flex items-center justify-between gap-2 border-t border-borde/70 px-5 py-3 text-[13px] font-medium text-primario transition-colors duration-150 hover:bg-white/60 focus-visible:ring-2 focus-visible:ring-primario/40 focus-visible:outline-none"
      >
        {elementos.length > maximo ? `Ver los ${elementos.length} · ${enlace.texto}` : enlace.texto}
        <ArrowRight aria-hidden strokeWidth={1.75} className="size-4" />
      </Link>
    </section>
  );
}
