import { Ban, Eye, EyeOff, MessageSquareText, Signature, Smartphone } from 'lucide-react';
import { useState } from 'react';
import { EstadoError } from '../../../components/states/estado_error';
import { Dialogo } from '../../../components/ui/dialogo';
import { formatearFechaHora } from '../../../utils/formato_fecha';
import { useFirmasUsuario } from '../hooks/use_firmas';
import type { FirmaUsuario } from '../types/firma.types';
import type { Usuario } from '../types/usuario.types';
import { FormularioDesactivarFirma } from './formulario_desactivar_firma';
import { ImagenFirma } from './imagen_firma';
import { InsigniaEstadoFirma } from './insignia_estado_firma';

interface PropiedadesPanelFirmaUsuario {
  usuario: Usuario;
  alCerrar: () => void;
}

const claseTituloSeccion = 'text-sm font-semibold text-texto';

function Fecha({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <span>
      {etiqueta} <time dateTime={valor}>{formatearFechaHora(valor)}</time>
    </span>
  );
}

function SinFirmaVigente() {
  return (
    <div className="flex gap-3 rounded-2xl border border-dashed border-borde px-4 py-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-advertencia/10 text-advertencia">
        <Signature aria-hidden strokeWidth={1.75} className="size-5" />
      </span>
      <div className="space-y-1">
        <p className="text-sm font-medium text-texto">No tiene firma registrada</p>
        <p className="flex items-start gap-1.5 text-[13px] text-texto-secundario">
          <Smartphone aria-hidden strokeWidth={1.75} className="mt-0.5 size-3.5 shrink-0" />
          <span>
            Debe registrarla desde la app móvil (Perfil → Mi firma). Hasta entonces no podrá cerrar historias
            clínicas.
          </span>
        </p>
      </div>
    </div>
  );
}

function VersionAnterior({ firma, nombreCompleto }: { firma: FirmaUsuario; nombreCompleto: string }) {
  const [viendo, setViendo] = useState(false);
  const IconoVer = viendo ? EyeOff : Eye;

  return (
    <li className="space-y-3 py-4 first:pt-0 last:pb-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1.5">
          <InsigniaEstadoFirma estado={firma.estado} />
          <p className="flex flex-col text-[13px] text-texto-secundario">
            <Fecha etiqueta="Registrada el" valor={firma.registradaEn} />
            {firma.reemplazadaEn && <Fecha etiqueta="Reemplazada el" valor={firma.reemplazadaEn} />}
            {firma.desactivadaEn && <Fecha etiqueta="Desactivada el" valor={firma.desactivadaEn} />}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setViendo((actual) => !actual)}
          aria-expanded={viendo}
          className="campo-vidrio inline-flex h-9 shrink-0 items-center gap-2 rounded-xl px-3 text-[13px] font-medium text-texto transition-colors duration-150 hover:bg-white hover:text-primario"
        >
          <IconoVer aria-hidden strokeWidth={1.75} className="size-4" />
          {viendo ? 'Ocultar' : 'Ver'}
        </button>
      </div>
      {firma.motivoDesactivacion && (
        <p className="flex gap-2 rounded-xl bg-white/60 px-3 py-2 text-[13px] text-texto">
          <MessageSquareText
            aria-hidden
            strokeWidth={1.75}
            className="mt-0.5 size-3.5 shrink-0 text-texto-secundario"
          />
          <span>
            <span className="font-medium">Motivo:</span> {firma.motivoDesactivacion}
          </span>
        </p>
      )}
      {viendo && (
        <ImagenFirma
          firma={firma}
          descripcion={`Firma de ${nombreCompleto} registrada el ${formatearFechaHora(firma.registradaEn)}`}
        />
      )}
    </li>
  );
}

function EsqueletoFirmas() {
  return (
    <div role="status" className="space-y-4 px-6 py-6">
      <span className="sr-only">Cargando firmas…</span>
      <div className="h-4 w-28 animate-pulse rounded bg-borde/50" />
      <div className="h-36 animate-pulse rounded-xl bg-borde/30" />
      <div className="h-4 w-40 animate-pulse rounded bg-borde/50" />
    </div>
  );
}

/**
 * Firma del profesional para cerrar historias clínicas. El administrador la consulta y puede
 * desactivarla, pero nunca subirla ni cambiarla: solo el dueño la registra desde la app.
 */
export function PanelFirmaUsuario({ usuario, alCerrar }: PropiedadesPanelFirmaUsuario) {
  const firmas = useFirmasUsuario(usuario.id);
  const [desactivando, setDesactivando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const nombreCompleto = `${usuario.nombres} ${usuario.apellidos}`;

  const vigente = firmas.data?.find((firma) => firma.estado === 'vigente');
  const anteriores = firmas.data?.filter((firma) => firma.estado !== 'vigente') ?? [];

  return (
    <Dialogo
      abierto
      variante="lateral"
      titulo="Firma"
      descripcion={`${nombreCompleto} · ${usuario.correo}`}
      cerrable={!enviando}
      alCerrar={alCerrar}
    >
      {firmas.isPending ? (
        <EsqueletoFirmas />
      ) : firmas.isError ? (
        <EstadoError
          titulo="No fue posible cargar las firmas"
          mensaje={firmas.error.message}
          alReintentar={() => void firmas.refetch()}
        />
      ) : (
        <div className="space-y-8 px-6 py-6">
          <section aria-labelledby="titulo-firma-vigente" className="space-y-3">
            <h3 id="titulo-firma-vigente" className={claseTituloSeccion}>
              Firma vigente
            </h3>
            {vigente ? (
              <div className="space-y-3">
                <ImagenFirma
                  firma={vigente}
                  descripcion={`Firma vigente de ${nombreCompleto}, registrada el ${formatearFechaHora(vigente.registradaEn)}`}
                />
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-[13px] text-texto-secundario">
                    <Fecha etiqueta="Registrada el" valor={vigente.registradaEn} />. Se estampa al cerrar cada
                    historia.
                  </p>
                  {!desactivando && (
                    <button
                      type="button"
                      onClick={() => setDesactivando(true)}
                      className="inline-flex h-9 items-center gap-2 rounded-xl border border-critico/25 px-3 text-[13px] font-medium text-critico transition-colors duration-150 hover:bg-critico/8 focus-visible:ring-2 focus-visible:ring-critico/30 focus-visible:outline-none"
                    >
                      <Ban aria-hidden strokeWidth={1.75} className="size-4" />
                      Desactivar
                    </button>
                  )}
                </div>
                {desactivando && (
                  <FormularioDesactivarFirma
                    key={vigente.id}
                    firma={vigente}
                    nombreCompleto={nombreCompleto}
                    alTerminar={() => setDesactivando(false)}
                    alCancelar={() => setDesactivando(false)}
                    alCambiarEnvio={setEnviando}
                  />
                )}
              </div>
            ) : (
              <SinFirmaVigente />
            )}
          </section>

          <section aria-labelledby="titulo-historial-firmas" className="space-y-3">
            <h3 id="titulo-historial-firmas" className={claseTituloSeccion}>
              Versiones anteriores
            </h3>
            {anteriores.length === 0 ? (
              <p className="text-[13px] text-texto-secundario">Sin versiones anteriores.</p>
            ) : (
              <ul className="divide-y divide-borde/60">
                {anteriores.map((firma) => (
                  <VersionAnterior key={firma.id} firma={firma} nombreCompleto={nombreCompleto} />
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </Dialogo>
  );
}
