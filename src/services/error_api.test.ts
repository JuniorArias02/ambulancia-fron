import { AxiosError, AxiosHeaders } from 'axios';
import { describe, expect, it } from 'vitest';
import { ErrorApi, normalizarError } from './error_api';

function errorAxios(estado: number, cuerpo: unknown): AxiosError {
  const config = { headers: new AxiosHeaders() };
  return new AxiosError('fallo', 'ERR', config, null, {
    status: estado,
    statusText: '',
    headers: {},
    config,
    data: cuerpo,
  });
}

describe('normalizarError', () => {
  it('usa el mensaje del backend en errores 4xx', () => {
    const error = normalizarError(errorAxios(401, { mensaje: 'Credenciales inválidas' }));

    expect(error).toBeInstanceOf(ErrorApi);
    expect(error.estado).toBe(401);
    expect(error.message).toBe('Credenciales inválidas');
  });

  it('conserva todos los mensajes de validación', () => {
    const error = normalizarError(
      errorAxios(400, { mensaje: ['correo must be an email', 'contrasena should not be empty'] }),
    );

    expect(error.detalles).toHaveLength(2);
  });

  it('no expone detalles internos en errores del servidor', () => {
    const error = normalizarError(errorAxios(500, { mensaje: 'stack interno' }));

    expect(error.message).toBe('El servidor no pudo procesar la solicitud. Inténtalo más tarde.');
  });

  it('traduce el límite de intentos', () => {
    const error = normalizarError(errorAxios(429, { mensaje: 'ThrottlerException: Too Many Requests' }));

    expect(error.message).toBe('Demasiados intentos. Espera un minuto e inténtalo de nuevo.');
  });

  it('identifica la falta de conexión', () => {
    const error = normalizarError(new AxiosError('Network Error', 'ERR_NETWORK'));

    expect(error.estado).toBeNull();
    expect(error.message).toContain('No fue posible conectar con el servidor');
  });
});
