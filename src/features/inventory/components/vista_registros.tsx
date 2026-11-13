import { ExternalLink, Pencil, Plus } from 'lucide-react';
import { useState } from 'react';
import { SelectorFiltro } from '../../../components/forms/selector_filtro';
import { ESTADOS_REGISTRO, ETIQUETAS_ESTADO_REGISTRO, ETIQUETAS_TIPO_REGISTRO, LIMITE_POR_PAGINA } from '../constants/catalogos_inventario';
import { claseBotonPrimario, TONO_ESTADO_REGISTRO } from '../constants/estilos_inventario';
import { useCatalogoInsumos, useRegistros } from '../hooks/use_consultas_inventario';
import { useParametrosUrl } from '../hooks/use_parametros_url';
import type { EstadoRegistroSanitario, RegistroSanitario } from '../types/inventario.types';
import { deCatalogo, formatearDia, leerPagina } from '../utils/formato_inventario';
import { BarraHerramientas } from './barra_herramientas';
import { opcionesInsumos } from '../utils/opciones_inventario';
import { BarraFiltros, CampoDia, FiltroBuscable } from './campos_filtro';
import { FormularioRegistro } from './formulario_registro';
import { Insignia } from './insignia';
import { ListadoInventario } from './listado_inventario';
import { PanelEdicion } from './panel_edicion';
import type { Columna } from './tabla_inventario';

const OPCIONES_ESTADO = ESTADOS_REGISTRO.map((estado) => ({ valor: estado, texto: ETIQUETAS_ESTADO_REGISTRO[estado] }));

const COLUMNAS: Columna<RegistroSanitario>[] = [
  {
    clave: 'numero',
    encabezado: 'Registro',
    celda: (registro) => (
      <div className="min-w-0">
        <p className="font-medium">{registro.numeroRegistro}</p>
        <p className="text-[13px] text-texto-secundario">{ETIQUETAS_TIPO_REGISTRO[registro.tipoRegistro]}</p>
      </div>
    ),
  },
  { clave: 'insumo', encabezado: 'Insumo', celda: (registro) => registro.insumoNombre ?? '—' },
  {
    clave: 'vencimiento',
    encabezado: 'Vencimiento',
    celda: (registro) => <span className="tabular-nums">{formatearDia(registro.fechaVencimiento)}</span>,
    clase: 'whitespace-nowrap',
  },
  {
    clave: 'estado',
    encabezado: 'Estado',
    celda: (registro) => (
      <span className="flex flex-wrap items-center gap-1.5">
        <Insignia tono={TONO_ESTADO_REGISTRO[registro.estado]}>{ETIQUETAS_ESTADO_REGISTRO[registro.estado]}</Insignia>
        {registro.estado === 'vigente' && !registro.vigenteHoy && <Insignia tono="critico">Ya venció</Insignia>}
      </span>
    ),
  },
  {
    clave: 'soporte',
    encabezado: 'Soporte',
    clase: 'hidden lg:table-cell',
    celda: (registro) =>
      registro.documentoUrl ? (
        <a
          href={registro.documentoUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(evento) => evento.stopPropagation()}
          className="inline-flex items-center gap-1 text-[13px] font-medium text-primario hover:underline"
        >
          Ver documento
          <ExternalLink aria-hidden strokeWidth={1.75} className="size-3.5" />
        </a>
      ) : (
        <span className="text-texto-secundario">—</span>
      ),
  },
];

export function VistaRegistros() {
  const { leer, actualizar } = useParametrosUrl();
  const insumos = useCatalogoInsumos();
  const filtros = {
    insumoId: leer('insumoId'),
    estado: deCatalogo(ESTADOS_REGISTRO, leer('estado')),
    vencenHasta: leer('vencenHasta'),
    pagina: leerPagina(leer('pagina')),
    limite: LIMITE_POR_PAGINA,
  };
  const registros = useRegistros(filtros);
  const [panel, setPanel] = useState<{ registro: RegistroSanitario | null } | null>(null);
  const cerrar = () => setPanel(null);
  const opcionesInsumo = opcionesInsumos((insumos.data ?? []).filter((insumo) => insumo.requiereRegistroSanitario));

  return (
    <>
      <BarraHerramientas
        filtros={
          <BarraFiltros>
            <FiltroBuscable etiqueta="Filtrar por insumo" valor={filtros.insumoId} opciones={opcionesInsumo} textoTodos="Todos los insumos" alCambiar={(insumoId) => actualizar({ insumoId })} />
            <SelectorFiltro<EstadoRegistroSanitario> etiqueta="Filtrar por estado" valor={filtros.estado} opciones={OPCIONES_ESTADO} textoTodos="Todos los estados" alCambiar={(estado) => actualizar({ estado })} />
            <CampoDia etiqueta="Vencen hasta" valor={filtros.vencenHasta} alCambiar={(vencenHasta) => actualizar({ vencenHasta })} />
          </BarraFiltros>
        }
        accion={
          <button type="button" onClick={() => setPanel({ registro: null })} className={claseBotonPrimario}>
            <Plus aria-hidden strokeWidth={1.75} className="size-4" />
            Nuevo registro
          </button>
        }
      />
      <ListadoInventario
        consulta={registros}
        columnas={COLUMNAS}
        claveFila={(registro) => registro.id}
        etiquetaFila={(registro) => registro.numeroRegistro}
        acciones={(registro) => [{ etiqueta: 'Editar', icono: Pencil, alSeleccionar: () => setPanel({ registro }) }]}
        resaltar={(registro) => registro.estado === 'vigente' && !registro.vigenteHoy}
        tituloError="No fue posible cargar los registros"
        vacio={{ titulo: 'Aún no hay registros sanitarios', mensaje: 'Los insumos que los exigen necesitan uno vigente para sus lotes y equipos.' }}
        conFiltros={Boolean(filtros.insumoId || filtros.estado || filtros.vencenHasta)}
        alCambiarPagina={(pagina) => actualizar({ pagina })}
      />
      {panel && (
        <PanelEdicion
          titulo={panel.registro ? 'Editar registro sanitario' : 'Nuevo registro sanitario'}
          descripcion={panel.registro ? panel.registro.numeroRegistro : 'INVIMA, permiso o notificación de un insumo.'}
          alCerrar={cerrar}
        >
          {({ alCambiarSinGuardar, solicitarCierre }) => (
            <FormularioRegistro registro={panel.registro} alCambiarSinGuardar={alCambiarSinGuardar} alTerminar={cerrar} alCancelar={solicitarCierre} />
          )}
        </PanelEdicion>
      )}
    </>
  );
}
