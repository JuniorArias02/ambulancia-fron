import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import type { Emergencia, EstadoEmergencia } from '../types/emergencia.types';
import { TablaEmergencias } from './tabla_emergencias';

const base: Emergencia = {
  id: 'e1',
  numeroEmergencia: 'EMG-20261024-0001',
  fuente: 'linea_123',
  informanteNombre: null,
  informanteTelefono: null,
  descripcion: 'Persona caída en la vía',
  tipoIncidente: 'caida',
  prioridad: 'roja',
  direccion: 'Carrera 7 # 45-10',
  referenciaLugar: null,
  coordenadas: null,
  numeroVictimas: null,
  estado: 'recibida',
  emergenciaPrincipalId: null,
  recibidaPor: null,
  recibidaEn: '2026-10-24T12:00:00.000Z',
  cerradaEn: null,
};

async function accionesPara(estado: EstadoEmergencia): Promise<(string | null)[]> {
  render(
    <MemoryRouter>
      <TablaEmergencias
        emergencias={[{ ...base, estado }]}
        mostrarTranscurrido
        ahora={new Date('2026-10-24T12:12:00.000Z').getTime()}
        alVerDetalle={vi.fn()}
        alEditar={vi.fn()}
        alCancelar={vi.fn()}
      />
    </MemoryRouter>,
  );
  const [boton] = screen.getAllByRole('button', { name: `Acciones para ${base.numeroEmergencia}` });
  if (!boton) throw new Error('No se encontró el menú de acciones');
  await userEvent.click(boton);
  const menu = boton.nextElementSibling;
  if (!(menu instanceof HTMLElement)) throw new Error('El menú no se abrió');
  return within(menu)
    .getAllByRole('button')
    .map((opcion) => opcion.textContent);
}

describe('TablaEmergencias', () => {
  it('muestra el tiempo transcurrido en el tablero', () => {
    render(
      <MemoryRouter>
        <TablaEmergencias
          emergencias={[base]}
          mostrarTranscurrido
          ahora={new Date('2026-10-24T12:12:00.000Z').getTime()}
          alVerDetalle={vi.fn()}
          alEditar={vi.fn()}
          alCancelar={vi.fn()}
        />
      </MemoryRouter>,
    );
    expect(screen.getAllByText('12 min').length).toBeGreaterThan(0);
  });

  it('solo una emergencia recibida se puede cancelar', async () => {
    expect(await accionesPara('recibida')).toEqual(['Ver detalle', 'Corregir datos', 'Cancelar emergencia']);
  });

  it('una emergencia despachada se corrige pero no se cancela', async () => {
    expect(await accionesPara('despachada')).toEqual(['Ver detalle', 'Corregir datos']);
  });

  it('una emergencia cancelada solo se consulta', async () => {
    expect(await accionesPara('cancelada')).toEqual(['Ver detalle']);
  });
});
