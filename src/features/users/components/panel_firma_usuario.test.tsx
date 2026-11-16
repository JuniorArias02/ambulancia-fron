import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { crearClienteConsultas } from '../../../app/cliente_consultas';
import { ProveedorNotificaciones } from '../../../providers/proveedor_notificaciones';
import { ErrorApi } from '../../../services/error_api';
import { desactivarFirma, listarFirmasUsuario, obtenerImagenFirma } from '../services/firmas.service';
import type { FirmaUsuario } from '../types/firma.types';
import type { Usuario } from '../types/usuario.types';
import { PanelFirmaUsuario } from './panel_firma_usuario';

vi.mock('../services/firmas.service', () => ({
  listarFirmasUsuario: vi.fn(),
  obtenerImagenFirma: vi.fn(),
  desactivarFirma: vi.fn(),
}));

const listar = vi.mocked(listarFirmasUsuario);
const obtenerImagen = vi.mocked(obtenerImagenFirma);
const desactivar = vi.mocked(desactivarFirma);

const usuario: Usuario = {
  id: 'p-1',
  nombres: 'Luis',
  apellidos: 'Gómez',
  correo: 'luis@galenos.co',
  telefono: null,
  estado: 'activo',
  rol: 'paramedico',
  ultimoAcceso: null,
  creadoEn: '2026-10-24T11:00:00.000Z',
};

const base: FirmaUsuario = {
  id: 'f-2',
  usuarioId: 'p-1',
  estado: 'vigente',
  tipoMime: 'image/png',
  tamanoBytes: 8421,
  anchoPx: 600,
  altoPx: 200,
  huellaSha256: '9f2c',
  registradaEn: '2026-11-14T15:20:00.000Z',
  reemplazadaEn: null,
  desactivadaEn: null,
  motivoDesactivacion: null,
};

const reemplazada: FirmaUsuario = {
  ...base,
  id: 'f-1',
  estado: 'reemplazada',
  registradaEn: '2026-11-01T13:00:00.000Z',
  reemplazadaEn: '2026-11-14T15:20:00.000Z',
};

const crearUrl = vi.fn(() => 'blob:firma');
const liberarUrl = vi.fn();
const originales = { crear: URL.createObjectURL, liberar: URL.revokeObjectURL };

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function close() {
    this.removeAttribute('open');
  };
  URL.createObjectURL = crearUrl;
  URL.revokeObjectURL = liberarUrl;
});

afterAll(() => {
  URL.createObjectURL = originales.crear;
  URL.revokeObjectURL = originales.liberar;
});

beforeEach(() => {
  vi.clearAllMocks();
  obtenerImagen.mockResolvedValue(new Blob(['png'], { type: 'image/png' }));
});

function renderizar() {
  const resultado = render(
    <QueryClientProvider client={crearClienteConsultas()}>
      <ProveedorNotificaciones>
        <PanelFirmaUsuario usuario={usuario} alCerrar={vi.fn()} />
      </ProveedorNotificaciones>
    </QueryClientProvider>,
  );
  return resultado;
}

describe('PanelFirmaUsuario', () => {
  it('muestra la firma vigente descargada con el token y las versiones anteriores', async () => {
    listar.mockResolvedValue([base, reemplazada]);
    renderizar();

    const imagen = await screen.findByRole('img', { name: /Firma vigente de Luis Gómez/ });
    expect(imagen).toHaveAttribute('src', 'blob:firma');
    expect(obtenerImagen).toHaveBeenCalledWith('p-1', 'f-2', expect.any(AbortSignal));
    expect(screen.getByText('Reemplazada')).toBeInTheDocument();
    // La imagen de una versión anterior solo se descarga al pedirla.
    expect(obtenerImagen).toHaveBeenCalledTimes(1);

    await userEvent.click(screen.getByRole('button', { name: 'Ver' }));
    expect(await screen.findByRole('img', { name: /Firma de Luis Gómez/ })).toBeInTheDocument();
    expect(obtenerImagen).toHaveBeenLastCalledWith('p-1', 'f-1', expect.any(AbortSignal));
  });

  it('sin firma vigente explica que se registra desde la app y no ofrece subirla', async () => {
    listar.mockResolvedValue([{ ...base, estado: 'desactivada', desactivadaEn: base.registradaEn, motivoDesactivacion: 'Ilegible' }]);
    renderizar();

    expect(await screen.findByText('No tiene firma registrada')).toBeInTheDocument();
    expect(screen.getByText(/Perfil → Mi firma/)).toBeInTheDocument();
    expect(screen.getByText('Ilegible')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Desactivar|Subir|Cargar/ })).not.toBeInTheDocument();
  });

  it('desactivar exige el motivo y avisa las consecuencias', async () => {
    listar.mockResolvedValue([base]);
    desactivar.mockResolvedValue({ ...base, estado: 'desactivada' });
    renderizar();

    await userEvent.click(await screen.findByRole('button', { name: 'Desactivar' }));
    const formulario = within(screen.getByRole('form', { name: 'Desactivar firma' }));
    expect(formulario.getByText(/no podrá cerrar historias hasta que registre una nueva firma/)).toBeInTheDocument();

    await userEvent.click(formulario.getByRole('button', { name: 'Desactivar firma' }));
    expect(await formulario.findByText('Describe el motivo con al menos 5 caracteres.')).toBeInTheDocument();
    expect(desactivar).not.toHaveBeenCalled();

    await userEvent.type(formulario.getByLabelText(/Motivo/), 'Firma ilegible');
    await userEvent.click(formulario.getByRole('button', { name: 'Desactivar firma' }));

    expect(await screen.findByText('Firma desactivada')).toBeInTheDocument();
    expect(desactivar).toHaveBeenCalledWith('p-1', 'f-2', 'Firma ilegible');
  });

  it('un 422 avisa y recarga el historial', async () => {
    listar.mockResolvedValue([base]);
    desactivar.mockRejectedValue(new ErrorApi(422, 'La firma ya no está vigente.'));
    renderizar();

    await userEvent.click(await screen.findByRole('button', { name: 'Desactivar' }));
    await userEvent.type(screen.getByLabelText(/Motivo/), 'Firma ilegible');
    await userEvent.click(screen.getByRole('button', { name: 'Desactivar firma' }));

    expect(await screen.findByText('La firma ya no está vigente.')).toBeInTheDocument();
    expect(listar).toHaveBeenCalledTimes(2);
  });

  it('libera la imagen al cerrar', async () => {
    listar.mockResolvedValue([base]);
    const { unmount } = renderizar();
    await screen.findByRole('img', { name: /Firma vigente/ });
    unmount();
    expect(liberarUrl).toHaveBeenCalledWith('blob:firma');
  });
});
