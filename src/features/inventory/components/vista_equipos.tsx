import { ArrowLeftRight, Pencil, Plus, Wrench } from 'lucide-react';
import { useState } from 'react';
import { SelectorFiltro } from '../../../components/forms/selector_filtro';
import type { AccionMenu } from '../../../components/ui/menu_acciones';
import { ESTADOS_EQUIPO, ETIQUETAS_ESTADO_EQUIPO, LIMITE_POR_PAGINA } from '../constants/catalogos_inventario';
import { claseBotonPrimario, TONO_ESTADO_EQUIPO } from '../constants/estilos_inventario';
import { useEquipos } from '../hooks/use_consultas_inventario';
import { useParametrosUrl } from '../hooks/use_parametros_url';
import type { Equipo, EstadoEquipo } from '../types/inventario.types';
import { deCatalogo, diaDeHoy, formatearDia, leerPagina } from '../utils/formato_inventario';
import { BarraHerramientas } from './barra_herramientas';
import { BarraFiltros, Buscador, CampoDia } from './campos_filtro';
import { DialogoEstadoEquipo } from './dialogo_estado_equipo';
import { FormularioEquipo } from './formulario_equipo';
import { Insignia } from './insignia';
import { ListadoInventario } from './listado_inventario';
import { PanelEdicion } from './panel_edicion';
import { PanelMantenimientos } from './panel_mantenimientos';
import type { Columna } from './tabla_inventario';

const OPCIONES_ESTADO = ESTADOS_EQUIPO.map((estado) => ({ valor: estado, texto: ETIQUETAS_ESTADO_EQUIPO[estado] }));

function columnas(hoy: string): Columna<Equipo>[] {
  return [
    {
      clave: 'equipo',
      encabezado: 'Equipo',
      celda: (equipo) => (
        <div className="min-w-0">
          <p className="font-medium">{equipo.insumoNombre ?? 'Equipo'}</p>
          <p className="text-[13px] text-texto-secundario">
            Serie {equipo.numeroSerie}
            {(equipo.marca ?? equipo.modelo) && ` · ${[equipo.marca, equipo.modelo].filter(Boolean).join(' ')}`}
          </p>
        </div>
      ),
    },
    {
      clave: 'estado',
      encabezado: 'Estado',
      celda: (equipo) => <Insignia tono={TONO_ESTADO_EQUIPO[equipo.estado]}>{ETIQUETAS_ESTADO_EQUIPO[equipo.estado]}</Insignia>,
    },
    {
      clave: 'mantenimiento',
      encabezado: 'Próximo mantenimiento',
      celda: (equipo) => {
        const proximo = equipo.fechaProximoMantenimiento;
        const atrasado = proximo !== null && proximo < hoy && equipo.estado !== 'baja';
        return (
          <span className={`tabular-nums ${atrasado ? 'font-medium text-critico' : ''}`}>
            {formatearDia(proximo)}
            {atrasado && <span className="sr-only"> (atrasado)</span>}
          </span>
        );
      },
      clase: 'whitespace-nowrap',
    },
    { clave: 'ultimo', encabezado: 'Último', celda: (equipo) => formatearDia(equipo.fechaUltimoMantenimiento), clase: 'hidden lg:table-cell tabular-nums text-[13px]' },
  ];
}

type Accion = { tipo: 'crear' } | { tipo: 'editar' | 'estado' | 'mantenimientos'; equipo: Equipo };

export function VistaEquipos() {
  const { leer, actualizar } = useParametrosUrl();
  const [hoy] = useState(() => diaDeHoy());
  const filtros = {
    busqueda: leer('busqueda'),
    estado: deCatalogo(ESTADOS_EQUIPO, leer('estado')),
    mantenimientoHasta: leer('mantenimientoHasta'),
    pagina: leerPagina(leer('pagina')),
    limite: LIMITE_POR_PAGINA,
  };
  const equipos = useEquipos(filtros);
  const [accion, setAccion] = useState<Accion | null>(null);
  const cerrar = () => setAccion(null);

  const acciones = (equipo: Equipo): AccionMenu[] => [
    { etiqueta: 'Mantenimientos', icono: Wrench, alSeleccionar: () => setAccion({ tipo: 'mantenimientos', equipo }) },
    // La baja es definitiva: después no admite cambios.
    ...(equipo.estado === 'baja'
      ? []
      : [
          { etiqueta: 'Cambiar estado', icono: ArrowLeftRight, alSeleccionar: () => setAccion({ tipo: 'estado', equipo }) },
          { etiqueta: 'Editar datos', icono: Pencil, alSeleccionar: () => setAccion({ tipo: 'editar', equipo }) },
        ]),
  ];

  return (
    <>
      <BarraHerramientas
        filtros={
          <BarraFiltros>
            <Buscador etiqueta="Buscar equipos" placeholder="Buscar por serie, marca o modelo" valor={filtros.busqueda} alCambiar={(busqueda) => actualizar({ busqueda })} />
            <SelectorFiltro<EstadoEquipo> etiqueta="Filtrar por estado" valor={filtros.estado} opciones={OPCIONES_ESTADO} textoTodos="Todos los estados" alCambiar={(estado) => actualizar({ estado })} />
            <CampoDia etiqueta="Mantenimiento hasta" valor={filtros.mantenimientoHasta} alCambiar={(mantenimientoHasta) => actualizar({ mantenimientoHasta })} />
          </BarraFiltros>
        }
        accion={
          <button type="button" onClick={() => setAccion({ tipo: 'crear' })} className={claseBotonPrimario}>
            <Plus aria-hidden strokeWidth={1.75} className="size-4" />
            Nuevo equipo
          </button>
        }
      />
      <ListadoInventario
        consulta={equipos}
        columnas={columnas(hoy)}
        claveFila={(equipo) => equipo.id}
        etiquetaFila={(equipo) => `equipo serie ${equipo.numeroSerie}`}
        acciones={acciones}
        tituloError="No fue posible cargar los equipos"
        vacio={{ titulo: 'Aún no hay equipos', mensaje: 'Registra los equipos biomédicos por su número de serie.' }}
        conFiltros={Boolean(filtros.busqueda || filtros.estado || filtros.mantenimientoHasta)}
        alCambiarPagina={(pagina) => actualizar({ pagina })}
      />
      {(accion?.tipo === 'crear' || accion?.tipo === 'editar') && (
        <PanelEdicion
          titulo={accion.tipo === 'crear' ? 'Nuevo equipo' : 'Editar equipo'}
          descripcion={accion.tipo === 'editar' ? `Serie ${accion.equipo.numeroSerie}` : 'Equipo individual por número de serie.'}
          alCerrar={cerrar}
        >
          {({ alCambiarSinGuardar, solicitarCierre }) => (
            <FormularioEquipo
              equipo={accion.tipo === 'editar' ? accion.equipo : null}
              alCambiarSinGuardar={alCambiarSinGuardar}
              alTerminar={cerrar}
              alCancelar={solicitarCierre}
            />
          )}
        </PanelEdicion>
      )}
      {accion?.tipo === 'estado' && <DialogoEstadoEquipo equipo={accion.equipo} alCerrar={cerrar} />}
      {accion?.tipo === 'mantenimientos' && <PanelMantenimientos equipo={accion.equipo} alCerrar={cerrar} />}
    </>
  );
}
