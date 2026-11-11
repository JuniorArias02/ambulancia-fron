import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { crearClienteConsultas } from '../../../app/cliente_consultas';
import { ProveedorNotificaciones } from '../../../providers/proveedor_notificaciones';
import { ErrorApi } from '../../../services/error_api';
import type { VerificacionDetalle } from '../types/verificacion.types';
import { PaginaDetalleVerificacion } from './pagina_detalle_verificacion';
import { PaginaVerificaciones } from './pagina_verificaciones';

const servicio = vi.hoisted(() => ({
  listarVerificaciones: vi.fn(),
  obtenerVerificacion: vi.fn(),
  obtenerFotoDocumento: vi.fn(),
  decidirVerificacion: vi.fn(),
}));

vi.mock('../services/verificaciones.service', () => servicio);

const ID = '6306702a-fa50-48e1-9370-9dd248140697';

const detalle: VerificacionDetalle = {
  usuarioId: ID,
  nombres: 'Carlos',
  apellidos: 'Pérez Díaz',
  tipoDocumento: 'CC',
  numeroDocumento: '88222333',
  correo: 'carlos.ciudadano@prueba.co',
  telefono: '+57 310 555 1234',
  estado: 'pendiente',
  enviadaEn: '2026-11-03T03:14:38.749Z',
  revisadaEn: null,
  fechaNacimiento: '1985-03-09',
  estadoCuenta: 'activo',
  registradoEn: '2026-11-03T03:14:38.749Z',
  motivo: null,
  revisadaPor: null,
  // A propósito en orden inverso: se ubican por lado.
  documentos: [
    { id: 'doc-posterior', lado: 'posterior', tipoMime: 'image/jpeg', tamanoBytes: 30720, cargadoEn: '2026-11-03T03:14:38.749Z' },
    { id: 'doc-frontal', lado: 'frontal', tipoMime: 'image/jpeg', tamanoBytes: 30720, cargadoEn: '2026-11-03T03:14:38.749Z' },
  ],
  historial: [
    {
      estadoAnterior: null,
      estadoNuevo: 'pendiente',
      motivo: null,
      observaciones: null,
      responsable: { id: ID, nombreCompleto: 'Carlos Pérez Díaz' },
      ocurridoEn: '2026-11-03T03:14:38.749Z',
    },
  ],
};

const urlsOriginales = { crear: URL.createObjectURL, liberar: URL.revokeObjectURL };

beforeAll(() => {
  // jsdom no implementa los diálogos modales nativos ni las URL de blobs.
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function close() {
    this.removeAttribute('open');
  };
  URL.createObjectURL = vi.fn(() => 'blob:foto');
  URL.revokeObjectURL = vi.fn();
});

afterAll(() => {
  URL.createObjectURL = urlsOriginales.crear;
  URL.revokeObjectURL = urlsOriginales.liberar;
});

beforeEach(() => {
  for (const funcion of Object.values(servicio)) funcion.mockReset();
  servicio.obtenerFotoDocumento.mockResolvedValue(new Blob(['x'], { type: 'image/jpeg' }));
});

function renderizar(ruta: string) {
  render(
    <QueryClientProvider client={crearClienteConsultas()}>
      <ProveedorNotificaciones>
        <MemoryRouter initialEntries={[ruta]}>
          <Routes>
            <Route path="/verificaciones-ciudadanos" element={<PaginaVerificaciones />} />
            <Route path="/verificaciones-ciudadanos/:usuarioId" element={<PaginaDetalleVerificacion />} />
          </Routes>
        </MemoryRouter>
      </ProveedorNotificaciones>
    </QueryClientProvider>,
  );
}

async function abrirDetalle(datos: VerificacionDetalle = detalle) {
  servicio.obtenerVerificacion.mockResolvedValue(datos);
  renderizar(`/verificaciones-ciudadanos/${ID}`);
  await screen.findByRole('heading', { name: 'Carlos Pérez Díaz' });
}

