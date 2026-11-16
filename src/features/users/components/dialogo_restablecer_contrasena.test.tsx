import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { crearClienteConsultas } from '../../../app/cliente_consultas';
import { ProveedorNotificaciones } from '../../../providers/proveedor_notificaciones';
import { ErrorApi } from '../../../services/error_api';
import { restablecerContrasenaUsuario } from '../services/usuarios.service';
import type { Usuario } from '../types/usuario.types';
import { DialogoRestablecerContrasena } from './dialogo_restablecer_contrasena';

vi.mock('../services/usuarios.service', () => ({ restablecerContrasenaUsuario: vi.fn() }));

const restablecer = vi.mocked(restablecerContrasenaUsuario);

const usuario: Usuario = {
  id: 'u-1',
  nombres: 'Ana',
  apellidos: 'Pérez',
  correo: 'ana@galenos.co',
  telefono: null,
  estado: 'bloqueado',
  rol: 'paramedico',
  ultimoAcceso: null,
  creadoEn: '2026-10-24T11:00:00.000Z',
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
  restablecer.mockReset();
});

function renderizar(alCerrar = vi.fn()) {
  render(
    <MemoryRouter>
      <QueryClientProvider client={crearClienteConsultas()}>
        <ProveedorNotificaciones>
          <DialogoRestablecerContrasena usuario={usuario} alCerrar={alCerrar} />
        </ProveedorNotificaciones>
      </QueryClientProvider>
    </MemoryRouter>,
  );
  return alCerrar;
}

const campoNueva = () => screen.getByLabelText('Contraseña nueva');
const campoConfirmacion = () => screen.getByLabelText('Confirmar contraseña');
const enviar = () => userEvent.click(screen.getByRole('button', { name: 'Restablecer contraseña' }));

describe('DialogoRestablecerContrasena', () => {
  it('muestra a quién se le cambia y avisa que se cierran sus sesiones', () => {
    renderizar();
    expect(screen.getByText('Ana Pérez · ana@galenos.co')).toBeInTheDocument();
    expect(screen.getByText(/Se cerrarán todas las sesiones de este usuario/)).toBeInTheDocument();
  });

  it('valida la política y la confirmación antes de enviar', async () => {
    renderizar();
    await userEvent.type(campoNueva(), 'corta1');
    await userEvent.type(campoConfirmacion(), 'otra');
    await enviar();

    expect(await screen.findByText('Debe tener al menos 10 caracteres.')).toBeInTheDocument();
    expect(screen.getByText('Las contraseñas no coinciden.')).toBeInTheDocument();
    expect(restablecer).not.toHaveBeenCalled();
  });

  it('envía solo la contraseña nueva y cierra al terminar', async () => {
    restablecer.mockResolvedValue(undefined);
    const alCerrar = renderizar();
    await userEvent.type(campoNueva(), 'Temporal2026abc');
    await userEvent.type(campoConfirmacion(), 'Temporal2026abc');
    await enviar();

    expect(await screen.findByText('Contraseña actualizada')).toBeInTheDocument();
    expect(restablecer).toHaveBeenCalledWith('u-1', 'Temporal2026abc');
    expect(alCerrar).toHaveBeenCalledTimes(1);
  });

  it('"Generar" llena ambos campos con una contraseña válida y la deja visible', async () => {
    renderizar();
    await userEvent.click(screen.getByRole('button', { name: 'Generar' }));

    const nueva = campoNueva();
    if (!(nueva instanceof HTMLInputElement)) throw new Error('El campo no es un input');
    expect(nueva).toHaveAttribute('type', 'text');
    expect(nueva.value).toMatch(/^(?=.*\p{L})(?=.*\d).{10,}$/u);
    expect(campoConfirmacion()).toHaveValue(nueva.value);
  });

  it('un 400 se muestra junto al campo', async () => {
    restablecer.mockRejectedValue(new ErrorApi(400, 'x', ['La contraseña es demasiado común.']));
    renderizar();
    await userEvent.type(campoNueva(), 'Temporal2026abc');
    await userEvent.type(campoConfirmacion(), 'Temporal2026abc');
    await enviar();

    expect(await screen.findByText('La contraseña es demasiado común.')).toBeInTheDocument();
    expect(campoNueva()).toHaveAttribute('aria-invalid', 'true');
  });

  it('un 422 (cuenta propia) lleva a cambiarla desde el perfil', async () => {
    restablecer.mockRejectedValue(
      new ErrorApi(422, 'No puede restablecer su propia contraseña desde aquí.'),
    );
    renderizar();
    await userEvent.type(campoNueva(), 'Temporal2026abc');
    await userEvent.type(campoConfirmacion(), 'Temporal2026abc');
    await enviar();

    expect(await screen.findByText('No puede restablecer su propia contraseña desde aquí.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Cambiar tu contraseña desde tu perfil/ })).toHaveAttribute(
      'href',
      '/perfil',
    );
  });
});
