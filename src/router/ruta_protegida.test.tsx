import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it } from 'vitest';
import { crearClienteConsultas } from '../app/cliente_consultas';
import { ProveedorSesion } from '../features/authentication/providers/proveedor_sesion';
import { RutaProtegida } from './ruta_protegida';
import { RutaPublica } from './ruta_publica';

function renderizarEn(rutaInicial: string) {
  const enrutador = createMemoryRouter(
    [
      {
        element: <RutaPublica />,
        children: [{ path: '/iniciar-sesion', element: <p>Pantalla de inicio de sesión</p> }],
      },
      {
        element: <RutaProtegida />,
        children: [{ path: '/', element: <p>Contenido protegido</p> }],
      },
    ],
    { initialEntries: [rutaInicial] },
  );

  render(
    <QueryClientProvider client={crearClienteConsultas()}>
      <ProveedorSesion>
        <RouterProvider router={enrutador} />
      </ProveedorSesion>
    </QueryClientProvider>,
  );
}

describe('RutaProtegida', () => {
  it('redirige al inicio de sesión cuando no hay sesión', async () => {
    renderizarEn('/');

    expect(await screen.findByText('Pantalla de inicio de sesión')).toBeInTheDocument();
    expect(screen.queryByText('Contenido protegido')).not.toBeInTheDocument();
  });

  it('descarta una credencial expirada guardada en el navegador', async () => {
    sessionStorage.setItem(
      'ambulancias_galenos.credencial',
      JSON.stringify({ tokenAcceso: 'token', expiraEn: '2020-01-01T00:00:00.000Z' }),
    );

    renderizarEn('/');

    expect(await screen.findByText('Pantalla de inicio de sesión')).toBeInTheDocument();
    expect(sessionStorage.getItem('ambulancias_galenos.credencial')).toBeNull();
  });
});
