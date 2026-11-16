import { ETIQUETAS_DESENLACE, TRIAGE } from '../constants/catalogos_clinicos';
import type { DetalleHistoria } from '../types/historia_clinica.types';
import { tieneDato } from './formato_clinico';

export type ClaseAlerta = 'alergias' | 'riesgo_caida' | 'rechazo' | 'triage';

export interface AlertaHistoria {
  clase: ClaseAlerta;
  titulo: string;
  detalle?: string;
  tono: 'critico' | 'advertencia';
}

/** Lo que el lector debe ver de inmediato; solo aparece si aplica. */
export function alertasDeHistoria({ datos, valoracionesDownton }: DetalleHistoria): AlertaHistoria[] {
  const alertas: AlertaHistoria[] = [];
  if (tieneDato(datos.alergias) && datos.alergias) {
    alertas.push({ clase: 'alergias', titulo: 'Alergias', detalle: datos.alergias, tono: 'critico' });
  }
  if (datos.triage === 'rojo' || datos.triage === 'negro') {
    alertas.push({ clase: 'triage', titulo: `Triage ${TRIAGE[datos.triage].etiqueta.toLowerCase()}`, tono: 'critico' });
  }
  if (valoracionesDownton.some((valoracion) => valoracion.nivelRiesgo === 'alto')) {
    alertas.push({ clase: 'riesgo_caida', titulo: 'Riesgo de caída alto', tono: 'advertencia' });
  }
  if (datos.desenlace === 'rechazo_traslado') {
    alertas.push({ clase: 'rechazo', titulo: ETIQUETAS_DESENLACE.rechazo_traslado, tono: 'critico' });
  }
  return alertas;
}
