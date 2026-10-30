import { createContext } from 'react';

export type TonoNotificacion = 'exito' | 'error' | 'informacion';

export interface Notificacion {
  id: number;
  tono: TonoNotificacion;
  titulo: string;
  descripcion?: string;
}

export interface ValorContextoNotificaciones {
  notificar: (notificacion: Omit<Notificacion, 'id'>) => void;
}

export const ContextoNotificaciones = createContext<ValorContextoNotificaciones | null>(null);
