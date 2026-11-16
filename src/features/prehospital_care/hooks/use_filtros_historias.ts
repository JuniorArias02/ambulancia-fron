import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { MODALIDADES_SERVICIO } from '../../../constants/modalidades_servicio';
import {
  CAMPOS_FECHA,
  DESENLACES,
  ESTADOS_FILTRO,
  LIMITE_POR_DEFECTO,
  LIMITES_PAGINA,
  ORDENES,
  REGIMENES,
  TIPOS_EVENTO,
  TRIAGES,
} from '../constants/catalogos_clinicos';
import { useTextosBusqueda, type TextosBusqueda } from '../providers/contexto_busqueda';
import type { FiltrosHistorias } from '../types/historia_clinica.types';
import { PATRON_DIA, rangoDeAtajo } from '../utils/rangos_fecha';

/** Filtros que no identifican a un paciente: viven en la URL para compartir y volver a la vista. */
export type ClaveUrl =
  | 'desde'
  | 'hasta'
  | 'campoFecha'
  | 'estado'
  | 'triage'
  | 'desenlace'
  | 'tipoEvento'
  | 'modalidad'
  | 'ambulanciaId'
  | 'institucionDestinoId'
  | 'profesionalId'
  | 'regimen'
  | 'riesgoCaidaAlto'
  | 'firmada'
  | 'soloNn'
  | 'orden'
  | 'pagina'
  | 'limite';

export type CambiosUrl = Partial<Record<ClaveUrl, string | number | boolean | undefined>>;

const CLAVES_TEXTO = ['ingreso', 'numeroHistoria', 'documento', 'nombre', 'eps'] as const satisfies readonly (keyof TextosBusqueda)[];

const PATRON_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function deLista<T extends string>(valor: string | null, lista: readonly T[]): T | undefined {
  return lista.find((opcion) => opcion === valor);
}

const booleano = (valor: string | null) => (valor === 'true' ? true : valor === 'false' ? false : undefined);
const uuid = (valor: string | null) => (valor && PATRON_UUID.test(valor) ? valor : undefined);
const dia = (valor: string | null) => (valor && PATRON_DIA.test(valor) ? valor : undefined);

function entero(valor: string | null, permitidos?: readonly number[]): number | undefined {
  const numero = Number(valor);
  if (!Number.isInteger(numero) || numero < 1) return undefined;
  return permitidos && !permitidos.includes(numero) ? undefined : numero;
}

/**
 * Filtros de la bandeja. Al entrar sin fechas se buscan los últimos 7 días: nunca "todo".
 * Los valores de la URL se validan; uno desconocido se ignora (el backend respondería 400).
 */
export function useFiltrosHistorias() {
  const [parametros, setParametros] = useSearchParams();
  const { textos, setTextos } = useTextosBusqueda();
  const [rangoInicial] = useState(() => rangoDeAtajo('ultimos_7'));

  const filtros = useMemo<FiltrosHistorias>(() => {
    const desde = dia(parametros.get('desde'));
    const hasta = dia(parametros.get('hasta'));
    const sinFechas = !desde && !hasta;
    return {
      desde: sinFechas ? rangoInicial.desde : desde,
      hasta: sinFechas ? rangoInicial.hasta : hasta,
      campoFecha: deLista(parametros.get('campoFecha'), CAMPOS_FECHA.map(({ valor }) => valor)) ?? 'atencion',
      estado: deLista(parametros.get('estado'), ESTADOS_FILTRO.map(({ valor }) => valor)) ?? 'vigentes',
      triage: deLista(parametros.get('triage'), TRIAGES),
      desenlace: deLista(parametros.get('desenlace'), DESENLACES),
      tipoEvento: deLista(parametros.get('tipoEvento'), TIPOS_EVENTO),
      modalidad: deLista(parametros.get('modalidad'), MODALIDADES_SERVICIO),
      regimen: deLista(parametros.get('regimen'), REGIMENES),
      ambulanciaId: uuid(parametros.get('ambulanciaId')),
      institucionDestinoId: uuid(parametros.get('institucionDestinoId')),
      profesionalId: uuid(parametros.get('profesionalId')),
      riesgoCaidaAlto: booleano(parametros.get('riesgoCaidaAlto')),
      firmada: booleano(parametros.get('firmada')),
      soloNn: parametros.get('soloNn') === 'true' ? true : undefined,
      orden: deLista(parametros.get('orden'), ORDENES) ?? 'fecha_desc',
      pagina: entero(parametros.get('pagina')) ?? 1,
      limite: entero(parametros.get('limite'), LIMITES_PAGINA) ?? LIMITE_POR_DEFECTO,
      ...textos,
    };
  }, [parametros, textos, rangoInicial]);

  /** Cualquier cambio que no sea de página vuelve a la primera. */
  const actualizar = useCallback(
    (cambios: CambiosUrl) => {
      setParametros(
        (actuales) => {
          const siguientes = new URLSearchParams(actuales);
          for (const [clave, valor] of Object.entries(cambios)) {
            if (valor === undefined || valor === '') siguientes.delete(clave);
            else siguientes.set(clave, String(valor));
          }
          if (!('pagina' in cambios)) siguientes.delete('pagina');
          return siguientes;
        },
        { replace: true },
      );
    },
    [setParametros],
  );

  const aplicarTextos = useCallback(
    (nuevos: TextosBusqueda) => {
      const limpios: TextosBusqueda = {};
      for (const clave of CLAVES_TEXTO) {
        const texto = nuevos[clave]?.trim();
        if (texto) limpios[clave] = texto;
      }
      setTextos(limpios);
      actualizar({ pagina: undefined });
    },
    [setTextos, actualizar],
  );

  /** Vuelve a la vista de entrada: últimos 7 días, vigentes, sin más filtros. */
  const limpiar = useCallback(() => {
    setTextos({});
    setParametros(new URLSearchParams(), { replace: true });
  }, [setTextos, setParametros]);

  return { filtros, textos, actualizar, aplicarTextos, limpiar };
}
