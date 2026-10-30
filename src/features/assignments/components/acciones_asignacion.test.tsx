import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { crearClienteConsultas } from '../../../app/cliente_consultas';
import { ProveedorNotificaciones } from '../../../providers/proveedor_notificaciones';
import type { Asignacion } from '../types/asignacion.types';
import { AccionesAsignacion } from './acciones_asignacion';

const servicio = vi.hoisted(() => ({ marcarAvance: vi.fn(), cancelarAsignacion: vi.fn() }));

vi.mock('../services/asignaciones.service', () => servicio);

const base: Asignacion = {
  id: 'a1',
  emergenciaId: 'e1',
  numeroEmergencia: 'EMG-20261024-0004',
  ambulanciaId: 'amb-1',
  ambulanciaCodigo: 'AMB-01',
  turnoId: 't1',
  estado: 'asignada',
  siguientesEstados: ['en_camino'],
  motivoCancelacion: null,
  asignadaPor: null,
  asignadaEn: '2026-10-24T14:30:00.000Z',
  salidaEn: null,
  llegadaEscenaEn: null,
  atencionInicioEn: null,
  salidaEscenaEn: null,
  llegadaDestinoEn: null,
  finalizadaEn: null,
};

beforeAll(() => {
  // jsdom no implementa los diálogos modales nativos.
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function close() {
    this.removeAttribute('open');
  };
});

beforeEach(() => servicio.marcarAvance.mockReset());

function renderizar(asignacion: Asignacion) {
  render(
    <QueryClientProvider client={crearClienteConsultas()}>
      <ProveedorNotificaciones>
        <AccionesAsignacion asignacion={asignacion} />
      </ProveedorNotificaciones>
    </QueryClientProvider>,
  );
}

describe('AccionesAsignacion', () => {
  it('muestra el siguiente paso y permite cancelar mientras no llegue a la escena', async () => {
    servicio.marcarAvance.mockResolvedValue({ ...base, estado: 'en_camino' });
    renderizar(base);

    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Salió hacia la escena' }));

    await waitFor(() => expect(servicio.marcarAvance).toHaveBeenCalledWith('a1', 'en_camino', undefined));
  });

  it('la llegada a la escena no se ofrece: la marca el conductor desde la app', () => {
    renderizar({ ...base, estado: 'en_camino', siguientesEstados: ['en_escena'] });

    expect(screen.queryByRole('button', { name: 'Llegó a la escena' })).not.toBeInTheDocument();
    expect(screen.getByText('La llegada la marca el conductor desde la app.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
  });

  it('cerrar sin traslado exige el motivo y lo envía', async () => {
    servicio.marcarAvance.mockResolvedValue({ ...base, estado: 'finalizada' });
    renderizar({ ...base, estado: 'atendiendo', siguientesEstados: ['trasladando', 'finalizada'] });

    expect(screen.queryByRole('button', { name: 'Cancelar' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Paciente a bordo' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Cerrar sin traslado' }));
    await userEvent.click(screen.getByRole('button', { name: 'Cerrar servicio' }));

    expect(await screen.findByText(/Explica por qué se cierra sin traslado/)).toBeInTheDocument();
    expect(servicio.marcarAvance).not.toHaveBeenCalled();

    await userEvent.type(screen.getByLabelText(/Motivo del cierre/), 'Atendido en el sitio');
    await userEvent.click(screen.getByRole('button', { name: 'Cerrar servicio' }));

    await waitFor(() => expect(servicio.marcarAvance).toHaveBeenCalledWith('a1', 'finalizada', 'Atendido en el sitio'));
  });

  it('con el paciente a bordo, finalizar es la entrega y no pide motivo', async () => {
    renderizar({ ...base, estado: 'trasladando', siguientesEstados: ['finalizada'] });

    await userEvent.click(screen.getByRole('button', { name: 'Paciente entregado' }));

    expect(screen.getByRole('heading', { name: 'Paciente entregado' })).toBeInTheDocument();
    expect(screen.queryByLabelText(/Motivo del cierre/)).not.toBeInTheDocument();
  });

  it('sin siguientes pasos no muestra acciones', () => {
    renderizar({ ...base, estado: 'finalizada', siguientesEstados: [] });
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });
});
