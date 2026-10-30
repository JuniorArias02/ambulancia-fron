import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { useFiltrosAmbulancias } from './use_filtros_ambulancias';

function envolverEn(ruta: string) {
  return function Envoltorio({ children }: { children: ReactNode }) {
    return <MemoryRouter initialEntries={[ruta]}>{children}</MemoryRouter>;
  };
}

describe('useFiltrosAmbulancias', () => {
  it('ignora valores inválidos de la URL', () => {
    const { result } = renderHook(() => useFiltrosAmbulancias(), {
      wrapper: envolverEn('/ambulancias?estadoOperativo=volando&tipoAmbulanciaId=123&pagina=0'),
    });

    expect(result.current.filtros).toEqual({
      busqueda: undefined,
      estadoOperativo: undefined,
      tipoAmbulanciaId: undefined,
      pagina: 1,
      limite: 20,
    });
    expect(result.current.hayFiltrosActivos).toBe(false);
  });

  it('vuelve a la primera página al cambiar un filtro', () => {
    const { result } = renderHook(() => useFiltrosAmbulancias(), {
      wrapper: envolverEn('/ambulancias?pagina=4'),
    });

    act(() => result.current.actualizarFiltros({ estadoOperativo: 'mantenimiento' }));

    expect(result.current.filtros.pagina).toBe(1);
    expect(result.current.filtros.estadoOperativo).toBe('mantenimiento');
    expect(result.current.hayFiltrosActivos).toBe(true);
  });
});
