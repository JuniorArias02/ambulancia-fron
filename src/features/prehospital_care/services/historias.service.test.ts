import { beforeEach, describe, expect, it, vi } from 'vitest';
import { exportarHistorias } from './historias.service';

const api = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock('../../../services/api', () => ({ api }));

beforeEach(() => {
  api.get.mockReset().mockResolvedValue({ data: new Blob(['csv']), headers: {} });
});

describe('exportarHistorias', () => {
  it('envía los filtros de la bandeja sin paginación ni orden (el backend respondería 400)', async () => {
    const archivo = await exportarHistorias(
      { desde: '2026-11-01', hasta: '2026-11-15', estado: 'vigentes', triage: 'rojo', documento: '', orden: 'numero', pagina: 3, limite: 50 },
      '2026-11-15',
    );
    const [ruta, opciones] = api.get.mock.lastCall ?? [];
    expect(ruta).toBe('/consulta-clinica/historias/exportar');
    expect(opciones.params).toEqual({ desde: '2026-11-01', hasta: '2026-11-15', estado: 'vigentes', triage: 'rojo' });
    expect(opciones.responseType).toBe('blob');
    expect(archivo.nombre).toBe('historias-clinicas-2026-11-15.csv');
  });
});
