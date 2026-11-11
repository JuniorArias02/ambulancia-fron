import { Inbox, LoaderCircle, SearchX } from 'lucide-react';
import { Paginacion } from '../../../components/data/paginacion';
import { EstadoError } from '../../../components/states/estado_error';
import { BarraFiltrosVerificaciones } from '../components/barra_filtros_verificaciones';
import { EsqueletoVerificaciones } from '../components/esqueleto_verificaciones';
import { TablaVerificaciones } from '../components/tabla_verificaciones';
import { ETIQUETAS_FILTRO_ESTADO } from '../constants/verificaciones';
import { useFiltrosVerificaciones, type PestanaVerificacion } from '../hooks/use_filtros_verificaciones';
import { useVerificaciones } from '../hooks/use_verificaciones';

function textoVacio(pestana: PestanaVerificacion): { titulo: string; mensaje: string } {
  if (pestana === 'pendiente') {
    return { titulo: 'No hay solicitudes pendientes', mensaje: 'Las nuevas solicitudes de la app aparecerán aquí.' };
  }
  if (pestana === 'todas') {
    return { titulo: 'Aún no hay solicitudes', mensaje: 'Los ciudadanos las envían al registrarse en la app.' };
  }
  return {
    titulo: 'Sin solicitudes',
    mensaje: `No hay solicitudes en «${ETIQUETAS_FILTRO_ESTADO[pestana]}».`,
  };
}

function EstadoVacio({ pestana, conBusqueda }: { pestana: PestanaVerificacion; conBusqueda: boolean }) {
  const Icono = conBusqueda ? SearchX : Inbox;
  const { titulo, mensaje } = conBusqueda
    ? { titulo: 'Sin resultados', mensaje: 'Ninguna solicitud coincide con la búsqueda.' }
    : textoVacio(pestana);
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <span className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-primario/8 text-primario">
        <Icono aria-hidden strokeWidth={1.75} className="size-[22px]" />
      </span>
      <p className="text-base font-semibold text-texto">{titulo}</p>
      <p className="mt-1 max-w-sm text-sm text-texto-secundario">{mensaje}</p>
    </div>
  );
}

export function PaginaVerificaciones() {
  const { filtros, pestana, busqueda, cambiarPestana, cambiarPagina, buscar } = useFiltrosVerificaciones();
  const verificaciones = useVerificaciones(filtros);

  const resultado = verificaciones.data;
  const actualizando = verificaciones.isFetching && !verificaciones.isPending;

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <section aria-labelledby="titulo-verificaciones" className="vidrio rounded-2xl">
        <header className="flex flex-col gap-4 border-b border-borde/70 px-5 pt-5 pb-4">
          <div>
            <h2 id="titulo-verificaciones" className="text-xl font-semibold tracking-tight text-texto">
              Verificación de ciudadanos
            </h2>
            <p className="mt-0.5 flex items-center gap-2 text-sm text-texto-secundario">
              {resultado
                ? `${resultado.total} ${resultado.total === 1 ? 'solicitud' : 'solicitudes'} · primero las que más llevan esperando`
                : 'Revisa la identidad de quienes se registran en la app antes de que puedan reportar emergencias.'}
              {actualizando && (
                <span className="inline-flex items-center gap-1.5 text-[13px]">
                  <LoaderCircle aria-hidden className="size-3.5 animate-spin" />
                  Actualizando…
                </span>
              )}
            </p>
          </div>

          <BarraFiltrosVerificaciones
            pestana={pestana}
            busqueda={busqueda}
            alCambiarPestana={cambiarPestana}
            alBuscar={buscar}
          />
        </header>

        {verificaciones.isPending ? (
          <EsqueletoVerificaciones />
        ) : verificaciones.isError ? (
          <EstadoError
            titulo="No fue posible cargar las solicitudes"
            mensaje={verificaciones.error.message}
            alReintentar={() => void verificaciones.refetch()}
          />
        ) : verificaciones.data.datos.length === 0 ? (
          <EstadoVacio pestana={pestana} conBusqueda={Boolean(filtros.busqueda)} />
        ) : (
          <>
            <div className={actualizando ? 'opacity-70 transition-opacity' : 'transition-opacity'}>
              <TablaVerificaciones verificaciones={verificaciones.data.datos} />
            </div>
            <div className="border-t border-borde/70 px-5 py-4">
              <Paginacion
                pagina={verificaciones.data.pagina}
                limite={verificaciones.data.limite}
                total={verificaciones.data.total}
                deshabilitada={verificaciones.isFetching}
                alCambiarPagina={cambiarPagina}
              />
            </div>
          </>
        )}
      </section>
    </div>
  );
}
