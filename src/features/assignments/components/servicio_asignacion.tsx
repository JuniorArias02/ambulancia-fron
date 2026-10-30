import { Ambulance, ChevronDown, Siren, Timer } from 'lucide-react';
import { useId, useState } from 'react';
import { generatePath, Link } from 'react-router';
import { RUTAS } from '../../../constants/rutas';
import { formatearFechaHora } from '../../../utils/formato_fecha';
import { tiempoTranscurrido } from '../../../utils/tiempo_transcurrido';
import type { PuntoMapa } from '../../map/utils/coordenadas';
import { esAsignacionActiva } from '../constants/asignaciones';
import type { Asignacion } from '../types/asignacion.types';
import { minutosDeRespuesta } from '../utils/pasos_asignacion';
import { AccionesAsignacion } from './acciones_asignacion';
import { InsigniaEstadoAsignacion } from './insignia_estado_asignacion';
import { ProgresoAsignacion } from './progreso_asignacion';
import { BitacoraServicio } from './bitacora_servicio';
import { RecorridoAsignacion } from './recorrido_asignacion';

interface PropiedadesServicioAsignacion {
  asignacion: Asignacion;
  ahora: number;
  /** En el detalle de la emergencia no hace falta enlazarla. */
  mostrarEmergencia: boolean;
  destino?: PuntoMapa | null;
  colorDestino?: string;
}

type PanelServicio = 'recorrido' | 'bitacora';

const PANELES: { valor: PanelServicio; texto: string }[] = [
  { valor: 'bitacora', texto: 'Bitácora' },
  { valor: 'recorrido', texto: 'Recorrido' },
];

const claseEnlace =
  'inline-flex items-center gap-1.5 rounded font-semibold text-texto tabular-nums hover:text-primario focus-visible:ring-2 focus-visible:ring-primario/40 focus-visible:outline-none';

export function ServicioAsignacion({
  asignacion,
  ahora,
  mostrarEmergencia,
  destino = null,
  colorDestino = '#64748b',
}: PropiedadesServicioAsignacion) {
  const [panel, setPanel] = useState<PanelServicio | null>(null);
  const idPanel = useId();
  const alternar = (siguiente: PanelServicio) => setPanel((actual) => (actual === siguiente ? null : siguiente));
  const activa = esAsignacionActiva(asignacion.estado);
  const respuesta = minutosDeRespuesta(asignacion);

  return (
    <article className="space-y-4 px-5 py-4">
      <header className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          {mostrarEmergencia && (
            <Link to={generatePath(RUTAS.detalleEmergencia, { id: asignacion.emergenciaId })} className={claseEnlace}>
              <Siren aria-hidden strokeWidth={1.75} className="size-4 text-texto-secundario" />
              {asignacion.numeroEmergencia ?? 'Emergencia'}
            </Link>
          )}
          <Link to={generatePath(RUTAS.detalleAmbulancia, { id: asignacion.ambulanciaId })} className={claseEnlace}>
            <Ambulance aria-hidden strokeWidth={1.75} className="size-4 text-texto-secundario" />
            {asignacion.ambulanciaCodigo ?? 'Ambulancia'}
          </Link>
          <InsigniaEstadoAsignacion estado={asignacion.estado} />
        </div>
        <p className="flex flex-wrap items-center gap-x-3 text-[13px] text-texto-secundario">
          {activa && (
            <span
              className="inline-flex items-center gap-1.5 tabular-nums"
              title={`Asignada el ${formatearFechaHora(asignacion.asignadaEn)}`}
            >
              <Timer aria-hidden strokeWidth={1.75} className="size-3.5" />
              {tiempoTranscurrido(asignacion.asignadaEn, ahora)}
            </span>
          )}
          {respuesta !== null && <span>Respuesta: {respuesta} min</span>}
          {asignacion.asignadaPor?.nombreCompleto && <span>Despachó {asignacion.asignadaPor.nombreCompleto}</span>}
        </p>
      </header>

      <ProgresoAsignacion asignacion={asignacion} />

      {asignacion.motivoCancelacion && (
        <p className="rounded-xl bg-texto-secundario/8 px-4 py-2.5 text-[13px] text-texto">
          <span className="font-medium">Motivo de cancelación:</span> {asignacion.motivoCancelacion}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <AccionesAsignacion asignacion={asignacion} />
        <div className="ml-auto flex gap-1">
          {PANELES.map(({ valor, texto }) => (
            <button
              key={valor}
              type="button"
              onClick={() => alternar(valor)}
              aria-expanded={panel === valor}
              aria-controls={panel === valor ? idPanel : undefined}
              className={`inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-[13px] font-medium transition-colors duration-150 hover:bg-white hover:text-texto ${
                panel === valor ? 'bg-white text-texto shadow-vidrio' : 'text-texto-secundario'
              }`}
            >
              {texto}
              <ChevronDown
                aria-hidden
                strokeWidth={1.75}
                className={`size-4 transition-transform duration-150 ${panel === valor ? 'rotate-180' : ''}`}
              />
            </button>
          ))}
        </div>
      </div>

      {panel && (
        <div id={idPanel}>
          {panel === 'recorrido' ? (
            <RecorridoAsignacion asignacion={asignacion} destino={destino} colorDestino={colorDestino} />
          ) : (
            <BitacoraServicio asignacionId={asignacion.id} enVivo={activa} />
          )}
        </div>
      )}
    </article>
  );
}
