import { useMutation } from '@tanstack/react-query';
import { useSesion } from '../../authentication/hooks/use_sesion';
import { cambiarContrasena } from '../services/perfil.service';

export function useCambiarContrasena() {
  const { finalizarSesionLocal } = useSesion();

  return useMutation({
    mutationFn: cambiarContrasena,
    // El backend ya revocó todas las sesiones; se descarta la local sin llamar a cerrar-sesion.
    onSuccess: () => finalizarSesionLocal('contrasena_cambiada'),
  });
}
