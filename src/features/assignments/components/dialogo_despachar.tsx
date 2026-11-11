import { Ambulance, CircleCheck, Inbox, LoaderCircle, MapPinOff, Send, SignalZero } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { AlertaError } from '../../../components/feedback/alerta_error';
import { PieFormulario } from '../../../components/forms/pie_formulario';
import { Dialogo } from '../../../components/ui/dialogo';
import { useAhora } from '../../../hooks/use_ahora';
import { useNotificaciones } from '../../../hooks/use_notificaciones';
import { PlacaAmbulancia } from '../../ambulances/components/placa_ambulancia';
import { useAmbulancias } from '../../ambulances/hooks/use_ambulancias';
import { textoSenal } from '../../ambulances/utils/senal_ubicacion';
import { InsigniaPrioridad } from '../../emergencies/components/insignias_emergencia';
import type { Emergencia } from '../../emergencies/types/emergencia.types';
import { textoDistancia } from '../../emergencies/utils/formato_emergencia';
import { useIntervaloRespaldo } from '../../realtime/hooks/use_tiempo_real';
import { INTERVALO_ACTUALIZACION_MS, LIMITE_ACTIVAS } from '../constants/asignaciones';
import { useDespachar } from '../hooks/use_mutaciones_asignacion';
import { ordenarCandidatas, type Candidata } from '../utils/candidatas_despacho';

interface PropiedadesDialogoDespachar {
  emergencia: Emergencia;
  alCerrar: () => void;
}

function Ubicacion({ candidata, ahora }: { candidata: Candidata; ahora: number }) {
  const { ambulancia, distanciaMetros, senal } = candidata;
  if (senal === 'ninguna') {
    return (
      <span className="inline-flex items-center gap-1 text-texto-secundario">
        <MapPinOff aria-hidden strokeWidth={1.75} className="size-3.5" />
        Sin ubicación
      </span>
    );
  }
  return (
    <span className="inline-flex flex-wrap items-center gap-x-2">
      {distanciaMetros !== null && <span className="font-medium text-texto">{textoDistancia(distanciaMetros)}</span>}
      {senal !== 'reciente' && (
        <span className="inline-flex items-center gap-1 text-advertencia-hover">
          <SignalZero aria-hidden strokeWidth={1.75} className="size-3.5" />
          {textoSenal(ambulancia.ultimaUbicacion, ahora)}
        </span>
      )}
    </span>
  );
}

