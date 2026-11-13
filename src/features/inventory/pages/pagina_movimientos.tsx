import { ArrowLeftRight, ListChecks, Plus, Undo2 } from 'lucide-react';
import { useState } from 'react';
import { SelectorFiltro } from '../../../components/forms/selector_filtro';
import { SelectorSegmentado } from '../../../components/ui/selector_segmentado';
import { formatearFechaHora } from '../../../utils/formato_fecha';
import { BarraFiltros, CampoDia, FiltroBuscable } from '../components/campos_filtro';
import { InsigniaEstadoMovimiento, NombreUbicacion } from '../components/insignias_movimiento';
import { ListadoInventario } from '../components/listado_inventario';
import { PanelMovimiento } from '../components/panel_movimiento';
import { PanelNuevoMovimiento } from '../components/panel_nuevo_movimiento';
import { SeccionInventario } from '../components/seccion_inventario';
import type { Columna } from '../components/tabla_inventario';
import {
  ESTADOS_MOVIMIENTO,
  ETIQUETAS_ESTADO_MOVIMIENTO,
  ETIQUETAS_TIPO_MOVIMIENTO,
  INTERVALO_RESUMEN_MS,
  LIMITE_POR_PAGINA,
  TIPOS_MOVIMIENTO,
} from '../constants/catalogos_inventario';
import { claseBotonPrimario } from '../constants/estilos_inventario';
import { useMovimientos, useUbicaciones } from '../hooks/use_consultas_inventario';
import { useParametrosUrl } from '../hooks/use_parametros_url';
import type { EstadoMovimiento, FiltrosMovimientos, Movimiento, TipoMovimiento } from '../types/inventario.types';
import { deCatalogo, leerPagina } from '../utils/formato_inventario';
import { opcionesUbicaciones } from '../utils/opciones_inventario';

const VISTAS = ['todos', 'devoluciones'] as const;
type Vista = (typeof VISTAS)[number];

const OPCIONES_VISTA = [
  { valor: 'todos', texto: 'Todos', icono: ListChecks },
  { valor: 'devoluciones', texto: 'Devoluciones por recibir', icono: Undo2 },
] as const;

const OPCIONES_TIPO = TIPOS_MOVIMIENTO.map((tipo) => ({ valor: tipo, texto: ETIQUETAS_TIPO_MOVIMIENTO[tipo] }));
const OPCIONES_ESTADO = ESTADOS_MOVIMIENTO.map((estado) => ({ valor: estado, texto: ETIQUETAS_ESTADO_MOVIMIENTO[estado] }));

const COLUMNAS: Columna<Movimiento>[] = [
  {
    clave: 'movimiento',
    encabezado: 'Movimiento',
    celda: (movimiento) => (
      <div className="min-w-0">
        <p className="font-medium">{ETIQUETAS_TIPO_MOVIMIENTO[movimiento.tipo]}</p>
        <p className="text-[13px] text-texto-secundario tabular-nums">{movimiento.codigo}</p>
      </div>
    ),
  },
  { clave: 'origen', encabezado: 'Origen', celda: (movimiento) => <NombreUbicacion ubicacion={movimiento.origen} />, clase: 'text-[13px]' },
  { clave: 'destino', encabezado: 'Destino', celda: (movimiento) => <NombreUbicacion ubicacion={movimiento.destino} />, clase: 'text-[13px]' },
  {
    clave: 'lineas',
    encabezado: 'Líneas',
    celda: (movimiento) => movimiento.lineas.length,
    clase: 'hidden lg:table-cell tabular-nums text-[13px]',
  },
  {
    clave: 'realizado',
    encabezado: 'Realizado',
    celda: (movimiento) => (
      <div className="text-[13px]">
        <p className="tabular-nums">{formatearFechaHora(movimiento.realizadoEn)}</p>
        <p className="text-texto-secundario">{movimiento.usuarioNombre ?? '—'}</p>
      </div>
    ),
    clase: 'hidden xl:table-cell',
  },
  { clave: 'estado', encabezado: 'Estado', celda: (movimiento) => <InsigniaEstadoMovimiento estado={movimiento.estado} /> },
];

