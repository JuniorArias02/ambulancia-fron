import { ETIQUETAS_CAMPO } from '../constants/catalogos_clinicos';

/** Todas las horas se muestran en hora de Colombia, sin importar la zona del navegador. */
export const ZONA_COLOMBIA = 'America/Bogota';

const formatoPartes = new Intl.DateTimeFormat('es-CO', {
  timeZone: ZONA_COLOMBIA,
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
});

const CLAVES_PARTES = ['day', 'month', 'year', 'hour', 'minute', 'second'] as const;
type ClaveParte = (typeof CLAVES_PARTES)[number];
type Partes = Record<ClaveParte, string>;

const esClaveParte = (tipo: string): tipo is ClaveParte => CLAVES_PARTES.some((clave) => clave === tipo);

function partesColombia(fecha: Date): Partes {
  const partes: Partes = { day: '', month: '', year: '', hour: '', minute: '', second: '' };
  for (const { type, value } of formatoPartes.formatToParts(fecha)) {
    if (esClaveParte(type)) partes[type] = value;
  }
  return partes;
}

function fechaValida(iso: string): Date | null {
  const fecha = new Date(iso);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
}

/** `25/10/2026 10:02`, o con segundos para las líneas de tiempo del servicio. */
export function formatearFechaHora(iso: string, conSegundos = false): string {
  const fecha = fechaValida(iso);
  if (!fecha) return 'Fecha no válida';
  const p = partesColombia(fecha);
  return `${p.day}/${p.month}/${p.year} ${p.hour}:${p.minute}${conSegundos ? `:${p.second}` : ''}`;
}

/** Solo el día, `25/10/2026`, en hora de Colombia. */
export function formatearFecha(iso: string): string {
  const fecha = fechaValida(iso);
  if (!fecha) return 'Fecha no válida';
  const p = partesColombia(fecha);
  return `${p.day}/${p.month}/${p.year}`;
}

export function formatearHora(iso: string, conSegundos = false): string {
  const fecha = fechaValida(iso);
  if (!fecha) return '—';
  const p = partesColombia(fecha);
  return `${p.hour}:${p.minute}${conSegundos ? `:${p.second}` : ''}`;
}

/** Es la medianoche UTC del día: se lee la fecha sin convertir la zona horaria. */
export function formatearFechaNacimiento(iso: string): string {
  const fecha = fechaValida(iso);
  if (!fecha) return 'Fecha no válida';
  const dia = String(fecha.getUTCDate()).padStart(2, '0');
  const mes = String(fecha.getUTCMonth() + 1).padStart(2, '0');
  return `${dia}/${mes}/${fecha.getUTCFullYear()}`;
}

/** `90` → `1:30`; `3132` → `52:12`; `495492` → `5 d 17:38:12`. */
export function formatearDuracion(segundos: number | null): string {
  if (segundos === null || !Number.isFinite(segundos) || segundos < 0) return '—';
  const total = Math.round(segundos);
  const dias = Math.floor(total / 86_400);
  const horas = Math.floor((total % 86_400) / 3600);
  const minutos = Math.floor((total % 3600) / 60);
  const resto = total % 60;
  const dos = (valor: number) => String(valor).padStart(2, '0');
  if (dias > 0) return `${dias} d ${dos(horas)}:${dos(minutos)}:${dos(resto)}`;
  if (horas > 0) return `${horas}:${dos(minutos)}:${dos(resto)}`;
  return `${minutos}:${dos(resto)}`;
}

export function textoEdad(anios: number | null): string | null {
  if (anios === null) return null;
  if (anios < 1) return 'Menor de 1 año';
  return `${anios} ${anios === 1 ? 'año' : 'años'}`;
}

interface NombrePaciente {
  identificado: boolean;
  nombres: string | null;
  apellidos: string | null;
}

/** `null` si es un NN o no tiene nombre registrado. */
export function nombrePaciente({ identificado, nombres, apellidos }: NombrePaciente): string | null {
  const nombre = [nombres, apellidos].filter((parte) => parte && parte.trim() !== '').join(' ');
  return identificado && nombre !== '' ? nombre : null;
}

export function textoDocumento(tipo: string | null, numero: string | null): string | null {
  if (!numero) return null;
  return tipo ? `${tipo} ${numero}` : numero;
}

/** Los primeros 12 caracteres de la huella del cierre, en mayúsculas. */
export function codigoVerificacion(hashCierre: string): string {
  return hashCierre.slice(0, 12).toUpperCase();
}

/** `mecanismoLesion` → `Mecanismo lesion`, si no tiene una etiqueta propia. */
export function etiquetaCampo(campo: string): string {
  const conocida = ETIQUETAS_CAMPO[campo];
  if (conocida) return conocida;
  const palabras = campo.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/_/g, ' ').toLowerCase();
  return palabras.charAt(0).toUpperCase() + palabras.slice(1);
}

/** Vacío o solo espacios cuenta como "Sin dato". */
export function tieneDato(valor: string | number | null | undefined): boolean {
  if (valor === null || valor === undefined) return false;
  return typeof valor === 'number' || valor.trim() !== '';
}

/** Años cumplidos a la fecha de la atención, como los calcula el backend en la bandeja. */
export function edadAlAtender(fechaNacimiento: string | null, atencion: string): number | null {
  if (!fechaNacimiento) return null;
  const nacimiento = fechaValida(fechaNacimiento);
  const referencia = fechaValida(atencion);
  if (!nacimiento || !referencia) return null;
  let edad = referencia.getUTCFullYear() - nacimiento.getUTCFullYear();
  const mes = referencia.getUTCMonth() - nacimiento.getUTCMonth();
  if (mes < 0 || (mes === 0 && referencia.getUTCDate() < nacimiento.getUTCDate())) edad -= 1;
  return Math.max(0, edad);
}
