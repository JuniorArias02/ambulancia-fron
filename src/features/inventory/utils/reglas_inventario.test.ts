import { describe, expect, it } from 'vitest';
import type { Conteo, VerificacionInventario } from '../types/inventario.types';
import { soloCambios } from './cambios';
import { diasHasta, formatearDia, textoPlazo } from './formato_inventario';
import { propuestasNovedad } from './novedades_verificacion';
import { proponerResolucion } from './resolucion_revision';
import { claveUnidad, faltaIdentificador, reglaMovimiento } from './reglas_movimiento';

describe('reglas de los movimientos', () => {
  it('cada tipo pide sus ubicaciones', () => {
    expect(reglaMovimiento('entrada', 'disminuir')).toMatchObject({ origen: null, destino: ['bodega'] });
    expect(reglaMovimiento('devolucion', 'disminuir')).toMatchObject({ origen: ['ambulancia'], destino: ['bodega'] });
    expect(reglaMovimiento('consumo', 'disminuir')).toMatchObject({ origen: ['ambulancia'], destino: null });
    expect(reglaMovimiento('baja', 'disminuir')).toMatchObject({ destino: null, motivoObligatorio: true });
  });

  it('el ajuste aumenta con destino y disminuye con origen, siempre con motivo', () => {
    expect(reglaMovimiento('ajuste', 'aumentar')).toMatchObject({ origen: null, motivoObligatorio: true });
    expect(reglaMovimiento('ajuste', 'disminuir')).toMatchObject({ destino: null, motivoObligatorio: true });
  });

  it('exige el lote o la serie según el control del insumo', () => {
    expect(faltaIdentificador('lote', { loteId: '', equipoId: '' })).toBe('lote');
    expect(faltaIdentificador('serie', { loteId: '', equipoId: '' })).toBe('serie');
    expect(faltaIdentificador('insumo', { loteId: '', equipoId: '' })).toBeNull();
    expect(claveUnidad({ insumoId: 'a', loteId: 'l', equipoId: '' })).not.toBe(claveUnidad({ insumoId: 'a', loteId: '', equipoId: '' }));
  });
});

describe('formato', () => {
  it('cuenta los días sin desfase de zona horaria', () => {
    expect(diasHasta('2026-11-16', '2026-11-11')).toBe(5);
    expect(textoPlazo('2026-11-09', '2026-11-11', { futuro: 'vence', pasado: 'venció', hoy: 'vence hoy' })).toBe('venció hace 2 días');
    expect(textoPlazo('2026-11-11', '2026-11-11', { futuro: 'vence', pasado: 'venció', hoy: 'vence hoy' })).toBe('vence hoy');
    expect(formatearDia('2027-01-10')).toBe('10/01/2027');
  });

  it('solo envía lo que cambió', () => {
    expect(soloCambios({ nombre: 'A', codigo: 'X' }, { nombre: 'A', codigo: 'Y' })).toEqual({ codigo: 'Y' });
  });
});

describe('novedades de una verificación', () => {
  const verificacion: VerificacionInventario = {
    id: 'v1',
    ubicacionId: 'ubi-amb',
    ubicacionNombre: 'AMB-02',
    turnoId: null,
    responsableId: 'p1',
    responsableNombre: 'Laura',
    tipo: 'fin_turno',
    estado: 'con_novedades',
    iniciadaEn: '2026-11-11T10:00:00.000Z',
    finalizadaEn: '2026-11-11T10:20:00.000Z',
    observaciones: null,
    totalNovedades: 1,
    pendienteDeRevision: true,
    revision: null,
    conteos: [],
  };
  const conteo = (estado: Conteo['estado'], esperada: number, encontrada: number): Conteo => ({
    id: 'c1',
    insumoId: 'gasa',
    insumoNombre: 'Gasa',
    loteId: 'lote-1',
    numeroLote: 'L1',
    equipoId: null,
    numeroSerie: null,
    perfilDetalleId: null,
    cantidadEsperada: esperada,
    cantidadEncontrada: encontrada,
    estado,
    observaciones: null,
    creadoEn: '2026-11-11T10:05:00.000Z',
  });

  it('un faltante propone ajustar o reponer la diferencia', () => {
    const [ajuste, reponer] = propuestasNovedad(verificacion, conteo('faltante', 10, 7.5));
    expect(ajuste?.borrador).toMatchObject({ tipo: 'ajuste', sentidoAjuste: 'disminuir', origenUbicacionId: 'ubi-amb', lineas: [{ loteId: 'lote-1', cantidad: 2.5 }] });
    expect(reponer?.borrador).toMatchObject({ tipo: 'transferencia', destinoUbicacionId: 'ubi-amb', lineas: [{ insumoId: 'gasa', cantidad: 2.5 }] });
  });

  it('un sobrante propone un ajuste que aumenta y un vencido, la baja', () => {
    expect(propuestasNovedad(verificacion, conteo('sobrante', 5, 8))[0]?.borrador).toMatchObject({ sentidoAjuste: 'aumentar', destinoUbicacionId: 'ubi-amb', lineas: [{ cantidad: 3 }] });
    const [baja, devolucion] = propuestasNovedad(verificacion, conteo('vencido', 4, 4));
    expect(baja?.borrador).toMatchObject({ tipo: 'baja', origenUbicacionId: 'ubi-amb', lineas: [{ cantidad: 4 }] });
    // O se devuelve a una bodega, que elige quien registra.
    expect(devolucion?.borrador).toMatchObject({ tipo: 'devolucion', origenUbicacionId: 'ubi-amb', lineas: [{ cantidad: 4 }] });
    expect(propuestasNovedad(verificacion, conteo('conforme', 4, 4))).toEqual([]);
  });
});

describe('resolución propuesta', () => {
  it('cita los movimientos creados al corregir', () => {
    expect(proponerResolucion([])).toBe('');
    expect(
      proponerResolucion([
        { codigo: 'MOV-1', tipo: 'transferencia', estado: 'confirmado' },
        { codigo: 'MOV-2', tipo: 'baja', estado: 'borrador' },
      ]),
    ).toBe('Corregido con: Transferencia MOV-1; Baja MOV-2 (en borrador).');
  });
});
