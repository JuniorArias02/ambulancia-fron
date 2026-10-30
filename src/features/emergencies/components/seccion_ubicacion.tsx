import { Building2, Landmark, LoaderCircle, MapPin, MapPinned } from 'lucide-react';
import { useRef, useState, type KeyboardEvent } from 'react';
import {
  useWatch,
  type Control,
  type FieldErrors,
  type UseFormGetValues,
  type UseFormRegister,
  type UseFormSetValue,
  type UseFormTrigger,
} from 'react-hook-form';
import { CampoTexto } from '../../../components/forms/campo_texto';
import { entorno } from '../../../config/entorno';
import { AvisoUbicacion } from '../../geocoding/components/aviso_ubicacion';
import { useGeocodificarDireccion, useGeocodificarPunto } from '../../geocoding/hooks/use_geocodificacion';
import {
  avisoDireccionUbicada,
  avisoErrorGeocodificacion,
  interpretarInversa,
  type AvisoUbicacion as Aviso,
} from '../../geocoding/utils/interpretar_geocodificacion';
import { SelectorCoordenadas } from '../../map/components/selector_coordenadas';
import { redondearCoordenada, type PuntoMapa } from '../../map/utils/coordenadas';
import type { EntradaEmergencia, FormularioEmergencia } from '../schemas/emergencia.schema';

// La regla "dirección o coordenadas" afecta a los tres campos: al cambiar uno se revalidan los demás.
const CAMPOS_UBICACION = ['direccion', 'latitud', 'longitud'] as const;
const LONGITUD_MINIMA_DIRECCION = 3;

interface PropiedadesSeccionUbicacion {
  register: UseFormRegister<EntradaEmergencia>;
  control: Control<EntradaEmergencia, unknown, FormularioEmergencia>;
  setValue: UseFormSetValue<EntradaEmergencia>;
  getValues: UseFormGetValues<EntradaEmergencia>;
  trigger: UseFormTrigger<EntradaEmergencia>;
  errors: FieldErrors<EntradaEmergencia>;
  /** Tras el primer envío, los cambios se validan al momento. */
  revalidar: boolean;
  deshabilitada: boolean;
  colorMarcador: string;
}

/**
 * Dos caminos que llevan al mismo estado (punto marcado + dirección escrita):
 * escribir la dirección y pulsar "Ubicar", o tocar el mapa y dejar que se llene la dirección.
 * No se encadenan: lo que vino de una consulta no dispara la otra.
 */
