import {
  Ambulance,
  CalendarClock,
  ArrowLeftRight,
  Boxes,
  ClipboardCheck,
  Package,
  PackageOpen,
  SearchCheck,
  Warehouse,
  ListChecks,
  Hospital,
  IdCard,
  Route,
  LayoutDashboard,
  Users,
  PanelLeftClose,
  PanelLeftOpen,
  Siren,
  X,
  type LucideIcon,
} from 'lucide-react';
import { NavLink } from 'react-router';
import { entorno } from '../../config/entorno';
import { RUTAS } from '../../constants/rutas';
import type { NombreRol } from '../../types/rol.types';

interface ElementoNavegacion {
  etiqueta: string;
  ruta: string;
  icono: LucideIcon;
  /** Roles que ven el elemento; sin valor lo ven todos los que ven el grupo. */
  roles?: readonly NombreRol[];
}

interface GrupoNavegacion {
  titulo: string;
  elementos: ElementoNavegacion[];
  /** Roles que ven el grupo; sin valor lo ven todos. */
  roles?: readonly NombreRol[];
}

const GRUPOS_NAVEGACION: GrupoNavegacion[] = [
  {
    titulo: 'Operación',
    elementos: [
      { etiqueta: 'Inicio', ruta: RUTAS.inicio, icono: LayoutDashboard },
      {
        etiqueta: 'Emergencias',
        ruta: RUTAS.emergencias,
        icono: Siren,
        roles: ['administrador', 'despachador'],
      },
      {
        etiqueta: 'Servicios en curso',
        ruta: RUTAS.servicios,
        icono: Route,
        roles: ['administrador', 'despachador'],
      },
    ],
  },
  {
    titulo: 'Flota',
    roles: ['administrador', 'despachador'],
    elementos: [
      { etiqueta: 'Tripulaciones', ruta: RUTAS.turnos, icono: CalendarClock },
      { etiqueta: 'Ambulancias', ruta: RUTAS.ambulancias, icono: Ambulance },
      { etiqueta: 'Chequeos diarios', ruta: RUTAS.chequeosDiarios, icono: ClipboardCheck },
    ],
  },
  {
    titulo: 'Inventario',
    roles: ['administrador', 'despachador'],
    elementos: [
      { etiqueta: 'Resumen', ruta: RUTAS.inventario, icono: Package },
      { etiqueta: 'Existencias', ruta: RUTAS.existencias, icono: Boxes },
      { etiqueta: 'Movimientos', ruta: RUTAS.movimientos, icono: ArrowLeftRight },
      { etiqueta: 'Verificaciones', ruta: RUTAS.verificacionesInventario, icono: SearchCheck },
      { etiqueta: 'Catálogo', ruta: RUTAS.catalogoInventario, icono: PackageOpen },
      { etiqueta: 'Bodegas', ruta: RUTAS.bodegas, icono: Warehouse },
      { etiqueta: 'Perfiles de dotación', ruta: RUTAS.perfilesDotacion, icono: ListChecks },
    ],
  },
  {
    titulo: 'Red de salud',
    elementos: [{ etiqueta: 'Instituciones', ruta: RUTAS.instituciones, icono: Hospital }],
  },
  {
    titulo: 'Administración',
    roles: ['administrador'],
    elementos: [
      { etiqueta: 'Usuarios', ruta: RUTAS.usuarios, icono: Users },
      { etiqueta: 'Verificación de ciudadanos', ruta: RUTAS.verificaciones, icono: IdCard },
      { etiqueta: 'Listas de chequeo', ruta: RUTAS.listasChequeo, icono: ListChecks },
    ],
  },
];

interface PropiedadesBarraLateral {
  rolUsuario: NombreRol;
  /** Elementos pendientes por ruta (p. ej. solicitudes por revisar); 0 o sin valor no se muestra. */
  contadores?: Partial<Record<string, number>>;
  contraida: boolean;
  abiertaMovil: boolean;
  alAlternarContraccion: () => void;
  alCerrarMovil: () => void;
}

