import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { crearClienteConsultas } from '../../../app/cliente_consultas';
import { ErrorApi } from '../../../services/error_api';
import { useSesion } from '../hooks/use_sesion';
import * as servicioPerfil from '../../profile/services/perfil.service';
import * as servicioAutenticacion from '../services/autenticacion.service';
import { ProveedorSesion } from './proveedor_sesion';

vi.mock('../services/autenticacion.service', () => ({
  iniciarSesion: vi.fn(),
  cerrarSesion: vi.fn(),
}));

vi.mock('../../profile/services/perfil.service', () => ({
  obtenerPerfil: vi.fn(),
}));

const CLAVE_CREDENCIAL = 'ambulancias_galenos.credencial';

function guardarSesionVigente() {
  sessionStorage.setItem(
    CLAVE_CREDENCIAL,
    JSON.stringify({
      tokenAcceso: 'token',
      expiraEn: new Date(Date.now() + 3_600_000).toISOString(),
    }),
  );
}

function VistaSesion() {
  const { estado, cerrarSesion } = useSesion();
  return (
    <>
      <p>Estado: {estado}</p>
      <button type="button" onClick={() => void cerrarSesion()}>
        Cerrar sesión
      </button>
    </>
  );
}

function renderizar() {
  render(
    <QueryClientProvider client={crearClienteConsultas()}>
      <ProveedorSesion>
        <VistaSesion />
      </ProveedorSesion>
    </QueryClientProvider>,
  );
}

describe('ProveedorSesion · cerrar sesión', () => {
  beforeEach(() => {
    vi.mocked(servicioPerfil.obtenerPerfil).mockResolvedValue({
      id: '1',
      nombres: 'Ana',
      apellidos: 'Pérez',
      correo: 'ana@ambulancia.co',
      rol: 'despachador',
    });
    vi.mocked(servicioAutenticacion.cerrarSesion).mockReset();
  });

  it('revoca la sesión en el backend y limpia la credencial local', async () => {
    vi.mocked(servicioAutenticacion.cerrarSesion).mockResolvedValue();
    guardarSesionVigente();
    renderizar();

    expect(await screen.findByText('Estado: autenticado')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }));

    expect(await screen.findByText('Estado: anonimo')).toBeInTheDocument();
    expect(servicioAutenticacion.cerrarSesion).toHaveBeenCalledTimes(1);
    expect(sessionStorage.getItem(CLAVE_CREDENCIAL)).toBeNull();
  });

  it('cierra la sesión local aunque el backend no responda', async () => {
    vi.mocked(servicioAutenticacion.cerrarSesion).mockRejectedValue(
      new ErrorApi(null, 'Sin conexión'),
    );
    guardarSesionVigente();
    renderizar();

    expect(await screen.findByText('Estado: autenticado')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }));

    expect(await screen.findByText('Estado: anonimo')).toBeInTheDocument();
    expect(sessionStorage.getItem(CLAVE_CREDENCIAL)).toBeNull();
  });

  it('no envía cierres duplicados si se pulsa varias veces', async () => {
    vi.mocked(servicioAutenticacion.cerrarSesion).mockReturnValue(new Promise(() => {}));
    guardarSesionVigente();
    renderizar();

    expect(await screen.findByText('Estado: autenticado')).toBeInTheDocument();
    const boton = screen.getByRole('button', { name: 'Cerrar sesión' });
    await userEvent.click(boton);
    await userEvent.click(boton);

    expect(servicioAutenticacion.cerrarSesion).toHaveBeenCalledTimes(1);
  });
});
