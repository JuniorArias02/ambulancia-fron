import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { crearClienteConsultas } from '../../../app/cliente_consultas';
import { ProveedorNotificaciones } from '../../../providers/proveedor_notificaciones';
import { ErrorApi } from '../../../services/error_api';
import type { Ambulancia } from '../types/ambulancia.types';
import { DialogoCambiarEstadoAmbulancia } from './dialogo_cambiar_estado_ambulancia';

const servicio = vi.hoisted(() => ({
  obtenerAmbulancia: vi.fn(),
  cambiarEstadoAmbulancia: vi.fn(),
}));

vi.mock('../services/ambulancias.service', () => servicio);

const base: Ambulancia = {
  id: '6f1c2f1e-0000-4000-8000-000000000001',
  codigo: 'AMB-01',
  placa: 'ABC123',
  tipo: { id: 'tipo-tam', nombre: 'TAM', descripcion: 'Transporte Asistencial Medicalizado' },
  estadoOperativo: 'disponible',
  ultimaUbicacion: null,
  creadaEn: '2026-10-24T11:00:00.000Z',
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

beforeEach(() => {
  servicio.obtenerAmbulancia.mockReset();
  servicio.cambiarEstadoAmbulancia.mockReset();
});

function renderizar(ambulancia: Ambulancia) {
  render(
    <QueryClientProvider client={crearClienteConsultas()}>
      <ProveedorNotificaciones>
        <MemoryRouter>
          <DialogoCambiarEstadoAmbulancia ambulancia={ambulancia} alCerrar={vi.fn()} />
        </MemoryRouter>
      </ProveedorNotificaciones>
    </QueryClientProvider>,
  );
}

const botonEnviar = () => screen.getByRole('button', { name: 'Cambiar estado' });

describe('DialogoCambiarEstadoAmbulancia', () => {
  it('solo ofrece las transiciones permitidas desde el estado actual', async () => {
    servicio.obtenerAmbulancia.mockResolvedValue(base);
    renderizar(base);

    const opciones = await screen.findAllByRole('radio');
    expect(opciones).toHaveLength(2);
    expect(screen.getByRole('radio', { name: /Fuera de servicio/ })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /En mantenimiento/ })).toBeInTheDocument();
    expect(screen.queryByRole('radio', { name: /En servicio/ })).not.toBeInTheDocument();
  });

  it('no permite cambiar el estado de una ambulancia en servicio', async () => {
    const enServicio: Ambulancia = { ...base, estadoOperativo: 'en_servicio' };
    servicio.obtenerAmbulancia.mockResolvedValue(enServicio);
    renderizar(enServicio);

    expect(await screen.findByText(/está en servicio/)).toBeInTheDocument();
    expect(screen.queryAllByRole('radio')).toHaveLength(0);
    expect(botonEnviar()).toBeDisabled();
  });

  it('ante un conflicto recarga la ambulancia y muestra su estado real', async () => {
    servicio.obtenerAmbulancia
      .mockResolvedValueOnce(base)
      .mockResolvedValue({ ...base, estadoOperativo: 'mantenimiento' });
    servicio.cambiarEstadoAmbulancia.mockRejectedValue(
      new ErrorApi(409, 'El estado de la ambulancia cambió mientras tanto; vuelva a consultarla'),
    );
    renderizar(base);

    await waitFor(() => expect(botonEnviar()).toBeEnabled());
    await userEvent.click(screen.getByRole('radio', { name: /Fuera de servicio/ }));
    await userEvent.type(screen.getByLabelText(/Motivo/), 'Fin de turno');
    await userEvent.click(botonEnviar());

    expect(await screen.findByText(/cambió mientras tanto/)).toBeInTheDocument();
    expect(await screen.findByRole('radio', { name: /Disponible/ })).toBeInTheDocument();
    expect(screen.queryByRole('radio', { name: /En mantenimiento/ })).not.toBeInTheDocument();
    expect(servicio.obtenerAmbulancia).toHaveBeenCalledTimes(2);
  });

  it('si falta el turno ofrece iniciarlo para esa ambulancia', async () => {
    const fueraServicio: Ambulancia = { ...base, estadoOperativo: 'fuera_servicio' };
    servicio.obtenerAmbulancia.mockResolvedValue(fueraServicio);
    servicio.cambiarEstadoAmbulancia.mockRejectedValue(
      new ErrorApi(422, 'La ambulancia no tiene un turno activo; inicie un turno antes de habilitarla'),
    );
    renderizar(fueraServicio);

    await waitFor(() => expect(botonEnviar()).toBeEnabled());
    await userEvent.click(screen.getByRole('radio', { name: /Disponible/ }));
    await userEvent.type(screen.getByLabelText(/Motivo/), 'Inicio de turno');
    await userEvent.click(botonEnviar());

    const enlace = await screen.findByRole('link', { name: 'Iniciar turno' });
    expect(enlace).toHaveAttribute('href', `/turnos?iniciar=${base.id}`);
  });
});
