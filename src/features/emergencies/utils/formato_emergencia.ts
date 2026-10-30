const PATRON_DIA = /^(\d{4})-(\d{2})-(\d{2})$/;

const formatoKilometros = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 1 });

function leerDia(dia: string): [number, number, number] | null {
  const partes = PATRON_DIA.exec(dia);
  if (!partes) return null;
  const [, anio, mes, diaMes] = partes.map(Number);
  if (anio === undefined || mes === undefined || diaMes === undefined) return null;
  const fecha = new Date(anio, mes - 1, diaMes);
  return fecha.getMonth() === mes - 1 ? [anio, mes - 1, diaMes] : null;
}

export function esDiaValido(dia: string): boolean {
  return leerDia(dia) !== null;
}

/** `AAAA-MM-DD` local → instante ISO del inicio de ese día en la zona del navegador. */
export function inicioDelDia(dia: string): string | undefined {
  const partes = leerDia(dia);
  return partes ? new Date(...partes, 0, 0, 0, 0).toISOString() : undefined;
}

export function finDelDia(dia: string): string | undefined {
  const partes = leerDia(dia);
  return partes ? new Date(...partes, 23, 59, 59, 999).toISOString() : undefined;
}

export function textoDistancia(metros: number): string {
  return metros < 1000 ? `a ${Math.round(metros)} m` : `a ${formatoKilometros.format(metros / 1000)} km`;
}
