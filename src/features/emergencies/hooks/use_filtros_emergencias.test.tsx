import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { useFiltrosEmergencias } from './use_filtros_emergencias';

function envolverEn(ruta: string) {
  return function Envoltorio({ children }: { children: ReactNode }) {
    return <MemoryRouter initialEntries={[ruta]}>{children}</MemoryRouter>;
  };
}

describe('useFiltrosEmergencias', () => {
  it('el tablero pide solo las activas e ignora estado y fechas', () => {
    const { result } = renderHook(() => useFiltrosEmergencias(), {
      wrapper: envolverEn('/emergencias?estado=cerrada&desde=2026-10-01&prioridad=roja'),
    });

    expect(result.current.vista).toBe('activas');
    expect(result.current.filtros).toMatchObject({
      soloActivas: true,
      estado: undefined,
      desde: undefined,
      prioridad: 'roja',
    });
  });

  it('el historial admite estado y fechas válidas', () => {
    const { result } = renderHook(() => useFiltrosEmergencias(), {
      wrapper: envolverEn('/emergencias?vista=historial&estado=cancelada&desde=2026-10-01&hasta=2026-13-01'),
    });

    expect(result.current.filtros).toMatchObject({
      soloActivas: undefined,
      estado: 'cancelada',
      desde: '2026-10-01',
      hasta: undefined,
    });
  });

  it('al cambiar de vista quita los filtros propios del historial', () => {
    const { result } = renderHook(() => useFiltrosEmergencias(), {
      wrapper: envolverEn('/emergencias?vista=historial&estado=cancelada&prioridad=verde&pagina=3'),
    });

    act(() => result.current.actualizarFiltros({ vista: 'activas' }));

    expect(result.current.vista).toBe('activas');
    expect(result.current.filtros).toMatchObject({ estado: undefined, prioridad: 'verde', pagina: 1 });
  });
});
