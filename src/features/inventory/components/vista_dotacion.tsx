import { Ambulance, CircleAlert, LoaderCircle, PackagePlus, Plus } from 'lucide-react';
import { useState } from 'react';
import { SelectorBuscable } from '../../../components/forms/selector_buscable';
import { claseControlFiltro } from '../../../components/forms/selector_filtro';
import { EstadoError } from '../../../components/states/estado_error';
import { useNotificaciones } from '../../../hooks/use_notificaciones';
import { useFlota } from '../../ambulances/hooks/use_ambulancias';
import { ETIQUETAS_ESTADO_DOTACION } from '../constants/catalogos_inventario';
import { claseBotonPrimario, TONO_ESTADO_DOTACION } from '../constants/estilos_inventario';
import { useDotacion } from '../hooks/use_consultas_inventario';
import { useMutacionInventario } from '../hooks/use_mutacion_inventario';
import { useParametrosUrl } from '../hooks/use_parametros_url';
import type { BorradorMovimiento } from '../schemas/movimiento.schema';
import { habilitarAmbulancia } from '../services/bodegas.service';
import type { Dotacion, ItemDotacion, TotalInsumo } from '../types/inventario.types';
import { formatearCantidad } from '../utils/formato_inventario';
import { Insignia } from './insignia';
import { EsqueletoFilas, EstadoVacio } from './listado_inventario';
import { PanelNuevoMovimiento } from './panel_nuevo_movimiento';
import { TablaInventario, type Columna } from './tabla_inventario';

const cantidadCon = (cantidad: number, unidad: string) => (
  <span className="tabular-nums">
    {formatearCantidad(cantidad)} <span className="text-texto-secundario">{unidad}</span>
  </span>
);

const COLUMNAS_ITEMS: Columna<ItemDotacion>[] = [
  {
    clave: 'insumo',
    encabezado: 'Insumo',
    celda: (item) => (
      <div className="min-w-0">
        <p className="font-medium">{item.insumoNombre}</p>
        <p className="text-[13px] text-texto-secundario">
          {item.insumoCodigo}
          {!item.obligatorio && ' · opcional'}
        </p>
      </div>
    ),
  },
  {
    clave: 'requerido',
    encabezado: 'Requerido',
    celda: (item) => (
      <span className="text-[13px]">
        {cantidadCon(item.cantidadRequerida, item.unidadMedida)}
        <span className="block text-texto-secundario">Mínimo {formatearCantidad(item.cantidadMinima ?? item.cantidadRequerida)}</span>
      </span>
    ),
  },
  {
    clave: 'disponible',
    encabezado: 'Disponible',
    celda: (item) => (
      <span className="text-[13px]">
        {cantidadCon(item.disponible, item.unidadMedida)}
        {item.noUtilizable > 0 && <span className="block text-critico">{formatearCantidad(item.noUtilizable)} no utilizable</span>}
      </span>
    ),
  },
  {
    clave: 'faltante',
    encabezado: 'Faltante',
    celda: (item) => (item.faltante > 0 ? <span className="font-semibold text-critico">{cantidadCon(item.faltante, item.unidadMedida)}</span> : '—'),
  },
  { clave: 'estado', encabezado: 'Estado', celda: (item) => <Insignia tono={TONO_ESTADO_DOTACION[item.estado]}>{ETIQUETAS_ESTADO_DOTACION[item.estado]}</Insignia> },
];

const COLUMNAS_ADICIONALES: Columna<TotalInsumo>[] = [
  { clave: 'insumo', encabezado: 'Insumo', celda: (total) => total.insumoNombre },
  { clave: 'disponible', encabezado: 'Disponible', celda: (total) => cantidadCon(total.disponible, total.unidadMedida) },
];

/** Transferencia que completa la dotación: lo que falta, hacia la ambulancia. */
function propuestaAbastecimiento(dotacion: Dotacion): BorradorMovimiento | null {
  if (!dotacion.ubicacion) return null;
  const lineas = dotacion.items
    .filter((item) => item.faltante > 0)
    .map((item) => ({ insumoId: item.insumoId, cantidad: item.faltante }));
  return lineas.length > 0 ? { tipo: 'transferencia', destinoUbicacionId: dotacion.ubicacion.id, lineas } : null;
}

