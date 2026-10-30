import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  eliminarCredencial,
  guardarCredencial,
  leerCredencial,
  type Credencial,
} from '../../../services/almacen_credencial';
import { registrarManejadorNoAutorizado } from '../../../services/api';
import { CLAVE_PERFIL } from '../../profile/constants/claves_consulta';
import { obtenerPerfil } from '../../profile/services/perfil.service';
import * as servicioAutenticacion from '../services/autenticacion.service';
import type {
  EstadoSesion,
  MotivoCierreSesion,
  RespuestaSesionIniciada,
} from '../types/autenticacion.types';
import { ContextoSesion, type ValorContextoSesion } from './contexto_sesion';

interface PropiedadesProveedorSesion {
  children: ReactNode;
}

export function ProveedorSesion({ children }: PropiedadesProveedorSesion) {
  const clienteConsultas = useQueryClient();
  const [credencial, setCredencial] = useState<Credencial | null>(leerCredencial);
  const [motivoCierre, setMotivoCierre] = useState<MotivoCierreSesion | null>(null);
  // Evita cierres duplicados cuando llegan varios 401 a la vez.
  const sesionActivaRef = useRef(credencial !== null);
  const cerrandoRef = useRef(false);

  const perfil = useQuery({
    queryKey: CLAVE_PERFIL,
    queryFn: obtenerPerfil,
    enabled: credencial !== null,
    staleTime: Infinity,
  });

  const finalizarSesionLocal = useCallback(
    (motivo: MotivoCierreSesion) => {
      if (!sesionActivaRef.current) return;
      sesionActivaRef.current = false;
      eliminarCredencial();
      clienteConsultas.clear();
      setCredencial(null);
      setMotivoCierre(motivo);
    },
    [clienteConsultas],
  );

  useEffect(
    () => registrarManejadorNoAutorizado(() => finalizarSesionLocal('no_autorizado')),
    [finalizarSesionLocal],
  );

  useEffect(() => {
    if (!credencial) return;
    const restante = Math.max(Date.parse(credencial.expiraEn) - Date.now(), 0);
    const temporizador = window.setTimeout(
      () => finalizarSesionLocal('expirada'),
      restante,
    );
    return () => window.clearTimeout(temporizador);
  }, [credencial, finalizarSesionLocal]);

  const establecerSesion = useCallback(
    (respuesta: RespuestaSesionIniciada) => {
      const nueva: Credencial = {
        tokenAcceso: respuesta.tokenAcceso,
        expiraEn: respuesta.expiraEn,
      };
      guardarCredencial(nueva);
      clienteConsultas.setQueryData(CLAVE_PERFIL, respuesta.usuario);
      sesionActivaRef.current = true;
      setMotivoCierre(null);
      setCredencial(nueva);
    },
    [clienteConsultas],
  );

  const cerrarSesion = useCallback(async () => {
    if (cerrandoRef.current) return;
    cerrandoRef.current = true;
    try {
      await servicioAutenticacion.cerrarSesion();
    } catch {
      // Si el backend no responde, la sesión local se descarta de todos modos.
    } finally {
      cerrandoRef.current = false;
      finalizarSesionLocal('voluntario');
    }
  }, [finalizarSesionLocal]);

  const { refetch } = perfil;
  const reintentarVerificacion = useCallback(() => {
    void refetch();
  }, [refetch]);

  const estado: EstadoSesion = !credencial
    ? 'anonimo'
    : perfil.data
      ? 'autenticado'
      : perfil.isError
        ? 'error'
        : 'verificando';

  const valor = useMemo<ValorContextoSesion>(
    () => ({
      estado,
      usuario: credencial ? (perfil.data ?? null) : null,
      motivoCierre,
      errorVerificacion: perfil.error,
      establecerSesion,
      cerrarSesion,
      finalizarSesionLocal,
      reintentarVerificacion,
    }),
    [
      estado,
      credencial,
      perfil.data,
      perfil.error,
      motivoCierre,
      establecerSesion,
      cerrarSesion,
      finalizarSesionLocal,
      reintentarVerificacion,
    ],
  );

  return <ContextoSesion value={valor}>{children}</ContextoSesion>;
}
