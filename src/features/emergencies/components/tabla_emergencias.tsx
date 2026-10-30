import { Ban, Copy, Eye, MapPin, Pencil, Timer } from 'lucide-react';
import { generatePath, Link } from 'react-router';
import { MenuAcciones, type AccionMenu } from '../../../components/ui/menu_acciones';
import { RUTAS } from '../../../constants/rutas';
import { formatearFechaHora } from '../../../utils/formato_fecha';
import { esActiva, ETIQUETAS_TIPO_INCIDENTE } from '../constants/catalogos_emergencia';
import { ESTILO_SIN_PRIORIDAD, ESTILOS_PRIORIDAD } from '../constants/estilos_emergencia';
import type { Emergencia } from '../types/emergencia.types';
import { tiempoTranscurrido } from '../../../utils/tiempo_transcurrido';
import { InsigniaEstadoEmergencia, InsigniaPrioridad } from './insignias_emergencia';

export interface AccionesEmergencia {
  alVerDetalle: (emergencia: Emergencia) => void;
  alEditar: (emergencia: Emergencia) => void;
  alCancelar: (emergencia: Emergencia) => void;
}

interface PropiedadesTablaEmergencias extends AccionesEmergencia {
  emergencias: Emergencia[];
  /** En el tablero se muestra el tiempo transcurrido; en el historial, la fecha. */
  mostrarTranscurrido: boolean;
  ahora: number;
}

function construirAccionesEmergencia(
  emergencia: Emergencia,
  { alVerDetalle, alEditar, alCancelar }: AccionesEmergencia,
): AccionMenu[] {
  const acciones: AccionMenu[] = [
    { etiqueta: 'Ver detalle', icono: Eye, alSeleccionar: () => alVerDetalle(emergencia) },
  ];
  if (esActiva(emergencia.estado)) {
    acciones.push({ etiqueta: 'Corregir datos', icono: Pencil, alSeleccionar: () => alEditar(emergencia) });
  }
  if (emergencia.estado === 'recibida') {
    acciones.push({
      etiqueta: 'Cancelar emergencia',
      icono: Ban,
      tono: 'peligro',
      alSeleccionar: () => alCancelar(emergencia),
    });
  }
  return acciones;
}

function rutaDetalle(emergencia: Emergencia): string {
  return generatePath(RUTAS.detalleEmergencia, { id: emergencia.id });
}

function IdentidadEmergencia({ emergencia }: { emergencia: Emergencia }) {
  return (
    <div className="min-w-0">
      <p className="flex items-center gap-2">
        <Link
          to={rutaDetalle(emergencia)}
          className="truncate rounded text-sm font-semibold text-texto tabular-nums hover:text-primario focus-visible:ring-2 focus-visible:ring-primario/40 focus-visible:outline-none"
        >
          {emergencia.numeroEmergencia}
        </Link>
        {emergencia.emergenciaPrincipalId && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-texto-secundario/10 px-1.5 py-0.5 text-[11px] font-medium text-texto-secundario">
            <Copy aria-hidden strokeWidth={2} className="size-3" />
            Duplicada
          </span>
        )}
      </p>
      <p className="mt-0.5 truncate text-[13px] text-texto-secundario">{emergencia.descripcion}</p>
    </div>
  );
}

function Lugar({ emergencia }: { emergencia: Emergencia }) {
  if (emergencia.direccion) return <span className="truncate">{emergencia.direccion}</span>;
  return (
    <span className="inline-flex items-center gap-1.5 text-texto-secundario">
      <MapPin aria-hidden strokeWidth={1.75} className="size-3.5" />
      Solo coordenadas
    </span>
  );
}

function Tiempo({ emergencia, mostrarTranscurrido, ahora }: { emergencia: Emergencia; mostrarTranscurrido: boolean; ahora: number }) {
  const fecha = formatearFechaHora(emergencia.recibidaEn);
  if (!mostrarTranscurrido) return <time dateTime={emergencia.recibidaEn}>{fecha}</time>;
  return (
    <time dateTime={emergencia.recibidaEn} title={`Recibida el ${fecha}`} className="inline-flex items-center gap-1.5 tabular-nums">
      <Timer aria-hidden strokeWidth={1.75} className="size-3.5" />
      <span className="sr-only">Hace </span>
      {tiempoTranscurrido(emergencia.recibidaEn, ahora)}
    </time>
  );
}

function claseFila(emergencia: Emergencia): string {
  return emergencia.prioridad === 'roja' && esActiva(emergencia.estado)
    ? 'bg-critico/[0.035] hover:bg-critico/6'
    : 'hover:bg-white/50';
}

