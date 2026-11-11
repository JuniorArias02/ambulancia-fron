import { describe, expect, it } from 'vitest';
import type { OpcionLista } from '../types/lista_chequeo.types';
import { aDatosCrearLista, mejorOpcion, moverElemento, separarPorActividad } from './listas_chequeo';

const opcion = (id: string, valor: number | null, orden: number, activo = true): OpcionLista => ({
  id,
  nombre: id,
  valor,
  orden,
  activo,
});

describe('utilidades de las listas', () => {
  it('separa activos e inactivos, cada uno por orden', () => {
    const { activos, inactivos } = separarPorActividad([opcion('c', 0, 2), opcion('a', 2, 0, false), opcion('b', 1, 1)]);
    expect(activos.map(({ id }) => id)).toEqual(['b', 'c']);
    expect(inactivos.map(({ id }) => id)).toEqual(['a']);
  });

  it('mueve un activo y deja los inactivos al final', () => {
    const activos = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
    expect(moverElemento(activos, [{ id: 'x' }], 1, -1)).toEqual(['b', 'a', 'c', 'x']);
    expect(moverElemento(activos, [], 2, 1)).toBeNull();
  });

  it('la mejor opción es la activa de mayor puntaje; sin puntajes, la primera', () => {
    expect(mejorOpcion([opcion('regular', 1, 0), opcion('bien', 2, 1), opcion('excelente', 5, 2, false)])?.id).toBe('bien');
    expect(mejorOpcion([opcion('b', null, 1), opcion('a', null, 0)])?.id).toBe('a');
  });

  it('arma el cuerpo de creación sin descripción ni puntajes vacíos', () => {
    expect(
      aDatosCrearLista({
        nombre: 'Chequeo diario',
        descripcion: '',
        items: [{ pregunta: '¿Nivel de aceite?', obligatorio: true, permiteObservacion: false }],
        estados: [
          { nombre: 'Bien', valor: 2 },
          { nombre: 'Regular', valor: null },
        ],
      }),
    ).toEqual({
      nombre: 'Chequeo diario',
      items: [{ pregunta: '¿Nivel de aceite?', obligatorio: true, permiteObservacion: false }],
      estados: [{ nombre: 'Bien', valor: 2 }, { nombre: 'Regular' }],
    });
  });
});
