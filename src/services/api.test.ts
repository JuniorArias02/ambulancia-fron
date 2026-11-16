import { AxiosError, AxiosHeaders, type InternalAxiosRequestConfig } from 'axios';
import { describe, expect, it } from 'vitest';
import { api } from './api';
import { ErrorApi } from './error_api';

/** Adaptador que responde un error con el cuerpo dado, sin red. */
function adaptadorConError(estado: number, cuerpo: Blob) {
  return (configuracion: InternalAxiosRequestConfig) =>
    Promise.reject(
      new AxiosError('Fallo', 'ERR_BAD_REQUEST', configuracion, null, {
        status: estado,
        statusText: '',
        headers: {},
        config: { ...configuracion, headers: new AxiosHeaders() },
        data: cuerpo,
      }),
    );
}

describe('cliente HTTP · descargas', () => {
  it('lee el mensaje del backend aunque el error llegue como Blob', async () => {
    const cuerpo = new Blob([JSON.stringify({ mensaje: 'Hay más de 5000 historias con esos filtros' })], { type: 'application/json' });
    const resultado = api.get('/consulta-clinica/historias/exportar', { responseType: 'blob', adapter: adaptadorConError(422, cuerpo) });

    await expect(resultado).rejects.toBeInstanceOf(ErrorApi);
    await expect(resultado).rejects.toMatchObject({ estado: 422, message: 'Hay más de 5000 historias con esos filtros' });
  });

  it('si el Blob no es JSON usa el mensaje genérico del estado', async () => {
    const resultado = api.get('/historias-clinicas/x/pdf', {
      responseType: 'blob',
      adapter: adaptadorConError(404, new Blob(['no encontrado'], { type: 'text/plain' })),
    });
    await expect(resultado).rejects.toMatchObject({ estado: 404, message: 'El recurso solicitado no existe.' });
  });
});
