import { useMutation } from '@tanstack/react-query';
import type { ErrorApi } from '../../../services/error_api';
import { iniciarSesion } from '../services/autenticacion.service';
import type {
  DatosInicioSesion,
  RespuestaSesionIniciada,
} from '../types/autenticacion.types';
import { useSesion } from './use_sesion';

export function useIniciarSesion() {
  const { establecerSesion } = useSesion();

  return useMutation<RespuestaSesionIniciada, ErrorApi, DatosInicioSesion>({
    mutationFn: iniciarSesion,
    onSuccess: establecerSesion,
  });
}
