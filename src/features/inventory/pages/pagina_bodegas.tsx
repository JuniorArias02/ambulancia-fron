import { Ambulance, Thermometer, Warehouse } from 'lucide-react';
import { SelectorSegmentado } from '../../../components/ui/selector_segmentado';
import { SeccionInventario } from '../components/seccion_inventario';
import { VistaBodegas } from '../components/vista_bodegas';
import { VistaControles } from '../components/vista_controles';
import { VistaUbicacionesAmbulancias } from '../components/vista_ubicaciones_ambulancias';
import { useParametrosUrl } from '../hooks/use_parametros_url';
import { deCatalogo } from '../utils/formato_inventario';

const VISTAS = ['bodegas', 'ambulancias', 'temperatura'] as const;
type Vista = (typeof VISTAS)[number];

const OPCIONES = [
  { valor: 'bodegas', texto: 'Bodegas', icono: Warehouse },
  { valor: 'ambulancias', texto: 'Ambulancias', icono: Ambulance },
  { valor: 'temperatura', texto: 'Temperatura y humedad', icono: Thermometer },
] as const;

const DESCRIPCIONES: Record<Vista, string> = {
  bodegas: 'Dónde se almacena el inventario. Una bodega inactiva no recibe ni entrega movimientos.',
  ambulancias: 'Ambulancias con inventario propio, que se abastecen desde las bodegas.',
  temperatura: 'Lecturas de la cadena de frío en bodegas y ambulancias.',
};

export function PaginaBodegas() {
  const { leer, actualizar } = useParametrosUrl();
  const vista = deCatalogo(VISTAS, leer('vista')) ?? 'bodegas';
  const cambiarVista = (nueva: Vista) =>
    actualizar({ vista: nueva === 'bodegas' ? undefined : nueva, busqueda: undefined, activa: undefined, ubicacionId: undefined, desde: undefined, hasta: undefined });

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <SeccionInventario
        id="titulo-bodegas"
        titulo="Bodegas y ubicaciones"
        descripcion={DESCRIPCIONES[vista]}
        icono={Warehouse}
        controles={
          <div className="-mx-1 overflow-x-auto px-1 pb-1">
            <SelectorSegmentado<Vista> etiqueta="Sección" valor={vista} opciones={OPCIONES} alCambiar={cambiarVista} />
          </div>
        }
      >
        {vista === 'bodegas' && <VistaBodegas />}
        {vista === 'ambulancias' && <VistaUbicacionesAmbulancias />}
        {vista === 'temperatura' && <VistaControles />}
      </SeccionInventario>
    </div>
  );
}
