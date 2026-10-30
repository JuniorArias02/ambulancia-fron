import { QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { ProveedorSesion } from '../features/authentication/providers/proveedor_sesion';
import { ProveedorNotificaciones } from '../providers/proveedor_notificaciones';
import { crearClienteConsultas } from './cliente_consultas';

interface PropiedadesProveedores {
  children: ReactNode;
}

export function Proveedores({ children }: PropiedadesProveedores) {
  const [clienteConsultas] = useState(crearClienteConsultas);

  return (
    <QueryClientProvider client={clienteConsultas}>
      <ProveedorNotificaciones>
        <ProveedorSesion>{children}</ProveedorSesion>
      </ProveedorNotificaciones>
    </QueryClientProvider>
  );
}
