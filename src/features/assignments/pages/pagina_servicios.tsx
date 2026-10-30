import { CircleCheck, LoaderCircle } from 'lucide-react';
import { EstadoError } from '../../../components/states/estado_error';
import { useAhora } from '../../../hooks/use_ahora';
import { useTiempoReal } from '../../realtime/hooks/use_tiempo_real';
import { ServicioAsignacion } from '../components/servicio_asignacion';
import { useAsignacionesActivas } from '../hooks/use_asignaciones';

/** Servicios en curso: se mantiene al día por avisos en tiempo real o, sin ellos, cada 15 s. */
export function PaginaServicios() {
  const ahora = useAhora();
  const asignaciones = useAsignacionesActivas();
  const { estado } = useTiempoReal();
  const total = asignaciones.data?.total;

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <section aria-labelledby="titulo-servicios" className="vidrio rounded-2xl">
        <header className="border-b border-borde/70 px-5 pt-5 pb-4">
          <h2 id="titulo-servicios" className="text-xl font-semibold tracking-tight text-texto">
            Servicios en curso
          </h2>
          <p className="mt-0.5 flex items-center gap-2 text-sm text-texto-secundario">
            {total === undefined
              ? 'Ambulancias despachadas y su avance.'
              : `${total} ${total === 1 ? 'servicio activo' : 'servicios activos'} · ${
                  estado === 'en_linea' ? 'en vivo' : 'se actualiza cada 15 s'
                }`}
            {asignaciones.isFetching && !asignaciones.isPending && (
              <LoaderCircle aria-label="Actualizando" className="size-3.5 animate-spin" />
            )}
          </p>
        </header>

        {asignaciones.isPending ? (
          <div role="status" aria-label="Cargando servicios" className="space-y-3 p-5">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="h-36 animate-pulse rounded-2xl bg-white/50" />
            ))}
          </div>
        ) : asignaciones.isError ? (
          <EstadoError
            titulo="No fue posible cargar los servicios"
            mensaje={asignaciones.error.message}
            alReintentar={() => void asignaciones.refetch()}
          />
        ) : asignaciones.data.datos.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <span className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-exito/10 text-exito">
              <CircleCheck aria-hidden strokeWidth={1.75} className="size-[22px]" />
            </span>
            <p className="text-base font-semibold text-texto">No hay servicios en curso</p>
            <p className="mt-1 max-w-sm text-sm text-texto-secundario">
              Despacha una ambulancia desde el detalle de una emergencia o desde el mapa operativo.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-borde/60">
            {asignaciones.data.datos.map((asignacion) => (
              <ServicioAsignacion key={asignacion.id} asignacion={asignacion} ahora={ahora} mostrarEmergencia />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
