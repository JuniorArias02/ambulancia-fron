import { Ban, CircleCheck, CircleSlash, IdCard, Pencil, UserCog, type LucideIcon } from 'lucide-react';
import { MenuAcciones, type AccionMenu } from '../../../components/ui/menu_acciones';
import { formatearFechaHora } from '../../../utils/formato_fecha';
import { obtenerIniciales } from '../../../utils/iniciales';
import { ACCIONES_ESTADO, ESTADOS_USUARIO } from '../constants/estados_usuario';
import type { EstadoUsuario, Usuario } from '../types/usuario.types';
import { InsigniaEstadoUsuario } from './insignia_estado_usuario';
import { InsigniaRol } from './insignia_rol';

const ICONOS_ACCION_ESTADO: Record<EstadoUsuario, LucideIcon> = {
  activo: CircleCheck,
  inactivo: CircleSlash,
  bloqueado: Ban,
};

export interface AccionesUsuario {
  alEditar: (usuario: Usuario) => void;
  alCambiarRol: (usuario: Usuario) => void;
  alCambiarEstado: (usuario: Usuario, estado: EstadoUsuario) => void;
  alVerVerificacion: (usuario: Usuario) => void;
}

interface PropiedadesTablaUsuarios extends AccionesUsuario {
  usuarios: Usuario[];
  idUsuarioActual: string;
}

function construirAcciones(
  usuario: Usuario,
  esUsuarioActual: boolean,
  { alEditar, alCambiarRol, alCambiarEstado, alVerVerificacion }: AccionesUsuario,
): AccionMenu[] {
  const esCiudadano = usuario.rol === 'ciudadano';
  const acciones: AccionMenu[] = [
    { etiqueta: 'Editar datos', icono: Pencil, alSeleccionar: () => alEditar(usuario) },
  ];
  if (esCiudadano) {
    acciones.unshift({ etiqueta: 'Ver verificación', icono: IdCard, alSeleccionar: () => alVerVerificacion(usuario) });
  }
  // El backend no permite cambiar el estado propio ni quitarse el rol de administrador.
  if (esUsuarioActual) return acciones;

  // Un ciudadano no puede pasar a ser personal: el backend responde 422.
  if (!esCiudadano) {
    acciones.push({ etiqueta: 'Cambiar rol', icono: UserCog, alSeleccionar: () => alCambiarRol(usuario) });
  }
  for (const estado of ESTADOS_USUARIO) {
    if (estado === usuario.estado) continue;
    acciones.push({
      etiqueta: ACCIONES_ESTADO[estado],
      icono: ICONOS_ACCION_ESTADO[estado],
      tono: estado === 'bloqueado' ? 'peligro' : 'normal',
      alSeleccionar: () => alCambiarEstado(usuario, estado),
    });
  }
  return acciones;
}

function IdentidadUsuario({ usuario, esUsuarioActual }: { usuario: Usuario; esUsuarioActual: boolean }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span
        aria-hidden
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primario/10 text-[13px] font-semibold text-primario"
      >
        {obtenerIniciales(usuario.nombres, usuario.apellidos)}
      </span>
      <div className="min-w-0">
        <p className="flex items-center gap-2 truncate text-sm font-medium text-texto">
          <span className="truncate">
            {usuario.nombres} {usuario.apellidos}
          </span>
          {esUsuarioActual && (
            <span className="shrink-0 rounded-md bg-primario/10 px-1.5 py-0.5 text-[11px] font-semibold text-primario">
              Tú
            </span>
          )}
        </p>
        <p className="truncate text-[13px] text-texto-secundario">{usuario.correo}</p>
      </div>
    </div>
  );
}

function textoUltimoAcceso(ultimoAcceso: string | null): string {
  return ultimoAcceso ? formatearFechaHora(ultimoAcceso) : 'Sin accesos';
}

export function TablaUsuarios({ usuarios, idUsuarioActual, ...acciones }: PropiedadesTablaUsuarios) {
  return (
    <>
      <table className="hidden w-full text-left md:table">
        <thead>
          <tr className="border-b border-borde/80 text-xs font-medium tracking-wide text-texto-secundario uppercase">
            <th scope="col" className="py-3 pr-4 pl-5 font-medium">Usuario</th>
            <th scope="col" className="px-4 py-3 font-medium">Rol</th>
            <th scope="col" className="px-4 py-3 font-medium">Estado</th>
            <th scope="col" className="hidden px-4 py-3 font-medium lg:table-cell">Teléfono</th>
            <th scope="col" className="hidden px-4 py-3 font-medium xl:table-cell">Último acceso</th>
            <th scope="col" className="w-14 py-3 pr-5 pl-2">
              <span className="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-borde/60">
          {usuarios.map((usuario) => {
            const esUsuarioActual = usuario.id === idUsuarioActual;
            return (
              <tr key={usuario.id} className="transition-colors duration-150 hover:bg-white/50">
                <td className="max-w-80 py-3 pr-4 pl-5">
                  <IdentidadUsuario usuario={usuario} esUsuarioActual={esUsuarioActual} />
                </td>
                <td className="px-4 py-3">
                  <InsigniaRol rol={usuario.rol} />
                </td>
                <td className="px-4 py-3">
                  <InsigniaEstadoUsuario estado={usuario.estado} />
                </td>
                <td className="hidden px-4 py-3 text-sm whitespace-nowrap text-texto-secundario lg:table-cell">
                  {usuario.telefono ?? '—'}
                </td>
                <td className="hidden px-4 py-3 text-[13px] whitespace-nowrap text-texto-secundario xl:table-cell">
                  {textoUltimoAcceso(usuario.ultimoAcceso)}
                </td>
                <td className="py-3 pr-5 pl-2 text-right">
                  <MenuAcciones
                    etiqueta={`Acciones para ${usuario.nombres} ${usuario.apellidos}`}
                    acciones={construirAcciones(usuario, esUsuarioActual, acciones)}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <ul className="divide-y divide-borde/60 md:hidden">
        {usuarios.map((usuario) => {
          const esUsuarioActual = usuario.id === idUsuarioActual;
          return (
            <li key={usuario.id} className="flex gap-3 px-4 py-4">
              <div className="min-w-0 flex-1 space-y-2.5">
                <IdentidadUsuario usuario={usuario} esUsuarioActual={esUsuarioActual} />
                <div className="flex flex-wrap items-center gap-2 pl-12">
                  <InsigniaRol rol={usuario.rol} />
                  <InsigniaEstadoUsuario estado={usuario.estado} />
                </div>
                <p className="pl-12 text-[13px] text-texto-secundario">
                  Último acceso: {textoUltimoAcceso(usuario.ultimoAcceso)}
                </p>
              </div>
              <MenuAcciones
                etiqueta={`Acciones para ${usuario.nombres} ${usuario.apellidos}`}
                acciones={construirAcciones(usuario, esUsuarioActual, acciones)}
              />
            </li>
          );
        })}
      </ul>
    </>
  );
}
