import { describe, expect, it } from 'vitest';
import type { EntradaEmergencia } from './emergencia.schema';
import { esquemaEmergencia } from './emergencia.schema';

const vacia: EntradaEmergencia = {
  fuente: 'radio',
  descripcion: 'Persona caída en la vía',
  informanteNombre: '',
  informanteTelefono: '',
  tipoIncidente: '',
  prioridad: '',
  direccion: 'Carrera 7 # 45-10',
  referenciaLugar: '',
  latitud: '',
  longitud: '',
  numeroVictimas: '',
};

function mensajes(entrada: EntradaEmergencia): Record<string, string | undefined> {
  const resultado = esquemaEmergencia.safeParse(entrada);
  if (resultado.success) return {};
  return Object.fromEntries(resultado.error.issues.map((issue) => [String(issue.path[0]), issue.message]));
}

describe('esquemaEmergencia', () => {
  it('convierte los opcionales vacíos en null', () => {
    expect(esquemaEmergencia.parse(vacia)).toEqual({
      fuente: 'radio',
      descripcion: 'Persona caída en la vía',
      informanteNombre: null,
      informanteTelefono: null,
      tipoIncidente: null,
      prioridad: null,
      direccion: 'Carrera 7 # 45-10',
      referenciaLugar: null,
      latitud: null,
      longitud: null,
      numeroVictimas: null,
    });
  });

  it('exige la dirección o las coordenadas', () => {
    expect(mensajes({ ...vacia, direccion: '' }).direccion).toMatch(/dirección o marca el punto/);
    expect(esquemaEmergencia.safeParse({ ...vacia, direccion: '', latitud: '7.89', longitud: '-72.5' }).success).toBe(
      true,
    );
  });

  it('exige latitud y longitud juntas', () => {
    expect(mensajes({ ...vacia, latitud: '7.89' }).longitud).toMatch(/juntas/);
  });

  it('acepta coma decimal y rechaza más de 7 decimales o fuera de rango', () => {
    expect(esquemaEmergencia.parse({ ...vacia, latitud: '7,8939', longitud: '-72,5078' })).toMatchObject({
      latitud: 7.8939,
      longitud: -72.5078,
    });
    expect(mensajes({ ...vacia, latitud: '7.123456789', longitud: '-72' }).latitud).toBeDefined();
    expect(mensajes({ ...vacia, latitud: '95', longitud: '-72' }).latitud).toBeDefined();
  });

  it('valida teléfono y número de víctimas', () => {
    expect(mensajes({ ...vacia, informanteTelefono: 'abc' }).informanteTelefono).toBeDefined();
    expect(mensajes({ ...vacia, numeroVictimas: '501' }).numeroVictimas).toBeDefined();
    expect(mensajes({ ...vacia, numeroVictimas: '2.5' }).numeroVictimas).toBeDefined();
    expect(esquemaEmergencia.parse({ ...vacia, numeroVictimas: '0' }).numeroVictimas).toBe(0);
  });

  it('exige fuente y descripción', () => {
    const errores = mensajes({ ...vacia, fuente: '', descripcion: 'hola' });
    expect(errores.fuente).toBeDefined();
    expect(errores.descripcion).toBeDefined();
  });
});
