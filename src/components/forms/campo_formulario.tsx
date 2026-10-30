import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface PropiedadesCampoFormulario {
  id: string;
  etiqueta: string;
  icono: LucideIcon;
  error?: string;
  ayuda?: string;
  obligatorio?: boolean;
  aviso?: ReactNode;
  children: ReactNode;
}

export function CampoFormulario({
  id,
  etiqueta,
  icono: Icono,
  error,
  ayuda,
  obligatorio = true,
  aviso,
  children,
}: PropiedadesCampoFormulario) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1">
        <label htmlFor={id} className="text-sm font-medium text-texto">
          {etiqueta}
        </label>
        {obligatorio && (
          <span aria-hidden className="text-sm text-critico">
            *
          </span>
        )}
      </div>
      <div className="relative">
        <Icono
          aria-hidden
          strokeWidth={1.75}
          className="pointer-events-none absolute top-1/2 left-4 size-[18px] -translate-y-1/2 text-texto-secundario"
        />
        {children}
      </div>
      {error ? (
        <p id={`error-${id}`} className="text-[13px] text-critico">
          {error}
        </p>
      ) : (
        ayuda && (
          <p id={`ayuda-${id}`} className="text-[13px] text-texto-secundario">
            {ayuda}
          </p>
        )
      )}
      {aviso}
    </div>
  );
}
