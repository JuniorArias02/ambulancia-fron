import { Ban, FileDown, FileSignature, LoaderCircle, ShieldAlert, Siren, TriangleAlert, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { useNotificaciones } from '../../../hooks/use_notificaciones';
import { InsigniaModalidad } from '../../emergencies/components/insignias_emergencia';
import { useDescargarPdf } from '../hooks/use_historias';
import type { DetalleHistoria } from '../types/historia_clinica.types';
import { alertasDeHistoria, type AlertaHistoria, type ClaseAlerta } from '../utils/alertas_historia';
import { cabeceraDeHistoria, type DatosCabecera } from '../utils/datos_cabecera';
import { codigoVerificacion, formatearFechaHora } from '../utils/formato_clinico';
import { rutaIngreso } from '../utils/rutas_historias';
import { EtiquetaEstadoHistoria, EtiquetaTriage } from './etiquetas';

const ICONOS_ALERTA: Record<ClaseAlerta, LucideIcon> = {
  alergias: ShieldAlert,
  triage: Siren,
  riesgo_caida: TriangleAlert,
  rechazo: Ban,
};

interface PropiedadesCabeceraPaciente {
  paciente: DatosCabecera;
  alertas: readonly AlertaHistoria[];
  /** Fila de contexto (número de historia, estado…). */
  detalle?: ReactNode;
  /** Pie (p. ej. la línea de firma). */
  pie?: ReactNode;
  acciones?: ReactNode;
}

/** Siempre visible al desplazarse: quién es el paciente y qué alertas tiene. Expediente y ficha. */
export function CabeceraPaciente({ paciente, alertas, detalle, pie, acciones }: PropiedadesCabeceraPaciente) {
  return (
    <header className="vidrio-fuerte sticky top-0 z-20 space-y-3 rounded-2xl px-5 py-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight break-words text-texto uppercase">
            {paciente.nombre ?? (
              <span>
                Paciente NN <span className="font-normal text-texto-secundario normal-case">— sin identificar</span>
              </span>
            )}
          </h2>
          <p className="text-sm text-texto">
            {paciente.identificacion.length > 0 ? (
              paciente.identificacion.join(' · ')
            ) : (
              <span className="text-texto-secundario">Sin documento, edad ni sexo</span>
            )}
          </p>
          <p className="text-sm text-texto-secundario">
            {paciente.afiliacion.length > 0 ? paciente.afiliacion.join(' · ') : 'EPS y régimen: sin dato'}
          </p>
        </div>
        {acciones && <div className="flex shrink-0 flex-wrap gap-2 self-start">{acciones}</div>}
      </div>

      {detalle}

      {alertas.length > 0 && (
        <ul aria-label="Alertas" className="flex flex-wrap gap-2">
          {alertas.map((alerta) => {
            const Icono = ICONOS_ALERTA[alerta.clase];
            return (
              <li
                key={`${alerta.clase}-${alerta.detalle ?? ''}`}
                className={`inline-flex max-w-full items-start gap-1.5 rounded-xl px-3 py-1.5 text-[13px] font-medium ${
                  alerta.tono === 'critico' ? 'bg-critico/10 text-critico' : 'bg-advertencia/12 text-advertencia'
                }`}
              >
                <Icono aria-hidden strokeWidth={2} className="mt-0.5 size-3.5 shrink-0" />
                <span className="min-w-0 break-words">
                  {alerta.titulo}
                  {alerta.detalle && <span className="font-normal text-texto">: {alerta.detalle}</span>}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {pie}
    </header>
  );
}

const claseAccion =
  'inline-flex h-9 items-center gap-2 rounded-xl px-3 text-[13px] font-medium transition-colors duration-150 focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60';

function BotonPdf({ historia }: { historia: DetalleHistoria }) {
  const descarga = useDescargarPdf();
  const { notificar } = useNotificaciones();
  const descargar = () =>
    descarga.mutate(
      { id: historia.id, numeroHistoria: historia.numeroHistoria },
      {
        onError: (error) =>
          notificar({
            tono: 'error',
            titulo: error.estado === 404 ? 'Historia no encontrada' : 'No fue posible descargar el PDF',
            descripcion: error.message,
          }),
      },
    );
  return (
    <button
      type="button"
      onClick={descargar}
      disabled={descarga.isPending}
      className={`${claseAccion} campo-vidrio text-texto hover:bg-white hover:text-primario focus-visible:ring-primario/40`}
    >
      {descarga.isPending ? <LoaderCircle aria-hidden className="size-4 animate-spin" /> : <FileDown aria-hidden strokeWidth={1.75} className="size-4" />}
      {descarga.isPending ? 'Generando…' : 'Descargar PDF'}
    </button>
  );
}

interface PropiedadesCabeceraExpediente {
  historia: DetalleHistoria;
  alAnular?: () => void;
}

export function CabeceraExpediente({ historia, alAnular }: PropiedadesCabeceraExpediente) {
  return (
    <CabeceraPaciente
      paciente={cabeceraDeHistoria(historia)}
      alertas={alertasDeHistoria(historia)}
      acciones={
        <>
          <BotonPdf historia={historia} />
          {alAnular && (
            <button
              type="button"
              onClick={alAnular}
              className={`${claseAccion} border border-critico/25 text-critico hover:bg-critico/8 focus-visible:ring-critico/30`}
            >
              <Ban aria-hidden strokeWidth={1.75} className="size-4" />
              Anular
            </button>
          )}
        </>
      }
      detalle={
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[13px] text-texto-secundario">
          <span className="font-medium text-texto tabular-nums">{historia.numeroHistoria}</span>
          {historia.numeroEmergencia && (
            <Link to={rutaIngreso(historia.numeroEmergencia)} className="font-medium text-primario hover:text-primario-hover hover:underline">
              Ingreso {historia.numeroEmergencia}
            </Link>
          )}
          <InsigniaModalidad modalidad={historia.modalidad} />
          <EtiquetaTriage triage={historia.datos.triage} completa />
          <EtiquetaEstadoHistoria estado={historia.estado} />
        </div>
      }
      pie={
        historia.estado === 'cerrada' &&
        historia.cerradaEn && (
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-borde/70 pt-3 text-[13px] text-texto-secundario">
            <FileSignature aria-hidden strokeWidth={1.75} className="size-4 text-exito" />
            Firmado por <span className="font-medium text-texto">{historia.cerradaPor?.nombreCompleto ?? 'Sin dato'}</span>
            <span aria-hidden>·</span>
            <time dateTime={historia.cerradaEn}>{formatearFechaHora(historia.cerradaEn)}</time>
            {historia.hashCierre && (
              <>
                <span aria-hidden>·</span>
                Cód. <span className="font-mono font-medium text-texto">{codigoVerificacion(historia.hashCierre)}</span>
              </>
            )}
          </p>
        )
      }
    />
  );
}
