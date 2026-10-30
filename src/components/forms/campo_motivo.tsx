import type { ComponentProps } from 'react';

type PropiedadesAreaTexto = Omit<ComponentProps<'textarea'>, 'id' | 'className' | 'maxLength'>;

interface PropiedadesCampoMotivo extends PropiedadesAreaTexto {
  id: string;
  etiqueta?: string;
  /** Caracteres escritos, para el contador. */
  longitud: number;
  longitudMaxima: number;
  error?: string;
  ayuda: string;
}

/** Texto largo obligatorio (p. ej. el motivo de un cambio de estado), con contador de caracteres. */
export function CampoMotivo({
  id,
  etiqueta = 'Motivo',
  longitud,
  longitudMaxima,
  error,
  ayuda,
  ...propiedadesAreaTexto
}: PropiedadesCampoMotivo) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="flex items-center gap-1 text-sm font-medium text-texto">
          {etiqueta}
          <span aria-hidden className="text-critico">*</span>
        </label>
        <span aria-live="polite" className="text-xs text-texto-secundario">
          {longitud}/{longitudMaxima}
        </span>
      </div>
      <textarea
        rows={3}
        required
        placeholder="Explica por qué se realiza este cambio"
        {...propiedadesAreaTexto}
        id={id}
        maxLength={longitudMaxima}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `error-${id}` : `ayuda-${id}`}
        className={`campo-vidrio w-full resize-none rounded-xl px-4 py-3 text-[15px] text-texto placeholder:text-texto-secundario/80 focus:bg-white focus:ring-4 focus:outline-none disabled:opacity-60 ${
          error ? 'border-critico/60! focus:ring-critico/12' : 'focus:border-primario/60! focus:ring-primario/12'
        }`}
      />
      {error ? (
        <p id={`error-${id}`} className="text-[13px] text-critico">
          {error}
        </p>
      ) : (
        <p id={`ayuda-${id}`} className="text-[13px] text-texto-secundario">
          {ayuda}
        </p>
      )}
    </div>
  );
}
