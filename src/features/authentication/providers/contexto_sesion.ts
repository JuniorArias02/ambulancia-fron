import { createContext } from 'react';
import type { ErrorApi } from '../../../services/error_api';
import type { PerfilUsuario } from '../../profile/types/perfil.types';
import type {
  EstadoSesion,
  MotivoCierreSesion,
  RespuestaSesionIniciada,
} from '../types/autenticacion.types';

export interface ValorContextoSesion {
  estado: EstadoSesion;
  usuario: PerfilUsuario | null;
  motivoCierre: MotivoCierreSesion | null;
  errorVerificacion: ErrorApi | null;
  establecerSesion: (respuesta: RespuestaSesionIniciada) => void;
  cerrarSesion: () => Promise<void>;
  /** Descarta la sesión en el navegador cuando el backend ya la revocó. */
  finalizarSesionLocal: (motivo: MotivoCierreSesion) => void;
  reintentarVerificacion: () => void;
}

export const ContextoSesion = createContext<ValorContextoSesion | null>(null);
