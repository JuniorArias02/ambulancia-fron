import { claseEstadoEntrada } from '../../../components/forms/estilos_campo';

/** Entrada compacta para las filas de preguntas y opciones. */
export function claseEntradaFila(conError: boolean): string {
  return `campo-vidrio h-10 w-full rounded-xl px-3 text-sm text-texto placeholder:text-texto-secundario/80 transition-[border-color,box-shadow,background-color] duration-150 focus:bg-white focus:ring-4 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 ${claseEstadoEntrada(conError)}`;
}

export const claseBotonPrimario =
  'inline-flex h-10 items-center gap-2 rounded-xl bg-primario px-4 text-sm font-semibold text-white shadow-primario transition-colors duration-150 hover:bg-primario-hover focus-visible:ring-4 focus-visible:ring-primario/25 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:hover:bg-primario';

export const claseBotonSecundario =
  'campo-vidrio inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-medium text-texto transition-colors duration-150 hover:bg-white focus-visible:ring-4 focus-visible:ring-primario/15 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white/70';

export const claseBotonIcono =
  'flex size-8 shrink-0 items-center justify-center rounded-lg text-texto-secundario transition-colors duration-150 hover:bg-white hover:text-texto focus-visible:ring-2 focus-visible:ring-primario/40 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent';