export function PaginaMovimientos() {
  const { leer, actualizar } = useParametrosUrl();
  const ubicaciones = useUbicaciones();
  const vista = deCatalogo(VISTAS, leer('vista')) ?? 'todos';
  const enBandeja = vista === 'devoluciones';
  const filtros: FiltrosMovimientos = enBandeja
    ? { tipo: 'devolucion', estado: 'borrador', pagina: leerPagina(leer('pagina')), limite: LIMITE_POR_PAGINA }
    : {
        tipo: deCatalogo(TIPOS_MOVIMIENTO, leer('tipo')),
        estado: deCatalogo(ESTADOS_MOVIMIENTO, leer('estado')),
        ubicacionId: leer('ubicacionId'),
        desde: leer('desde'),
        hasta: leer('hasta'),
        pagina: leerPagina(leer('pagina')),
        limite: LIMITE_POR_PAGINA,
      };
  // La bandeja se revisa sin tiempo real: se refresca cada minuto.
  const movimientos = useMovimientos(filtros, enBandeja ? INTERVALO_RESUMEN_MS : false);
  const [abierto, setAbierto] = useState<Movimiento | null>(null);
  const [creando, setCreando] = useState(false);
  const opcionesUbicacion = opcionesUbicaciones(ubicaciones.data ?? []);
  const conFiltros = !enBandeja && Boolean(filtros.tipo || filtros.estado || filtros.ubicacionId || filtros.desde || filtros.hasta);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <SeccionInventario
        id="titulo-movimientos"
        titulo="Movimientos"
        icono={ArrowLeftRight}
        descripcion={
          enBandeja
            ? 'Devoluciones que enviaron los paramédicos. Confírmalas al recibir la mercancía.'
            : movimientos.data
              ? `${movimientos.data.total} ${movimientos.data.total === 1 ? 'movimiento' : 'movimientos'}, del más reciente al más antiguo.`
              : 'Entradas, transferencias, ajustes, bajas y devoluciones.'
        }
        actualizando={movimientos.isFetching && !movimientos.isPending}
        acciones={
          <button type="button" onClick={() => setCreando(true)} className={claseBotonPrimario}>
            <Plus aria-hidden strokeWidth={1.75} className="size-4" />
            Nuevo movimiento
          </button>
        }
        controles={
          <div className="space-y-3">
            <div className="-mx-1 overflow-x-auto px-1 pb-1">
              <SelectorSegmentado<Vista>
                etiqueta="Vista"
                valor={vista}
                opciones={OPCIONES_VISTA}
                alCambiar={(nueva) =>
                  actualizar({ vista: nueva === 'todos' ? undefined : nueva, tipo: undefined, estado: undefined, ubicacionId: undefined, desde: undefined, hasta: undefined })
                }
              />
            </div>
            {!enBandeja && (
              <BarraFiltros>
                <SelectorFiltro<TipoMovimiento> etiqueta="Filtrar por tipo" valor={filtros.tipo} opciones={OPCIONES_TIPO} textoTodos="Todos los tipos" alCambiar={(tipo) => actualizar({ tipo })} />
                <SelectorFiltro<EstadoMovimiento> etiqueta="Filtrar por estado" valor={filtros.estado} opciones={OPCIONES_ESTADO} textoTodos="Todos los estados" alCambiar={(estado) => actualizar({ estado })} />
                <FiltroBuscable etiqueta="Filtrar por ubicación" valor={filtros.ubicacionId} opciones={opcionesUbicacion} textoTodos="Todas las ubicaciones" alCambiar={(ubicacionId) => actualizar({ ubicacionId })} />
                <CampoDia etiqueta="Desde" valor={filtros.desde} maximo={filtros.hasta} alCambiar={(desde) => actualizar({ desde })} />
                <CampoDia etiqueta="Hasta" valor={filtros.hasta} minimo={filtros.desde} alCambiar={(hasta) => actualizar({ hasta })} />
              </BarraFiltros>
            )}
          </div>
        }
      >
        <ListadoInventario
          consulta={movimientos}
          columnas={COLUMNAS}
          claveFila={(movimiento) => movimiento.id}
          etiquetaFila={(movimiento) => movimiento.codigo}
          alSeleccionar={setAbierto}
          tituloError="No fue posible cargar los movimientos"
          vacio={
            enBandeja
              ? { titulo: 'No hay devoluciones por recibir', mensaje: 'Cuando un paramédico devuelva algo a la bodega aparecerá aquí.' }
              : { titulo: 'Aún no hay movimientos', mensaje: 'Empieza por una entrada de existencias a la bodega.' }
          }
          conFiltros={conFiltros}
          alCambiarPagina={(pagina) => actualizar({ pagina })}
        />
      </SeccionInventario>

      {abierto && <PanelMovimiento resumen={abierto} alCerrar={() => setAbierto(null)} />}
      {creando && <PanelNuevoMovimiento alCerrar={() => setCreando(false)} />}
    </div>
  );
}

