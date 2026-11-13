import type { LucideIcon } from 'lucide-react';
import { CampoFormulario } from './campo_formulario';
import { claseEntrada, claseEstadoEntrada, idsDescripcion } from './estilos_campo';
import { SelectorBuscable, type OpcionBuscable } from './selector_buscable';

interface PropiedadesCampoBuscable {
  id: string;
  etiqueta: string;
  icono: LucideIcon;
  opciones: readonly OpcionBuscable[];
  valor: string;
  alCambiar: (valor: string) => void;
  alSalir?: () => void;
  placeholder: string;
  error?: string;
  ayuda?: string;
  obligatorio?: boolean;
  deshabilitado?: boolean;
  textoSinResultados?: string;
}

/** Campo de formulario para elegir de una lista larga escribiendo para filtrarla. */
export function CampoBuscable({
  id,
  etiqueta,
  icono,
  error,
  ayuda,
  obligatorio = true,
  deshabilitado,
  ...selector
}: PropiedadesCampoBuscable) {
  return (
    <CampoFormulario id={id} etiqueta={etiqueta} icono={icono} error={error} ayuda={ayuda} obligatorio={obligatorio}>
      <SelectorBuscable
        {...selector}
        id={id}
        deshabilitado={deshabilitado}
        invalido={Boolean(error)}
        descripcion={idsDescripcion(id, Boolean(error), Boolean(ayuda))}
        claseEntrada={`${claseEntrada} ${claseEstadoEntrada(Boolean(error))}`}
      />
    </CampoFormulario>
  );
}
