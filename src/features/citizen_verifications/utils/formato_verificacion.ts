import type { DocumentoVerificacion, LadoDocumento } from '../types/verificacion.types';

/**
 * Agrupa los dígitos de tres en tres desde la derecha para leerlos contra la foto
 * (`88222333` → `88 222 333`). Los documentos con letras se dejan como vienen.
 */
export function agruparNumeroDocumento(numero: string): string {
  if (!/^\d+$/.test(numero)) return numero;
  return numero.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function leerFecha(fechaIso: string): { anio: number; mes: number; dia: number } | null {
  const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(fechaIso);
  if (!partes) return null;
  return { anio: Number(partes[1]), mes: Number(partes[2]), dia: Number(partes[3]) };
}

/** `1985-03-09` → `09/03/1985`, sin pasar por zonas horarias. */
export function formatearFechaNacimiento(fechaIso: string): string {
  const fecha = leerFecha(fechaIso);
  if (!fecha) return fechaIso;
  return `${String(fecha.dia).padStart(2, '0')}/${String(fecha.mes).padStart(2, '0')}/${fecha.anio}`;
}

/** Años cumplidos en el instante `ahora` (ms); `null` si la fecha no es válida. */
export function calcularEdad(fechaIso: string, ahora: number): number | null {
  const fecha = leerFecha(fechaIso);
  if (!fecha) return null;
  const hoy = new Date(ahora);
  const yaCumplio =
    hoy.getMonth() + 1 > fecha.mes || (hoy.getMonth() + 1 === fecha.mes && hoy.getDate() >= fecha.dia);
  const edad = hoy.getFullYear() - fecha.anio - (yaCumplio ? 0 : 1);
  return edad >= 0 ? edad : null;
}

/** El backend no garantiza el orden de las fotos: se ubican por lado. */
export function documentoPorLado(
  documentos: readonly DocumentoVerificacion[],
  lado: LadoDocumento,
): DocumentoVerificacion | undefined {
  return documentos.find((documento) => documento.lado === lado);
}
