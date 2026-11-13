import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { crearClienteConsultas } from '../../../app/cliente_consultas';
import { ProveedorNotificaciones } from '../../../providers/proveedor_notificaciones';
import { ErrorApi } from '../../../services/error_api';
import type { Dotacion, Existencia, Insumo, Movimiento, UbicacionInventario } from '../types/inventario.types';
import { PanelMovimiento } from './panel_movimiento';
import { PanelNuevoMovimiento } from './panel_nuevo_movimiento';
import { VistaDotacion } from './vista_dotacion';

const catalogo = vi.hoisted(() => ({
  listarCatalogoInsumos: vi.fn(),
  listarLotes: vi.fn(),
  listarEquipos: vi.fn(),
  listarRegistros: vi.fn(),
}));
const bodegas = vi.hoisted(() => ({ listarUbicaciones: vi.fn(), habilitarAmbulancia: vi.fn() }));
const movimientos = vi.hoisted(() => ({
  registrarMovimiento: vi.fn(),
  obtenerMovimiento: vi.fn(),
  confirmarMovimiento: vi.fn(),
  anularMovimiento: vi.fn(),
  listarExistenciasDeUbicacion: vi.fn(),
  obtenerDotacion: vi.fn(),
}));

vi.mock('../services/catalogo.service', () => catalogo);
vi.mock('../services/bodegas.service', () => bodegas);
vi.mock('../services/movimientos.service', () => movimientos);
vi.mock('../../ambulances/services/ambulancias.service', () => ({
  listarFlota: vi.fn().mockResolvedValue({
    datos: [{ id: 'amb-2', codigo: 'AMB-02', placa: 'ABC123', tipo: { id: 't', nombre: 'TAB', descripcion: null }, estadoOperativo: 'disponible', ultimaUbicacion: null, creadaEn: '2026-10-01T00:00:00.000Z' }],
    total: 1,
    pagina: 1,
    limite: 100,
  }),
}));

const insumo = (id: string, nombre: string, control: Insumo['control']): Insumo => ({
  id,
  codigo: id.toUpperCase(),
  nombre,
  descripcion: null,
  tipo: 'medicamento',
  categoria: null,
  unidadMedida: 'unidad',
  marca: null,
  fabricante: null,
  requiereLote: control === 'lote',
  requiereVencimiento: control === 'lote',
  requiereRegistroSanitario: false,
  requiereSerie: control === 'serie',
  esControlEspecial: false,
  control,
  stockMinimo: 0,
  activo: true,
  creadoEn: '2026-11-01T00:00:00.000Z',
  actualizadoEn: '2026-11-01T00:00:00.000Z',
});

const UBICACIONES: UbicacionInventario[] = [
  { id: 'ubi-bod', tipo: 'bodega', nombre: 'Bodega central', bodegaId: 'b1', ambulanciaId: null, activa: true },
  { id: 'ubi-amb', tipo: 'ambulancia', nombre: 'AMB-02', bodegaId: null, ambulanciaId: 'amb-2', activa: true },
];

const existencia = (id: string, datos: Partial<Existencia>): Existencia => ({
  id,
  ubicacionId: 'ubi-bod',
  ubicacionTipo: 'bodega',
  ubicacionNombre: 'Bodega central',
  insumoId: 'adrenalina',
  insumoCodigo: 'ADRENALINA',
  insumoNombre: 'Adrenalina',
  unidadMedida: 'ampolla',
  loteId: null,
  numeroLote: null,
  loteVencimiento: null,
  equipoId: null,
  numeroSerie: null,
  equipoEstado: null,
  claveControl: id,
  cantidad: 10,
  utilizable: true,
  actualizadaEn: '2026-11-11T00:00:00.000Z',
  ...datos,
});

