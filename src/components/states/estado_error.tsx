import { CircleAlert, RotateCw } from 'lucide-react';

interface PropiedadesEstadoError {
  titulo: string;
  mensaje: string;
  alReintentar?: () => void;
  accionSecundaria?: { etiqueta: string; alPulsar: () => void };
}

export function EstadoError({
  titulo,
  mensaje,
  alReintentar,
  accionSecundaria,
}: PropiedadesEstadoError) {
  return (
    <div role="alert" className="flex flex-col items-center px-6 py-10 text-center">
      <span className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-critico/8 text-critico ring-1 ring-critico/10">
        <CircleAlert aria-hidden strokeWidth={1.75} className="size-[22px]" />
      </span>
      <h2 className="text-base font-semibold text-texto">{titulo}</h2>
      <p className="mt-1 max-w-sm text-sm text-texto-secundario">{mensaje}</p>
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        {alReintentar && (
          <button
            type="button"
            onClick={alReintentar}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-primario px-4 text-sm font-medium text-white shadow-primario transition-colors duration-150 hover:bg-primario-hover"
          >
            <RotateCw aria-hidden strokeWidth={1.75} className="size-4" />
            Reintentar
          </button>
        )}
        {accionSecundaria && (
          <button
            type="button"
            onClick={accionSecundaria.alPulsar}
            className="campo-vidrio h-10 rounded-xl px-4 text-sm font-medium text-texto transition-colors duration-150 hover:bg-white"
          >
            {accionSecundaria.etiqueta}
          </button>
        )}
      </div>
    </div>
  );
}
