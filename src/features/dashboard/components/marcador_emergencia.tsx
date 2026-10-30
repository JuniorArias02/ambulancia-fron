import L from 'leaflet';
import { useMemo } from 'react';
import { Marker } from 'react-leaflet';
import { ETIQUETAS_ESTADO_EMERGENCIA, ETIQUETAS_PRIORIDAD } from '../../emergencies/constants/catalogos_emergencia';
import { ESTILO_SIN_PRIORIDAD, ESTILOS_PRIORIDAD } from '../../emergencies/constants/estilos_emergencia';
import type { Emergencia } from '../../emergencies/types/emergencia.types';
import type { PuntoMapa } from '../../map/utils/coordenadas';
import type { EtapaEmergencia } from '../utils/flota';
import { htmlCheckpoint } from '../utils/marcadores';

interface PropiedadesMarcadorEmergencia {
  emergencia: Emergencia;
  posicion: PuntoMapa;
  seleccionada: boolean;
  etapa: EtapaEmergencia;
  alSeleccionar: () => void;
}

const TEXTO_ETAPA: Record<EtapaEmergencia, string> = {
  sin_servicio: '',
  en_camino: ' · ambulancia en camino',
  en_lugar: ' · ambulancia en el lugar',
  paciente_recogido: ' · paciente a bordo, ya no hay nadie en el sitio',
};

export function MarcadorEmergencia({ emergencia, posicion, seleccionada, etapa, alSeleccionar }: PropiedadesMarcadorEmergencia) {
  const { colorMapa: color } = emergencia.prioridad ? ESTILOS_PRIORIDAD[emergencia.prioridad] : ESTILO_SIN_PRIORIDAD;
  const pendiente = emergencia.estado === 'recibida';
  const icono = useMemo(
    () =>
      L.divIcon({
        className: 'marcador-mapa',
        iconSize: [0, 0],
        html: htmlCheckpoint({
          color,
          pendiente,
          seleccionada,
          ambulanciaEnLugar: etapa === 'en_lugar',
          atenuada: etapa === 'paciente_recogido',
        }),
      }),
    [color, pendiente, seleccionada, etapa],
  );
  const prioridad = emergencia.prioridad ? `prioridad ${ETIQUETAS_PRIORIDAD[emergencia.prioridad].toLowerCase()}` : 'sin clasificar';
  const descripcion = `${emergencia.numeroEmergencia} · ${prioridad} · ${ETIQUETAS_ESTADO_EMERGENCIA[emergencia.estado].toLowerCase()}${TEXTO_ETAPA[etapa]}`;

  return (
    <Marker
      position={[posicion.latitud, posicion.longitud]}
      icon={icono}
      title={descripcion}
      alt={descripcion}
      // Lo seleccionado queda arriba; luego lo pendiente, sobre lo ya despachado.
      zIndexOffset={seleccionada ? 2000 : pendiente ? 500 : etapa === 'paciente_recogido' ? -500 : 0}
      eventHandlers={{ click: alSeleccionar }}
    />
  );
}
