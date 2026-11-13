import type { UseQueryResult } from '@tanstack/react-query';
import { Inbox, SearchX } from 'lucide-react';
import { Paginacion } from '../../../components/data/paginacion';
import { EstadoError } from '../../../components/states/estado_error';
import type { AccionMenu } from '../../../components/ui/menu_acciones';
import type { ErrorApi } from '../../../services/error_api';
import type { ResultadoPaginado } from '../../../types/paginacion.types';
import { TablaInventario, type Columna } from './tabla_inventario';

interface PropiedadesListadoInventario<T> {
  consulta: UseQueryResult<ResultadoPaginado<T>, ErrorApi>;
  columnas: readonly Columna<T>[];
  claveFila: (fila: T) => string;
  etiquetaFila: (fila: T) => string;
  alSeleccionar?: (fila: T) => void;
  acciones?: (fila: T) => AccionMenu[];
  resaltar?: (fila: T) => boolean;
  tituloError: string;
  vacio: { titulo: string; mensaje: string };
  conFiltros: boolean;
  alCambiarPagina: (pagina: number) => void;
}

export function EsqueletoFilas({ etiqueta, filas = 5 }: { etiqueta: string; filas?: number }) {
  return (
    <div role="status" aria-label={etiqueta} className="divide-y divide-borde/60">
      {Array.from({ length: filas }, (_, i) => (
        <div key={i} className="flex animate-pulse items-center gap-4 px-5 py-4">
          <div className="flex-1 space-y-2">
            <span className="block h-3 w-48 max-w-full rounded-full bg-texto-secundario/12" />
            <span className="block h-2.5 w-32 max-w-full rounded-full bg-texto-secundario/8" />
          </div>
          <span className="hidden h-3 w-24 rounded-full bg-texto-secundario/8 md:block" />
          <span className="hidden h-6 w-20 rounded-full bg-texto-secundario/8 md:block" />
        </div>
      ))}
    </div>
  );
}

export function EstadoVacio({ titulo, mensaje, conFiltros }: { titulo: string; mensaje: string; conFiltros: boolean }) {
  const Icono = conFiltros ? SearchX : Inbox;
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <span className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-primario/8 text-primario">
        <Icono aria-hidden strokeWidth={1.75} className="size-[22px]" />
      </span>
      <p className="text-base font-semibold text-texto">{conFiltros ? 'Sin resultados' : titulo}</p>
      <p className="mt-1 max-w-sm text-sm text-texto-secundario">
        {conFiltros ? 'Nada coincide con los filtros aplicados.' : mensaje}
      </p>
    </div>
  );
}

/** Cuerpo de un listado paginado: carga, error, vacío, tabla y paginación. */
export function ListadoInventario<T>({
  consulta,
  tituloError,
  vacio,
  conFiltros,
  alCambiarPagina,
  ...tabla
}: PropiedadesListadoInventario<T>) {
  if (consulta.isPending) return <EsqueletoFilas etiqueta="Cargando" />;
  if (consulta.isError) {
    return (
      <EstadoError titulo={tituloError} mensaje={consulta.error.message} alReintentar={() => void consulta.refetch()} />
    );
  }
  const { datos, pagina, limite, total } = consulta.data;
  if (datos.length === 0) return <EstadoVacio {...vacio} conFiltros={conFiltros} />;

  const actualizando = consulta.isFetching;
  return (
    <>
      <div className={actualizando ? 'opacity-70 transition-opacity' : 'transition-opacity'}>
        <TablaInventario filas={datos} {...tabla} />
      </div>
      <div className="border-t border-borde/70 px-5 py-4">
        <Paginacion pagina={pagina} limite={limite} total={total} deshabilitada={actualizando} alCambiarPagina={alCambiarPagina} />
      </div>
    </>
  );
}
