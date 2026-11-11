import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { crearClienteConsultas } from '../../../app/cliente_consultas';
import { ProveedorNotificaciones } from '../../../providers/proveedor_notificaciones';
import { ErrorApi } from '../../../services/error_api';
import type { ListaChequeo } from '../types/lista_chequeo.types';
import { PaginaListaChequeo } from './pagina_lista_chequeo';
import { PaginaListasChequeo } from './pagina_listas_chequeo';

const servicio = vi.hoisted(() => ({
  listarListasChequeo: vi.fn(),
  obtenerListaChequeo: vi.fn(),
  crearListaChequeo: vi.fn(),
  actualizarListaChequeo: vi.fn(),
  cambiarEstadoListaChequeo: vi.fn(),
  agregarPregunta: vi.fn(),
  actualizarPregunta: vi.fn(),
  agregarOpcion: vi.fn(),
  actualizarOpcion: vi.fn(),
}));

vi.mock('../services/listas_chequeo.service', () => servicio);

const lista: ListaChequeo = {
  id: 'lista-1',
  nombre: 'Chequeo diario',
  descripcion: 'Antes del turno',
  activa: false,
  creadaEn: '2026-11-10T10:00:00.000Z',
  actualizadaEn: null,
  items: [
    { id: 'p1', pregunta: '¿Nivel de aceite?', orden: 0, obligatorio: true, permiteObservacion: true, activo: true },
    { id: 'p2', pregunta: '¿Luces y sirena?', orden: 1, obligatorio: true, permiteObservacion: false, activo: true },
  ],
  estados: [
    { id: 'e1', nombre: 'Bien', valor: 2, orden: 0, activo: true },
    { id: 'e2', nombre: 'Regular', valor: 1, orden: 1, activo: true },
  ],
};

const activa: ListaChequeo = { ...lista, id: 'lista-0', nombre: 'Chequeo anterior', activa: true };

beforeAll(() => {
  // jsdom no implementa los diálogos modales nativos.
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function close() {
    this.removeAttribute('open');
  };
  Element.prototype.scrollIntoView = vi.fn();
});

beforeEach(() => {
  for (const funcion of Object.values(servicio)) funcion.mockReset();
  servicio.listarListasChequeo.mockImplementation(({ activa: soloActiva }: { activa?: boolean }) =>
    Promise.resolve(
      soloActiva
        ? { datos: [activa], total: 1, pagina: 1, limite: 1 }
        : { datos: [activa, lista], total: 2, pagina: 1, limite: 20 },
    ),
  );
  servicio.obtenerListaChequeo.mockResolvedValue(lista);
});

function renderizar(ruta: string) {
  render(
    <QueryClientProvider client={crearClienteConsultas()}>
      <ProveedorNotificaciones>
        <MemoryRouter initialEntries={[ruta]}>
          <Routes>
            <Route path="/listas-chequeo" element={<PaginaListasChequeo />} />
            <Route path="/listas-chequeo/:id" element={<PaginaListaChequeo />} />
          </Routes>
        </MemoryRouter>
      </ProveedorNotificaciones>
    </QueryClientProvider>,
  );
}

async function abrirEditor() {
  renderizar('/listas-chequeo/lista-1');
  await screen.findByRole('heading', { name: 'Chequeo diario' });
}

