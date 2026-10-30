import { describe, expect, it } from 'vitest';
import type { Ambulancia } from '../../ambulances/types/ambulancia.types';
import type { Asignacion } from '../types/asignacion.types';
import { senalUbicacion, textoSenal } from '../../ambulances/utils/senal_ubicacion';
import { ordenarCandidatas } from './candidatas_despacho';
import { etiquetaEvento, minutosDeRespuesta, pasosAsignacion } from './pasos_asignacion';

const base: Asignacion = {
  id: 'a1',
  emergenciaId: 'e1',
  numeroEmergencia: 'EMG-20261024-0004',
  ambulanciaId: 'amb-1',
  ambulanciaCodigo: 'AMB-01',
  turnoId: 't1',
  estado: 'asignada',
  siguientesEstados: ['en_camino'],
  motivoCancelacion: null,
  asignadaPor: null,
  asignadaEn: '2026-10-24T14:30:00.000Z',
  salidaEn: null,
  llegadaEscenaEn: null,
  atencionInicioEn: null,
  salidaEscenaEn: null,
  llegadaDestinoEn: null,
  finalizadaEn: null,
};

const claves = (asignacion: Asignacion) => pasosAsignacion(asignacion).map(({ clave }) => clave);

describe('pasosAsignacion', () => {
  it('muestra el ciclo completo mientras el servicio está en curso', () => {
    expect(claves(base)).toEqual(['asignada', 'en_camino', 'en_escena', 'atendiendo', 'trasladando', 'destino', 'finalizada']);
  });

  it('un cierre sin traslado no muestra el traslado ni la entrega', () => {
    expect(claves({ ...base, estado: 'finalizada', finalizadaEn: '2026-10-24T15:10:00.000Z' })).toEqual([
      'asignada',
      'en_camino',
      'en_escena',
      'atendiendo',
      'finalizada',
    ]);
  });

  it('una cancelada antes de salir no muestra la salida', () => {
    expect(claves({ ...base, estado: 'cancelada' })).toEqual(['asignada', 'cancelada']);
  });
});

describe('etiquetaEvento', () => {
  it('distingue la entrega del paciente de un cierre sin traslado', () => {
    expect(etiquetaEvento({ estadoAnterior: 'trasladando', estadoNuevo: 'finalizada' })).toBe('Paciente entregado');
    expect(etiquetaEvento({ estadoAnterior: 'atendiendo', estadoNuevo: 'finalizada' })).toBe('Cerrado sin traslado');
    expect(etiquetaEvento({ estadoAnterior: 'atendiendo', estadoNuevo: 'trasladando' })).toBe('Paciente a bordo');
    expect(etiquetaEvento({ estadoAnterior: null, estadoNuevo: 'asignada' })).toBe('Despachada');
  });
});

describe('minutosDeRespuesta', () => {
  it('mide de la asignación a la llegada a la escena', () => {
    expect(minutosDeRespuesta(base)).toBeNull();
    expect(minutosDeRespuesta({ ...base, llegadaEscenaEn: '2026-10-24T14:42:05.000Z' })).toBe(12);
  });
});

const ahora = new Date('2026-10-24T14:00:00.000Z').getTime();
const ambulancia = (codigo: string, ubicacion: Ambulancia['ultimaUbicacion']): Ambulancia => ({
  id: codigo,
  codigo,
  placa: 'ABC123',
  tipo: { id: 'tam', nombre: 'TAM', descripcion: null },
  estadoOperativo: 'disponible',
  ultimaUbicacion: ubicacion,
  creadaEn: '2026-10-01T00:00:00.000Z',
});

describe('ordenarCandidatas', () => {
  it('ordena por cercanía y deja al final las que no tienen ubicación', () => {
    const reciente = '2026-10-24T13:59:00.000Z';
    const candidatas = ordenarCandidatas(
      [
        ambulancia('AMB-03', null),
        ambulancia('AMB-02', { latitud: 7.95, longitud: -72.5, registradaEn: reciente }),
        ambulancia('AMB-01', { latitud: 7.9, longitud: -72.5, registradaEn: reciente }),
      ],
      { latitud: 7.89, longitud: -72.5 },
      ahora,
    );
    expect(candidatas.map(({ ambulancia: { codigo } }) => codigo)).toEqual(['AMB-01', 'AMB-02', 'AMB-03']);
    expect(candidatas[0]?.distanciaMetros).toBeCloseTo(1112, -1);
  });

  it('clasifica la antigüedad de la posición: menos de 2 min, de 2 a 10 min y más de 10 min', () => {
    const hace = (minutos: number) => ({
      latitud: 0,
      longitud: 0,
      registradaEn: new Date(ahora - minutos * 60_000).toISOString(),
    });
    expect(senalUbicacion(hace(1.5), ahora)).toBe('reciente');
    expect(senalUbicacion(hace(2), ahora)).toBe('atrasada');
    expect(senalUbicacion(hace(10), ahora)).toBe('atrasada');
    expect(senalUbicacion(hace(10.5), ahora)).toBe('sin_senal');
    expect(senalUbicacion(null, ahora)).toBe('ninguna');
  });

  it('describe la señal para el operador', () => {
    expect(textoSenal({ latitud: 0, longitud: 0, registradaEn: new Date(ahora - 5 * 60_000).toISOString() }, ahora)).toBe(
      'Posición de hace 5 min',
    );
    expect(textoSenal({ latitud: 0, longitud: 0, registradaEn: new Date(ahora - 30 * 60_000).toISOString() }, ahora)).toMatch(
      /^Sin señal desde las /,
    );
    expect(textoSenal(null, ahora)).toBe('Sin ubicación');
  });
});
