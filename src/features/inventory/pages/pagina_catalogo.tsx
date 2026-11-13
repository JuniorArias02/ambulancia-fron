import { Barcode, FileBadge, Layers, Package, PackageOpen } from 'lucide-react';
import { SelectorSegmentado } from '../../../components/ui/selector_segmentado';
import { SeccionInventario } from '../components/seccion_inventario';
import { VistaEquipos } from '../components/vista_equipos';
import { VistaInsumos } from '../components/vista_insumos';
import { VistaLotes } from '../components/vista_lotes';
import { VistaRegistros } from '../components/vista_registros';
import { useParametrosUrl } from '../hooks/use_parametros_url';
import { deCatalogo } from '../utils/formato_inventario';

const VISTAS = ['insumos', 'registros', 'lotes', 'equipos'] as const;
type Vista = (typeof VISTAS)[number];

const OPCIONES = [
  { valor: 'insumos', texto: 'Insumos', icono: Package },
  { valor: 'registros', texto: 'Registros sanitarios', icono: FileBadge },
  { valor: 'lotes', texto: 'Lotes', icono: Layers },
  { valor: 'equipos', texto: 'Equipos', icono: Barcode },
] as const;

const DESCRIPCIONES: Record<Vista, string> = {
  insumos: 'Qué maneja la bodega y cómo se controla cada elemento.',
  registros: 'Permisos sanitarios que exigen los lotes y equipos de ciertos insumos.',
  lotes: 'Medicamentos por lote y vencimiento. Crear un lote no suma existencias.',
  equipos: 'Equipos biomédicos por serie, con su estado y mantenimientos.',
};

export function PaginaCatalogo() {
  const { leer, actualizar } = useParametrosUrl();
  const vista = deCatalogo(VISTAS, leer('vista')) ?? 'insumos';

  // Al cambiar de pestaña se descartan los filtros de la anterior.
  const cambiarVista = (nueva: Vista) =>
    actualizar({
      vista: nueva === 'insumos' ? undefined : nueva,
      busqueda: undefined,
      tipo: undefined,
      activo: undefined,
      insumoId: undefined,
      estado: undefined,
      vencenHasta: undefined,
      mantenimientoHasta: undefined,
    });

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <SeccionInventario
        id="titulo-catalogo"
        titulo="Catálogo de inventario"
        descripcion={DESCRIPCIONES[vista]}
        icono={PackageOpen}
        controles={
          <div className="-mx-1 overflow-x-auto px-1 pb-1">
            <SelectorSegmentado<Vista> etiqueta="Sección del catálogo" valor={vista} opciones={OPCIONES} alCambiar={cambiarVista} />
          </div>
        }
      >
        {vista === 'insumos' && <VistaInsumos />}
        {vista === 'registros' && <VistaRegistros />}
        {vista === 'lotes' && <VistaLotes />}
        {vista === 'equipos' && <VistaEquipos />}
      </SeccionInventario>
    </div>
  );
}
