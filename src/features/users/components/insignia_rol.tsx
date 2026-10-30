import { ETIQUETAS_ROL } from '../../../constants/roles';
import type { NombreRol } from '../../../types/rol.types';

export function InsigniaRol({ rol }: { rol: NombreRol }) {
  return (
    <span className="inline-flex items-center rounded-lg bg-primario/8 px-2.5 py-1 text-xs font-medium whitespace-nowrap text-primario">
      {ETIQUETAS_ROL[rol]}
    </span>
  );
}
