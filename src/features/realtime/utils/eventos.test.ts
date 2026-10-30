import { describe, expect, it } from 'vitest';
import { leerEvento } from '../schemas/eventos.schema';
import type { EventoTiempoReal } from '../types/tiempo_real.types';
import { crearRegistroEventos } from './registro_eventos';

const ubicacion = (id: string, ocurridoEn: string, ambulanciaId = 'amb-1'): EventoTiempoReal => ({
  id,
  ocurridoEn,
  tipo: 'ambulancia.ubicacion_actualizada',
  datos: {
    ambulanciaId,
    asignacionId: null,
    latitud: 7.89,
    longitud: -72.5,
    velocidad: 40,
    registradaEn: ocurridoEn,
  },
});

describe('leerEvento', () => {
  it('acepta un aviso válido y conserva solo lo que la web usa', () => {
    const evento = leerEvento('ambulancia.actualizada', {
      id: 'e1',
      tipo: 'ambulancia.actualizada',
      ocurridoEn: '2026-10-24T14:00:00.000Z',
      datos: { ambulancia: { id: 'amb-1', codigo: 'AMB-01', estadoOperativo: 'disponible' } },
    });
    expect(evento?.tipo).toBe('ambulancia.actualizada');
  });

  it('descarta avisos mal formados o que no son para la web', () => {
    const sobre = { id: 'e1', ocurridoEn: '2026-10-24T14:00:00.000Z' };
    expect(leerEvento('ambulancia.ubicacion_actualizada', { ...sobre, datos: { ambulanciaId: 'a', latitud: 120 } })).toBeNull();
    expect(leerEvento('mi_servicio.actualizado', { ...sobre, datos: { turno: null } })).toBeNull();
    expect(leerEvento('turno.actualizado', { ocurridoEn: sobre.ocurridoEn, datos: { turno: { id: 't', ambulanciaId: 'a' } } })).toBeNull();
    expect(leerEvento('turno.actualizado', 'texto')).toBeNull();
  });
});

describe('crearRegistroEventos', () => {
  it('descarta los avisos repetidos', () => {
    const registro = crearRegistroEventos();
    const evento = ubicacion('e1', '2026-10-24T14:00:00.000Z');
    expect(registro.aceptar(evento)).toBe(true);
    expect(registro.aceptar(evento)).toBe(false);
  });

  it('descarta un aviso más viejo que el último aplicado al mismo recurso', () => {
    const registro = crearRegistroEventos();
    expect(registro.aceptar(ubicacion('e2', '2026-10-24T14:00:10.000Z'))).toBe(true);
    expect(registro.aceptar(ubicacion('e1', '2026-10-24T14:00:05.000Z'))).toBe(false);
    // Otro recurso lleva su propia secuencia.
    expect(registro.aceptar(ubicacion('e3', '2026-10-24T14:00:05.000Z', 'amb-2'))).toBe(true);
  });

  it('olvida los ids más viejos al superar su capacidad', () => {
    const registro = crearRegistroEventos(2);
    registro.aceptar(ubicacion('a', '2026-10-24T14:00:00.000Z', 'x'));
    registro.aceptar(ubicacion('b', '2026-10-24T14:00:00.000Z', 'y'));
    registro.aceptar(ubicacion('c', '2026-10-24T14:00:00.000Z', 'z'));
    expect(registro.aceptar(ubicacion('a', '2026-10-24T14:00:00.000Z', 'x'))).toBe(true);
  });
});
