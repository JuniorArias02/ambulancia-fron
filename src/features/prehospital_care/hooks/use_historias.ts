import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CLAVES_HISTORIAS } from '../constants/claves_historias';
import {
  anularHistoria,
  buscarHistorias,
  buscarPacientes,
  descargarPdfHistoria,
  exportarHistorias,
  obtenerCatalogos,
  obtenerFichaPaciente,
  obtenerIndicadores,
  listarAmbulanciasOpciones,
  listarInstitucionesOpciones,
  listarParamedicosOpciones,
  obtenerHistoria,
  obtenerIngreso,
  obtenerTrazabilidad,
} from '../services/historias.service';
import { guardarArchivo } from '../../../utils/descargas';
import type { FiltrosHistorias, FiltrosPacientes } from '../types/historia_clinica.types';
import { diaColombia } from '../utils/rangos_fecha';

/** Los catálogos de los filtros casi no cambian: una vez por sesión. */
const DURACION_OPCIONES_MS = 30 * 60_000;

export function useBusquedaHistorias(filtros: FiltrosHistorias) {
  return useQuery({
    queryKey: CLAVES_HISTORIAS.busqueda(filtros),
    queryFn: ({ signal }) => buscarHistorias(filtros, signal),
    placeholderData: keepPreviousData,
  });
}

/** `gcTime: 0`: al salir del expediente sus datos se liberan de la memoria. */
export function useHistoria(id: string) {
  return useQuery({ queryKey: CLAVES_HISTORIAS.detalle(id), queryFn: () => obtenerHistoria(id), gcTime: 0 });
}

/** Se pide solo al abrir la pestaña. */
export function useTrazabilidad(id: string, pagina: number, limite: number, habilitada: boolean) {
  return useQuery({
    queryKey: CLAVES_HISTORIAS.trazabilidad(id, pagina),
    queryFn: () => obtenerTrazabilidad(id, pagina, limite),
    enabled: habilitada,
    gcTime: 0,
    placeholderData: keepPreviousData,
  });
}

export function useIngreso(numero: string | null, habilitada = true) {
  return useQuery({
    queryKey: CLAVES_HISTORIAS.ingreso(numero ?? ''),
    queryFn: () => obtenerIngreso(numero ?? ''),
    enabled: habilitada && Boolean(numero),
    gcTime: 0,
  });
}

/** Refresca el expediente, la bandeja y la trazabilidad con la respuesta confirmada. */
export function useAnularHistoria(id: string) {
  const clienteConsultas = useQueryClient();
  return useMutation({
    mutationFn: (motivo: string) => anularHistoria(id, motivo),
    onSuccess: () =>
      clienteConsultas.invalidateQueries({
        queryKey: CLAVES_HISTORIAS.todas,
        // Las opciones de los filtros no cambian al anular.
        predicate: ({ queryKey }) => queryKey[1] !== CLAVES_HISTORIAS.opciones[1],
      }),
  });
}

export function useAmbulanciasOpciones(habilitada = true) {
  return useQuery({
    enabled: habilitada,
    queryKey: [...CLAVES_HISTORIAS.opciones, 'ambulancias'],
    queryFn: listarAmbulanciasOpciones,
    staleTime: DURACION_OPCIONES_MS,
  });
}

export function useInstitucionesOpciones(habilitada = true) {
  return useQuery({
    enabled: habilitada,
    queryKey: [...CLAVES_HISTORIAS.opciones, 'instituciones'],
    queryFn: listarInstitucionesOpciones,
    staleTime: DURACION_OPCIONES_MS,
  });
}

export function useParamedicosOpciones(habilitada = true) {
  return useQuery({
    enabled: habilitada,
    queryKey: [...CLAVES_HISTORIAS.opciones, 'paramedicos'],
    queryFn: listarParamedicosOpciones,
    staleTime: DURACION_OPCIONES_MS,
  });
}

/** Una vez por sesión: los textos de las firmas casi nunca cambian. */
export function useCatalogosClinicos() {
  return useQuery({ queryKey: CLAVES_HISTORIAS.catalogos, queryFn: obtenerCatalogos, staleTime: Infinity });
}

/** El archivo pasa directo a la descarga: no queda en la caché ni en el estado. */
export function useDescargarPdf() {
  return useMutation({
    mutationFn: ({ id, numeroHistoria }: { id: string; numeroHistoria: string }) => descargarPdfHistoria(id, numeroHistoria),
    onSuccess: ({ contenido, nombre }) => guardarArchivo(contenido, nombre),
    gcTime: 0,
  });
}

export function useExportarHistorias() {
  return useMutation({
    mutationFn: (filtros: FiltrosHistorias) => exportarHistorias(filtros, diaColombia(new Date())),
    onSuccess: ({ contenido, nombre }) => guardarArchivo(contenido, nombre),
    gcTime: 0,
  });
}

export function useBusquedaPacientes(filtros: FiltrosPacientes) {
  return useQuery({
    queryKey: CLAVES_HISTORIAS.pacientes(filtros),
    queryFn: () => buscarPacientes(filtros),
    placeholderData: keepPreviousData,
  });
}

/** Como el expediente: se libera al salir de la ficha. */
export function useFichaPaciente(id: string) {
  return useQuery({ queryKey: CLAVES_HISTORIAS.ficha(id), queryFn: () => obtenerFichaPaciente(id), gcTime: 0 });
}

export function useIndicadores(desde: string, hasta: string) {
  return useQuery({
    queryKey: CLAVES_HISTORIAS.indicadores(desde, hasta),
    queryFn: () => obtenerIndicadores(desde, hasta),
    placeholderData: keepPreviousData,
  });
}
