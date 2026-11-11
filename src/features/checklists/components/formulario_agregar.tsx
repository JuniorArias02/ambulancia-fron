import { LoaderCircle, Plus } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { claseEntradaFila } from '../constants/estilos_listas';

interface PropiedadesFormularioAgregar {
  etiqueta: string;
  placeholder: string;
  longitudMaxima: number;
  enviando: boolean;
  /** Devuelve una promesa que se resuelve si se guardó, para limpiar el campo. */
  alAgregar: (texto: string) => Promise<unknown>;
}

/** Campo de una línea con botón para agregar una pregunta u opción. */
export function FormularioAgregar({ etiqueta, placeholder, longitudMaxima, enviando, alAgregar }: PropiedadesFormularioAgregar) {
  const [texto, setTexto] = useState('');
  const limpio = texto.trim();

  const enviar = (evento: FormEvent) => {
    evento.preventDefault();
    if (!limpio) return;
    alAgregar(limpio).then(
      () => setTexto(''),
      () => undefined,
    );
  };

  return (
    <form onSubmit={enviar} className="flex gap-2 border-t border-borde/70 px-5 py-4">
      <input
        value={texto}
        onChange={(evento) => setTexto(evento.target.value)}
        aria-label={etiqueta}
        placeholder={placeholder}
        maxLength={longitudMaxima}
        disabled={enviando}
        className={`min-w-0 flex-1 ${claseEntradaFila(false)}`}
      />
      <button
        type="submit"
        disabled={enviando || !limpio}
        className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-primario/8 px-3 text-sm font-semibold text-primario transition-colors duration-150 hover:bg-primario/12 focus-visible:ring-4 focus-visible:ring-primario/15 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
      >
        {enviando ? (
          <LoaderCircle aria-hidden className="size-4 animate-spin" />
        ) : (
          <Plus aria-hidden strokeWidth={1.75} className="size-4" />
        )}
        Agregar
      </button>
    </form>
  );
}
