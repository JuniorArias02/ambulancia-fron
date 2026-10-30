import { Ambulance, ArrowLeftRight, Eye, Pencil } from 'lucide-react';
import { generatePath, Link } from 'react-router';
import { MenuAcciones, type AccionMenu } from '../../../components/ui/menu_acciones';
import { RUTAS } from '../../../constants/rutas';
import { formatearFechaHora } from '../../../utils/formato_fecha';
import type { Ambulancia } from '../types/ambulancia.types';
import { InsigniaEstadoOperativo } from './insignia_estado_operativo';
import { PlacaAmbulancia } from './placa_ambulancia';

export interface AccionesAmbulancia {
  alVerDetalle: (ambulancia: Ambulancia) => void;
  /** Sin valor, el rol no puede cambiar el estado. */
  alCambiarEstado?: (ambulancia: Ambulancia) => void;
  /** Sin valor, el rol no puede editar. */
  alEditar?: (ambulancia: Ambulancia) => void;
}

interface PropiedadesTablaAmbulancias extends AccionesAmbulancia {
  ambulancias: Ambulancia[];
}

function construirAcciones(
  ambulancia: Ambulancia,
  { alVerDetalle, alCambiarEstado, alEditar }: AccionesAmbulancia,
): AccionMenu[] {
  const acciones: AccionMenu[] = [
    { etiqueta: 'Ver detalle', icono: Eye, alSeleccionar: () => alVerDetalle(ambulancia) },
  ];
  // Mientras está en servicio, el estado y los datos los controla el despacho.
  if (ambulancia.estadoOperativo === 'en_servicio') return acciones;

  if (alCambiarEstado) {
    acciones.push({
      etiqueta: 'Cambiar estado',
      icono: ArrowLeftRight,
      alSeleccionar: () => alCambiarEstado(ambulancia),
    });
  }
  if (alEditar) {
    acciones.push({ etiqueta: 'Editar datos', icono: Pencil, alSeleccionar: () => alEditar(ambulancia) });
  }
  return acciones;
}

function IdentidadAmbulancia({ ambulancia }: { ambulancia: Ambulancia }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span
        aria-hidden
        className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primario/8 text-primario"
      >
        <Ambulance strokeWidth={1.75} className="size-[18px]" />
      </span>
      <Link
        to={generatePath(RUTAS.detalleAmbulancia, { id: ambulancia.id })}
        className="truncate rounded text-sm font-semibold text-texto hover:text-primario focus-visible:ring-2 focus-visible:ring-primario/40 focus-visible:outline-none"
      >
        {ambulancia.codigo}
      </Link>
    </div>
  );
}

function TipoAmbulanciaCelda({ ambulancia }: { ambulancia: Ambulancia }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className="inline-flex shrink-0 items-center rounded-lg bg-primario/8 px-2 py-0.5 text-xs font-semibold text-primario">
        {ambulancia.tipo.nombre}
      </span>
      {ambulancia.tipo.descripcion && (
        <span className="hidden truncate text-[13px] text-texto-secundario lg:inline">
          {ambulancia.tipo.descripcion}
        </span>
      )}
    </div>
  );
}

export function TablaAmbulancias({ ambulancias, ...acciones }: PropiedadesTablaAmbulancias) {
  return (
    <>
      <table className="hidden w-full table-fixed text-left md:table">
        <thead>
          <tr className="border-b border-borde/80 text-xs font-medium tracking-wide text-texto-secundario uppercase">
            <th scope="col" className="w-[24%] py-3 pr-4 pl-5 font-medium">Código</th>
            <th scope="col" className="w-[15%] px-4 py-3 font-medium">Placa</th>
            <th scope="col" className="px-4 py-3 font-medium">Tipo</th>
            <th scope="col" className="w-44 px-4 py-3 font-medium">Estado</th>
            <th scope="col" className="hidden w-44 px-4 py-3 font-medium xl:table-cell">Registrada</th>
            <th scope="col" className="w-14 py-3 pr-5 pl-2">
              <span className="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-borde/60">
          {ambulancias.map((ambulancia) => (
            <tr key={ambulancia.id} className="transition-colors duration-150 hover:bg-white/50">
              <td className="py-3 pr-4 pl-5">
                <IdentidadAmbulancia ambulancia={ambulancia} />
              </td>
              <td className="px-4 py-3">
                <PlacaAmbulancia placa={ambulancia.placa} />
              </td>
              <td className="px-4 py-3">
                <TipoAmbulanciaCelda ambulancia={ambulancia} />
              </td>
              <td className="px-4 py-3">
                <InsigniaEstadoOperativo estado={ambulancia.estadoOperativo} />
              </td>
              <td className="hidden px-4 py-3 text-[13px] whitespace-nowrap text-texto-secundario xl:table-cell">
                {formatearFechaHora(ambulancia.creadaEn)}
              </td>
              <td className="py-3 pr-5 pl-2 text-right">
                <MenuAcciones
                  etiqueta={`Acciones para ${ambulancia.codigo}`}
                  acciones={construirAcciones(ambulancia, acciones)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="divide-y divide-borde/60 md:hidden">
        {ambulancias.map((ambulancia) => (
          <li key={ambulancia.id} className="flex gap-3 px-4 py-4">
            <div className="min-w-0 flex-1 space-y-2.5">
              <IdentidadAmbulancia ambulancia={ambulancia} />
              <div className="flex flex-wrap items-center gap-2 pl-12">
                <PlacaAmbulancia placa={ambulancia.placa} />
                <TipoAmbulanciaCelda ambulancia={ambulancia} />
              </div>
              <div className="pl-12">
                <InsigniaEstadoOperativo estado={ambulancia.estadoOperativo} />
              </div>
            </div>
            <MenuAcciones
              etiqueta={`Acciones para ${ambulancia.codigo}`}
              acciones={construirAcciones(ambulancia, acciones)}
            />
          </li>
        ))}
      </ul>
    </>
  );
}
