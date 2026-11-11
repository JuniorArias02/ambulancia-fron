import { describe, expect, it } from 'vitest';
import { esquemaCrearLista, esquemaOpcion } from './lista_chequeo.schema';

const valida = {
  nombre: 'Chequeo diario',
  descripcion: '',
  items: [{ pregunta: '¿Nivel de aceite?', obligatorio: true, permiteObservacion: true }],
  estados: [
    { nombre: 'Bien', valor: '2' },
    { nombre: 'Regular', valor: '' },
  ],
};

describe('esquemaCrearLista', () => {
  it('acepta una lista válida y convierte los puntajes', () => {
    const resultado = esquemaCrearLista.parse(valida);
    expect(resultado.estados).toEqual([
      { nombre: 'Bien', valor: 2 },
      { nombre: 'Regular', valor: null },
    ]);
  });

  it('exige al menos una pregunta y dos opciones', () => {
    expect(esquemaCrearLista.safeParse({ ...valida, items: [] }).success).toBe(false);
    expect(esquemaCrearLista.safeParse({ ...valida, estados: [{ nombre: 'Bien', valor: '' }] }).success).toBe(false);
  });

  it('rechaza preguntas u opciones repetidas sin importar mayúsculas', () => {
    const resultado = esquemaCrearLista.safeParse({
      ...valida,
      estados: [
        { nombre: 'Bien', valor: '' },
        { nombre: ' bien ', valor: '' },
      ],
    });
    expect(resultado.success).toBe(false);
    expect(resultado.error?.issues[0]?.path).toEqual(['estados', 1, 'nombre']);
  });

  it('el puntaje debe ser un entero', () => {
    expect(esquemaOpcion.safeParse({ nombre: 'Bien', valor: '2.5' }).success).toBe(false);
    expect(esquemaOpcion.parse({ nombre: 'Bien', valor: '-1' }).valor).toBe(-1);
  });
});
