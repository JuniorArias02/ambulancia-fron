import { CircleCheck, CircleSlash, Clock } from 'lucide-react';
import type { PerfilDotacion } from '../types/inventario.types';
import { Insignia } from './insignia';

/** Activo y vigente hoy: es el que rige. Activo fuera de su vigencia: aún no rige o ya terminó. */
export function InsigniaPerfil({ perfil }: { perfil: Pick<PerfilDotacion, 'activo' | 'vigenteHoy'> }) {
  if (!perfil.activo) {
    return (
      <Insignia tono="neutro" icono={CircleSlash}>
        Inactivo
      </Insignia>
    );
  }
  return perfil.vigenteHoy ? (
    <Insignia tono="exito" icono={CircleCheck}>
      Rige hoy
    </Insignia>
  ) : (
    <Insignia tono="advertencia" icono={Clock}>
      Activo, fuera de vigencia
    </Insignia>
  );
}
