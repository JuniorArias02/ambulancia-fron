import { useMemo, type ReactNode } from 'react';
import { Polyline, Tooltip } from 'react-leaflet';
import type { PuntoMapa } from '../utils/coordenadas';
import { dividirTrazo } from '../utils/geometria_trazo';

/** `activa`: la ambulancia va en camino. `pendiente`: asignada, aún no sale. */
export type VarianteTrazo = 'activa' | 'pendiente';

interface PropiedadesTrazoRuta {
  trazo: readonly PuntoMapa[];
  variante: VarianteTrazo;
  /** Metros ya recorridos desde el inicio: esa parte se dibuja atenuada, como en un navegador. */
  distanciaRecorrida?: number;
  resaltado?: boolean;
  atenuado?: boolean;
  /** Contenido del tooltip al pasar sobre la línea. */
  children?: ReactNode;
}

const COLOR_RUTA = '#2563eb';
const COLOR_RECORRIDO = '#94a3b8';

function aLeaflet(puntos: readonly PuntoMapa[]): [number, number][] {
  return puntos.map(({ latitud, longitud }) => [latitud, longitud]);
}

/**
 * Ruta por calles al estilo de un navegador: línea azul continua con borde blanco para separarla
 * del mapa y tramo ya recorrido en gris claro. Si la ambulancia aún no sale, la misma línea va
 * un poco más tenue; el estado se lee en el tooltip.
 */
export function TrazoRuta({
  trazo,
  variante,
  distanciaRecorrida = 0,
  resaltado = false,
  atenuado = false,
  children,
}: PropiedadesTrazoRuta) {
  const { recorrido, restante } = useMemo(() => {
    const partes = distanciaRecorrida > 0 ? dividirTrazo(trazo, distanciaRecorrida) : { recorrido: [], restante: [...trazo] };
    return { recorrido: aLeaflet(partes.recorrido), restante: aLeaflet(partes.restante) };
  }, [trazo, distanciaRecorrida]);
  const completo = useMemo(() => aLeaflet(trazo), [trazo]);

  const activa = variante === 'activa';
  const grosor = (activa ? 5 : 4) + (resaltado ? 1 : 0);
  const opacidad = atenuado ? 0.35 : resaltado ? 1 : activa ? 0.9 : 0.7;

  return (
    <>
      <Polyline
        positions={completo}
        interactive={false}
        pathOptions={{ color: '#ffffff', weight: grosor + 4, opacity: atenuado ? 0.4 : 0.95, lineCap: 'round', lineJoin: 'round' }}
      />
      {recorrido.length > 1 && (
        <Polyline
          positions={recorrido}
          interactive={false}
          pathOptions={{ color: COLOR_RECORRIDO, weight: grosor - 1, opacity: atenuado ? 0.3 : 0.75, lineCap: 'round', lineJoin: 'round' }}
        />
      )}
      {restante.length > 1 && (
        <Polyline
          positions={restante}
          pathOptions={{
            color: COLOR_RUTA,
            weight: grosor,
            opacity: opacidad,
            lineCap: 'round',
            lineJoin: 'round',
          }}
        >
          {children && (
            <Tooltip sticky className="tooltip-vidrio">
              {children}
            </Tooltip>
          )}
        </Polyline>
      )}
    </>
  );
}
