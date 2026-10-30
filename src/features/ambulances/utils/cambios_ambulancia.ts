import type { FormularioAmbulancia } from '../schemas/ambulancia.schema';
import type { Ambulancia, DatosActualizarAmbulancia } from '../types/ambulancia.types';

/** Construye el cuerpo del PATCH solo con los campos que cambiaron. */
export function construirCambiosAmbulancia(
  original: Ambulancia,
  formulario: FormularioAmbulancia,
): DatosActualizarAmbulancia {
  const cambios: DatosActualizarAmbulancia = {};
  if (formulario.codigo !== original.codigo) cambios.codigo = formulario.codigo;
  if (formulario.placa !== original.placa) cambios.placa = formulario.placa;
  if (formulario.tipoAmbulanciaId !== original.tipo.id) {
    cambios.tipoAmbulanciaId = formulario.tipoAmbulanciaId;
  }
  return cambios;
}

/** El `409` dice si el duplicado es el código o la placa; se muestra en ese campo. */
export function campoDuplicado(mensaje: string): 'codigo' | 'placa' {
  return /placa/i.test(mensaje) ? 'placa' : 'codigo';
}
