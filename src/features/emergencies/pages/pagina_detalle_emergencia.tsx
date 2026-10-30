import { ArrowLeft, Ban, ClipboardList, LoaderCircle, MapPin, Pencil, Timer } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { EstadoError } from '../../../components/states/estado_error';
import { RUTAS } from '../../../constants/rutas';
import { useAhora } from '../../../hooks/use_ahora';
import { formatearFechaHora } from '../../../utils/formato_fecha';
import { ServiciosEmergencia } from '../../assignments/components/servicios_emergencia';
import { AvisoDuplicada } from '../components/aviso_duplicada';
import { DatosEmergencia } from '../components/datos_emergencia';
import { DialogoCancelarEmergencia } from '../components/dialogo_cancelar_emergencia';
import { InsigniaEstadoEmergencia, InsigniaPrioridad } from '../components/insignias_emergencia';
import { PanelEmergencia } from '../components/panel_emergencia';
import { PosiblesDuplicadas } from '../components/posibles_duplicadas';
import { UbicacionEmergencia } from '../components/ubicacion_emergencia';
import { esActiva } from '../constants/catalogos_emergencia';
import { useEmergencia } from '../hooks/use_emergencias';
import { haceTiempo } from '../../../utils/tiempo_transcurrido';

type AccionActiva = 'editar' | 'cancelar';

const claseBotonSecundario =
  'campo-vidrio inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-medium text-texto transition-colors duration-150 hover:bg-white focus-visible:ring-4 focus-visible:ring-primario/15 focus-visible:outline-none';

const claseBotonPeligro =
  'inline-flex h-10 items-center gap-2 rounded-xl border border-critico/25 bg-white/70 px-4 text-sm font-medium text-critico transition-colors duration-150 hover:bg-critico/6 focus-visible:ring-4 focus-visible:ring-critico/15 focus-visible:outline-none';

function EsqueletoDetalle() {
  return (
    <div role="status" aria-label="Cargando emergencia" className="animate-pulse space-y-3">
      <div className="vidrio space-y-3 rounded-2xl px-5 py-6">
        <span className="block h-6 w-56 rounded-full bg-texto-secundario/12" />
        <span className="block h-3 w-72 max-w-full rounded-full bg-texto-secundario/8" />
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        <div className="vidrio h-80 rounded-2xl" />
        <div className="vidrio h-80 rounded-2xl" />
      </div>
    </div>
  );
}

