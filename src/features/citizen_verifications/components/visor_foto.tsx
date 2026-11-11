import { RotateCcw, RotateCw, X, ZoomIn, ZoomOut } from 'lucide-react';
import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';

const NIVELES_ZOOM = [1, 1.5, 2, 3] as const;

// Área disponible para la foto dentro del visor (pantalla menos márgenes y barra).
const ANCHO_AREA = '(100vw - 48px)';
const ALTO_AREA = '(100dvh - 136px)';

interface PropiedadesVisorFoto {
  url: string;
  titulo: string;
  alCerrar: () => void;
}

const claseBoton =
  'flex size-10 items-center justify-center rounded-xl text-white/85 transition-colors duration-150 hover:bg-white/12 hover:text-white focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:outline-none disabled:opacity-40 disabled:hover:bg-transparent';

/**
 * Foto a pantalla completa con zoom y giros de 90°: las fotos de celular suelen llegar giradas.
 * Usa la URL ya descargada, sin pedirla otra vez.
 */
export function VisorFoto({ url, titulo, alCerrar }: PropiedadesVisorFoto) {
  const dialogoRef = useRef<HTMLDialogElement>(null);
  const idTitulo = useId();
  const [nivel, setNivel] = useState(0);
  const [giro, setGiro] = useState(0);

  useEffect(() => {
    const dialogo = dialogoRef.current;
    if (dialogo && !dialogo.open) dialogo.showModal();
  }, []);

  const zoom = NIVELES_ZOOM[nivel] ?? 1;
  const girada = giro % 180 !== 0;
  // Al girar 90°, el ancho de la foto ocupa el alto disponible y viceversa.
  const estiloFoto: CSSProperties = {
    maxWidth: `calc(${girada ? ALTO_AREA : ANCHO_AREA} * ${zoom})`,
    maxHeight: `calc(${girada ? ANCHO_AREA : ALTO_AREA} * ${zoom})`,
    transform: `rotate(${giro}deg)`,
  };

  return (
    <dialog
      ref={dialogoRef}
      aria-labelledby={idTitulo}
      onCancel={(evento) => {
        evento.preventDefault();
        alCerrar();
      }}
      className="m-0 h-dvh max-h-none w-screen max-w-none bg-institucional/95 p-0 text-white backdrop:bg-institucional/60 print:hidden"
    >
      <div className="flex h-full flex-col">
        <header className="flex shrink-0 items-center gap-2 px-4 py-3">
          <h2 id={idTitulo} className="min-w-0 flex-1 truncate text-sm font-semibold">
            {titulo}
          </h2>
          <button
            type="button"
            onClick={() => setNivel((actual) => Math.max(0, actual - 1))}
            disabled={nivel === 0}
            aria-label="Alejar"
            className={claseBoton}
          >
            <ZoomOut aria-hidden strokeWidth={1.75} className="size-5" />
          </button>
          <span aria-live="polite" className="w-12 text-center text-[13px] text-white/75 tabular-nums">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setNivel((actual) => Math.min(NIVELES_ZOOM.length - 1, actual + 1))}
            disabled={nivel === NIVELES_ZOOM.length - 1}
            aria-label="Acercar"
            className={claseBoton}
          >
            <ZoomIn aria-hidden strokeWidth={1.75} className="size-5" />
          </button>
          <span aria-hidden className="mx-1 h-6 w-px bg-white/20" />
          <button
            type="button"
            onClick={() => setGiro((actual) => actual - 90)}
            aria-label="Girar a la izquierda"
            className={claseBoton}
          >
            <RotateCcw aria-hidden strokeWidth={1.75} className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => setGiro((actual) => actual + 90)}
            aria-label="Girar a la derecha"
            className={claseBoton}
          >
            <RotateCw aria-hidden strokeWidth={1.75} className="size-5" />
          </button>
          <span aria-hidden className="mx-1 h-6 w-px bg-white/20" />
          <button type="button" onClick={alCerrar} aria-label="Cerrar" className={claseBoton}>
            <X aria-hidden strokeWidth={1.75} className="size-5" />
          </button>
        </header>

        <div className="flex min-h-0 flex-1 overflow-auto px-6 pb-6">
          <img
            src={url}
            alt={titulo}
            draggable={false}
            onContextMenu={(evento) => evento.preventDefault()}
            style={estiloFoto}
            className="m-auto object-contain transition-transform duration-200 select-none"
          />
        </div>
      </div>
    </dialog>
  );
}
