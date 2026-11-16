import type { SignoVital } from '../types/historia_clinica.types';

/** Solo ayuda visual para un adulto: no es un diagnóstico. */
export type NivelSigno = 'normal' | 'advertencia' | 'critico';

export const SIGNOS_EVALUABLES = [
  'presionSistolica',
  'frecuenciaCardiaca',
  'frecuenciaRespiratoria',
  'saturacionOxigeno',
  'glasgowTotal',
  'temperatura',
] as const;

export type SignoEvaluable = (typeof SIGNOS_EVALUABLES)[number];

interface Rango {
  /** Límite inferior incluido y superior excluido de lo normal. */
  normal: [number, number];
  /** Fuera de este intervalo es crítico; entre este y lo normal, advertencia. */
  advertencia: [number, number];
}

/** Intervalos semiabiertos `[mínimo, máximo)`, para que los decimales caigan en un solo nivel. */
const RANGOS: Record<SignoEvaluable, Rango> = {
  presionSistolica: { normal: [90, 140], advertencia: [80, 180] },
  frecuenciaCardiaca: { normal: [60, 101], advertencia: [50, 121] },
  frecuenciaRespiratoria: { normal: [12, 21], advertencia: [9, 30] },
  saturacionOxigeno: { normal: [94, Infinity], advertencia: [90, Infinity] },
  glasgowTotal: { normal: [15, Infinity], advertencia: [13, Infinity] },
  temperatura: { normal: [36, 38], advertencia: [35, 39] },
};

const dentro = (valor: number, [minimo, maximo]: [number, number]) => valor >= minimo && valor < maximo;

export function nivelSigno(signo: SignoEvaluable, valor: number | null): NivelSigno | null {
  if (valor === null) return null;
  const { normal, advertencia } = RANGOS[signo];
  if (dentro(valor, normal)) return 'normal';
  return dentro(valor, advertencia) ? 'advertencia' : 'critico';
}

/** El rango normal, para dibujarlo como banda de referencia. */
export function rangoNormal(signo: SignoEvaluable): [number, number] {
  return RANGOS[signo].normal;
}

/** Los signos fuera de rango de una toma, para resaltar la fila. */
export function signosFueraDeRango(toma: SignoVital): SignoEvaluable[] {
  return SIGNOS_EVALUABLES.filter((signo) => {
    const nivel = nivelSigno(signo, toma[signo]);
    return nivel !== null && nivel !== 'normal';
  });
}
