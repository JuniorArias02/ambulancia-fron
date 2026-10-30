import { describe, expect, it, vi } from 'vitest';
import { ErrorApi } from '../../../services/error_api';
import { rutaDePrueba } from '../../../test/datos_prueba';
import { obtenerRutaAsignacion } from './asignaciones.service';

const api = vi.hoisted(() => ({ get: vi.fn() }));

vi.mock('../../../services/api', () => ({ api }));

describe('obtenerRutaAsignacion', () => {
  it('devuelve la ruta del servicio', async () => {
    api.get.mockResolvedValueOnce({ data: rutaDePrueba });
    await expect(obtenerRutaAsignacion('asig-1')).resolves.toEqual(rutaDePrueba);
    expect(api.get).toHaveBeenCalledWith('/asignaciones/asig-1/ruta');
  });

  it('sin ruta calculada todavía devuelve null en lugar de un error', async () => {
    api.get.mockRejectedValueOnce(new ErrorApi(404, 'Ruta del servicio no encontrado'));
    await expect(obtenerRutaAsignacion('asig-1')).resolves.toBeNull();
  });

  it('si el servicio no existe es un error', async () => {
    api.get.mockRejectedValueOnce(new ErrorApi(404, 'Asignación no encontrado'));
    await expect(obtenerRutaAsignacion('asig-x')).rejects.toThrow('Asignación no encontrado');
  });
});
