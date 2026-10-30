import { ArrowRight, History, LoaderCircle, UserRound } from 'lucide-react';
import { EstadoError } from '../../../components/states/estado_error';
import { formatearFechaHora } from '../../../utils/formato_fecha';
import { useUsuario } from '../../users/hooks/use_usuarios';
import { useHistorialEstados } from '../hooks/use_ambulancias';
import type { CambioEstado } from '../types/ambulancia.types';
import { ESTILOS_ESTADO_OPERATIVO } from '../constants/estilos_estado_operativo';
import { InsigniaEstadoOperativo } from './insignia_estado_operativo';

interface PropiedadesHistorialEstados {
  ambulanciaId: string;
  /** Solo el administrador puede consultar quién hizo cada cambio. */
  mostrarAutores: boolean;
}

function AutorCambio({ usuarioId }: { usuarioId: string }) {
  const usuario = useUsuario(usuarioId);
  if (!usuario.isSuccess) return null;
  return (
    <span className="inline-flex items-center gap-1.5">
      <UserRound aria-hidden strokeWidth={1.75} className="size-3.5" />
      {usuario.data.nombres} {usuario.data.apellidos}
    </span>
  );
}

function EntradaHistorial({ cambio, mostrarAutor }: { cambio: CambioEstado; mostrarAutor: boolean }) {
  const { icono: Icono, clases } = ESTILOS_ESTADO_OPERATIVO[cambio.estadoNuevo];
  return (
    <li className="group relative flex gap-4 pb-6 last:pb-0">
      <span
        aria-hidden
        className="absolute top-9 bottom-0 left-[17px] w-px bg-borde group-last:hidden"
      />
      <span
        aria-hidden
        className={`relative flex size-9 shrink-0 items-center justify-center rounded-full ring-4 ring-white/80 ${clases}`}
      >
        <Icono strokeWidth={1.75} className="size-4" />
      </span>
      <div className="min-w-0 flex-1 pt-1.5">
        <div className="flex flex-wrap items-center gap-2">
          {cambio.estadoAnterior && (
            <>
              <InsigniaEstadoOperativo estado={cambio.estadoAnterior} />
              <ArrowRight aria-label="pasó a" strokeWidth={1.75} className="size-3.5 text-texto-secundario" />
            </>
          )}
          <InsigniaEstadoOperativo estado={cambio.estadoNuevo} />
        </div>
        {cambio.motivo && <p className="mt-2 text-sm break-words text-texto">{cambio.motivo}</p>}
        <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-texto-secundario">
          <time dateTime={cambio.cambiadoEn}>{formatearFechaHora(cambio.cambiadoEn)}</time>
          {mostrarAutor && cambio.usuarioId && <AutorCambio usuarioId={cambio.usuarioId} />}
        </p>
      </div>
    </li>
  );
}

export function HistorialEstados({ ambulanciaId, mostrarAutores }: PropiedadesHistorialEstados) {
  const historial = useHistorialEstados(ambulanciaId);

  if (historial.isPending) {
    return (
      <div role="status" aria-label="Cargando historial" className="space-y-6 px-5 py-5">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="flex animate-pulse gap-4">
            <span className="size-9 shrink-0 rounded-full bg-texto-secundario/10" />
            <div className="flex-1 space-y-2 pt-1.5">
              <span className="block h-5 w-48 max-w-full rounded-full bg-texto-secundario/10" />
              <span className="block h-2.5 w-64 max-w-full rounded-full bg-texto-secundario/8" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (historial.isError) {
    return (
      <EstadoError
        titulo="No fue posible cargar el historial"
        mensaje={historial.error.message}
        alReintentar={() => void historial.refetch()}
      />
    );
  }

  const cambios = historial.data.pages.flatMap((pagina) => pagina.datos);

  if (cambios.length === 0) {
    return (
      <div className="flex flex-col items-center px-6 py-12 text-center">
        <span className="mb-3 flex size-11 items-center justify-center rounded-2xl bg-primario/8 text-primario">
          <History aria-hidden strokeWidth={1.75} className="size-5" />
        </span>
        <p className="text-sm font-semibold text-texto">Sin cambios de estado</p>
        <p className="mt-1 max-w-xs text-[13px] text-texto-secundario">
          Aquí aparecerá cada cambio con su fecha y motivo.
        </p>
      </div>
    );
  }

  return (
    <div className="px-5 py-5">
      <ol aria-label="Cambios de estado, del más reciente al más antiguo">
        {cambios.map((cambio) => (
          <EntradaHistorial key={cambio.id} cambio={cambio} mostrarAutor={mostrarAutores} />
        ))}
      </ol>
      {historial.hasNextPage && (
        <button
          type="button"
          onClick={() => void historial.fetchNextPage()}
          disabled={historial.isFetchingNextPage}
          className="campo-vidrio mt-6 inline-flex h-9 w-full items-center justify-center gap-2 rounded-xl text-sm font-medium text-texto transition-colors duration-150 hover:bg-white disabled:opacity-60"
        >
          {historial.isFetchingNextPage && <LoaderCircle aria-hidden className="size-4 animate-spin" />}
          {historial.isFetchingNextPage ? 'Cargando…' : 'Ver cambios anteriores'}
        </button>
      )}
    </div>
  );
}
