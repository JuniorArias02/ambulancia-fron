import { ChevronDown, type LucideIcon } from 'lucide-react';
import type { ComponentProps } from 'react';
import { CampoFormulario } from './campo_formulario';
import { claseEntrada, claseEstadoEntrada, idsDescripcion } from './estilos_campo';

type PropiedadesSelector = Omit<ComponentProps<'select'>, 'id' | 'className'>;

interface PropiedadesCampoSelector extends PropiedadesSelector {
  id: string;
  etiqueta: string;
  icono: LucideIcon;
  error?: string;
  ayuda?: string;
  obligatorio?: boolean;
}

export function CampoSelector({
  id,
  etiqueta,
  icono,
  error,
  ayuda,
  obligatorio = true,
  children,
  ...propiedadesSelector
}: PropiedadesCampoSelector) {
  return (
    <CampoFormulario
      id={id}
      etiqueta={etiqueta}
      icono={icono}
      error={error}
      ayuda={ayuda}
      obligatorio={obligatorio}
    >
      <select
        {...propiedadesSelector}
        id={id}
        required={obligatorio}
        aria-invalid={error ? true : undefined}
        aria-describedby={idsDescripcion(id, Boolean(error), Boolean(ayuda))}
        className={`${claseEntrada} appearance-none pr-10 ${claseEstadoEntrada(Boolean(error))}`}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden
        strokeWidth={1.75}
        className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-texto-secundario"
      />
    </CampoFormulario>
  );
}
