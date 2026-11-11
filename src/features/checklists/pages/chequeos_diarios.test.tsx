import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { crearClienteConsultas } from '../../../app/cliente_consultas';
import { ProveedorNotificaciones } from '../../../providers/proveedor_notificaciones';
import type { NombreRol } from '../../../types/rol.types';
import type { ChequeoDiario } from '../types/chequeo_diario.types';
import type { ListaChequeo } from '../types/lista_chequeo.types';
import { PaginaChequeosDiarios } from './pagina_chequeos_diarios';

const sesion = vi.hoisted(() => ({ rol: 'administrador' as NombreRol }));
const chequeos = vi.hoisted(() => ({ listarChequeos: vi.fn(), obtenerChequeo: vi.fn() }));
const listas = vi.hoisted(() => ({ obtenerListaChequeo: vi.fn() }));
const usuarios = vi.hoisted(() => ({ listarUsuarios: vi.fn() }));

vi.mock('../../authentication/hooks/use_sesion', () => ({ useSesion: () => ({ usuario: { id: 'yo', rol: sesion.rol } }) }));
vi.mock('../services/chequeos_diarios.service', () => chequeos);
vi.mock('../services/listas_chequeo.service', () => listas);
vi.mock('../../users/services/usuarios.service', () => usuarios);
vi.mock('../../ambulances/services/ambulancias.service', () => ({
  listarFlota: vi.fn().mockResolvedValue({ datos: [], total: 0, pagina: 1, limite: 100 }),
}));

const resumen: ChequeoDiario = {
  id: 'c1',
  fecha: '2026-11-10',
  estado: 'finalizado',
  iniciadoEn: '2026-11-10T11:00:00.000Z',
  finalizadoEn: '2026-11-10T11:10:00.000Z',
  listaChequeoId: 'lista-1',
  ambulanciaId: 'amb-1',
  ambulanciaCodigo: 'AMB-01',
  conductorId: 'u1',
  conductorNombre: 'Pedro Díaz',
  respuestas: [
    { itemId: 'p1', pregunta: null, estadoId: 'e2', calificacion: null, tieneObservacion: true, observacion: 'Bajo, se rellenó', respondidoEn: '2026-11-10T11:05:00.000Z' },
    { itemId: 'p2', pregunta: null, estadoId: 'e1', calificacion: null, tieneObservacion: false, observacion: null, respondidoEn: '2026-11-10T11:06:00.000Z' },
    { itemId: 'p3', pregunta: null, estadoId: 'e2', calificacion: null, tieneObservacion: false, observacion: null, respondidoEn: '2026-11-10T11:07:00.000Z' },
  ],
  pendientes: [],
};

// En el detalle llegan los textos de la pregunta y la calificación.
const TEXTOS: Record<string, { pregunta: string; calificacion: string }> = {
  p1: { pregunta: '¿Nivel de aceite?', calificacion: 'Regular' },
  p2: { pregunta: '¿Luces y sirena?', calificacion: 'Bien' },
  p3: { pregunta: '¿Botiquín completo?', calificacion: 'Regular' },
};

const detalle: ChequeoDiario = {
  ...resumen,
  respuestas: resumen.respuestas.map((respuesta) => ({ ...respuesta, ...TEXTOS[respuesta.itemId] })),
};

const lista: ListaChequeo = {
  id: 'lista-1',
  nombre: 'Chequeo diario',
  descripcion: null,
  activa: true,
  creadaEn: '2026-11-10T10:00:00.000Z',
  actualizadaEn: null,
  items: [],
  estados: [
    { id: 'e1', nombre: 'Bien', valor: 2, orden: 0, activo: true },
    { id: 'e2', nombre: 'Regular', valor: 1, orden: 1, activo: true },
  ],
};

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function close() {
    this.removeAttribute('open');
  };
});

beforeEach(() => {
  chequeos.listarChequeos.mockReset().mockResolvedValue({ datos: [resumen], total: 1, pagina: 1, limite: 20 });
  chequeos.obtenerChequeo.mockReset().mockResolvedValue(detalle);
  listas.obtenerListaChequeo.mockReset().mockResolvedValue(lista);
  usuarios.listarUsuarios.mockReset().mockResolvedValue({ datos: [], total: 0, pagina: 1, limite: 100 });
});

function renderizar() {
  render(
    <QueryClientProvider client={crearClienteConsultas()}>
      <ProveedorNotificaciones>
        <MemoryRouter initialEntries={['/chequeos-diarios']}>
          <PaginaChequeosDiarios />
        </MemoryRouter>
      </ProveedorNotificaciones>
    </QueryClientProvider>,
  );
}

/** El resumen mezcla un número en negrita con texto: se busca por el contenido completo del párrafo. */
const resumenNovedades = (_: string, elemento: Element | null) =>
  elemento?.tagName === 'P' && /respuestas?$/.test(elemento.textContent ?? '');

async function abrirChequeo() {
  renderizar();
  const [fila] = await screen.findAllByText('Pedro Díaz');
  if (!fila) throw new Error('Sin fila');
  await userEvent.click(fila);
  return within(await screen.findByRole('dialog'));
}

describe('PaginaChequeosDiarios', () => {
  it('en la tabla cuenta las observaciones de cada chequeo', async () => {
    renderizar();
    expect(await screen.findAllByText('1 observación')).not.toHaveLength(0);
  });

  it('el administrador ve como novedades las observaciones y las calificaciones distintas de la mejor', async () => {
    sesion.rol = 'administrador';
    const panel = await abrirChequeo();

    expect(await panel.findByText('¿Nivel de aceite?')).toBeInTheDocument();
    expect(panel.getByText('Bajo, se rellenó')).toBeInTheDocument();
    // La escala llega aparte: se espera a que la regular cuente como novedad.
    await waitFor(() => expect(panel.getByText(resumenNovedades)).toHaveTextContent('2 novedades de 3 respuestas'));

    await userEvent.click(panel.getByRole('button', { name: 'Novedades' }));
    expect(panel.queryByText('¿Luces y sirena?')).not.toBeInTheDocument();
    expect(panel.getByText('¿Botiquín completo?')).toBeInTheDocument();
    expect(usuarios.listarUsuarios).toHaveBeenCalledWith(expect.objectContaining({ rol: 'conductor' }));
  });

  it('el despachador no consulta la configuración ni filtra por conductor', async () => {
    sesion.rol = 'despachador';
    const panel = await abrirChequeo();

    expect(await panel.findByText('¿Nivel de aceite?')).toBeInTheDocument();
    expect(panel.getByText(resumenNovedades)).toHaveTextContent('1 novedad de 3 respuestas');
    expect(listas.obtenerListaChequeo).not.toHaveBeenCalled();
    expect(usuarios.listarUsuarios).not.toHaveBeenCalled();
    expect(screen.queryByRole('combobox', { name: 'Filtrar por conductor' })).not.toBeInTheDocument();
  });
});
