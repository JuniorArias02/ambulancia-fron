import { ETIQUETAS_MODALIDAD } from '../../../constants/modalidades_servicio';
import {
  ETIQUETAS_DESENLACE,
  ETIQUETAS_REGIMEN,
  ETIQUETAS_TIPO_EVENTO,
  TRIAGE,
} from '../constants/catalogos_clinicos';
import type { CambiosUrl } from '../hooks/use_filtros_historias';
import type { TextosBusqueda } from '../providers/contexto_busqueda';
import type { FiltrosHistorias } from '../types/historia_clinica.types';

export interface Chip {
  clave: string;
  texto: string;
  quitar: () => void;
}

interface Acciones {
  actualizar: (cambios: CambiosUrl) => void;
  aplicarTextos: (textos: TextosBusqueda) => void;
}

/** Nombres de los recursos elegidos (ambulancia, destino, profesional) para el texto del chip. */
type Nombres = Record<'ambulancia' | 'institucion' | 'profesional', (id: string) => string | undefined>;

const ETIQUETAS_TEXTO: Record<keyof TextosBusqueda, string> = {
  ingreso: 'Ingreso',
  numeroHistoria: 'N.º historia',
  documento: 'Documento',
  nombre: 'Nombre',
  eps: 'EPS',
};

const CLAVES_TEXTO = ['ingreso', 'numeroHistoria', 'documento', 'nombre', 'eps'] as const;

/** Un chip por filtro aplicado (el rango y el estado se ven en sus propios controles). */
export function construirChips(
  filtros: FiltrosHistorias,
  textos: TextosBusqueda,
  nombres: Nombres,
  { actualizar, aplicarTextos }: Acciones,
): Chip[] {
  const chips: Chip[] = [];

  for (const clave of CLAVES_TEXTO) {
    const valor = textos[clave];
    if (!valor) continue;
    chips.push({
      clave,
      texto: `${ETIQUETAS_TEXTO[clave]}: ${valor}`,
      quitar: () => aplicarTextos({ ...textos, [clave]: undefined }),
    });
  }

  const agregar = (clave: keyof CambiosUrl, texto: string) =>
    chips.push({ clave, texto, quitar: () => actualizar({ [clave]: undefined }) });

  if (filtros.triage) agregar('triage', `Triage: ${TRIAGE[filtros.triage].corta}`);
  if (filtros.desenlace) agregar('desenlace', `Desenlace: ${ETIQUETAS_DESENLACE[filtros.desenlace]}`);
  if (filtros.tipoEvento) agregar('tipoEvento', `Evento: ${ETIQUETAS_TIPO_EVENTO[filtros.tipoEvento]}`);
  if (filtros.modalidad) agregar('modalidad', `Servicio: ${ETIQUETAS_MODALIDAD[filtros.modalidad]}`);
  if (filtros.ambulanciaId) {
    agregar('ambulanciaId', `Ambulancia: ${nombres.ambulancia(filtros.ambulanciaId) ?? 'elegida'}`);
  }
  if (filtros.institucionDestinoId) {
    agregar('institucionDestinoId', `Destino: ${nombres.institucion(filtros.institucionDestinoId) ?? 'elegido'}`);
  }
  if (filtros.profesionalId) {
    agregar('profesionalId', `Profesional: ${nombres.profesional(filtros.profesionalId) ?? 'elegido'}`);
  }
  if (filtros.regimen) agregar('regimen', `Régimen: ${ETIQUETAS_REGIMEN[filtros.regimen]}`);
  if (filtros.firmada !== undefined) agregar('firmada', filtros.firmada ? 'Con firma' : 'Sin firma');
  if (filtros.riesgoCaidaAlto !== undefined) {
    agregar('riesgoCaidaAlto', filtros.riesgoCaidaAlto ? 'Con riesgo de caída alto' : 'Sin riesgo de caída alto');
  }
  if (filtros.soloNn) agregar('soloNn', 'Solo NN');
  return chips;
}
