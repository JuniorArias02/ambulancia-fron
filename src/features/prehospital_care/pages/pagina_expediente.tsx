import {
  Activity,
  ArrowLeft,
  Bandage,
  ClipboardList,
  FileSignature,
  FileText,
  HandHelping,
  History,
  Info,
  Route,
  Stethoscope,
  Syringe,
  TriangleAlert,
  UserRound,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router';
import { EstadoError } from '../../../components/states/estado_error';
import { RUTAS } from '../../../constants/rutas';
import { CabeceraExpediente } from '../components/cabecera_paciente';
import { DialogoAnularHistoria } from '../components/dialogo_anular_historia';
import { Pestanas, type Pestana } from '../components/pestanas';
import { SeccionFirmas } from '../components/seccion_firmas';
import { SeccionServicio } from '../components/seccion_servicio';
import { SeccionSignosVitales } from '../components/seccion_signos_vitales';
import { SeccionTrazabilidad } from '../components/seccion_trazabilidad';
import { SeccionEntrega, SeccionPaciente, SeccionResumen, SeccionValoracion } from '../components/secciones_datos';
import { SeccionDownton, SeccionIntervenciones, SeccionLesiones } from '../components/secciones_registros';
import { ETIQUETAS_FALTANTE } from '../constants/catalogos_clinicos';
import { useHistoria } from '../hooks/use_historias';
import type { DetalleHistoria } from '../types/historia_clinica.types';
import { etiquetaCampo } from '../utils/formato_clinico';
import { idPestana } from '../utils/ids_pestanas';

const PESTANAS = [
  'resumen',
  'paciente',
  'valoracion',
  'signos',
  'lesiones',
  'intervenciones',
  'caidas',
  'entrega',
  'firma',
  'servicio',
  'trazabilidad',
] as const;

type ClavePestana = (typeof PESTANAS)[number];

function pestanasDe(historia: DetalleHistoria): Pestana<ClavePestana>[] {
  return [
    { valor: 'resumen', texto: 'Resumen', icono: FileText },
    { valor: 'paciente', texto: 'Paciente', icono: UserRound },
    { valor: 'valoracion', texto: 'Valoración', icono: Stethoscope },
    { valor: 'signos', texto: 'Signos vitales', icono: Activity, cantidad: historia.signosVitales.length },
    { valor: 'lesiones', texto: 'Lesiones', icono: Bandage, cantidad: historia.lesiones.length },
    { valor: 'intervenciones', texto: 'Intervenciones', icono: Syringe, cantidad: historia.intervenciones.length },
    { valor: 'caidas', texto: 'Riesgo de caídas', icono: TriangleAlert, cantidad: historia.valoracionesDownton.length },
    { valor: 'entrega', texto: 'Entrega', icono: HandHelping },
    { valor: 'firma', texto: 'Firmas', icono: FileSignature, cantidad: historia.firmasHistoria.length },
    { valor: 'servicio', texto: 'Servicio', icono: Route },
    { valor: 'trazabilidad', texto: 'Trazabilidad', icono: History },
  ];
}

function ContenidoPestana({ pestana, historia }: { pestana: ClavePestana; historia: DetalleHistoria }) {
  switch (pestana) {
    case 'resumen':
      return <SeccionResumen datos={historia.datos} />;
    case 'paciente':
      return <SeccionPaciente datos={historia.datos} />;
    case 'valoracion':
      return <SeccionValoracion datos={historia.datos} />;
    case 'signos':
      return <SeccionSignosVitales signos={historia.signosVitales} />;
    case 'lesiones':
      return <SeccionLesiones lesiones={historia.lesiones} />;
    case 'intervenciones':
      return <SeccionIntervenciones intervenciones={historia.intervenciones} />;
    case 'caidas':
      return <SeccionDownton valoraciones={historia.valoracionesDownton} />;
    case 'entrega':
      return <SeccionEntrega historia={historia} />;
    case 'firma':
      return <SeccionFirmas historia={historia} />;
    case 'servicio':
      return <SeccionServicio numeroEmergencia={historia.numeroEmergencia} />;
    case 'trazabilidad':
      return <SeccionTrazabilidad historiaId={historia.id} />;
  }
}

function EnlaceBandeja() {
  return (
    <Link
      to={RUTAS.historiasClinicas}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-texto-secundario transition-colors hover:text-primario"
    >
      <ArrowLeft aria-hidden strokeWidth={1.75} className="size-4" />
      Historias clínicas
    </Link>
  );
}

function Esqueleto() {
  return (
    <div role="status" className="space-y-4">
      <span className="sr-only">Cargando la historia…</span>
      <div className="h-36 animate-pulse rounded-2xl bg-white/60" />
      <div className="h-11 animate-pulse rounded-xl bg-white/50" />
      <div className="h-64 animate-pulse rounded-2xl bg-white/50" />
    </div>
  );
}

/** Expediente de solo lectura: cada apertura queda auditada en el backend. */
export function PaginaExpediente() {
  const { id = '' } = useParams();
  const historia = useHistoria(id);
  const [parametros, setParametros] = useSearchParams();
  const [anulando, setAnulando] = useState(false);
  const pestana = PESTANAS.find((valor) => valor === parametros.get('pestana')) ?? 'resumen';
  const idPanel = 'panel-expediente';

  const cambiarPestana = (valor: ClavePestana) =>
    setParametros(valor === 'resumen' ? {} : { pestana: valor }, { replace: true });

  if (historia.isPending) {
    return (
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto">
        <EnlaceBandeja />
        <Esqueleto />
      </div>
    );
  }

  if (historia.isError) {
    const noExiste = historia.error.estado === 404;
    return (
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto">
        <EnlaceBandeja />
        <section className="vidrio rounded-2xl">
          <EstadoError
            titulo={
              noExiste
                ? 'Historia no encontrada'
                : historia.error.estado === 403
                  ? 'No tienes permiso para ver historias clínicas'
                  : 'No fue posible abrir la historia'
            }
            mensaje={historia.error.message}
            alReintentar={noExiste ? undefined : () => void historia.refetch()}
          />
        </section>
      </div>
    );
  }

  const detalle = historia.data;
  const faltantes = detalle.faltantesParaCerrar.map((campo) => ETIQUETAS_FALTANTE[campo] ?? etiquetaCampo(campo));

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="space-y-4 pb-6">
        <EnlaceBandeja />

        {detalle.estado === 'anulada' && (
          <p role="note" className="flex items-center gap-2 rounded-2xl bg-texto-secundario/12 px-5 py-3 text-sm font-semibold text-texto">
            <ClipboardList aria-hidden strokeWidth={1.75} className="size-4" />
            Historia anulada. El motivo está en la pestaña Trazabilidad.
          </p>
        )}

        <CabeceraExpediente historia={detalle} alAnular={detalle.estado === 'anulada' ? undefined : () => setAnulando(true)} />

        {detalle.estado === 'borrador' && (
          <div role="note" className="flex gap-3 rounded-2xl border border-primario/20 bg-primario/6 px-5 py-3 text-sm text-texto">
            <Info aria-hidden strokeWidth={1.75} className="mt-0.5 size-4 shrink-0 text-primario" />
            <div>
              <p className="font-medium">La atención no ha terminado; los datos pueden cambiar.</p>
              {faltantes.length > 0 && <p className="mt-0.5 text-[13px] text-texto-secundario">Falta para cerrar: {faltantes.join(', ')}.</p>}
            </div>
          </div>
        )}

        <section className="vidrio rounded-2xl">
          <Pestanas etiqueta="Secciones de la historia" pestanas={pestanasDe(detalle)} activa={pestana} idPanel={idPanel} alCambiar={cambiarPestana} />
          <div id={idPanel} role="tabpanel" aria-labelledby={idPestana(pestana)} tabIndex={0} className="px-5 py-6 focus:outline-none">
            <ContenidoPestana pestana={pestana} historia={detalle} />
          </div>
        </section>
      </div>

      {anulando && (
        <DialogoAnularHistoria historiaId={detalle.id} numeroHistoria={detalle.numeroHistoria} alCerrar={() => setAnulando(false)} />
      )}
    </div>
  );
}
