import { SelectorFiltro } from '../../../components/forms/selector_filtro';
import { Interruptor } from '../../../components/ui/interruptor';
import {
  ETIQUETAS_ESTADO_EQUIPO,
  ETIQUETAS_TIPO_INSUMO,
  ETIQUETAS_TIPO_UBICACION,
  LIMITE_POR_PAGINA,
  TIPOS_INSUMO,
  TIPOS_UBICACION,
} from '../constants/catalogos_inventario';
import { useExistencias, useUbicaciones } from '../hooks/use_consultas_inventario';
import { useParametrosUrl } from '../hooks/use_parametros_url';
import type { Existencia, TipoInsumo, TipoUbicacion } from '../types/inventario.types';
import { deCatalogo, formatearCantidad, formatearDia, leerPagina } from '../utils/formato_inventario';
import { opcionesUbicaciones } from '../utils/opciones_inventario';
import { BarraHerramientas } from './barra_herramientas';
import { BarraFiltros, Buscador, FiltroBuscable } from './campos_filtro';
import { Insignia } from './insignia';
import { NombreUbicacion } from './insignias_movimiento';
import { ListadoInventario } from './listado_inventario';
import type { Columna } from './tabla_inventario';

const OPCIONES_TIPO_UBICACION = TIPOS_UBICACION.map((tipo) => ({ valor: tipo, texto: `${ETIQUETAS_TIPO_UBICACION[tipo]}s` }));
const OPCIONES_TIPO_INSUMO = TIPOS_INSUMO.map((tipo) => ({ valor: tipo, texto: ETIQUETAS_TIPO_INSUMO[tipo] }));

/** Por qué una existencia no se puede usar. */
function motivoNoUtilizable(existencia: Existencia): string {
  if (existencia.equipoEstado && existencia.equipoEstado !== 'operativo') return ETIQUETAS_ESTADO_EQUIPO[existencia.equipoEstado];
  return 'Lote vencido';
}

const COLUMNAS: Columna<Existencia>[] = [
  {
    clave: 'insumo',
    encabezado: 'Insumo',
    celda: (existencia) => (
      <div className="min-w-0">
        <p className="font-medium">{existencia.insumoNombre}</p>
        <p className="text-[13px] text-texto-secundario">{existencia.insumoCodigo}</p>
      </div>
    ),
  },
  {
    clave: 'ubicacion',
    encabezado: 'Ubicación',
    celda: (existencia) => (
      <NombreUbicacion ubicacion={{ id: existencia.ubicacionId, tipo: existencia.ubicacionTipo, nombre: existencia.ubicacionNombre }} />
    ),
    clase: 'text-[13px]',
  },
  {
    clave: 'control',
    encabezado: 'Lote o serie',
    celda: (existencia) =>
      existencia.numeroLote ? (
        <span className="text-[13px]">
          {existencia.numeroLote}
          {existencia.loteVencimiento && <span className="block text-texto-secundario">Vence {formatearDia(existencia.loteVencimiento)}</span>}
        </span>
      ) : existencia.numeroSerie ? (
        <span className="text-[13px]">Serie {existencia.numeroSerie}</span>
      ) : (
        <span className="text-texto-secundario">—</span>
      ),
  },
  {
    clave: 'cantidad',
    encabezado: 'Cantidad',
    celda: (existencia) => (
      <span className="font-semibold tabular-nums">
        {formatearCantidad(existencia.cantidad)} <span className="font-normal text-texto-secundario">{existencia.unidadMedida}</span>
      </span>
    ),
    clase: 'whitespace-nowrap',
  },
  {
    clave: 'estado',
    encabezado: 'Estado',
    celda: (existencia) =>
      existencia.utilizable ? <Insignia tono="exito">Utilizable</Insignia> : <Insignia tono="critico">{motivoNoUtilizable(existencia)}</Insignia>,
  },
];

export function VistaExistencias() {
  const { leer, actualizar } = useParametrosUrl();
  const ubicaciones = useUbicaciones();
  const filtros = {
    busqueda: leer('busqueda'),
    ubicacionId: leer('ubicacionId'),
    tipoUbicacion: deCatalogo(TIPOS_UBICACION, leer('tipoUbicacion')),
    tipoInsumo: deCatalogo(TIPOS_INSUMO, leer('tipoInsumo')),
    incluirAgotadas: leer('agotadas') === 'true' ? true : undefined,
    pagina: leerPagina(leer('pagina')),
    limite: LIMITE_POR_PAGINA,
  };
  const existencias = useExistencias(filtros);
  const opcionesUbicacion = opcionesUbicaciones(
    (ubicaciones.data ?? []).filter((ubicacion) => !filtros.tipoUbicacion || ubicacion.tipo === filtros.tipoUbicacion),
  );

  return (
    <>
      <BarraHerramientas
        filtros={
          <BarraFiltros>
            <Buscador etiqueta="Buscar existencias" placeholder="Buscar insumo, lote o serie" valor={filtros.busqueda} alCambiar={(busqueda) => actualizar({ busqueda })} />
            <SelectorFiltro<TipoUbicacion>
              etiqueta="Filtrar por tipo de ubicación"
              valor={filtros.tipoUbicacion}
              opciones={OPCIONES_TIPO_UBICACION}
              textoTodos="Bodegas y ambulancias"
              alCambiar={(tipoUbicacion) => actualizar({ tipoUbicacion, ubicacionId: undefined })}
            />
            <FiltroBuscable etiqueta="Filtrar por ubicación" valor={filtros.ubicacionId} opciones={opcionesUbicacion} textoTodos="Todas las ubicaciones" alCambiar={(ubicacionId) => actualizar({ ubicacionId })} />
            <SelectorFiltro<TipoInsumo> etiqueta="Filtrar por tipo de insumo" valor={filtros.tipoInsumo} opciones={OPCIONES_TIPO_INSUMO} textoTodos="Todos los tipos" alCambiar={(tipoInsumo) => actualizar({ tipoInsumo })} />
            <Interruptor etiqueta="Incluir agotadas" activo={filtros.incluirAgotadas === true} alCambiar={(activo) => actualizar({ agotadas: activo ? 'true' : undefined })} />
          </BarraFiltros>
        }
      />
      <ListadoInventario
        consulta={existencias}
        columnas={COLUMNAS}
        claveFila={(existencia) => existencia.id}
        etiquetaFila={(existencia) => existencia.insumoNombre}
        resaltar={(existencia) => !existencia.utilizable}
        tituloError="No fue posible cargar las existencias"
        vacio={{ titulo: 'No hay existencias', mensaje: 'Registra una entrada a la bodega para empezar.' }}
        conFiltros={Boolean(filtros.busqueda || filtros.ubicacionId || filtros.tipoUbicacion || filtros.tipoInsumo || filtros.incluirAgotadas)}
        alCambiarPagina={(pagina) => actualizar({ pagina })}
      />
    </>
  );
}
