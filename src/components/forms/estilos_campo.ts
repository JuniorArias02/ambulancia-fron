export const claseEntrada =
  'campo-vidrio h-12 w-full rounded-xl pl-11 text-[15px] text-texto placeholder:text-texto-secundario/80 transition-[border-color,box-shadow,background-color] duration-150 focus:bg-white focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60';

export function claseEstadoEntrada(conError: boolean): string {
  return conError
    ? 'border-critico/60! focus:border-critico! focus:ring-critico/12'
    : 'hover:border-primario/30! focus:border-primario/60! focus:ring-primario/12';
}

/** Ids de los textos que describen un campo, para `aria-describedby`. */
export function idsDescripcion(id: string, conError: boolean, conAyuda: boolean): string | undefined {
  const ids = [conError && `error-${id}`, conAyuda && `ayuda-${id}`].filter(Boolean);
  return ids.length > 0 ? ids.join(' ') : undefined;
}
