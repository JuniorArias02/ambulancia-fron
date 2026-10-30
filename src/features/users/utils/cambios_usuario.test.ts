import { describe, expect, it } from 'vitest';
import type { Usuario } from '../types/usuario.types';
import { construirCambiosUsuario, limpiarTelefono } from './cambios_usuario';

const usuario: Usuario = {
  id: '6f1c2f1e-0000-4000-8000-000000000001',
  nombres: 'Laura',
  apellidos: 'Gómez',
  correo: 'laura@ambulancia.co',
  telefono: '+57 300 123 4567',
  estado: 'activo',
  rol: 'despachador',
  ultimoAcceso: null,
  creadoEn: '2026-10-23T18:00:00.000Z',
};

describe('construirCambiosUsuario', () => {
  it('no envía nada si no hubo cambios', () => {
    expect(
      construirCambiosUsuario(usuario, {
        nombres: 'Laura',
        apellidos: 'Gómez',
        telefono: '+57 300 123 4567',
      }),
    ).toEqual({});
  });

  it('envía solo los campos modificados', () => {
    expect(
      construirCambiosUsuario(usuario, {
        nombres: 'Laura Marcela',
        apellidos: 'Gómez',
        telefono: '+57 300 123 4567',
      }),
    ).toEqual({ nombres: 'Laura Marcela' });
  });

  it('envía null para borrar el teléfono', () => {
    expect(
      construirCambiosUsuario(usuario, { nombres: 'Laura', apellidos: 'Gómez', telefono: '' }),
    ).toEqual({ telefono: null });
  });

  it('no envía el teléfono si seguía vacío', () => {
    expect(
      construirCambiosUsuario(
        { ...usuario, telefono: null },
        { nombres: 'Laura', apellidos: 'Gómez', telefono: '' },
      ),
    ).toEqual({});
  });
});

describe('limpiarTelefono', () => {
  it('omite el teléfono vacío al crear', () => {
    expect(limpiarTelefono('')).toBeUndefined();
    expect(limpiarTelefono('3001234567')).toBe('3001234567');
  });
});
