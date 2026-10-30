import { Ban, Info, LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import { useNotificaciones } from '../../../hooks/use_notificaciones';
import {
  ACCIONES_AVANCE,
  AVANCES_SOLO_TRIPULACION,
  ESTADOS_CIERRE_CON_OBSERVACION,
  ESTILOS_ESTADO_ASIGNACION,
  esCancelable,
} from '../constants/asignaciones';
import { useMarcarAvance } from '../hooks/use_mutaciones_asignacion';
import type { Asignacion, EstadoAvance } from '../types/asignacion.types';
import { DialogoCancelarAsignacion } from './dialogo_cancelar_asignacion';
import { DialogoFinalizarServicio } from './dialogo_finalizar_servicio';

const claseBoton =
  'inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-[13px] font-medium transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-primario/40 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60';

function textoAvance(asignacion: Asignacion, estado: EstadoAvance): string {
  if (estado !== 'finalizada') return ACCIONES_AVANCE[estado];
  return ESTADOS_CIERRE_CON_OBSERVACION.includes(asignacion.estado) ? 'Cerrar sin traslado' : 'Paciente entregado';
}

/**
 * Botones según `siguientesEstados` del backend. Normalmente avanza la tripulación desde la app;
 * el despachador marca los demás pasos cuando le avisan por radio. La llegada a la escena no:
 * la marca el conductor con su GPS.
 */
export function AccionesAsignacion({ asignacion }: { asignacion: Asignacion }) {
  const avance = useMarcarAvance();
  const { notificar } = useNotificaciones();
  const [dialogo, setDialogo] = useState<'cancelar' | 'finalizar' | null>(null);
  const [enCurso, setEnCurso] = useState<EstadoAvance | null>(null);
  const cancelable = esCancelable(asignacion.estado);
  const avances = asignacion.siguientesEstados.filter((estado) => !AVANCES_SOLO_TRIPULACION.includes(estado));
  const esperaLlegada = asignacion.siguientesEstados.includes('en_escena');

  if (avances.length === 0 && !cancelable && !esperaLlegada) return null;

  const avanzar = (estado: EstadoAvance) => {
    if (estado === 'finalizada') {
      setDialogo('finalizar');
      return;
    }
    setEnCurso(estado);
    avance.mutate(
      { id: asignacion.id, estado },
      {
        onError: (error) =>
          notificar({ tono: 'error', titulo: 'No se registró el avance', descripcion: error.message }),
        onSettled: () => setEnCurso(null),
      },
    );
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {avances.map((estado, indice) => {
        const { icono: Icono } = ESTILOS_ESTADO_ASIGNACION[estado];
        const principal = indice === 0;
        return (
          <button
            key={estado}
            type="button"
            onClick={() => avanzar(estado)}
            disabled={avance.isPending}
            className={`${claseBoton} ${
              principal
                ? 'bg-primario text-white shadow-primario hover:bg-primario-hover'
                : 'campo-vidrio text-texto hover:bg-white'
            }`}
          >
            {enCurso === estado ? (
              <LoaderCircle aria-hidden className="size-3.5 animate-spin" />
            ) : (
              <Icono aria-hidden strokeWidth={1.75} className="size-3.5" />
            )}
            {textoAvance(asignacion, estado)}
          </button>
        );
      })}
      {cancelable && (
        <button
          type="button"
          onClick={() => setDialogo('cancelar')}
          disabled={avance.isPending}
          className={`${claseBoton} text-critico hover:bg-critico/6`}
        >
          <Ban aria-hidden strokeWidth={1.75} className="size-3.5" />
          Cancelar
        </button>
      )}

      {esperaLlegada && (
        <span className="inline-flex items-center gap-1.5 px-1 text-[13px] text-texto-secundario">
          <Info aria-hidden strokeWidth={1.75} className="size-3.5 shrink-0" />
          La llegada la marca el conductor desde la app.
        </span>
      )}

      {dialogo === 'cancelar' && (
        <DialogoCancelarAsignacion asignacion={asignacion} alCerrar={() => setDialogo(null)} />
      )}
      {dialogo === 'finalizar' && (
        <DialogoFinalizarServicio asignacion={asignacion} alCerrar={() => setDialogo(null)} />
      )}
    </div>
  );
}
