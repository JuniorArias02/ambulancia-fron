import { ClipboardCheck, ListChecks, SearchCheck, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { SelectorFiltro } from '../../../components/forms/selector_filtro';
import { SelectorSegmentado } from '../../../components/ui/selector_segmentado';
import { formatearFechaHora } from '../../../utils/formato_fecha';
import { BarraFiltros, CampoDia, FiltroBuscable } from '../components/campos_filtro';
import { Insignia } from '../components/insignia';
import { ListadoInventario } from '../components/listado_inventario';
import { PanelVerificacion } from '../components/panel_verificacion';
import { SeccionInventario } from '../components/seccion_inventario';
import type { Columna } from '../components/tabla_inventario';
import {
  ESTADOS_VERIFICACION,
  ETIQUETAS_ESTADO_VERIFICACION,
  ETIQUETAS_TIPO_VERIFICACION,
  INTERVALO_RESUMEN_MS,
  LIMITE_POR_PAGINA,
  TIPOS_VERIFICACION,
} from '../constants/catalogos_inventario';
import { TONO_ESTADO_VERIFICACION } from '../constants/estilos_inventario';
import { useUbicaciones, useVerificacionesInventario } from '../hooks/use_consultas_inventario';
import { useParametrosUrl } from '../hooks/use_parametros_url';
import type { EstadoVerificacionInventario, FiltrosVerificacionesInventario, TipoVerificacion, VerificacionInventario } from '../types/inventario.types';
import { deCatalogo, leerPagina } from '../utils/formato_inventario';
import { opcionesUbicaciones } from '../utils/opciones_inventario';

const VISTAS = ['novedades', 'revisadas', 'todas'] as const;
type Vista = (typeof VISTAS)[number];

const OPCIONES_VISTA = [
  { valor: 'novedades', texto: 'Novedades por revisar', icono: SearchCheck },
  { valor: 'revisadas', texto: 'Revisadas', icono: ShieldCheck },
  { valor: 'todas', texto: 'Todas', icono: ListChecks },
] as const;

/** Las pendientes y las revisadas se distinguen además de su estado. */
function EstadoVerificacion({ verificacion }: { verificacion: VerificacionInventario }) {
  if (verificacion.pendienteDeRevision) return <Insignia tono="advertencia">Pendiente de revisión</Insignia>;
  if (verificacion.revision) return <Insignia tono="exito">Revisada</Insignia>;
  return <Insignia tono={TONO_ESTADO_VERIFICACION[verificacion.estado]}>{ETIQUETAS_ESTADO_VERIFICACION[verificacion.estado]}</Insignia>;
}

const OPCIONES_TIPO = TIPOS_VERIFICACION.map((tipo) => ({ valor: tipo, texto: ETIQUETAS_TIPO_VERIFICACION[tipo] }));
const OPCIONES_ESTADO = ESTADOS_VERIFICACION.map((estado) => ({ valor: estado, texto: ETIQUETAS_ESTADO_VERIFICACION[estado] }));

const COLUMNAS: Columna<VerificacionInventario>[] = [
  {
    clave: 'ubicacion',
    encabezado: 'Ubicación',
    celda: (verificacion) => (
      <div className="min-w-0">
        <p className="font-medium">{verificacion.ubicacionNombre ?? '—'}</p>
        <p className="text-[13px] text-texto-secundario">{ETIQUETAS_TIPO_VERIFICACION[verificacion.tipo]}</p>
      </div>
    ),
  },
  { clave: 'responsable', encabezado: 'Responsable', celda: (verificacion) => verificacion.responsableNombre ?? '—', clase: 'text-[13px]' },
  {
    clave: 'finalizada',
    encabezado: 'Finalizada',
    celda: (verificacion) => (verificacion.finalizadaEn ? formatearFechaHora(verificacion.finalizadaEn) : 'En curso'),
    clase: 'hidden lg:table-cell tabular-nums text-[13px]',
  },
  {
    clave: 'novedades',
    encabezado: 'Novedades',
    celda: (verificacion) =>
      verificacion.totalNovedades > 0 ? (
        <span className="font-semibold text-advertencia-hover tabular-nums">{verificacion.totalNovedades}</span>
      ) : (
        <span className="text-texto-secundario">0</span>
      ),
  },
  {
    clave: 'estado',
    encabezado: 'Estado',
    celda: (verificacion) => <EstadoVerificacion verificacion={verificacion} />,
  },
];

export function PaginaVerificacionesInventario() {
  const { leer, actualizar } = useParametrosUrl();
  const ubicaciones = useUbicaciones();
  const vista = deCatalogo(VISTAS, leer('vista')) ?? 'novedades';
  const enBandeja = vista === 'novedades';
  const porRevision = vista !== 'todas';
  const filtros: FiltrosVerificacionesInventario = {
    // La bandeja son las que tienen novedades sin revisar; `revisada` solo aplica a esas.
    revisada: porRevision ? vista === 'revisadas' : undefined,
    estado: porRevision ? undefined : deCatalogo(ESTADOS_VERIFICACION, leer('estado')),
    tipo: deCatalogo(TIPOS_VERIFICACION, leer('tipo')),
    ubicacionId: leer('ubicacionId'),
    desde: leer('desde'),
    hasta: leer('hasta'),
    pagina: leerPagina(leer('pagina')),
    limite: LIMITE_POR_PAGINA,
  };
  const verificaciones = useVerificacionesInventario(filtros, enBandeja ? INTERVALO_RESUMEN_MS : false);
  const [abierta, setAbierta] = useState<VerificacionInventario | null>(null);
  const opcionesUbicacion = opcionesUbicaciones(ubicaciones.data ?? []);
  const conFiltros = Boolean(filtros.estado || filtros.tipo || filtros.ubicacionId || filtros.desde || filtros.hasta);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <SeccionInventario
        id="titulo-verificaciones-inventario"
        titulo="Verificaciones de inventario"
        icono={ClipboardCheck}
        descripcion={
          enBandeja
            ? 'Conteos con faltantes, sobrantes, vencidos o dañados. Corrígelos con movimientos y marca cada verificación como revisada.'
            : vista === 'revisadas'
              ? 'Verificaciones con novedades ya revisadas, con la constancia de cómo se resolvieron.'
              : 'Conteos que hacen los paramédicos al iniciar o terminar el turno.'
        }
        actualizando={verificaciones.isFetching && !verificaciones.isPending}
        controles={
          <div className="space-y-3">
            <div className="-mx-1 overflow-x-auto px-1 pb-1">
              <SelectorSegmentado<Vista>
                etiqueta="Vista"
                valor={vista}
                opciones={OPCIONES_VISTA}
                alCambiar={(nueva) => actualizar({ vista: nueva === 'novedades' ? undefined : nueva, estado: undefined })}
              />
            </div>
            <BarraFiltros>
              <FiltroBuscable etiqueta="Filtrar por ubicación" valor={filtros.ubicacionId} opciones={opcionesUbicacion} textoTodos="Todas las ubicaciones" alCambiar={(ubicacionId) => actualizar({ ubicacionId })} />
              <SelectorFiltro<TipoVerificacion> etiqueta="Filtrar por tipo" valor={filtros.tipo} opciones={OPCIONES_TIPO} textoTodos="Todos los tipos" alCambiar={(tipo) => actualizar({ tipo })} />
              {!porRevision && (
                <SelectorFiltro<EstadoVerificacionInventario> etiqueta="Filtrar por estado" valor={filtros.estado} opciones={OPCIONES_ESTADO} textoTodos="Todos los estados" alCambiar={(estado) => actualizar({ estado })} />
              )}
              <CampoDia etiqueta="Desde" valor={filtros.desde} maximo={filtros.hasta} alCambiar={(desde) => actualizar({ desde })} />
              <CampoDia etiqueta="Hasta" valor={filtros.hasta} minimo={filtros.desde} alCambiar={(hasta) => actualizar({ hasta })} />
            </BarraFiltros>
          </div>
        }
      >
        <ListadoInventario
          consulta={verificaciones}
          columnas={COLUMNAS}
          claveFila={(verificacion) => verificacion.id}
          etiquetaFila={(verificacion) => `verificación de ${verificacion.ubicacionNombre ?? 'inventario'}`}
          alSeleccionar={setAbierta}
          tituloError="No fue posible cargar las verificaciones"
          vacio={
            enBandeja
              ? { titulo: 'Sin novedades por revisar', mensaje: 'Todas las novedades están revisadas.' }
              : vista === 'revisadas'
                ? { titulo: 'Aún no hay revisiones', mensaje: 'Las verificaciones revisadas aparecerán aquí con su constancia.' }
                : { titulo: 'Aún no hay verificaciones', mensaje: 'Los paramédicos las hacen desde la app al iniciar o terminar el turno.' }
          }
          conFiltros={conFiltros}
          alCambiarPagina={(pagina) => actualizar({ pagina })}
        />
      </SeccionInventario>
      {abierta && <PanelVerificacion resumen={abierta} alCerrar={() => setAbierta(null)} />}
    </div>
  );
}