export function SeccionUbicacion({
  register,
  control,
  setValue,
  getValues,
  trigger,
  errors,
  revalidar,
  deshabilitada,
  colorMarcador,
}: PropiedadesSeccionUbicacion) {
  const latitud = useWatch({ control, name: 'latitud' });
  const longitud = useWatch({ control, name: 'longitud' });
  const direccion = useWatch({ control, name: 'direccion' });
  const ubicacion = useGeocodificarDireccion();
  const inversa = useGeocodificarPunto();
  // La ciudad solo sirve para ubicar la dirección: la API de emergencias no la recibe.
  const [ciudad, setCiudad] = useState(entorno.ciudadOperacion);
  const [aviso, setAviso] = useState<Aviso | null>(null);
  // Textos que llenó la geocodificación: si el usuario los cambia, ya no se reemplazan.
  const automaticosRef = useRef<{ direccion: string | null; referencia: string | null }>({
    direccion: null,
    referencia: null,
  });
  // Solo se aplica la respuesta de la última consulta, aunque otra llegue después.
  const consultaRef = useRef(0);

  const fijarCoordenadas = (lat: string, lng: string) => {
    setValue('latitud', lat, { shouldDirty: true });
    setValue('longitud', lng, { shouldDirty: true });
    if (revalidar) void trigger(CAMPOS_UBICACION);
  };

  const cambiarDesdeSelector = (lat: string, lng: string) => {
    fijarCoordenadas(lat, lng);
    if (lat === '' && lng === '') {
      consultaRef.current += 1;
      setAviso(null);
    }
  };

  const ubicarDireccion = () => {
    const texto = getValues('direccion').trim();
    if (texto.length < LONGITUD_MINIMA_DIRECCION) {
      setAviso({ tono: 'advertencia', titulo: 'Escribe la dirección para ubicarla', detalle: 'Mínimo 3 caracteres.' });
      return;
    }
    const consulta = ++consultaRef.current;
    ubicacion.mutate(
      { direccion: texto, ciudad: ciudad.trim() || undefined },
      {
        onSuccess: (resultado) => {
          if (consulta !== consultaRef.current) return;
          fijarCoordenadas(
            String(redondearCoordenada(resultado.coordenadas.latitud)),
            String(redondearCoordenada(resultado.coordenadas.longitud)),
          );
          setAviso(avisoDireccionUbicada(resultado));
        },
        onError: (error) => {
          if (consulta === consultaRef.current) setAviso(avisoErrorGeocodificacion(error, 'direccion'));
        },
      },
    );
  };

  // El punto ya quedó marcado: se guarda donde el usuario tocó, no donde está la dirección encontrada.
  const buscarDireccionDelPunto = (punto: PuntoMapa) => {
    const consulta = ++consultaRef.current;
    inversa.mutate(punto, {
      onSuccess: (resultado) => {
        if (consulta !== consultaRef.current) return;
        const automaticos = automaticosRef.current;
        const cambios = interpretarInversa(resultado, {
          direccion: getValues('direccion'),
          referencia: getValues('referenciaLugar'),
          direccionAutomatica: automaticos.direccion,
          referenciaAutomatica: automaticos.referencia,
        });
        if (cambios.direccion !== undefined) {
          setValue('direccion', cambios.direccion, { shouldDirty: true, shouldValidate: revalidar });
          automaticos.direccion = cambios.direccion;
        }
        if (cambios.referencia !== undefined) {
          setValue('referenciaLugar', cambios.referencia, { shouldDirty: true, shouldValidate: revalidar });
          automaticos.referencia = cambios.referencia;
        }
        if (cambios.ciudad) setCiudad(cambios.ciudad);
        setAviso(cambios.aviso);
      },
      onError: (error) => {
        if (consulta === consultaRef.current) setAviso(avisoErrorGeocodificacion(error, 'punto'));
      },
    });
  };

  // Enter en la dirección la ubica en lugar de enviar todo el formulario.
  const ubicarConEnter = (evento: KeyboardEvent<HTMLInputElement>) => {
    if (evento.key !== 'Enter') return;
    evento.preventDefault();
    ubicarDireccion();
  };

  const buscando = ubicacion.isPending
    ? 'Ubicando la dirección…'
    : inversa.isPending
      ? 'Buscando la dirección del punto…'
      : null;
  const puedeUbicar = !deshabilitada && !ubicacion.isPending && direccion.trim().length >= LONGITUD_MINIMA_DIRECCION;

  return (
    <fieldset className="space-y-5">
      <legend className="mb-1 text-sm font-semibold text-texto">Ubicación</legend>
      <p className="text-[13px] text-texto-secundario">
        Escribe la dirección y pulsa <span className="font-medium text-texto">Ubicar</span>, o toca el punto en el mapa
        para buscar su dirección. Puedes corregir cualquiera de los dos antes de guardar.
      </p>

      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <CampoTexto
            id="direccion"
            etiqueta="Dirección"
            icono={MapPin}
            autoComplete="off"
            placeholder="Calle 72 # 15-20"
            maxLength={255}
            obligatorio={false}
            disabled={deshabilitada}
            error={errors.direccion?.message}
            onKeyDown={ubicarConEnter}
            {...register('direccion', { deps: ['latitud', 'longitud'] })}
          />
        </div>
        <button
          type="button"
          onClick={ubicarDireccion}
          disabled={!puedeUbicar}
          className="campo-vidrio mt-7 inline-flex h-12 shrink-0 items-center gap-2 rounded-xl px-4 text-sm font-medium text-texto transition-colors duration-150 hover:bg-white focus-visible:ring-4 focus-visible:ring-primario/15 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          {ubicacion.isPending ? (
            <LoaderCircle aria-hidden className="size-4 animate-spin" />
          ) : (
            <MapPinned aria-hidden strokeWidth={1.75} className="size-4 text-primario" />
          )}
          Ubicar
        </button>
      </div>

      <AvisoUbicacion buscando={buscando} aviso={aviso} />

      <div className="grid gap-5 sm:grid-cols-2">
        <CampoTexto
          id="ciudadUbicacion"
          etiqueta="Ciudad"
          icono={Building2}
          autoComplete="off"
          maxLength={80}
          obligatorio={false}
          disabled={deshabilitada}
          value={ciudad}
          onChange={(evento) => setCiudad(evento.target.value)}
          ayuda="Solo para ubicar la dirección."
        />
        <CampoTexto
          id="referenciaLugar"
          etiqueta="Punto de referencia"
          icono={Landmark}
          autoComplete="off"
          placeholder="Frente al centro comercial"
          maxLength={255}
          obligatorio={false}
          disabled={deshabilitada}
          error={errors.referenciaLugar?.message}
          {...register('referenciaLugar')}
        />
      </div>

      <SelectorCoordenadas
        latitud={latitud}
        longitud={longitud}
        registroLatitud={register('latitud', { deps: ['longitud', 'direccion'] })}
        registroLongitud={register('longitud', { deps: ['latitud', 'direccion'] })}
        alCambiar={cambiarDesdeSelector}
        alElegirEnMapa={deshabilitada ? undefined : buscarDireccionDelPunto}
        ayuda="Toca el mapa donde está el paciente para marcarlo y buscar su dirección, o escribe las coordenadas."
        errorLatitud={errors.latitud?.message}
        errorLongitud={errors.longitud?.message}
        deshabilitado={deshabilitada}
        color={colorMarcador}
        etiquetaMapa="Mapa para marcar el lugar de la emergencia"
      />
    </fieldset>
  );
}
