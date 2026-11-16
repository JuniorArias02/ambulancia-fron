import { describe, expect, it } from 'vitest';
import { dominioConMarcas, escalaLineal, indiceMasCercano, tramos } from './geometria_grafica';

describe('geometría de la gráfica', () => {
  it('escala lineal', () => {
    const x = escalaLineal([0, 10], [0, 100]);
    expect(x(5)).toBe(50);
  });

  it('el dominio incluye la banda normal y tiene marcas redondas', () => {
    const { dominio, marcas } = dominioConMarcas([130, 145], [60, 101]);
    expect(dominio[0]).toBeLessThanOrEqual(60);
    expect(dominio[1]).toBeGreaterThanOrEqual(145);
    expect(marcas.every((marca) => marca % 10 === 0)).toBe(true);
  });

  it('la saturación llega hasta 100 con su banda 94–100', () => {
    const { dominio } = dominioConMarcas([88, 92], [94, 100]);
    expect(dominio).toEqual([85, 100]);
  });

  it('un valor nulo corta la línea', () => {
    expect(tramos([1, null, 2, 3], (v) => v !== null)).toEqual([[1], [2, 3]]);
  });

  it('elige el punto más cercano', () => {
    expect(indiceMasCercano([0, 50, 100], 60)).toBe(1);
  });
});
