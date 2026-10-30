import { IdCard, Mail, ShieldCheck, UserRound, type LucideIcon } from 'lucide-react';
import { ETIQUETAS_ROL } from '../../../constants/roles';
import type { PerfilUsuario } from '../types/perfil.types';

interface DatoPerfil {
  etiqueta: string;
  valor: string;
  icono: LucideIcon;
  monoespaciado?: boolean;
}

interface PropiedadesDatosPerfil {
  perfil: PerfilUsuario;
}

function construirDatos(perfil: PerfilUsuario): DatoPerfil[] {
  return [
    { etiqueta: 'Nombres', valor: perfil.nombres, icono: UserRound },
    { etiqueta: 'Apellidos', valor: perfil.apellidos, icono: UserRound },
    { etiqueta: 'Correo electrónico', valor: perfil.correo, icono: Mail },
    { etiqueta: 'Rol', valor: ETIQUETAS_ROL[perfil.rol], icono: ShieldCheck },
    { etiqueta: 'Identificador', valor: perfil.id, icono: IdCard, monoespaciado: true },
  ];
}

export function DatosPerfil({ perfil }: PropiedadesDatosPerfil) {
  return (
    <dl className="divide-y divide-borde/80">
      {construirDatos(perfil).map(({ etiqueta, valor, icono: Icono, monoespaciado }) => (
        <div key={etiqueta} className="grid gap-1 py-4 sm:grid-cols-[200px_1fr] sm:gap-6">
          <dt className="flex items-center gap-2.5 text-sm text-texto-secundario">
            <Icono aria-hidden strokeWidth={1.75} className="size-4 shrink-0" />
            {etiqueta}
          </dt>
          <dd
            className={`min-w-0 break-words text-[15px] font-medium text-texto ${
              monoespaciado ? 'font-mono text-[13px] font-normal text-texto-secundario' : ''
            }`}
          >
            {valor}
          </dd>
        </div>
      ))}
    </dl>
  );
}
