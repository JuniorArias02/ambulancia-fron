import { describe, expect, it } from 'vitest';
import type { Ambulancia } from '../types/ambulancia.types';
import { campoDuplicado, construirCambiosAmbulancia } from './cambios_ambulancia';

const ambulancia: Ambulancia = {
  id: '6f1c2f1e-0000-4000-8000-000000000001',
  codigo: 'AMB-01',
  placa: 'ABC123',
  tipo: { id: 'tipo-tam', nombre: 'TAM', descripcion: 'Transporte Asistencial Medicalizado' },
  estadoOperativo: 'disponible',
  ultimaUbicacion: null,
  creadaEn: '2026-10-24T11:00:00.000Z',
};

describe('construirCambiosAmbulancia', () => {
  it('no envía nada si los valores normalizados no cambiaron', () => {
    expect(
      construirCambiosAmbulancia(ambulancia, {
        codigo: 'AMB-01',
        placa: 'ABC123',
        tipoAmbulanciaId: 'tipo-tam',
      }),
    ).toEqual({});
  });

  it('envía solo los campos modificados', () => {
    expect(
      construirCambiosAmbulancia(ambulancia, {
        codigo: 'AMB-01',
        placa: 'XYZ987',
        tipoAmbulanciaId: 'tipo-tab',
      }),
    ).toEqual({ placa: 'XYZ987', tipoAmbulanciaId: 'tipo-tab' });
  });
});

describe('campoDuplicado', () => {
  it('ubica el conflicto en el campo correcto', () => {
    expect(campoDuplicado('Ya existe una ambulancia con esa placa')).toBe('placa');
    expect(campoDuplicado('Ya existe una ambulancia con ese código')).toBe('codigo');
  });
});
