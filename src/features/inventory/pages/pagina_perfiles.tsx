import { ListChecks, Plus } from 'lucide-react';
import { useState } from 'react';
import { generatePath, useNavigate } from 'react-router';
import { SelectorFiltro } from '../../../components/forms/selector_filtro';
import { RUTAS } from '../../../constants/rutas';
import { useTiposAmbulancia } from '../../ambulances/hooks/use_tipos_ambulancia';
import { BarraFiltros, Buscador } from '../components/campos_filtro';
import { FormularioPerfil } from '../components/formulario_perfil';
import { InsigniaPerfil } from '../components/insignia_perfil';
import { ListadoInventario } from '../components/listado_inventario';
import { PanelEdicion } from '../components/panel_edicion';
import { SeccionInventario } from '../components/seccion_inventario';
import type { Columna } from '../components/tabla_inventario';
import { LIMITE_POR_PAGINA } from '../constants/catalogos_inventario';
import { claseBotonPrimario } from '../constants/estilos_inventario';
import { usePerfiles } from '../hooks/use_consultas_inventario';
import { useParametrosUrl } from '../hooks/use_parametros_url';
import type { PerfilDotacion } from '../types/inventario.types';
import { deCatalogo, formatearDia, leerBooleano, leerPagina } from '../utils/formato_inventario';

const VALORES_ACTIVO = ['true', 'false'] as const;
const OPCIONES_ACTIVO = [
  { valor: 'true', texto: 'Activos' },
  { valor: 'false', texto: 'Inactivos' },
] as const;

function textoVigencia(perfil: PerfilDotacion): string {
  if (!perfil.vigenteDesde && !perfil.vigenteHasta) return 'Sin límite';
  return `${formatearDia(perfil.vigenteDesde)} – ${perfil.vigenteHasta ? formatearDia(perfil.vigenteHasta) : 'sin fin'}`;
}

const COLUMNAS: Columna<PerfilDotacion>[] = [
  {
    clave: 'perfil',
    encabezado: 'Perfil',
    celda: (perfil) => (
      <div className="min-w-0">
        <p className="font-medium">{perfil.nombre}</p>
        <p className="text-[13px] text-texto-secundario">
          {perfil.codigo} · versión {perfil.version}
        </p>
      </div>
    ),
  },
  { clave: 'tipo', encabezado: 'Tipo de ambulancia', celda: (perfil) => perfil.tipoAmbulanciaNombre ?? '—', clase: 'text-[13px]' },
  { clave: 'vigencia', encabezado: 'Vigencia', celda: textoVigencia, clase: 'hidden lg:table-cell text-[13px] tabular-nums' },
  { clave: 'elementos', encabezado: 'Elementos', celda: (perfil) => perfil.detalles.length, clase: 'hidden md:table-cell tabular-nums text-[13px]' },
  { clave: 'estado', encabezado: 'Estado', celda: (perfil) => <InsigniaPerfil perfil={perfil} /> },
];

export function PaginaPerfiles() {
  const navegar = useNavigate();
  const { leer, actualizar } = useParametrosUrl();
  const tipos = useTiposAmbulancia();
  const filtros = {
    tipoAmbulanciaId: leer('tipoAmbulanciaId'),
    activo: leerBooleano(leer('activo')),
    codigo: leer('codigo'),
    pagina: leerPagina(leer('pagina')),
    limite: LIMITE_POR_PAGINA,
  };
  const perfiles = usePerfiles(filtros);
  const [creando, setCreando] = useState(false);
  const abrir = (perfil: PerfilDotacion) => void navegar(generatePath(RUTAS.perfilDotacion, { id: perfil.id }));
  const opcionesTipo = (tipos.data ?? []).map((tipo) => ({ valor: tipo.id, texto: tipo.nombre }));

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <SeccionInventario
        id="titulo-perfiles"
        titulo="Perfiles de dotación"
        icono={ListChecks}
        descripcion="Lo que debe llevar cada tipo de ambulancia. Solo un perfil activo por tipo; los cambios se hacen con versiones."
        actualizando={perfiles.isFetching && !perfiles.isPending}
        acciones={
          <button type="button" onClick={() => setCreando(true)} className={claseBotonPrimario}>
            <Plus aria-hidden strokeWidth={1.75} className="size-4" />
            Nuevo perfil
          </button>
        }
        controles={
          <BarraFiltros>
            <Buscador etiqueta="Buscar por código" placeholder="Código, p. ej. DOT-TAB" valor={filtros.codigo} alCambiar={(codigo) => actualizar({ codigo })} />
            <SelectorFiltro<string> etiqueta="Filtrar por tipo de ambulancia" valor={filtros.tipoAmbulanciaId} opciones={opcionesTipo} textoTodos="Todos los tipos" alCambiar={(tipoAmbulanciaId) => actualizar({ tipoAmbulanciaId })} />
            <SelectorFiltro<'true' | 'false'> etiqueta="Filtrar por estado" valor={deCatalogo(VALORES_ACTIVO, leer('activo'))} opciones={OPCIONES_ACTIVO} textoTodos="Activos e inactivos" alCambiar={(activo) => actualizar({ activo })} />
          </BarraFiltros>
        }
      >
        <ListadoInventario
          consulta={perfiles}
          columnas={COLUMNAS}
          claveFila={(perfil) => perfil.id}
          etiquetaFila={(perfil) => `${perfil.codigo} versión ${perfil.version}`}
          alSeleccionar={abrir}
          tituloError="No fue posible cargar los perfiles"
          vacio={{ titulo: 'Aún no hay perfiles', mensaje: 'Define qué debe llevar cada tipo de ambulancia para medir su dotación.' }}
          conFiltros={Boolean(filtros.tipoAmbulanciaId || filtros.activo !== undefined || filtros.codigo)}
          alCambiarPagina={(pagina) => actualizar({ pagina })}
        />
      </SeccionInventario>

      {creando && (
        <PanelEdicion titulo="Nuevo perfil de dotación" descripcion="Versión 1 de un código para un tipo de ambulancia." alCerrar={() => setCreando(false)}>
          {({ alCambiarSinGuardar, solicitarCierre }) => (
            <FormularioPerfil alCambiarSinGuardar={alCambiarSinGuardar} alCrear={abrir} alCancelar={solicitarCierre} />
          )}
        </PanelEdicion>
      )}
    </div>
  );
}
