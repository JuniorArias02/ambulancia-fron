import { describe, expect, it } from 'vitest';
import type { Ambulancia, EstadoOperativo } from '../../ambulances/types/ambulancia.types';
import type { Asignacion, EstadoAsignacion } from '../../assignments/types/asignacion.types';
import { asignacionesPorAmbulancia, contarPorFiltro, cumpleFiltro, etapaEmergencia, etapasPorEmergencia } from './flota';

const ambulancia = (id: string, estadoOperativo: EstadoOperativo): Ambulancia => ({
  id,
  codigo: id,
  placa: 'ABC123',
  tipo: { id: 'tam', nombre: 'TAM', descripcion: null },
  estadoOperativo,
  ultimaUbicacion: null,
  creadaEn: '2026-10-24T14:20:00.000Z',
});

const asignacion = (id: string, ambulanciaId: string, estado: EstadoAsignacion): Asignacion => ({
  id,
  emergenciaId: `em-${id}`,
  numeroEmergencia: `EMG-${id}`,
  ambulanciaId,
  ambulanciaCodigo: ambulanciaId,
  turnoId: null,
  estado,
  siguientesEstados: [],
  motivoCancelacion: null,
  asignadaPor: null,
  asignadaEn: '2026-10-24T14:30:00.000Z',
  salidaEn: null,
  llegadaEscenaEn: null,
  atencionInicioEn: null,
  salidaEscenaEn: null,
  llegadaDestinoEn: null,
  finalizadaEn: null,
});

const flota = [
  ambulancia('A', 'disponible'),
  ambulancia('B', 'disponible'),
  ambulancia('C', 'en_servicio'),
  ambulancia('D', 'fuera_servicio'),
  ambulancia('E', 'mantenimiento'),
];

describe('filtros de la flota', () => {
  it('cuenta cada grupo y los contadores cuadran con el total', () => {
    expect(contarPorFiltro(flota)).toEqual({ todas: 5, disponibles: 2, en_servicio: 1, otras: 2 });
  });

  it('solo las disponibles se pueden despachar ya', () => {
    expect(flota.filter((a) => cumpleFiltro(a, 'disponibles')).map(({ id }) => id)).toEqual(['A', 'B']);
    expect(flota.filter((a) => cumpleFiltro(a, 'otras')).map(({ id }) => id)).toEqual(['D', 'E']);
  });
});

describe('asignacionesPorAmbulancia', () => {
  it('relaciona cada ambulancia con su servicio activo e ignora los terminados', () => {
    const porAmbulancia = asignacionesPorAmbulancia([
      asignacion('1', 'C', 'en_camino'),
      asignacion('2', 'B', 'finalizada'),
      asignacion('3', 'A', 'cancelada'),
    ]);
    expect([...porAmbulancia.keys()]).toEqual(['C']);
    expect(porAmbulancia.get('C')?.numeroEmergencia).toBe('EMG-1');
  });
});

describe('etapaEmergencia', () => {
  it('con una ambulancia en el lugar, la emergencia muestra el halo', () => {
    expect(etapaEmergencia([asignacion('1', 'A', 'atendiendo')])).toBe('en_lugar');
  });

  it('se atenúa solo cuando todas sus ambulancias llevan el paciente a bordo', () => {
    expect(etapaEmergencia([asignacion('1', 'A', 'trasladando'), asignacion('2', 'B', 'trasladando')])).toBe(
      'paciente_recogido',
    );
    // Varias víctimas: otra ambulancia sigue en camino, el marcador se mantiene.
    expect(etapaEmergencia([asignacion('1', 'A', 'trasladando'), asignacion('2', 'B', 'en_camino')])).toBe('en_camino');
  });

  it('ignora los servicios terminados', () => {
    expect(etapaEmergencia([asignacion('1', 'A', 'finalizada')])).toBe('sin_servicio');
  });

  it('agrupa los servicios por emergencia', () => {
    const etapas = etapasPorEmergencia([asignacion('1', 'A', 'en_escena'), asignacion('2', 'B', 'asignada')]);
    expect(etapas.get('em-1')).toBe('en_lugar');
    expect(etapas.get('em-2')).toBe('en_camino');
  });
});
