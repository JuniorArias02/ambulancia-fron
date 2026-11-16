import { Ban, ImageOff, PenOff, RotateCw, TriangleAlert } from 'lucide-react';
import { useImagenProtegida } from '../../../hooks/use_imagen_protegida';
import {
  ETIQUETAS_MOTIVO_SIN_FIRMA,
  ETIQUETAS_PARENTESCO,
  ETIQUETAS_ROL_FIRMANTE,
} from '../constants/catalogos_clinicos';
import { useCatalogosClinicos } from '../hooks/use_historias';
import { obtenerImagenFirmaHistoria } from '../services/historias.service';
import type { DetalleHistoria, FirmaHistoria, PropositoFirma } from '../types/historia_clinica.types';
import { formatearFechaHora } from '../utils/formato_clinico';
import { BloqueFirma } from './bloque_firma';
import { Bloque, ValorODato } from './valor_o_dato';

/** Se descarga con el token al abrir la pestaña y se libera al salir; cada consulta queda auditada. */
function ImagenFirmaHistoria({ historiaId, firma }: { historiaId: string; firma: FirmaHistoria }) {
  const imagen = useImagenProtegida(`historia/${historiaId}/${firma.id}`, (senal) =>
    obtenerImagenFirmaHistoria(historiaId, firma.id, senal),
  );
  return (
    <div className="flex h-[100px] w-[300px] max-w-full shrink-0 items-center justify-center overflow-hidden rounded-xl border border-borde/80 bg-white">
      {imagen.estado === 'cargando' && (
        <div role="status" className="size-full animate-pulse bg-borde/30">
          <span className="sr-only">Cargando firma…</span>
        </div>
      )}
      {imagen.estado === 'error' && (
        <div role="alert" className="flex items-center gap-2 px-3 text-center text-[13px] text-texto-secundario">
          <ImageOff aria-hidden strokeWidth={1.75} className="size-4 shrink-0" />
          {imagen.error.estado === 404 ? 'Imagen no disponible' : imagen.error.message}
          <button
            type="button"
            onClick={imagen.reintentar}
            aria-label="Reintentar"
            title="Reintentar"
            className="rounded-md p-1 text-primario hover:bg-primario/8"
          >
            <RotateCw aria-hidden strokeWidth={1.75} className="size-3.5" />
          </button>
        </div>
      )}
      {imagen.estado === 'lista' && (
        <img
          src={imagen.url}
          alt={`Firma de ${firma.nombreFirmante ?? ETIQUETAS_ROL_FIRMANTE[firma.rolFirmante] ?? 'el firmante'}`}
          draggable={false}
          className="size-full object-contain p-2"
        />
      )}
    </div>
  );
}

function TarjetaFirma({ historiaId, firma, texto }: { historiaId: string; firma: FirmaHistoria; texto: string | null }) {
  const rol = ETIQUETAS_ROL_FIRMANTE[firma.rolFirmante] ?? firma.rolFirmante;
  const documento = [firma.tipoDocumento, firma.numeroDocumento].filter(Boolean).join(' ');
  const relacion =
    firma.rolFirmante === 'acudiente' && firma.parentesco
      ? (ETIQUETAS_PARENTESCO[firma.parentesco] ?? firma.parentesco)
      : firma.rolFirmante === 'receptor'
        ? firma.cargo
        : null;

  return (
    <li className="flex flex-col gap-4 rounded-2xl border border-borde/70 bg-white/70 p-4 sm:flex-row">
      {firma.imagen ? (
        <ImagenFirmaHistoria historiaId={historiaId} firma={firma} />
      ) : (
        <div className="flex h-[100px] w-[300px] max-w-full shrink-0 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-borde px-3 text-center text-[13px] text-texto-secundario">
          <PenOff aria-hidden strokeWidth={1.75} className="size-4" />
          No firmó: {firma.motivoSinFirma ? (ETIQUETAS_MOTIVO_SIN_FIRMA[firma.motivoSinFirma] ?? firma.motivoSinFirma) : 'sin motivo'}
          {firma.detalleMotivo && <span className="text-texto">{firma.detalleMotivo}</span>}
        </div>
      )}
      <div className="min-w-0 flex-1 space-y-2">
        <div>
          <p className="text-[13px] font-medium text-texto-secundario">{rol}</p>
          <p className="text-sm font-semibold text-texto">
            <ValorODato valor={firma.nombreFirmante} />
          </p>
          <p className="text-[13px] text-texto-secundario">{[documento, relacion].filter(Boolean).join(' · ') || 'Sin documento'}</p>
        </div>
        <p className="text-[13px] text-texto-secundario">
          <time dateTime={firma.firmadaEn}>{formatearFechaHora(firma.firmadaEn)}</time> · Tomada por{' '}
          {firma.registradaPor.nombreCompleto ?? 'sin dato'}
        </p>
        {firma.imagen && texto && (
          <blockquote className="border-l-2 border-borde pl-3 text-[13px] text-texto italic">
            “{texto}” <span className="not-italic text-texto-secundario">(texto {firma.textoVersion})</span>
          </blockquote>
        )}
      </div>
    </li>
  );
}

