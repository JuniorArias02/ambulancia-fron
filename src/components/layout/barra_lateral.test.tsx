import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { RUTAS } from '../../constants/rutas';
import type { NombreRol } from '../../types/rol.types';
import { BarraLateral } from './barra_lateral';

function renderizar(rolUsuario: NombreRol, contadores?: Partial<Record<string, number>>) {
  render(
    <MemoryRouter>
      <BarraLateral
        rolUsuario={rolUsuario}
        contadores={contadores}
        contraida={false}
        abiertaMovil={false}
        alAlternarContraccion={vi.fn()}
        alCerrarMovil={vi.fn()}
      />
    </MemoryRouter>,
  );
}

describe('BarraLateral', () => {
  it('el administrador ve la verificación de ciudadanos con las pendientes', () => {
    renderizar('administrador', { [RUTAS.verificaciones]: 3 });
    const enlace = screen.getByRole('link', { name: /Verificación de ciudadanos/ });
    expect(enlace).toHaveAttribute('href', RUTAS.verificaciones);
    expect(enlace).toHaveTextContent('3 por revisar');
  });

  it('el despachador no ve la verificación de ciudadanos', () => {
    renderizar('despachador');
    expect(screen.queryByRole('link', { name: /Verificación de ciudadanos/ })).not.toBeInTheDocument();
  });

  it('el despachador ve el inventario y el paramédico no', () => {
    renderizar('despachador');
    expect(screen.getByRole('link', { name: 'Movimientos' })).toHaveAttribute('href', RUTAS.movimientos);
    expect(screen.getByRole('link', { name: 'Perfiles de dotación' })).toBeInTheDocument();
  });

  it('el paramédico no ve el inventario: lo opera desde la app', () => {
    renderizar('paramedico');
    expect(screen.queryByRole('link', { name: 'Movimientos' })).not.toBeInTheDocument();
  });
});
