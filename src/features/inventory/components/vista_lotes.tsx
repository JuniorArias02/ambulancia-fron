import { Pencil, Plus } from 'lucide-react';
import { useState } from 'react';
import { LIMITE_POR_PAGINA } from '../constants/catalogos_inventario';
import { claseBotonPrimario } from '../constants/estilos_inventario';
import { useCatalogoInsumos, useLotes } from '../hooks/use_consultas_inventario';
import { useParametrosUrl } from '../hooks/use_parametros_url';
import type { Lote } from '../types/inventario.types';
import { formatearDia, leerPagina } from '../utils/formato_inventario';
import { BarraHerramientas } from './barra_herramientas';
import { opcionesInsumos } from '../utils/opciones_inventario';
import { BarraFiltros, Buscador, CampoDia, FiltroBuscable } from './campos_filtro';
import { FormularioLote } from './formulario_lote';
import { Insignia } from './insignia';
import { ListadoInventario } from './listado_inventario';
import { PanelEdicion } from './panel_edicion';
import type { Columna } from './tabla_inventario';

const COLUMNAS: Columna<Lote>[] = [
  {
    clave: 'lote',
    encabezado: 'Lote',
    celda: (lote) => (
      <div className="min-w-0">
        <p className="font-medium">{lote.numeroLote}</p>
        <p className="text-[13px] text-texto-secundario">{lote.insumoNombre ?? '—'}</p>
      </div>
    ),
  },
  {
    clave: 'vencimiento',
    encabezado: 'Vencimiento',
    celda: (lote) => (
      <span className="flex flex-wrap items-center gap-1.5">
        <span className="tabular-nums">{formatearDia(lote.fechaVencimiento)}</span>
        {lote.vencido && <Insignia tono="critico">Vencido</Insignia>}
      </span>
    ),
  },
  { clave: 'fabricante', encabezado: 'Fabricante', celda: (lote) => lote.fabricante ?? '—', clase: 'hidden lg:table-cell text-[13px]' },
  { clave: 'proveedor', encabezado: 'Proveedor', celda: (lote) => lote.proveedor ?? '—', clase: 'hidden xl:table-cell text-[13px]' },
  { clave: 'soporte', encabezado: 'Soporte', celda: (lote) => lote.documentoSoporte ?? '—', clase: 'hidden lg:table-cell text-[13px]' },
];

export function VistaLotes() {
  const { leer, actualizar } = useParametrosUrl();
  const insumos = useCatalogoInsumos();
  const filtros = {
    insumoId: leer('insumoId'),
    busqueda: leer('busqueda'),
    vencenHasta: leer('vencenHasta'),
    pagina: leerPagina(leer('pagina')),
    limite: LIMITE_POR_PAGINA,
  };
  const lotes = useLotes(filtros);
  const [panel, setPanel] = useState<{ lote: Lote | null } | null>(null);
  const cerrar = () => setPanel(null);
  const opcionesInsumo = opcionesInsumos((insumos.data ?? []).filter((insumo) => insumo.control === 'lote'));

  return (
    <>
      <BarraHerramientas
        filtros={
          <BarraFiltros>
            <Buscador etiqueta="Buscar lotes" placeholder="Buscar por número de lote" valor={filtros.busqueda} alCambiar={(busqueda) => actualizar({ busqueda })} />
            <FiltroBuscable etiqueta="Filtrar por insumo" valor={filtros.insumoId} opciones={opcionesInsumo} textoTodos="Todos los insumos" alCambiar={(insumoId) => actualizar({ insumoId })} />
            <CampoDia etiqueta="Vencen hasta" valor={filtros.vencenHasta} alCambiar={(vencenHasta) => actualizar({ vencenHasta })} />
          </BarraFiltros>
        }
        accion={
          <button type="button" onClick={() => setPanel({ lote: null })} className={claseBotonPrimario}>
            <Plus aria-hidden strokeWidth={1.75} className="size-4" />
            Nuevo lote
          </button>
        }
      />
      <ListadoInventario
        consulta={lotes}
        columnas={COLUMNAS}
        claveFila={(lote) => lote.id}
        etiquetaFila={(lote) => `lote ${lote.numeroLote}`}
        acciones={(lote) => [{ etiqueta: 'Corregir datos', icono: Pencil, alSeleccionar: () => setPanel({ lote }) }]}
        resaltar={(lote) => lote.vencido}
        tituloError="No fue posible cargar los lotes"
        vacio={{ titulo: 'Aún no hay lotes', mensaje: 'Crea el lote y luego registra su entrada a la bodega.' }}
        conFiltros={Boolean(filtros.insumoId || filtros.busqueda || filtros.vencenHasta)}
        alCambiarPagina={(pagina) => actualizar({ pagina })}
      />
      {panel && (
        <PanelEdicion
          titulo={panel.lote ? 'Corregir lote' : 'Nuevo lote'}
          descripcion={panel.lote ? `${panel.lote.numeroLote} · ${panel.lote.insumoNombre ?? ''}` : 'Medicamentos y elementos controlados por lote.'}
          alCerrar={cerrar}
        >
          {({ alCambiarSinGuardar, solicitarCierre }) => (
            <FormularioLote lote={panel.lote} alCambiarSinGuardar={alCambiarSinGuardar} alTerminar={cerrar} alCancelar={solicitarCierre} />
          )}
        </PanelEdicion>
      )}
    </>
  );
}
