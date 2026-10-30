import { describe, expect, it } from 'vitest';
import { ErrorApi } from '../../../services/error_api';
import type { GeocodificacionInversa } from '../types/geocodificacion.types';
import { avisoErrorGeocodificacion, interpretarInversa, type EstadoCampos } from './interpretar_geocodificacion';

const base: GeocodificacionInversa = {
  id: 'g1',
  puntoSolicitado: { latitud: 4.685519, longitud: -74.052851 },
  direccion: 'Cl 100 19 61, 111211 Bogotá, DC, Colombia',
  lineaDireccion: 'Cl 100 19 61',
  componentes: {
    calle: 'Cl 100',
    numero: '19 61',
    barrio: null,
    ciudad: 'Bogotá',
    departamento: 'Distrito Especial',
    codigoPostal: '111211',
    pais: 'co',
  },
  precision: 'exacta',
  distanciaMetros: 0,
  coordenadasDireccion: { latitud: 4.685519, longitud: -74.052851 },
  proveedor: 'geoapify',
  origen: 'proveedor',
  geocodificadaEn: '2026-10-24T17:50:12.000Z',
};

const vacios: EstadoCampos = { direccion: '', referencia: '', direccionAutomatica: null, referenciaAutomatica: null };

describe('interpretarInversa', () => {
  it('exacta: llena la dirección con la línea y la ciudad', () => {
    expect(interpretarInversa(base, vacios)).toMatchObject({
      direccion: 'Cl 100 19 61',
      ciudad: 'Bogotá',
      aviso: { tono: 'exito' },
    });
  });

  it('aproximada: llena la dirección con un aviso para verificarla', () => {
    const resultado = interpretarInversa({ ...base, precision: 'aproximada', distanciaMetros: 44.6 }, vacios);
    expect(resultado.direccion).toBe('Cl 100 19 61');
    expect(resultado.aviso).toMatchObject({ tono: 'advertencia', titulo: 'Dirección aproximada (a 45 m), verifícala' });
  });

  it('zona: no inventa dirección y pone la zona como referencia del lugar', () => {
    const resultado = interpretarInversa(
      { ...base, precision: 'zona', direccion: 'Pie de Alto, Sibaté, Cundinamarca', lineaDireccion: null },
      vacios,
    );
    expect(resultado.direccion).toBeUndefined();
    expect(resultado.referencia).toBe('Pie de Alto, Sibaté, Cundinamarca');
    expect(resultado.aviso.tono).toBe('advertencia');
  });

  it('respeta la dirección que el usuario escribió a mano', () => {
    const resultado = interpretarInversa(base, { ...vacios, direccion: 'Calle 100 con 19', direccionAutomatica: null });
    expect(resultado.direccion).toBeUndefined();
    expect(resultado.aviso.detalle).toContain('Se conservó la dirección que escribiste.');
  });

  it('reemplaza la dirección que había llenado antes la geocodificación', () => {
    const resultado = interpretarInversa(base, { ...vacios, direccion: 'Ak 68 53 36', direccionAutomatica: 'Ak 68 53 36' });
    expect(resultado.direccion).toBe('Cl 100 19 61');
  });
});

describe('avisoErrorGeocodificacion', () => {
  it('traduce cada error en el siguiente paso', () => {
    expect(avisoErrorGeocodificacion(new ErrorApi(422, 'No se encontró una ubicación confiable'), 'direccion').detalle).toMatch(
      /Toca el punto en el mapa/,
    );
    expect(avisoErrorGeocodificacion(new ErrorApi(422, 'Indique la ciudad de la dirección'), 'direccion').titulo).toBe(
      'Indica la ciudad',
    );
    expect(avisoErrorGeocodificacion(new ErrorApi(503, 'Servicio no disponible'), 'punto').detalle).toMatch(
      /Escribe la dirección a mano/,
    );
    expect(avisoErrorGeocodificacion(new ErrorApi(429, 'Demasiados intentos'), 'punto').titulo).toBe(
      'Demasiadas consultas seguidas',
    );
  });
});
