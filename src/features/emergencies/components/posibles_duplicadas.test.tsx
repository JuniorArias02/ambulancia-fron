import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { crearClienteConsultas } from '../../../app/cliente_consultas';
import { ProveedorNotificaciones } from '../../../providers/proveedor_notificaciones';
import type { Emergencia } from '../types/emergencia.types';
import { PosiblesDuplicadas } from './posibles_duplicadas';

const servicio = vi.hoisted(() => ({
  listarPosiblesDuplicadas: vi.fn(),
  marcarDuplicada: vi.fn(),
}));

vi.mock('../services/emergencias.service', () => servicio);

const base: Emergencia = {
  id: 'nueva',
  numeroEmergencia: 'EMG-20261024-0002',
  fuente: 'telefono',
  informanteNombre: null,
  informanteTelefono: null,
  descripcion: 'Accidente en la calle 72',
  tipoIncidente: 'accidente_transito',
  prioridad: null,
  direccion: 'Calle 72 # 15-20',
  referenciaLugar: null,
  coordenadas: null,
  numeroVictimas: null,
  estado: 'recibida',
  emergenciaPrincipalId: null,
  informanteUsuarioId: null,
  origenUbicacion: null,
  recibidaPor: null,
  recibidaEn: '2026-10-24T12:05:00.000Z',
  cerradaEn: null,
};

const original: Emergencia = { ...base, id: 'original', numeroEmergencia: 'EMG-20261024-0001', prioridad: 'amarilla' };

beforeAll(() => {
  // jsdom no implementa los diálogos modales nativos.
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function close() {
    this.removeAttribute('open');
  };
});

function renderizar() {
  render(
    <QueryClientProvider client={crearClienteConsultas()}>
      <ProveedorNotificaciones>
        <MemoryRouter>
          <PosiblesDuplicadas emergencia={base} ahora={new Date('2026-10-24T12:06:00.000Z').getTime()} />
        </MemoryRouter>
      </ProveedorNotificaciones>
    </QueryClientProvider>,
  );
}

describe('PosiblesDuplicadas', () => {
  it('avisa cuando no hay coincidencias', async () => {
    servicio.listarPosiblesDuplicadas.mockResolvedValue([]);
    renderizar();

    expect(await screen.findByText(/No se encontraron emergencias activas/)).toBeInTheDocument();
  });

  it('marca la nueva llamada como duplicada de la original tras confirmar', async () => {
    servicio.listarPosiblesDuplicadas.mockResolvedValue([
      { emergencia: original, distanciaMetros: 99, criterios: ['cercania', 'misma_direccion', 'mismo_tipo'] },
    ]);
    servicio.marcarDuplicada.mockResolvedValue({ ...base, estado: 'cancelada', emergenciaPrincipalId: 'original' });
    renderizar();

    expect(await screen.findByText('a 99 m, misma dirección, mismo tipo')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Es la misma emergencia' }));
    expect(servicio.marcarDuplicada).not.toHaveBeenCalled();

    const confirmar = screen.getAllByRole('button', { name: 'Es la misma emergencia' }).at(-1);
    if (!confirmar) throw new Error('Falta el botón de confirmación');
    await userEvent.click(confirmar);

    await waitFor(() => expect(servicio.marcarDuplicada).toHaveBeenCalledWith('nueva', 'original'));
  });
});
