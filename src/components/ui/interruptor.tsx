interface PropiedadesInterruptor {
  etiqueta: string;
  activo: boolean;
  deshabilitado?: boolean;
  /** Muestra la etiqueta junto al control; si no, queda solo como nombre accesible. */
  etiquetaVisible?: boolean;
  alCambiar: (activo: boolean) => void;
}

/** Interruptor de encendido y apagado con semántica `switch`. */
export function Interruptor({
  etiqueta,
  activo,
  deshabilitado = false,
  etiquetaVisible = true,
  alCambiar,
}: PropiedadesInterruptor) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={activo}
      aria-label={etiquetaVisible ? undefined : etiqueta}
      disabled={deshabilitado}
      onClick={() => alCambiar(!activo)}
      className="group inline-flex items-center gap-2 rounded-lg text-[13px] text-texto-secundario transition-colors duration-150 hover:text-texto focus-visible:ring-2 focus-visible:ring-primario/40 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:text-texto-secundario"
    >
      <span
        aria-hidden
        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-150 ${
          activo ? 'bg-primario' : 'bg-texto-secundario/25'
        }`}
      >
        <span
          className={`absolute size-4 rounded-full bg-white shadow-sm transition-transform duration-150 ${
            activo ? 'translate-x-[18px]' : 'translate-x-0.5'
          }`}
        />
      </span>
      {etiquetaVisible && <span className="whitespace-nowrap">{etiqueta}</span>}
    </button>
  );
}
