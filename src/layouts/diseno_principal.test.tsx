import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import type { NombreRol } from '../types/rol.types';
import { DisenoPrincipal } from './diseno_principal';

const sesion = vi.hoisted(() => ({ rol: 'despachador' as NombreRol }));

vi.mock('../features/authentication/hooks/use_sesion', () => ({
  useSesion: () => ({
    usuario: { id: '1', nombres: 'Ana', apellidos: 'Pérez', correo: 'ana@a.co', rol: sesion.rol },
    cerrarSesion: vi.fn(),
    finalizarSesionLocal: vi.fn(),
  }),
}));

vi.mock('../features/citizen_verifications/hooks/use_verificaciones', () => ({
  usePendientesVerificacion: () => ({ data: undefined }),
}));

// La conexión en tiempo real tiene su propia prueba; aquí solo importa el acceso por rol.
vi.mock('../features/realtime/providers/proveedor_tiempo_real', () => ({
  ProveedorTiempoReal: ({ children }: { children: ReactNode }) => children,
}));

function renderizarUsuarios() {
  const enrutador = createMemoryRouter(
    [
      {
        element: <DisenoPrincipal />,
        children: [
          {
            path: '/usuarios',
            handle: { titulo: 'Usuarios', roles: ['administrador'] },
            element: <p>Listado de usuarios</p>,
          },
        ],
      },
    ],
    { initialEntries: ['/usuarios'] },
  );
  render(<RouterProvider router={enrutador} />);
}

describe('DisenoPrincipal · acceso por rol', () => {
  it('bloquea la vista a roles sin permiso y oculta su navegación', () => {
    sesion.rol = 'despachador';
    renderizarUsuarios();

    expect(screen.getByText('Acceso restringido')).toBeInTheDocument();
    expect(screen.queryByText('Listado de usuarios')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Usuarios' })).not.toBeInTheDocument();
  });

  it('muestra la vista y su navegación al administrador', () => {
    sesion.rol = 'administrador';
    renderizarUsuarios();

    expect(screen.getByText('Listado de usuarios')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Usuarios' })).toBeInTheDocument();
  });
});