export function TablaEmergencias({ emergencias, mostrarTranscurrido, ahora, ...acciones }: PropiedadesTablaEmergencias) {
  return (
    <>
      <table className="hidden w-full table-fixed text-left md:table">
        <thead>
          <tr className="border-b border-borde/80 text-xs font-medium tracking-wide text-texto-secundario uppercase">
            <th scope="col" className="py-3 pr-4 pl-5 font-medium">Emergencia</th>
            <th scope="col" className="w-36 px-4 py-3 font-medium">Prioridad</th>
            <th scope="col" className="hidden w-44 px-4 py-3 font-medium xl:table-cell">Tipo</th>
            <th scope="col" className="hidden w-[22%] px-4 py-3 font-medium lg:table-cell">Lugar</th>
            <th scope="col" className={`${mostrarTranscurrido ? 'w-28' : 'w-44'} px-4 py-3 font-medium`}>
              {mostrarTranscurrido ? 'Tiempo' : 'Recibida'}
            </th>
            <th scope="col" className="w-36 px-4 py-3 font-medium">Estado</th>
            <th scope="col" className="w-14 py-3 pr-5 pl-2">
              <span className="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-borde/60">
          {emergencias.map((emergencia) => {
            const { franja } = emergencia.prioridad ? ESTILOS_PRIORIDAD[emergencia.prioridad] : ESTILO_SIN_PRIORIDAD;
            return (
              <tr key={emergencia.id} className={`transition-colors duration-150 ${claseFila(emergencia)}`}>
                <td className="relative py-3 pr-4 pl-5">
                  <span aria-hidden className={`absolute inset-y-2 left-1.5 w-1 rounded-full ${franja}`} />
                  <IdentidadEmergencia emergencia={emergencia} />
                </td>
                <td className="px-4 py-3">
                  <InsigniaPrioridad prioridad={emergencia.prioridad} />
                </td>
                <td className="hidden truncate px-4 py-3 text-sm text-texto xl:table-cell">
                  {emergencia.tipoIncidente ? ETIQUETAS_TIPO_INCIDENTE[emergencia.tipoIncidente] : (
                    <span className="text-texto-secundario">Sin tipo</span>
                  )}
                </td>
                <td className="hidden px-4 py-3 text-sm text-texto lg:table-cell">
                  <div className="flex min-w-0">
                    <Lugar emergencia={emergencia} />
                  </div>
                </td>
                <td className="px-4 py-3 text-[13px] whitespace-nowrap text-texto-secundario">
                  <Tiempo emergencia={emergencia} mostrarTranscurrido={mostrarTranscurrido} ahora={ahora} />
                </td>
                <td className="px-4 py-3">
                  <InsigniaEstadoEmergencia estado={emergencia.estado} />
                </td>
                <td className="py-3 pr-5 pl-2 text-right">
                  <MenuAcciones
                    etiqueta={`Acciones para ${emergencia.numeroEmergencia}`}
                    acciones={construirAccionesEmergencia(emergencia, acciones)}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <ul className="divide-y divide-borde/60 md:hidden">
        {emergencias.map((emergencia) => {
          const { franja } = emergencia.prioridad ? ESTILOS_PRIORIDAD[emergencia.prioridad] : ESTILO_SIN_PRIORIDAD;
          return (
            <li key={emergencia.id} className={`relative flex gap-3 py-4 pr-4 pl-5 ${claseFila(emergencia)}`}>
              <span aria-hidden className={`absolute inset-y-3 left-1.5 w-1 rounded-full ${franja}`} />
              <div className="min-w-0 flex-1 space-y-2.5">
                <IdentidadEmergencia emergencia={emergencia} />
                <div className="flex flex-wrap items-center gap-2">
                  <InsigniaPrioridad prioridad={emergencia.prioridad} />
                  <InsigniaEstadoEmergencia estado={emergencia.estado} />
                </div>
                <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-texto-secundario">
                  <Tiempo emergencia={emergencia} mostrarTranscurrido={mostrarTranscurrido} ahora={ahora} />
                  <span className="flex min-w-0 max-w-full">
                    <Lugar emergencia={emergencia} />
                  </span>
                </p>
              </div>
              <MenuAcciones
                etiqueta={`Acciones para ${emergencia.numeroEmergencia}`}
                acciones={construirAccionesEmergencia(emergencia, acciones)}
              />
            </li>
          );
        })}
      </ul>
    </>
  );
}