const movimiento = (datos: Partial<Movimiento>): Movimiento => ({
  id: 'mov-1',
  codigo: 'MOV-20261111-1A2B3C4D',
  tipo: 'devolucion',
  estado: 'borrador',
  origen: { id: 'ubi-amb', tipo: 'ambulancia', nombre: 'AMB-02' },
  destino: { id: 'ubi-bod', tipo: 'bodega', nombre: 'Bodega central' },
  asignacionId: null,
  usuarioId: 'p1',
  usuarioNombre: 'Laura Gómez',
  motivo: null,
  observaciones: null,
  documentoReferencia: null,
  realizadoEn: '2026-11-11T13:00:00.000Z',
  creadoEn: '2026-11-11T13:00:00.000Z',
  actualizadoEn: '2026-11-11T13:00:00.000Z',
  lineas: [],
  ...datos,
});

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function close() {
    this.removeAttribute('open');
  };
  Element.prototype.scrollIntoView = vi.fn();
});

beforeEach(() => {
  for (const modulo of [catalogo, bodegas, movimientos]) for (const funcion of Object.values(modulo)) funcion.mockReset();
  catalogo.listarCatalogoInsumos.mockResolvedValue([insumo('gasa', 'Gasa estéril', 'insumo'), insumo('adrenalina', 'Adrenalina', 'lote')]);
  catalogo.listarLotes.mockResolvedValue({ datos: [], total: 0, pagina: 1, limite: 100 });
  bodegas.listarUbicaciones.mockResolvedValue(UBICACIONES);
  movimientos.listarExistenciasDeUbicacion.mockResolvedValue([
    existencia('e-vigente', { loteId: 'lote-ok', numeroLote: 'L-OK', loteVencimiento: '2027-01-10' }),
    existencia('e-vencido', { loteId: 'lote-viejo', numeroLote: 'L-VIEJO', loteVencimiento: '2026-01-10', utilizable: false }),
  ]);
  movimientos.registrarMovimiento.mockResolvedValue(movimiento({ tipo: 'entrada', estado: 'borrador' }));
});

function renderizar(contenido: ReactNode, ruta = '/') {
  render(
    <QueryClientProvider client={crearClienteConsultas()}>
      <ProveedorNotificaciones>
        <MemoryRouter initialEntries={[ruta]}>{contenido}</MemoryRouter>
      </ProveedorNotificaciones>
    </QueryClientProvider>,
  );
}

async function esperarFormulario() {
  await screen.findByRole('button', { name: 'Registrar y confirmar' });
}

/** Escribe en un selector con buscador y elige la opción que aparece. */
async function elegir(campo: HTMLElement, busqueda: string, opcion: RegExp) {
  await userEvent.clear(campo);
  await userEvent.type(campo, busqueda);
  await userEvent.click(await screen.findByRole('option', { name: opcion }));
}

const campoBuscable = (nombre: string | RegExp) => screen.getByRole('combobox', { name: nombre });

