import { LoaderCircle, Route } from 'lucide-react';
import { useMemo } from 'react';
import { CircleMarker, Polyline } from 'react-leaflet';
import { useAhora } from '../../../hooks/use_ahora';
import { formatearFechaHora } from '../../../utils/formato_fecha';
import { MarcadorAmbulanciaMapa } from '../../ambulances/components/marcador_ambulancia_mapa';
import { useAmbulancia } from '../../ambulances/hooks/use_ambulancias';
import { senalUbicacion, textoSenal } from '../../ambulances/utils/senal_ubicacion';
import { EncuadrarPuntos } from '../../map/components/encuadrar_puntos';
import { MapaCompacto } from '../../map/components/mapa_compacto';
import { TrazoRuta } from '../../map/components/trazo_ruta';
import type { PuntoMapa } from '../../map/utils/coordenadas';
import { ajustarAlTrazo } from '../../map/utils/geometria_trazo';
import { esAsignacionActiva } from '../constants/asignaciones';
import { useRecorrido, useRutaAsignacion } from '../hooks/use_asignaciones';
import type { Asignacion } from '../types/asignacion.types';
import { resumenRuta, tieneRuta, trazoDeRuta } from '../utils/formato_ruta';

interface PropiedadesRecorridoAsignacion {
  asignacion: Asignacion;
  destino: PuntoMapa | null;
  colorDestino: string;
}

/**
 * Mapa del servicio. Mientras va hacia la emergencia se dibuja la ruta por calles que calcula
 * el backend, con el tramo recorrido atenuado y la ambulancia moviéndose sobre ella en vivo.
 * Después (en la escena o al terminar) no hay ruta: se muestra el recorrido GPS reportado.
 */
export function RecorridoAsignacion({ asignacion, destino, colorDestino }: PropiedadesRecorridoAsignacion) {
  const ahora = useAhora();
  const activa = esAsignacionActiva(asignacion.estado);
  const conRuta = tieneRuta(asignacion);
  const ruta = useRutaAsignacion(asignacion.id, conRuta);
  const rutaDisponible = conRuta ? (ruta.data ?? null) : null;
  // El recorrido GPS solo se pide cuando no hay ruta por calles que mostrar.
  const recorrido = useRecorrido(asignacion.id, activa, !rutaDisponible && !(conRuta && ruta.isPending));
  const ambulancia = useAmbulancia(asignacion.ambulanciaId, undefined, { enVivo: activa });

  const trazo = useMemo(() => (rutaDisponible ? trazoDeRuta(rutaDisponible) : null), [rutaDisponible]);
  const puntosGps = useMemo(
    () => (rutaDisponible ? [] : (recorrido.data ?? []).map(({ latitud, longitud }) => ({ latitud, longitud }))),
    [rutaDisponible, recorrido.data],
  );
  const ubicacion = ambulancia.data?.ultimaUbicacion ?? null;
  const ajuste = trazo && ubicacion ? ajustarAlTrazo(ubicacion, trazo) : null;
  const senal = senalUbicacion(ubicacion, ahora);

  // Se encuadra con puntos estables (extremos y destino) para no mover la vista con cada lectura GPS.
  const encuadre = [trazo?.[0], trazo?.at(-1), puntosGps[0], destino].filter((punto): punto is PuntoMapa => Boolean(punto));

  if ((conRuta && ruta.isPending) || (!rutaDisponible && recorrido.isPending)) {
    return (
      <p role="status" className="flex items-center gap-2 py-3 text-[13px] text-texto-secundario">
        <LoaderCircle aria-hidden className="size-4 animate-spin" />
        Cargando el mapa del servicio…
      </p>
    );
  }
  const error = ruta.error ?? recorrido.error;
  if (error) {
    return <p className="py-3 text-[13px] text-critico">No fue posible cargar el mapa del servicio: {error.message}</p>;
  }
  if (!trazo && puntosGps.length === 0 && !ubicacion) {
    return (
      <p className="flex items-center gap-2 py-3 text-[13px] text-texto-secundario">
        <Route aria-hidden strokeWidth={1.75} className="size-4" />
        {conRuta
          ? 'Calculando ruta: se espera un reporte GPS reciente de la tripulación.'
          : 'La tripulación no reportó posiciones GPS para este servicio.'}
      </p>
    );
  }

  return (
    <div className="space-y-2 pt-1">
      <div className="h-64 overflow-hidden rounded-xl border border-borde/80">
        <MapaCompacto centro={ajuste?.punto ?? ubicacion ?? destino} etiqueta="Mapa del servicio">
          {encuadre.length > 1 && <EncuadrarPuntos puntos={encuadre} />}
          {trazo && (
            <TrazoRuta
              trazo={trazo}
              variante={asignacion.estado === 'en_camino' ? 'activa' : 'pendiente'}
              distanciaRecorrida={ajuste?.distanciaRecorrida}
            />
          )}
          {!trazo && puntosGps.length > 1 && (
            <Polyline
              positions={puntosGps.map(({ latitud, longitud }) => [latitud, longitud])}
              interactive={false}
              pathOptions={{ color: '#64748b', weight: 3, opacity: 0.7, lineCap: 'round', lineJoin: 'round' }}
            />
          )}
          {destino && (
            <CircleMarker
              center={[destino.latitud, destino.longitud]}
              radius={9}
              interactive={false}
              pathOptions={{ color: '#ffffff', weight: 3, fillColor: colorDestino, fillOpacity: 1 }}
            />
          )}
          {ubicacion && ambulancia.data && (
            <MarcadorAmbulanciaMapa
              codigo={ambulancia.data.codigo}
              estadoOperativo={ambulancia.data.estadoOperativo}
              posicion={ajuste?.punto ?? ubicacion}
              senal={senal === 'ninguna' ? 'sin_senal' : senal}
              trazo={ajuste?.sobreRuta ? (trazo ?? undefined) : undefined}
            >
              <span className="block font-semibold text-texto">{ambulancia.data.codigo}</span>
              <span className="block text-texto-secundario">{textoSenal(ubicacion, ahora)}</span>
            </MarcadorAmbulanciaMapa>
          )}
        </MapaCompacto>
      </div>

      <p className="text-[13px] text-texto-secundario">
        {rutaDisponible ? (
          <>
            <span className="font-medium text-texto">{resumenRuta(rutaDisponible)}</span> · ruta por calles, estimado sin
            tráfico
            {ajuste && !ajuste.sobreRuta && ' · la ambulancia se apartó de la ruta'}
          </>
        ) : conRuta ? (
          'Calculando ruta: se espera un reporte GPS reciente de la tripulación.'
        ) : puntosGps.length > 0 ? (
          <>
            Recorrido GPS reportado: {puntosGps.length} posiciones, la última el{' '}
            {formatearFechaHora(recorrido.data?.at(-1)?.registradaEn ?? '')}. Las posiciones se unen en línea recta.
          </>
        ) : (
          'La tripulación no reportó posiciones GPS para este servicio.'
        )}
      </p>
    </div>
  );
}
