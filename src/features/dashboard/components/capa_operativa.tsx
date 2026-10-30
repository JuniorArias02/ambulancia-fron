import { useEffect, useMemo, useRef } from 'react';
import { useMap } from 'react-leaflet';
import { MarcadorAmbulanciaMapa } from '../../ambulances/components/marcador_ambulancia_mapa';
import type { Ambulancia } from '../../ambulances/types/ambulancia.types';
import { senalUbicacion, textoSenal } from '../../ambulances/utils/senal_ubicacion';
import type { Ruta } from '../../assignments/schemas/ruta.schema';
import type { Asignacion } from '../../assignments/types/asignacion.types';
import { resumenRuta, tieneRuta, trazoDeRuta } from '../../assignments/utils/formato_ruta';
import type { Emergencia } from '../../emergencies/types/emergencia.types';
import { TrazoRuta } from '../../map/components/trazo_ruta';
import type { PuntoMapa } from '../../map/utils/coordenadas';
import { ajustarAlTrazo } from '../../map/utils/geometria_trazo';
import type { EtapaEmergencia } from '../utils/flota';
import { MarcadorEmergencia } from './marcador_emergencia';
import { PopupEmergencia } from './popup_emergencia';
import { TooltipAmbulancia } from './tooltip_ambulancia';

export type Seleccion = { tipo: 'emergencia'; id: string } | { tipo: 'ambulancia'; id: string };

interface PropiedadesCapaOperativa {
  emergencias: Emergencia[];
  ambulancias: Ambulancia[];
  /** Ambulancias que pasan el filtro del mapa; la seleccionada se muestra siempre. */
  ambulanciaVisible: (ambulancia: Ambulancia) => boolean;
  asignaciones: Map<string, Asignacion>;
  /** Ruta vigente de cada ambulancia que va hacia una emergencia. */
  rutas: Map<string, Ruta>;
  /** Etapa de cada emergencia con servicios activos (ambulancia en el lugar, paciente recogido…). */
  etapas: Map<string, EtapaEmergencia>;
  seleccion: Seleccion | null;
  ahora: number;
  alSeleccionar: (seleccion: Seleccion) => void;
  /** Cierra el panel de esa emergencia solo si sigue siendo la seleccionada. */
  alCerrarEmergencia: (id: string) => void;
  alDespachar: (emergencia: Emergencia) => void;
}

/** Centra el mapa en lo que se elige desde el panel, sin reencuadrar en cada actualización. */
function EnfocarSeleccion({ punto, clave }: { punto: PuntoMapa | null; clave: string | null }) {
  const mapa = useMap();
  // Se guarda la última posición sin volver a centrar: una nueva lectura GPS no debe mover la vista.
  const puntoRef = useRef(punto);
  useEffect(() => {
    puntoRef.current = punto;
  });

  useEffect(() => {
    const actual = puntoRef.current;
    if (clave === null || !actual) return;
    mapa.flyTo([actual.latitud, actual.longitud], Math.max(mapa.getZoom(), 15), { duration: 0.3 });
  }, [mapa, clave]);

  return null;
}

