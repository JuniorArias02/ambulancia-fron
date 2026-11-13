import { CircleCheck, CircleSlash, Pencil, Plus, ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import { SelectorFiltro } from '../../../components/forms/selector_filtro';
import { useNotificaciones } from '../../../hooks/use_notificaciones';
import { ETIQUETAS_CONTROL, ETIQUETAS_TIPO_INSUMO, LIMITE_POR_PAGINA, TIPOS_INSUMO } from '../constants/catalogos_inventario';
import { claseBotonPrimario } from '../constants/estilos_inventario';
import { useInsumos } from '../hooks/use_consultas_inventario';
import { useMutacionInventario } from '../hooks/use_mutacion_inventario';
import { useParametrosUrl } from '../hooks/use_parametros_url';
import { cambiarEstadoInsumo } from '../services/catalogo.service';
import type { Insumo, TipoInsumo } from '../types/inventario.types';
import { deCatalogo, formatearCantidad, leerBooleano, leerPagina } from '../utils/formato_inventario';
import { BarraHerramientas } from './barra_herramientas';
import { BarraFiltros, Buscador } from './campos_filtro';
import { FormularioInsumo } from './formulario_insumo';
import { Insignia } from './insignia';
import { ListadoInventario } from './listado_inventario';
import { PanelEdicion } from './panel_edicion';
import type { Columna } from './tabla_inventario';

const OPCIONES_TIPO = TIPOS_INSUMO.map((tipo) => ({ valor: tipo, texto: ETIQUETAS_TIPO_INSUMO[tipo] }));
const VALORES_ACTIVO = ['true', 'false'] as const;
const OPCIONES_ACTIVO = [
  { valor: 'true', texto: 'Activos' },
  { valor: 'false', texto: 'Inactivos' },
] as const;

const COLUMNAS: Columna<Insumo>[] = [
  {
    clave: 'insumo',
    encabezado: 'Insumo',
    celda: (insumo) => (
      <div className="min-w-0">
        <p className="flex flex-wrap items-center gap-2 font-medium">
          {insumo.nombre}
          {insumo.esControlEspecial && (
            <Insignia tono="advertencia" icono={ShieldAlert}>
              Control especial
            </Insignia>
          )}
        </p>
        <p className="text-[13px] text-texto-secundario">
          {insumo.codigo}
          {insumo.categoria && ` · ${insumo.categoria}`}
        </p>
      </div>
    ),
  },
  { clave: 'tipo', encabezado: 'Tipo', celda: (insumo) => ETIQUETAS_TIPO_INSUMO[insumo.tipo], clase: 'text-[13px] whitespace-nowrap' },
  {
    clave: 'control',
    encabezado: 'Control',
    celda: (insumo) => (
      <span className="text-[13px]">
        {ETIQUETAS_CONTROL[insumo.control].titulo}
        {insumo.requiereVencimiento && <span className="block text-texto-secundario">Con vencimiento</span>}
      </span>
    ),
    clase: 'hidden lg:table-cell',
  },
  {
    clave: 'minimo',
    encabezado: 'Stock mínimo',
    celda: (insumo) => (
      <span className="tabular-nums">
        {formatearCantidad(insumo.stockMinimo)} <span className="text-texto-secundario">{insumo.unidadMedida}</span>
      </span>
    ),
    clase: 'whitespace-nowrap',
  },
  {
    clave: 'estado',
    encabezado: 'Estado',
    celda: (insumo) =>
      insumo.activo ? <Insignia tono="exito">Activo</Insignia> : <Insignia tono="neutro">Inactivo</Insignia>,
  },
];

type Panel = { tipo: 'crear' } | { tipo: 'editar'; insumo: Insumo };

export function VistaInsumos() {
  const { leer, actualizar } = useParametrosUrl();
  const { notificar } = useNotificaciones();
  const filtros = {
    busqueda: leer('busqueda'),
    tipo: deCatalogo(TIPOS_INSUMO, leer('tipo')),
    activo: leerBooleano(leer('activo')),
    pagina: leerPagina(leer('pagina')),
    limite: LIMITE_POR_PAGINA,
  };
  const insumos = useInsumos(filtros);
  const estado = useMutacionInventario(({ insumo, activo }: { insumo: Insumo; activo: boolean }) =>
    cambiarEstadoInsumo(insumo.id, activo),
  );
  const [panel, setPanel] = useState<Panel | null>(null);
  const cerrar = () => setPanel(null);

  const alternarEstado = (insumo: Insumo) =>
    estado.mutate(
      { insumo, activo: !insumo.activo },
      {
        onSuccess: (actualizado) =>
          notificar({ tono: 'exito', titulo: actualizado.activo ? 'Insumo activado' : 'Insumo desactivado', descripcion: actualizado.nombre }),
        onError: (error) => notificar({ tono: 'error', titulo: 'No fue posible cambiar el estado', descripcion: error.message }),
      },
    );

  return (
    <>
      <BarraHerramientas
        filtros={
          <BarraFiltros>
            <Buscador etiqueta="Buscar insumos" placeholder="Buscar por código o nombre" valor={filtros.busqueda} alCambiar={(busqueda) => actualizar({ busqueda })} />
            <SelectorFiltro<TipoInsumo> etiqueta="Filtrar por tipo" valor={filtros.tipo} opciones={OPCIONES_TIPO} textoTodos="Todos los tipos" alCambiar={(tipo) => actualizar({ tipo })} />
            <SelectorFiltro<'true' | 'false'>
              etiqueta="Filtrar por estado"
              valor={deCatalogo(VALORES_ACTIVO, leer('activo'))}
              opciones={OPCIONES_ACTIVO}
              textoTodos="Activos e inactivos"
              alCambiar={(activo) => actualizar({ activo })}
            />
          </BarraFiltros>
        }
        accion={
          <button type="button" onClick={() => setPanel({ tipo: 'crear' })} className={claseBotonPrimario}>
            <Plus aria-hidden strokeWidth={1.75} className="size-4" />
            Nuevo insumo
          </button>
        }
      />
      <ListadoInventario
        consulta={insumos}
        columnas={COLUMNAS}
        claveFila={(insumo) => insumo.id}
        etiquetaFila={(insumo) => insumo.nombre}
        acciones={(insumo) => [
          { etiqueta: 'Editar', icono: Pencil, alSeleccionar: () => setPanel({ tipo: 'editar', insumo }) },
          insumo.activo
            ? { etiqueta: 'Desactivar', icono: CircleSlash, alSeleccionar: () => alternarEstado(insumo) }
            : { etiqueta: 'Activar', icono: CircleCheck, alSeleccionar: () => alternarEstado(insumo) },
        ]}
        tituloError="No fue posible cargar los insumos"
        vacio={{ titulo: 'Aún no hay insumos', mensaje: 'El catálogo es el primer paso: crea los insumos que maneja la bodega.' }}
        conFiltros={Boolean(filtros.busqueda || filtros.tipo || filtros.activo !== undefined)}
        alCambiarPagina={(pagina) => actualizar({ pagina })}
      />
      {panel && (
        <PanelEdicion
          titulo={panel.tipo === 'crear' ? 'Nuevo insumo' : 'Editar insumo'}
          descripcion={panel.tipo === 'editar' ? `${panel.insumo.codigo} · ${panel.insumo.nombre}` : 'Agrega un elemento al catálogo.'}
          alCerrar={cerrar}
        >
          {({ alCambiarSinGuardar, solicitarCierre }) => (
            <FormularioInsumo
              insumo={panel.tipo === 'editar' ? panel.insumo : null}
              alCambiarSinGuardar={alCambiarSinGuardar}
              alTerminar={cerrar}
              alCancelar={solicitarCierre}
            />
          )}
        </PanelEdicion>
      )}
    </>
  );
}
