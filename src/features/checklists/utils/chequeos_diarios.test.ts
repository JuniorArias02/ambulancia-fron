import { describe, expect, it } from 'vitest';
import type { RespuestaChequeo } from '../types/chequeo_diario.types';
import { contarObservaciones, esNovedad, formatearDia } from './chequeos_diarios';

const respuesta = (estadoId: string, tieneObservacion = false): RespuestaChequeo => ({
  itemId: `item-${estadoId}`,
  pregunta: '¿Nivel de aceite?',
  estadoId,
  calificacion: estadoId,
  tieneObservacion,
  observacion: tieneObservacion ? 'Bajo' : null,
  respondidoEn: '2026-11-10T12:00:00.000Z',
});

describe('utilidades del historial', () => {
  it('una novedad es una observación o una calificación distinta de la mejor', () => {
    expect(esNovedad(respuesta('bien'), 'bien')).toBe(false);
    expect(esNovedad(respuesta('regular'), 'bien')).toBe(true);
    expect(esNovedad(respuesta('bien', true), 'bien')).toBe(true);
    // Sin conocer la escala, solo cuentan las observaciones.
    expect(esNovedad(respuesta('regular'), undefined)).toBe(false);
  });

  it('cuenta las respuestas con observación', () => {
    expect(contarObservaciones([respuesta('a', true), respuesta('b'), respuesta('c', true)])).toBe(2);
  });

  it('formatea el día sin desfase de zona horaria', () => {
    expect(formatearDia('2026-11-10')).toMatch(/10/);
    expect(formatearDia('no-es-dia')).toBe('no-es-dia');
  });
});
