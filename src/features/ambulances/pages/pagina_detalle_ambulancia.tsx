import { Ambulance, ArrowLeft, ArrowLeftRight, History, Info, LoaderCircle, Pencil } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { EstadoError } from '../../../components/states/estado_error';
import { RUTAS } from '../../../constants/rutas';
import { DatosAmbulancia } from '../components/datos_ambulancia';
import { DialogoCambiarEstadoAmbulancia } from '../components/dialogo_cambiar_estado_ambulancia';
import { HistorialEstados } from '../components/historial_estados';
import { InsigniaEstadoOperativo } from '../components/insignia_estado_operativo';
import { PanelAmbulancia } from '../components/panel_ambulancia';
import { PlacaAmbulancia } from '../components/placa_ambulancia';
import { TripulacionAmbulancia } from '../../shifts/components/tripulacion_ambulancia';
import { useAmbulancia } from '../hooks/use_ambulancias';
import { usePermisosAmbulancias } from '../hooks/use_permisos_ambulancias';

type AccionActiva = 'editar' | 'estado';

const claseBotonSecundario =
  'campo-vidrio inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-medium text-texto transition-colors duration-150 hover:bg-white focus-visible:ring-4 focus-visible:ring-primario/15 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white/70';

const clasePrimario =
  'inline-flex h-10 items-center gap-2 rounded-xl bg-primario px-4 text-sm font-semibold text-white shadow-primario transition-colors duration-150 hover:bg-primario-hover focus-visible:ring-4 focus-visible:ring-primario/25 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:hover:bg-primario';

function EnlaceVolver() {
  return (
    <Link
      to={RUTAS.ambulancias}
      className="inline-flex items-center gap-1.5 rounded-lg text-[13px] font-medium text-texto-secundario transition-colors duration-150 hover:text-primario focus-visible:ring-2 focus-visible:ring-primario/40 focus-visible:outline-none"
    >
      <ArrowLeft aria-hidden strokeWidth={1.75} className="size-4" />
      Flota de ambulancias
    </Link>
  );
}

function EsqueletoDetalle() {
  return (
    <div role="status" aria-label="Cargando ambulancia" className="animate-pulse space-y-3">
      <div className="vidrio flex items-center gap-4 rounded-2xl px-5 py-6">
        <span className="size-12 rounded-2xl bg-texto-secundario/10" />
        <div className="space-y-2">
          <span className="block h-5 w-36 rounded-full bg-texto-secundario/12" />
          <span className="block h-3 w-52 rounded-full bg-texto-secundario/8" />
        </div>
      </div>
      <div className="grid gap-3 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
        <div className="vidrio h-80 rounded-2xl" />
        <div className="vidrio h-80 rounded-2xl" />
      </div>
    </div>
  );
}

