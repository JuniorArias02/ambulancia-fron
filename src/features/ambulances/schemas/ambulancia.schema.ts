import { z } from 'zod';
import { ESTADOS_MANUALES } from '../constants/estados_operativos';
import { normalizarCodigo, normalizarPlaca } from '../utils/formato_ambulancia';

// Refleja las validaciones del backend para guiar al usuario; el backend sigue siendo la autoridad.
export const PATRON_CODIGO = /^[A-Za-z0-9-]{2,30}$/;
export const PATRON_PLACA = /^[A-Za-z]{3}[\s-]?\d{3}$/;

export const LONGITUD_MAXIMA_MOTIVO = 255;

export const esquemaAmbulancia = z.object({
  codigo: z
    .string()
    .trim()
    .min(1, 'Ingresa el código.')
    .regex(PATRON_CODIGO, 'De 2 a 30 caracteres: letras, números y guiones.')
    .transform(normalizarCodigo),
  placa: z
    .string()
    .trim()
    .min(1, 'Ingresa la placa.')
    .regex(PATRON_PLACA, '3 letras y 3 números, por ejemplo ABC 123.')
    .transform(normalizarPlaca),
  tipoAmbulanciaId: z.string().min(1, 'Selecciona el tipo de ambulancia.'),
});

export type EntradaAmbulancia = z.input<typeof esquemaAmbulancia>;
export type FormularioAmbulancia = z.output<typeof esquemaAmbulancia>;

export const esquemaCambioEstadoAmbulancia = z.object({
  // Empieza sin selección (''); al validar solo se acepta un estado manual.
  estado: z
    .union([z.literal(''), z.enum(ESTADOS_MANUALES)])
    .pipe(z.enum(ESTADOS_MANUALES, { message: 'Selecciona el nuevo estado.' })),
  motivo: z
    .string()
    .trim()
    .min(5, 'Describe el motivo con al menos 5 caracteres.')
    .max(LONGITUD_MAXIMA_MOTIVO, `Máximo ${LONGITUD_MAXIMA_MOTIVO} caracteres.`),
});

export type EntradaCambioEstadoAmbulancia = z.input<typeof esquemaCambioEstadoAmbulancia>;
export type FormularioCambioEstadoAmbulancia = z.output<typeof esquemaCambioEstadoAmbulancia>;
