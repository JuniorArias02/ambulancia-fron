import { ZONA_COLOMBIA } from './formato_clinico';

const formatoDia = new Intl.DateTimeFormat('en-CA', {
  timeZone: ZONA_COLOMBIA,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** Día `AAAA-MM-DD` de Colombia para un instante. */
export function diaColombia(fecha: Date): string {
  return formatoDia.format(fecha);
}

/** Suma días a un `AAAA-MM-DD` sin depender de la zona del navegador. */
export function sumarDias(dia: string, dias: number): string {
  const [anio = 0, mes = 1, numero = 1] = dia.split('-').map(Number);
  const fecha = new Date(Date.UTC(anio, mes - 1, numero + dias));
  return fecha.toISOString().slice(0, 10);
}

export type AtajoRango = 'hoy' | 'ayer' | 'ultimos_7' | 'ultimos_30' | 'este_mes' | 'mes_anterior';

export const ATAJOS_RANGO: readonly { valor: AtajoRango; texto: string }[] = [
  { valor: 'hoy', texto: 'Hoy' },
  { valor: 'ayer', texto: 'Ayer' },
  { valor: 'ultimos_7', texto: 'Últimos 7 días' },
  { valor: 'este_mes', texto: 'Este mes' },
  { valor: 'mes_anterior', texto: 'Mes anterior' },
];

/** Los indicadores abren con los últimos 30 días, como el backend. */
export const ATAJOS_INDICADORES: readonly { valor: AtajoRango; texto: string }[] = [
  { valor: 'ultimos_7', texto: 'Últimos 7 días' },
  { valor: 'ultimos_30', texto: 'Últimos 30 días' },
  { valor: 'este_mes', texto: 'Este mes' },
  { valor: 'mes_anterior', texto: 'Mes anterior' },
];

export interface RangoDias {
  desde: string;
  hasta: string;
}

export function rangoDeAtajo(atajo: AtajoRango, ahora: Date = new Date()): RangoDias {
  const hoy = diaColombia(ahora);
  const inicioMes = `${hoy.slice(0, 8)}01`;
  switch (atajo) {
    case 'hoy':
      return { desde: hoy, hasta: hoy };
    case 'ayer': {
      const ayer = sumarDias(hoy, -1);
      return { desde: ayer, hasta: ayer };
    }
    case 'ultimos_7':
      return { desde: sumarDias(hoy, -6), hasta: hoy };
    case 'ultimos_30':
      return { desde: sumarDias(hoy, -29), hasta: hoy };
    case 'este_mes':
      return { desde: inicioMes, hasta: hoy };
    case 'mes_anterior': {
      const finAnterior = sumarDias(inicioMes, -1);
      return { desde: `${finAnterior.slice(0, 8)}01`, hasta: finAnterior };
    }
  }
}

/** Qué atajo corresponde a un rango, para marcarlo como elegido. */
export function atajoDeRango(
  rango: RangoDias,
  ahora: Date = new Date(),
  atajos: readonly { valor: AtajoRango }[] = ATAJOS_RANGO,
): AtajoRango | null {
  return atajos.find(({ valor }) => {
    const candidato = rangoDeAtajo(valor, ahora);
    return candidato.desde === rango.desde && candidato.hasta === rango.hasta;
  })?.valor ?? null;
}

export const PATRON_DIA = /^\d{4}-\d{2}-\d{2}$/;
