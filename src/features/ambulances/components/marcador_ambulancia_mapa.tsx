import L from 'leaflet';
import { Ambulance, Cross, SignalZero } from 'lucide-react';
import { useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Marker, Tooltip } from 'react-leaflet';
import { useMovimientoMarcador } from '../../map/hooks/use_movimiento_marcador';
import type { PuntoMapa } from '../../map/utils/coordenadas';
import { ETIQUETAS_ESTADO_OPERATIVO } from '../constants/estados_operativos';
import type { EstadoOperativo } from '../types/ambulancia.types';
import type { SenalUbicacion } from '../utils/senal_ubicacion';

const FONDO_ESTADO: Record<EstadoOperativo, string> = {
  disponible: 'bg-exito',
  en_servicio: 'bg-primario',
  fuera_servicio: 'bg-texto-secundario',
  mantenimiento: 'bg-advertencia',
};

type SenalVisible = Exclude<SenalUbicacion, 'ninguna'>;

/** Etapa del servicio que cambia el aspecto: asignada (aún no sale) o con el paciente a bordo. */
export type EtapaMarcador = 'asignada' | 'paciente_a_bordo';

interface PropiedadesMarcadorAmbulanciaMapa {
  codigo: string;
  estadoOperativo: EstadoOperativo;
  /** Dónde dibujarla: la posición GPS o, si va por su ruta, el punto de la ruta más cercano. */
  posicion: PuntoMapa;
  senal: SenalVisible;
  etapa?: EtapaMarcador;
  /** Con ruta, el movimiento entre lecturas sigue las calles. */
  trazo?: readonly PuntoMapa[];
  seleccionada?: boolean;
  alSeleccionar?: () => void;
  /** Contenido del tooltip al pasar sobre la ambulancia. */
  children?: ReactNode;
}

interface PropiedadesFicha {
  estadoOperativo: EstadoOperativo;
  senal: SenalVisible;
  etapa?: EtapaMarcador;
  seleccionada: boolean;
  nombreAccesible: string;
}

/**
 * Ficha cuadrada con el icono de ambulancia y una punta que marca el lugar exacto: se distingue
 * de las emergencias (checkpoints circulares) por forma, símbolo y color. De 2 a 10 min se
 * atenúa; con más de 10 min pasa a gris punteado con el aviso de sin señal.
 */
function FichaAmbulanciaMapa({ estadoOperativo, senal, etapa, seleccionada, nombreAccesible }: PropiedadesFicha) {
  const sinSenal = senal === 'sin_senal';
  const aBordo = etapa === 'paciente_a_bordo';
  // Con el paciente a bordo se destaca en cian oscuro; asignada (aún no sale), en azul claro.
  const fondo = sinSenal
    ? 'bg-texto-secundario/80'
    : aBordo
      ? 'bg-cian-texto'
      : etapa === 'asignada'
        ? 'bg-primario/65'
        : FONDO_ESTADO[estadoOperativo];
  return (
    <span
      className={`absolute top-0 left-0 flex origin-bottom -translate-x-1/2 -translate-y-full flex-col items-center transition-[transform,opacity] duration-200 ease-out ${
        seleccionada ? 'scale-115' : 'hover:scale-105'
      } ${senal === 'atrasada' ? 'opacity-65' : sinSenal ? 'opacity-85' : ''}`}
    >
      <span
        className={`nucleo-marcador relative flex size-9 items-center justify-center rounded-xl text-white shadow-vidrio-elevado ring-2 transition-shadow duration-150 ${fondo} ${
          seleccionada ? 'ring-institucional' : 'ring-white'
        } ${sinSenal ? 'outline-2 outline-offset-2 outline-texto-secundario outline-dashed' : ''}`}
      >
        <Ambulance aria-hidden strokeWidth={2} className="size-5" />
        {aBordo && (
          <span className="absolute -top-1.5 -left-1.5 flex size-4.5 items-center justify-center rounded-full bg-white text-cian-texto shadow-vidrio ring-1 ring-cian/40">
            <Cross aria-hidden strokeWidth={2.75} className="size-2.5" />
          </span>
        )}
        {sinSenal && (
          <span className="absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full bg-white text-texto-secundario shadow-vidrio ring-1 ring-borde">
            <SignalZero aria-hidden strokeWidth={2.5} className="size-2.5" />
          </span>
        )}
        <span className="sr-only">{nombreAccesible}</span>
      </span>
      <span
        aria-hidden
        className={`-mt-1.5 size-2.5 rotate-45 rounded-[2px] ${fondo} ${seleccionada ? 'ring-2 ring-institucional' : 'ring-2 ring-white'} [clip-path:polygon(100%_0,100%_100%,0_100%)]`}
      />
    </span>
  );
}

/**
 * Leaflet acepta un elemento como contenido del icono: se crea una vez y React dibuja dentro,
 * así el icono es vectorial y los cambios de estado se animan sin recrearlo. La posición se
 * mueve de forma imperativa y suave con cada lectura GPS.
 */
export function MarcadorAmbulanciaMapa({
  codigo,
  estadoOperativo,
  posicion,
  senal,
  etapa,
  trazo,
  seleccionada = false,
  alSeleccionar,
  children,
}: PropiedadesMarcadorAmbulanciaMapa) {
  const marcadorRef = useRef<L.Marker | null>(null);
  // Solo la posición inicial pasa por React; después la mueve `useMovimientoMarcador`.
  const [posicionInicial] = useState<[number, number]>(() => [posicion.latitud, posicion.longitud]);
  useMovimientoMarcador(marcadorRef, posicion, trazo);

  const contenedor = useMemo(() => document.createElement('div'), []);
  const icono = useMemo(
    () => L.divIcon({ className: 'marcador-mapa', iconSize: [0, 0], html: contenedor }),
    [contenedor],
  );
  const estado = ETIQUETAS_ESTADO_OPERATIVO[estadoOperativo];
  const nombreAccesible = `${codigo}, ${estado.toLowerCase()}${etapa === 'paciente_a_bordo' ? ', paciente a bordo' : ''}${
    senal === 'reciente' ? '' : senal === 'atrasada' ? ', posición atrasada' : ', sin señal'
  }`;

  return (
    <>
      <Marker
        ref={marcadorRef}
        position={posicionInicial}
        icon={icono}
        zIndexOffset={seleccionada ? 2000 : 0}
        eventHandlers={alSeleccionar ? { click: alSeleccionar } : undefined}
      >
        {children && (
          <Tooltip direction="top" offset={[0, -46]} className="tooltip-vidrio">
            {children}
          </Tooltip>
        )}
      </Marker>
      {createPortal(
        <FichaAmbulanciaMapa
          estadoOperativo={estadoOperativo}
          senal={senal}
          etapa={etapa}
          seleccionada={seleccionada}
          nombreAccesible={nombreAccesible}
        />,
        contenedor,
      )}
    </>
  );
}
