import { z } from 'zod';
import {
  catalogoOpcional,
  latitud,
  longitud,
  telefonoOpcional,
  textoOpcional,
  validarCoordenadasJuntas,
} from '../../../schemas/campos.schema';
import { NIVELES_COMPLEJIDAD } from '../constants/instituciones';

export const esquemaInstitucion = z
  .object({
    nombre: z.string().trim().min(1, 'Ingresa el nombre.').max(180, 'Máximo 180 caracteres.'),
    codigoHabilitacion: textoOpcional(50),
    nivelComplejidad: catalogoOpcional(NIVELES_COMPLEJIDAD),
    telefono: telefonoOpcional(),
    direccion: textoOpcional(255),
    latitud: latitud(),
    longitud: longitud(),
  })
  .superRefine(validarCoordenadasJuntas);

export type EntradaInstitucion = z.input<typeof esquemaInstitucion>;
export type FormularioInstitucion = z.output<typeof esquemaInstitucion>;
