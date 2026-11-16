import { describe, expect, it } from 'vitest';
import { nombreDeArchivo } from './descargas';

describe('nombreDeArchivo', () => {
  it('lee el nombre de Content-Disposition', () => {
    expect(nombreDeArchivo('attachment; filename="HC-20261113-0003.pdf"', 'x.pdf')).toBe('HC-20261113-0003.pdf');
    expect(nombreDeArchivo("attachment; filename*=UTF-8''historias%20cl%C3%ADnicas.csv", 'x.csv')).toBe('historias clínicas.csv');
  });

  it('sin cabecera (no expuesta por CORS) usa el de respaldo', () => {
    expect(nombreDeArchivo(undefined, 'HC-1.pdf')).toBe('HC-1.pdf');
  });
});
