import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useEffect } from 'react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { crearClienteConsultas } from '../../../app/cliente_consultas';
import { ProveedorNotificaciones } from '../../../providers/proveedor_notificaciones';
import { ErrorApi } from '../../../services/error_api';
import { DisenoHistorias } from '../providers/diseno_historias';
import type { DetalleHistoria, EventoTrazabilidad, ResumenHistoria } from '../types/historia_clinica.types';
import { sumarDias } from '../utils/rangos_fecha';
import { PaginaExpediente } from './pagina_expediente';
import { PaginaHistorias } from './pagina_historias';

const servicio = vi.hoisted(() => ({
  buscarHistorias: vi.fn(),
  obtenerHistoria: vi.fn(),
  obtenerTrazabilidad: vi.fn(),
  obtenerIngreso: vi.fn(),
  anularHistoria: vi.fn(),
  obtenerImagenFirmaCierre: vi.fn(),
  listarAmbulanciasOpciones: vi.fn(),
  listarInstitucionesOpciones: vi.fn(),
  listarParamedicosOpciones: vi.fn(),
  obtenerCatalogos: vi.fn(),
  obtenerImagenFirmaHistoria: vi.fn(),
  descargarPdfHistoria: vi.fn(),
  exportarHistorias: vi.fn(),
}));
vi.mock('../services/historias.service', () => servicio);

const resumen: ResumenHistoria = {
  id: 'h-1',
  numeroHistoria: 'HC-20261025-0001',
  estado: 'cerrada',
  abiertaEn: '2026-10-25T15:02:11.000Z',
  horaEvento: '2026-10-25T14:40:00.000Z',
  cerradaEn: '2026-10-25T16:10:00.000Z',
  paciente: {
    identificado: true,
    nombres: 'Juan Carlos',
    apellidos: 'Pérez',
    tipoDocumento: 'CC',
    numeroDocumento: '1090123456',
    sexo: 'masculino',
    fechaNacimiento: '1990-11-15T00:00:00.000Z',
    edadAproximada: null,
    edadAnios: 34,
  },
  triage: 'amarillo',
  desenlace: 'trasladado',
  tipoEvento: 'transito',
  impresionDiagnostica: 'Trauma de miembro inferior derecho',
  aseguradoraEps: 'Nueva EPS',
  regimenAfiliacion: 'subsidiado',
  ingreso: { emergenciaId: 'e-1', numeroEmergencia: 'EMG-20261025-0002', modalidad: 'traslado_programado' },
  ambulancia: { id: 'a-1', codigo: 'AMB-01', placa: 'ABC123' },
  institucionDestino: { id: 'i-1', nombre: 'Hospital Erasmo Meoz' },
  creadaPor: { id: 'u-1', nombreCompleto: 'Lucía Rojas' },
  cerradaPor: { id: 'u-1', nombreCompleto: 'Lucía Rojas' },
  firmada: true,
  riesgoCaidaAlto: false,
  totales: { signosVitales: 3, lesiones: 1, intervenciones: 2, valoracionesDownton: 0 },
};

const nn: ResumenHistoria = {
  ...resumen,
  id: 'h-2',
  numeroHistoria: 'HC-20261025-0002',
  paciente: { ...resumen.paciente, identificado: false, nombres: null, apellidos: null, numeroDocumento: null, tipoDocumento: null },
};

