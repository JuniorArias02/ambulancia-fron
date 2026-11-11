import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { Usuario } from '../types/usuario.types';
import { TablaUsuarios } from './tabla_usuarios';

const personal: Usuario = {
  id: 'u-1',
  nombres: 'Ana',
  apellidos: 'Pérez',
  correo: 'ana@galenos.co',
  telefono: null,
  estado: 'activo',
  rol: 'despachador',
  ultimoAcceso: null,
  creadoEn: '2026-10-24T11:00:00.000Z',
};

async function abrirMenu(usuario: Usuario) {
  const alVerVerificacion = vi.fn();
  render(
    <TablaUsuarios
      usuarios={[usuario]}
      idUsuarioActual="admin"
      alEditar={vi.fn()}
      alCambiarRol={vi.fn()}
      alCambiarEstado={vi.fn()}
      alVerVerificacion={alVerVerificacion}
    />,
  );
  // La tabla y la lista móvil renderizan el mismo menú; basta con el primero.
  const [boton] = screen.getAllByRole('button', { name: `Acciones para ${usuario.nombres} ${usuario.apellidos}` });
  if (!boton) throw new Error('No se encontró el menú de acciones');
  await userEvent.click(boton);
  const menu = boton.nextElementSibling;
  if (!(menu instanceof HTMLElement)) throw new Error('El menú no se abrió');
  return { menu: within(menu), alVerVerificacion };
}

describe('TablaUsuarios', () => {
  it('al personal se le puede cambiar el rol', async () => {
    const { menu } = await abrirMenu(personal);
    expect(menu.getByRole('button', { name: 'Cambiar rol' })).toBeInTheDocument();
    expect(menu.queryByRole('button', { name: 'Ver verificación' })).not.toBeInTheDocument();
  });

  it('un ciudadano muestra su insignia y abre su verificación, sin cambio de rol', async () => {
    const ciudadano: Usuario = { ...personal, id: 'c-1', rol: 'ciudadano' };
    const { menu, alVerVerificacion } = await abrirMenu(ciudadano);

    expect(screen.getAllByText('Ciudadano').length).toBeGreaterThan(0);
    expect(menu.queryByRole('button', { name: 'Cambiar rol' })).not.toBeInTheDocument();
    await userEvent.click(menu.getByRole('button', { name: 'Ver verificación' }));
    expect(alVerVerificacion).toHaveBeenCalledWith(ciudadano);
  });
});
