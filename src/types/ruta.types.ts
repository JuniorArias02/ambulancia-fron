import type { RouteObject } from 'react-router';
import type { NombreRol } from './rol.types';

/**
 * `contenido`: la página ocupa el área junto al sidebar y la barra superior.
 * `lienzo`: la página cubre toda la pantalla y el sidebar y la barra flotan encima (p. ej. el mapa).
 */
export type DisposicionRuta = 'contenido' | 'lienzo';

/** Metadatos que cada ruta declara en `handle` para el layout principal. */
export interface MetadatosRuta {
  titulo: string;
  disposicion?: DisposicionRuta;
  /** Roles con acceso. Solo oculta la vista; el backend sigue autorizando cada operación. */
  roles?: readonly NombreRol[];
}

export function esMetadatosRuta(valor: unknown): valor is MetadatosRuta {
  return (
    typeof valor === 'object' &&
    valor !== null &&
    'titulo' in valor &&
    typeof valor.titulo === 'string'
  );
}

export type RutaAplicacion = RouteObject & { handle?: MetadatosRuta };