describe('PaginaVerificaciones', () => {
  it('abre en «Pendientes» y busca por número de documento sin llevarlo a la URL', async () => {
    servicio.listarVerificaciones.mockResolvedValue({ datos: [detalle], total: 1, pagina: 1, limite: 20 });
    renderizar('/verificaciones-ciudadanos');

    expect(await screen.findAllByText('88 222 333')).not.toHaveLength(0);
    expect(servicio.listarVerificaciones).toHaveBeenCalledWith(expect.objectContaining({ estado: 'pendiente', pagina: 1 }));
    expect(screen.getByRole('button', { name: 'Pendientes' })).toHaveAttribute('aria-pressed', 'true');

    await userEvent.type(screen.getByRole('searchbox', { name: 'Buscar solicitudes' }), '88222333');
    await waitFor(() =>
      expect(servicio.listarVerificaciones).toHaveBeenLastCalledWith(
        expect.objectContaining({ estado: 'pendiente', busqueda: '88222333' }),
      ),
    );
  });

  it('«Todas» consulta sin filtro de estado', async () => {
    servicio.listarVerificaciones.mockResolvedValue({ datos: [], total: 0, pagina: 1, limite: 20 });
    renderizar('/verificaciones-ciudadanos');
    await screen.findByText('No hay solicitudes pendientes');

    await userEvent.click(screen.getByRole('button', { name: 'Todas' }));
    await waitFor(() =>
      expect(servicio.listarVerificaciones).toHaveBeenLastCalledWith(expect.objectContaining({ estado: undefined })),
    );
  });
});