export function PaginaDetalleAmbulancia() {
  const { id = '' } = useParams();
  const navegar = useNavigate();
  // El estado también cambia solo, cuando la tripulación entra o sale desde la app.
  const consulta = useAmbulancia(id, undefined, { enVivo: true });
  const { puedeGestionar, puedeCambiarEstado, puedeVerAutores } = usePermisosAmbulancias();
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
            titulo={noExiste ? 'Ambulancia no encontrada' : 'No fue posible cargar la ambulancia'}
            mensaje={
              noExiste ? 'Puede que se haya eliminado o que el enlace no sea correcto.' : consulta.error.message
            }
            alReintentar={noExiste ? undefined : () => void consulta.refetch()}
            accionSecundaria={{
              etiqueta: 'Volver al listado',
              alPulsar: () => void navegar(RUTAS.ambulancias),
            }}
          />
        </div>
      </div>
    );
  }

  const ambulancia = consulta.data;
  const enServicio = ambulancia.estadoOperativo === 'en_servicio';
  const actualizando = consulta.isFetching;

  return (
    <div className="min-h-0 flex-1 space-y-3 overflow-y-auto">
      <section aria-labelledby="titulo-ambulancia" className="vidrio rounded-2xl px-5 pt-4 pb-5">
        <EnlaceVolver />
        <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <span
              aria-hidden
              className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primario/10 text-primario"
            >
              <Ambulance strokeWidth={1.75} className="size-6" />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <h2 id="titulo-ambulancia" className="truncate text-2xl font-semibold tracking-tight text-texto">
                  {ambulancia.codigo}
                </h2>
                <InsigniaEstadoOperativo estado={ambulancia.estadoOperativo} />
                {actualizando && (
                  <LoaderCircle
                    aria-label="Actualizando"
                    className="size-4 animate-spin text-texto-secundario"
                  />
                )}
              </div>
              <p className="mt-1.5 flex flex-wrap items-center gap-2 text-sm text-texto-secundario">
                <PlacaAmbulancia placa={ambulancia.placa} />
                <span aria-hidden>·</span>
                {ambulancia.tipo.nombre}
                {ambulancia.tipo.descripcion && (
                  <span className="hidden sm:inline">— {ambulancia.tipo.descripcion}</span>
                )}
              </p>
            </div>
          </div>

          {(puedeCambiarEstado || puedeGestionar) && (
            <div className="flex shrink-0 flex-wrap gap-2">
              {puedeGestionar && (
                <button
                  type="button"
                  onClick={() => setAccion('editar')}
                  disabled={enServicio}
                  className={claseBotonSecundario}
                >
                  <Pencil aria-hidden strokeWidth={1.75} className="size-4" />
                  Editar
                </button>
              )}
              {puedeCambiarEstado && (
                <button
                  type="button"
                  onClick={() => setAccion('estado')}
                  disabled={enServicio}
                  className={clasePrimario}
                >
                  <ArrowLeftRight aria-hidden strokeWidth={1.75} className="size-4" />
                  Cambiar estado
                </button>
              )}
            </div>
          )}
        </div>

        {enServicio && (puedeCambiarEstado || puedeGestionar) && (
          <p className="mt-4 flex items-start gap-2.5 rounded-xl bg-primario/5 px-4 py-3 text-[13px] text-texto">
            <Info aria-hidden strokeWidth={1.75} className="mt-0.5 size-4 shrink-0 text-primario" />
            Está atendiendo un servicio. No se puede editar ni cambiar su estado a mano hasta que termine.
          </p>
        )}
      </section>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] lg:items-start">
        <div className="space-y-3">
          <section aria-labelledby="titulo-datos" className="vidrio rounded-2xl">
            <h3 id="titulo-datos" className="border-b border-borde/70 px-5 py-4 text-base font-semibold text-texto">
              Datos del vehículo
            </h3>
            <DatosAmbulancia ambulancia={ambulancia} />
          </section>
          <section aria-labelledby="titulo-tripulacion" className="vidrio rounded-2xl">
            <h3
              id="titulo-tripulacion"
              className="border-b border-borde/70 px-5 py-4 text-base font-semibold text-texto"
            >
              Tripulación
            </h3>
            <TripulacionAmbulancia ambulanciaId={ambulancia.id} />
          </section>
        </div>

        <section aria-labelledby="titulo-historial" className="vidrio-fuerte rounded-2xl">
          <header className="flex items-center gap-2 border-b border-borde/70 px-5 py-4">
            <History aria-hidden strokeWidth={1.75} className="size-[18px] text-texto-secundario" />
            <h3 id="titulo-historial" className="text-base font-semibold text-texto">
              Historial de estados
            </h3>
          </header>
          <HistorialEstados ambulanciaId={ambulancia.id} mostrarAutores={puedeVerAutores} />
        </section>
      </div>

      {accion === 'editar' && <PanelAmbulancia ambulancia={ambulancia} alCerrar={cerrarAccion} />}
      {accion === 'estado' && (
        <DialogoCambiarEstadoAmbulancia ambulancia={ambulancia} alCerrar={cerrarAccion} />
      )}
    </div>
  );
}
