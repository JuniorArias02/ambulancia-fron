import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useEffect } from 'react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { crearClienteConsultas } from '../../../app/cliente_consultas';
import { ErrorApi } from '../../../services/error_api';
import { useTextosBusqueda } from '../providers/contexto_busqueda';
import { DisenoHistorias } from '../providers/diseno_historias';
import type { FichaPaciente, IndicadoresClinicos, PacienteIndice, ResumenHistoria } from '../types/historia_clinica.types';
import { sumarDias } from '../utils/rangos_fecha';
import { PaginaFichaPaciente } from './pagina_ficha_paciente';
import { PaginaIndicadores } from './pagina_indicadores';
import { PaginaPacientes } from './pagina_pacientes';

const servicio = vi.hoisted(() => ({
  buscarPacientes: vi.fn(),
  obtenerFichaPaciente: vi.fn(),
  obtenerIndicadores: vi.fn(),
}));
vi.mock('../services/historias.service', () => servicio);

const paciente: PacienteIndice = {
  id: 'p-1',
  tipoDocumento: 'CC',
  numeroDocumento: '1090123456',
  nombres: 'Juan Carlos',
  apellidos: 'Pérez',
  sexo: 'masculino',
  fechaNacimiento: '1990-11-15T00:00:00.000Z',
  edadAnios: 35,
  totalAtenciones: 2,
  ultimaAtencion: '2026-11-12T13:00:00.000Z',
  ultimaEps: 'Nueva EPS',
  ultimoRegimen: 'subsidiado',
};

const atencion: ResumenHistoria = {
  id: 'h-1',
  numeroHistoria: 'HC-20261112-0001',
  estado: 'anulada',
  abiertaEn: '2026-11-12T13:00:00.000Z',
  horaEvento: null,
  cerradaEn: null,
  paciente: {
    identificado: true,
    nombres: 'Juan Carlos',
    apellidos: 'Pérez',
    tipoDocumento: 'CC',
    numeroDocumento: '1090123456',
    sexo: 'masculino',
    fechaNacimiento: '1990-11-15T00:00:00.000Z',
    edadAproximada: null,
    edadAnios: 35,
  },
  triage: 'rojo',
  desenlace: 'trasladado',
  tipoEvento: 'caida',
  impresionDiagnostica: null,
  aseguradoraEps: 'Nueva EPS',
  regimenAfiliacion: 'subsidiado',
  ingreso: { emergenciaId: 'e-1', numeroEmergencia: 'EMG-20261112-0001', modalidad: 'traslado_programado' },
  ambulancia: null,
  institucionDestino: { id: 'i-1', nombre: 'Clínica Norte' },
  creadaPor: { id: 'u-1', nombreCompleto: 'Lucía Rojas' },
  cerradaPor: null,
  firmada: false,
  riesgoCaidaAlto: true,
  totales: { signosVitales: 1, lesiones: 0, intervenciones: 0, valoracionesDownton: 1 },
};

const ficha: FichaPaciente = {
  paciente,
  atenciones: [atencion],
  alergias: [{ valor: 'Penicilina', numeroHistoria: 'HC-20261112-0001', historiaId: 'h-1', fecha: '2026-11-12T13:00:00.000Z' }],
  medicamentosHabituales: [],
  antecedentes: [],
  ultimoRiesgoCaida: { puntajeTotal: 4, nivelRiesgo: 'alto', evaluadaEn: '2026-11-12T13:30:00.000Z', numeroHistoria: 'HC-20261112-0001' },
};

const indicadores: IndicadoresClinicos = {
  rango: { desde: '2026-10-17', hasta: '2026-11-15' },
  totalHistorias: 14,
  firmadas: 3,
  rechazosTraslado: 1,
  pacientesSinIdentificar: 9,
  conRiesgoCaidaAlto: 0,
  porEstado: [{ clave: 'cerrada', total: 14 }],
  porTriage: [
    { clave: 'sin_dato', total: 8 },
    { clave: 'rojo', total: 6 },
  ],
  porDesenlace: [{ clave: 'trasladado', total: 14 }],
  porModalidad: [
    { clave: 'emergencia', total: 10 },
    { clave: 'traslado_programado', total: 4 },
  ],
  porTipoEvento: [{ clave: 'caida', total: 14 }],
  porDia: [
    { dia: '2026-11-14', total: 2 },
    { dia: '2026-11-15', total: 0 },
  ],
  institucionesDestino: [{ id: 'i-1', nombre: 'Clínica Norte', total: 3 }],
  tiempos: {
    respuesta: { servicios: 12, promedioSegundos: 540, medianaSegundos: 480, p90Segundos: 900 },
    enEscena: { servicios: 10, promedioSegundos: 1200, medianaSegundos: 1100, p90Segundos: 1800 },
    traslado: { servicios: 0, promedioSegundos: null, medianaSegundos: null, p90Segundos: null },
  },
};

let ubicacion = '';
let documentoEnMemoria: string | undefined;

/** Lo que llega a la bandeja: la URL y el documento en memoria. */
function BandejaFalsa() {
  const { pathname, search } = useLocation();
  const { textos } = useTextosBusqueda();
  useEffect(() => {
    ubicacion = `${pathname}${search}`;
    documentoEnMemoria = textos.documento;
  }, [pathname, search, textos.documento]);
  return <p>Bandeja</p>;
}

function SondaUrl() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    ubicacion = `${pathname}${search}`;
  }, [pathname, search]);
  return null;
}

