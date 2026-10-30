import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { crearClienteConsultas } from '../../../app/cliente_consultas';
import { ProveedorNotificaciones } from '../../../providers/proveedor_notificaciones';
import { ErrorApi } from '../../../services/error_api';
import { FormularioEmergencia } from './formulario_emergencia';

const servicio = vi.hoisted(() => ({ crearEmergencia: vi.fn() }));

vi.mock('../services/emergencias.service', () => servicio);

const geocodificacion = vi.hoisted(() => ({ geocodificarDireccion: vi.fn(), geocodificarPunto: vi.fn() }));
vi.mock('../../geocoding/services/geocodificacion.service', () => geocodificacion);
// Leaflet necesita APIs de diseño que jsdom no implementa; el mapa no es parte de esta prueba.
vi.mock('../../map/components/mapa_punto', () => ({ MapaPunto: () => null }));

beforeEach(() => {
  servicio.crearEmergencia.mockReset();
  geocodificacion.geocodificarDireccion.mockReset();
});

function renderizar(alTerminar = vi.fn()) {
  render(
    <QueryClientProvider client={crearClienteConsultas()}>
      <ProveedorNotificaciones>
        <FormularioEmergencia
          emergencia={null}
          alCambiarSinGuardar={vi.fn()}
          alTerminar={alTerminar}
          alCancelar={vi.fn()}
        />
      </ProveedorNotificaciones>
    </QueryClientProvider>,
  );
  return alTerminar;
}

async function llenarReporte() {
  await userEvent.selectOptions(screen.getByLabelText('Fuente'), 'radio');
  await userEvent.type(screen.getByLabelText(/Descripción/), 'Persona caída en la vía');
}

describe('FormularioEmergencia · registrar', () => {
  it('no envía sin dirección ni coordenadas', async () => {
    renderizar();
    await llenarReporte();

    await userEvent.click(screen.getByRole('button', { name: 'Registrar emergencia' }));

    expect(await screen.findByText(/Indica la dirección o marca el punto/)).toBeInTheDocument();
    expect(servicio.crearEmergencia).not.toHaveBeenCalled();
  });

  it('envía solo los datos diligenciados y entrega la emergencia creada', async () => {
    const creada = { id: 'e1', numeroEmergencia: 'EMG-20261024-0002' };
    servicio.crearEmergencia.mockResolvedValue(creada);
    const alTerminar = renderizar();
    await llenarReporte();
    await userEvent.click(screen.getByRole('radio', { name: /Roja/ }));
    await userEvent.type(screen.getByLabelText('Dirección'), 'Carrera 7 # 45-10');

    await userEvent.click(screen.getByRole('button', { name: 'Registrar emergencia' }));

    await waitFor(() => expect(alTerminar).toHaveBeenCalledWith(creada));
    expect(servicio.crearEmergencia.mock.calls[0]?.[0]).toEqual({
      fuente: 'radio',
      descripcion: 'Persona caída en la vía',
      prioridad: 'roja',
      direccion: 'Carrera 7 # 45-10',
    });
  });
});

describe('FormularioEmergencia · ubicar la dirección', () => {
  it('Ubicar pone el punto con las coordenadas encontradas', async () => {
    geocodificacion.geocodificarDireccion.mockResolvedValue({
      direccionFormateada: 'Cl 100 19 61, Bogotá, Colombia',
      coordenadas: { latitud: 4.685519, longitud: -74.052851 },
    });
    renderizar();
    await userEvent.type(screen.getByLabelText('Dirección'), 'Calle 100 # 19-61');
    const ciudad = screen.getByLabelText('Ciudad');
    await userEvent.clear(ciudad);
    await userEvent.type(ciudad, 'Bogotá');

    await userEvent.click(screen.getByRole('button', { name: 'Ubicar' }));

    expect(await screen.findByText('Dirección ubicada en el mapa')).toBeInTheDocument();
    expect(geocodificacion.geocodificarDireccion.mock.calls[0]?.[0]).toEqual({
      direccion: 'Calle 100 # 19-61',
      ciudad: 'Bogotá',
    });
    expect(screen.getByLabelText('Latitud')).toHaveValue('4.685519');
    expect(screen.getByLabelText('Longitud')).toHaveValue('-74.052851');
  });

  it('Enter en la dirección la ubica sin enviar el formulario', async () => {
    geocodificacion.geocodificarDireccion.mockRejectedValue(new ErrorApi(422, 'No se encontró una ubicación confiable'));
    renderizar();
    await llenarReporte();

    await userEvent.type(screen.getByLabelText('Dirección'), 'Vereda El Rosal{Enter}');

    expect(await screen.findByText('No se encontró una ubicación confiable')).toBeInTheDocument();
    expect(servicio.crearEmergencia).not.toHaveBeenCalled();
  });
});
