import type { TipoAmbulancia } from '../types/ambulancia.types';

const PATRON_PLACA_COMPLETA = /^[A-Za-z]{3}[\s-]\d{3}$/;

/** `ABC123` → `ABC 123`. */
export function formatearPlaca(placa: string): string {
  return placa.length === 6 ? `${placa.slice(0, 3)} ${placa.slice(3)}` : placa;
}

/** Igual que el backend: sin espacios ni guiones y en mayúsculas. */
export function normalizarPlaca(placa: string): string {
  return placa.replace(/[\s-]/g, '').toUpperCase();
}

export function normalizarCodigo(codigo: string): string {
  return codigo.trim().toUpperCase();
}

/**
 * La placa se guarda sin separadores, así que `ABC 123` debe buscarse como `ABC123`.
 * Los guiones solo se quitan en una placa completa para no romper códigos como `AMB-01`.
 */
export function normalizarBusqueda(texto: string): string {
  const limpio = texto.trim();
  return PATRON_PLACA_COMPLETA.test(limpio) ? normalizarPlaca(limpio) : limpio.replace(/\s/g, '');
}

/** `TAM — Transporte Asistencial Medicalizado`. */
export function textoTipoAmbulancia(tipo: TipoAmbulancia): string {
  return tipo.descripcion ? `${tipo.nombre} — ${tipo.descripcion}` : tipo.nombre;
}
