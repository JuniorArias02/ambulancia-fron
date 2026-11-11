import { Landmark, MapPin, MapPinOff } from 'lucide-react';
import { MapaPunto } from '../../map/components/mapa_punto';
import { ESTILO_SIN_PRIORIDAD, ESTILOS_PRIORIDAD } from '../constants/estilos_emergencia';
import { OrigenUbicacionReporte } from './insignias_emergencia';
import type { Emergencia } from '../types/emergencia.types';

const formatoCoordenada = new Intl.NumberFormat('es-CO', { minimumFractionDigits: 5, maximumFractionDigits: 7 });

export function UbicacionEmergencia({ emergencia }: { emergencia: Emergencia }) {
  const { direccion, referenciaLugar, coordenadas, prioridad, origenUbicacion } = emergencia;
  const color = (prioridad ? ESTILOS_PRIORIDAD[prioridad] : ESTILO_SIN_PRIORIDAD).colorMapa;

  return (
    <div>
      <div className="space-y-3 px-5 py-4">
        <p className="flex items-start gap-3 text-sm text-texto">
          <MapPin aria-hidden strokeWidth={1.75} className="mt-0.5 size-4 shrink-0 text-texto-secundario" />
          {direccion ?? <span className="text-texto-secundario">Sin dirección: solo se reportaron coordenadas.</span>}
        </p>
        {referenciaLugar && (
          <p className="flex items-start gap-3 text-sm text-texto">
            <Landmark aria-hidden strokeWidth={1.75} className="mt-0.5 size-4 shrink-0 text-texto-secundario" />
            {referenciaLugar}
          </p>
        )}
      </div>
      {coordenadas ? (
        <>
          <div className="mx-5 h-64 overflow-hidden rounded-xl border border-borde/80 lg:h-72">
            <MapaPunto punto={coordenadas} color={color} etiqueta="Mapa con el lugar de la emergencia" />
          </div>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 px-5 pt-2 pb-4 text-[13px] text-texto-secundario">
            <span className="tabular-nums">
              {formatoCoordenada.format(coordenadas.latitud)}, {formatoCoordenada.format(coordenadas.longitud)}
            </span>
            {origenUbicacion && <OrigenUbicacionReporte origen={origenUbicacion} />}
          </p>
        </>
      ) : (
        <p className="mx-5 mb-5 flex items-center gap-2.5 rounded-xl bg-white/50 px-4 py-3 text-[13px] text-texto-secundario">
          <MapPinOff aria-hidden strokeWidth={1.75} className="size-4 shrink-0" />
          No se registraron coordenadas. Corrige la emergencia para marcar el punto en el mapa.
        </p>
      )}
    </div>
  );
}
