import { describe, expect, it } from 'vitest';
import { ajustarAlTrazo, dividirTrazo, longitudesAcumuladas, proyectarSobreTrazo, puntoEnDistancia } from './geometria_trazo';

// Una "L": 0,001° hacia el norte (~111 m) y luego 0,001° hacia el este (~110 m) en Cúcuta.
const trazo = [
  { latitud: 7.89, longitud: -72.5 },
  { latitud: 7.891, longitud: -72.5 },
  { latitud: 7.891, longitud: -72.499 },
];

describe('geometría del trazo', () => {
  it('acumula la longitud de cada tramo', () => {
    const [inicio, codo, fin] = longitudesAcumuladas(trazo);
    expect(inicio).toBe(0);
    expect(codo).toBeCloseTo(111.2, 0);
    expect(fin).toBeCloseTo(221.4, 0);
  });

  it('proyecta un punto cercano sobre el tramo correcto', () => {
    const proyeccion = proyectarSobreTrazo({ latitud: 7.8905, longitud: -72.49997 }, trazo);
    expect(proyeccion?.punto.longitud).toBeCloseTo(-72.5, 6);
    expect(proyeccion?.punto.latitud).toBeCloseTo(7.8905, 6);
    expect(proyeccion?.distanciaRecorrida).toBeCloseTo(55.6, 0);
    expect(proyeccion?.distanciaAlTrazo).toBeCloseTo(3.3, 0);
  });

  it('ubica un punto a cierta distancia desde el inicio, también después del codo', () => {
    expect(puntoEnDistancia(trazo, 0)).toEqual(trazo[0]);
    expect(puntoEnDistancia(trazo, 166.3)?.longitud).toBeCloseTo(-72.4995, 4);
    expect(puntoEnDistancia(trazo, 10_000)).toEqual(trazo[2]);
  });

  it('divide en recorrido y restante sin dejar hueco', () => {
    const { recorrido, restante } = dividirTrazo(trazo, 55.6);
    expect(recorrido).toHaveLength(2);
    expect(restante).toHaveLength(3);
    expect(recorrido.at(-1)).toEqual(restante[0]);
  });
});

describe('ajustarAlTrazo', () => {
  it('pone el marcador sobre la ruta si el GPS está cerca', () => {
    const ajuste = ajustarAlTrazo({ latitud: 7.8905, longitud: -72.49997 }, trazo);
    expect(ajuste.sobreRuta).toBe(true);
    expect(ajuste.punto.longitud).toBeCloseTo(-72.5, 6);
  });

  it('lo deja donde está si se alejó de la ruta', () => {
    const lejos = { latitud: 7.8905, longitud: -72.4985 };
    const ajuste = ajustarAlTrazo(lejos, trazo);
    expect(ajuste.sobreRuta).toBe(false);
    expect(ajuste.punto).toEqual(lejos);
  });
});
