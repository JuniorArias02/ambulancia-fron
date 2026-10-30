import { describe, expect, it } from 'vitest';
import { formatearPlaca, normalizarBusqueda, normalizarPlaca } from './formato_ambulancia';

describe('formatearPlaca', () => {
  it('separa letras y números', () => {
    expect(formatearPlaca('ABC123')).toBe('ABC 123');
  });
});

describe('normalizarPlaca', () => {
  it('quita espacios y guiones y pasa a mayúsculas', () => {
    expect(normalizarPlaca('abc 123')).toBe('ABC123');
    expect(normalizarPlaca('abc-123')).toBe('ABC123');
  });
});

describe('normalizarBusqueda', () => {
  it('convierte una placa con separador en la placa guardada', () => {
    expect(normalizarBusqueda('ABC 123')).toBe('ABC123');
    expect(normalizarBusqueda('abc-123')).toBe('ABC123');
  });

  it('conserva los guiones de un código', () => {
    expect(normalizarBusqueda('AMB-01')).toBe('AMB-01');
  });

  it('quita los espacios de búsquedas parciales', () => {
    expect(normalizarBusqueda(' ABC 1 ')).toBe('ABC1');
  });
});
