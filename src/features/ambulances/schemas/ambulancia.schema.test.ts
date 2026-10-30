import { describe, expect, it } from 'vitest';
import { esquemaAmbulancia, esquemaCambioEstadoAmbulancia } from './ambulancia.schema';

const valida = { codigo: 'amb-01', placa: 'abc 123', tipoAmbulanciaId: 'tipo-1' };

describe('esquemaAmbulancia', () => {
  it('normaliza código y placa como el backend', () => {
    expect(esquemaAmbulancia.parse(valida)).toEqual({
      codigo: 'AMB-01',
      placa: 'ABC123',
      tipoAmbulanciaId: 'tipo-1',
    });
  });

  it('rechaza placas con otro formato', () => {
    expect(esquemaAmbulancia.safeParse({ ...valida, placa: 'AB1234' }).success).toBe(false);
    expect(esquemaAmbulancia.safeParse({ ...valida, placa: 'ABC  123' }).success).toBe(false);
  });

  it('rechaza códigos con caracteres no permitidos', () => {
    expect(esquemaAmbulancia.safeParse({ ...valida, codigo: 'AMB 01' }).success).toBe(false);
    expect(esquemaAmbulancia.safeParse({ ...valida, codigo: 'A' }).success).toBe(false);
  });

  it('exige el tipo', () => {
    expect(esquemaAmbulancia.safeParse({ ...valida, tipoAmbulanciaId: '' }).success).toBe(false);
  });
});

describe('esquemaCambioEstadoAmbulancia', () => {
  it('nunca acepta en_servicio', () => {
    expect(
      esquemaCambioEstadoAmbulancia.safeParse({ estado: 'en_servicio', motivo: 'Despacho manual' })
        .success,
    ).toBe(false);
  });

  it('exige elegir un estado y un motivo de al menos 5 caracteres', () => {
    expect(esquemaCambioEstadoAmbulancia.safeParse({ estado: '', motivo: 'Inicio de turno' }).success).toBe(
      false,
    );
    expect(esquemaCambioEstadoAmbulancia.safeParse({ estado: 'disponible', motivo: 'ok' }).success).toBe(
      false,
    );
    expect(
      esquemaCambioEstadoAmbulancia.safeParse({ estado: 'disponible', motivo: 'Inicio de turno' }).success,
    ).toBe(true);
  });
});
