import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { crearClienteConsultas } from '../../../app/cliente_consultas';
import { ProveedorNotificaciones } from '../../../providers/proveedor_notificaciones';
import { ErrorApi } from '../../../services/error_api';
import { PaginaTurnos } from '../pages/pagina_turnos';
import type { Turno } from '../types/turno.types';
import { DialogoFinalizarTurno } from './dialogo_finalizar_turno';
import { TripulacionAmbulancia } from './tripulacion_ambulancia';

const servicio = vi.hoisted(() => ({ listarTurnos: vi.fn(), finalizarTurno: vi.fn() }));
const flota = vi.hoisted(() => ({ listarFlota: vi.fn() }));

vi.mock('../services/turnos.service', () => servicio);
vi.mock('../../ambulances/services/ambulancias.service', () => flota);

const turno: Turno = {
  id: 't1',
  ambulanciaId: 'amb-3',
  ambulanciaCodigo: 'AMB-03',
  inicio: '2026-11-01T18:28:16.932Z',
  fin: null,
  estado: 'activo',
  integrantes: [{ usuarioId: 'u1', nombreCompleto: 'Pedro Díaz', funcion: 'conductor' }],
  tripulacionCompleta: false,
};

const paginado = (datos: Turno[]) => ({ datos, total: datos.length, pagina: 1, limite: 100 });

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
  servicio.listarTurnos.mockReset();
  servicio.finalizarTurno.mockReset();
  flota.listarFlota.mockReset().mockResolvedValue({ datos: [], total: 0, pagina: 1, limite: 100 });
});

function renderizar(contenido: ReactNode, ruta = '/turnos') {
  render(
    <QueryClientProvider client={crearClienteConsultas()}>
      <ProveedorNotificaciones>
        <MemoryRouter initialEntries={[ruta]}>{contenido}</MemoryRouter>
      </ProveedorNotificaciones>
    </QueryClientProvider>,
  );
}

describe('PaginaTurnos', () => {
  it('solo consulta: no permite iniciar turnos, cambiar tripulación ni habilitar', async () => {
    servicio.listarTurnos.mockResolvedValue(paginado([turno]));
    renderizar(<PaginaTurnos />);

    expect(await screen.findByText('Pedro Díaz')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cerrar turno' })).toBeInTheDocument();
    for (const accion of ['Iniciar turno', 'Cambiar tripulación', 'Habilitar']) {
      expect(screen.queryByRole('button', { name: accion })).not.toBeInTheDocument();
    }
  });

  it('ignora el antiguo enlace con ?iniciar= sin abrir ningún formulario', async () => {
    servicio.listarTurnos.mockResolvedValue(paginado([]));
    renderizar(<PaginaTurnos />, '/turnos?iniciar=amb-3');

    expect(await screen.findByText('Ninguna ambulancia tiene tripulación')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

describe('TripulacionAmbulancia', () => {
  it('sin turno explica que la tripulación se elige desde la app, sin enlaces', async () => {
    servicio.listarTurnos.mockResolvedValue(paginado([]));
    renderizar(<TripulacionAmbulancia ambulanciaId="amb-3" />);

    expect(await screen.findByText(/Sin tripulación\. El conductor y el paramédico/)).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('con una sola persona indica qué falta', async () => {
    servicio.listarTurnos.mockResolvedValue(paginado([turno]));
    renderizar(<TripulacionAmbulancia ambulanciaId="amb-3" />);

    expect(await screen.findByText('Pedro Díaz')).toBeInTheDocument();
    expect(screen.getByText('Falta el paramédico o médico.')).toBeInTheDocument();
  });

  it('con la tripulación completa no muestra aviso', async () => {
    servicio.listarTurnos.mockResolvedValue(paginado([{ ...turno, tripulacionCompleta: true }]));
    renderizar(<TripulacionAmbulancia ambulanciaId="amb-3" />);

    expect(await screen.findByText('Pedro Díaz')).toBeInTheDocument();
    expect(screen.queryByText(/Falta/)).not.toBeInTheDocument();
  });
});

describe('DialogoFinalizarTurno', () => {
  it('explica para qué sirve y cierra el turno', async () => {
    servicio.finalizarTurno.mockResolvedValue({ ...turno, estado: 'finalizado' });
    const alCerrar = vi.fn();
    renderizar(<DialogoFinalizarTurno turno={turno} estadoAmbulancia="disponible" alCerrar={alCerrar} />);

    expect(screen.getByText(/alguien olvidó salir o perdió el celular/)).toHaveTextContent('pasará a fuera de servicio');
    await userEvent.click(screen.getByRole('button', { name: 'Cerrar turno' }));

    await waitFor(() => expect(alCerrar).toHaveBeenCalled());
    expect(servicio.finalizarTurno.mock.calls[0]?.[0]).toBe('t1');
  });

  it('con servicio en curso no deja cerrarlo', () => {
    renderizar(<DialogoFinalizarTurno turno={turno} estadoAmbulancia="en_servicio" alCerrar={vi.fn()} />);

    expect(screen.getByText(/finalízalo antes de cerrar el turno/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cerrar turno' })).toBeDisabled();
  });

  it('muestra el error si otro usuario lo cerró antes', async () => {
    servicio.finalizarTurno.mockRejectedValue(new ErrorApi(409, 'El turno ya fue cerrado por otro usuario'));
    const alCerrar = vi.fn();
    renderizar(<DialogoFinalizarTurno turno={turno} alCerrar={alCerrar} />);

    await userEvent.click(screen.getByRole('button', { name: 'Cerrar turno' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('ya fue cerrado por otro usuario');
    expect(alCerrar).not.toHaveBeenCalled();
  });
});
