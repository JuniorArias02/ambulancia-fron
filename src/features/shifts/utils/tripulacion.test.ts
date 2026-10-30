import { describe, expect, it } from 'vitest';
import type { Usuario } from '../../users/types/usuario.types';
import type { Turno } from '../types/turno.types';
import { opcionesPersona, personasOcupadas } from './tripulacion';

const turno = (id: string, codigo: string, usuarios: string[]): Turno => ({
  id,
  ambulanciaId: `amb-${id}`,
  ambulanciaCodigo: codigo,
  inicio: '2026-10-24T13:00:00.000Z',
  fin: null,
  estado: 'activo',
  integrantes: usuarios.map((usuarioId) => ({ usuarioId, nombreCompleto: usuarioId, funcion: 'paramedico' })),
});

const usuario = (id: string, nombres: string): Usuario => ({
  id,
  nombres,
  apellidos: 'Díaz',
  correo: `${id}@galenos.co`,
  telefono: null,
  estado: 'activo',
  rol: 'paramedico',
  ultimoAcceso: null,
  creadoEn: '2026-10-01T00:00:00.000Z',
});

describe('personasOcupadas', () => {
  it('ignora la tripulación del turno que se está editando', () => {
    const ocupadas = personasOcupadas([turno('t1', 'AMB-01', ['ana']), turno('t2', 'AMB-02', ['pedro'])], 't1');
    expect([...ocupadas]).toEqual([['pedro', 'AMB-02']]);
  });
});

describe('opcionesPersona', () => {
  it('quita a quienes ya van en otra fila y marca a quienes están en otro turno', () => {
    const opciones = opcionesPersona(
      [usuario('ana', 'Ana'), usuario('pedro', 'Pedro'), usuario('luis', 'Luis')],
      new Map([['pedro', 'AMB-02']]),
      new Set(['luis']),
    );
    expect(opciones).toEqual([
      { usuarioId: 'ana', nombre: 'Ana Díaz', noDisponible: undefined },
      { usuarioId: 'pedro', nombre: 'Pedro Díaz', noDisponible: 'en el turno de AMB-02' },
    ]);
  });
});