describe('PaginaListasChequeo', () => {
  it('muestra la lista en uso y crea una lista con sus preguntas y opciones', async () => {
    servicio.crearListaChequeo.mockResolvedValue(lista);
    renderizar('/listas-chequeo');

    expect(await screen.findByText('En uso:')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Nueva lista' }));
    const panel = within(screen.getByRole('dialog', { name: 'Nueva lista de chequeo' }));

    // Las opciones iniciales repetidas no se envían.
    await userEvent.clear(panel.getByLabelText('Nombre de la opción 2'));
    await userEvent.type(panel.getByLabelText('Nombre de la opción 2'), 'bien');
    await userEvent.type(panel.getByRole('textbox', { name: 'Nombre' }), 'Chequeo diario');
    await userEvent.type(panel.getByLabelText('Pregunta 1'), '¿Nivel de aceite?');
    await userEvent.click(panel.getByRole('button', { name: 'Crear lista' }));
    expect(await panel.findByText('Opción repetida.')).toBeInTheDocument();
    expect(servicio.crearListaChequeo).not.toHaveBeenCalled();

    await userEvent.clear(panel.getByLabelText('Nombre de la opción 2'));
    await userEvent.type(panel.getByLabelText('Nombre de la opción 2'), 'Regular');
    await userEvent.click(panel.getAllByRole('switch', { name: 'Admite observación' })[0] ?? document.body);
    await userEvent.click(panel.getByRole('button', { name: 'Crear lista' }));

    await waitFor(() =>
      expect(servicio.crearListaChequeo).toHaveBeenCalledWith({
        nombre: 'Chequeo diario',
        items: [{ pregunta: '¿Nivel de aceite?', obligatorio: true, permiteObservacion: false }],
        estados: [
          { nombre: 'Bien', valor: 2 },
          { nombre: 'Regular', valor: 1 },
          { nombre: 'Estable', valor: 0 },
        ],
      }),
    );
  });

  it('activar avisa qué lista deja de usarse', async () => {
    renderizar('/listas-chequeo');
    const [menu] = await screen.findAllByRole('button', { name: 'Acciones para Chequeo diario' });
    if (!menu) throw new Error('Sin menú');
    await userEvent.click(menu);
    await userEvent.click(screen.getByRole('button', { name: 'Activar' }));

    const dialogo = within(screen.getByRole('dialog', { name: 'Activar lista' }));
    expect(dialogo.getByText(/La lista activa actual dejará de usarse/)).toBeInTheDocument();
    expect(dialogo.getByText('Chequeo anterior')).toBeInTheDocument();
  });
});

describe('PaginaListaChequeo', () => {
  it('no ofrece eliminar: las preguntas se desactivan', async () => {
    await abrirEditor();
    expect(screen.queryByRole('button', { name: /Eliminar/ })).not.toBeInTheDocument();
    expect(screen.getAllByRole('switch', { name: 'Activa' })).toHaveLength(2);
  });

  it('los interruptores guardan al momento', async () => {
    servicio.actualizarPregunta.mockResolvedValue(lista);
    await abrirEditor();
    const [obligatoria] = screen.getAllByRole('switch', { name: 'Obligatoria' });
    if (!obligatoria) throw new Error('Sin interruptor');
    await userEvent.click(obligatoria);
    expect(servicio.actualizarPregunta).toHaveBeenCalledWith('lista-1', 'p1', { obligatorio: false });
  });

  it('muestra el 422 al desactivar la última pregunta activa', async () => {
    servicio.actualizarPregunta.mockRejectedValue(new ErrorApi(422, 'Debe quedar al menos una pregunta activa'));
    await abrirEditor();
    const [activa1] = screen.getAllByRole('switch', { name: 'Activa' });
    if (!activa1) throw new Error('Sin interruptor');
    await userEvent.click(activa1);
    expect(await screen.findByText('Debe quedar al menos una pregunta activa')).toBeInTheDocument();
  });

  it('reordena guardando solo las preguntas que cambian de posición', async () => {
    servicio.actualizarPregunta.mockResolvedValue(lista);
    await abrirEditor();
    await userEvent.click(screen.getByRole('button', { name: 'Bajar «¿Nivel de aceite?»' }));
    await waitFor(() => expect(servicio.actualizarPregunta).toHaveBeenCalledTimes(2));
    expect(servicio.actualizarPregunta).toHaveBeenNthCalledWith(1, 'lista-1', 'p2', { orden: 0 });
    expect(servicio.actualizarPregunta).toHaveBeenNthCalledWith(2, 'lista-1', 'p1', { orden: 1 });
  });

  it('si la pregunta ya fue respondida (409), ofrece desactivarla y crear una nueva', async () => {
    servicio.actualizarPregunta.mockRejectedValueOnce(new ErrorApi(409, 'La pregunta ya tiene respuestas'));
    servicio.actualizarPregunta.mockResolvedValueOnce(lista);
    servicio.agregarPregunta.mockResolvedValue(lista);
    await abrirEditor();

    await userEvent.click(screen.getByRole('button', { name: 'Editar «¿Nivel de aceite?»' }));
    const campo = screen.getByRole('textbox', { name: 'Texto de la pregunta' });
    await userEvent.clear(campo);
    await userEvent.type(campo, '¿Nivel de aceite del motor?');
    await userEvent.click(screen.getByRole('button', { name: 'Guardar texto' }));

    await userEvent.click(await screen.findByRole('button', { name: 'Desactivar y crear una nueva' }));
    await waitFor(() =>
      expect(servicio.agregarPregunta).toHaveBeenCalledWith('lista-1', {
        pregunta: '¿Nivel de aceite del motor?',
        orden: 0,
        obligatorio: true,
        permiteObservacion: true,
      }),
    );
    expect(servicio.actualizarPregunta).toHaveBeenLastCalledWith('lista-1', 'p1', { activo: false });
  });
});
