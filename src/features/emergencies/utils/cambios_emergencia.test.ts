import { describe, expect, it } from 'vitest';
import { esquemaEmergencia } from '../schemas/emergencia.schema';
import type { Emergencia } from '../types/emergencia.types';
import { construirCambiosEmergencia, construirDatosCreacion, valoresFormulario } from './cambios_emergencia';

const emergencia: Emergencia = {
  id: '6f1c2f1e-0000-4000-8000-000000000001',
  numeroEmergencia: 'EMG-20261024-0001',
  fuente: 'linea_123',
  informanteNombre: 'Carlos Ruiz',
  informanteTelefono: '+57 300 123 4567',
  descripcion: 'Choque entre moto y carro',
  tipoIncidente: 'accidente_transito',
  prioridad: 'amarilla',
  direccion: 'Calle 72 # 15-20',
  referenciaLugar: null,
  coordenadas: { latitud: 4.6582, longitud: -74.0571 },
  numeroVictimas: 2,
  estado: 'recibida',
  emergenciaPrincipalId: null,
  informanteUsuarioId: null,
  origenUbicacion: null,
  recibidaPor: { id: 'u1', nombreCompleto: 'Laura Gómez' },
  recibidaEn: '2026-10-24T12:00:03.000Z',
  cerradaEn: null,
};

const formularioDe = (cambios: Partial<ReturnType<typeof valoresFormulario>> = {}) =>
  esquemaEmergencia.parse({ ...valoresFormulario(emergencia), ...cambios });

describe('construirCambiosEmergencia', () => {
  it('no envía nada si no hubo cambios', () => {
    expect(construirCambiosEmergencia(emergencia, formularioDe())).toEqual({});
  });

  it('re-clasifica la prioridad y borra datos con null', () => {
    expect(
      construirCambiosEmergencia(
        emergencia,
        formularioDe({ prioridad: 'roja', informanteTelefono: '', numeroVictimas: '3' }),
      ),
    ).toEqual({ prioridad: 'roja', informanteTelefono: null, numeroVictimas: 3 });
  });

  it('envía latitud y longitud juntas aunque cambie solo una', () => {
    expect(construirCambiosEmergencia(emergencia, formularioDe({ latitud: '4.7' }))).toEqual({
      latitud: 4.7,
      longitud: -74.0571,
    });
  });

  it('quita las coordenadas enviando las dos en null', () => {
    expect(construirCambiosEmergencia(emergencia, formularioDe({ latitud: '', longitud: '' }))).toEqual({
      latitud: null,
      longitud: null,
    });
  });
});

describe('construirDatosCreacion', () => {
  it('omite los opcionales vacíos', () => {
    const formulario = esquemaEmergencia.parse({
      ...valoresFormulario(null),
      fuente: 'radio',
      descripcion: 'Persona caída en la vía',
      direccion: 'Carrera 7 # 45-10',
    });
    expect(construirDatosCreacion(formulario)).toEqual({
      fuente: 'radio',
      descripcion: 'Persona caída en la vía',
      direccion: 'Carrera 7 # 45-10',
    });
  });
});
