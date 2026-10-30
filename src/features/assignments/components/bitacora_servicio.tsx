import { LoaderCircle, TriangleAlert } from 'lucide-react';
import { ETIQUETAS_ROL } from '../../../constants/roles';
import { formatearFechaHora } from '../../../utils/formato_fecha';
import { NOMBRES_ROLES } from '../../../types/rol.types';
import { ESTILOS_ESTADO_ASIGNACION } from '../constants/asignaciones';
import { useEventosAsignacion } from '../hooks/use_asignaciones';
import type { EventoAsignacion } from '../types/asignacion.types';
import { textoDistanciaRuta } from '../utils/formato_ruta';
import { etiquetaEvento } from '../utils/pasos_asignacion';

const formatoHora = new Intl.DateTimeFormat('es-CO', { timeStyle: 'short' });

function textoRol(rol: string | null): string | null {
  if (!rol) return null;
  const conocido = NOMBRES_ROLES.find((nombre) => nombre === rol);
  return (conocido ? ETIQUETAS_ROL[conocido] : rol).toLowerCase();
}

function Paso({ evento }: { evento: EventoAsignacion }) {
  const { icono: Icono, clases } = ESTILOS_ESTADO_ASIGNACION[evento.estadoNuevo];
  const rol = textoRol(evento.responsable?.rol ?? null);
  const fecha = new Date(evento.ocurridoEn);

  return (
    <li className="group relative flex gap-3 pb-4 last:pb-0">
      <span aria-hidden className="absolute top-8 bottom-0 left-[13px] w-px bg-borde group-last:hidden" />
      <span aria-hidden className={`relative flex size-7 shrink-0 items-center justify-center rounded-full ring-4 ring-white/80 ${clases}`}>
        <Icono strokeWidth={1.75} className="size-3.5" />
      </span>
      <div className="min-w-0 flex-1 pt-0.5 text-[13px]">
        <p className="flex flex-wrap items-baseline gap-x-2">
          <time
            dateTime={evento.ocurridoEn}
            title={formatearFechaHora(evento.ocurridoEn)}
            className="font-semibold text-texto tabular-nums"
          >
            {Number.isNaN(fecha.getTime()) ? '—' : formatoHora.format(fecha)}
          </time>
          <span className="font-medium text-texto">{etiquetaEvento(evento)}</span>
          {evento.distanciaEscenaMetros !== null && (
            <span className="text-texto-secundario">· a {textoDistanciaRuta(evento.distanciaEscenaMetros)}</span>
          )}
        </p>
        {evento.responsable?.nombreCompleto && (
          <p className="text-texto-secundario">
            por {evento.responsable.nombreCompleto}
            {rol && ` (${rol})`}
          </p>
        )}
        {evento.fueraDeRadio ? (
          <p className="mt-1.5 flex items-start gap-2 rounded-lg border border-advertencia/25 bg-advertencia/8 px-2.5 py-1.5 text-texto">
            <TriangleAlert aria-hidden strokeWidth={1.75} className="mt-0.5 size-3.5 shrink-0 text-advertencia" />
            <span>
              <span className="font-medium">Llegada marcada lejos de la emergencia.</span>
              {evento.observacion && <span className="block text-texto-secundario">Motivo: {evento.observacion}</span>}
            </span>
          </p>
        ) : (
          evento.observacion && <p className="mt-1 text-texto">{evento.observacion}</p>
        )}
      </div>
    </li>
  );
}

/** Bitácora del servicio: cada paso con su hora, quién lo marcó y su rol. */
export function BitacoraServicio({ asignacionId, enVivo }: { asignacionId: string; enVivo: boolean }) {
  const eventos = useEventosAsignacion(asignacionId, enVivo);

  if (eventos.isPending) {
    return (
      <p role="status" className="flex items-center gap-2 py-3 text-[13px] text-texto-secundario">
        <LoaderCircle aria-hidden className="size-4 animate-spin" />
        Cargando la bitácora…
      </p>
    );
  }
  if (eventos.isError) {
    return <p className="py-3 text-[13px] text-critico">No fue posible cargar la bitácora: {eventos.error.message}</p>;
  }
  if (eventos.data.length === 0) {
    return <p className="py-3 text-[13px] text-texto-secundario">Aún no hay pasos registrados.</p>;
  }

  return (
    <ol aria-label="Bitácora del servicio" className="pt-1">
      {eventos.data.map((evento) => (
        <Paso key={evento.id} evento={evento} />
      ))}
    </ol>
  );
}
