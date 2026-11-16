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

async function abrirMenu(usuario: Usuario, idUsuarioActual = 'admin') {
  const alVerVerificacion = vi.fn();
  const alRestablecerContrasena = vi.fn();
  const alVerFirma = vi.fn();
  render(
    <TablaUsuarios
      usuarios={[usuario]}
      idUsuarioActual={idUsuarioActual}
      alEditar={vi.fn()}
      alCambiarRol={vi.fn()}
      alCambiarEstado={vi.fn()}
      alVerVerificacion={alVerVerificacion}
      alRestablecerContrasena={alRestablecerContrasena}
      alVerFirma={alVerFirma}
    />,
  );
  // La tabla y la lista móvil renderizan el mismo menú; basta con el primero.
  const [boton] = screen.getAllByRole('button', { name: `Acciones para ${usuario.nombres} ${usuario.apellidos}` });
  if (!boton) throw new Error('No se encontró el menú de acciones');
  await userEvent.click(boton);
  const menu = screen.getByRole('menu');
  return { menu: within(menu), alVerVerificacion, alRestablecerContrasena, alVerFirma };
}

describe('TablaUsuarios', () => {
  it('al personal se le puede cambiar el rol', async () => {
    const { menu } = await abrirMenu(personal);
    expect(menu.getByRole('menuitem', { name: 'Cambiar rol' })).toBeInTheDocument();
    expect(menu.queryByRole('menuitem', { name: 'Ver verificación' })).not.toBeInTheDocument();
  });

  it('un ciudadano muestra su insignia y abre su verificación, sin cambio de rol', async () => {
    const ciudadano: Usuario = { ...personal, id: 'c-1', rol: 'ciudadano' };
    const { menu, alVerVerificacion } = await abrirMenu(ciudadano);

    expect(screen.getAllByText('Ciudadano').length).toBeGreaterThan(0);
    expect(menu.queryByRole('menuitem', { name: 'Cambiar rol' })).not.toBeInTheDocument();
    await userEvent.click(menu.getByRole('menuitem', { name: 'Ver verificación' }));
    expect(alVerVerificacion).toHaveBeenCalledWith(ciudadano);
  });

  it('permite restablecer la contraseña del personal y de los ciudadanos', async () => {
    const { menu, alRestablecerContrasena } = await abrirMenu(personal);
    await userEvent.click(menu.getByRole('menuitem', { name: 'Restablecer contraseña' }));
    expect(alRestablecerContrasena).toHaveBeenCalledWith(personal);
  });

  it('a un ciudadano también se le puede restablecer', async () => {
    const { menu } = await abrirMenu({ ...personal, id: 'c-1', rol: 'ciudadano' });
    expect(menu.getByRole('menuitem', { name: 'Restablecer contraseña' })).toBeInTheDocument();
  });

  it('no ofrece restablecer la contraseña propia: se cambia desde el perfil', async () => {
    const { menu } = await abrirMenu(personal, personal.id);
    expect(menu.getByRole('menuitem', { name: 'Editar datos' })).toBeInTheDocument();
    expect(menu.queryByRole('menuitem', { name: 'Restablecer contraseña' })).not.toBeInTheDocument();
  });

  it('solo el paramédico tiene firma', async () => {
    const paramedico: Usuario = { ...personal, id: 'p-1', rol: 'paramedico' };
    const { menu, alVerFirma } = await abrirMenu(paramedico);
    await userEvent.click(menu.getByRole('menuitem', { name: 'Ver firma' }));
    expect(alVerFirma).toHaveBeenCalledWith(paramedico);
  });

  it('el despachador no tiene firma', async () => {
    const { menu } = await abrirMenu(personal);
    expect(menu.queryByRole('menuitem', { name: 'Ver firma' })).not.toBeInTheDocument();
  });
});
