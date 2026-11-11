import { ETIQUETAS_ROL } from '../../../constants/roles';
import type { NombreRol } from '../../../types/rol.types';

/** El ciudadano (usuario de la app) se distingue del personal. */
export function InsigniaRol({ rol }: { rol: NombreRol }) {
  const clases = rol === 'ciudadano' ? 'bg-cian/12 text-cian-texto' : 'bg-primario/8 text-primario';
  return (
    <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium whitespace-nowrap ${clases}`}>
      {ETIQUETAS_ROL[rol]}
    </span>
  );
}
