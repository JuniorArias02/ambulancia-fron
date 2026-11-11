import { LoaderCircle, type LucideIcon } from 'lucide-react';

type TonoEnvio = 'primario' | 'exito' | 'advertencia' | 'peligro';

const CLASES_TONO: Record<TonoEnvio, string> = {
  primario: 'bg-primario hover:bg-primario-hover shadow-primario',
  exito: 'bg-exito hover:bg-exito-hover shadow-exito',
  advertencia: 'bg-advertencia hover:bg-advertencia-hover shadow-advertencia',
  peligro: 'bg-critico hover:bg-critico-hover shadow-critico',
};

interface PropiedadesPieFormulario {
  textoEnviar: string;
  textoEnviando: string;
  icono: LucideIcon;
  enviando: boolean;
  deshabilitado?: boolean;
  tono?: TonoEnvio;
  alCancelar: () => void;
}

export function PieFormulario({
  textoEnviar,
  textoEnviando,
  icono: Icono,
  enviando,
  deshabilitado = false,
  tono = 'primario',
  alCancelar,
}: PropiedadesPieFormulario) {
  return (
    <div className="sticky bottom-0 flex justify-end gap-2 border-t border-borde/70 bg-white/80 px-6 py-4 backdrop-blur-md">
      <button
        type="button"
        onClick={alCancelar}
        disabled={enviando}
        className="campo-vidrio h-10 rounded-xl px-4 text-sm font-medium text-texto transition-colors duration-150 hover:bg-white disabled:opacity-60"
      >
        Cancelar
      </button>
      <button
        type="submit"
        disabled={enviando || deshabilitado}
        className={`inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-white transition-colors duration-150 focus-visible:ring-4 focus-visible:ring-primario/25 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none ${CLASES_TONO[tono]}`}
      >
        {enviando ? (
          <LoaderCircle aria-hidden className="size-4 animate-spin" />
        ) : (
          <Icono aria-hidden strokeWidth={1.75} className="size-4" />
        )}
        {enviando ? textoEnviando : textoEnviar}
      </button>
    </div>
  );
}
