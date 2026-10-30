import { describe, expect, it } from 'vitest';
import { finDelDia, inicioDelDia, textoDistancia } from './formato_emergencia';
import { haceTiempo, tiempoTranscurrido } from '../../../utils/tiempo_transcurrido';

const recibida = '2026-10-24T12:00:00.000Z';
const mas = (minutos: number) => new Date(recibida).getTime() + minutos * 60_000;

describe('tiempoTranscurrido', () => {
  it('resume el tiempo desde la recepción', () => {
    expect(tiempoTranscurrido(recibida, mas(0.5))).toBe('Ahora');
    expect(tiempoTranscurrido(recibida, mas(12))).toBe('12 min');
    expect(tiempoTranscurrido(recibida, mas(65))).toBe('1 h 05 min');
    expect(tiempoTranscurrido(recibida, mas(60 * 50))).toBe('2 d');
    expect(haceTiempo(recibida, mas(0))).toBe('hace un momento');
  });
});

describe('textoDistancia', () => {
  it('usa metros o kilómetros', () => {
    expect(textoDistancia(99.4)).toBe('a 99 m');
    expect(textoDistancia(1250)).toBe('a 1,3 km');
  });
});

describe('rango de fechas', () => {
  it('convierte un día local en su inicio y su fin', () => {
    const inicio = new Date(inicioDelDia('2026-10-24') ?? '');
    const fin = new Date(finDelDia('2026-10-24') ?? '');
    expect([inicio.getDate(), inicio.getHours(), inicio.getMinutes()]).toEqual([24, 0, 0]);
    expect([fin.getDate(), fin.getHours(), fin.getMinutes()]).toEqual([24, 23, 59]);
  });

  it('descarta días inexistentes', () => {
    expect(inicioDelDia('2026-02-30')).toBeUndefined();
  });
});