const detalle: DetalleHistoria = {
  id: 'h-2',
  numeroHistoria: 'HC-20261025-0002',
  estado: 'cerrada',
  emergenciaId: 'e-1',
  numeroEmergencia: 'EMG-20261025-0002',
  modalidad: 'traslado_programado',
  asignacionId: 'as-1',
  abiertaEn: '2026-10-25T15:02:11.000Z',
  cerradaEn: '2026-10-25T16:10:00.000Z',
  creadaPor: { id: 'u-1', nombreCompleto: 'Lucía Rojas' },
  cerradaPor: { id: 'u-1', nombreCompleto: 'Lucía Rojas' },
  hashCierre: '42256fcfceca9f2c1d',
  firmaCierre: { id: 'f-1', registradaEn: '2026-10-01T10:00:00.000Z', huellaSha256: 'abc' },
  institucionDestino: null,
  datos: {
    pacienteIdentificado: false,
    nombres: null,
    apellidos: null,
    tipoDocumento: null,
    numeroDocumento: null,
    sexo: 'masculino',
    edadAproximada: 40,
    fechaNacimiento: null,
    aseguradoraEps: null,
    regimenAfiliacion: null,
    acompananteNombre: null,
    acompananteTelefono: null,
    horaEvento: null,
    tipoEvento: 'caida',
    mecanismoLesion: null,
    rolVictima: null,
    elementosProteccion: null,
    placaVehiculo: null,
    polizaSoat: null,
    xHemorragiaMasiva: null,
    aViaAerea: 'Permeable',
    bRespiracion: null,
    cCirculacion: null,
    dNeurologico: null,
    eExposicion: null,
    triage: 'rojo',
    alergias: 'Penicilina',
    medicamentosHabituales: null,
    antecedentes: null,
    impresionDiagnostica: null,
    observaciones: null,
    desenlace: 'rechazo_traslado',
    motivoRechazo: 'El paciente firmó el desistimiento',
    institucionDestinoId: null,
    condicionEntrega: null,
    receptorNombre: null,
    receptorCargo: null,
    entregadoEn: null,
  },
  signosVitales: [
    {
      id: 's-1',
      medidoEn: '2026-10-25T15:10:00.000Z',
      presionSistolica: 185,
      presionDiastolica: 100,
      frecuenciaCardiaca: 80,
      frecuenciaRespiratoria: 16,
      saturacionOxigeno: 97,
      temperatura: 36.5,
      glucometria: null,
      glasgowOcular: 4,
      glasgowVerbal: 5,
      glasgowMotor: 6,
      glasgowTotal: 15,
      escalaDolor: 3,
      registradoPor: { id: 'u-1', nombreCompleto: 'Lucía Rojas' },
    },
  ],
  lesiones: [],
  intervenciones: [],
  valoracionesDownton: [
    {
      id: 'd-1',
      evaluadaEn: '2026-10-25T15:20:00.000Z',
      caidasPrevias: true,
      medTranquilizantesSedantes: true,
      medDiureticos: false,
      medHipotensores: false,
      medAntiparkinsonianos: false,
      medAntidepresivos: false,
      medOtros: false,
      deficitVisual: true,
      deficitAuditivo: false,
      deficitExtremidades: false,
      estadoMental: 'orientado',
      deambulacion: 'normal',
      puntajeTotal: 3,
      nivelRiesgo: 'alto',
      observacion: null,
      registradoPor: { id: 'u-1', nombreCompleto: 'Lucía Rojas' },
    },
  ],
  firmasHistoria: [
    {
      id: 'fh-1',
      rolFirmante: 'acudiente',
      proposito: 'disentimiento',
      nombreFirmante: 'Luisa Díaz',
      tipoDocumento: 'CC',
      numeroDocumento: '60111222',
      parentesco: 'hijo',
      cargo: null,
      imagen: { tamanoBytes: 8421, anchoPx: 600, altoPx: 200, huellaSha256: 'abc' },
      motivoSinFirma: null,
      detalleMotivo: null,
      textoVersion: 'v1',
      firmadaEn: '2026-10-25T16:00:00.000Z',
      registradaPor: { id: 'u-1', nombreCompleto: 'Lucía Rojas' },
    },
    {
      id: 'fh-2',
      rolFirmante: 'paciente',
      proposito: 'comprobante_atencion',
      nombreFirmante: null,
      tipoDocumento: null,
      numeroDocumento: null,
      parentesco: null,
      cargo: null,
      imagen: null,
      motivoSinFirma: 'otro',
      detalleMotivo: 'Sin manos libres por la inmovilización',
      textoVersion: 'v1',
      firmadaEn: '2026-10-25T16:01:00.000Z',
      registradaPor: { id: 'u-1', nombreCompleto: 'Lucía Rojas' },
    },
  ],
  faltantesParaCerrar: [],
};

