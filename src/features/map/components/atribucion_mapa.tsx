import { Info, X } from 'lucide-react';
import { useId, useState } from 'react';
import type { FuenteAtribucion } from '../services/proveedor_teselas';

interface PropiedadesAtribucionMapa {
  fuentes: FuenteAtribucion[];
}

/** Atribución compacta: las licencias exigen mostrarla, pero puede plegarse tras un botón. */
export function AtribucionMapa({ fuentes }: PropiedadesAtribucionMapa) {
  const [abierta, setAbierta] = useState(false);
  const idDetalle = useId();
  const etiqueta = abierta ? 'Ocultar créditos del mapa' : 'Ver créditos del mapa';

  return (
    <div className="vidrio-fuerte flex items-center gap-1 rounded-full p-1 text-xs text-texto-secundario">
      {abierta && (
        <p id={idDetalle} className="flex flex-wrap items-center gap-x-2 pl-2">
          {fuentes.map(({ texto, url }) => (
            <a
              key={url}
              href={url}
              target="_blank"
              rel="noreferrer"
              className="whitespace-nowrap hover:text-primario"
            >
              {texto}
            </a>
          ))}
        </p>
      )}
      <button
        type="button"
        onClick={() => setAbierta((actual) => !actual)}
        aria-label={etiqueta}
        aria-expanded={abierta}
        aria-controls={abierta ? idDetalle : undefined}
        title={etiqueta}
        className="flex size-7 shrink-0 items-center justify-center rounded-full transition-colors duration-150 hover:bg-white hover:text-texto focus-visible:ring-2 focus-visible:ring-primario/40 focus-visible:outline-none"
      >
        {abierta ? (
          <X aria-hidden strokeWidth={1.75} className="size-3.5" />
        ) : (
          <Info aria-hidden strokeWidth={1.75} className="size-4" />
        )}
      </button>
    </div>
  );
}
