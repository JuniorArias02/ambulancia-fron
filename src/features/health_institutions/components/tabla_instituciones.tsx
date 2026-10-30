import { CircleCheck, CircleSlash, Hospital, MapPin, Pencil, Power, PowerOff } from 'lucide-react';
import { MenuAcciones, type AccionMenu } from '../../../components/ui/menu_acciones';
import { ETIQUETAS_NIVEL } from '../constants/instituciones';
import type { InstitucionSalud } from '../types/institucion.types';

export interface AccionesInstitucion {
  alEditar: (institucion: InstitucionSalud) => void;
  alCambiarEstado: (institucion: InstitucionSalud) => void;
}

interface PropiedadesTablaInstituciones {
  instituciones: InstitucionSalud[];
  /** Sin valor, el rol solo consulta. */
  acciones?: AccionesInstitucion;
}

function construirAcciones(institucion: InstitucionSalud, { alEditar, alCambiarEstado }: AccionesInstitucion): AccionMenu[] {
  return [
    { etiqueta: 'Editar datos', icono: Pencil, alSeleccionar: () => alEditar(institucion) },
    institucion.activa
      ? { etiqueta: 'Inactivar', icono: PowerOff, tono: 'peligro', alSeleccionar: () => alCambiarEstado(institucion) }
      : { etiqueta: 'Activar', icono: Power, alSeleccionar: () => alCambiarEstado(institucion) },
  ];
}

function InsigniaEstado({ activa }: { activa: boolean }) {
  const Icono = activa ? CircleCheck : CircleSlash;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap ${
        activa ? 'bg-exito/10 text-exito' : 'bg-texto-secundario/10 text-texto-secundario'
      }`}
    >
      <Icono aria-hidden strokeWidth={2} className="size-3.5" />
      {activa ? 'Activa' : 'Inactiva'}
    </span>
  );
}

function Identidad({ institucion }: { institucion: InstitucionSalud }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span aria-hidden className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primario/8 text-primario">
        <Hospital strokeWidth={1.75} className="size-[18px]" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-texto">{institucion.nombre}</p>
        <p className="truncate text-[13px] text-texto-secundario tabular-nums">
          {institucion.codigoHabilitacion ? `REPS ${institucion.codigoHabilitacion}` : 'Sin código de habilitación'}
        </p>
      </div>
    </div>
  );
}

function Nivel({ institucion }: { institucion: InstitucionSalud }) {
  return institucion.nivelComplejidad ? (
    <span className="inline-flex rounded-lg bg-primario/8 px-2 py-0.5 text-xs font-medium whitespace-nowrap text-primario">
      {ETIQUETAS_NIVEL[institucion.nivelComplejidad]}
    </span>
  ) : (
    <span className="text-[13px] text-texto-secundario">Sin nivel</span>
  );
}

export function TablaInstituciones({ instituciones, acciones }: PropiedadesTablaInstituciones) {
  return (
    <>
      <table className="hidden w-full table-fixed text-left md:table">
        <thead>
          <tr className="border-b border-borde/80 text-xs font-medium tracking-wide text-texto-secundario uppercase">
            <th scope="col" className="py-3 pr-4 pl-5 font-medium">Institución</th>
            <th scope="col" className="w-44 px-4 py-3 font-medium">Nivel</th>
            <th scope="col" className="hidden w-44 px-4 py-3 font-medium lg:table-cell">Teléfono</th>
            <th scope="col" className="hidden w-[24%] px-4 py-3 font-medium xl:table-cell">Dirección</th>
            <th scope="col" className="w-28 px-4 py-3 font-medium">Estado</th>
            {acciones && (
              <th scope="col" className="w-14 py-3 pr-5 pl-2">
                <span className="sr-only">Acciones</span>
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-borde/60">
          {instituciones.map((institucion) => (
            <tr key={institucion.id} className="transition-colors duration-150 hover:bg-white/50">
              <td className="py-3 pr-4 pl-5">
                <Identidad institucion={institucion} />
              </td>
              <td className="px-4 py-3">
                <Nivel institucion={institucion} />
              </td>
              <td className="hidden px-4 py-3 text-sm text-texto tabular-nums lg:table-cell">
                {institucion.telefono ? (
                  <a href={`tel:${institucion.telefono.replace(/[\s-]/g, '')}`} className="hover:text-primario">
                    {institucion.telefono}
                  </a>
                ) : (
                  <span className="text-texto-secundario">—</span>
                )}
              </td>
              <td className="hidden truncate px-4 py-3 text-sm text-texto xl:table-cell">
                {institucion.direccion ?? <span className="text-texto-secundario">—</span>}
              </td>
              <td className="px-4 py-3">
                <InsigniaEstado activa={institucion.activa} />
              </td>
              {acciones && (
                <td className="py-3 pr-5 pl-2 text-right">
                  <MenuAcciones
                    etiqueta={`Acciones para ${institucion.nombre}`}
                    acciones={construirAcciones(institucion, acciones)}
                  />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="divide-y divide-borde/60 md:hidden">
        {instituciones.map((institucion) => (
          <li key={institucion.id} className="flex gap-3 px-4 py-4">
            <div className="min-w-0 flex-1 space-y-2.5">
              <Identidad institucion={institucion} />
              <div className="flex flex-wrap items-center gap-2 pl-12">
                <Nivel institucion={institucion} />
                <InsigniaEstado activa={institucion.activa} />
              </div>
              {institucion.direccion && (
                <p className="flex items-center gap-1.5 pl-12 text-[13px] text-texto-secundario">
                  <MapPin aria-hidden strokeWidth={1.75} className="size-3.5 shrink-0" />
                  <span className="truncate">{institucion.direccion}</span>
                </p>
              )}
            </div>
            {acciones && (
              <MenuAcciones
                etiqueta={`Acciones para ${institucion.nombre}`}
                acciones={construirAcciones(institucion, acciones)}
              />
            )}
          </li>
        ))}
      </ul>
    </>
  );
}