const eventos: EventoTrazabilidad[] = [
  {
    id: 't-1',
    accion: 'abrir',
    descripcion: 'Abrió la historia',
    tipo: 'creacion',
    ocurridoEn: '2026-10-25T15:02:11.000Z',
    usuario: { id: 'u-1', nombreCompleto: 'Lucía Rojas', rol: 'paramedico' },
    direccionIp: null,
    detalle: {},
  },
  {
    id: 't-2',
    accion: 'actualizar',
    descripcion: 'Actualizó datos de la historia',
    tipo: 'modificacion',
    ocurridoEn: '2026-10-25T15:05:00.000Z',
    usuario: { id: 'u-1', nombreCompleto: 'Lucía Rojas', rol: 'paramedico' },
    direccionIp: null,
    detalle: { campos: ['triage', 'desenlace'] },
  },
  {
    id: 't-3',
    accion: 'consultar',
    descripcion: 'Consultó la historia',
    tipo: 'consulta',
    ocurridoEn: '2026-11-14T10:00:00.000Z',
    usuario: { id: 'u-9', nombreCompleto: 'Administrador Sistema', rol: 'administrador' },
    direccionIp: null,
    detalle: {},
  },
];

const pagina = (datos: ResumenHistoria[]) => ({ datos, total: datos.length, pagina: 1, limite: 20 });

let ubicacionActual = '';
function SondaUbicacion() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    ubicacionActual = `${pathname}${search}`;
  }, [pathname, search]);
  return null;
}

const originales = { crear: URL.createObjectURL, liberar: URL.revokeObjectURL };

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function close() {
    this.removeAttribute('open');
  };
  Element.prototype.scrollIntoView = vi.fn();
  URL.createObjectURL = vi.fn(() => 'blob:firma');
  URL.revokeObjectURL = vi.fn();
});

afterAll(() => {
  URL.createObjectURL = originales.crear;
  URL.revokeObjectURL = originales.liberar;
});

beforeEach(() => {
  for (const funcion of Object.values(servicio)) funcion.mockReset();
  servicio.buscarHistorias.mockResolvedValue(pagina([resumen, nn]));
  servicio.obtenerHistoria.mockResolvedValue(detalle);
  servicio.obtenerTrazabilidad.mockResolvedValue({ datos: eventos, total: eventos.length, pagina: 1, limite: 100 });
  servicio.obtenerImagenFirmaCierre.mockResolvedValue(new Blob(['png'], { type: 'image/png' }));
  servicio.anularHistoria.mockResolvedValue(undefined);
  servicio.listarAmbulanciasOpciones.mockResolvedValue([]);
  servicio.listarInstitucionesOpciones.mockResolvedValue([]);
  servicio.listarParamedicosOpciones.mockResolvedValue([]);
  servicio.obtenerImagenFirmaHistoria.mockResolvedValue(new Blob(['png'], { type: 'image/png' }));
  servicio.obtenerCatalogos.mockResolvedValue({
    textosFirma: {
      disentimiento: { version: 'v1', texto: 'Rechazo el traslado de forma libre y voluntaria.' },
      comprobante_atencion: { version: 'v1', texto: 'Declaro que recibí la atención.' },
    },
  });
  servicio.descargarPdfHistoria.mockResolvedValue({ contenido: new Blob(['%PDF']), nombre: 'HC-20261025-0002.pdf' });
  servicio.exportarHistorias.mockResolvedValue({ contenido: new Blob(['csv']), nombre: 'historias-clinicas-2026-11-15.csv' });
});

