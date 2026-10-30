import { CalendarClock, Hash, MapPin, MapPinOff, RectangleHorizontal, Tag, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { formatearFechaHora } from '../../../utils/formato_fecha';
import type { Ambulancia, UbicacionAmbulancia } from '../types/ambulancia.types';
import { PlacaAmbulancia } from './placa_ambulancia';

const formatoCoordenada = new Intl.NumberFormat('es-CO', {
  minimumFractionDigits: 5,
  maximumFractionDigits: 5,
});

function Dato({ icono: Icono, etiqueta, children }: { icono: LucideIcon; etiqueta: string; children: ReactNode }) {
  return (
    <div className="flex gap-3 py-3.5">
      <Icono aria-hidden strokeWidth={1.75} className="mt-0.5 size-4 shrink-0 text-texto-secundario" />
      <div className="min-w-0 flex-1">
        <dt className="text-[13px] text-texto-secundario">{etiqueta}</dt>
        <dd className="mt-1 text-sm text-texto">{children}</dd>
      </div>
    </div>
  );
}

/** Se presenta como la última posición conocida, nunca como la ubicación actual. */
function UltimaUbicacion({ ubicacion }: { ubicacion: UbicacionAmbulancia | null }) {
  if (!ubicacion) {
    return (
      <span className="flex items-start gap-1.5 text-texto-secundario">
        <MapPinOff aria-hidden strokeWidth={1.75} className="mt-0.5 size-3.5 shrink-0" />
        La ambulancia aún no ha reportado su posición.
      </span>
    );
  }
  return (
    <>
      <span className="tabular-nums">
        {formatoCoordenada.format(ubicacion.latitud)}, {formatoCoordenada.format(ubicacion.longitud)}
      </span>
      <span className="mt-0.5 block text-[13px] text-texto-secundario">
        Reportada el <time dateTime={ubicacion.registradaEn}>{formatearFechaHora(ubicacion.registradaEn)}</time>
      </span>
    </>
  );
}

export function DatosAmbulancia({ ambulancia }: { ambulancia: Ambulancia }) {
  return (
    <dl className="divide-y divide-borde/60 px-5">
      <Dato icono={Hash} etiqueta="Código interno">
        <span className="font-semibold">{ambulancia.codigo}</span>
      </Dato>
      <Dato icono={RectangleHorizontal} etiqueta="Placa">
        <PlacaAmbulancia placa={ambulancia.placa} />
      </Dato>
      <Dato icono={Tag} etiqueta="Tipo">
        <span className="font-medium">{ambulancia.tipo.nombre}</span>
        {ambulancia.tipo.descripcion && (
          <span className="block text-[13px] text-texto-secundario">{ambulancia.tipo.descripcion}</span>
        )}
      </Dato>
      <Dato icono={MapPin} etiqueta="Última ubicación conocida">
        <UltimaUbicacion ubicacion={ambulancia.ultimaUbicacion} />
      </Dato>
      <Dato icono={CalendarClock} etiqueta="Registrada">
        <time dateTime={ambulancia.creadaEn}>{formatearFechaHora(ambulancia.creadaEn)}</time>
      </Dato>
    </dl>
  );
}
