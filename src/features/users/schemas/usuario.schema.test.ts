import { describe, expect, it } from 'vitest';
import { esquemaCambioEstado, esquemaCrearUsuario } from './usuario.schema';

const valido = {
  nombres: 'Laura',
  apellidos: 'Gómez',
  correo: 'laura@ambulancia.co',
  telefono: '',
  contrasena: 'Secreta2026',
  rol: 'despachador',
};

describe('esquemaCrearUsuario', () => {
  it('acepta un usuario válido sin teléfono', () => {
    expect(esquemaCrearUsuario.safeParse(valido).success).toBe(true);
  });

  it('rechaza un teléfono con formato inválido', () => {
    expect(esquemaCrearUsuario.safeParse({ ...valido, telefono: 'abc' }).success).toBe(false);
  });

  it('exige la política de contraseña', () => {
    expect(esquemaCrearUsuario.safeParse({ ...valido, contrasena: 'soloLetrasLargas' }).success).toBe(
      false,
    );
  });

  it('rechaza roles desconocidos', () => {
    expect(esquemaCrearUsuario.safeParse({ ...valido, rol: 'gerente' }).success).toBe(false);
  });
});

describe('esquemaCambioEstado', () => {
  it('exige un motivo de al menos 5 caracteres', () => {
    expect(esquemaCambioEstado.safeParse({ estado: 'bloqueado', motivo: 'no' }).success).toBe(false);
    expect(
      esquemaCambioEstado.safeParse({ estado: 'bloqueado', motivo: 'Retiro de la empresa' }).success,
    ).toBe(true);
  });
});
