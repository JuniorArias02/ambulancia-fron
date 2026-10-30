import { QueryClient } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';
import type { ResultadoPaginado } from '../../../types/paginacion.types';
import { CLAVES_AMBULANCIAS } from '../../ambulances/constants/ambulancias';
import type { Ambulancia } from '../../ambulances/types/ambulancia.types';
import { CLAVES_ASIGNACIONES } from '../../assignments/constants/asignaciones';
import type { Ruta } from '../../assignments/schemas/ruta.schema';
import { rutaDePrueba } from '../../../test/datos_prueba';
import { leerEvento } from '../schemas/eventos.schema';
import type { PuntoRecorrido } from '../../assignments/types/asignacion.types';
import { CLAVES_EMERGENCIAS } from '../../emergencies/constants/emergencias';
import type { EventoTiempoReal } from '../types/tiempo_real.types';
import { aplicarEvento } from './aplicar_evento';

const ambulancia: Ambulancia = {
  id: 'amb-1',
  codigo: 'AMB-01',
  placa: 'ABC123',
  tipo: { id: 'tam', nombre: 'TAM', descripcion: null },
  estadoOperativo: 'en_servicio',
  ultimaUbicacion: { latitud: 7.8, longitud: -72.5, registradaEn: '2026-10-24T14:00:00.000Z' },
  creadaEn: '2026-10-01T00:00:00.000Z',
};

const filtrosLista = { pagina: 1, limite: 100 };

function preparar() {
  const clienteConsultas = new QueryClient();
  const cola = { agregar: vi.fn(), descartar: vi.fn() };
  const notificar = vi.fn();
  clienteConsultas.setQueryData<ResultadoPaginado<Ambulancia>>(CLAVES_AMBULANCIAS.lista(filtrosLista), {
    datos: [ambulancia],
    total: 1,
    pagina: 1,
    limite: 100,
  });
  clienteConsultas.setQueryData<PuntoRecorrido[]>(CLAVES_ASIGNACIONES.recorrido('asig-1'), []);
  const aplicar = (evento: EventoTiempoReal) =>
    aplicarEvento(evento, { clienteConsultas, cola, notificar, usuarioId: 'yo' });
  const posicionEnLista = () =>
    clienteConsultas.getQueryData<ResultadoPaginado<Ambulancia>>(CLAVES_AMBULANCIAS.lista(filtrosLista))?.datos[0]
      ?.ultimaUbicacion;
  return { clienteConsultas, cola, notificar, aplicar, posicionEnLista };
}

const gps = (registradaEn: string, latitud: number): EventoTiempoReal => ({
  id: `gps-${registradaEn}`,
  ocurridoEn: registradaEn,
  tipo: 'ambulancia.ubicacion_actualizada',
  datos: { ambulanciaId: 'amb-1', asignacionId: 'asig-1', latitud, longitud: -72.5, velocidad: 30, registradaEn },
});

describe('aplicarEvento · GPS', () => {
  it('mueve la ambulancia en los listados y agrega el punto al recorrido sin recargar', () => {
    const { clienteConsultas, cola, aplicar, posicionEnLista } = preparar();

    aplicar(gps('2026-10-24T14:00:03.000Z', 7.81));

    expect(posicionEnLista()).toEqual({ latitud: 7.81, longitud: -72.5, registradaEn: '2026-10-24T14:00:03.000Z' });
    expect(clienteConsultas.getQueryData<PuntoRecorrido[]>(CLAVES_ASIGNACIONES.recorrido('asig-1'))).toHaveLength(1);
    expect(cola.agregar).not.toHaveBeenCalled();
  });

  it('también mueve la ambulancia en la flota completa del mapa', () => {
    const { clienteConsultas, aplicar } = preparar();
    clienteConsultas.setQueryData<ResultadoPaginado<Ambulancia>>(CLAVES_AMBULANCIAS.flota, {
      datos: [ambulancia],
      total: 1,
      pagina: 1,
      limite: 1,
    });

    aplicar(gps('2026-10-24T14:00:06.000Z', 7.82));

    expect(
      clienteConsultas.getQueryData<ResultadoPaginado<Ambulancia>>(CLAVES_AMBULANCIAS.flota)?.datos[0]?.ultimaUbicacion
        ?.latitud,
    ).toBe(7.82);
  });

  it('no reemplaza una posición más reciente con una lectura vieja', () => {
    const { aplicar, posicionEnLista } = preparar();

    aplicar(gps('2026-10-24T13:59:00.000Z', 7.7));

    expect(posicionEnLista()?.latitud).toBe(7.8);
  });
});