function DetalleDotacion({ dotacion }: { dotacion: Dotacion }) {
  const { notificar } = useNotificaciones();
  const [abasteciendo, setAbasteciendo] = useState(false);
  const habilitar = useMutacionInventario(() => habilitarAmbulancia(dotacion.ambulanciaId));
  const propuesta = propuestaAbastecimiento(dotacion);
  const faltan = dotacion.items.filter((item) => item.faltante > 0).length;

  if (!dotacion.ubicacion) {
    return (
      <div className="flex flex-col items-center px-6 py-12 text-center">
        <p className="text-base font-semibold text-texto">{dotacion.ambulanciaCodigo} aún no tiene inventario</p>
        <p className="mt-1 max-w-sm text-sm text-texto-secundario">Habilítalo para poder abastecerla desde la bodega.</p>
        <button
          type="button"
          onClick={() =>
            habilitar.mutate(undefined, {
              onSuccess: () => notificar({ tono: 'exito', titulo: 'Inventario habilitado', descripcion: dotacion.ambulanciaCodigo }),
              onError: (error) => notificar({ tono: 'error', titulo: 'No fue posible habilitarlo', descripcion: error.message }),
            })
          }
          disabled={habilitar.isPending}
          className={`mt-5 ${claseBotonPrimario}`}
        >
          {habilitar.isPending ? <LoaderCircle aria-hidden className="size-4 animate-spin" /> : <Plus aria-hidden strokeWidth={1.75} className="size-4" />}
          Habilitar inventario
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-3 border-b border-borde/70 px-5 py-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          {dotacion.perfil ? (
            <p className="flex flex-wrap items-center gap-2 text-sm text-texto">
              <span className="font-semibold">{dotacion.perfil.nombre}</span>
              <span className="text-texto-secundario">
                {dotacion.perfil.codigo} · versión {dotacion.perfil.version}
              </span>
              {dotacion.completa ? (
                <Insignia tono="exito">Dotación completa</Insignia>
              ) : (
                <Insignia tono="critico">
                  {faltan} {faltan === 1 ? 'insumo por completar' : 'insumos por completar'}
                </Insignia>
              )}
            </p>
          ) : (
            <p className="flex items-start gap-2 text-sm text-texto">
              <CircleAlert aria-hidden strokeWidth={1.75} className="mt-0.5 size-4 shrink-0 text-advertencia" />
              El tipo de esta ambulancia no tiene un perfil de dotación vigente: no hay con qué comparar.
            </p>
          )}
        </div>
        {propuesta && (
          <button type="button" onClick={() => setAbasteciendo(true)} className={claseBotonPrimario}>
            <PackagePlus aria-hidden strokeWidth={1.75} className="size-4" />
            Abastecer faltantes
          </button>
        )}
      </div>

      {dotacion.items.length > 0 && (
        <TablaInventario
          filas={dotacion.items}
          columnas={COLUMNAS_ITEMS}
          claveFila={(item) => item.detallePerfilId}
          etiquetaFila={(item) => item.insumoNombre}
          resaltar={(item) => item.estado === 'bajo_minimo'}
        />
      )}

      {dotacion.adicionales.length > 0 && (
        <div className="border-t border-borde/70">
          <p className="px-5 pt-4 pb-1 text-xs font-medium tracking-wide text-texto-secundario uppercase">Fuera del perfil</p>
          <TablaInventario filas={dotacion.adicionales} columnas={COLUMNAS_ADICIONALES} claveFila={(total) => total.insumoId} etiquetaFila={(total) => total.insumoNombre} />
        </div>
      )}

      {dotacion.items.length === 0 && dotacion.adicionales.length === 0 && (
        <EstadoVacio titulo="La ambulancia está vacía" mensaje="Transfiere insumos desde una bodega para dotarla." conFiltros={false} />
      )}

      {abasteciendo && propuesta && (
        <PanelNuevoMovimiento titulo={`Abastecer ${dotacion.ambulanciaCodigo}`} inicial={propuesta} alCerrar={() => setAbasteciendo(false)} />
      )}
    </div>
  );
}

/** Lo que tiene cada ambulancia frente al perfil de dotación de su tipo. */
export function VistaDotacion() {
  const { leer, actualizar } = useParametrosUrl();
  const flota = useFlota();
  const ambulanciaId = leer('ambulanciaId');
  const dotacion = useDotacion(ambulanciaId);
  const ambulancias = [...(flota.data?.datos ?? [])].sort((a, b) => a.codigo.localeCompare(b.codigo, 'es', { numeric: true }));

  return (
    <>
      <div className="flex flex-col gap-2 border-b border-borde/70 px-5 py-4 sm:flex-row sm:items-center">
        <label htmlFor="ambulancia-dotacion" className="inline-flex items-center gap-2 text-sm font-medium text-texto">
          <Ambulance aria-hidden strokeWidth={1.75} className="size-4 text-primario" />
          Ambulancia
        </label>
        <div className="relative sm:w-72">
          <SelectorBuscable
            id="ambulancia-dotacion"
            opciones={ambulancias.map((ambulancia) => ({ valor: ambulancia.id, texto: ambulancia.codigo, detalle: ambulancia.tipo.nombre }))}
            valor={ambulanciaId ?? ''}
            alCambiar={(id) => actualizar({ ambulanciaId: id || undefined })}
            placeholder={flota.isPending ? 'Cargando flota…' : 'Busca por código o tipo'}
            textoSinResultados="Ninguna ambulancia coincide"
            deshabilitado={!flota.isSuccess}
            claseEntrada={`${claseControlFiltro} w-full px-3`}
          />
        </div>
        {dotacion.isFetching && !dotacion.isPending && <LoaderCircle aria-label="Actualizando" className="size-4 animate-spin text-texto-secundario" />}
      </div>
      {!ambulanciaId ? (
        <EstadoVacio titulo="Elige una ambulancia" mensaje="Verás lo que tiene frente a su perfil de dotación y lo que falta transferir." conFiltros={false} />
      ) : dotacion.isPending ? (
        <EsqueletoFilas etiqueta="Cargando dotación" />
      ) : dotacion.isError ? (
        <EstadoError titulo="No fue posible cargar la dotación" mensaje={dotacion.error.message} alReintentar={() => void dotacion.refetch()} />
      ) : (
        <DetalleDotacion key={dotacion.data.ambulanciaId} dotacion={dotacion.data} />
      )}
    </>
  );
}
