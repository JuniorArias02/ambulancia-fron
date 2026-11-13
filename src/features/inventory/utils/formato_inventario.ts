const formatoCantidad = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 3 });

/** Hasta 3 decimales, como los guarda el backend. */
export function formatearCantidad(cantidad: number): string {
  return formatoCantidad.format(cantidad);
}

/** `2027-01-10` → `10/01/2027`, sin pasar por zonas horarias. */
export function formatearDia(dia: string | null | undefined): string {
  if (!dia) return '—';
  const partes = /^(\d{4})-(\d{2})-(\d{2})/.exec(dia);
  return partes ? `${partes[3]}/${partes[2]}/${partes[1]}` : dia;
}

/** Día de hoy en la zona del navegador, `AAAA-MM-DD`. */
export function diaDeHoy(ahora: Date = new Date()): string {
  const mes = String(ahora.getMonth() + 1).padStart(2, '0');
  const dia = String(ahora.getDate()).padStart(2, '0');
  return `${ahora.getFullYear()}-${mes}-${dia}`;
}

/** Días entre hoy y `dia` (negativo si ya pasó). */
export function diasHasta(dia: string, hoy: string): number {
  const fecha = (texto: string) => {
    const [anio = 0, mes = 1, numero = 1] = texto.split('-').map(Number);
    return Date.UTC(anio, mes - 1, numero);
  };
  return Math.round((fecha(dia) - fecha(hoy)) / 86_400_000);
}

/** `vence en 5 días`, `venció hace 2 días`, `vence hoy`. */
export function textoPlazo(dia: string, hoy: string, verbo: { futuro: string; pasado: string; hoy: string }): string {
  const dias = diasHasta(dia, hoy);
  if (dias === 0) return verbo.hoy;
  const cantidad = `${Math.abs(dias)} ${Math.abs(dias) === 1 ? 'día' : 'días'}`;
  return dias > 0 ? `${verbo.futuro} en ${cantidad}` : `${verbo.pasado} hace ${cantidad}`;
}

/** Texto vacío → `null`, para los campos opcionales que la API acepta como `null`. */
export function textoONulo(valor: string | undefined | null): string | null {
  const limpio = valor?.trim();
  return limpio ? limpio : null;
}

/** Valores de un `<select>` de booleanos en la URL. */
export function leerBooleano(valor: string | undefined): boolean | undefined {
  return valor === 'true' ? true : valor === 'false' ? false : undefined;
}

export function deCatalogo<T extends string>(catalogo: readonly T[], valor: string | undefined): T | undefined {
  return catalogo.find((opcion) => opcion === valor);
}

export function leerPagina(valor: string | undefined): number {
  const pagina = Number(valor);
  return Number.isInteger(pagina) && pagina >= 1 ? pagina : 1;
}
