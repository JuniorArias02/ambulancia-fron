import { describe, expect, it } from 'vitest';
import { htmlCheckpoint } from './marcadores';

describe('htmlCheckpoint', () => {
  it('solo las emergencias que esperan ambulancia llevan el aura animada', () => {
    expect(htmlCheckpoint({ color: '#dc2626', pendiente: true, seleccionada: false })).toContain('animate-aura');
    expect(htmlCheckpoint({ color: '#dc2626', pendiente: false, seleccionada: false })).not.toContain('animate-aura');
  });

  it('el aura respeta la preferencia de movimiento reducido', () => {
    expect(htmlCheckpoint({ color: '#dc2626', pendiente: true, seleccionada: false })).toContain(
      'motion-safe:animate-aura',
    );
  });

  it('resalta la seleccionada con un tamaño mayor y anillo institucional', () => {
    const html = htmlCheckpoint({ color: '#16a34a', pendiente: false, seleccionada: true });
    expect(html).toContain('size-11');
    expect(html).toContain('ring-institucional');
  });

  it('marca la ambulancia en el lugar con un halo y atenúa la emergencia ya recogida', () => {
    expect(htmlCheckpoint({ color: '#dc2626', pendiente: false, seleccionada: false, ambulanciaEnLugar: true })).toContain(
      'border-primario/70',
    );
    expect(htmlCheckpoint({ color: '#dc2626', pendiente: false, seleccionada: false, atenuada: true })).toContain('opacity-45');
    // Seleccionada se ve completa aunque ya no haya paciente en el sitio.
    expect(htmlCheckpoint({ color: '#dc2626', pendiente: false, seleccionada: true, atenuada: true })).not.toContain(
      'opacity-45',
    );
  });

  it('no inserta colores que no sean hexadecimales', () => {
    const html = htmlCheckpoint({ color: 'red;background:url(x)', pendiente: true, seleccionada: false });
    expect(html).not.toContain('url(x)');
    expect(html).toContain('#64748b');
  });
});
