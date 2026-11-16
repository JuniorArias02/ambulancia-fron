import { z } from 'zod';
import { ROLES_INTERNOS } from '../../../types/rol.types';
import { ESTADOS_USUARIO } from '../constants/estados_usuario';

// Refleja las validaciones del backend para guiar al usuario; el backend sigue siendo la autoridad.
const PATRON_TELEFONO = /^\+?[0-9\s-]{7,20}$/;

const nombres = z
  .string()
  .trim()
  .min(1, 'Ingresa los nombres.')
  .max(100, 'Máximo 100 caracteres.');

const apellidos = z
  .string()
  .trim()
  .min(1, 'Ingresa los apellidos.')
  .max(100, 'Máximo 100 caracteres.');

/** Vacío significa "sin teléfono". */
const telefono = z
  .string()
  .trim()
  .refine((valor) => valor === '' || PATRON_TELEFONO.test(valor), {
    message: 'De 7 a 20 caracteres: dígitos, espacios, guiones y + inicial.',
  });

/** La misma política de contraseñas de todo el sistema. */
const contrasena = z
  .string()
  .min(10, 'Debe tener al menos 10 caracteres.')
  .max(128, 'No puede superar 128 caracteres.')
  .regex(/^(?=.*\p{L})(?=.*\d).+$/u, 'Debe contener al menos una letra y un número.');

export const esquemaCrearUsuario = z.object({
  nombres,
  apellidos,
  correo: z
    .string()
    .trim()
    .min(1, 'Ingresa el correo electrónico.')
    .max(150, 'Máximo 150 caracteres.')
    .pipe(z.email('Ingresa un correo electrónico válido.')),
  telefono,
  contrasena,
  // El selector empieza vacío (''); al validar solo se acepta un rol real.
  rol: z
    .union([z.literal(''), z.enum(ROLES_INTERNOS)])
    .pipe(z.enum(ROLES_INTERNOS, { message: 'Selecciona un rol.' })),
});

export type EntradaCrearUsuario = z.input<typeof esquemaCrearUsuario>;
export type FormularioCrearUsuario = z.output<typeof esquemaCrearUsuario>;

export const esquemaEditarUsuario = z.object({ nombres, apellidos, telefono });

export type FormularioEditarUsuario = z.infer<typeof esquemaEditarUsuario>;

export const esquemaCambioEstado = z.object({
  estado: z.enum(ESTADOS_USUARIO, { message: 'Selecciona el nuevo estado.' }),
  motivo: z
    .string()
    .trim()
    .min(5, 'Describe el motivo con al menos 5 caracteres.')
    .max(255, 'Máximo 255 caracteres.'),
});

export type FormularioCambioEstado = z.infer<typeof esquemaCambioEstado>;

/** La confirmación solo se valida aquí: al backend se envía únicamente `contrasenaNueva`. */
export const esquemaRestablecerContrasena = z
  .object({
    contrasenaNueva: contrasena,
    confirmacion: z.string().min(1, 'Confirma la contraseña.'),
  })
  .refine((datos) => datos.contrasenaNueva === datos.confirmacion, {
    path: ['confirmacion'],
    message: 'Las contraseñas no coinciden.',
  });

export type FormularioRestablecerContrasena = z.infer<typeof esquemaRestablecerContrasena>;

export const esquemaDesactivarFirma = z.object({
  motivo: z
    .string()
    .trim()
    .min(5, 'Describe el motivo con al menos 5 caracteres.')
    .max(255, 'Máximo 255 caracteres.'),
});

export type FormularioDesactivarFirma = z.infer<typeof esquemaDesactivarFirma>;
