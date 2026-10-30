import type { FormularioEditarUsuario } from '../schemas/usuario.schema';
import type { DatosActualizarUsuario, Usuario } from '../types/usuario.types';

/** Construye el cuerpo del PATCH solo con los campos que cambiaron. */
export function construirCambiosUsuario(
  original: Usuario,
  formulario: FormularioEditarUsuario,
): DatosActualizarUsuario {
  const cambios: DatosActualizarUsuario = {};
  if (formulario.nombres !== original.nombres) cambios.nombres = formulario.nombres;
  if (formulario.apellidos !== original.apellidos) cambios.apellidos = formulario.apellidos;

  const telefonoNuevo = formulario.telefono === '' ? null : formulario.telefono;
  if (telefonoNuevo !== original.telefono) cambios.telefono = telefonoNuevo;

  return cambios;
}

/** Quita el teléfono vacío para no enviar un valor que el backend rechazaría. */
export function limpiarTelefono(telefono: string): string | undefined {
  return telefono === '' ? undefined : telefono;
}
