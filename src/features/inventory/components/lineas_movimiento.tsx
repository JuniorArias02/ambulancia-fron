import { X } from 'lucide-react';
import { SelectorBuscable } from '../../../components/forms/selector_buscable';
import type { OpcionBuscable } from '../../../utils/opciones_buscables';
import type { UseFormRegisterReturn } from 'react-hook-form';
import { claseBotonIcono, claseEntradaCompacta } from '../constants/estilos_inventario';
import { LIMITE_MAXIMO } from '../constants/catalogos_inventario';
import { useEquipos, useLotes } from '../hooks/use_consultas_inventario';
import type { Existencia, Insumo } from '../types/inventario.types';
import { formatearCantidad, formatearDia } from '../utils/formato_inventario';
import { opcionesInsumos } from '../utils/opciones_inventario';

export interface ValorLinea {
  insumoId: string;
  loteId: string;
  equipoId: string;
}

export interface ErroresLinea {
  insumoId?: string;
  loteId?: string;
  equipoId?: string;
  cantidad?: string;
}

interface PropiedadesComunes {
  indice: number;
  valor: ValorLinea;
  errores?: ErroresLinea;
  registroCantidad: UseFormRegisterReturn;
  deshabilitada: boolean;
  puedeQuitar: boolean;
  alCambiar: (valor: ValorLinea) => void;
  alQuitar: () => void;
}

function ErrorLinea({ mensaje }: { mensaje?: string }) {
  return mensaje ? <p className="mt-1 text-[13px] text-critico">{mensaje}</p> : null;
}

/** Insumo arriba; lote o serie, vencimiento y lo disponible debajo. Se busca en ambos. */
function opcionExistencia(existencia: Existencia, bloquearNoUtilizables: boolean): OpcionBuscable {
  const partes: string[] = [];
  if (existencia.numeroLote) {
    partes.push(`Lote ${existencia.numeroLote}${existencia.loteVencimiento ? ` · vence ${formatearDia(existencia.loteVencimiento)}` : ''}`);
  }
  if (existencia.numeroSerie) partes.push(`Serie ${existencia.numeroSerie}`);
  partes.push(`Disponible: ${formatearCantidad(existencia.cantidad)} ${existencia.unidadMedida}`);
  if (!existencia.utilizable) partes.push('no utilizable');
  return {
    valor: existencia.id,
    texto: existencia.insumoNombre,
    detalle: partes.join(' · '),
    deshabilitada: bloquearNoUtilizables && !existencia.utilizable,
  };
}

function Cantidad({ indice, registro, error, unidad, deshabilitada }: { indice: number; registro: UseFormRegisterReturn; error?: string; unidad?: string; deshabilitada: boolean }) {
  return (
    <div className="w-full sm:w-36">
      <div className="relative">
        <input
          aria-label={`Cantidad de la línea ${indice + 1}`}
          inputMode="decimal"
          disabled={deshabilitada}
          aria-invalid={error ? true : undefined}
          className={`${claseEntradaCompacta} pr-16 tabular-nums ${error ? 'border-critico/60!' : ''}`}
          {...registro}
        />
        {unidad && (
          <span className="pointer-events-none absolute top-1/2 right-3 max-w-14 -translate-y-1/2 truncate text-xs text-texto-secundario">
            {unidad}
          </span>
        )}
      </div>
      <ErrorLinea mensaje={error} />
    </div>
  );
}

function Quitar({ indice, puedeQuitar, deshabilitada, alQuitar }: { indice: number; puedeQuitar: boolean; deshabilitada: boolean; alQuitar: () => void }) {
  return (
    <button
      type="button"
      onClick={alQuitar}
      disabled={!puedeQuitar || deshabilitada}
      aria-label={`Quitar la línea ${indice + 1}`}
      title="Quitar"
      className={`mt-1 ${claseBotonIcono}`}
    >
      <X aria-hidden strokeWidth={1.75} className="size-4" />
    </button>
  );
}