export function CapaOperativa({
  emergencias,
  ambulancias,
  ambulanciaVisible,
  asignaciones,
  rutas,
  etapas,
  seleccion,
  ahora,
  alSeleccionar,
  alCerrarEmergencia,
  alDespachar,
}: PropiedadesCapaOperativa) {
  // La geometría solo cambia cuando el backend recalcula la ruta.
  const trazos = useMemo(() => new Map([...rutas].map(([ambulanciaId, ruta]) => [ambulanciaId, trazoDeRuta(ruta)])), [rutas]);
  // Dónde dibujar cada ambulancia con ruta y cuánto de la ruta ya recorrió.
  const ajustes = new Map(
    ambulancias.flatMap((ambulancia) => {
      const trazo = trazos.get(ambulancia.id);
      return trazo && ambulancia.ultimaUbicacion ? [[ambulancia.id, ajustarAlTrazo(ambulancia.ultimaUbicacion, trazo)] as const] : [];
    }),
  );
  const emergenciaElegida =
    seleccion?.tipo === 'emergencia' ? emergencias.find(({ id }) => id === seleccion.id) : undefined;
  const puntoSeleccionado =
    seleccion?.tipo === 'emergencia'
      ? (emergenciaElegida?.coordenadas ?? null)
      : seleccion?.tipo === 'ambulancia'
        ? (ambulancias.find(({ id }) => id === seleccion.id)?.ultimaUbicacion ?? null)
        : null;

  return (
    <>
      <EnfocarSeleccion punto={puntoSeleccionado} clave={seleccion ? `${seleccion.tipo}:${seleccion.id}` : null} />

      {[...rutas.values()].map((ruta) => {
        const asignacion = asignaciones.get(ruta.ambulanciaId);
        if (!asignacion) return null;
        const resaltada =
          (seleccion?.tipo === 'ambulancia' && seleccion.id === ruta.ambulanciaId) ||
          (seleccion?.tipo === 'emergencia' && seleccion.id === ruta.emergenciaId);
        const trazo = trazos.get(ruta.ambulanciaId);
        if (!trazo) return null;
        return (
          <TrazoRuta
            // Nueva clave al recalcular (desvío o primer GPS): se redibuja la línea completa.
            key={`${ruta.asignacionId}-${ruta.calculadaEn}`}
            trazo={trazo}
            variante={asignacion.estado === 'en_camino' ? 'activa' : 'pendiente'}
            distanciaRecorrida={ajustes.get(ruta.ambulanciaId)?.distanciaRecorrida}
            resaltado={resaltada}
            atenuado={seleccion !== null && !resaltada}
          >
            <span className="block font-semibold text-texto">
              {ruta.ambulanciaCodigo ?? 'Ambulancia'} → {ruta.numeroEmergencia ?? 'Emergencia'}
            </span>
            <span className="block text-texto">{resumenRuta(ruta)}</span>
            <span className="block text-texto-secundario">
              {asignacion.estado === 'en_camino' ? 'En camino' : 'Asignada, aún no sale'} · estimado sin tráfico
            </span>
          </TrazoRuta>
        );
      })}

      {emergencias.map((emergencia) =>
        emergencia.coordenadas ? (
          <MarcadorEmergencia
            key={emergencia.id}
            emergencia={emergencia}
            posicion={emergencia.coordenadas}
            seleccionada={emergencia.id === emergenciaElegida?.id}
            etapa={etapas.get(emergencia.id) ?? 'sin_servicio'}
            alSeleccionar={() => alSeleccionar({ tipo: 'emergencia', id: emergencia.id })}
          />
        ) : null,
      )}

      {ambulancias.map((ambulancia) => {
        const ubicacion = ambulancia.ultimaUbicacion;
        const seleccionada = seleccion?.tipo === 'ambulancia' && seleccion.id === ambulancia.id;
        // Sin GPS no se pinta: aparece en la lista de la flota como "sin ubicación".
        if (!ubicacion || (!seleccionada && !ambulanciaVisible(ambulancia))) return null;
        const senal = senalUbicacion(ubicacion, ahora);
        const asignacion = asignaciones.get(ambulancia.id);
        const ajuste = ajustes.get(ambulancia.id);
        return (
          <MarcadorAmbulanciaMapa
            key={ambulancia.id}
            codigo={ambulancia.codigo}
            estadoOperativo={ambulancia.estadoOperativo}
            posicion={ajuste?.punto ?? ubicacion}
            senal={senal === 'ninguna' ? 'sin_senal' : senal}
            etapa={
              asignacion?.estado === 'trasladando'
                ? 'paciente_a_bordo'
                : asignacion?.estado === 'asignada'
                  ? 'asignada'
                  : undefined
            }
            trazo={ajuste?.sobreRuta ? trazos.get(ambulancia.id) : undefined}
            seleccionada={seleccionada}
            alSeleccionar={() => alSeleccionar({ tipo: 'ambulancia', id: ambulancia.id })}
          >
            <TooltipAmbulancia
              ambulancia={ambulancia}
              asignacion={asignacion}
              ruta={rutas.get(ambulancia.id)}
              esperandoRuta={asignacion !== undefined && tieneRuta(asignacion) && !rutas.has(ambulancia.id)}
              textoSenal={textoSenal(ubicacion, ahora)}
              senalReciente={senal === 'reciente'}
            />
          </MarcadorAmbulanciaMapa>
        );
      })}

      {emergenciaElegida?.coordenadas && (
        <PopupEmergencia
          key={emergenciaElegida.id}
          emergencia={emergenciaElegida}
          posicion={emergenciaElegida.coordenadas}
          ahora={ahora}
          rutas={[...rutas.values()].filter(({ emergenciaId }) => emergenciaId === emergenciaElegida.id)}
          etapa={etapas.get(emergenciaElegida.id) ?? 'sin_servicio'}
          alCerrar={() => alCerrarEmergencia(emergenciaElegida.id)}
          alDespachar={() => alDespachar(emergenciaElegida)}
        />
      )}
    </>
  );
}
