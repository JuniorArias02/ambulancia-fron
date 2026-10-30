import type { LucideIcon } from 'lucide-react';
import type { ComponentProps } from 'react';
import { CampoFormulario } from './campo_formulario';
import { claseEntrada, claseEstadoEntrada, idsDescripcion } from './estilos_campo';

type PropiedadesEntrada = Omit<ComponentProps<'input'>, 'id' | 'className'>;

interface PropiedadesCampoTexto extends PropiedadesEntrada {
  id: string;
  etiqueta: string;
  icono: LucideIcon;
  error?: string;
  ayuda?: string;
  obligatorio?: boolean;
}

export function CampoTexto({
  id,
  etiqueta,
  icono,
  error,
  ayuda,
  obligatorio = true,
  ...propiedadesEntrada
}: PropiedadesCampoTexto) {
  return (
    <CampoFormulario
      id={id}
      etiqueta={etiqueta}
      icono={icono}
      error={error}
      ayuda={ayuda}
      obligatorio={obligatorio}
    >
      <input
        {...propiedadesEntrada}
        id={id}
        required={obligatorio}
        aria-invalid={error ? true : undefined}
        aria-describedby={idsDescripcion(id, Boolean(error), Boolean(ayuda))}
        className={`${claseEntrada} pr-3 ${claseEstadoEntrada(Boolean(error))}`}
      />
    </CampoFormulario>
  );
}
