import type { EntradaEmergencia, FormularioEmergencia } from '../schemas/emergencia.schema';
import type {
  DatosActualizarEmergencia,
  DatosCrearEmergencia,
  Emergencia,
} from '../types/emergencia.types';

/** Valores iniciales del formulario: los campos de texto no admiten `null`. */
export function valoresFormulario(emergencia: Emergencia | null): EntradaEmergencia {
  return {
    fuente: emergencia?.fuente ?? '',
    descripcion: emergencia?.descripcion ?? '',
    informanteNombre: emergencia?.informanteNombre ?? '',
    informanteTelefono: emergencia?.informanteTelefono ?? '',
    tipoIncidente: emergencia?.tipoIncidente ?? '',
    prioridad: emergencia?.prioridad ?? '',
    direccion: emergencia?.direccion ?? '',
    referenciaLugar: emergencia?.referenciaLugar ?? '',
    latitud: emergencia?.coordenadas ? String(emergencia.coordenadas.latitud) : '',
    longitud: emergencia?.coordenadas ? String(emergencia.coordenadas.longitud) : '',
    numeroVictimas:
      emergencia && emergencia.numeroVictimas !== null ? String(emergencia.numeroVictimas) : '',
  };
}

/** En el registro los datos vacíos se omiten en lugar de enviarse en `null`. */
export function construirDatosCreacion(formulario: FormularioEmergencia): DatosCrearEmergencia {
  const datos: DatosCrearEmergencia = {
    fuente: formulario.fuente,
    descripcion: formulario.descripcion,
  };
  if (formulario.informanteNombre !== null) datos.informanteNombre = formulario.informanteNombre;
  if (formulario.informanteTelefono !== null) datos.informanteTelefono = formulario.informanteTelefono;
  if (formulario.tipoIncidente !== null) datos.tipoIncidente = formulario.tipoIncidente;
  if (formulario.prioridad !== null) datos.prioridad = formulario.prioridad;
  if (formulario.direccion !== null) datos.direccion = formulario.direccion;
  if (formulario.referenciaLugar !== null) datos.referenciaLugar = formulario.referenciaLugar;
  if (formulario.latitud !== null && formulario.longitud !== null) {
    datos.latitud = formulario.latitud;
    datos.longitud = formulario.longitud;
  }
  if (formulario.numeroVictimas !== null) datos.numeroVictimas = formulario.numeroVictimas;
  return datos;
}

/**
 * Cuerpo del PATCH solo con lo que cambió; `null` borra el dato.
 * Las coordenadas se envían siempre juntas, como exige el backend.
 */
export function construirCambiosEmergencia(
  original: Emergencia,
  formulario: FormularioEmergencia,
): DatosActualizarEmergencia {
  const cambios: DatosActualizarEmergencia = {};
  if (formulario.fuente !== original.fuente) cambios.fuente = formulario.fuente;
  if (formulario.descripcion !== original.descripcion) cambios.descripcion = formulario.descripcion;
  if (formulario.informanteNombre !== original.informanteNombre) {
    cambios.informanteNombre = formulario.informanteNombre;
  }
  if (formulario.informanteTelefono !== original.informanteTelefono) {
    cambios.informanteTelefono = formulario.informanteTelefono;
  }
  if (formulario.tipoIncidente !== original.tipoIncidente) cambios.tipoIncidente = formulario.tipoIncidente;
  if (formulario.prioridad !== original.prioridad) cambios.prioridad = formulario.prioridad;
  if (formulario.direccion !== original.direccion) cambios.direccion = formulario.direccion;
  if (formulario.referenciaLugar !== original.referenciaLugar) {
    cambios.referenciaLugar = formulario.referenciaLugar;
  }
  if (formulario.numeroVictimas !== original.numeroVictimas) cambios.numeroVictimas = formulario.numeroVictimas;

  const latitudOriginal = original.coordenadas?.latitud ?? null;
  const longitudOriginal = original.coordenadas?.longitud ?? null;
  if (formulario.latitud !== latitudOriginal || formulario.longitud !== longitudOriginal) {
    cambios.latitud = formulario.latitud;
    cambios.longitud = formulario.longitud;
  }
  return cambios;
}
