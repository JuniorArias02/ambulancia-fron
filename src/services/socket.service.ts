import { io } from 'socket.io-client';

const NAMESPACE = '/tiempo-real';

/**
 * Conexión de tiempo real desacoplada de Socket.IO: el resto de la aplicación solo conoce
 * esta interfaz. El socket solo avisa; toda acción sigue yendo por el REST.
 */
export interface ConexionTiempoReal {
  /** Todos los eventos del servidor, incluidos `conectado` y los de error. */
  alRecibirEvento: (manejador: (tipo: string, carga: unknown) => void) => void;
  /** `porElServidor`: Socket.IO no reconecta solo en ese caso. */
  alDesconectarse: (manejador: (porElServidor: boolean) => void) => void;
  /** `reintentaSolo`: Socket.IO seguirá intentando sin ayuda. */
  alFallarConexion: (manejador: (reintentaSolo: boolean) => void) => void;
  conectar: () => void;
  cerrar: () => void;
}

export function crearConexionTiempoReal(url: string, obtenerToken: () => string | null): ConexionTiempoReal {
  const socket = io(`${url}${NAMESPACE}`, {
    // Se lee en cada intento para usar siempre el token vigente.
    auth: (enviar) => enviar({ token: obtenerToken() ?? '' }),
    transports: ['websocket'],
    autoConnect: false,
    reconnectionDelay: 1_000,
    reconnectionDelayMax: 30_000,
  });

  return {
    alRecibirEvento: (manejador) => {
      socket.onAny(manejador);
    },
    alDesconectarse: (manejador) => {
      socket.on('disconnect', (razon) => manejador(razon === 'io server disconnect'));
    },
    alFallarConexion: (manejador) => {
      socket.on('connect_error', () => manejador(socket.active));
    },
    conectar: () => {
      socket.connect();
    },
    cerrar: () => {
      socket.offAny();
      socket.removeAllListeners();
      socket.disconnect();
    },
  };
}
