import { Ambulance, Boxes } from 'lucide-react';
import { SelectorSegmentado } from '../../../components/ui/selector_segmentado';
import { SeccionInventario } from '../components/seccion_inventario';
import { VistaDotacion } from '../components/vista_dotacion';
import { VistaExistencias } from '../components/vista_existencias';
import { useParametrosUrl } from '../hooks/use_parametros_url';
import { deCatalogo } from '../utils/formato_inventario';

const VISTAS = ['existencias', 'dotacion'] as const;
type Vista = (typeof VISTAS)[number];

const OPCIONES = [
  { valor: 'existencias', texto: 'Existencias', icono: Boxes },
  { valor: 'dotacion', texto: 'Dotación por ambulancia', icono: Ambulance },
] as const;

export function PaginaExistencias() {
  const { leer, actualizar } = useParametrosUrl();
  const vista = deCatalogo(VISTAS, leer('vista')) ?? 'existencias';

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <SeccionInventario
        id="titulo-existencias"
        titulo="Existencias"
        icono={Boxes}
        descripcion={
          vista === 'existencias'
            ? 'Lo que hay en cada bodega y ambulancia. No utilizable: lote vencido o equipo fuera de operación.'
            : 'Lo que tiene la ambulancia frente al perfil vigente de su tipo, sin contar lo vencido ni lo que no opera.'
        }
        controles={
          <div className="-mx-1 overflow-x-auto px-1 pb-1">
            <SelectorSegmentado<Vista>
              etiqueta="Vista"
              valor={vista}
              opciones={OPCIONES}
              alCambiar={(nueva) =>
                actualizar({
                  vista: nueva === 'existencias' ? undefined : nueva,
                  busqueda: undefined,
                  ubicacionId: undefined,
                  tipoUbicacion: undefined,
                  tipoInsumo: undefined,
                  agotadas: undefined,
                })
              }
            />
          </div>
        }
      >
        {vista === 'existencias' ? <VistaExistencias /> : <VistaDotacion />}
      </SeccionInventario>
    </div>
  );
}
