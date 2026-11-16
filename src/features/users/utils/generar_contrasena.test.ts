import { describe, expect, it } from 'vitest';
import { esquemaRestablecerContrasena } from '../schemas/usuario.schema';
import { generarContrasena, LONGITUD_CONTRASENA_GENERADA } from './generar_contrasena';

describe('generarContrasena', () => {
  it('cumple la política del sistema en cada intento', () => {
    for (let intento = 0; intento < 200; intento += 1) {
      const contrasena = generarContrasena();
      expect(contrasena).toHaveLength(LONGITUD_CONTRASENA_GENERADA);
      expect(contrasena).toMatch(/\p{L}/u);
      expect(contrasena).toMatch(/\d/);
      expect(
        esquemaRestablecerContrasena.safeParse({ contrasenaNueva: contrasena, confirmacion: contrasena }).success,
      ).toBe(true);
    }
  });

  it('no usa caracteres ambiguos', () => {
    for (let intento = 0; intento < 200; intento += 1) {
      expect(generarContrasena()).not.toMatch(/[lIO01]/);
    }
  });

  it('no repite contraseñas', () => {
    const generadas = new Set(Array.from({ length: 100 }, () => generarContrasena()));
    expect(generadas.size).toBe(100);
  });
});