beforeEach(() => {
  for (const funcion of Object.values(servicio)) funcion.mockReset();
  servicio.buscarPacientes.mockResolvedValue({ datos: [paciente], total: 1, pagina: 1, limite: 20 });
  servicio.obtenerFichaPaciente.mockResolvedValue(ficha);
  servicio.obtenerIndicadores.mockResolvedValue(indicadores);
  ubicacion = '';
  documentoEnMemoria = undefined;
});

function renderizar(ruta: string) {
  render(
    <QueryClientProvider client={crearClienteConsultas()}>
      <MemoryRouter initialEntries={[ruta]}>
        <SondaUrl />
        <Routes>
          <Route element={<DisenoHistorias />}>
            <Route path="/pacientes" element={<PaginaPacientes />} />
            <Route path="/pacientes/:id" element={<PaginaFichaPaciente />} />
            <Route path="/indicadores-clinicos" element={<PaginaIndicadores />} />
            <Route path="/historias-clinicas" element={<BandejaFalsa />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('Pacientes', () => {
  it('lista los pacientes y el documento buscado no queda en la URL', async () => {
    renderizar('/pacientes');
    expect(await screen.findByText('Juan Carlos Pérez')).toBeInTheDocument();
    expect(screen.getByText('Subsidiado')).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText('Documento'), '1090123456');
    await userEvent.click(screen.getByRole('button', { name: 'Buscar' }));
    await waitFor(() => expect(servicio.buscarPacientes).toHaveBeenLastCalledWith({ documento: '1090123456', pagina: 1, limite: 20 }));
    expect(ubicacion).not.toContain('1090123456');
  });

  it('la ficha muestra alertas, antecedentes con su historia y las atenciones', async () => {
    renderizar('/pacientes/p-1');

    const alertas = within(await screen.findByRole('list', { name: 'Alertas' }));
    expect(alertas.getByText(/Penicilina/)).toBeInTheDocument();
    expect(alertas.getByText('Riesgo de caída ALTO')).toBeInTheDocument();
    const antecedentes = within(screen.getByRole('region', { name: 'Antecedentes clínicos' }));
    expect(antecedentes.getByRole('link', { name: 'HC-20261112-0001' })).toHaveAttribute('href', '/historias-clinicas/h-1');
    expect(screen.getByRole('link', { name: 'EMG-20261112-0001' })).toBeInTheDocument();
    expect(screen.getByText('Clínica Norte')).toBeInTheDocument();
  });

  it('"Ver todas en la bandeja" lleva el documento por memoria, no por la URL', async () => {
    renderizar('/pacientes/p-1');
    await userEvent.click(await screen.findByRole('button', { name: /Ver todas en la bandeja/ }));

    expect(await screen.findByText('Bandeja')).toBeInTheDocument();
    expect(documentoEnMemoria).toBe('1090123456');
    expect(ubicacion).toContain('estado=todos');
    expect(ubicacion).not.toContain('1090123456');
  });

  it('un paciente que no existe lo dice', async () => {
    servicio.obtenerFichaPaciente.mockRejectedValue(new ErrorApi(404, 'No existe'));
    renderizar('/pacientes/x');
    expect(await screen.findByText('Paciente no encontrado')).toBeInTheDocument();
  });
});

describe('Indicadores', () => {
  it('abre con los últimos 30 días y muestra tarjetas y tiempos', async () => {
    renderizar('/indicadores-clinicos');
    expect(await screen.findByText(/^21\s?%$/)).toBeInTheDocument();
    const [desde, hasta] = servicio.obtenerIndicadores.mock.lastCall ?? [];
    expect(sumarDias(desde, 29)).toBe(hasta);
    expect(screen.getByText('8:00')).toBeInTheDocument();
    expect(screen.getByText('de 12 servicios')).toBeInTheDocument();
  });

  it('un clic en una barra abre la bandeja con ese filtro y el mismo rango', async () => {
    renderizar('/indicadores-clinicos?desde=2026-10-17&hasta=2026-11-15');
    await userEvent.click(await screen.findByRole('button', { name: /Rojo: crítico/ }));

    expect(await screen.findByText('Bandeja')).toBeInTheDocument();
    expect(ubicacion).toBe('/historias-clinicas?desde=2026-10-17&hasta=2026-11-15&estado=todos&triage=rojo');
  });

  it('"Sin dato" se muestra pero no abre la bandeja', async () => {
    renderizar('/indicadores-clinicos');
    const fila = within(await screen.findByRole('list', { name: 'Historias por triage' }));
    expect(fila.getByText('Sin dato')).toBeInTheDocument();
    expect(fila.queryByRole('button', { name: /Sin dato/ })).not.toBeInTheDocument();
  });

  it('el tipo de servicio va en una barra segmentada con su leyenda', async () => {
    renderizar('/indicadores-clinicos?desde=2026-10-17&hasta=2026-11-15');
    await userEvent.click(await screen.findByRole('button', { name: /Traslado programado: 4 \(29\s?%\)\. Ver en la bandeja/ }));
    expect(ubicacion).toContain('modalidad=traslado_programado');
  });

  it('un rango de más de 366 días muestra el mensaje del backend', async () => {
    servicio.obtenerIndicadores.mockRejectedValue(new ErrorApi(422, 'El rango de fechas no puede superar 366 días'));
    renderizar('/indicadores-clinicos?desde=2024-01-01&hasta=2026-01-01');
    expect(await screen.findByText('El rango de fechas no puede superar 366 días')).toBeInTheDocument();
  });
});
