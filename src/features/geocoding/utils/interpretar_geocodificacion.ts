import type { ErrorApi } from '../../../services/error_api';
import type { DireccionGeocodificada, GeocodificacionInversa } from '../types/geocodificacion.types';

export type TonoAviso = 'exito' | 'advertencia';

export interface AvisoUbicacion {
  tono: TonoAviso;
  titulo: string;
  detalle?: string;
}

/** Textos que el formulario llenó solo; si el usuario los cambió, ya no se reemplazan. */
export interface EstadoCampos {
  direccion: string;
  referencia: string;
  direccionAutomatica: string | null;
  referenciaAutomatica: string | null;
}

export interface ResultadoInversa {
  /** Campos a llenar; ausentes, no se tocan. */
  direccion?: string;
  referencia?: string;
  ciudad?: string;
  aviso: AvisoUbicacion;
}

function sePuedeReemplazar(actual: string, automatico: string | null): boolean {
  return actual.trim() === '' || actual === automatico;
}

/**
 * Qué hacer con la dirección encontrada para el punto tocado, según su precisión:
 * `exacta` y `aproximada` llenan la dirección (con aviso si es aproximada); `zona` solo sirve
 * como referencia del lugar. Lo que el usuario escribió a mano siempre se respeta.
 */
export function interpretarInversa(resultado: GeocodificacionInversa, campos: EstadoCampos): ResultadoInversa {
  const { precision, direccion, lineaDireccion, componentes, distanciaMetros } = resultado;
  const ciudad = componentes.ciudad ?? undefined;

  if (precision === 'zona') {
    const llenarReferencia = sePuedeReemplazar(campos.referencia, campos.referenciaAutomatica);
    return {
      referencia: llenarReferencia ? direccion : undefined,
      ciudad,
      aviso: {
        tono: 'advertencia',
        titulo: 'Solo se conoce la zona',
        detalle: `${direccion}. Escribe la dirección o una indicación para llegar.`,
      },
    };
  }

  const llenarDireccion = sePuedeReemplazar(campos.direccion, campos.direccionAutomatica);
  const conservada = llenarDireccion ? '' : ' Se conservó la dirección que escribiste.';
  return {
    direccion: llenarDireccion ? (lineaDireccion ?? direccion) : undefined,
    ciudad,
    aviso:
      precision === 'exacta'
        ? { tono: 'exito', titulo: 'Dirección encontrada · precisión exacta', detalle: `${direccion}.${conservada}` }
        : {
            tono: 'advertencia',
            titulo: `Dirección aproximada (a ${Math.round(distanciaMetros)} m), verifícala`,
            detalle: `${direccion}.${conservada}`,
          },
  };
}

export function avisoDireccionUbicada(resultado: DireccionGeocodificada): AvisoUbicacion {
  return {
    tono: 'exito',
    titulo: 'Dirección ubicada en el mapa',
    detalle: resultado.direccionFormateada ?? undefined,
  };
}

/** Los errores esperables se traducen en el siguiente paso para el operador. */
export function avisoErrorGeocodificacion(error: ErrorApi, operacion: 'direccion' | 'punto'): AvisoUbicacion {
  if (error.estado === 429) {
    return { tono: 'advertencia', titulo: 'Demasiadas consultas seguidas', detalle: 'Espera un momento e inténtalo de nuevo.' };
  }
  if (operacion === 'direccion') {
    if (error.estado === 422 && /ciudad/i.test(error.message)) {
      return { tono: 'advertencia', titulo: 'Indica la ciudad', detalle: 'Se necesita para ubicar la dirección.' };
    }
    if (error.estado === 422 || error.estado === 503) {
      return {
        tono: 'advertencia',
        titulo: 'No se encontró una ubicación confiable',
        detalle: 'Toca el punto en el mapa. Es normal: muchas placas no están en el mapa del proveedor.',
      };
    }
  } else if (error.estado === 422 || error.estado === 503) {
    return {
      tono: 'advertencia',
      titulo: 'No se encontró una dirección para ese punto',
      detalle: 'El punto quedó marcado. Escribe la dirección a mano.',
    };
  }
  return { tono: 'advertencia', titulo: 'No fue posible consultar la ubicación', detalle: error.message };
}
