import { describe, expect, it, vi } from 'vitest';
import { listarFlota } from './ambulancias.service';

const api = vi.hoisted(() => ({ get: vi.fn() }));

vi.mock('../../../services/api', () => ({ api }));

const pagina = (numero: number, cantidad: number, total: number) => ({
  data: {
    datos: Array.from({ length: cantidad }, (_, i) => ({ id: `p${numero}-${i}` })),
    total,
    pagina: numero,
    limite: 100,
  },
});

describe('listarFlota', () => {
  it('con hasta 100 ambulancias hace una sola consulta', async () => {
    api.get.mockReset().mockResolvedValueOnce(pagina(1, 12, 12));

    const flota = await listarFlota();

    expect(api.get).toHaveBeenCalledTimes(1);
    expect(api.get.mock.calls[0]?.[1]).toEqual({ params: { pagina: 1, limite: 100, busqueda: undefined } });
    expect(flota.datos).toHaveLength(12);
  });

  it('con más de 100 pide también las páginas siguientes y las une', async () => {
    api.get.mockReset().mockResolvedValueOnce(pagina(1, 100, 150)).mockResolvedValueOnce(pagina(2, 50, 150));

    const flota = await listarFlota();

    expect(api.get).toHaveBeenCalledTimes(2);
    expect(api.get.mock.calls[1]?.[1]).toEqual({ params: { pagina: 2, limite: 100, busqueda: undefined } });
    expect(flota).toMatchObject({ total: 150, pagina: 1, limite: 150 });
    expect(flota.datos).toHaveLength(150);
  });
});
