import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import type { Ambulancia } from '../types/ambulancia.types';
import { TablaAmbulancias, type AccionesAmbulancia } from './tabla_ambulancias';

const ambulancia: Ambulancia = {
  id: '6f1c2f1e-0000-4000-8000-000000000001',
  codigo: 'AMB-01',
  placa: 'ABC123',
  tipo: { id: 'tipo-tam', nombre: 'TAM', descripcion: 'Transporte Asistencial Medicalizado' },
  estadoOperativo: 'disponible',
  ultimaUbicacion: null,
  creadaEn: '2026-10-24T11:00:00.000Z',
};

async function abrirMenu(datos: Ambulancia, acciones: Omit<AccionesAmbulancia, 'alVerDetalle'>) {
  render(
    <MemoryRouter>
      <TablaAmbulancias ambulancias={[datos]} alVerDetalle={vi.fn()} {...acciones} />
    </MemoryRouter>,
  );
  // La tabla y la lista móvil renderizan el mismo menú; basta con el primero.
  const [boton] = screen.getAllByRole('button', { name: `Acciones para ${datos.codigo}` });
  if (!boton) throw new Error('No se encontró el menú de acciones');
  await userEvent.click(boton);
  const menu = boton.nextElementSibling;
  if (!(menu instanceof HTMLElement)) throw new Error('El menú no se abrió');
  return within(menu);
}

describe('TablaAmbulancias', () => {
  it('muestra la placa con formato', () => {
    render(
      <MemoryRouter>
        <TablaAmbulancias ambulancias={[ambulancia]} alVerDetalle={vi.fn()} />
      </MemoryRouter>,
    );
    expect(screen.getAllByText('ABC 123').length).toBeGreaterThan(0);
  });

  it('sin permiso de edición no ofrece editar', async () => {
    const menu = await abrirMenu(ambulancia, { alCambiarEstado: vi.fn() });

    expect(menu.getByRole('button', { name: 'Cambiar estado' })).toBeInTheDocument();
    expect(menu.queryByRole('button', { name: 'Editar datos' })).not.toBeInTheDocument();
  });

  it('una ambulancia en servicio solo permite ver el detalle', async () => {
    const menu = await abrirMenu(
      { ...ambulancia, estadoOperativo: 'en_servicio' },
      { alCambiarEstado: vi.fn(), alEditar: vi.fn() },
    );

    expect(menu.getAllByRole('button').map((boton) => boton.textContent)).toEqual(['Ver detalle']);
  });
});
