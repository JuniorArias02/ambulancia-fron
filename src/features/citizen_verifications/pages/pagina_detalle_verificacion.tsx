import { ArrowLeft, History, IdCard, LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { EstadoError } from '../../../components/states/estado_error';
import { RUTAS } from '../../../constants/rutas';
import { useNotificaciones } from '../../../hooks/use_notificaciones';
import type { ErrorApi } from '../../../services/error_api';
import { AccionesVerificacion } from '../components/acciones_verificacion';
import { DatosCiudadano } from '../components/datos_ciudadano';
import { DialogoAprobarVerificacion } from '../components/dialogo_aprobar_verificacion';
import { DialogoMotivoDecision, type DecisionConMotivo } from '../components/dialogo_motivo_decision';
import { FotoDocumento } from '../components/foto_documento';
import { GuiaRevision } from '../components/guia_revision';
import { HistorialVerificacion } from '../components/historial_verificacion';
import { InsigniaEstadoVerificacion } from '../components/insignia_estado_verificacion';
import { ResumenEstadoVerificacion } from '../components/resumen_estado_verificacion';
import { ETIQUETAS_ESTADO_VERIFICACION, LADOS_DOCUMENTO } from '../constants/verificaciones';
import { useDecidirVerificacion } from '../hooks/use_decidir_verificacion';
import { useVerificacion } from '../hooks/use_verificaciones';
import type { DatosDecision, DecisionVerificacion } from '../types/verificacion.types';
import { documentoPorLado } from '../utils/formato_verificacion';

type DialogoActivo = { tipo: 'aprobar' } | { tipo: 'motivo'; decision: DecisionConMotivo };

const MENSAJE_YA_REVISADA = 'Otro administrador ya revisó esta solicitud.';

function EnlaceVolver() {
  return (
    <Link
      to={RUTAS.verificaciones}
      className="inline-flex items-center gap-1.5 rounded-lg text-[13px] font-medium text-texto-secundario transition-colors duration-150 hover:text-primario focus-visible:ring-2 focus-visible:ring-primario/40 focus-visible:outline-none"
    >
      <ArrowLeft aria-hidden strokeWidth={1.75} className="size-4" />
      Verificación de ciudadanos
    </Link>
  );
}

function EsqueletoDetalle() {
  return (
    <div role="status" aria-label="Cargando solicitud" className="animate-pulse space-y-3">
      <div className="vidrio flex items-center gap-4 rounded-2xl px-5 py-6">
        <span className="size-12 rounded-2xl bg-texto-secundario/10" />
        <div className="space-y-2">
          <span className="block h-5 w-48 rounded-full bg-texto-secundario/12" />
          <span className="block h-3 w-32 rounded-full bg-texto-secundario/8" />
        </div>
      </div>
      <div className="grid gap-3 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
        <div className="vidrio h-96 rounded-2xl" />
        <div className="vidrio h-96 rounded-2xl" />
      </div>
    </div>
  );
}

export function PaginaDetalleVerificacion() {
  const { usuarioId = '' } = useParams();
  const navegar = useNavigate();
  const { notificar } = useNotificaciones();
  const consulta = useVerificacion(usuarioId);
  const decision = useDecidirVerificacion(usuarioId);
  const [dialogo, setDialogo] = useState<DialogoActivo | null>(null);

  const cerrarDialogo = () => {
    setDialogo(null);
    decision.reset();
  };

  const decidir = (datos: DatosDecision) =>
    decision.mutate(datos, {
      onSuccess: (actualizada) => {
        setDialogo(null);
        notificar({
          tono: 'exito',
          titulo: datos.decision === 'en_revision' ? 'Solicitud tomada' : 'Decisión guardada',
          descripcion: `${actualizada.nombres} ${actualizada.apellidos}: ${ETIQUETAS_ESTADO_VERIFICACION[actualizada.estado]}.`,
        });
      },
      onError: (error: ErrorApi) => {
        // 409: el detalle se recarga con la decisión del otro administrador.
        if (error.estado === 409) {
          setDialogo(null);
          notificar({ tono: 'informacion', titulo: MENSAJE_YA_REVISADA, descripcion: 'Se cargó su decisión.' });
        } else if (error.estado === 404) {
          notificar({ tono: 'error', titulo: 'La solicitud ya no existe' });
          void navegar(RUTAS.verificaciones, { replace: true });
        } else if (!dialogo) {
          // Sin diálogo abierto (tomar la solicitud), el error se avisa aquí.
          notificar({ tono: 'error', titulo: 'No fue posible tomar la solicitud', descripcion: error.message });
        }
      },
    });

  const alElegir = (elegida: DecisionVerificacion) => {
    decision.reset();
    if (elegida === 'en_revision') decidir({ decision: 'en_revision' });
    else if (elegida === 'verificado') setDialogo({ tipo: 'aprobar' });
    else setDialogo({ tipo: 'motivo', decision: elegida });
  };

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
            titulo={noExiste ? 'Solicitud no encontrada' : 'No fue posible cargar la solicitud'}
            mensaje={noExiste ? 'El enlace no corresponde a un ciudadano registrado.' : consulta.error.message}
            alReintentar={noExiste ? undefined : () => void consulta.refetch()}
            accionSecundaria={{
              etiqueta: 'Volver a la fila',
              alPulsar: () => void navegar(RUTAS.verificaciones),
            }}
          />
        </div>
      </div>
    );
  }

  const verificacion = consulta.data;
  const errorDialogo = decision.error && decision.error.estado !== 409 ? decision.error : null;

  return (
    <div className="min-h-0 flex-1 space-y-3 overflow-y-auto">
      <section aria-labelledby="titulo-verificacion" className="vidrio rounded-2xl px-5 pt-4 pb-5">
        <EnlaceVolver />
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <span
              aria-hidden
              className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-cian/12 text-cian-texto"
            >
              <IdCard strokeWidth={1.75} className="size-6" />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <h2 id="titulo-verificacion" className="truncate text-2xl font-semibold tracking-tight text-texto">
                  {verificacion.nombres} {verificacion.apellidos}
                </h2>
                <InsigniaEstadoVerificacion estado={verificacion.estado} />
                {consulta.isFetching && (
                  <LoaderCircle aria-label="Actualizando" className="size-4 animate-spin text-texto-secundario" />
                )}
              </div>
              <p className="mt-1 text-sm text-texto-secundario">Revisión de identidad del ciudadano</p>
            </div>
          </div>
          <AccionesVerificacion
            estado={verificacion.estado}
            tomando={decision.isPending && decision.variables.decision === 'en_revision'}
            deshabilitadas={decision.isPending || consulta.isFetching}
            alDecidir={alElegir}
          />
        </div>
        <div className="mt-4">
          <ResumenEstadoVerificacion verificacion={verificacion} />
        </div>
      </section>

      {/* Datos a la izquierda y fotos a la derecha, para compararlos a simple vista. */}
      <div className="grid gap-3 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:items-start">
        <section aria-labelledby="titulo-datos" className="vidrio rounded-2xl">
          <h3 id="titulo-datos" className="border-b border-borde/70 px-5 py-4 text-base font-semibold text-texto">
            Datos registrados
          </h3>
          <DatosCiudadano verificacion={verificacion} />
        </section>

        <div className="space-y-3">
          <section aria-labelledby="titulo-fotos" className="vidrio-fuerte rounded-2xl">
            <h3 id="titulo-fotos" className="border-b border-borde/70 px-5 py-4 text-base font-semibold text-texto">
              Fotos del documento
            </h3>
            <div className="grid gap-4 p-5 xl:grid-cols-2">
              {LADOS_DOCUMENTO.map((lado) => (
                <FotoDocumento
                  key={lado}
                  usuarioId={verificacion.usuarioId}
                  lado={lado}
                  documento={documentoPorLado(verificacion.documentos, lado)}
                />
              ))}
            </div>
          </section>
          <GuiaRevision />
        </div>
      </div>

      <section aria-labelledby="titulo-historial" className="vidrio rounded-2xl">
        <header className="flex items-center gap-2 border-b border-borde/70 px-5 py-4">
          <History aria-hidden strokeWidth={1.75} className="size-[18px] text-texto-secundario" />
          <h3 id="titulo-historial" className="text-base font-semibold text-texto">
            Historial
          </h3>
        </header>
        <HistorialVerificacion historial={verificacion.historial} usuarioId={verificacion.usuarioId} />
      </section>

      {dialogo?.tipo === 'aprobar' && (
        <DialogoAprobarVerificacion
          verificacion={verificacion}
          enviando={decision.isPending}
          error={errorDialogo}
          alConfirmar={() => decidir({ decision: 'verificado' })}
          alCerrar={cerrarDialogo}
        />
      )}
      {dialogo?.tipo === 'motivo' && (
        <DialogoMotivoDecision
          decision={dialogo.decision}
          verificacion={verificacion}
          enviando={decision.isPending}
          error={errorDialogo}
          alEnviar={(datos) => decidir({ decision: dialogo.decision, ...datos })}
          alCerrar={cerrarDialogo}
        />
      )}
    </div>
  );
}
