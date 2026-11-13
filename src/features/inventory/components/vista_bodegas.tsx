import { CircleCheck, CircleSlash, Pencil, Plus } from 'lucide-react';
import { useState } from 'react';
import { SelectorFiltro } from '../../../components/forms/selector_filtro';
import { useNotificaciones } from '../../../hooks/use_notificaciones';
import { useSesion } from '../../authentication/hooks/use_sesion';
import { LIMITE_POR_PAGINA } from '../constants/catalogos_inventario';
import { claseBotonPrimario } from '../constants/estilos_inventario';
import { useBodegas } from '../hooks/use_consultas_inventario';
import { useMutacionInventario } from '../hooks/use_mutacion_inventario';
import { useParametrosUrl } from '../hooks/use_parametros_url';
import { cambiarEstadoBodega } from '../services/bodegas.service';
import type { Bodega } from '../types/inventario.types';
import { deCatalogo, leerBooleano, leerPagina } from '../utils/formato_inventario';
import { BarraHerramientas } from './barra_herramientas';
import { BarraFiltros, Buscador } from './campos_filtro';
import { FormularioBodega } from './formulario_bodega';
import { Insignia } from './insignia';
import { ListadoInventario } from './listado_inventario';
import { PanelEdicion } from './panel_edicion';
import type { Columna } from './tabla_inventario';

const VALORES_ACTIVA = ['true', 'false'] as const;
const OPCIONES_ACTIVA = [
  { valor: 'true', texto: 'Activas' },
  { valor: 'false', texto: 'Inactivas' },
] as const;

const COLUMNAS: Columna<Bodega>[] = [
  {
    clave: 'bodega',
    encabezado: 'Bodega',
    celda: (bodega) => (
      <div className="min-w-0">
        <p className="font-medium">{bodega.nombre}</p>
        <p className="text-[13px] text-texto-secundario">{bodega.codigo}</p>
      </div>
    ),
  },
  { clave: 'ubicacion', encabezado: 'Dirección', celda: (bodega) => bodega.ubicacion ?? '—', clase: 'hidden lg:table-cell text-[13px]' },
  { clave: 'responsable', encabezado: 'Responsable', celda: (bodega) => bodega.responsableNombre ?? '—', clase: 'text-[13px]' },
  {
    clave: 'estado',
    encabezado: 'Estado',
    celda: (bodega) => (bodega.activa ? <Insignia tono="exito">Activa</Insignia> : <Insignia tono="neutro">Inactiva</Insignia>),
  },
];

export function VistaBodegas() {
  const { leer, actualizar } = useParametrosUrl();
  const { usuario } = useSesion();
  const { notificar } = useNotificaciones();
  const filtros = {
    busqueda: leer('busqueda'),
    activa: leerBooleano(leer('activa')),
    pagina: leerPagina(leer('pagina')),
    limite: LIMITE_POR_PAGINA,
  };
  const bodegas = useBodegas(filtros);
  const estado = useMutacionInventario(({ bodega, activa }: { bodega: Bodega; activa: boolean }) => cambiarEstadoBodega(bodega.id, activa));
  const [panel, setPanel] = useState<{ bodega: Bodega | null } | null>(null);
  const cerrar = () => setPanel(null);

  const alternar = (bodega: Bodega) =>
    estado.mutate(
      { bodega, activa: !bodega.activa },
      {
        onSuccess: (actualizada) =>
          notificar({
            tono: 'exito',
            titulo: actualizada.activa ? 'Bodega activada' : 'Bodega desactivada',
            descripcion: actualizada.activa ? actualizada.nombre : `${actualizada.nombre} ya no recibe ni entrega movimientos.`,
          }),
        onError: (error) => notificar({ tono: 'error', titulo: 'No fue posible cambiar el estado', descripcion: error.message }),
      },
    );

  return (
    <>
      <BarraHerramientas
        filtros={
          <BarraFiltros>
            <Buscador etiqueta="Buscar bodegas" placeholder="Buscar por código o nombre" valor={filtros.busqueda} alCambiar={(busqueda) => actualizar({ busqueda })} />
            <SelectorFiltro<'true' | 'false'> etiqueta="Filtrar por estado" valor={deCatalogo(VALORES_ACTIVA, leer('activa'))} opciones={OPCIONES_ACTIVA} textoTodos="Activas e inactivas" alCambiar={(activa) => actualizar({ activa })} />
          </BarraFiltros>
        }
        accion={
          <button type="button" onClick={() => setPanel({ bodega: null })} className={claseBotonPrimario}>
            <Plus aria-hidden strokeWidth={1.75} className="size-4" />
            Nueva bodega
          </button>
        }
      />
      <ListadoInventario
        consulta={bodegas}
        columnas={COLUMNAS}
        claveFila={(bodega) => bodega.id}
        etiquetaFila={(bodega) => bodega.nombre}
        acciones={(bodega) => [
          { etiqueta: 'Editar', icono: Pencil, alSeleccionar: () => setPanel({ bodega }) },
          bodega.activa
            ? { etiqueta: 'Desactivar', icono: CircleSlash, alSeleccionar: () => alternar(bodega), tono: 'peligro' }
            : { etiqueta: 'Activar', icono: CircleCheck, alSeleccionar: () => alternar(bodega) },
        ]}
        tituloError="No fue posible cargar las bodegas"
        vacio={{ titulo: 'Aún no hay bodegas', mensaje: 'Cada bodega recibe las entradas y abastece a las ambulancias.' }}
        conFiltros={Boolean(filtros.busqueda || filtros.activa !== undefined)}
        alCambiarPagina={(pagina) => actualizar({ pagina })}
      />
      {panel && (
        <PanelEdicion titulo={panel.bodega ? 'Editar bodega' : 'Nueva bodega'} descripcion={panel.bodega?.nombre} alCerrar={cerrar}>
          {({ alCambiarSinGuardar, solicitarCierre }) => (
            <FormularioBodega
              bodega={panel.bodega}
              puedeElegirResponsable={usuario?.rol === 'administrador'}
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
