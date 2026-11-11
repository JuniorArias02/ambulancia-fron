import type { FiltrosListasChequeo } from '../types/lista_chequeo.types';

export const LIMITE_LISTAS = 20;

export const LONGITUDES_LISTA = {
  nombre: 150,
  descripcion: 255,
  pregunta: 500,
  opcion: 60,
} as const;

export const MINIMO_PREGUNTAS = 1;
export const MINIMO_OPCIONES = 2;

/** Opciones con las que arranca una lista nueva; el administrador puede cambiarlas. */
export const OPCIONES_INICIALES = [
  { nombre: 'Bien', valor: '2' },
  { nombre: 'Regular', valor: '1' },
  { nombre: 'Estable', valor: '0' },
] as const;

export const CLAVES_LISTAS_CHEQUEO = {
  listas: ['listas-chequeo', 'lista'] as const,
  lista: (filtros: FiltrosListasChequeo) => ['listas-chequeo', 'lista', filtros] as const,
  detalle: (id: string) => ['listas-chequeo', 'detalle', id] as const,
};
