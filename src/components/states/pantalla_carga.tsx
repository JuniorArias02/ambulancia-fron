import { LoaderCircle } from 'lucide-react';

interface PropiedadesPantallaCarga {
  mensaje: string;
}

export function PantallaCarga({ mensaje }: PropiedadesPantallaCarga) {
  return (
    <div role="status" className="flex min-h-dvh items-center justify-center px-4">
      <div className="vidrio flex items-center gap-3 rounded-2xl px-5 py-3.5 text-sm text-texto-secundario">
        <LoaderCircle className="size-5 animate-spin text-primario" aria-hidden />
        {mensaje}
      </div>
    </div>
  );
}
