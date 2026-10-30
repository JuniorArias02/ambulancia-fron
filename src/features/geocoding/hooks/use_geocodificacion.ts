import { useMutation } from '@tanstack/react-query';
import { geocodificarDireccion, geocodificarPunto } from '../services/geocodificacion.service';

/** Dirección escrita → coordenadas. Se usa con el botón "Ubicar", nunca en cada tecla. */
export function useGeocodificarDireccion() {
  return useMutation({ mutationFn: geocodificarDireccion });
}

/** Punto tocado → dirección. Se usa al soltar o hacer clic, nunca mientras se arrastra. */
export function useGeocodificarPunto() {
  return useMutation({ mutationFn: geocodificarPunto });
}