interface PropiedadesLineaDesdeOrigen extends PropiedadesComunes {
  existencias: readonly Existencia[] | undefined;
  cargando: boolean;
  nombreInsumo?: string;
  /** Lotes vencidos y equipos no operativos no pueden ir a una ambulancia ni consumirse. */
  bloquearNoUtilizables: boolean;
}

/** Línea de un movimiento con origen: se elige entre lo que existe en el origen. */
export function LineaDesdeOrigen({
  indice,
  valor,
  errores,
  registroCantidad,
  deshabilitada,
  puedeQuitar,
  alCambiar,
  alQuitar,
  existencias,
  cargando,
  nombreInsumo,
  bloquearNoUtilizables,
}: PropiedadesLineaDesdeOrigen) {
  const todas = existencias ?? [];
  const elegida = todas.find(
    (existencia) =>
      existencia.insumoId === valor.insumoId &&
      (existencia.loteId ?? '') === valor.loteId &&
      (existencia.equipoId ?? '') === valor.equipoId,
  );
  // Una línea propuesta (p. ej. lo que falta en una ambulancia) muestra solo ese insumo.
  const opciones = valor.insumoId && !elegida ? todas.filter((existencia) => existencia.insumoId === valor.insumoId) : todas;
  const error = errores?.insumoId ?? errores?.loteId ?? errores?.equipoId;
  const sinExistencias = !cargando && opciones.length === 0;

  return (
    <li className="flex flex-col gap-2 rounded-2xl border border-borde/80 bg-white/50 p-3 sm:flex-row sm:items-start">
      <div className="min-w-0 flex-1">
        <div className="relative">
          <SelectorBuscable
            etiqueta={`Qué sale en la línea ${indice + 1}`}
            opciones={opciones.map((existencia) => opcionExistencia(existencia, bloquearNoUtilizables))}
            valor={elegida?.id ?? ''}
            alCambiar={(existenciaId) => {
              const existencia = todas.find((opcion) => opcion.id === existenciaId);
              if (existencia) alCambiar({ insumoId: existencia.insumoId, loteId: existencia.loteId ?? '', equipoId: existencia.equipoId ?? '' });
            }}
            placeholder={
              cargando ? 'Cargando existencias…' : nombreInsumo ? `Busca el lote o la unidad de ${nombreInsumo}` : 'Busca insumo, lote o serie'
            }
            textoSinResultados="Nada coincide en el origen"
            deshabilitado={deshabilitada || cargando}
            invalido={Boolean(error)}
            claseEntrada={`${claseEntradaCompacta} ${error ? 'border-critico/60!' : ''}`}
          />
        </div>
        <ErrorLinea mensaje={sinExistencias ? `No hay existencias${nombreInsumo ? ` de ${nombreInsumo}` : ''} en el origen.` : error} />
      </div>
      <div className="flex items-start gap-2">
        <Cantidad indice={indice} registro={registroCantidad} error={errores?.cantidad} unidad={elegida?.unidadMedida} deshabilitada={deshabilitada} />
        <Quitar indice={indice} puedeQuitar={puedeQuitar} deshabilitada={deshabilitada} alQuitar={alQuitar} />
      </div>
    </li>
  );
}

interface PropiedadesLineaSinOrigen extends PropiedadesComunes {
  insumos: readonly Insumo[] | undefined;
  /** Hacia una ambulancia solo van equipos operativos. */
  soloEquiposOperativos: boolean;
}

