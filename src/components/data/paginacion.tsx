import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PropiedadesPaginacion {
  pagina: number;
  limite: number;
  total: number;
  deshabilitada?: boolean;
  alCambiarPagina: (pagina: number) => void;
}

const claseBoton =
  'flex size-9 items-center justify-center rounded-xl text-sm transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-primario/40 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40';

/** Páginas visibles alrededor de la actual, con huecos representados por `null`. */
function paginasVisibles(actual: number, totalPaginas: number): (number | null)[] {
  if (totalPaginas <= 7) return Array.from({ length: totalPaginas }, (_, i) => i + 1);
  const cercanas = [1, actual - 1, actual, actual + 1, totalPaginas].filter(
    (pagina) => pagina >= 1 && pagina <= totalPaginas,
  );
  const unicas = [...new Set(cercanas)].sort((a, b) => a - b);
  return unicas.flatMap((pagina, i) => {
    const anterior = unicas[i - 1];
    return anterior !== undefined && pagina - anterior > 1 ? [null, pagina] : [pagina];
  });
}

export function Paginacion({
  pagina,
  limite,
  total,
  deshabilitada = false,
  alCambiarPagina,
}: PropiedadesPaginacion) {
  const totalPaginas = Math.max(Math.ceil(total / limite), 1);
  const desde = total === 0 ? 0 : (pagina - 1) * limite + 1;
  const hasta = Math.min(pagina * limite, total);

  return (
    <nav
      aria-label="Paginación"
      className="flex flex-col items-center justify-between gap-3 sm:flex-row"
    >
      <p className="text-[13px] text-texto-secundario">
        Mostrando <span className="font-medium text-texto">{desde}</span>–
        <span className="font-medium text-texto">{hasta}</span> de{' '}
        <span className="font-medium text-texto">{total}</span>
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => alCambiarPagina(pagina - 1)}
          disabled={deshabilitada || pagina <= 1}
          aria-label="Página anterior"
          className={`${claseBoton} text-texto-secundario hover:bg-white hover:text-texto`}
        >
          <ChevronLeft aria-hidden strokeWidth={1.75} className="size-4" />
        </button>
        {paginasVisibles(pagina, totalPaginas).map((numero, i) =>
          numero === null ? (
            <span key={`hueco-${i}`} aria-hidden className="w-6 text-center text-texto-secundario">
              …
            </span>
          ) : (
            <button
              key={numero}
              type="button"
              onClick={() => alCambiarPagina(numero)}
              disabled={deshabilitada}
              aria-current={numero === pagina ? 'page' : undefined}
              aria-label={`Página ${numero}`}
              className={`${claseBoton} ${
                numero === pagina
                  ? 'bg-white font-semibold text-primario shadow-vidrio'
                  : 'text-texto-secundario hover:bg-white/70 hover:text-texto'
              }`}
            >
              {numero}
            </button>
          ),
        )}
        <button
          type="button"
          onClick={() => alCambiarPagina(pagina + 1)}
          disabled={deshabilitada || pagina >= totalPaginas}
          aria-label="Página siguiente"
          className={`${claseBoton} text-texto-secundario hover:bg-white hover:text-texto`}
        >
          <ChevronRight aria-hidden strokeWidth={1.75} className="size-4" />
        </button>
      </div>
    </nav>
  );
}
