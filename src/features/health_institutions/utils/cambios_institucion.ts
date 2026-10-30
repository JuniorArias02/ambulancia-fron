import type { EntradaInstitucion, FormularioInstitucion } from '../schemas/institucion.schema';
import type {
  DatosActualizarInstitucion,
  DatosCrearInstitucion,
  InstitucionSalud,
} from '../types/institucion.types';

/** Valores iniciales del formulario: los campos de texto no admiten `null`. */
export function valoresFormulario(institucion: InstitucionSalud | null): EntradaInstitucion {
  return {
    nombre: institucion?.nombre ?? '',
    codigoHabilitacion: institucion?.codigoHabilitacion ?? '',
    nivelComplejidad: institucion?.nivelComplejidad ?? '',
    telefono: institucion?.telefono ?? '',
    direccion: institucion?.direccion ?? '',
    latitud: institucion?.coordenadas ? String(institucion.coordenadas.latitud) : '',
    longitud: institucion?.coordenadas ? String(institucion.coordenadas.longitud) : '',
  };
}

/** En el registro los datos vacíos se omiten en lugar de enviarse en `null`. */
export function construirDatosCreacion(formulario: FormularioInstitucion): DatosCrearInstitucion {
  const datos: DatosCrearInstitucion = { nombre: formulario.nombre };
  if (formulario.codigoHabilitacion !== null) datos.codigoHabilitacion = formulario.codigoHabilitacion;
  if (formulario.nivelComplejidad !== null) datos.nivelComplejidad = formulario.nivelComplejidad;
  if (formulario.telefono !== null) datos.telefono = formulario.telefono;
  if (formulario.direccion !== null) datos.direccion = formulario.direccion;
  if (formulario.latitud !== null && formulario.longitud !== null) {
    datos.latitud = formulario.latitud;
    datos.longitud = formulario.longitud;
  }
  return datos;
}

/** Cuerpo del PATCH solo con lo que cambió; `null` borra el dato y las coordenadas van juntas. */
export function construirCambiosInstitucion(
  original: InstitucionSalud,
  formulario: FormularioInstitucion,
): DatosActualizarInstitucion {
  const cambios: DatosActualizarInstitucion = {};
  if (formulario.nombre !== original.nombre) cambios.nombre = formulario.nombre;
  if (formulario.codigoHabilitacion !== original.codigoHabilitacion) {
    cambios.codigoHabilitacion = formulario.codigoHabilitacion;
  }
  if (formulario.nivelComplejidad !== original.nivelComplejidad) {
    cambios.nivelComplejidad = formulario.nivelComplejidad;
  }
  if (formulario.telefono !== original.telefono) cambios.telefono = formulario.telefono;
  if (formulario.direccion !== original.direccion) cambios.direccion = formulario.direccion;

  const latitudOriginal = original.coordenadas?.latitud ?? null;
  const longitudOriginal = original.coordenadas?.longitud ?? null;
  if (formulario.latitud !== latitudOriginal || formulario.longitud !== longitudOriginal) {
    cambios.latitud = formulario.latitud;
    cambios.longitud = formulario.longitud;
  }
  return cambios;
}