export function PaginaDetalleEmergencia() {
  const { id = '' } = useParams();
  const navegar = useNavigate();
  const ahora = useAhora();
  const consulta = useEmergencia(id, undefined, { enVivo: true });
  const [accion, setAccion] = useState<AccionActiva | null>(null);
  const cerrarAccion = () => setAccion(null);

  if (consulta.isPending) {
    return (
      <div className="min-h-0 flex-1 overflow-y-auto">
        <EsqueletoDetalle />
      </div>
    );
  }

  if (consulta.isError) {
    const noExiste = consulta.error.estado === 404 || consulta.error.estado === 400;
    return (
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="vidrio rounded-2xl">
          <EstadoError
            titulo={noExiste ? 'Emergencia no encontrada' : 'No fue posible cargar la emergencia'}
            mensaje={noExiste ? 'Revisa que el enlace sea correcto.' : consulta.error.message}
            alReintentar={noExiste ? undefined : () => void consulta.refetch()}
            accionSecundaria={{ etiqueta: 'Volver a emergencias', alPulsar: () => void navegar(RUTAS.emergencias) }}
          />
        </div>
      </div>
    );
  }

  const emergencia = consulta.data;
  const activa = esActiva(emergencia.estado);
  const puedeMarcarDuplicada = emergencia.estado === 'recibida' && !emergencia.emergenciaPrincipalId;

  return (
    <div className="min-h-0 flex-1 space-y-3 overflow-y-auto">
      <section aria-labelledby="titulo-emergencia" className="vidrio rounded-2xl px-5 pt-4 pb-5">
        <Link
          to={RUTAS.emergencias}
          className="inline-flex items-center gap-1.5 rounded-lg text-[13px] font-medium text-texto-secundario transition-colors duration-150 hover:text-primario focus-visible:ring-2 focus-visible:ring-primario/40 focus-visible:outline-none"
        >
          <ArrowLeft aria-hidden strokeWidth={1.75} className="size-4" />
          Emergencias
        </Link>

        <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <h2 id="titulo-emergencia" className="text-2xl font-semibold tracking-tight text-texto tabular-nums">
                {emergencia.numeroEmergencia}
              </h2>
              <InsigniaPrioridad prioridad={emergencia.prioridad} detallada />
              <InsigniaEstadoEmergencia estado={emergencia.estado} />
              {consulta.isFetching && (
                <LoaderCircle aria-label="Actualizando" className="size-4 animate-spin text-texto-secundario" />
              )}
            </div>
            <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-texto-secundario">
              <span className="inline-flex items-center gap-1.5">
                <Timer aria-hidden strokeWidth={1.75} className="size-4" />
                {activa ? (
                  <>
                    Recibida{' '}
                    <time dateTime={emergencia.recibidaEn} title={formatearFechaHora(emergencia.recibidaEn)}>
                      {haceTiempo(emergencia.recibidaEn, ahora)}
                    </time>
                  </>
                ) : (
                  <time dateTime={emergencia.recibidaEn}>{formatearFechaHora(emergencia.recibidaEn)}</time>
                )}
              </span>
              {emergencia.direccion && (
                <span className="inline-flex min-w-0 items-center gap-1.5">
                  <MapPin aria-hidden strokeWidth={1.75} className="size-4 shrink-0" />
                  <span className="truncate">{emergencia.direccion}</span>
                </span>
              )}
            </p>
          </div>

          {activa && (
            <div className="flex shrink-0 flex-wrap gap-2">
              {emergencia.estado === 'recibida' && (
                <button type="button" onClick={() => setAccion('cancelar')} className={claseBotonPeligro}>
                  <Ban aria-hidden strokeWidth={1.75} className="size-4" />
                  Cancelar
                </button>
              )}
              <button type="button" onClick={() => setAccion('editar')} className={claseBotonSecundario}>
                <Pencil aria-hidden strokeWidth={1.75} className="size-4" />
                Corregir datos
              </button>
            </div>
          )}
        </div>

        {emergencia.emergenciaPrincipalId && (
          <AvisoDuplicada emergenciaPrincipalId={emergencia.emergenciaPrincipalId} />
        )}
      </section>

      {puedeMarcarDuplicada && <PosiblesDuplicadas emergencia={emergencia} ahora={ahora} />}

      <ServiciosEmergencia emergencia={emergencia} />

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start">
        <section aria-labelledby="titulo-reporte" className="vidrio rounded-2xl">
          <header className="flex items-center gap-2 border-b border-borde/70 px-5 py-4">
            <ClipboardList aria-hidden strokeWidth={1.75} className="size-[18px] text-texto-secundario" />
            <h3 id="titulo-reporte" className="text-base font-semibold text-texto">
              Reporte
            </h3>
          </header>
          <DatosEmergencia emergencia={emergencia} />
        </section>

        <section aria-labelledby="titulo-ubicacion" className="vidrio rounded-2xl">
          <header className="flex items-center gap-2 border-b border-borde/70 px-5 py-4">
            <MapPin aria-hidden strokeWidth={1.75} className="size-[18px] text-texto-secundario" />
            <h3 id="titulo-ubicacion" className="text-base font-semibold text-texto">
              Ubicación
            </h3>
          </header>
          <UbicacionEmergencia emergencia={emergencia} />
        </section>
      </div>

      {accion === 'editar' && <PanelEmergencia emergencia={emergencia} alCerrar={cerrarAccion} />}
      {accion === 'cancelar' && <DialogoCancelarEmergencia emergencia={emergencia} alCerrar={cerrarAccion} />}
    </div>
  );
}
