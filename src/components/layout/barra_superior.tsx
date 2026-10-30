import { Menu } from 'lucide-react';
import type { ReactNode } from 'react';
import type { PerfilUsuario } from '../../features/profile/types/perfil.types';
import { MenuUsuario } from './menu_usuario';

interface PropiedadesBarraSuperior {
  titulo: string | null;
  usuario: PerfilUsuario;
  menuMovilAbierto: boolean;
  alAbrirMenuMovil: () => void;
  alCerrarSesion: () => Promise<void>;
  /** Indicadores de estado junto al perfil (p. ej. la conexión en tiempo real). */
  indicadores?: ReactNode;
}

export function BarraSuperior({
  titulo,
  usuario,
  menuMovilAbierto,
  alAbrirMenuMovil,
  alCerrarSesion,
  indicadores,
}: PropiedadesBarraSuperior) {
  return (
    <header className="vidrio relative z-1100 flex h-16 shrink-0 items-center gap-3 rounded-2xl px-3 sm:px-5">
      <button
        type="button"
        onClick={alAbrirMenuMovil}
        aria-label="Abrir menú"
        aria-controls="barra-lateral"
        aria-expanded={menuMovilAbierto}
        className="flex size-10 items-center justify-center rounded-xl text-texto-secundario hover:bg-white/70 hover:text-texto md:hidden"
      >
        <Menu aria-hidden strokeWidth={1.75} className="size-5" />
      </button>

      {titulo && (
        <h1 className="truncate text-lg font-semibold tracking-tight text-texto">{titulo}</h1>
      )}

      <div className="ml-auto flex items-center gap-2">
        {indicadores}
        <MenuUsuario usuario={usuario} alCerrarSesion={alCerrarSesion} />
      </div>
    </header>
  );
}
