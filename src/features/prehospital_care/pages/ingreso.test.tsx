import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { crearClienteConsultas } from '../../../app/cliente_consultas';
import { ErrorApi } from '../../../services/error_api';
import type { IngresoServicio } from '../types/historia_clinica.types';
import { PaginaIngreso } from './pagina_ingreso';

const servicio = vi.hoisted(() => ({ obtenerIngreso: vi.fn(), listarInstitucionesOpciones: vi.fn() }));
vi.mock('../services/historias.service', () => servicio);
// El mapa (Leaflet) no aporta a estas pruebas: se reemplaza por una marca.
vi.mock('../components/mapa_recorrido', () => ({ MapaRecorrido: () => <div>Mapa del recorrido</div> }));

const ingreso: IngresoServicio = {
  emergencia: {
    id: 'e-1',
    numeroEmergencia: 'EMG-20261029-0002',
    modalidad: 'traslado_programado',
    fuente: 'app',
    estado: 'cerrada',
    descripcion: 'Choque de moto con carro',
    tipoIncidente: 'accidente_transito',
    prioridad: 'roja',
    direccion: 'Cl 7 3 E 10',
    referenciaLugar: null,
    latitud: 7.89,
    longitud: -72.49,
    origenUbicacion: 'gps',
    numeroVictimas: 2,
    informanteNombre: 'María López',
    informanteTelefono: '3222222222',
    reportadaDesdeApp: true,
    recibidaEn: '2026-10-30T02:27:25.479Z',
    cerradaEn: null,
    recibidaPor: { id: 'u-9', nombreCompleto: 'Administrador Sistema' },
    emergenciaPrincipal: null,
    duplicadas: [{ id: 'e-2', numeroEmergencia: 'EMG-20261029-0003', recibidaEn: '2026-10-30T02:29:00.000Z' }],
  },
  asignaciones: [
    {
      id: 'as-1',
      estado: 'finalizada',
      ambulancia: { id: 'a-1', codigo: 'AMB-01', placa: 'ABC123', tipo: 'TAM' },
      tripulacion: [
        { usuarioId: 'u-1', nombreCompleto: 'Pedro Díaz', funcion: 'conductor' },
        { usuarioId: 'u-2', nombreCompleto: 'Ana Rojas', funcion: 'paramedico' },
      ],
      asignadaPor: { id: 'u-9', nombreCompleto: 'Administrador Sistema' },
      asignadaEn: '2026-10-30T02:28:04.158Z',
      salidaEn: null,
      llegadaEscenaEn: null,
      atencionInicioEn: null,
      salidaEscenaEn: null,
      llegadaDestinoEn: null,
      finalizadaEn: null,
      motivoCancelacion: null,
      institucionDestino: null,
      tiempos: {
        despachoSegundos: 39,
        alistamientoSegundos: 12,
        respuestaSegundos: 24,
        enEscenaSegundos: 1790,
        trasladoSegundos: null,
        totalSegundos: 3132,
      },
      eventos: [
        {
          estadoAnterior: 'en_camino',
          estadoNuevo: 'en_escena',
          ocurridoEn: '2026-10-30T02:28:28.642Z',
          usuario: { id: 'u-1', nombreCompleto: 'Pedro Díaz' },
          rolResponsable: 'conductor',
          latitud: 7.89,
          longitud: -72.48,
          distanciaEscenaMetros: 640,
          fueraDeRadio: true,
          observacion: null,
        },
      ],
      recorrido: { puntos: [], totalPuntos: 0, muestreado: false },
      insumos: [],
    },
  ],
  historias: [],
};

beforeEach(() => {
  servicio.obtenerIngreso.mockReset().mockResolvedValue(ingreso);
  servicio.listarInstitucionesOpciones.mockReset().mockResolvedValue([]);
});

function renderizar(ruta = '/ingresos/emg-20261029-0002') {
  render(
    <QueryClientProvider client={crearClienteConsultas()}>
      <MemoryRouter initialEntries={[ruta]}>
        <Routes>
          <Route path="/ingresos/:numero" element={<PaginaIngreso />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('Ingreso', () => {
  it('muestra la solicitud, las duplicadas y que la reportó un ciudadano', async () => {
    renderizar();
    expect(await screen.findByRole('heading', { name: 'EMG-20261029-0002' })).toBeInTheDocument();
    expect(servicio.obtenerIngreso).toHaveBeenCalledWith('emg-20261029-0002');
    expect(screen.getByText('Reportada por un ciudadano desde la app')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'EMG-20261029-0003' })).toHaveAttribute('href', '/ingresos/EMG-20261029-0003');
    expect(screen.getByText('Este servicio no tiene historias clínicas.')).toBeInTheDocument();
  });

  it('cada ambulancia muestra tripulación, tiempos y su línea de tiempo', async () => {
    renderizar();
    const seccion = within(await screen.findByRole('region', { name: 'Ambulancia AMB-01' }));
    expect(seccion.getByText('Pedro Díaz')).toBeInTheDocument();
    expect(seccion.getByText('Respuesta')).toBeInTheDocument();
    expect(seccion.getByText('0:24')).toBeInTheDocument();
    expect(seccion.getByText('52:12')).toBeInTheDocument();
    // Un tiempo sin las dos marcas se muestra como raya, no como cero.
    expect(seccion.getAllByText('—').length).toBeGreaterThan(0);
    expect(seccion.getByText('Marcado a 640 m de la escena')).toBeInTheDocument();
    expect(seccion.getByText('No se registraron insumos en este servicio.')).toBeInTheDocument();
    expect(await seccion.findByText('Mapa del recorrido')).toBeInTheDocument();
  });

  it('un ingreso que no existe lo dice', async () => {
    servicio.obtenerIngreso.mockRejectedValue(new ErrorApi(404, 'No existe'));
    renderizar('/ingresos/EMG-0');
    expect(await screen.findByText('Ingreso no encontrado')).toBeInTheDocument();
  });
});
