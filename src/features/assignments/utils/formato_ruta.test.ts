import { describe, expect, it } from 'vitest';
import { rutaDePrueba } from '../../../test/datos_prueba';
import type { Asignacion, EstadoAsignacion } from '../types/asignacion.types';
import {
  rutasVigentesPorAmbulancia,
  textoDistanciaRuta,
  textoDuracion,
  trazoDeRuta,
} from './formato_ruta';

const asignacion = (id: string, estado: EstadoAsignacion): Asignacion => ({
  id,
  emergenciaId: 'em-1',
  numeroEmergencia: 'EMG-20261024-0007',
  ambulanciaId: 'amb-1',
  ambulanciaCodigo: 'AMB-02',
  turnoId: null,
  estado,
  siguientesEstados: [],
  motivoCancelacion: null,
  asignadaPor: null,
  asignadaEn: '2026-10-24T23:51:00.000Z',
  salidaEn: null,
  llegadaEscenaEn: null,
  atencionInicioEn: null,
  salidaEscenaEn: null,
  llegadaDestinoEn: null,
  finalizadaEn: null,
});

describe('textos de la ruta', () => {
  it('muestra distancia y una duración siempre aproximada', () => {
    expect(textoDistanciaRuta(2532)).toBe('2,5 km');
    expect(textoDistanciaRuta(850)).toBe('850 m');
    expect(textoDuracion(229)).toBe('≈ 4 min');
    expect(textoDuracion(20)).toBe('≈ 1 min');
    expect(textoDuracion(3900)).toBe('≈ 1 h 05 min');
  });
});

describe('trazoDeRuta', () => {
  it('lee el orden GeoJSON [longitud, latitud]', () => {
    expect(trazoDeRuta(rutaDePrueba)).toEqual([
      { latitud: 7.893516, longitud: -72.507726 },
      { latitud: 7.907, longitud: -72.497 },
    ]);
  });
});

describe('rutasVigentesPorAmbulancia', () => {
  it('muestra la ruta mientras el servicio está asignado o en camino', () => {
    const vigentes = rutasVigentesPorAmbulancia([rutaDePrueba], new Map([['amb-1', asignacion('asig-1', 'en_camino')]]));
    expect(vigentes.get('amb-1')).toBe(rutaDePrueba);
  });

  it('la quita al llegar a la escena o si la ruta es de otro servicio', () => {
    expect(rutasVigentesPorAmbulancia([rutaDePrueba], new Map([['amb-1', asignacion('asig-1', 'en_escena')]])).size).toBe(0);
    expect(rutasVigentesPorAmbulancia([rutaDePrueba], new Map([['amb-1', asignacion('otra', 'en_camino')]])).size).toBe(0);
  });
});
