import { TriangleAlert } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface PropiedadesAvisoDescartarCambios {
  alDescartar: () => void;
  alSeguirEditando: () => void;
}

export function AvisoDescartarCambios({
  alDescartar,
  alSeguirEditando,
}: PropiedadesAvisoDescartarCambios) {
  const descartarRef = useRef<HTMLButtonElement>(null);

  // Lleva el foco al aviso para que sea visible y se pueda responder con el teclado.
  useEffect(() => {
    descartarRef.current?.focus();
    descartarRef.current?.scrollIntoView({ block: 'nearest' });
  }, []);

  return (
    <div
      role="alertdialog"
      aria-label="Cambios sin guardar"
      className="flex flex-col gap-3 rounded-xl border border-advertencia/25 bg-advertencia/8 px-4 py-3 text-sm sm:flex-row sm:items-center"
    >
      <p className="flex flex-1 items-start gap-2.5 text-texto">
        <TriangleAlert aria-hidden strokeWidth={1.75} className="mt-0.5 size-4 shrink-0 text-advertencia" />
        Tienes cambios sin guardar. ¿Quieres descartarlos?
      </p>
      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          onClick={alSeguirEditando}
          className="h-9 rounded-lg px-3 font-medium text-texto hover:bg-white/70"
        >
          Seguir editando
        </button>
        <button
          ref={descartarRef}
          type="button"
          onClick={alDescartar}
          className="h-9 rounded-lg bg-advertencia px-3 font-medium text-white hover:bg-advertencia-hover"
        >
          Descartar
        </button>
      </div>
    </div>
  );
}
