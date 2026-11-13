import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { crearClienteConsultas } from '../../../app/cliente_consultas';
import { ProveedorNotificaciones } from '../../../providers/proveedor_notificaciones';
import { ErrorApi } from '../../../services/error_api';
import { PaginaVerificacionesInventario } from '../pages/pagina_verificaciones_inventario';
import type { Insumo, VerificacionInventario } from '../types/inventario.types';
import { PanelVerificacion } from './panel_verificacion';

const verificaciones = vi.hoisted(() => ({
  listarVerificacionesInventario: vi.fn(),
  obtenerVerificacionInventario: vi.fn(),
  revisarVerificacionInventario: vi.fn(),
}));
const catalogo = vi.hoisted(() => ({ listarCatalogoInsumos: vi.fn(), listarLotes: vi.fn(), listarEquipos: vi.fn() }));
const bodegas = vi.hoisted(() => ({ listarUbicaciones: vi.fn() }));
const movimientos = vi.hoisted(() => ({ registrarMovimiento: vi.fn(), listarExistenciasDeUbicacion: vi.fn() }));

vi.mock('../services/verificaciones.service', () => verificaciones);
vi.mock('../services/catalogo.service', () => catalogo);
vi.mock('../services/bodegas.service', () => bodegas);
vi.mock('../services/movimientos.service', () => movimientos);

const gasa: Insumo = {
  id: 'gasa',
  codigo: 'GAS-01',
  nombre: 'Gasa estéril',
  descripcion: null,
  tipo: 'insumo_asistencial',
  categoria: null,
  unidadMedida: 'unidad',
  marca: null,
  fabricante: null,
  requiereLote: false,
  requiereVencimiento: false,
  requiereRegistroSanitario: false,
  requiereSerie: false,
  esControlEspecial: false,
  control: 'insumo',
  stockMinimo: 0,
  activo: true,
  creadoEn: '2026-11-01T00:00:00.000Z',
  actualizadoEn: '2026-11-01T00:00:00.000Z',
};

const pendiente: VerificacionInventario = {
  id: 'ver-1',
  ubicacionId: 'ubi-amb',
  ubicacionNombre: 'AMB-02',
  turnoId: null,
  responsableId: 'p1',
  responsableNombre: 'Laura Gómez',
  tipo: 'fin_turno',
  estado: 'con_novedades',
  iniciadaEn: '2026-11-13T10:00:00.000Z',
  finalizadaEn: '2026-11-13T10:20:00.000Z',
  observaciones: null,
  totalNovedades: 1,
  pendienteDeRevision: true,
  revision: null,
  conteos: [
    {
      id: 'c1',
      insumoId: 'gasa',
      insumoNombre: 'Gasa estéril',
      loteId: null,
      numeroLote: null,
      equipoId: null,
      numeroSerie: null,
      perfilDetalleId: null,
      cantidadEsperada: 10,
      cantidadEncontrada: 10,
      estado: 'danado',
      observaciones: 'Empaques mojados',
      creadoEn: '2026-11-13T10:05:00.000Z',
    },
  ],
};

const revisada: VerificacionInventario = {
  ...pendiente,
  pendienteDeRevision: false,
  revision: {
    revisadaPorId: 'adm',
    revisadaPorNombre: 'Ana Ruiz',
    revisadaEn: '2026-11-13T15:20:00.000Z',
    resolucion: 'Gasas dañadas dadas de baja con MOV-20261113-1A2B3C4D.',
  },
};

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
  for (const modulo of [verificaciones, catalogo, bodegas, movimientos]) for (const funcion of Object.values(modulo)) funcion.mockReset();
  catalogo.listarCatalogoInsumos.mockResolvedValue([gasa]);
  bodegas.listarUbicaciones.mockResolvedValue([
    { id: 'ubi-bod', tipo: 'bodega', nombre: 'Bodega central', bodegaId: 'b1', ambulanciaId: null, activa: true },
    { id: 'ubi-amb', tipo: 'ambulancia', nombre: 'AMB-02', bodegaId: null, ambulanciaId: 'amb-2', activa: true },
  ]);
  movimientos.listarExistenciasDeUbicacion.mockResolvedValue([
    {
      id: 'e-gasa',
      ubicacionId: 'ubi-amb',
      ubicacionTipo: 'ambulancia',
      ubicacionNombre: 'AMB-02',
      insumoId: 'gasa',
      insumoCodigo: 'GAS-01',
      insumoNombre: 'Gasa estéril',
      unidadMedida: 'unidad',
      loteId: null,
      numeroLote: null,
      loteVencimiento: null,
      equipoId: null,
      numeroSerie: null,
      equipoEstado: null,
      claveControl: 'gasa',
      cantidad: 10,
      utilizable: true,
      actualizadaEn: '2026-11-13T00:00:00.000Z',
    },
  ]);
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

const panel = () => within(screen.getByRole('dialog', { name: 'Verificación de AMB-02' }));

