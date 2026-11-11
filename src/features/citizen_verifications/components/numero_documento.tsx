import { Check, Copy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ETIQUETAS_TIPO_DOCUMENTO } from '../constants/verificaciones';
import type { TipoDocumento } from '../types/verificacion.types';
import { agruparNumeroDocumento } from '../utils/formato_verificacion';

const DURACION_COPIADO_MS = 2_000;

interface PropiedadesNumeroDocumento {
  tipo: TipoDocumento;
  numero: string;
}

/** Dato principal a cotejar con la foto: completo, grande y agrupado para leerlo. */
export function NumeroDocumento({ tipo, numero }: PropiedadesNumeroDocumento) {
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    if (!copiado) return;
    const temporizador = window.setTimeout(() => setCopiado(false), DURACION_COPIADO_MS);
    return () => window.clearTimeout(temporizador);
  }, [copiado]);

  const copiar = () => {
    // Se copian solo los caracteres, como los guarda el backend.
    navigator.clipboard.writeText(numero).then(
      () => setCopiado(true),
      () => setCopiado(false),
    );
  };

  return (
    <div className="rounded-2xl border border-primario/15 bg-primario/5 px-4 py-3.5">
      <p className="text-[13px] text-texto-secundario">{ETIQUETAS_TIPO_DOCUMENTO[tipo]}</p>
      <div className="mt-1 flex items-center justify-between gap-3">
        <p className="min-w-0 font-mono text-2xl font-semibold tracking-wide break-all text-texto tabular-nums">
          <span className="mr-2 font-sans text-base font-semibold text-primario">{tipo}</span>
          {agruparNumeroDocumento(numero)}
        </p>
        <button
          type="button"
          onClick={copiar}
          aria-label={copiado ? 'Número copiado' : 'Copiar número de documento'}
          title={copiado ? 'Copiado' : 'Copiar'}
          className="campo-vidrio flex size-9 shrink-0 items-center justify-center rounded-xl text-texto-secundario transition-colors duration-150 hover:bg-white hover:text-primario focus-visible:ring-2 focus-visible:ring-primario/40 focus-visible:outline-none"
        >
          {copiado ? (
            <Check aria-hidden strokeWidth={2} className="size-4 text-exito" />
          ) : (
            <Copy aria-hidden strokeWidth={1.75} className="size-4" />
          )}
        </button>
      </div>
      <span aria-live="polite" className="sr-only">
        {copiado ? 'Número copiado' : ''}
      </span>
    </div>
  );
}
