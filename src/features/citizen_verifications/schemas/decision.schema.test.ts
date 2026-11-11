import { describe, expect, it } from 'vitest';
import { esquemaDecisionConMotivo } from './decision.schema';

describe('esquemaDecisionConMotivo', () => {
  it('exige el motivo', () => {
    expect(esquemaDecisionConMotivo.safeParse({ motivo: '   ', observaciones: '' }).success).toBe(false);
  });

  it('limita el motivo a 500 y las observaciones a 2000 caracteres', () => {
    expect(esquemaDecisionConMotivo.safeParse({ motivo: 'a'.repeat(501), observaciones: '' }).success).toBe(false);
    expect(esquemaDecisionConMotivo.safeParse({ motivo: 'Ok', observaciones: 'a'.repeat(2001) }).success).toBe(false);
  });

  it('acepta un motivo con observaciones vacías', () => {
    expect(esquemaDecisionConMotivo.parse({ motivo: ' Foto cortada ', observaciones: '' })).toEqual({
      motivo: 'Foto cortada',
      observaciones: '',
    });
  });
});
