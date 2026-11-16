import { describe, expect, it } from 'vitest';
import {
  codigoVerificacion,
  etiquetaCampo,
  formatearDuracion,
  formatearFechaHora,
  formatearFechaNacimiento,
  nombrePaciente,
  textoEdad,
} from './formato_clinico';
import { atajoDeRango, rangoDeAtajo } from './rangos_fecha';
import { nivelSigno } from './rangos_signos';

describe('formato clínico', () => {
  it('muestra las fechas en hora de Colombia', () => {
    expect(formatearFechaHora('2026-10-25T15:02:11.000Z')).toBe('25/10/2026 10:02');
    expect(formatearFechaHora('2026-10-25T15:02:11.000Z', true)).toBe('25/10/2026 10:02:11');
    // A las 2 a. m. UTC todavía es el día anterior en Colombia.
    expect(formatearFechaHora('2026-10-30T02:27:25.479Z')).toBe('29/10/2026 21:27');
  });

  it('la fecha de nacimiento no se corre de día', () => {
    expect(formatearFechaNacimiento('1990-11-15T00:00:00.000Z')).toBe('15/11/1990');
  });

  it('formatea duraciones como la guía', () => {
    expect(formatearDuracion(90)).toBe('1:30');
    expect(formatearDuracion(3132)).toBe('52:12');
    expect(formatearDuracion(3725)).toBe('1:02:05');
    expect(formatearDuracion(495492)).toBe('5 d 17:38:12');
    expect(formatearDuracion(null)).toBe('—');
  });

  it('edad, nombre y código de verificación', () => {
    expect(textoEdad(0)).toBe('Menor de 1 año');
    expect(textoEdad(1)).toBe('1 año');
    expect(textoEdad(34)).toBe('34 años');
    expect(nombrePaciente({ identificado: true, nombres: 'Juan Carlos', apellidos: 'Pérez' })).toBe('Juan Carlos Pérez');
    expect(nombrePaciente({ identificado: false, nombres: 'Juan', apellidos: null })).toBeNull();
    expect(codigoVerificacion('42256fcfceca9f2c00')).toBe('42256FCFCECA');
  });

  it('nombra los campos de la trazabilidad', () => {
    expect(etiquetaCampo('triage')).toBe('Triage');
    expect(etiquetaCampo('mecanismoLesion')).toBe('Mecanismo lesion');
  });
});

describe('rangos de fecha', () => {
  // 14 de noviembre de 2026, 1 a. m. en Colombia.
  const ahora = new Date('2026-11-14T06:00:00.000Z');

  it('calcula los atajos en días de Colombia', () => {
    expect(rangoDeAtajo('hoy', ahora)).toEqual({ desde: '2026-11-14', hasta: '2026-11-14' });
    expect(rangoDeAtajo('ayer', ahora)).toEqual({ desde: '2026-11-13', hasta: '2026-11-13' });
    expect(rangoDeAtajo('ultimos_7', ahora)).toEqual({ desde: '2026-11-08', hasta: '2026-11-14' });
    expect(rangoDeAtajo('este_mes', ahora)).toEqual({ desde: '2026-11-01', hasta: '2026-11-14' });
    expect(rangoDeAtajo('mes_anterior', ahora)).toEqual({ desde: '2026-10-01', hasta: '2026-10-31' });
  });

  it('reconoce el atajo de un rango', () => {
    expect(atajoDeRango({ desde: '2026-11-08', hasta: '2026-11-14' }, ahora)).toBe('ultimos_7');
    expect(atajoDeRango({ desde: '2026-11-02', hasta: '2026-11-14' }, ahora)).toBeNull();
  });
});

describe('rangos de signos vitales', () => {
  it('clasifica según la tabla de referencia', () => {
    expect(nivelSigno('presionSistolica', 120)).toBe('normal');
    expect(nivelSigno('presionSistolica', 85)).toBe('advertencia');
    expect(nivelSigno('presionSistolica', 180)).toBe('critico');
    expect(nivelSigno('frecuenciaCardiaca', 101)).toBe('advertencia');
    expect(nivelSigno('frecuenciaCardiaca', 121)).toBe('critico');
    expect(nivelSigno('frecuenciaRespiratoria', 8)).toBe('critico');
    expect(nivelSigno('frecuenciaRespiratoria', 9)).toBe('advertencia');
    expect(nivelSigno('saturacionOxigeno', 94)).toBe('normal');
    expect(nivelSigno('saturacionOxigeno', 89)).toBe('critico');
    expect(nivelSigno('glasgowTotal', 14)).toBe('advertencia');
    expect(nivelSigno('glasgowTotal', 12)).toBe('critico');
    expect(nivelSigno('temperatura', 37.9)).toBe('normal');
    expect(nivelSigno('temperatura', 38.5)).toBe('advertencia');
    expect(nivelSigno('temperatura', 34.9)).toBe('critico');
    expect(nivelSigno('temperatura', null)).toBeNull();
  });
});
