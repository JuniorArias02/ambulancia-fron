import { Crosshair, MapPinX } from 'lucide-react';
import type { UseFormRegisterReturn } from 'react-hook-form';
import { CampoTexto } from '../../../components/forms/campo_texto';
import { puntoDesdeTexto, redondearCoordenada, type PuntoMapa } from '../utils/coordenadas';
import { MapaPunto } from './mapa_punto';

interface PropiedadesSelectorCoordenadas {
  latitud: string;
  longitud: string;
  registroLatitud: UseFormRegisterReturn;
  registroLongitud: UseFormRegisterReturn;
  /** Recibe las coordenadas como texto, listas para el formulario; `''` las quita. */
  alCambiar: (latitud: string, longitud: string) => void;
  errorLatitud?: string;
  errorLongitud?: string;
  deshabilitado: boolean;
  color?: string;
  etiquetaMapa: string;
  /** Se llama solo cuando el usuario toca el mapa (no al escribir), p. ej. para buscar la dirección. */
  alElegirEnMapa?: (punto: PuntoMapa) => void;
  ayuda?: string;
}

/** Punto en el mapa con sus coordenadas editables: el clic las llena y escribirlas mueve el punto. */
export function SelectorCoordenadas({
  latitud,
  longitud,
  registroLatitud,
  registroLongitud,
  alCambiar,
  errorLatitud,
  errorLongitud,
  deshabilitado,
  color,
  etiquetaMapa,
  alElegirEnMapa,
  ayuda = 'Haz clic en el mapa para llenar las coordenadas, o escríbelas.',
}: PropiedadesSelectorCoordenadas) {
  const punto = puntoDesdeTexto(latitud, longitud);
  const fijarPunto = ({ latitud: lat, longitud: lng }: PuntoMapa) => {
    const elegido = { latitud: redondearCoordenada(lat), longitud: redondearCoordenada(lng) };
    alCambiar(String(elegido.latitud), String(elegido.longitud));
    alElegirEnMapa?.(elegido);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-texto">Punto en el mapa</p>
        {punto && !deshabilitado && (
          <button
            type="button"
            onClick={() => alCambiar('', '')}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[13px] text-texto-secundario transition-colors duration-150 hover:bg-white hover:text-texto"
          >
            <MapPinX aria-hidden strokeWidth={1.75} className="size-3.5" />
            Quitar punto
          </button>
        )}
      </div>
      <div className="h-56 overflow-hidden rounded-xl border border-borde/80">
        <MapaPunto
          punto={punto}
          color={color}
          etiqueta={etiquetaMapa}
          alSeleccionar={deshabilitado ? undefined : fijarPunto}
        />
      </div>
      <p className="text-[13px] text-texto-secundario">{ayuda}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <CampoTexto
          id={registroLatitud.name}
          etiqueta="Latitud"
          icono={Crosshair}
          inputMode="decimal"
          autoComplete="off"
          placeholder="7.893900"
          obligatorio={false}
          disabled={deshabilitado}
          error={errorLatitud}
          {...registroLatitud}
        />
        <CampoTexto
          id={registroLongitud.name}
          etiqueta="Longitud"
          icono={Crosshair}
          inputMode="decimal"
          autoComplete="off"
          placeholder="-72.507800"
          obligatorio={false}
          disabled={deshabilitado}
          error={errorLongitud}
          {...registroLongitud}
        />
      </div>
    </div>
  );
}
