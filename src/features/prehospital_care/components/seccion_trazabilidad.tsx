import { Ban, Eye, FilePlus2, FileSignature, LoaderCircle, Pencil, ShieldX, type LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { Paginacion } from '../../../components/data/paginacion';
import { AlertaError } from '../../../components/feedback/alerta_error';
import { ETIQUETAS_FUNCION, ETIQUETAS_PROPOSITO_FIRMA, LIMITE_TRAZABILIDAD, PROPOSITOS_FIRMA } from '../constants/catalogos_clinicos';
import { useTrazabilidad } from '../hooks/use_historias';
import type { EventoTrazabilidad, TipoAccionHistoria } from '../types/historia_clinica.types';
import { codigoVerificacion, etiquetaCampo, formatearFechaHora } from '../utils/formato_clinico';
import { LineaTiempo, type ElementoLinea, type TonoLinea } from './linea_tiempo';

const ESTILO_TIPO: Record<TipoAccionHistoria, { tono: TonoLinea; icono: LucideIcon }> = {
  creacion: { tono: 'primario', icono: FilePlus2 },
  modificacion: { tono: 'neutro', icono: Pencil },
  firma: { tono: 'exito', icono: FileSignature },
  anulacion: { tono: 'critico', icono: Ban },
  consulta: { tono: 'tenue', icono: Eye },
};

const esProposito = (valor: string): valor is (typeof PROPOSITOS_FIRMA)[number] => PROPOSITOS_FIRMA.some((p) => p === valor);

const ETIQUETAS_ROL: Record<string, string> = { ...ETIQUETAS_FUNCION, administrador: 'Administrador', despachador: 'Despachador' };

/** El detalle solo trae qué cambió, nunca valores clínicos. */
function DetalleEvento({ detalle }: { detalle: Record<string, unknown> }) {
  const campos = Array.isArray(detalle.campos) ? detalle.campos.filter((campo): campo is string => typeof campo === 'string') : [];
  const motivo = typeof detalle.motivo === 'string' ? detalle.motivo : null;
  const hash = typeof detalle.hashCierre === 'string' ? detalle.hashCierre : null;
  const proposito = typeof detalle.proposito === 'string' ? detalle.proposito : null;
  const conImagen = typeof detalle.conImagen === 'boolean' ? detalle.conImagen : null;
  if (campos.length === 0 && !motivo && !hash && !proposito) return null;
  return (
    <div className="space-y-1 text-[13px] text-texto">
      {campos.length > 0 && (
        <p>
          <span className="text-texto-secundario">Cambió: </span>
          {campos.map(etiquetaCampo).join(', ')}
        </p>
      )}
      {motivo && (
        <p className="rounded-lg bg-critico/6 px-2.5 py-1.5">
          <span className="font-medium">Motivo: </span>
          {motivo}
        </p>
      )}
      {proposito && (
        <p>
          <span className="text-texto-secundario">Firma: </span>
          {esProposito(proposito) ? ETIQUETAS_PROPOSITO_FIRMA[proposito] : proposito}
          {conImagen !== null && (conImagen ? ' · con imagen' : ' · sin imagen (no firmó)')}
        </p>
      )}
      {hash && (
        <p>
          <span className="text-texto-secundario">Código de verificación: </span>
          <span className="font-mono font-medium">{codigoVerificacion(hash)}</span>
        </p>
      )}
    </div>
  );
}

function aElemento(evento: EventoTrazabilidad): ElementoLinea {
  const rechazo = evento.accion === 'firma_rechazada';
  const estilo = ESTILO_TIPO[evento.tipo];
  const usuario = evento.usuario?.nombreCompleto ?? 'Usuario sin nombre';
  const rol = evento.usuario?.rol ? ` (${ETIQUETAS_ROL[evento.usuario.rol] ?? evento.usuario.rol})` : '';
  return {
    id: evento.id,
    instante: evento.ocurridoEn,
    hora: formatearFechaHora(evento.ocurridoEn, true),
    // La descripción la arma el backend: no se traduce la acción por cuenta propia.
    titulo: evento.descripcion,
    subtitulo: `${usuario}${rol}${evento.direccionIp ? ` · IP ${evento.direccionIp}` : ''}`,
    contenido: <DetalleEvento detalle={evento.detalle} />,
    tono: rechazo ? 'critico' : estilo.tono,
    icono: rechazo ? ShieldX : estilo.icono,
  };
}

/** Se pide solo al abrir la pestaña. Las consultas se ocultan por defecto: son muchas y tapan los cambios. */
export function SeccionTrazabilidad({ historiaId }: { historiaId: string }) {
  const [pagina, setPagina] = useState(1);
  const [ocultarConsultas, setOcultarConsultas] = useState(true);
  const trazabilidad = useTrazabilidad(historiaId, pagina, LIMITE_TRAZABILIDAD, true);

  if (trazabilidad.isPending) {
    return (
      <p role="status" className="flex items-center gap-2 text-sm text-texto-secundario">
        <LoaderCircle aria-hidden className="size-4 animate-spin" />
        Cargando la trazabilidad…
      </p>
    );
  }
  if (trazabilidad.isError) return <AlertaError error={trazabilidad.error} />;

  const { datos, total, limite } = trazabilidad.data;
  const visibles = ocultarConsultas ? datos.filter((evento) => evento.tipo !== 'consulta') : datos;
  const ocultas = datos.length - visibles.length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm text-texto">
          <input
            type="checkbox"
            checked={ocultarConsultas}
            onChange={(evento) => setOcultarConsultas(evento.target.checked)}
            className="size-4 rounded border-borde accent-primario"
          />
          Ocultar consultas
        </label>
        <p className="text-[13px] text-texto-secundario">
          {total} {total === 1 ? 'evento' : 'eventos'}
          {ocultas > 0 && ` · ${ocultas} ${ocultas === 1 ? 'consulta oculta' : 'consultas ocultas'} en esta página`}
        </p>
      </div>
      {visibles.length === 0 ? (
        <p className="text-sm text-texto-secundario">No hay cambios en esta página: solo consultas.</p>
      ) : (
        <LineaTiempo etiqueta="Trazabilidad de la historia" elementos={visibles.map(aElemento)} />
      )}
      {total > limite && (
        <Paginacion pagina={pagina} limite={limite} total={total} deshabilitada={trazabilidad.isFetching} alCambiarPagina={setPagina} />
      )}
    </div>
  );
}
