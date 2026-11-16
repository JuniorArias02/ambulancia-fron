import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Ban, Pencil, UserCog } from 'lucide-react';
import { describe, expect, it, vi } from 'vitest';
import { MenuAcciones, type AccionMenu } from './menu_acciones';

function renderizar(acciones: AccionMenu[] = []) {
  const lista: AccionMenu[] =
    acciones.length > 0
      ? acciones
      : [
          { etiqueta: 'Editar', icono: Pencil, alSeleccionar: vi.fn() },
          { etiqueta: 'Cambiar rol', icono: UserCog, alSeleccionar: vi.fn() },
          { etiqueta: 'Bloquear', icono: Ban, tono: 'peligro', alSeleccionar: vi.fn() },
        ];
  render(<MenuAcciones etiqueta="Acciones para Ana" acciones={lista} />);
  return { lista, boton: screen.getByRole('button', { name: 'Acciones para Ana' }) };
}

describe('MenuAcciones', () => {
  it('se monta fuera de la tabla para que la posición no dependa de sus estilos', async () => {
    const { boton } = renderizar();
    await userEvent.click(boton);

    const menu = screen.getByRole('menu', { name: 'Acciones para Ana' });
    expect(menu.parentElement).toBe(document.body);
    expect(boton).toHaveAttribute('aria-expanded', 'true');
  });

  it('enfoca la primera opción y se recorre con las flechas', async () => {
    const { boton } = renderizar();
    await userEvent.click(boton);

    expect(screen.getByRole('menuitem', { name: 'Editar' })).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: 'Cambiar rol' })).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}{ArrowUp}');
    expect(screen.getByRole('menuitem', { name: 'Bloquear' })).toHaveFocus();
    await userEvent.keyboard('{Home}');
    expect(screen.getByRole('menuitem', { name: 'Editar' })).toHaveFocus();
  });

  it('pasar el puntero resalta la opción', async () => {
    const { boton } = renderizar();
    await userEvent.click(boton);

    const opcion = screen.getByRole('menuitem', { name: 'Cambiar rol' });
    await userEvent.hover(opcion);
    expect(opcion).toHaveFocus();
  });

  it('separa las acciones de riesgo', async () => {
    const { boton } = renderizar();
    await userEvent.click(boton);
    expect(screen.getAllByRole('separator')).toHaveLength(1);
  });

  it('elige con clic y cierra', async () => {
    const { boton, lista } = renderizar();
    await userEvent.click(boton);
    await userEvent.click(screen.getByRole('menuitem', { name: 'Cambiar rol' }));

    expect(lista[1]?.alSeleccionar).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('Escape cierra y devuelve el foco al botón', async () => {
    const { boton } = renderizar();
    await userEvent.click(boton);
    await userEvent.keyboard('{Escape}');

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(boton).toHaveFocus();
  });

  it('se cierra al pulsar fuera', async () => {
    const { boton } = renderizar();
    await userEvent.click(boton);
    await userEvent.click(document.body);

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});
