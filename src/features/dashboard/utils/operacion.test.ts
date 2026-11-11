import { describe, expect, it } from 'vitest';
import type { Emergencia } from '../../emergencies/types/emergencia.types';
import { pendientesDeDespacho } from './operacion';

const emergencia = (id: string, cambios: Partial<Emergencia>): Emergencia => ({
  id,
  numeroEmergencia: id,
  fuente: 'linea_123',
  informanteNombre: null,
  informanteTelefono: null,
  descripcion: 'Descripción',
  tipoIncidente: null,
  prioridad: null,
  direccion: 'Calle 1',
  referenciaLugar: null,
  coordenadas: null,
  numeroVictimas: null,
  estado: 'recibida',
  emergenciaPrincipalId: null,
  informanteUsuarioId: null,
  origenUbicacion: null,
  recibidaPor: null,
  recibidaEn: '2026-10-24T12:00:00.000Z',
  cerradaEn: null,
  ...cambios,
});

describe('pendientesDeDespacho', () => {
  it('prioriza las rojas y, entre iguales, las que llevan más tiempo esperando', () => {
    const pendientes = pendientesDeDespacho([
      emergencia('verde', { prioridad: 'verde' }),
      emergencia('roja-reciente', { prioridad: 'roja', recibidaEn: '2026-10-24T12:10:00.000Z' }),
      emergencia('sin-prioridad', {}),
      emergencia('roja-antigua', { prioridad: 'roja', recibidaEn: '2026-10-24T11:50:00.000Z' }),
    ]);
    expect(pendientes.map(({ id }) => id)).toEqual(['roja-antigua', 'roja-reciente', 'verde', 'sin-prioridad']);
  });

  it('excluye las ya despachadas y las duplicadas', () => {
    const pendientes = pendientesDeDespacho([
      emergencia('despachada', { estado: 'despachada' }),
      emergencia('duplicada', { emergenciaPrincipalId: 'otra' }),
      emergencia('recibida', {}),
    ]);
    expect(pendientes.map(({ id }) => id)).toEqual(['recibida']);
  });
});
