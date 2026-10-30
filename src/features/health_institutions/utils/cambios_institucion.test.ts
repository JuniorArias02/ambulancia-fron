import { describe, expect, it } from 'vitest';
import { esquemaInstitucion } from '../schemas/institucion.schema';
import type { InstitucionSalud } from '../types/institucion.types';
import { construirCambiosInstitucion, construirDatosCreacion, valoresFormulario } from './cambios_institucion';

const institucion: InstitucionSalud = {
  id: 'i1',
  nombre: 'Hospital Universitario',
  codigoHabilitacion: '110010612301',
  nivelComplejidad: 'alta',
  telefono: '+57 601 594 6161',
  direccion: 'Carrera 7 # 40-62',
  coordenadas: { latitud: 4.6283, longitud: -74.0644 },
  activa: true,
};

const formularioDe = (cambios: Partial<ReturnType<typeof valoresFormulario>> = {}) =>
  esquemaInstitucion.parse({ ...valoresFormulario(institucion), ...cambios });

describe('construirCambiosInstitucion', () => {
  it('no envía nada sin cambios', () => {
    expect(construirCambiosInstitucion(institucion, formularioDe())).toEqual({});
  });

  it('borra datos opcionales con null y envía las coordenadas juntas', () => {
    expect(
      construirCambiosInstitucion(institucion, formularioDe({ telefono: '', nivelComplejidad: '', longitud: '-74.07' })),
    ).toEqual({ telefono: null, nivelComplejidad: null, latitud: 4.6283, longitud: -74.07 });
  });
});

describe('esquemaInstitucion', () => {
  it('exige latitud y longitud juntas', () => {
    expect(esquemaInstitucion.safeParse({ ...valoresFormulario(null), nombre: 'Clínica', latitud: '4.6' }).success).toBe(
      false,
    );
  });

  it('en el registro omite los opcionales vacíos', () => {
    const formulario = esquemaInstitucion.parse({ ...valoresFormulario(null), nombre: 'Clínica del Norte' });
    expect(construirDatosCreacion(formulario)).toEqual({ nombre: 'Clínica del Norte' });
  });
});
