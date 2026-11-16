import { generatePath } from 'react-router';
import { RUTAS } from '../../../constants/rutas';

export const rutaExpediente = (id: string) => generatePath(RUTAS.expediente, { id });
export const rutaIngreso = (numero: string) => generatePath(RUTAS.ingreso, { numero });
export const rutaFichaPaciente = (id: string) => generatePath(RUTAS.fichaPaciente, { id });
