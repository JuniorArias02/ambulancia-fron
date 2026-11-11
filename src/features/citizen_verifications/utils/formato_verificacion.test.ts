import { describe, expect, it } from 'vitest';
import type { DocumentoVerificacion } from '../types/verificacion.types';
import {
  agruparNumeroDocumento,
  calcularEdad,
  documentoPorLado,
  formatearFechaNacimiento,
} from './formato_verificacion';

describe('formato de la verificación', () => {
  it('agrupa los dígitos de tres en tres desde la derecha', () => {
    expect(agruparNumeroDocumento('88222333')).toBe('88 222 333');
    expect(agruparNumeroDocumento('1023456789')).toBe('1 023 456 789');
    expect(agruparNumeroDocumento('AB12345')).toBe('AB12345');
  });

  it('formatea la fecha de nacimiento sin desfase de zona horaria', () => {
    expect(formatearFechaNacimiento('1985-03-09')).toBe('09/03/1985');
  });

  it('calcula la edad según si ya cumplió años', () => {
    expect(calcularEdad('1985-03-09', new Date(2026, 2, 8).getTime())).toBe(40);
    expect(calcularEdad('1985-03-09', new Date(2026, 2, 9).getTime())).toBe(41);
    expect(calcularEdad('no-es-fecha', Date.now())).toBeNull();
  });

  it('ubica cada foto por lado, sin importar el orden', () => {
    const documentos: DocumentoVerificacion[] = [
      { id: 'p', lado: 'posterior', tipoMime: 'image/jpeg', tamanoBytes: 1, cargadoEn: '2026-11-03T03:14:38.749Z' },
      { id: 'f', lado: 'frontal', tipoMime: 'image/jpeg', tamanoBytes: 1, cargadoEn: '2026-11-03T03:14:38.749Z' },
    ];
    expect(documentoPorLado(documentos, 'frontal')?.id).toBe('f');
    expect(documentoPorLado(documentos, 'posterior')?.id).toBe('p');
    expect(documentoPorLado([], 'frontal')).toBeUndefined();
  });
});
