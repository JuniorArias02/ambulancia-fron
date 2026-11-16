import { useMemo } from 'react';
import { CircleMarker, Polyline, Tooltip } from 'react-leaflet';
import { EncuadrarPuntos } from '../../map/components/encuadrar_puntos';
import { MapaCompacto } from '../../map/components/mapa_compacto';
import type { PuntoMapa } from '../../map/utils/coordenadas';
import { ETIQUETAS_ESTADO_ASIGNACION } from '../constants/catalogos_clinicos';
import type { AsignacionIngreso } from '../types/historia_clinica.types';
import { formatearHora } from '../utils/formato_clinico';

interface PropiedadesMapaRecorrido {
  asignacion: AsignacionIngreso;
  escena: PuntoMapa | null;
  destino: PuntoMapa | null;
}

const COLOR_RECORRIDO = '#2563EB';
const COLOR_ESCENA = '#DC2626';
const COLOR_DESTINO = '#16A34A';
const COLOR_EVENTO = '#101B2D';

/** Recorrido GPS histórico: una sola polilínea (ya llega limitada por el backend). */
export function MapaRecorrido({ asignacion, escena, destino }: PropiedadesMapaRecorrido) {
  const recorrido = useMemo<[number, number][]>(
    () => asignacion.recorrido.puntos.map(({ latitud, longitud }) => [latitud, longitud]),
    [asignacion.recorrido.puntos],
  );
  const eventos = asignacion.eventos.filter(
    (evento): evento is typeof evento & { latitud: number; longitud: number } => evento.latitud !== null && evento.longitud !== null,
  );
  const encuadre = useMemo<PuntoMapa[]>(
    () => [
      ...asignacion.recorrido.puntos,
      ...eventos,
      ...(escena ? [escena] : []),
      ...(destino ? [destino] : []),
    ],
    [asignacion.recorrido.puntos, eventos, escena, destino],
  );

  return (
    <div className="space-y-2">
      <div className="h-72 overflow-hidden rounded-2xl border border-borde/70 sm:h-80">
        <MapaCompacto centro={escena} etiqueta={`Recorrido de la ambulancia ${asignacion.ambulancia.codigo}`}>
          {recorrido.length > 1 && (
            <>
              <Polyline positions={recorrido} interactive={false} pathOptions={{ color: '#FFFFFF', weight: 7, opacity: 0.9 }} />
              <Polyline positions={recorrido} pathOptions={{ color: COLOR_RECORRIDO, weight: 4, opacity: 0.9, lineCap: 'round', lineJoin: 'round' }} />
            </>
          )}
          {eventos.map((evento) => (
            <CircleMarker
              key={`${evento.estadoNuevo}-${evento.ocurridoEn}`}
              center={[evento.latitud, evento.longitud]}
              radius={5}
              pathOptions={{ color: '#FFFFFF', weight: 2, fillColor: COLOR_EVENTO, fillOpacity: 1 }}
            >
              <Tooltip className="tooltip-vidrio">
                {ETIQUETAS_ESTADO_ASIGNACION[evento.estadoNuevo] ?? evento.estadoNuevo} · {formatearHora(evento.ocurridoEn, true)}
              </Tooltip>
            </CircleMarker>
          ))}
          {escena && (
            <CircleMarker center={[escena.latitud, escena.longitud]} radius={8} pathOptions={{ color: '#FFFFFF', weight: 3, fillColor: COLOR_ESCENA, fillOpacity: 1 }}>
              <Tooltip className="tooltip-vidrio">Escena</Tooltip>
            </CircleMarker>
          )}
          {destino && (
            <CircleMarker center={[destino.latitud, destino.longitud]} radius={8} pathOptions={{ color: '#FFFFFF', weight: 3, fillColor: COLOR_DESTINO, fillOpacity: 1 }}>
              <Tooltip className="tooltip-vidrio">Destino: {asignacion.institucionDestino?.nombre}</Tooltip>
            </CircleMarker>
          )}
          <EncuadrarPuntos puntos={encuadre} />
        </MapaCompacto>
      </div>
      <ul aria-label="Convenciones del mapa" className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-texto-secundario">
        <li className="flex items-center gap-1.5">
          <span aria-hidden className="h-1 w-4 rounded-full" style={{ backgroundColor: COLOR_RECORRIDO }} />
          Recorrido
        </li>
        <li className="flex items-center gap-1.5">
          <span aria-hidden className="size-2.5 rounded-full" style={{ backgroundColor: COLOR_ESCENA }} />
          Escena
        </li>
        <li className="flex items-center gap-1.5">
          <span aria-hidden className="size-2 rounded-full" style={{ backgroundColor: COLOR_EVENTO }} />
          Cambio de estado
        </li>
        {destino && (
          <li className="flex items-center gap-1.5">
            <span aria-hidden className="size-2.5 rounded-full" style={{ backgroundColor: COLOR_DESTINO }} />
            Destino
          </li>
        )}
      </ul>
      {asignacion.recorrido.puntos.length === 0 ? (
        <p className="text-[13px] text-texto-secundario">Sin recorrido GPS registrado.</p>
      ) : (
        asignacion.recorrido.muestreado && (
          <p className="text-[13px] text-texto-secundario">
            Recorrido simplificado: {asignacion.recorrido.puntos.length.toLocaleString('es-CO')} de{' '}
            {asignacion.recorrido.totalPuntos.toLocaleString('es-CO')} puntos.
          </p>
        )
      )}
    </div>
  );
}