interface PropiedadesGrupoFirmas {
  historiaId: string;
  firmas: readonly FirmaHistoria[];
  /** Texto que aceptó el firmante, según la versión vigente del catálogo. */
  texto: (firma: FirmaHistoria) => string | null;
  vacio: string;
}

function GrupoFirmas({ historiaId, firmas, texto, vacio }: PropiedadesGrupoFirmas) {
  if (firmas.length === 0) return <p className="text-sm text-texto-secundario">{vacio}</p>;
  return (
    <ul className="space-y-3">
      {firmas.map((firma) => (
        <TarjetaFirma key={firma.id} historiaId={historiaId} firma={firma} texto={texto(firma)} />
      ))}
    </ul>
  );
}

/** El profesional, el comprobante, el disentimiento (con el testigo) y la entrega, en ese orden. */
export function SeccionFirmas({ historia }: { historia: DetalleHistoria }) {
  const catalogos = useCatalogosClinicos();
  const de = (proposito: PropositoFirma) => historia.firmasHistoria.filter((firma) => firma.proposito === proposito);
  // Si la versión que aceptó cambió en el catálogo, no se muestra un texto distinto al que firmó.
  const texto = (firma: FirmaHistoria) => {
    const vigente = catalogos.data?.textosFirma[firma.proposito];
    return vigente && vigente.version === firma.textoVersion ? vigente.texto : null;
  };
  const disentimiento = de('disentimiento');
  const conRechazo = historia.datos.desenlace === 'rechazo_traslado' || disentimiento.length > 0;
  const faltantesFirma =
    historia.estado === 'borrador' ? historia.faltantesParaCerrar.filter((faltante) => faltante.toLowerCase().includes('firma')) : [];

  return (
    <div className="space-y-8">
      {faltantesFirma.length > 0 && (
        <div role="note" className="rounded-2xl border border-advertencia/25 bg-advertencia/8 px-5 py-3 text-sm text-texto">
          <p className="flex items-center gap-2 font-medium">
            <TriangleAlert aria-hidden strokeWidth={1.75} className="size-4 text-advertencia" />
            Faltan firmas para cerrar la historia
          </p>
          <ul className="mt-1.5 list-disc space-y-0.5 pl-6 text-[13px]">
            {faltantesFirma.map((faltante) => (
              <li key={faltante}>{faltante.charAt(0).toUpperCase() + faltante.slice(1)}</li>
            ))}
          </ul>
        </div>
      )}

      <Bloque titulo="Profesional">
        <BloqueFirma historia={historia} />
      </Bloque>

      <Bloque titulo="Comprobante de atención">
        <GrupoFirmas
          historiaId={historia.id}
          firmas={de('comprobante_atencion')}
          texto={texto}
          vacio="El paciente o un familiar no firmaron el comprobante."
        />
      </Bloque>

      {conRechazo && (
        <section className="space-y-4 rounded-2xl border border-critico/25 bg-critico/5 p-5">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-critico">
            <Ban aria-hidden strokeWidth={2} className="size-4" />
            Disentimiento: rechazo del traslado
          </h3>
          <p className="text-sm whitespace-pre-line text-texto">
            <span className="text-texto-secundario">Motivo del rechazo: </span>
            <ValorODato valor={historia.datos.motivoRechazo} />
          </p>
          <GrupoFirmas historiaId={historia.id} firmas={disentimiento} texto={texto} vacio="Sin firmas del disentimiento." />
        </section>
      )}

      <Bloque titulo="Entrega">
        <GrupoFirmas historiaId={historia.id} firmas={de('entrega')} texto={texto} vacio="Sin firma de quien recibe al paciente." />
      </Bloque>
    </div>
  );
}
