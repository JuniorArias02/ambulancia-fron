import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { useFiltrosUsuarios } from './use_filtros_usuarios';

function envolverEn(ruta: string) {
  return function Envoltorio({ children }: { children: ReactNode }) {
    return <MemoryRouter initialEntries={[ruta]}>{children}</MemoryRouter>;
  };
}

describe('useFiltrosUsuarios', () => {
  it('ignora valores inválidos de la URL', () => {
    const { result } = renderHook(() => useFiltrosUsuarios(), {
      wrapper: envolverEn('/usuarios?estado=borrado&rol=gerente&pagina=-3'),
    });

    expect(result.current.filtros).toEqual({
      busqueda: undefined,
      estado: undefined,
      rol: undefined,
      pagina: 1,
      limite: 20,
    });
  });

  it('vuelve a la primera página al cambiar un filtro', () => {
    const { result } = renderHook(() => useFiltrosUsuarios(), {
      wrapper: envolverEn('/usuarios?pagina=3'),
    });

    act(() => result.current.actualizarFiltros({ rol: 'paramedico' }));

    expect(result.current.filtros.pagina).toBe(1);
    expect(result.current.filtros.rol).toBe('paramedico');
    expect(result.current.hayFiltrosActivos).toBe(true);
  });
});
