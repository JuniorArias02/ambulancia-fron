import { ShieldCheck } from 'lucide-react';
import { ETIQUETAS_ROL } from '../../../constants/roles';
import type { PerfilUsuario } from '../types/perfil.types';
import { obtenerIniciales } from '../../../utils/iniciales';

interface PropiedadesEncabezadoPerfil {
  perfil: PerfilUsuario;
}

export function EncabezadoPerfil({ perfil }: PropiedadesEncabezadoPerfil) {
  return (
    <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
      <span
        aria-hidden
        className="flex size-20 shrink-0 items-center justify-center rounded-3xl bg-linear-to-br from-primario to-cian text-2xl font-semibold text-white shadow-primario ring-4 ring-white"
      >
        {obtenerIniciales(perfil.nombres, perfil.apellidos)}
      </span>
      <div className="min-w-0">
        <h2 className="text-2xl font-semibold tracking-tight text-texto">
          {perfil.nombres} {perfil.apellidos}
        </h2>
        <p className="mt-1 truncate text-[15px] text-texto-secundario">{perfil.correo}</p>
        <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primario/8 px-3 py-1 text-[13px] font-medium text-primario">
          <ShieldCheck aria-hidden strokeWidth={1.75} className="size-4" />
          {ETIQUETAS_ROL[perfil.rol]}
        </span>
      </div>
    </div>
  );
}
