import { z } from 'zod';
import { FUNCIONES, MAXIMO_INTEGRANTES, MINIMO_INTEGRANTES } from '../constants/turnos';

// Refleja las reglas del backend para guiar al usuario; el backend sigue siendo la autoridad.
export const esquemaTurno = z
  .object({
    ambulanciaId: z.string().min(1, 'Selecciona la ambulancia.'),
    integrantes: z
      .array(
        z.object({
          funcion: z.enum(FUNCIONES),
          usuarioId: z.string().min(1, 'Selecciona a la persona.'),
        }),
      )
      .min(MINIMO_INTEGRANTES, `La tripulación necesita al menos ${MINIMO_INTEGRANTES} personas.`)
      .max(MAXIMO_INTEGRANTES, `La tripulación admite máximo ${MAXIMO_INTEGRANTES} personas.`),
  })
  .superRefine(({ integrantes }, contexto) => {
    const tieneConductor = integrantes.some(({ funcion }) => funcion === 'conductor');
    const tieneAsistencial = integrantes.some(({ funcion }) => funcion !== 'conductor');
    if (!tieneConductor || !tieneAsistencial) {
      contexto.addIssue({
        code: 'custom',
        path: ['integrantes'],
        message: 'La tripulación necesita un conductor y al menos un paramédico o médico.',
      });
    }

    const vistos = new Set<string>();
    integrantes.forEach(({ usuarioId }, indice) => {
      if (!usuarioId) return;
      if (vistos.has(usuarioId)) {
        contexto.addIssue({
          code: 'custom',
          path: ['integrantes', indice, 'usuarioId'],
          message: 'Esta persona ya está en la tripulación.',
        });
      }
      vistos.add(usuarioId);
    });
  });

export type FormularioTurno = z.infer<typeof esquemaTurno>;
