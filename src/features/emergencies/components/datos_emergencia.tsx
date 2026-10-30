import {
  CalendarClock,
  CircleSlash,
  Phone,
  Radio,
  Tag,
  UserRound,
  UsersRound,
  type LucideIcon,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { formatearFechaHora } from '../../../utils/formato_fecha';
import { ETIQUETAS_FUENTE, ETIQUETAS_TIPO_INCIDENTE } from '../constants/catalogos_emergencia';
import type { Emergencia } from '../types/emergencia.types';

function Dato({ icono: Icono, etiqueta, children }: { icono: LucideIcon; etiqueta: string; children: ReactNode }) {
  return (
    <div className="flex gap-3 py-3">
      <Icono aria-hidden strokeWidth={1.75} className="mt-0.5 size-4 shrink-0 text-texto-secundario" />
      <div className="min-w-0 flex-1">
        <dt className="text-[13px] text-texto-secundario">{etiqueta}</dt>
        <dd className="mt-0.5 text-sm break-words text-texto">{children}</dd>
      </div>
    </div>
  );
}

function SinDato({ children = 'Sin dato' }: { children?: ReactNode }) {
  return <span className="text-texto-secundario">{children}</span>;
}

export function DatosEmergencia({ emergencia }: { emergencia: Emergencia }) {
  return (
    <div className="px-5 pb-2">
      <p className="border-b border-borde/60 py-4 text-[15px] leading-relaxed whitespace-pre-line text-texto">
        {emergencia.descripcion}
      </p>
      <dl className="grid divide-borde/60 sm:grid-cols-2 sm:gap-x-6">
        <Dato icono={Tag} etiqueta="Tipo de incidente">
          {emergencia.tipoIncidente ? ETIQUETAS_TIPO_INCIDENTE[emergencia.tipoIncidente] : <SinDato>Sin definir</SinDato>}
        </Dato>
        <Dato icono={UsersRound} etiqueta="Víctimas">
          {emergencia.numeroVictimas ?? <SinDato>No reportado</SinDato>}
        </Dato>
        <Dato icono={Radio} etiqueta="Fuente">
          {ETIQUETAS_FUENTE[emergencia.fuente]}
        </Dato>
        <Dato icono={UserRound} etiqueta="Informante">
          {emergencia.informanteNombre ?? <SinDato />}
        </Dato>
        <Dato icono={Phone} etiqueta="Teléfono del informante">
          {emergencia.informanteTelefono ? (
            <a
              href={`tel:${emergencia.informanteTelefono.replace(/[\s-]/g, '')}`}
              className="font-medium text-primario tabular-nums hover:underline"
            >
              {emergencia.informanteTelefono}
            </a>
          ) : (
            <SinDato />
          )}
        </Dato>
        <Dato icono={CalendarClock} etiqueta="Recibida">
          <time dateTime={emergencia.recibidaEn}>{formatearFechaHora(emergencia.recibidaEn)}</time>
          {emergencia.recibidaPor?.nombreCompleto && (
            <span className="block text-[13px] text-texto-secundario">por {emergencia.recibidaPor.nombreCompleto}</span>
          )}
        </Dato>
        {emergencia.cerradaEn && (
          <Dato icono={CircleSlash} etiqueta={emergencia.estado === 'cancelada' ? 'Cancelada' : 'Cerrada'}>
            <time dateTime={emergencia.cerradaEn}>{formatearFechaHora(emergencia.cerradaEn)}</time>
          </Dato>
        )}
      </dl>
    </div>
  );
}
