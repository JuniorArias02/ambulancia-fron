import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { NombreRol } from '../../../types/rol.types';
import { usePermisosAmbulancias } from './use_permisos_ambulancias';

const sesion = vi.hoisted(() => ({ rol: 'despachador' as NombreRol }));

vi.mock('../../authentication/hooks/use_sesion', () => ({
  useSesion: () => ({ usuario: { rol: sesion.rol } }),
}));

function permisosDe(rol: NombreRol) {
  sesion.rol = rol;
  return renderHook(() => usePermisosAmbulancias()).result.current;
}

describe('usePermisosAmbulancias', () => {
  it('el despachador registra, edita y cambia el estado, pero no consulta usuarios', () => {
    expect(permisosDe('despachador')).toEqual({ puedeGestionar: true, puedeCambiarEstado: true, puedeVerAutores: false });
  });

  it('el administrador puede todo', () => {
    expect(permisosDe('administrador')).toEqual({ puedeGestionar: true, puedeCambiarEstado: true, puedeVerAutores: true });
  });

  it('la tripulación no gestiona ambulancias desde la web', () => {
    expect(permisosDe('conductor')).toEqual({ puedeGestionar: false, puedeCambiarEstado: false, puedeVerAutores: false });
  });
});
