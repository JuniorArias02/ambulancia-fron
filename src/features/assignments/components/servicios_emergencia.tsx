import { Ambulance, Send } from 'lucide-react';
import { useState } from 'react';
import { EstadoError } from '../../../components/states/estado_error';
import { useAhora } from '../../../hooks/use_ahora';
import { esActiva } from '../../emergencies/constants/catalogos_emergencia';
import { ESTILO_SIN_PRIORIDAD, ESTILOS_PRIORIDAD } from '../../emergencies/constants/estilos_emergencia';
import type { Emergencia } from '../../emergencies/types/emergencia.types';
import { useAsignacionesDeEmergencia } from '../hooks/use_asignaciones';
import { DialogoDespachar } from './dialogo_despachar';
import { ServicioAsignacion } from './servicio_asignacion';

/** Sección "Servicios" del detalle de una emergencia: despachos, avance y recorrido. */
export function ServiciosEmergencia({ emergencia }: { emergencia: Emergencia }) {
  const ahora = useAhora();
  const activa = esActiva(emergencia.estado);
  const asignaciones = useAsignacionesDeEmergencia(emergencia.id, activa);
  const [despachando, setDespachando] = useState(false);
  // Una llamada duplicada nunca se despacha: se atiende la principal.
  const puedeDespachar = activa && !emergencia.emergenciaPrincipalId;
  const colorDestino = (emergencia.prioridad ? ESTILOS_PRIORIDAD[emergencia.prioridad] : ESTILO_SIN_PRIORIDAD).colorMapa;

  return (
    <section aria-labelledby="titulo-servicios" className="vidrio rounded-2xl">
      <header className="flex flex-wrap items-center gap-3 border-b border-borde/70 px-5 py-4">
        <Ambulance aria-hidden strokeWidth={1.75} className="size-[18px] text-texto-secundario" />
        <h3 id="titulo-servicios" className="flex-1 text-base font-semibold text-texto">
          Servicios
        </h3>
        {puedeDespachar && (
          <button
            type="button"
            onClick={() => setDespachando(true)}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-primario px-4 text-sm font-semibold text-white shadow-primario transition-colors duration-150 hover:bg-primario-hover focus-visible:ring-4 focus-visible:ring-primario/25 focus-visible:outline-none"
          >
            <Send aria-hidden strokeWidth={1.75} className="size-4" />
            {emergencia.estado === 'recibida' ? 'Despachar ambulancia' : 'Despachar otra'}
          </button>
        )}
      </header>

      {asignaciones.isPending ? (
        <div role="status" aria-label="Cargando servicios" className="m-5 h-24 animate-pulse rounded-xl bg-white/50" />
      ) : asignaciones.isError ? (
        <EstadoError
          titulo="No fue posible cargar los servicios"
          mensaje={asignaciones.error.message}
          alReintentar={() => void asignaciones.refetch()}
        />
      ) : asignaciones.data.datos.length === 0 ? (
        <p className="px-5 py-5 text-sm text-texto-secundario">
          {puedeDespachar
            ? 'Aún no se ha despachado ninguna ambulancia.'
            : 'No se despachó ninguna ambulancia para esta emergencia.'}
        </p>
      ) : (
        <div className="divide-y divide-borde/60">
          {asignaciones.data.datos.map((asignacion) => (
            <ServicioAsignacion
              key={asignacion.id}
              asignacion={asignacion}
              ahora={ahora}
              mostrarEmergencia={false}
              destino={emergencia.coordenadas}
              colorDestino={colorDestino}
            />
          ))}
        </div>
      )}

      {despachando && <DialogoDespachar emergencia={emergencia} alCerrar={() => setDespachando(false)} />}
    </section>
  );
}