export function DialogoDespachar({ emergencia, alCerrar }: PropiedadesDialogoDespachar) {
  const ahora = useAhora(15_000);
  const disponibles = useAmbulancias(
    { estadoOperativo: 'disponible', pagina: 1, limite: LIMITE_ACTIVAS },
    useIntervaloRespaldo(INTERVALO_ACTUALIZACION_MS),
  );
  const despacho = useDespachar();
  const { notificar } = useNotificaciones();
  const [elegida, setElegida] = useState<string | null>(null);

  const candidatas = ordenarCandidatas(disponibles.data?.datos ?? [], emergencia.coordenadas, ahora);
  // Si la ambulancia elegida dejó de estar disponible, se quita la selección.
  const seleccion = candidatas.some(({ ambulancia }) => ambulancia.id === elegida) ? elegida : null;

  const enviar = (evento: FormEvent) => {
    evento.preventDefault();
    if (!seleccion) return;
    despacho.mutate(
      { emergenciaId: emergencia.id, ambulanciaId: seleccion },
      {
        onSuccess: (asignacion) => {
          notificar({
            tono: 'exito',
            titulo: 'Ambulancia despachada',
            descripcion: `${asignacion.ambulanciaCodigo ?? 'La ambulancia'} → ${emergencia.numeroEmergencia}`,
          });
          alCerrar();
        },
      },
    );
  };

  return (
    <Dialogo
      abierto
      variante="lateral"
      titulo="Despachar ambulancia"
      descripcion={
        <span className="flex flex-wrap items-center gap-2">
          {emergencia.numeroEmergencia}
          <InsigniaPrioridad prioridad={emergencia.prioridad} />
        </span>
      }
      cerrable={!despacho.isPending}
      alCerrar={alCerrar}
    >
      <form onSubmit={enviar} className="flex min-h-full flex-col">
        <div className="flex-1 space-y-4 px-6 py-5">
          {despacho.error && <AlertaError error={despacho.error} />}
          {(despacho.error?.estado === 409 || despacho.error?.estado === 422) && (
            <p className="text-[13px] text-texto-secundario">La lista se actualizó con la disponibilidad actual.</p>
          )}

          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-texto">Ambulancias disponibles</p>
            {disponibles.isFetching && (
              <LoaderCircle aria-label="Actualizando" className="size-4 animate-spin text-texto-secundario" />
            )}
          </div>
          {emergencia.coordenadas ? (
            <p className="text-[13px] text-texto-secundario">
              Ordenadas por distancia en línea recta desde su última posición; no es la distancia por vía.
            </p>
          ) : (
            <p className="text-[13px] text-texto-secundario">
              La emergencia no tiene coordenadas: no se puede ordenar por cercanía.
            </p>
          )}

          {disponibles.isPending ? (
            <div role="status" aria-label="Cargando ambulancias" className="space-y-2">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-2xl bg-white/50" />
              ))}
            </div>
          ) : disponibles.isError ? (
            <AlertaError error={disponibles.error} />
          ) : candidatas.length === 0 ? (
            <div className="flex flex-col items-center rounded-2xl bg-white/50 px-6 py-10 text-center">
              <Inbox aria-hidden strokeWidth={1.75} className="mb-3 size-6 text-texto-secundario" />
              <p className="text-sm font-semibold text-texto">No hay ambulancias disponibles</p>
              <p className="mt-1 text-[13px] text-texto-secundario">
                Una ambulancia queda disponible cuando su conductor y su paramédico la seleccionan desde la app, o al
                terminar un servicio.
              </p>
            </div>
          ) : (
            <fieldset disabled={despacho.isPending} className="space-y-2">
              <legend className="sr-only">Ambulancia a despachar</legend>
              {candidatas.map((candidata) => {
                const { ambulancia } = candidata;
                const marcada = ambulancia.id === seleccion;
                return (
                  <label
                    key={ambulancia.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition-colors duration-150 has-focus-visible:ring-2 has-focus-visible:ring-primario/40 ${
                      marcada ? 'border-primario/40 bg-primario/6' : 'border-borde/80 bg-white/50 hover:bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="ambulancia"
                      value={ambulancia.id}
                      checked={marcada}
                      onChange={() => setElegida(ambulancia.id)}
                      className="sr-only"
                    />
                    <span
                      aria-hidden
                      className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${
                        marcada ? 'bg-primario text-white' : 'bg-primario/8 text-primario'
                      }`}
                    >
                      {marcada ? <CircleCheck strokeWidth={1.75} className="size-[18px]" /> : <Ambulance strokeWidth={1.75} className="size-[18px]" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2 text-sm font-semibold text-texto">
                        {ambulancia.codigo}
                        <PlacaAmbulancia placa={ambulancia.placa} />
                        <span className="text-xs font-medium text-primario">{ambulancia.tipo.nombre}</span>
                      </span>
                      <span className="mt-1 block text-[13px]">
                        <Ubicacion candidata={candidata} ahora={ahora} />
                      </span>
                    </span>
                  </label>
                );
              })}
            </fieldset>
          )}
        </div>

        <PieFormulario
          textoEnviar="Despachar"
          textoEnviando="Despachando…"
          icono={Send}
          enviando={despacho.isPending}
          deshabilitado={!seleccion}
          alCancelar={alCerrar}
        />
      </form>
    </Dialogo>
  );
}