describe('Nuevo movimiento', () => {
  it('una entrada solo lleva destino y se guarda en borrador', async () => {
    renderizar(<PanelNuevoMovimiento alCerrar={vi.fn()} />);
    await esperarFormulario();

    expect(screen.queryByRole('combobox', { name: /^Origen/ })).not.toBeInTheDocument();
    await elegir(campoBuscable(/^Destino/), 'central', /Bodega central/);
    // Se busca sin tildes ni mayúsculas.
    await elegir(campoBuscable('Insumo de la línea 1'), 'esteril', /Gasa estéril/);
    await userEvent.type(screen.getByRole('textbox', { name: 'Cantidad de la línea 1' }), '30');
    await userEvent.click(screen.getByRole('button', { name: 'Guardar borrador' }));

    await waitFor(() =>
      expect(movimientos.registrarMovimiento).toHaveBeenCalledWith(
        expect.objectContaining({
          tipo: 'entrada',
          origenUbicacionId: null,
          destinoUbicacionId: 'ubi-bod',
          confirmar: false,
          lineas: [{ insumoId: 'gasa', cantidad: 30 }],
        }),
      ),
    );
  });

  it('una transferencia elige lo que hay en el origen y no deja llevar un lote vencido a una ambulancia', async () => {
    movimientos.registrarMovimiento.mockResolvedValue(movimiento({ tipo: 'transferencia', estado: 'confirmado' }));
    renderizar(<PanelNuevoMovimiento alCerrar={vi.fn()} />);
    await esperarFormulario();

    await userEvent.selectOptions(screen.getByLabelText(/^Tipo de movimiento/), 'transferencia');
    await elegir(campoBuscable(/^Origen/), 'bodega', /Bodega central/);
    await elegir(campoBuscable(/^Destino/), 'amb', /AMB-02/);
    const linea = await screen.findByRole('combobox', { name: 'Qué sale en la línea 1' });
    await waitFor(() => expect(linea).toBeEnabled());

    await userEvent.type(linea, 'adrenalina');
    expect(await screen.findByRole('option', { name: /L-VIEJO/ })).toHaveAttribute('aria-disabled', 'true');
    // También se busca por número de lote.
    await userEvent.clear(linea);
    await userEvent.type(linea, 'l-ok');
    expect(screen.queryByRole('option', { name: /L-VIEJO/ })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('option', { name: /L-OK/ }));
    await userEvent.type(screen.getByRole('textbox', { name: 'Cantidad de la línea 1' }), '10');
    await userEvent.click(screen.getByRole('button', { name: 'Registrar y confirmar' }));

    await waitFor(() =>
      expect(movimientos.registrarMovimiento).toHaveBeenCalledWith(
        expect.objectContaining({
          tipo: 'transferencia',
          origenUbicacionId: 'ubi-bod',
          destinoUbicacionId: 'ubi-amb',
          confirmar: true,
          lineas: [{ insumoId: 'adrenalina', loteId: 'lote-ok', cantidad: 10 }],
        }),
      ),
    );
  });

  it('si no alcanza la existencia (409) muestra el mensaje y no cierra', async () => {
    movimientos.registrarMovimiento.mockRejectedValue(
      new ErrorApi(409, 'No alcanza Gasa estéril en Bodega central: hay 70 y se necesitan 1000'),
    );
    const alCerrar = vi.fn();
    renderizar(<PanelNuevoMovimiento alCerrar={alCerrar} />);
    await esperarFormulario();

    await elegir(campoBuscable(/^Destino/), 'central', /Bodega central/);
    await elegir(campoBuscable('Insumo de la línea 1'), 'gasa', /Gasa estéril/);
    await userEvent.type(screen.getByRole('textbox', { name: 'Cantidad de la línea 1' }), '1000');
    await userEvent.click(screen.getByRole('button', { name: 'Registrar y confirmar' }));

    expect(await screen.findByText(/No alcanza Gasa estéril en Bodega central/)).toBeInTheDocument();
    expect(alCerrar).not.toHaveBeenCalled();
  });
});

