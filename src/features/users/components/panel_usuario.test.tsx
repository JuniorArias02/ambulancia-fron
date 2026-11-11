import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { crearClienteConsultas } from '../../../app/cliente_consultas';
import { ProveedorNotificaciones } from '../../../providers/proveedor_notificaciones';
import { PanelUsuario } from './panel_usuario';

vi.mock('../services/roles.service', () => ({
  listarRoles: vi.fn().mockResolvedValue([
    { id: '1', nombre: 'despachador', descripcion: 'Despacha ambulancias' },
    { id: '2', nombre: 'ciudadano', descripcion: 'Usuario de la app' },
  ]),
}));

beforeAll(() => {
  // jsdom no implementa los diálogos modales nativos.
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function close() {
    this.removeAttribute('open');
  };
  Element.prototype.scrollIntoView = vi.fn();
});

function renderizar(alCerrar: () => void) {
  render(
    <QueryClientProvider client={crearClienteConsultas()}>
      <ProveedorNotificaciones>
        <PanelUsuario usuario={null} alCerrar={alCerrar} />
      </ProveedorNotificaciones>
    </QueryClientProvider>,
  );
}

describe('PanelUsuario · crear', () => {
  it('no ofrece el rol ciudadano: se registra desde la app', async () => {
    renderizar(vi.fn());

    expect(await screen.findByRole('option', { name: 'Despachador' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Ciudadano' })).not.toBeInTheDocument();
  });

  it('se cierra con la X si no se escribió nada', async () => {
    const alCerrar = vi.fn();
    renderizar(alCerrar);

    await userEvent.click(screen.getByRole('button', { name: 'Cerrar' }));

    expect(alCerrar).toHaveBeenCalledTimes(1);
  });

  it('se cierra con Cancelar si no se escribió nada', async () => {
    const alCerrar = vi.fn();
    renderizar(alCerrar);

    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(alCerrar).toHaveBeenCalledTimes(1);
  });

  it('pide confirmación antes de descartar lo escrito', async () => {
    const alCerrar = vi.fn();
    renderizar(alCerrar);

    await userEvent.type(screen.getByLabelText('Nombres'), 'Laura');
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(alCerrar).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Descartar' }));
    expect(alCerrar).toHaveBeenCalledTimes(1);
  });
});
