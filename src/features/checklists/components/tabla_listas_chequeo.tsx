import { CircleCheck, CircleSlash, ListChecks, Pencil } from 'lucide-react';
import { generatePath, Link } from 'react-router';
import { MenuAcciones, type AccionMenu } from '../../../components/ui/menu_acciones';
import { RUTAS } from '../../../constants/rutas';
import { formatearFechaHora } from '../../../utils/formato_fecha';
import type { ListaChequeo } from '../types/lista_chequeo.types';
import { separarPorActividad } from '../utils/listas_chequeo';
import { InsigniaEstadoLista } from './insignia_estado_lista';

interface PropiedadesTablaListasChequeo {
  listas: ListaChequeo[];
  alEditar: (lista: ListaChequeo) => void;
  alCambiarEstado: (lista: ListaChequeo) => void;
}

function acciones(lista: ListaChequeo, { alEditar, alCambiarEstado }: Omit<PropiedadesTablaListasChequeo, 'listas'>): AccionMenu[] {
  return [
    { etiqueta: 'Editar preguntas y opciones', icono: Pencil, alSeleccionar: () => alEditar(lista) },
    lista.activa
      ? { etiqueta: 'Desactivar', icono: CircleSlash, alSeleccionar: () => alCambiarEstado(lista) }
      : { etiqueta: 'Activar', icono: CircleCheck, alSeleccionar: () => alCambiarEstado(lista) },
  ];
}

function Identidad({ lista }: { lista: ListaChequeo }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span
        aria-hidden
        className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${
          lista.activa ? 'bg-exito/10 text-exito' : 'bg-primario/8 text-primario'
        }`}
      >
        <ListChecks strokeWidth={1.75} className="size-[18px]" />
      </span>
      <div className="min-w-0">
        <Link
          to={generatePath(RUTAS.detalleListaChequeo, { id: lista.id })}
          className="block truncate rounded text-sm font-semibold text-texto hover:text-primario focus-visible:ring-2 focus-visible:ring-primario/40 focus-visible:outline-none"
        >
          {lista.nombre}
        </Link>
        {lista.descripcion && <p className="truncate text-[13px] text-texto-secundario">{lista.descripcion}</p>}
      </div>
    </div>
  );
}

function Contenido({ lista }: { lista: ListaChequeo }) {
  const preguntas = separarPorActividad(lista.items).activos.length;
  const opciones = separarPorActividad(lista.estados).activos;
  return (
    <div className="min-w-0 text-[13px]">
      <p className="text-texto">
        {preguntas} {preguntas === 1 ? 'pregunta' : 'preguntas'}
      </p>
      <p className="truncate text-texto-secundario">{opciones.map((opcion) => opcion.nombre).join(' · ')}</p>
    </div>
  );
}

export function TablaListasChequeo({ listas, ...manejadores }: PropiedadesTablaListasChequeo) {
  return (
    <>
      <table className="hidden w-full table-fixed text-left md:table">
        <thead>
          <tr className="border-b border-borde/80 text-xs font-medium tracking-wide text-texto-secundario uppercase">
            <th scope="col" className="py-3 pr-4 pl-5 font-medium">Lista</th>
            <th scope="col" className="w-[28%] px-4 py-3 font-medium">Contenido</th>
            <th scope="col" className="w-32 px-4 py-3 font-medium">Estado</th>
            <th scope="col" className="hidden w-48 px-4 py-3 font-medium lg:table-cell">Última edición</th>
            <th scope="col" className="w-14 py-3 pr-5 pl-2">
              <span className="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-borde/60">
          {listas.map((lista) => (
            <tr key={lista.id} className="transition-colors duration-150 hover:bg-white/50">
              <td className="py-3 pr-4 pl-5">
                <Identidad lista={lista} />
              </td>
              <td className="px-4 py-3">
                <Contenido lista={lista} />
              </td>
              <td className="px-4 py-3">
                <InsigniaEstadoLista activa={lista.activa} />
              </td>
              <td className="hidden px-4 py-3 text-[13px] whitespace-nowrap text-texto-secundario lg:table-cell">
                {formatearFechaHora(lista.actualizadaEn ?? lista.creadaEn)}
              </td>
              <td className="py-3 pr-5 pl-2 text-right">
                <MenuAcciones etiqueta={`Acciones para ${lista.nombre}`} acciones={acciones(lista, manejadores)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="divide-y divide-borde/60 md:hidden">
        {listas.map((lista) => (
          <li key={lista.id} className="flex gap-3 px-4 py-4">
            <div className="min-w-0 flex-1 space-y-2.5">
              <Identidad lista={lista} />
              <div className="flex flex-wrap items-center gap-3 pl-12">
                <InsigniaEstadoLista activa={lista.activa} />
                <Contenido lista={lista} />
              </div>
            </div>
            <MenuAcciones etiqueta={`Acciones para ${lista.nombre}`} acciones={acciones(lista, manejadores)} />
          </li>
        ))}
      </ul>
    </>
  );
}
