import { ETIQUETAS_FILTRO_FLOTA, FILTROS_FLOTA, type FiltroFlota } from '../utils/flota';

const PUNTO_FILTRO: Record<FiltroFlota, string> = {
  todas: 'bg-institucional/60',
  disponibles: 'bg-exito',
  en_servicio: 'bg-primario',
  otras: 'bg-texto-secundario',
};

interface PropiedadesFiltroFlota {
  filtro: FiltroFlota;
  conteos: Record<FiltroFlota, number>;
  alCambiar: (filtro: FiltroFlota) => void;
}

/** Filtra las ambulancias del mapa en el navegador: el cambio es instantáneo y los contadores cuadran. */
export function FiltroFlotaMapa({ filtro, conteos, alCambiar }: PropiedadesFiltroFlota) {
  return (
    <div
      role="group"
      aria-label="Filtrar ambulancias en el mapa"
      className="vidrio-fuerte flex max-w-full gap-1 overflow-x-auto rounded-xl p-1"
    >
      {FILTROS_FLOTA.map((opcion) => {
        const activo = opcion === filtro;
        return (
          <button
            key={opcion}
            type="button"
            aria-pressed={activo}
            onClick={() => alCambiar(opcion)}
            className={`inline-flex h-8 shrink-0 items-center gap-2 rounded-lg px-3 text-[13px] font-medium whitespace-nowrap transition-[background-color,color,box-shadow] duration-150 focus-visible:ring-2 focus-visible:ring-primario/40 focus-visible:outline-none ${
              activo ? 'bg-white text-texto shadow-vidrio' : 'text-texto-secundario hover:bg-white/70 hover:text-texto'
            }`}
          >
            <span aria-hidden className={`size-2 rounded-full ${PUNTO_FILTRO[opcion]}`} />
            {ETIQUETAS_FILTRO_FLOTA[opcion]}
            <span
              className={`rounded-md px-1.5 text-xs tabular-nums ${
                activo ? 'bg-primario/10 text-primario' : 'bg-texto-secundario/10 text-texto-secundario'
              }`}
            >
              {conteos[opcion]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
