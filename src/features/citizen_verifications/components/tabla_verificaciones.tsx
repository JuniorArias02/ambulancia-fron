import { ChevronRight } from 'lucide-react';
import { generatePath, Link, useNavigate } from 'react-router';
import { RUTAS } from '../../../constants/rutas';
import { useAhora } from '../../../hooks/use_ahora';
import { formatearFechaHora } from '../../../utils/formato_fecha';
import { obtenerIniciales } from '../../../utils/iniciales';
import { haceTiempo } from '../../../utils/tiempo_transcurrido';
import type { VerificacionResumen } from '../types/verificacion.types';
import { agruparNumeroDocumento } from '../utils/formato_verificacion';
import { InsigniaEstadoVerificacion } from './insignia_estado_verificacion';

const INTERVALO_RELOJ_MS = 60_000;

function rutaDetalle(verificacion: VerificacionResumen): string {
  return generatePath(RUTAS.detalleVerificacion, { usuarioId: verificacion.usuarioId });
}

function Ciudadano({ verificacion }: { verificacion: VerificacionResumen }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span
        aria-hidden
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-cian/12 text-[13px] font-semibold text-cian-texto"
      >
        {obtenerIniciales(verificacion.nombres, verificacion.apellidos)}
      </span>
      <Link
        to={rutaDetalle(verificacion)}
        // La fila entera abre el detalle; el enlace da acceso con teclado.
        onClick={(evento) => evento.stopPropagation()}
        className="truncate rounded text-sm font-medium text-texto hover:text-primario focus-visible:ring-2 focus-visible:ring-primario/40 focus-visible:outline-none"
      >
        {verificacion.nombres} {verificacion.apellidos}
      </Link>
    </div>
  );
}

function Documento({ verificacion }: { verificacion: VerificacionResumen }) {
  return (
    <span className="font-mono text-[13px] whitespace-nowrap text-texto">
      <span className="font-sans font-semibold text-texto-secundario">{verificacion.tipoDocumento}</span>{' '}
      {agruparNumeroDocumento(verificacion.numeroDocumento)}
    </span>
  );
}

/** En la fila importa cuánto lleva esperando; en las cerradas, cuándo se revisó. */
function Espera({ verificacion, ahora }: { verificacion: VerificacionResumen; ahora: number }) {
  const enEspera = verificacion.estado === 'pendiente' || verificacion.estado === 'en_revision';
  const fecha = enEspera ? verificacion.enviadaEn : (verificacion.revisadaEn ?? verificacion.enviadaEn);
  return (
    <time dateTime={fecha} title={formatearFechaHora(fecha)} className="text-[13px] whitespace-nowrap">
      {enEspera ? (
        <span className="font-medium text-texto">{haceTiempo(fecha, ahora)}</span>
      ) : (
        <span className="text-texto-secundario">Revisada {haceTiempo(fecha, ahora)}</span>
      )}
    </time>
  );
}

export function TablaVerificaciones({ verificaciones }: { verificaciones: VerificacionResumen[] }) {
  const navegar = useNavigate();
  const ahora = useAhora(INTERVALO_RELOJ_MS);

  return (
    <>
      <table className="hidden w-full text-left md:table">
        <thead>
          <tr className="border-b border-borde/80 text-xs font-medium tracking-wide text-texto-secundario uppercase">
            <th scope="col" className="py-3 pr-4 pl-5 font-medium">Ciudadano</th>
            <th scope="col" className="px-4 py-3 font-medium">Documento</th>
            <th scope="col" className="hidden px-4 py-3 font-medium lg:table-cell">Correo</th>
            <th scope="col" className="hidden px-4 py-3 font-medium xl:table-cell">Teléfono</th>
            <th scope="col" className="px-4 py-3 font-medium">Estado</th>
            <th scope="col" className="px-4 py-3 font-medium">Esperando desde</th>
            <th scope="col" className="w-10 py-3 pr-5 pl-2">
              <span className="sr-only">Abrir</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-borde/60">
          {verificaciones.map((verificacion) => (
            <tr
              key={verificacion.usuarioId}
              onClick={() => void navegar(rutaDetalle(verificacion))}
              className="cursor-pointer transition-colors duration-150 hover:bg-white/50"
            >
              <td className="max-w-72 py-3 pr-4 pl-5">
                <Ciudadano verificacion={verificacion} />
              </td>
              <td className="px-4 py-3">
                <Documento verificacion={verificacion} />
              </td>
              <td className="hidden max-w-64 truncate px-4 py-3 text-[13px] text-texto-secundario lg:table-cell">
                {verificacion.correo}
              </td>
              <td className="hidden px-4 py-3 text-[13px] whitespace-nowrap text-texto-secundario xl:table-cell">
                {verificacion.telefono}
              </td>
              <td className="px-4 py-3">
                <InsigniaEstadoVerificacion estado={verificacion.estado} />
              </td>
              <td className="px-4 py-3">
                <Espera verificacion={verificacion} ahora={ahora} />
              </td>
              <td className="py-3 pr-5 pl-2 text-right">
                <ChevronRight aria-hidden strokeWidth={1.75} className="ml-auto size-4 text-texto-secundario" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="divide-y divide-borde/60 md:hidden">
        {verificaciones.map((verificacion) => (
          <li
            key={verificacion.usuarioId}
            onClick={() => void navegar(rutaDetalle(verificacion))}
            className="flex cursor-pointer items-center gap-3 px-4 py-4"
          >
            <div className="min-w-0 flex-1 space-y-2">
              <Ciudadano verificacion={verificacion} />
              <div className="space-y-1.5 pl-12">
                <Documento verificacion={verificacion} />
                <div className="flex flex-wrap items-center gap-2">
                  <InsigniaEstadoVerificacion estado={verificacion.estado} />
                  <Espera verificacion={verificacion} ahora={ahora} />
                </div>
              </div>
            </div>
            <ChevronRight aria-hidden strokeWidth={1.75} className="size-4 shrink-0 text-texto-secundario" />
          </li>
        ))}
      </ul>
    </>
  );
}
