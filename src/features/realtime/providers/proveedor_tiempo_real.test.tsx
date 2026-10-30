import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ProveedorNotificaciones } from '../../../providers/proveedor_notificaciones';
import { IndicadorConexion } from '../components/indicador_conexion';
import { ProveedorTiempoReal } from './proveedor_tiempo_real';

/** Conexión simulada: guarda los manejadores para disparar lo que haría el servidor. */
const simulada = vi.hoisted(() => {
  const estado = {
    alEvento: (_tipo: string, _carga: unknown) => {},
    alDesconectarse: (_porElServidor: boolean) => {},
    conectar: vi.fn(),
    cerrar: vi.fn(),
  };
  return {
    estado,
    crear: vi.fn(() => ({
      alRecibirEvento: (manejador: typeof estado.alEvento) => {
        estado.alEvento = manejador;
      },
      alDesconectarse: (manejador: typeof estado.alDesconectarse) => {
        estado.alDesconectarse = manejador;
      },
      alFallarConexion: () => {},
      conectar: estado.conectar,
      cerrar: estado.cerrar,
    })),
  };
});

vi.mock('../../../services/socket.service', () => ({ crearConexionTiempoReal: simulada.crear }));

function renderizar(alSesionInvalida = vi.fn()) {
  const clienteConsultas = new QueryClient();
  const invalidar = vi.spyOn(clienteConsultas, 'invalidateQueries');
  render(
    <QueryClientProvider client={clienteConsultas}>
      <ProveedorNotificaciones>
        <ProveedorTiempoReal usuarioId="yo" alSesionInvalida={alSesionInvalida} url="http://localhost:3001">
          <IndicadorConexion />
        </ProveedorTiempoReal>
      </ProveedorNotificaciones>
    </QueryClientProvider>,
  );
  return { invalidar, alSesionInvalida };
}

beforeEach(() => {
  simulada.estado.conectar.mockClear();
  simulada.estado.cerrar.mockClear();
});

afterEach(() => vi.useRealTimers());

describe('ProveedorTiempoReal', () => {
  it('al conectar muestra "En línea" y reconsulta el REST', () => {
    const { invalidar } = renderizar();
    expect(screen.getByRole('status')).toHaveTextContent('Conectando…');

    act(() => simulada.estado.alEvento('conectado', { usuarioId: 'yo', rol: 'despachador', salas: ['central'] }));

    expect(screen.getByRole('status')).toHaveTextContent('En línea');
    expect(invalidar).toHaveBeenCalledWith();
  });

  it('si el servidor rechaza la sesión la cierra y no reintenta', () => {
    const { alSesionInvalida } = renderizar();

    act(() => simulada.estado.alEvento('error_autenticacion', { mensaje: 'Token vencido' }));

    expect(alSesionInvalida).toHaveBeenCalledTimes(1);
    expect(simulada.estado.cerrar).toHaveBeenCalled();
  });

  it('si el servidor corta la conexión reintenta con espera progresiva', () => {
    vi.useFakeTimers();
    renderizar();
    expect(simulada.estado.conectar).toHaveBeenCalledTimes(1);

    act(() => simulada.estado.alDesconectarse(true));
    expect(screen.getByRole('status')).toHaveTextContent('Reconectando…');

    act(() => vi.advanceTimersByTime(999));
    expect(simulada.estado.conectar).toHaveBeenCalledTimes(1);
    act(() => vi.advanceTimersByTime(1));
    expect(simulada.estado.conectar).toHaveBeenCalledTimes(2);

    act(() => simulada.estado.alDesconectarse(true));
    act(() => vi.advanceTimersByTime(1_999));
    expect(simulada.estado.conectar).toHaveBeenCalledTimes(2);
    act(() => vi.advanceTimersByTime(1));
    expect(simulada.estado.conectar).toHaveBeenCalledTimes(3);
  });

  it('avisa una emergencia nueva registrada por otra persona', () => {
    renderizar();

    act(() =>
      simulada.estado.alEvento('emergencia.creada', {
        id: 'ev-1',
        tipo: 'emergencia.creada',
        ocurridoEn: '2026-10-24T14:00:00.000Z',
        datos: {
          emergencia: { id: 'em-1', numeroEmergencia: 'EMG-20261024-0007', prioridad: null, recibidaPor: { id: 'otra' } },
        },
      }),
    );

    expect(screen.getByText('Nueva emergencia')).toBeInTheDocument();
    expect(screen.getByText('EMG-20261024-0007')).toBeInTheDocument();
  });
});