describe('aplicarEvento · emergencias', () => {
  const creada = (recibidaPor: string): EventoTiempoReal => ({
    id: `e-${recibidaPor}`,
    ocurridoEn: '2026-10-24T14:00:00.000Z',
    tipo: 'emergencia.creada',
    datos: {
      emergencia: { id: 'em-1', numeroEmergencia: 'EMG-20261024-0005', prioridad: 'roja', recibidaPor: { id: recibidaPor } },
    },
  });

  it('recarga listados y detalle y avisa de la emergencia que registró otra persona', () => {
    const { cola, notificar, aplicar } = preparar();

    aplicar(creada('otro'));

    expect(cola.agregar).toHaveBeenCalledWith(CLAVES_EMERGENCIAS.listas);
    expect(cola.agregar).toHaveBeenCalledWith(CLAVES_EMERGENCIAS.detalle('em-1'));
    expect(notificar).toHaveBeenCalledWith(
      expect.objectContaining({ titulo: 'Nueva emergencia', descripcion: 'EMG-20261024-0005 · prioridad roja' }),
    );
  });

  it('no avisa a quien la registró', () => {
    const { notificar, aplicar } = preparar();
    aplicar(creada('yo'));
    expect(notificar).not.toHaveBeenCalled();
  });
});

describe('aplicarEvento · ciclo de atención', () => {
  const actualizada = (estado: string): EventoTiempoReal => ({
    id: `asig-${estado}`,
    ocurridoEn: '2026-10-25T20:02:40.000Z',
    tipo: 'asignacion.actualizada',
    datos: {
      asignacion: {
        id: 'asig-1',
        emergenciaId: 'em-1',
        ambulanciaId: 'amb-2',
        estado,
        ambulanciaCodigo: 'AMB-02',
        numeroEmergencia: 'EMG-20261025-0001',
      },
    },
  });

  it('avisa a la central cuando la ambulancia recoge al paciente', () => {
    const { cola, notificar, aplicar } = preparar();

    aplicar(actualizada('trasladando'));

    expect(cola.agregar).toHaveBeenCalledWith(CLAVES_ASIGNACIONES.todas);
    expect(notificar).toHaveBeenCalledWith(
      expect.objectContaining({
        titulo: 'Paciente a bordo',
        descripcion: expect.stringMatching(/^AMB-02 recogió al paciente de EMG-20261025-0001 · /),
      }),
    );
  });

  it('avisa la llegada a la escena y no avisa los demás pasos', () => {
    const { notificar, aplicar } = preparar();
    aplicar(actualizada('en_escena'));
    aplicar(actualizada('atendiendo'));
    expect(notificar).toHaveBeenCalledTimes(1);
    expect(notificar).toHaveBeenCalledWith(expect.objectContaining({ titulo: 'AMB-02 llegó a la escena' }));
  });
});

describe('aplicarEvento · rutas', () => {
  const evento = (ruta: Ruta): EventoTiempoReal => ({
    id: `ruta-${ruta.calculadaEn}`,
    ocurridoEn: ruta.calculadaEn,
    tipo: 'asignacion.ruta_actualizada',
    datos: { ruta },
  });

  it('reemplaza la línea de ese servicio por la ruta recalculada', () => {
    const { clienteConsultas, aplicar } = preparar();
    clienteConsultas.setQueryData<Ruta[]>(CLAVES_ASIGNACIONES.rutasActivas, [rutaDePrueba]);
    const desvio = { ...rutaDePrueba, motivo: 'desvio', calculadaEn: '2026-10-24T23:53:00.000Z', duracionSegundos: 120 };

    aplicar(evento(desvio));

    expect(clienteConsultas.getQueryData<Ruta[]>(CLAVES_ASIGNACIONES.rutasActivas)).toEqual([desvio]);
  });

  it('actualiza también el mapa del servicio abierto, que esperaba la ruta', () => {
    const { clienteConsultas, aplicar } = preparar();
    clienteConsultas.setQueryData<Ruta | null>(CLAVES_ASIGNACIONES.ruta(rutaDePrueba.asignacionId), null);

    aplicar(evento(rutaDePrueba));

    expect(clienteConsultas.getQueryData(CLAVES_ASIGNACIONES.ruta(rutaDePrueba.asignacionId))).toEqual(rutaDePrueba);
  });

  it('ignora una ruta más vieja que la que ya se muestra', () => {
    const { clienteConsultas, aplicar } = preparar();
    clienteConsultas.setQueryData<Ruta[]>(CLAVES_ASIGNACIONES.rutasActivas, [rutaDePrueba]);

    aplicar(evento({ ...rutaDePrueba, calculadaEn: '2026-10-24T23:40:00.000Z' }));

    expect(clienteConsultas.getQueryData<Ruta[]>(CLAVES_ASIGNACIONES.rutasActivas)).toEqual([rutaDePrueba]);
  });

  it('rechaza una ruta con geometría mal formada', () => {
    const sobre = { id: 'e', ocurridoEn: rutaDePrueba.calculadaEn };
    expect(leerEvento('asignacion.ruta_actualizada', { ...sobre, datos: { ruta: rutaDePrueba } })).not.toBeNull();
    expect(
      leerEvento('asignacion.ruta_actualizada', {
        ...sobre,
        datos: { ruta: { ...rutaDePrueba, geometria: { type: 'LineString', coordinates: [[-72.5]] } } },
      }),
    ).toBeNull();
  });
});
