import { History, Siren } from 'lucide-react';
import { SelectorSegmentado, type OpcionSegmentada } from '../../../components/ui/selector_segmentado';
import type { VistaEmergencias } from '../hooks/use_filtros_emergencias';

const VISTAS: OpcionSegmentada<VistaEmergencias>[] = [
  { valor: 'activas', texto: 'Activas', icono: Siren },
  { valor: 'historial', texto: 'Historial', icono: History },
];

interface PropiedadesSelectorVista {
  vista: VistaEmergencias;
  alCambiar: (vista: VistaEmergencias) => void;
}

export function SelectorVistaEmergencias({ vista, alCambiar }: PropiedadesSelectorVista) {
  return <SelectorSegmentado etiqueta="Vista" valor={vista} opciones={VISTAS} alCambiar={alCambiar} />;
}
