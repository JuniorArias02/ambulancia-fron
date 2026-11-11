import { Inbox, LoaderCircle, SearchX, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { generatePath, useNavigate } from 'react-router';
import { Paginacion } from '../../../components/data/paginacion';
import { EstadoError } from '../../../components/states/estado_error';
import { RUTAS } from '../../../constants/rutas';
import { useSesion } from '../../authentication/hooks/use_sesion';
import { BarraFiltrosUsuarios } from '../components/barra_filtros_usuarios';
import { DialogoCambiarEstado } from '../components/dialogo_cambiar_estado';
import { DialogoCambiarRol } from '../components/dialogo_cambiar_rol';
import { EsqueletoUsuarios } from '../components/esqueleto_usuarios';
import { PanelUsuario } from '../components/panel_usuario';
import { TablaUsuarios } from '../components/tabla_usuarios';
import { useFiltrosUsuarios } from '../hooks/use_filtros_usuarios';
import { useUsuarios } from '../hooks/use_usuarios';
import type { EstadoUsuario, Usuario } from '../types/usuario.types';

type AccionActiva =
  | { tipo: 'crear' }
  | { tipo: 'editar'; usuario: Usuario }
  | { tipo: 'rol'; usuario: Usuario }
  | { tipo: 'estado'; usuario: Usuario; estado: EstadoUsuario };

interface PropiedadesEstadoVacio {
  conFiltros: boolean;
  alLimpiarFiltros: () => void;
}

function EstadoVacio({ conFiltros, alLimpiarFiltros }: PropiedadesEstadoVacio) {
  const Icono = conFiltros ? SearchX : Inbox;
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <span className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-primario/8 text-primario">
        <Icono aria-hidden strokeWidth={1.75} className="size-[22px]" />
      </span>
      <p className="text-base font-semibold text-texto">
        {conFiltros ? 'Sin resultados' : 'Aún no hay usuarios'}
      </p>
      <p className="mt-1 max-w-sm text-sm text-texto-secundario">
        {conFiltros
          ? 'Ningún usuario coincide con los filtros aplicados.'
          : 'Crea el primer usuario para darle acceso a la plataforma.'}
      </p>
      {conFiltros && (
        <button
          type="button"
          onClick={alLimpiarFiltros}
          className="campo-vidrio mt-5 h-10 rounded-xl px-4 text-sm font-medium text-texto hover:bg-white"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );
}

export function PaginaUsuarios() {
  const navegar = useNavigate();
  const { usuario: usuarioActual } = useSesion();
  const { filtros, actualizarFiltros, hayFiltrosActivos } = useFiltrosUsuarios();
  const usuarios = useUsuarios(filtros);
  const [accion, setAccion] = useState<AccionActiva | null>(null);
  const cerrarAccion = () => setAccion(null);

  const resultado = usuarios.data;
  const actualizando = usuarios.isFetching && !usuarios.isPending;

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <section aria-labelledby="titulo-usuarios" className="vidrio rounded-2xl">
        <header className="flex flex-col gap-4 border-b border-borde/70 px-5 pt-5 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 id="titulo-usuarios" className="text-xl font-semibold tracking-tight text-texto">
                Usuarios del sistema
              </h2>
              <p className="mt-0.5 flex items-center gap-2 text-sm text-texto-secundario">
                {resultado
                  ? `${resultado.total} ${resultado.total === 1 ? 'usuario' : 'usuarios'}`
                  : 'Gestiona el acceso del personal a la plataforma.'}
                {actualizando && (
                  <span className="inline-flex items-center gap-1.5 text-[13px]">
                    <LoaderCircle aria-hidden className="size-3.5 animate-spin" />
                    Actualizando…
                  </span>
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setAccion({ tipo: 'crear' })}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-primario px-4 text-sm font-semibold text-white shadow-primario transition-colors duration-150 hover:bg-primario-hover focus-visible:ring-4 focus-visible:ring-primario/25 focus-visible:outline-none"
            >
              <UserPlus aria-hidden strokeWidth={1.75} className="size-4" />
              Nuevo usuario
            </button>
          </div>

          <BarraFiltrosUsuarios
            filtros={filtros}
            hayFiltrosActivos={hayFiltrosActivos}
            alCambiar={actualizarFiltros}
          />
        </header>

        {usuarios.isPending ? (
          <EsqueletoUsuarios />
        ) : usuarios.isError ? (
          <EstadoError
            titulo="No fue posible cargar los usuarios"
            mensaje={usuarios.error.message}
            alReintentar={() => void usuarios.refetch()}
          />
        ) : usuarios.data.datos.length === 0 ? (
          <EstadoVacio
            conFiltros={hayFiltrosActivos}
            alLimpiarFiltros={() =>
              actualizarFiltros({ busqueda: undefined, estado: undefined, rol: undefined })
            }
          />
        ) : (
          <>
            <div className={actualizando ? 'opacity-70 transition-opacity' : 'transition-opacity'}>
              <TablaUsuarios
                usuarios={usuarios.data.datos}
                idUsuarioActual={usuarioActual?.id ?? ''}
                alEditar={(usuario) => setAccion({ tipo: 'editar', usuario })}
                alCambiarRol={(usuario) => setAccion({ tipo: 'rol', usuario })}
                alVerVerificacion={(usuario) =>
                  void navegar(generatePath(RUTAS.detalleVerificacion, { usuarioId: usuario.id }))
                }
                alCambiarEstado={(usuario, estado) => setAccion({ tipo: 'estado', usuario, estado })}
              />
            </div>
            <div className="border-t border-borde/70 px-5 py-4">
              <Paginacion
                pagina={usuarios.data.pagina}
                limite={usuarios.data.limite}
                total={usuarios.data.total}
                deshabilitada={usuarios.isFetching}
                alCambiarPagina={(pagina) => actualizarFiltros({ pagina })}
              />
            </div>
          </>
        )}
      </section>

      {accion?.tipo === 'crear' && <PanelUsuario usuario={null} alCerrar={cerrarAccion} />}
      {accion?.tipo === 'editar' && <PanelUsuario usuario={accion.usuario} alCerrar={cerrarAccion} />}
      {accion?.tipo === 'rol' && <DialogoCambiarRol usuario={accion.usuario} alCerrar={cerrarAccion} />}
      {accion?.tipo === 'estado' && (
        <DialogoCambiarEstado
          usuario={accion.usuario}
          estadoDestino={accion.estado}
          alCerrar={cerrarAccion}
        />
      )}
    </div>
  );
}
