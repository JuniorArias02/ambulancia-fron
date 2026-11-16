import { ArrowRight, LoaderCircle } from 'lucide-react';
import { Link } from 'react-router';
import { AlertaError } from '../../../components/feedback/alerta_error';
import {
  ETIQUETAS_ESTADO_EMERGENCIA,
  ETIQUETAS_FUENTE,
  ETIQUETAS_TIPO_INCIDENTE,
} from '../constants/catalogos_clinicos';
import { useIngreso } from '../hooks/use_historias';
import { formatearDuracion, formatearFechaHora } from '../utils/formato_clinico';
import { rutaIngreso } from '../utils/rutas_historias';
import { InsigniaModalidad } from '../../emergencies/components/insignias_emergencia';
import { EtiquetaPrioridad } from './etiquetas';
import { Dato, Ficha } from './valor_o_dato';

/** Resumen del ingreso: se pide solo al abrir la pestaña. */
export function SeccionServicio({ numeroEmergencia }: { numeroEmergencia: string | null }) {
  const ingreso = useIngreso(numeroEmergencia);

  if (!numeroEmergencia) return <p className="text-sm text-texto-secundario">La historia no tiene un ingreso asociado.</p>;
  if (ingreso.isPending) {
    return (
      <p role="status" className="flex items-center gap-2 text-sm text-texto-secundario">
        <LoaderCircle aria-hidden className="size-4 animate-spin" />
        Cargando el servicio…
      </p>
    );
  }
  if (ingreso.isError) return <AlertaError error={ingreso.error} />;

  const { emergencia, asignaciones, historias } = ingreso.data;
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-lg font-semibold text-texto">{emergencia.numeroEmergencia}</p>
        <EtiquetaPrioridad prioridad={emergencia.prioridad} />
        <InsigniaModalidad modalidad={emergencia.modalidad} />
        <span className="text-[13px] text-texto-secundario">{ETIQUETAS_ESTADO_EMERGENCIA[emergencia.estado] ?? emergencia.estado}</span>
      </div>
      <Ficha>
        <Dato etiqueta="Recibida" valor={emergencia.recibidaEn}>
          {formatearFechaHora(emergencia.recibidaEn)} · {ETIQUETAS_FUENTE[emergencia.fuente] ?? emergencia.fuente}
        </Dato>
        <Dato etiqueta="Tipo de incidente" valor={emergencia.tipoIncidente}>
          {emergencia.tipoIncidente && (ETIQUETAS_TIPO_INCIDENTE[emergencia.tipoIncidente] ?? emergencia.tipoIncidente)}
        </Dato>
        <Dato etiqueta="Dirección" valor={emergencia.direccion} />
        <Dato etiqueta="Pacientes del servicio" valor={historias.length} />
        <Dato etiqueta="Descripción" valor={emergencia.descripcion} ancho />
      </Ficha>
      {asignaciones.length > 0 && (
        <ul className="divide-y divide-borde/60 rounded-xl border border-borde/70 bg-white/60">
          {asignaciones.map((asignacion) => (
            <li key={asignacion.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
              <span className="font-medium text-texto">
                {asignacion.ambulancia.codigo} · {asignacion.ambulancia.tipo}
              </span>
              <span className="text-[13px] text-texto-secundario">
                Respuesta <span className="font-semibold text-texto tabular-nums">{formatearDuracion(asignacion.tiempos.respuestaSegundos)}</span>
                {asignacion.institucionDestino && ` · Destino ${asignacion.institucionDestino.nombre}`}
              </span>
            </li>
          ))}
        </ul>
      )}
      <Link
        to={rutaIngreso(emergencia.numeroEmergencia)}
        className="inline-flex h-10 items-center gap-2 rounded-xl bg-primario px-4 text-sm font-semibold text-white shadow-primario transition-colors duration-150 hover:bg-primario-hover"
      >
        Ver servicio completo
        <ArrowRight aria-hidden strokeWidth={1.75} className="size-4" />
      </Link>
    </div>
  );
}
