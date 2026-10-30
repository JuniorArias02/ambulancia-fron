import { Ellipsis, type LucideIcon } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';

export interface AccionMenu {
  etiqueta: string;
  icono: LucideIcon;
  alSeleccionar: () => void;
  tono?: 'normal' | 'peligro';
}

interface PropiedadesMenuAcciones {
  etiqueta: string;
  acciones: AccionMenu[];
}

interface Posicion {
  superior: number;
  derecha: number;
}

const ANCHO_MENU = 224;

/** Menú contextual por registro; usa posición fija para no recortarse dentro de tablas. */
export function MenuAcciones({ etiqueta, acciones }: PropiedadesMenuAcciones) {
  const [posicion, setPosicion] = useState<Posicion | null>(null);
  const botonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const idMenu = useId();
  const abierto = posicion !== null;

  useEffect(() => {
    if (!abierto) return;
    const cerrar = () => setPosicion(null);
    const cerrarAlPulsarFuera = (evento: PointerEvent) => {
      const { target } = evento;
      if (
        target instanceof Node &&
        !menuRef.current?.contains(target) &&
        !botonRef.current?.contains(target)
      ) {
        cerrar();
      }
    };
    const cerrarConEscape = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') {
        cerrar();
        botonRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', cerrarAlPulsarFuera);
    document.addEventListener('keydown', cerrarConEscape);
    window.addEventListener('resize', cerrar);
    window.addEventListener('scroll', cerrar, true);
    menuRef.current?.querySelector('button')?.focus();
    return () => {
      document.removeEventListener('pointerdown', cerrarAlPulsarFuera);
      document.removeEventListener('keydown', cerrarConEscape);
      window.removeEventListener('resize', cerrar);
      window.removeEventListener('scroll', cerrar, true);
    };
  }, [abierto]);

  const alternar = () => {
    if (abierto) {
      setPosicion(null);
      return;
    }
    const rectangulo = botonRef.current?.getBoundingClientRect();
    if (!rectangulo) return;
    setPosicion({
      superior: rectangulo.bottom + 6,
      derecha: Math.max(window.innerWidth - rectangulo.right, 8),
    });
  };

  return (
    <>
      <button
        ref={botonRef}
        type="button"
        onClick={alternar}
        aria-label={etiqueta}
        title={etiqueta}
        aria-expanded={abierto}
        aria-controls={abierto ? idMenu : undefined}
        className={`flex size-9 items-center justify-center rounded-xl text-texto-secundario transition-colors duration-150 hover:bg-white hover:text-texto focus-visible:ring-2 focus-visible:ring-primario/40 focus-visible:outline-none ${abierto ? 'bg-white text-texto' : ''}`}
      >
        <Ellipsis aria-hidden strokeWidth={1.75} className="size-[18px]" />
      </button>

      {posicion && (
        <div
          ref={menuRef}
          id={idMenu}
          style={{ top: posicion.superior, right: posicion.derecha, width: ANCHO_MENU }}
          className="vidrio-fuerte fixed z-1500 rounded-2xl p-1.5"
        >
          {acciones.map(({ etiqueta: texto, icono: Icono, alSeleccionar, tono = 'normal' }) => (
            <button
              key={texto}
              type="button"
              onClick={() => {
                setPosicion(null);
                alSeleccionar();
              }}
              className={`flex h-10 w-full items-center gap-3 rounded-xl px-3 text-left text-sm transition-colors duration-150 focus-visible:outline-none ${
                tono === 'peligro'
                  ? 'text-critico hover:bg-critico/6 focus-visible:bg-critico/6'
                  : 'text-texto hover:bg-white focus-visible:bg-white'
              }`}
            >
              <Icono
                aria-hidden
                strokeWidth={1.75}
                className={`size-4 shrink-0 ${tono === 'peligro' ? '' : 'text-texto-secundario'}`}
              />
              {texto}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