describe('Detalle de un movimiento', () => {
  it('una devolución por recibir se confirma al recibirla', async () => {
    const borrador = movimiento({});
    movimientos.obtenerMovimiento.mockResolvedValue(borrador);
    movimientos.confirmarMovimiento.mockResolvedValue({ ...borrador, estado: 'confirmado' });
    renderizar(<PanelMovimiento resumen={borrador} alCerrar={vi.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: 'Confirmar recepción' }));
    await waitFor(() => expect(movimientos.confirmarMovimiento).toHaveBeenCalledWith('mov-1'));
  });

  it('anular exige un motivo', async () => {
    const borrador = movimiento({});
    movimientos.obtenerMovimiento.mockResolvedValue(borrador);
    movimientos.anularMovimiento.mockResolvedValue({ ...borrador, estado: 'anulado' });
    renderizar(<PanelMovimiento resumen={borrador} alCerrar={vi.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: 'Anular' }));
    const enviar = screen.getAllByRole('button', { name: 'Anular' }).at(-1);
    if (!enviar) throw new Error('Sin botón de anular');
    await userEvent.click(enviar);
    expect(await screen.findByText('Escribe por qué se anula.')).toBeInTheDocument();
    expect(movimientos.anularMovimiento).not.toHaveBeenCalled();

    await userEvent.type(screen.getByLabelText(/¿Por qué se anula\?/), 'No llegó');
    await userEvent.click(enviar);
    await waitFor(() => expect(movimientos.anularMovimiento).toHaveBeenCalledWith('mov-1', 'No llegó'));
  });

  it('un movimiento confirmado ya no se confirma ni se anula', () => {
    const confirmado = movimiento({ estado: 'confirmado' });
    movimientos.obtenerMovimiento.mockResolvedValue(confirmado);
    renderizar(<PanelMovimiento resumen={confirmado} alCerrar={vi.fn()} />);

    expect(screen.queryByRole('button', { name: /Confirmar/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Anular' })).not.toBeInTheDocument();
    expect(screen.getByText(/se corrige con un ajuste|corrígelo con un ajuste/)).toBeInTheDocument();
  });
});

describe('Dotación de una ambulancia', () => {
  const dotacion: Dotacion = {
    ambulanciaId: 'amb-2',
    ambulanciaCodigo: 'AMB-02',
    fecha: '2026-11-11',
    ubicacion: UBICACIONES[1] ?? null,
    perfil: { id: 'p1', codigo: 'DOT-TAB', nombre: 'Dotación TAB', version: 2 },
    completa: false,
    items: [
      {
        detallePerfilId: 'd1',
        insumoId: 'gasa',
        insumoCodigo: 'GASA',
        insumoNombre: 'Gasa estéril',
        unidadMedida: 'unidad',
        cantidadRequerida: 25,
        cantidadMinima: 20,
        obligatorio: true,
        disponible: 12,
        noUtilizable: 0,
        faltante: 13,
        estado: 'bajo_minimo',
      },
    ],
    adicionales: [],
    existencias: [],
  };

  it('propone una transferencia hacia la ambulancia con lo que falta', async () => {
    movimientos.obtenerDotacion.mockResolvedValue(dotacion);
    movimientos.listarExistenciasDeUbicacion.mockResolvedValue([
      existencia('e-adrenalina', { loteId: 'lote-ok', numeroLote: 'L-OK' }),
      existencia('e-gasa', { insumoId: 'gasa', insumoCodigo: 'GASA', insumoNombre: 'Gasa estéril', unidadMedida: 'unidad', cantidad: 70 }),
    ]);
    renderizar(<VistaDotacion />, '/inventario/existencias?vista=dotacion&ambulanciaId=amb-2');

    // La tabla y la lista móvil muestran el mismo estado.
    expect(await screen.findAllByText('Bajo el mínimo')).not.toHaveLength(0);
    await userEvent.click(screen.getByRole('button', { name: 'Abastecer faltantes' }));

    const panel = within(await screen.findByRole('dialog', { name: 'Abastecer AMB-02' }));
    await waitFor(() => expect(panel.getByRole('combobox', { name: /^Destino/ })).toHaveValue('AMB-02'));
    expect(panel.getByLabelText(/^Tipo de movimiento/)).toHaveValue('transferencia');
    expect(panel.getByText('Elige primero el origen para ver lo que hay disponible.')).toBeInTheDocument();

    // La gasa no lleva lote: al elegir la bodega, la línea propuesta queda lista con su existencia.
    await elegir(panel.getByRole('combobox', { name: /^Origen/ }), 'central', /Bodega central/);
    const linea = await panel.findByRole('combobox', { name: 'Qué sale en la línea 1' });
    await waitFor(() => expect(linea).toHaveValue('Gasa estéril'));
    expect(panel.getByRole('textbox', { name: 'Cantidad de la línea 1' })).toHaveValue('13');
  });
});