describe('PaginaDetalleVerificacion', () => {
  it('muestra el documento completo y las dos fotos ubicadas por lado', async () => {
    await abrirDetalle();

    expect(screen.getByText('88 222 333')).toBeInTheDocument();
    expect(await screen.findByRole('img', { name: 'Cara frontal' })).toHaveAttribute('src', 'blob:foto');
    expect(screen.getByRole('img', { name: 'Cara posterior' })).toBeInTheDocument();
    expect(servicio.obtenerFotoDocumento).toHaveBeenCalledWith(ID, 'doc-frontal', expect.any(AbortSignal));
    expect(servicio.obtenerFotoDocumento).toHaveBeenCalledWith(ID, 'doc-posterior', expect.any(AbortSignal));
  });

  it('el visor amplía, acerca y gira la foto', async () => {
    await abrirDetalle();
    await userEvent.click(await screen.findByRole('button', { name: 'Ampliar cara frontal' }));

    const visor = within(screen.getByRole('dialog', { name: 'Cara frontal' }));
    await userEvent.click(visor.getByRole('button', { name: 'Acercar' }));
    await userEvent.click(visor.getByRole('button', { name: 'Girar a la derecha' }));

    expect(visor.getByText('150%')).toBeInTheDocument();
    expect(visor.getByRole('img', { name: 'Cara frontal' }).style.transform).toBe('rotate(90deg)');
  });

  it('una foto que falla ofrece reintentar', async () => {
    servicio.obtenerFotoDocumento.mockRejectedValue(new ErrorApi(404, 'El recurso solicitado no existe.'));
    await abrirDetalle();

    expect(await screen.findAllByText('No se pudo cargar la foto')).toHaveLength(2);
    servicio.obtenerFotoDocumento.mockResolvedValue(new Blob(['x']));
    const [reintentar] = screen.getAllByRole('button', { name: 'Reintentar' });
    if (!reintentar) throw new Error('Sin botón de reintentar');
    await userEvent.click(reintentar);
    expect(await screen.findByRole('img', { name: 'Cara frontal' })).toBeInTheDocument();
  });

  it('pedir corrección exige motivo y reemplaza el detalle con la respuesta', async () => {
    await abrirDetalle();
    const motivo = 'La foto frontal está borrosa o cortada; tómela de nuevo completa y con buena luz.';
    servicio.decidirVerificacion.mockResolvedValue({
      ...detalle,
      estado: 'requiere_correccion',
      motivo,
      historial: [
        ...detalle.historial,
        {
          estadoAnterior: 'pendiente',
          estadoNuevo: 'requiere_correccion',
          motivo,
          observaciones: 'Nota interna',
          responsable: { id: 'admin', nombreCompleto: 'Administrador Sistema' },
          ocurridoEn: '2026-11-03T03:20:00.000Z',
        },
      ],
    });

    await userEvent.click(screen.getByRole('button', { name: 'Pedir corrección' }));
    const dialogo = within(screen.getByRole('dialog', { name: 'Pedir corrección' }));
    expect(dialogo.getByText('El ciudadano verá este texto en la app. No incluyas notas internas.')).toBeInTheDocument();
    expect(dialogo.getByText('Solo visible para administradores.')).toBeInTheDocument();

    await userEvent.click(dialogo.getByRole('button', { name: 'Pedir corrección' }));
    expect(await dialogo.findByText('Escribe el motivo que verá el ciudadano.')).toBeInTheDocument();
    expect(servicio.decidirVerificacion).not.toHaveBeenCalled();

    await userEvent.click(dialogo.getByRole('button', { name: motivo }));
    await userEvent.type(dialogo.getByLabelText(/Observaciones internas/), 'Nota interna');
    await userEvent.click(dialogo.getByRole('button', { name: 'Pedir corrección' }));

    await waitFor(() =>
      expect(servicio.decidirVerificacion).toHaveBeenCalledWith(ID, {
        decision: 'requiere_correccion',
        motivo,
        observaciones: 'Nota interna',
      }),
    );
    expect(await screen.findAllByText('Corrección pedida')).not.toHaveLength(0);
    expect(screen.queryByRole('button', { name: 'Aprobar' })).not.toBeInTheDocument();
    expect(screen.getByText('Nota interna')).toBeInTheDocument();
    // Solo se pidió el detalle al abrir: la respuesta de la decisión lo reemplaza.
    expect(servicio.obtenerVerificacion).toHaveBeenCalledTimes(1);
  });

  it('aprobar pide confirmación y deja la solicitud sin más acciones', async () => {
    await abrirDetalle({ ...detalle, estado: 'en_revision' });
    servicio.decidirVerificacion.mockResolvedValue({ ...detalle, estado: 'verificado' });

    expect(screen.queryByRole('button', { name: 'Tomar solicitud' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Aprobar' }));
    const dialogo = within(screen.getByRole('dialog', { name: 'Aprobar identidad' }));
    expect(dialogo.getByText('¿Confirmas que los datos coinciden con el documento?')).toBeInTheDocument();
    await userEvent.click(dialogo.getByRole('button', { name: 'Aprobar' }));

    await waitFor(() => expect(servicio.decidirVerificacion).toHaveBeenCalledWith(ID, { decision: 'verificado' }));
    expect(await screen.findByText('Identidad aprobada: el ciudadano ya puede reportar emergencias.')).toBeInTheDocument();
    for (const accion of ['Aprobar', 'Rechazar', 'Pedir corrección', 'Tomar solicitud']) {
      expect(screen.queryByRole('button', { name: accion })).not.toBeInTheDocument();
    }
  });

  it('rechazar advierte que es definitivo', async () => {
    await abrirDetalle();
    await userEvent.click(screen.getByRole('button', { name: 'Rechazar' }));
    expect(within(screen.getByRole('dialog', { name: 'Rechazar solicitud' })).getByText('El rechazo es definitivo.')).toBeInTheDocument();
  });

  it('si otro administrador decidió antes, avisa y recarga el detalle', async () => {
    await abrirDetalle();
    servicio.decidirVerificacion.mockRejectedValue(new ErrorApi(409, 'Conflicto'));
    servicio.obtenerVerificacion.mockResolvedValue({ ...detalle, estado: 'verificado' });

    await userEvent.click(screen.getByRole('button', { name: 'Tomar solicitud' }));

    expect(await screen.findByText('Otro administrador ya revisó esta solicitud.')).toBeInTheDocument();
    await waitFor(() => expect(servicio.obtenerVerificacion).toHaveBeenCalledTimes(2));
    expect(await screen.findByText('Identidad aprobada: el ciudadano ya puede reportar emergencias.')).toBeInTheDocument();
  });

  it('un id que no es de un ciudadano muestra «no encontrada»', async () => {
    servicio.obtenerVerificacion.mockRejectedValue(new ErrorApi(404, 'No existe'));
    renderizar(`/verificaciones-ciudadanos/${ID}`);
    expect(await screen.findByText('Solicitud no encontrada')).toBeInTheDocument();
  });
});
