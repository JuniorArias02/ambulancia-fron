import { z } from 'zod';

// Refleja la política del backend para validar antes de enviar; el backend sigue siendo la autoridad.
const LONGITUD_MINIMA = 10;
const LONGITUD_MAXIMA = 128;

export const esquemaCambioContrasena = z
  .object({
    contrasenaActual: z
      .string()
      .min(1, 'Ingresa tu contraseña actual.')
      .max(LONGITUD_MAXIMA, `La contraseña no puede superar ${LONGITUD_MAXIMA} caracteres.`),
    contrasenaNueva: z
      .string()
      .min(LONGITUD_MINIMA, `Debe tener al menos ${LONGITUD_MINIMA} caracteres.`)
      .max(LONGITUD_MAXIMA, `No puede superar ${LONGITUD_MAXIMA} caracteres.`)
      .regex(/^(?=.*\p{L})(?=.*\d).+$/u, 'Debe contener al menos una letra y un número.'),
    confirmacion: z.string().min(1, 'Confirma la nueva contraseña.'),
  })
  .refine((datos) => datos.contrasenaNueva === datos.confirmacion, {
    path: ['confirmacion'],
    message: 'Las contraseñas no coinciden.',
  })
  .refine((datos) => datos.contrasenaNueva !== datos.contrasenaActual, {
    path: ['contrasenaNueva'],
    message: 'La nueva contraseña debe ser diferente de la actual.',
  });

export type FormularioCambioContrasena = z.infer<typeof esquemaCambioContrasena>;