function renderizar(ruta: string) {
  render(
    <QueryClientProvider client={crearClienteConsultas()}>
      <ProveedorNotificaciones>
        <MemoryRouter initialEntries={[ruta]}>
          <SondaUbicacion />
          <Routes>
            <Route element={<DisenoHistorias />}>
              <Route path="/historias-clinicas" element={<PaginaHistorias />} />
              <Route path="/historias-clinicas/:id" element={<PaginaExpediente />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </ProveedorNotificaciones>
    </QueryClientProvider>,
  );
}

const ultimaBusqueda = () => servicio.buscarHistorias.mock.lastCall?.[0];

describe('Bandeja de historias', () => {
  it('al entrar busca los últimos 7 días, vigentes y lo más reciente primero', async () => {
    renderizar('/historias-clinicas');

    expect(await screen.findAllByText('HC-20261025-0001')).not.toHaveLength(0);
    const filtros = ultimaBusqueda();
    expect(filtros).toMatchObject({ estado: 'vigentes', campoFecha: 'atencion', orden: 'fecha_desc', pagina: 1, limite: 20 });
    expect(sumarDias(filtros.desde, 6)).toBe(filtros.hasta);
  });

  it('muestra al NN en gris y el documento con su tipo', async () => {
    renderizar('/historias-clinicas');
    expect(await screen.findAllByText('NN — sin identificar')).not.toHaveLength(0);
    expect(screen.getByText('CC 1090123456')).toBeInTheDocument();
  });

  it('el documento se busca con "Buscar" y nunca queda en la URL', async () => {
    renderizar('/historias-clinicas');
    await screen.findAllByText('HC-20261025-0001');

    await userEvent.type(screen.getByLabelText('Documento del paciente'), '1.090.123.456');
    expect(ultimaBusqueda()?.documento).toBeUndefined();
    await userEvent.click(screen.getByRole('button', { name: 'Buscar' }));

    await waitFor(() => expect(ultimaBusqueda()?.documento).toBe('1.090.123.456'));
    expect(ubicacionActual).not.toContain('1090123456');
    expect(ubicacionActual).not.toContain('documento');

    await userEvent.click(screen.getByRole('button', { name: 'Quitar filtro Documento: 1.090.123.456' }));
    await waitFor(() => expect(ultimaBusqueda()?.documento).toBeUndefined());
  });

  it('el estado sí va a la URL y vuelve a la primera página', async () => {
    renderizar('/historias-clinicas?pagina=3');
    await screen.findAllByText('HC-20261025-0001');

    await userEvent.click(screen.getByRole('button', { name: 'Anuladas' }));
    await waitFor(() => expect(ultimaBusqueda()).toMatchObject({ estado: 'anulada', pagina: 1 }));
    expect(ubicacionActual).toContain('estado=anulada');
    expect(ubicacionActual).not.toContain('pagina=');
  });

  it('ignora valores inválidos de la URL en lugar de enviarlos', async () => {
    renderizar('/historias-clinicas?triage=morado&ambulanciaId=123&limite=7');
    await screen.findAllByText('HC-20261025-0001');
    expect(ultimaBusqueda()).toMatchObject({ triage: undefined, ambulanciaId: undefined, limite: 20 });
  });

  it('sin resultados lo dice y ofrece limpiar', async () => {
    servicio.buscarHistorias.mockResolvedValue(pagina([]));
    renderizar('/historias-clinicas?triage=rojo');

    expect(await screen.findByText('No hay historias con esos filtros')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Quitar filtro Triage: Rojo' })).toBeInTheDocument();
  });

  it('la columna Ingreso muestra el tipo de servicio y se puede filtrar por él', async () => {
    renderizar('/historias-clinicas');
    expect((await screen.findAllByText('Traslado programado')).length).toBeGreaterThan(0);

    await userEvent.click(screen.getByRole('button', { name: /Más filtros/ }));
    await userEvent.selectOptions(screen.getByLabelText('Tipo de servicio'), 'traslado_interhospitalario');
    await waitFor(() => expect(ultimaBusqueda()?.modalidad).toBe('traslado_interhospitalario'));
    expect(ubicacionActual).toContain('modalidad=traslado_interhospitalario');
    expect(screen.getByRole('button', { name: 'Quitar filtro Servicio: Traslado entre instituciones' })).toBeInTheDocument();
  });

  it('exportar avisa cuántas historias y que son datos personales', async () => {
    renderizar('/historias-clinicas');
    await screen.findAllByText('HC-20261025-0001');

    await userEvent.click(screen.getByRole('button', { name: 'Exportar a Excel' }));
    const dialogo = within(screen.getByRole('dialog', { name: 'Exportar a Excel' }));
    expect(dialogo.getByText('Se exportarán 2 historias con los filtros activos.')).toBeInTheDocument();
    expect(dialogo.getByText(/contiene datos personales y de salud/)).toBeInTheDocument();

    await userEvent.click(dialogo.getByRole('button', { name: 'Exportar' }));
    expect(await screen.findByText('Archivo descargado')).toBeInTheDocument();
    expect(servicio.exportarHistorias.mock.lastCall?.[0]).toMatchObject({ estado: 'vigentes' });
  });

  it('con más de 5000 historias no deja exportar', async () => {
    servicio.buscarHistorias.mockResolvedValue({ datos: [resumen], total: 5001, pagina: 1, limite: 20 });
    renderizar('/historias-clinicas');
    expect(await screen.findByText(/Acota los filtros para exportar/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Exportar a Excel' })).toBeDisabled();
  });

  it('un 422 muestra el mensaje del backend', async () => {
    servicio.buscarHistorias.mockRejectedValue(new ErrorApi(422, 'El rango de fechas no puede superar 366 días'));
    renderizar('/historias-clinicas?desde=2024-01-01&hasta=2026-01-01');
    expect(await screen.findByText('El rango de fechas no puede superar 366 días')).toBeInTheDocument();
  });
});

describe('Expediente', () => {
  it('la cabecera muestra al NN y las alertas que aplican', async () => {
    renderizar('/historias-clinicas/h-2');

    const cabecera = within(await screen.findByRole('banner'));
    expect(cabecera.getByText('Paciente NN')).toBeInTheDocument();
    const alertas = within(cabecera.getByRole('list', { name: 'Alertas' }));
    expect(alertas.getByText('Alergias')).toBeInTheDocument();
    expect(alertas.getByText(/Penicilina/)).toBeInTheDocument();
    expect(alertas.getByText('Riesgo de caída alto')).toBeInTheDocument();
    expect(alertas.getByText('Rechazó el traslado')).toBeInTheDocument();
    expect(alertas.getByText(/Triage rojo/)).toBeInTheDocument();
    expect(cabecera.getByText('42256FCFCECA')).toBeInTheDocument();
  });

  it('los signos fuera de rango se resaltan con texto, no solo color', async () => {
    renderizar('/historias-clinicas/h-2?pestana=signos');
    expect(await screen.findByText('185')).toBeInTheDocument();
    expect(screen.getByText('(fuera del rango de referencia)')).toBeInTheDocument();
    expect(screen.getByText('15 (O4 V5 M6)')).toBeInTheDocument();
  });

  it('la firma se descarga con el token y muestra el código de verificación', async () => {
    renderizar('/historias-clinicas/h-2?pestana=firma');

    expect(await screen.findByRole('img', { name: 'Firma de Lucía Rojas' })).toHaveAttribute('src', 'blob:firma');
    expect(servicio.obtenerImagenFirmaCierre).toHaveBeenCalledWith('h-2', expect.any(AbortSignal));
    expect(screen.getByText('Reautenticación con credenciales personales')).toBeInTheDocument();
  });

  it('la pestaña Firmas muestra al firmante, el texto aceptado y quién no firmó', async () => {
    renderizar('/historias-clinicas/h-2?pestana=firma');

    expect(await screen.findByText('Luisa Díaz')).toBeInTheDocument();
    expect(screen.getByText('CC 60111222 · Hijo o hija')).toBeInTheDocument();
    expect(await screen.findByText(/Rechazo el traslado de forma libre y voluntaria/)).toBeInTheDocument();
    expect(screen.getByText('Disentimiento: rechazo del traslado')).toBeInTheDocument();
    expect(screen.getByText(/No firmó: Otro/)).toBeInTheDocument();
    expect(screen.getByText('Sin manos libres por la inmovilización')).toBeInTheDocument();
    expect(await screen.findByRole('img', { name: 'Firma de Luisa Díaz' })).toHaveAttribute('src', 'blob:firma');
    expect(servicio.obtenerImagenFirmaHistoria).toHaveBeenCalledWith('h-2', 'fh-1', expect.any(AbortSignal));
    // Quien no firmó no tiene imagen que descargar.
    expect(servicio.obtenerImagenFirmaHistoria).not.toHaveBeenCalledWith('h-2', 'fh-2', expect.anything());
  });

  it('en una historia en curso lista las firmas que faltan', async () => {
    servicio.obtenerHistoria.mockResolvedValue({
      ...detalle,
      estado: 'borrador',
      cerradaEn: null,
      faltantesParaCerrar: ['triage', 'firma de quien recibe al paciente en la institución'],
    });
    renderizar('/historias-clinicas/h-2?pestana=firma');
    expect(await screen.findByText('Faltan firmas para cerrar la historia')).toBeInTheDocument();
    expect(screen.getByText('Firma de quien recibe al paciente en la institución')).toBeInTheDocument();
  });

  it('descarga el PDF desde la cabecera', async () => {
    renderizar('/historias-clinicas/h-2');
    await userEvent.click(await screen.findByRole('button', { name: 'Descargar PDF' }));
    await waitFor(() => expect(servicio.descargarPdfHistoria).toHaveBeenCalledWith('h-2', 'HC-20261025-0002'));
    expect(URL.createObjectURL).toHaveBeenCalled();
  });

  it('la trazabilidad se pide al abrir la pestaña y oculta las consultas', async () => {
    renderizar('/historias-clinicas/h-2');
    await screen.findByRole('banner');
    expect(servicio.obtenerTrazabilidad).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole('tab', { name: 'Trazabilidad' }));
    expect(await screen.findByText('Actualizó datos de la historia')).toBeInTheDocument();
    expect(screen.getByText('Triage, Desenlace')).toBeInTheDocument();
    expect(screen.queryByText('Consultó la historia')).not.toBeInTheDocument();

    await userEvent.click(screen.getByLabelText('Ocultar consultas'));
    expect(screen.getByText('Consultó la historia')).toBeInTheDocument();
  });

  it('anular exige el motivo y lo envía', async () => {
    renderizar('/historias-clinicas/h-2');
    await userEvent.click(await screen.findByRole('button', { name: 'Anular' }));

    const dialogo = within(screen.getByRole('dialog', { name: 'Anular historia' }));
    await userEvent.click(dialogo.getByRole('button', { name: 'Anular historia' }));
    expect(await dialogo.findByText('Describe el motivo con al menos 5 caracteres.')).toBeInTheDocument();
    expect(servicio.anularHistoria).not.toHaveBeenCalled();

    await userEvent.type(dialogo.getByLabelText(/Motivo/), 'Historia duplicada');
    await userEvent.click(dialogo.getByRole('button', { name: 'Anular historia' }));
    expect(await screen.findByText('Historia anulada')).toBeInTheDocument();
    expect(servicio.anularHistoria).toHaveBeenCalledWith('h-2', 'Historia duplicada');
  });

  it('una historia que no existe lo dice y deja volver', async () => {
    servicio.obtenerHistoria.mockRejectedValue(new ErrorApi(404, 'La historia no existe'));
    renderizar('/historias-clinicas/no-existe');
    expect(await screen.findByText('Historia no encontrada')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Historias clínicas' })).toHaveAttribute('href', '/historias-clinicas');
  });
});
