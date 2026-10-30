import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { crearClienteConsultas } from '../../../app/cliente_consultas';
import type { EventoAsignacion } from '../types/asignacion.types';
import { BitacoraServicio } from './bitacora_servicio';

const servicio = vi.hoisted(() => ({ listarEventosAsignacion: vi.fn() }));

vi.mock('../services/asignaciones.service', () => servicio);

const evento = (cambios: Partial<EventoAsignacion>): EventoAsignacion => ({
  id: 'e1',
  estadoAnterior: null,
  estadoNuevo: 'asignada',
  ocurridoEn: '2026-10-25T19:45:17.000Z',
  responsable: { id: 'u1', nombreCompleto: 'Laura Gómez', rol: 'despachador' },
  posicion: null,
  precisionMetros: null,
  distanciaEscenaMetros: null,
  fueraDeRadio: false,
  observacion: null,
  ...cambios,
});

describe('BitacoraServicio', () => {
  it('muestra cada paso con su responsable y resalta la llegada fuera de radio', async () => {
    servicio.listarEventosAsignacion.mockResolvedValue([
      evento({}),
      evento({
        id: 'e2',
        estadoAnterior: 'en_camino',
        estadoNuevo: 'en_escena',
        responsable: { id: 'u2', nombreCompleto: 'Carlos Pérez', rol: 'conductor' },
        distanciaEscenaMetros: 320,
        fueraDeRadio: true,
        observacion: 'La vía estaba cerrada',
      }),
    ]);
    render(
      <QueryClientProvider client={crearClienteConsultas()}>
        <BitacoraServicio asignacionId="asig-1" enVivo={false} />
      </QueryClientProvider>,
    );

    expect(await screen.findByText('Despachada')).toBeInTheDocument();
    expect(screen.getByText('por Laura Gómez (despachador)')).toBeInTheDocument();
    expect(screen.getByText('Llegó a la escena')).toBeInTheDocument();
    expect(screen.getByText('· a 320 m')).toBeInTheDocument();
    expect(screen.getByText('Llegada marcada lejos de la emergencia.')).toBeInTheDocument();
    expect(screen.getByText('Motivo: La vía estaba cerrada')).toBeInTheDocument();
  });
});
