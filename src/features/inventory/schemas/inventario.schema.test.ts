import { describe, expect, it } from 'vitest';
import type { ControlInsumo } from '../types/inventario.types';
import { esquemaInsumo } from './catalogo.schema';
import { esquemaMovimiento, type EntradaMovimiento } from './movimiento.schema';
import { esquemaDetalle } from './perfil.schema';

const CONTROLES: Record<string, ControlInsumo> = { gasa: 'insumo', adrenalina: 'lote', dea: 'serie' };
const esquema = esquemaMovimiento((id) => CONTROLES[id], () => new Date('2026-11-11T15:00:00'));

const base: EntradaMovimiento = {
  tipo: 'transferencia',
  sentidoAjuste: 'disminuir',
  origenUbicacionId: 'bodega',
  destinoUbicacionId: 'amb',
  motivo: '',
  documentoReferencia: '',
  observaciones: '',
  realizadoEn: '',
  lineas: [{ insumoId: 'gasa', loteId: '', equipoId: '', cantidad: '30' }],
};

const mensajes = (entrada: EntradaMovimiento) => {
  const resultado = esquema.safeParse(entrada);
  return resultado.success ? [] : resultado.error.issues.map((issue) => issue.message);
};

describe('esquemaMovimiento', () => {
  it('acepta una transferencia válida y convierte la cantidad', () => {
    expect(esquema.parse({ ...base, lineas: [{ ...base.lineas[0], insumoId: 'gasa', loteId: '', equipoId: '', cantidad: '2,5' }] }).lineas[0]?.cantidad).toBe(2.5);
  });

  it('pide origen y destino distintos', () => {
    expect(mensajes({ ...base, destinoUbicacionId: 'bodega' })).toContain('El destino debe ser distinto del origen.');
    expect(mensajes({ ...base, origenUbicacionId: '' })).toContain('Elige el origen.');
  });

  it('el ajuste y la baja exigen motivo', () => {
    expect(mensajes({ ...base, tipo: 'baja', destinoUbicacionId: '' })).toContain('Este tipo de movimiento exige un motivo.');
  });

  it('exige el lote y mueve los equipos de a 1', () => {
    expect(mensajes({ ...base, lineas: [{ insumoId: 'adrenalina', loteId: '', equipoId: '', cantidad: '1' }] })).toContain('Elige el lote.');
    expect(mensajes({ ...base, lineas: [{ insumoId: 'dea', loteId: '', equipoId: 'e1', cantidad: '2' }] })).toContain('Los equipos se mueven de a 1.');
  });

  it('no repite la misma unidad ni acepta más de 3 decimales o fechas futuras', () => {
    const linea = { insumoId: 'gasa', loteId: '', equipoId: '', cantidad: '1' };
    expect(mensajes({ ...base, lineas: [linea, linea] })).toContain('Esta unidad ya está en otra línea.');
    expect(mensajes({ ...base, lineas: [{ ...linea, cantidad: '1.2345' }] })).toContain('Usa un número con hasta 3 decimales.');
    expect(mensajes({ ...base, realizadoEn: '2026-11-12T08:00' })).toContain('No puede ser una fecha futura.');
  });
});

describe('esquemaInsumo', () => {
  const insumo = {
    codigo: 'MED-0001',
    nombre: 'Adrenalina',
    tipo: 'medicamento',
    categoria: '',
    unidadMedida: 'ampolla',
    marca: '',
    fabricante: '',
    descripcion: '',
    control: 'lote',
    requiereVencimiento: true,
    requiereRegistroSanitario: true,
    esControlEspecial: false,
    stockMinimo: '50',
  } as const;

  it('el vencimiento exige el control por lote', () => {
    expect(esquemaInsumo.safeParse(insumo).success).toBe(true);
    expect(esquemaInsumo.safeParse({ ...insumo, control: 'serie' }).success).toBe(false);
  });
});

describe('esquemaDetalle', () => {
  it('la mínima no supera la requerida y los equipos piden enteros', () => {
    expect(esquemaDetalle('insumo').safeParse({ cantidadRequerida: '20', cantidadMinima: '25', obligatorio: true, observaciones: '' }).success).toBe(false);
    expect(esquemaDetalle('serie').safeParse({ cantidadRequerida: '1.5', cantidadMinima: '', obligatorio: true, observaciones: '' }).success).toBe(false);
    expect(esquemaDetalle('serie').parse({ cantidadRequerida: '2', cantidadMinima: '', obligatorio: true, observaciones: '' }).cantidadMinima).toBeNull();
  });
});
