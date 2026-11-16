import { Ellipsis, type LucideIcon } from 'lucide-react';
import { Fragment, useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';

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

interface MenuAbierto {
  /** Rectángulo del botón al abrir, en coordenadas de la ventana. */
  ancla: DOMRect;
  /** Dónde se monta el menú: el diálogo que contiene el botón o el `body`. */
  contenedor: HTMLElement;
}

const ANCHO_MENU = 232;
const SEPARACION = 6;
const MARGEN_VENTANA = 8;

const limitar = (valor: number, minimo: number, maximo: number) =>
  Math.min(Math.max(valor, minimo), Math.max(minimo, maximo));

/**
 * Ubica el menú junto al botón: abajo si cabe, arriba si no, siempre dentro de la ventana.
 * Al final mide dónde quedó realmente y corrige: si un ancestro tiene `backdrop-filter` o
 * `transform`, `position: fixed` deja de referirse a la ventana y el menú quedaría desplazado.
 */
function posicionarMenu(menu: HTMLElement, ancla: DOMRect) {
  const alto = menu.offsetHeight;
  const ancho = menu.offsetWidth;
  const altoVentana = window.innerHeight;
  const espacioAbajo = altoVentana - ancla.bottom - MARGEN_VENTANA;
  const espacioArriba = ancla.top - MARGEN_VENTANA;
  const haciaArriba = espacioAbajo < alto + SEPARACION && espacioArriba > espacioAbajo;

  const superior = limitar(
    haciaArriba ? ancla.top - SEPARACION - alto : ancla.bottom + SEPARACION,
    MARGEN_VENTANA,
    altoVentana - alto - MARGEN_VENTANA,
  );
  const izquierda = limitar(ancla.right - ancho, MARGEN_VENTANA, window.innerWidth - ancho - MARGEN_VENTANA);

  menu.style.top = `${superior}px`;
  menu.style.left = `${izquierda}px`;
  const real = menu.getBoundingClientRect();
  menu.style.top = `${superior + (superior - real.top)}px`;
  menu.style.left = `${izquierda + (izquierda - real.left)}px`;
  menu.style.transformOrigin = haciaArriba ? 'bottom right' : 'top right';
  menu.style.visibility = 'visible';
}

const claseOpcion = {
  normal:
    'text-texto hover:bg-primario/10 hover:text-primario focus:bg-primario/10 focus:text-primario',
  peligro: 'text-critico hover:bg-critico/10 focus:bg-critico/10',
} as const;

const claseIcono = {
  normal: 'text-texto-secundario group-hover:text-primario group-focus:text-primario',
  peligro: 'text-critico',
} as const;

/** Menú contextual por registro: se abre junto al botón, con mouse o con teclado. */
export function MenuAcciones({ etiqueta, acciones }: PropiedadesMenuAcciones) {
  const [abiertoEn, setAbiertoEn] = useState<MenuAbierto | null>(null);
  const botonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const idMenu = useId();
  const abierto = abiertoEn !== null;

  useLayoutEffect(() => {
    if (abiertoEn && menuRef.current) posicionarMenu(menuRef.current, abiertoEn.ancla);
  }, [abiertoEn]);

  useEffect(() => {
    if (!abierto) return;
    const cerrar = () => setAbiertoEn(null);
    const cerrarAlPulsarFuera = (evento: PointerEvent) => {
      const { target } = evento;
      if (target instanceof Node && !menuRef.current?.contains(target) && !botonRef.current?.contains(target)) {
        cerrar();
      }
    };
    // Se cierra al desplazar la página, pero no al desplazar dentro del propio menú.
    const cerrarAlDesplazar = (evento: Event) => {
      if (!(evento.target instanceof Node && menuRef.current?.contains(evento.target))) cerrar();
    };
    document.addEventListener('pointerdown', cerrarAlPulsarFuera);
    window.addEventListener('resize', cerrar);
    window.addEventListener('scroll', cerrarAlDesplazar, true);
    opcionesMenu(menuRef.current)[0]?.focus();
    return () => {
      document.removeEventListener('pointerdown', cerrarAlPulsarFuera);
      window.removeEventListener('resize', cerrar);
      window.removeEventListener('scroll', cerrarAlDesplazar, true);
    };
  }, [abierto]);

  const cerrarYVolver = () => {
    setAbiertoEn(null);
    botonRef.current?.focus();
  };

  const alternar = () => {
    if (abierto) {
      setAbiertoEn(null);
      return;
    }
    const boton = botonRef.current;
    if (!boton) return;
    setAbiertoEn({
      ancla: boton.getBoundingClientRect(),
      // Dentro de un diálogo modal el menú debe montarse en él para quedar por encima.
      contenedor: boton.closest('dialog') ?? document.body,
    });
  };

  const abrirConTeclado = (evento: KeyboardEvent<HTMLButtonElement>) => {
    if (evento.key === 'ArrowDown' && !abierto) {
      evento.preventDefault();
      alternar();
    }
  };

  const navegar = (evento: KeyboardEvent<HTMLDivElement>) => {
    if (evento.key === 'Escape') {
      // Evita que también se cierre el diálogo que contiene la tabla.
      evento.preventDefault();
      evento.stopPropagation();
      cerrarYVolver();
      return;
    }
    if (evento.key === 'Tab') {
      setAbiertoEn(null);
      return;
    }
    const opciones = opcionesMenu(menuRef.current);
    const actual = opciones.findIndex((opcion) => opcion === document.activeElement);
    const destino: Record<string, number> = {
      ArrowDown: (actual + 1) % opciones.length,
      ArrowUp: (actual - 1 + opciones.length) % opciones.length,
      Home: 0,
      End: opciones.length - 1,
    };
    const indice = destino[evento.key];
    if (indice === undefined) return;
    evento.preventDefault();
    opciones[indice]?.focus();
  };

  return (
    <>
      <button
        ref={botonRef}
        type="button"
        onClick={alternar}
        onKeyDown={abrirConTeclado}
        aria-label={etiqueta}
        title={etiqueta}
        aria-haspopup="menu"
        aria-expanded={abierto}
        aria-controls={abierto ? idMenu : undefined}
        className={`flex size-9 items-center justify-center rounded-xl transition-colors duration-150 hover:bg-primario/10 hover:text-primario focus-visible:ring-2 focus-visible:ring-primario/40 focus-visible:outline-none ${
          abierto ? 'bg-primario/10 text-primario' : 'text-texto-secundario'
        }`}
      >
        <Ellipsis aria-hidden strokeWidth={1.75} className="size-[18px]" />
      </button>

      {abiertoEn &&
        createPortal(
          <div
            ref={menuRef}
            id={idMenu}
            role="menu"
            aria-label={etiqueta}
            onKeyDown={navegar}
            // Oculto hasta que `posicionarMenu` lo ubica, para que no parpadee en otro lugar.
            style={{ width: ANCHO_MENU, top: 0, left: 0, visibility: 'hidden' }}
            className="vidrio-fuerte animar-menu fixed z-1500 max-h-[calc(100dvh-16px)] overflow-y-auto rounded-2xl p-1.5"
          >
            {acciones.map(({ etiqueta: texto, icono: Icono, alSeleccionar, tono = 'normal' }, indice) => {
              // Las acciones de riesgo quedan separadas del resto para no pulsarlas por error.
              const separar = tono === 'peligro' && indice > 0 && acciones[indice - 1]?.tono !== 'peligro';
              return (
                <Fragment key={texto}>
                  {separar && <div role="separator" className="mx-2 my-1 h-px bg-borde/80" />}
                  <button
                    type="button"
                    role="menuitem"
                    tabIndex={-1}
                    // Pasar el puntero enfoca la opción: el mouse y el teclado resaltan lo mismo.
                    onPointerMove={(evento) => evento.currentTarget.focus({ preventScroll: true })}
                    onClick={() => {
                      setAbiertoEn(null);
                      alSeleccionar();
                    }}
                    className={`group flex h-10 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-medium transition-colors duration-100 focus:outline-none ${claseOpcion[tono]}`}
                  >
                    <Icono
                      aria-hidden
                      strokeWidth={1.75}
                      className={`size-4 shrink-0 transition-colors duration-100 ${claseIcono[tono]}`}
                    />
                    <span className="truncate">{texto}</span>
                  </button>
                </Fragment>
              );
            })}
          </div>,
          abiertoEn.contenedor,
        )}
    </>
  );
}

function opcionesMenu(menu: HTMLElement | null): HTMLElement[] {
  return menu ? Array.from(menu.querySelectorAll<HTMLElement>('[role="menuitem"]')) : [];
}
