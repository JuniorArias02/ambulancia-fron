import { ChevronDown, LoaderCircle, LogOut, Mail, ShieldCheck, UserRound } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router';
import { RUTAS } from '../../constants/rutas';
import { ETIQUETAS_ROL } from '../../constants/roles';
import type { PerfilUsuario } from '../../features/profile/types/perfil.types';
import { obtenerIniciales } from '../../utils/iniciales';

interface PropiedadesMenuUsuario {
  usuario: PerfilUsuario;
  alCerrarSesion: () => Promise<void>;
}

export function MenuUsuario({ usuario, alCerrarSesion }: PropiedadesMenuUsuario) {
  const [abierto, setAbierto] = useState(false);
  const [cerrando, setCerrando] = useState(false);
  const contenedorRef = useRef<HTMLDivElement>(null);
  const idPanel = useId();
  const nombreCompleto = `${usuario.nombres} ${usuario.apellidos}`;
  const rol = ETIQUETAS_ROL[usuario.rol];

  useEffect(() => {
    if (!abierto) return;
    const cerrarAlPulsarFuera = (evento: PointerEvent) => {
      const { target } = evento;
      if (target instanceof Node && !contenedorRef.current?.contains(target)) setAbierto(false);
    };
    const cerrarConEscape = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') setAbierto(false);
    };
    document.addEventListener('pointerdown', cerrarAlPulsarFuera);
    document.addEventListener('keydown', cerrarConEscape);
    return () => {
      document.removeEventListener('pointerdown', cerrarAlPulsarFuera);
      document.removeEventListener('keydown', cerrarConEscape);
    };
  }, [abierto]);

  const cerrarSesion = async () => {
    setCerrando(true);
    try {
      await alCerrarSesion();
    } finally {
      setCerrando(false);
    }
  };

  return (
    <div ref={contenedorRef} className="relative">
      <button
        type="button"
        onClick={() => setAbierto((actual) => !actual)}
        aria-expanded={abierto}
        aria-controls={idPanel}
        aria-label={`Perfil de ${nombreCompleto}`}
        className={`flex items-center gap-3 rounded-xl py-1.5 pr-2.5 pl-1.5 transition-colors duration-150 hover:bg-white/70 focus-visible:ring-2 focus-visible:ring-primario/40 focus-visible:outline-none ${abierto ? 'bg-white/70' : ''}`}
      >
        <span
          aria-hidden
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-primario to-cian text-[13px] font-semibold text-white ring-2 ring-white"
        >
          {obtenerIniciales(usuario.nombres, usuario.apellidos)}
        </span>
        <span className="hidden min-w-0 text-left sm:block">
          <span className="block max-w-48 truncate text-sm font-medium text-texto">
            {nombreCompleto}
          </span>
          <span className="block text-xs text-texto-secundario">{rol}</span>
        </span>
        <ChevronDown
          aria-hidden
          strokeWidth={1.75}
          className={`hidden size-4 text-texto-secundario transition-transform duration-150 sm:block ${abierto ? 'rotate-180' : ''}`}
        />
      </button>

      {abierto && (
        <div
          id={idPanel}
          className="vidrio-fuerte absolute top-full right-0 z-1100 mt-2 w-72 rounded-2xl p-2"
        >
          <div className="px-3 pt-2 pb-3">
            <p className="truncate text-sm font-semibold text-texto">{nombreCompleto}</p>
            <p className="mt-1 flex items-center gap-2 text-[13px] text-texto-secundario">
              <Mail aria-hidden strokeWidth={1.75} className="size-3.5 shrink-0" />
              <span className="truncate">{usuario.correo}</span>
            </p>
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primario/8 px-2.5 py-1 text-xs font-medium text-primario">
              <ShieldCheck aria-hidden strokeWidth={1.75} className="size-3.5" />
              {rol}
            </span>
          </div>
          <div className="space-y-0.5 border-t border-borde/80 pt-2">
            <Link
              to={RUTAS.perfil}
              onClick={() => setAbierto(false)}
              className="flex h-10 w-full items-center gap-3 rounded-xl px-3 text-sm text-texto transition-colors duration-150 hover:bg-white focus-visible:ring-2 focus-visible:ring-primario/40 focus-visible:outline-none"
            >
              <UserRound aria-hidden strokeWidth={1.75} className="size-4 text-texto-secundario" />
              Mi perfil
            </Link>
            <button
              type="button"
              onClick={() => void cerrarSesion()}
              disabled={cerrando}
              className="flex h-10 w-full items-center gap-3 rounded-xl px-3 text-sm text-texto transition-colors duration-150 hover:bg-white focus-visible:ring-2 focus-visible:ring-primario/40 focus-visible:outline-none disabled:opacity-60"
            >
              {cerrando ? (
                <LoaderCircle aria-hidden className="size-4 animate-spin text-texto-secundario" />
              ) : (
                <LogOut aria-hidden strokeWidth={1.75} className="size-4 text-texto-secundario" />
              )}
              {cerrando ? 'Cerrando sesión…' : 'Cerrar sesión'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