/** Línea de un movimiento sin origen (entrada o ajuste que aumenta): insumo, y su lote o equipo. */
export function LineaSinOrigen({
  indice,
  valor,
  errores,
  registroCantidad,
  deshabilitada,
  puedeQuitar,
  alCambiar,
  alQuitar,
  insumos,
  soloEquiposOperativos,
}: PropiedadesLineaSinOrigen) {
  const insumo = insumos?.find((opcion) => opcion.id === valor.insumoId);
  const control = insumo?.control;
  const lotes = useLotes({ insumoId: valor.insumoId, pagina: 1, limite: LIMITE_MAXIMO }, control === 'lote');
  const equipos = useEquipos(
    { insumoId: valor.insumoId, estado: soloEquiposOperativos ? 'operativo' : undefined, pagina: 1, limite: LIMITE_MAXIMO },
    control === 'serie',
  );

  return (
    <li className="flex flex-col gap-2 rounded-2xl border border-borde/80 bg-white/50 p-3 lg:flex-row lg:items-start">
      <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-2">
        <div className="relative min-w-0">
          <SelectorBuscable
            etiqueta={`Insumo de la línea ${indice + 1}`}
            opciones={opcionesInsumos(insumos ?? [])}
            valor={valor.insumoId}
            alCambiar={(insumoId) => alCambiar({ insumoId, loteId: '', equipoId: '' })}
            placeholder={insumos ? 'Busca el insumo' : 'Cargando insumos…'}
            textoSinResultados="Ningún insumo coincide"
            deshabilitado={deshabilitada || !insumos}
            invalido={Boolean(errores?.insumoId)}
            claseEntrada={`${claseEntradaCompacta} ${errores?.insumoId ? 'border-critico/60!' : ''}`}
          />
          <ErrorLinea mensaje={errores?.insumoId} />
        </div>
        {control === 'lote' && (
          <div className="relative min-w-0">
            <SelectorBuscable
              etiqueta={`Lote de la línea ${indice + 1}`}
              opciones={(lotes.data?.datos ?? []).map((lote) => ({
                valor: lote.id,
                texto: `Lote ${lote.numeroLote}`,
                detalle: `${lote.fechaVencimiento ? `Vence ${formatearDia(lote.fechaVencimiento)}` : 'Sin vencimiento'}${lote.vencido ? ' · vencido' : ''}`,
              }))}
              valor={valor.loteId}
              alCambiar={(loteId) => alCambiar({ ...valor, loteId })}
              placeholder={lotes.isPending ? 'Cargando lotes…' : (lotes.data?.datos.length ?? 0) === 0 ? 'Sin lotes: créalo en el catálogo' : 'Busca el lote'}
              textoSinResultados="Ningún lote coincide"
              deshabilitado={deshabilitada || lotes.isPending}
              invalido={Boolean(errores?.loteId)}
              claseEntrada={`${claseEntradaCompacta} ${errores?.loteId ? 'border-critico/60!' : ''}`}
            />
            <ErrorLinea mensaje={errores?.loteId} />
          </div>
        )}
        {control === 'serie' && (
          <div className="relative min-w-0">
            <SelectorBuscable
              etiqueta={`Equipo de la línea ${indice + 1}`}
              opciones={(equipos.data?.datos ?? []).map((equipo) => ({
                valor: equipo.id,
                texto: `Serie ${equipo.numeroSerie}`,
                detalle: [equipo.marca, equipo.modelo].filter(Boolean).join(' ') || undefined,
              }))}
              valor={valor.equipoId}
              alCambiar={(equipoId) => alCambiar({ ...valor, equipoId })}
              placeholder={equipos.isPending ? 'Cargando equipos…' : 'Busca por serie, marca o modelo'}
              textoSinResultados="Ningún equipo coincide"
              deshabilitado={deshabilitada || equipos.isPending}
              invalido={Boolean(errores?.equipoId)}
              claseEntrada={`${claseEntradaCompacta} ${errores?.equipoId ? 'border-critico/60!' : ''}`}
            />
            <ErrorLinea mensaje={errores?.equipoId} />
          </div>
        )}
      </div>
      <div className="flex items-start gap-2">
        <Cantidad indice={indice} registro={registroCantidad} error={errores?.cantidad} unidad={insumo?.unidadMedida} deshabilitada={deshabilitada} />
        <Quitar indice={indice} puedeQuitar={puedeQuitar} deshabilitada={deshabilitada} alQuitar={alQuitar} />
      </div>
    </li>
  );
}