export function BarraLateral({
  rolUsuario,
  contadores = {},
  contraida,
  abiertaMovil,
  alAlternarContraccion,
  alCerrarMovil,
}: PropiedadesBarraLateral) {
  // En móvil el menú siempre se muestra expandido; la contracción aplica desde md.
  const ocultarEnContraida = contraida ? 'md:sr-only' : '';
  const etiquetaContraccion = contraida ? 'Expandir menú' : 'Contraer menú';
  const IconoContraccion = contraida ? PanelLeftOpen : PanelLeftClose;
  const puedeVer = ({ roles }: { roles?: readonly NombreRol[] }) =>
    !roles || roles.includes(rolUsuario);
  const gruposVisibles = GRUPOS_NAVEGACION.filter(puedeVer)
    .map((grupo) => ({ ...grupo, elementos: grupo.elementos.filter(puedeVer) }))
    .filter(({ elementos }) => elementos.length > 0);

  return (
    <>
      {abiertaMovil && (
        <div
          aria-hidden
          onClick={alCerrarMovil}
          className="fixed inset-0 z-1200 bg-institucional/10 backdrop-blur-[2px] md:hidden"
        />
      )}

      <aside
        id="barra-lateral"
        className={`fixed inset-y-3 left-3 z-1300 flex w-64 flex-col rounded-2xl transition-[transform,width] duration-200 ease-out md:static md:z-auto md:translate-x-0 ${
          abiertaMovil ? 'vidrio-fuerte translate-x-0' : 'vidrio -translate-x-[calc(100%+12px)]'
        } ${contraida ? 'md:w-[76px]' : 'md:w-64'}`}
      >
        <div className="flex h-16 shrink-0 items-center gap-3 px-5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primario text-white shadow-primario">
            <Ambulance aria-hidden strokeWidth={1.75} className="size-[18px]" />
          </span>
          <span
            className={`truncate text-[15px] font-semibold tracking-tight text-institucional ${ocultarEnContraida}`}
          >
            {entorno.nombreAplicacion}
          </span>
          <button
            type="button"
            onClick={alCerrarMovil}
            aria-label="Cerrar menú"
            className="ml-auto flex size-8 items-center justify-center rounded-lg text-texto-secundario hover:bg-white/70 hover:text-texto md:hidden"
          >
            <X aria-hidden strokeWidth={1.75} className="size-[18px]" />
          </button>
        </div>

        <div aria-hidden className="mx-5 h-px bg-linear-to-r from-transparent via-borde to-transparent" />

        <nav aria-label="Navegación principal" className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
          {gruposVisibles.map(({ titulo, elementos }) => (
            <div key={titulo} className="space-y-1">
              <p
                className={`px-3 pb-2 text-xs font-medium tracking-wide text-texto-secundario uppercase ${ocultarEnContraida}`}
              >
                {titulo}
              </p>
              {elementos.map(({ etiqueta, ruta, icono: Icono }) => {
                const contador = contadores[ruta] ?? 0;
                const textoContador = contador > 99 ? '99+' : String(contador);
                return (
                  <NavLink
                    key={ruta}
                    to={ruta}
                    // Rutas raíz: sin `end` quedarían activas en todas sus subrutas.
                    end={ruta === RUTAS.inicio || ruta === RUTAS.inventario}
                    onClick={alCerrarMovil}
                    title={contraida ? (contador > 0 ? `${etiqueta} (${contador})` : etiqueta) : undefined}
                    className={({ isActive }) =>
                      `flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-[background-color,color,box-shadow] duration-150 focus-visible:ring-2 focus-visible:ring-primario/40 focus-visible:outline-none ${
                        contraida ? 'md:justify-center md:px-0' : ''
                      } ${
                        isActive
                          ? 'bg-white/85 text-primario shadow-vidrio ring-1 ring-white'
                          : 'text-texto-secundario hover:bg-white/55 hover:text-texto'
                      }`
                    }
                  >
                    <span className="relative shrink-0">
                      <Icono aria-hidden strokeWidth={1.75} className="size-[18px]" />
                      {contador > 0 && contraida && (
                        <span aria-hidden className="absolute -top-1 -right-1 hidden size-2 rounded-full bg-critico ring-2 ring-white md:block" />
                      )}
                    </span>
                    <span className={`min-w-0 flex-1 leading-tight ${ocultarEnContraida}`}>{etiqueta}</span>
                    {contador > 0 && (
                      <span
                        className={`ml-auto shrink-0 rounded-full bg-critico/10 px-2 py-0.5 text-[11px] font-semibold text-critico tabular-nums ${ocultarEnContraida}`}
                      >
                        {textoContador}
                        <span className="sr-only"> por revisar</span>
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="hidden shrink-0 p-3 md:block">
          <button
            type="button"
            onClick={alAlternarContraccion}
            aria-label={etiquetaContraccion}
            aria-controls="barra-lateral"
            aria-expanded={!contraida}
            title={etiquetaContraccion}
            className={`flex h-10 w-full items-center gap-3 rounded-xl px-3 text-sm text-texto-secundario transition-colors duration-150 hover:bg-white/55 hover:text-texto focus-visible:ring-2 focus-visible:ring-primario/40 focus-visible:outline-none ${
              contraida ? 'justify-center px-0' : ''
            }`}
          >
            <IconoContraccion aria-hidden strokeWidth={1.75} className="size-[18px] shrink-0" />
            <span className={contraida ? 'sr-only' : ''}>{etiquetaContraccion}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
