import { ClipboardCheck, Inbox, LoaderCircle, SearchX } from 'lucide-react';
import { useState } from 'react';
import { Paginacion } from '../../../components/data/paginacion';
import { EstadoError } from '../../../components/states/estado_error';
import { useSesion } from '../../authentication/hooks/use_sesion';
import { BarraFiltrosChequeos } from '../components/barra_filtros_chequeos';
import { PanelChequeo } from '../components/panel_chequeo';
import { TablaChequeos } from '../components/tabla_chequeos';
import { useChequeos } from '../hooks/use_chequeos_diarios';
import { useFiltrosChequeos } from '../hooks/use_filtros_chequeos';
import type { ChequeoDiario } from '../types/chequeo_diario.types';

function Esqueleto() {
  return (
    <div role="status" aria-label="Cargando chequeos" className="divide-y divide-borde/60">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="flex animate-pulse items-center gap-4 px-5 py-4">
          <span className="h-3 w-28 rounded-full bg-texto-secundario/12" />
          <span className="h-3 w-20 rounded-full bg-texto-secundario/10" />
          <span className="hidden h-3 w-36 rounded-full bg-texto-secundario/8 md:block" />
          <span className="ml-auto h-6 w-24 rounded-full bg-texto-secundario/8" />
        </div>
      ))}
    </div>
  );
}

export function PaginaChequeosDiarios() {
  const { usuario } = useSesion();
  const esAdministrador = usuario?.rol === 'administrador';
  const { filtros, actualizarFiltros, hayFiltrosActivos } = useFiltrosChequeos();
  const chequeos = useChequeos(filtros);
  const [abierto, setAbierto] = useState<ChequeoDiario | null>(null);

  const resultado = chequeos.data;
  const actualizando = chequeos.isFetching && !chequeos.isPending;

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <section aria-labelledby="titulo-chequeos" className="vidrio rounded-2xl">
        <header className="flex flex-col gap-4 border-b border-borde/70 px-5 pt-5 pb-4">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primario/8 text-primario">
              <ClipboardCheck aria-hidden strokeWidth={1.75} className="size-5" />
            </span>
            <div>
              <h2 id="titulo-chequeos" className="text-xl font-semibold tracking-tight text-texto">
                Chequeos diarios
              </h2>
              <p className="mt-0.5 flex items-center gap-2 text-sm text-texto-secundario">
                {resultado
                  ? `${resultado.total} ${resultado.total === 1 ? 'chequeo' : 'chequeos'} · lo que revisó cada conductor en su ambulancia`
                  : 'Lo que revisó cada conductor en su ambulancia, día por día.'}
                {actualizando && <LoaderCircle aria-label="Actualizando" className="size-3.5 animate-spin" />}
              </p>
            </div>
          </div>
          <BarraFiltrosChequeos
            filtros={filtros}
            hayFiltrosActivos={hayFiltrosActivos}
            puedeFiltrarConductor={esAdministrador}
            alCambiar={actualizarFiltros}
          />
        </header>

        {chequeos.isPending ? (
          <Esqueleto />
        ) : chequeos.isError ? (
          <EstadoError
            titulo="No fue posible cargar los chequeos"
            mensaje={chequeos.error.message}
            alReintentar={() => void chequeos.refetch()}
          />
        ) : chequeos.data.datos.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <span className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-primario/8 text-primario">
              {hayFiltrosActivos ? (
                <SearchX aria-hidden strokeWidth={1.75} className="size-[22px]" />
              ) : (
                <Inbox aria-hidden strokeWidth={1.75} className="size-[22px]" />
              )}
            </span>
            <p className="text-base font-semibold text-texto">{hayFiltrosActivos ? 'Sin resultados' : 'Aún no hay chequeos'}</p>
            <p className="mt-1 max-w-sm text-sm text-texto-secundario">
              {hayFiltrosActivos
                ? 'Ningún chequeo coincide con los filtros.'
                : 'Los conductores hacen el chequeo diario desde la app con la lista activa.'}
            </p>
          </div>
        ) : (
          <>
            <div className={actualizando ? 'opacity-70 transition-opacity' : 'transition-opacity'}>
              <TablaChequeos chequeos={chequeos.data.datos} alAbrir={setAbierto} />
            </div>
            <div className="border-t border-borde/70 px-5 py-4">
              <Paginacion
                pagina={chequeos.data.pagina}
                limite={chequeos.data.limite}
                total={chequeos.data.total}
                deshabilitada={chequeos.isFetching}
                alCambiarPagina={(pagina) => actualizarFiltros({ pagina })}
              />
            </div>
          </>
        )}
      </section>

      {abierto && <PanelChequeo resumen={abierto} conocerEscala={esAdministrador} alCerrar={() => setAbierto(null)} />}
    </div>
  );
}