describe('Revisión de novedades', () => {
  it('la bandeja pide las verificaciones sin revisar', async () => {
    verificaciones.listarVerificacionesInventario.mockResolvedValue({ datos: [pendiente], total: 1, pagina: 1, limite: 20 });
    renderizar(<PaginaVerificacionesInventario />, '/inventario/verificaciones');

    expect(await screen.findAllByText('Pendiente de revisión')).not.toHaveLength(0);
    expect(verificaciones.listarVerificacionesInventario).toHaveBeenCalledWith(expect.objectContaining({ revisada: false, estado: undefined }));
  });

  it('exige la resolución y al guardar cierra la vista', async () => {
    verificaciones.obtenerVerificacionInventario.mockResolvedValue(pendiente);
    verificaciones.revisarVerificacionInventario.mockResolvedValue(revisada);
    const alCerrar = vi.fn();
    renderizar(<PanelVerificacion resumen={pendiente} alCerrar={alCerrar} />);

    await userEvent.click(panel().getByRole('button', { name: 'Marcar como revisada' }));
    await userEvent.click(panel().getByRole('button', { name: 'Marcar como revisada' }));
    expect(await panel().findByText('Escribe cómo se resolvieron las novedades.')).toBeInTheDocument();
    expect(verificaciones.revisarVerificacionInventario).not.toHaveBeenCalled();

    await userEvent.type(panel().getByLabelText(/¿Cómo se resolvió\?/), 'Gasas dadas de baja');
    await userEvent.click(panel().getByRole('button', { name: 'Marcar como revisada' }));
    await waitFor(() => expect(verificaciones.revisarVerificacionInventario).toHaveBeenCalledWith('ver-1', 'Gasas dadas de baja'));
    expect(alCerrar).toHaveBeenCalled();
  });

  it('propone en la resolución el movimiento creado para corregir', async () => {
    verificaciones.obtenerVerificacionInventario.mockResolvedValue(pendiente);
    movimientos.registrarMovimiento.mockResolvedValue({ codigo: 'MOV-20261113-1A2B3C4D', tipo: 'baja', estado: 'confirmado' });
    renderizar(<PanelVerificacion resumen={pendiente} alCerrar={vi.fn()} />);

    await userEvent.click(panel().getByRole('button', { name: 'Dar de baja' }));
    const baja = within(await screen.findByRole('dialog', { name: 'Dar de baja' }));
    await waitFor(() => expect(baja.getByRole('combobox', { name: 'Qué sale en la línea 1' })).toHaveValue('Gasa estéril'));
    await userEvent.click(baja.getByRole('button', { name: 'Registrar y confirmar' }));
    await waitFor(() =>
      expect(movimientos.registrarMovimiento).toHaveBeenCalledWith(
        expect.objectContaining({ tipo: 'baja', origenUbicacionId: 'ubi-amb', lineas: [{ insumoId: 'gasa', cantidad: 10 }] }),
      ),
    );

    await userEvent.click(await panel().findByRole('button', { name: 'Marcar como revisada' }));
    expect(panel().getByLabelText(/¿Cómo se resolvió\?/)).toHaveValue('Corregido con: Baja MOV-20261113-1A2B3C4D.');
  });

  it('si otra persona la revisó antes (409), avisa y muestra su revisión', async () => {
    verificaciones.obtenerVerificacionInventario.mockResolvedValueOnce(pendiente).mockResolvedValue(revisada);
    verificaciones.revisarVerificacionInventario.mockRejectedValue(new ErrorApi(409, 'La verificación ya fue revisada'));
    renderizar(<PanelVerificacion resumen={pendiente} alCerrar={vi.fn()} />);

    await userEvent.click(panel().getByRole('button', { name: 'Marcar como revisada' }));
    await userEvent.type(panel().getByLabelText(/¿Cómo se resolvió\?/), 'Repuesto');
    await userEvent.click(panel().getByRole('button', { name: 'Marcar como revisada' }));

    expect(await screen.findByText('Otra persona ya la revisó')).toBeInTheDocument();
    expect(await panel().findByText('Ana Ruiz')).toBeInTheDocument();
    expect(panel().queryByRole('button', { name: 'Marcar como revisada' })).not.toBeInTheDocument();
  });

  it('una verificación revisada muestra quién, cuándo y cómo, sin editar ni corregir', async () => {
    verificaciones.obtenerVerificacionInventario.mockResolvedValue(revisada);
    renderizar(<PanelVerificacion resumen={revisada} alCerrar={vi.fn()} />);

    expect(panel().getByText('Ana Ruiz')).toBeInTheDocument();
    expect(panel().getByText('Gasas dañadas dadas de baja con MOV-20261113-1A2B3C4D.')).toBeInTheDocument();
    expect(panel().queryByRole('button', { name: 'Marcar como revisada' })).not.toBeInTheDocument();
    expect(panel().queryByRole('button', { name: 'Dar de baja' })).not.toBeInTheDocument();
  });

  it('una verificación completada no se revisa', () => {
    const completada: VerificacionInventario = { ...pendiente, estado: 'completada', totalNovedades: 0, pendienteDeRevision: false, conteos: [] };
    verificaciones.obtenerVerificacionInventario.mockResolvedValue(completada);
    renderizar(<PanelVerificacion resumen={completada} alCerrar={vi.fn()} />);

    expect(panel().queryByRole('button', { name: 'Marcar como revisada' })).not.toBeInTheDocument();
  });
});
