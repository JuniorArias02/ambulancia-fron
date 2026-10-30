import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { entorno } from '../../../config/entorno';
import { useNotificaciones } from '../../../hooks/use_notificaciones';
import { leerCredencial } from '../../../services/almacen_credencial';
import { crearConexionTiempoReal } from '../../../services/socket.service';
import { leerEvento } from '../schemas/eventos.schema';
import type { EstadoConexion } from '../types/tiempo_real.types';
import { aplicarEvento } from '../utils/aplicar_evento';
import { crearColaInvalidaciones } from '../utils/cola_invalidaciones';
import { crearRegistroEventos } from '../utils/registro_eventos';
import { ContextoTiempoReal, type ValorContextoTiempoReal } from './contexto_tiempo_real';

const ESPERA_INICIAL_MS = 1_000;
const ESPERA_MAXIMA_MS = 30_000;

interface PropiedadesProveedorTiempoReal {
  usuarioId: string;
  /** El servidor rechazó la sesión (vencida, cerrada, bloqueo o cambio de rol): no se reintenta. */
  alSesionInvalida: () => void;
  url?: string;
  children: ReactNode;
}

/**
 * Una sola conexión para toda la sesión. El socket solo avisa: cada aviso recarga o ajusta las
 * consultas afectadas y, al conectar o reconectar, se reconsulta todo porque lo perdido no se reenvía.
 */
export function ProveedorTiempoReal({
  usuarioId,
  alSesionInvalida,
  url = entorno.urlTiempoReal,
  children,
}: PropiedadesProveedorTiempoReal) {
  const clienteConsultas = useQueryClient();
  const { notificar } = useNotificaciones();
  const [estado, setEstado] = useState<EstadoConexion>(url ? 'conectando' : 'desactivado');

  // Referencias para no reconectar cuando cambian funciones que no afectan la conexión.
  const notificarRef = useRef(notificar);
  const alSesionInvalidaRef = useRef(alSesionInvalida);
  useEffect(() => {
    notificarRef.current = notificar;
    alSesionInvalidaRef.current = alSesionInvalida;
  });

  useEffect(() => {
    if (!url) return;
    const conexion = crearConexionTiempoReal(url, () => leerCredencial()?.tokenAcceso ?? null);
    const registro = crearRegistroEventos();
    const cola = crearColaInvalidaciones(clienteConsultas);
    let intentos = 0;
    let reconexion: ReturnType<typeof setTimeout> | null = null;
    let sesionRechazada = false;

    // Socket.IO no reconecta solo si el servidor cortó la conexión: espera progresiva de 1 s a 30 s.
    const reconectarDespues = () => {
      if (sesionRechazada || reconexion !== null) return;
      const espera = Math.min(ESPERA_INICIAL_MS * 2 ** intentos, ESPERA_MAXIMA_MS);
      intentos += 1;
      reconexion = setTimeout(() => {
        reconexion = null;
        conexion.conectar();
      }, espera);
    };

    conexion.alRecibirEvento((tipo, carga) => {
      if (tipo === 'conectado') {
        intentos = 0;
        setEstado('en_linea');
        void clienteConsultas.invalidateQueries();
        return;
      }
      if (tipo === 'error_autenticacion') {
        sesionRechazada = true;
        conexion.cerrar();
        alSesionInvalidaRef.current();
        return;
      }
      if (tipo === 'error_conexion') {
        setEstado('reconectando');
        return;
      }
      const evento = leerEvento(tipo, carga);
      if (!evento || !registro.aceptar(evento)) return;
      aplicarEvento(evento, { clienteConsultas, cola, notificar: notificarRef.current, usuarioId });
    });

    conexion.alDesconectarse((porElServidor) => {
      if (sesionRechazada) return;
      setEstado('reconectando');
      if (porElServidor) reconectarDespues();
    });

    conexion.alFallarConexion((reintentaSolo) => {
      if (sesionRechazada) return;
      setEstado('sin_conexion');
      if (!reintentaSolo) reconectarDespues();
    });

    // El estado inicial ya es "conectando": un cambio de usuario implica una sesión nueva y otro montaje.
    conexion.conectar();

    return () => {
      if (reconexion !== null) clearTimeout(reconexion);
      cola.descartar();
      conexion.cerrar();
    };
  }, [url, usuarioId, clienteConsultas]);

  const valor = useMemo<ValorContextoTiempoReal>(() => ({ estado }), [estado]);
  return <ContextoTiempoReal value={valor}>{children}</ContextoTiempoReal>;
}
