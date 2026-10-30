import { z } from 'zod';

export const esquemaInicioSesion = z.object({
  correo: z
    .string()
    .trim()
    .min(1, 'Ingresa tu correo electrónico.')
    .max(150, 'El correo no puede superar 150 caracteres.')
    .pipe(z.email('Ingresa un correo electrónico válido.')),
  contrasena: z
    .string()
    .min(1, 'Ingresa tu contraseña.')
    .max(128, 'La contraseña no puede superar 128 caracteres.'),
});

export type FormularioInicioSesion = z.infer<typeof esquemaInicioSesion>;
