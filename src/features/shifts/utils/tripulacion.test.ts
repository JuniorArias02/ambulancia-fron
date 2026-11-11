import { describe, expect, it } from 'vitest';
import type { IntegranteTurno } from '../types/turno.types';
import { textoFaltante } from './tripulacion';

const conductor: IntegranteTurno = { usuarioId: 'c', nombreCompleto: 'Pedro Díaz', funcion: 'conductor' };
const paramedico: IntegranteTurno = { usuarioId: 'p', nombreCompleto: 'Ana Rojas', funcion: 'paramedico' };
const medico: IntegranteTurno = { usuarioId: 'm', nombreCompleto: 'Luis Peña', funcion: 'medico' };

describe('textoFaltante', () => {
  it('no indica nada si la tripulación está completa', () => {
    expect(textoFaltante({ tripulacionCompleta: true, integrantes: [conductor, paramedico] })).toBeNull();
  });

  it('indica quién falta cuando hay una sola persona', () => {
    expect(textoFaltante({ tripulacionCompleta: false, integrantes: [conductor] })).toBe('Falta el paramédico o médico.');
    expect(textoFaltante({ tripulacionCompleta: false, integrantes: [paramedico] })).toBe('Falta el conductor.');
    expect(textoFaltante({ tripulacionCompleta: false, integrantes: [medico] })).toBe('Falta el conductor.');
  });

  it('cubre un turno sin integrantes', () => {
    expect(textoFaltante({ tripulacionCompleta: false, integrantes: [] })).toBe('Faltan el conductor y el paramédico o médico.');
  });

  it('la decisión es del backend: si dice incompleta, no se contradice', () => {
    expect(textoFaltante({ tripulacionCompleta: false, integrantes: [conductor, paramedico] })).toBe(
      'La tripulación está incompleta.',
    );
  });
});
