import { X } from 'lucide-react';
import { useEffect, useId, useRef, type ReactNode } from 'react';

interface PropiedadesDialogo {
  abierto: boolean;
  titulo: string;
  descripcion?: ReactNode;
  variante?: 'centrado' | 'lateral';
  /** Mientras sea false, el diálogo no se puede cerrar (p. ej. durante un envío). */
  cerrable?: boolean;
  alCerrar: () => void;
  children: ReactNode;
}

const CLASES_VARIANTE = {
  centrado: 'm-auto w-[min(520px,calc(100vw-32px))] rounded-3xl',
  lateral:
    'my-3 mr-3 ml-auto h-[calc(100dvh-24px)] max-h-none w-[min(520px,calc(100vw-24px))] rounded-3xl',
};

/** Diálogo modal nativo: aporta foco atrapado, cierre con Escape y capa superior. */
export function Dialogo({
  abierto,
  titulo,
  descripcion,
  variante = 'centrado',
  cerrable = true,
  alCerrar,
  children,
}: PropiedadesDialogo) {
  const dialogoRef = useRef<HTMLDialogElement>(null);
  const idTitulo = useId();
  const idDescripcion = useId();

  useEffect(() => {
    const dialogo = dialogoRef.current;
    if (!dialogo) return;
    if (abierto && !dialogo.open) dialogo.showModal();
    if (!abierto && dialogo.open) dialogo.close();
  }, [abierto]);

  return (
    <dialog
      ref={dialogoRef}
      aria-labelledby={idTitulo}
      aria-describedby={descripcion ? idDescripcion : undefined}
      onCancel={(evento) => {
        evento.preventDefault();
        if (cerrable) alCerrar();
      }}
      onClick={(evento) => {
        if (cerrable && evento.target === evento.currentTarget) alCerrar();
      }}
      className={`vidrio-fuerte p-0 text-texto backdrop:bg-institucional/25 backdrop:backdrop-blur-[3px] ${CLASES_VARIANTE[variante]}`}
    >
      {abierto && (
        <div className={`flex flex-col ${variante === 'lateral' ? 'h-full' : 'max-h-[calc(100dvh-48px)]'}`}>
          <header className="flex shrink-0 items-start gap-4 border-b border-borde/70 px-6 pt-6 pb-5">
            <div className="min-w-0 flex-1">
              <h2 id={idTitulo} className="text-lg font-semibold tracking-tight">
                {titulo}
              </h2>
              {descripcion && (
                <div id={idDescripcion} className="mt-1 text-sm text-texto-secundario">
                  {descripcion}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={alCerrar}
              disabled={!cerrable}
              aria-label="Cerrar"
              title="Cerrar"
              className="-mt-1 -mr-2 flex size-9 shrink-0 items-center justify-center rounded-xl text-texto-secundario transition-colors duration-150 hover:bg-white hover:text-texto disabled:opacity-40"
            >
              <X aria-hidden strokeWidth={1.75} className="size-[18px]" />
            </button>
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
        </div>
      )}
    </dialog>
  );
}
