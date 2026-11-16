import { ArrowLeft, ArrowRight, ClipboardList, Hospital } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router';
import { EstadoError } from '../../../components/states/estado_error';
import { ETIQUETAS_MODALIDAD } from '../../../constants/modalidades_servicio';
import { RUTAS } from '../../../constants/rutas';
import { CabeceraPaciente } from '../components/cabecera_paciente';
import { EtiquetaDesenlace, EtiquetaEstadoHistoria, EtiquetaTriage } from '../components/etiquetas';
import { LineaTiempo, type ElementoLinea } from '../components/linea_tiempo';
import { Bloque } from '../components/valor_o_dato';
import { DIAS_MAXIMOS_RANGO } from '../constants/catalogos_clinicos';
import { useFichaPaciente } from '../hooks/use_historias';
import { useTextosBusqueda } from '../providers/contexto_busqueda';
import type { DatoReunido, FichaPaciente, ResumenHistoria } from '../types/historia_clinica.types';
import type { AlertaHistoria } from '../utils/alertas_historia';
import { cabeceraDePaciente } from '../utils/datos_cabecera';
import { formatearFecha, formatearFechaHora } from '../utils/formato_clinico';
import { diaColombia, sumarDias } from '../utils/rangos_fecha';
import { rutaExpediente, rutaIngreso } from '../utils/rutas_historias';

const claseEnlace = 'font-medium text-primario hover:text-primario-hover hover:underline';

function alertasDeFicha({ alergias, ultimoRiesgoCaida }: FichaPaciente): AlertaHistoria[] {
  const alertas: AlertaHistoria[] = alergias.map((alergia) => ({
    clase: 'alergias',
    titulo: 'Alergia',
    detalle: alergia.valor,
    tono: 'critico',
  }));
  if (ultimoRiesgoCaida?.nivelRiesgo === 'alto') {
    alertas.push({
      clase: 'riesgo_caida',
      titulo: 'Riesgo de caída ALTO',
      detalle: `${formatearFecha(ultimoRiesgoCaida.evaluadaEn)} (${ultimoRiesgoCaida.numeroHistoria})`,
      tono: 'advertencia',
    });
  }
  return alertas;
}

/** Cada dato con la historia de donde salió: sin repetir, del más reciente al más antiguo. */
function ListaReunida({ titulo, datos }: { titulo: string; datos: readonly DatoReunido[] }) {
  return (
    <Bloque titulo={titulo}>
      {datos.length === 0 ? (
        <p className="text-sm text-texto-secundario">Sin dato en sus historias.</p>
      ) : (
        <ul className="space-y-2.5">
          {datos.map((dato) => (
            <li key={`${dato.historiaId}-${dato.valor}`} className="text-sm">
              <p className="break-words text-texto">{dato.valor}</p>
              <p className="text-xs text-texto-secundario">
                según{' '}
                <Link to={rutaExpediente(dato.historiaId)} className={claseEnlace}>
                  {dato.numeroHistoria}
                </Link>
                , {formatearFecha(dato.fecha)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Bloque>
  );
}

function elementoAtencion(historia: ResumenHistoria): ElementoLinea {
  const anulada = historia.estado === 'anulada';
  return {
    id: historia.id,
    instante: historia.abiertaEn,
    hora: formatearFechaHora(historia.abiertaEn),
    titulo: (
      <span className={anulada ? 'line-through opacity-70' : undefined}>
        <Link to={rutaExpediente(historia.id)} className={claseEnlace}>
          {historia.numeroHistoria}
        </Link>
        {' · '}
        <Link to={rutaIngreso(historia.ingreso.numeroEmergencia)} className={`text-[13px] ${claseEnlace}`}>
          {historia.ingreso.numeroEmergencia}
        </Link>
      </span>
    ),
    subtitulo: ETIQUETAS_MODALIDAD[historia.ingreso.modalidad],
    contenido: (
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <EtiquetaTriage triage={historia.triage} />
        <EtiquetaDesenlace desenlace={historia.desenlace} />
        {historia.institucionDestino && (
          <span className="inline-flex items-center gap-1.5 text-[13px] text-texto-secundario">
            <Hospital aria-hidden strokeWidth={1.75} className="size-3.5" />
            {historia.institucionDestino.nombre}
          </span>
        )}
        <EtiquetaEstadoHistoria estado={historia.estado} />
      </div>
    ),
    tono: anulada ? 'tenue' : historia.estado === 'cerrada' ? 'exito' : 'primario',
    icono: ClipboardList,
  };
}

/** Rango que cubre sus atenciones sin pasar del máximo que acepta la bandeja. */
function rangoDeAtenciones(atenciones: readonly ResumenHistoria[]) {
  const hoy = diaColombia(new Date());
  const limite = sumarDias(hoy, -(DIAS_MAXIMOS_RANGO - 1));
  const primera = atenciones.reduce<string | null>((menor, historia) => {
    const dia = diaColombia(new Date(historia.abiertaEn));
    return menor === null || dia < menor ? dia : menor;
  }, null);
  return { desde: primera && primera > limite ? primera : limite, hasta: hoy };
}

/** Ficha del paciente, como en un sistema hospitalario. Se libera de la memoria al salir. */
export function PaginaFichaPaciente() {
  const { id = '' } = useParams();
  const ficha = useFichaPaciente(id);
  const navegar = useNavigate();
  const { setTextos } = useTextosBusqueda();

  const volver = (
    <Link to={RUTAS.pacientes} className="inline-flex items-center gap-1.5 text-sm font-medium text-texto-secundario transition-colors hover:text-primario">
      <ArrowLeft aria-hidden strokeWidth={1.75} className="size-4" />
      Pacientes
    </Link>
  );

  if (ficha.isPending) {
    return (
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto">
        {volver}
        <div role="status" className="space-y-4">
          <span className="sr-only">Cargando la ficha…</span>
          <div className="h-32 animate-pulse rounded-2xl bg-white/60" />
          <div className="h-64 animate-pulse rounded-2xl bg-white/50" />
        </div>
      </div>
    );
  }

  if (ficha.isError) {
    const noExiste = ficha.error.estado === 404;
    return (
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto">
        {volver}
        <section className="vidrio rounded-2xl">
          <EstadoError
            titulo={noExiste ? 'Paciente no encontrado' : 'No fue posible abrir la ficha'}
            mensaje={ficha.error.message}
            alReintentar={noExiste ? undefined : () => void ficha.refetch()}
          />
        </section>
      </div>
    );
  }

  const datos = ficha.data;
  const atenciones = [...datos.atenciones].sort((a, b) => new Date(b.abiertaEn).getTime() - new Date(a.abiertaEn).getTime());

  // El documento va a la bandeja por memoria, nunca por la URL.
  const verEnBandeja = () => {
    const { desde, hasta } = rangoDeAtenciones(atenciones);
    setTextos({ documento: datos.paciente.numeroDocumento });
    void navegar(`${RUTAS.historiasClinicas}?${new URLSearchParams({ desde, hasta, estado: 'todos' }).toString()}`);
  };

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="space-y-4 pb-6">
        {volver}
        <CabeceraPaciente
          paciente={cabeceraDePaciente(datos.paciente)}
          alertas={alertasDeFicha(datos)}
          detalle={
            <p className="text-[13px] text-texto-secundario">
              {datos.paciente.totalAtenciones} {datos.paciente.totalAtenciones === 1 ? 'atención' : 'atenciones'}
              {datos.paciente.ultimaAtencion && ` · última ${formatearFechaHora(datos.paciente.ultimaAtencion)}`}
            </p>
          }
          acciones={
            <button
              type="button"
              onClick={verEnBandeja}
              className="campo-vidrio inline-flex h-9 items-center gap-2 rounded-xl px-3 text-[13px] font-medium text-texto transition-colors hover:bg-white hover:text-primario"
            >
              Ver todas en la bandeja
              <ArrowRight aria-hidden strokeWidth={1.75} className="size-4" />
            </button>
          }
        />

        <section aria-label="Antecedentes clínicos" className="vidrio grid gap-8 rounded-2xl px-5 py-5 lg:grid-cols-3">
          <ListaReunida titulo="Alergias" datos={datos.alergias} />
          <ListaReunida titulo="Medicamentos habituales" datos={datos.medicamentosHabituales} />
          <ListaReunida titulo="Antecedentes" datos={datos.antecedentes} />
        </section>

        <section aria-labelledby="titulo-atenciones" className="vidrio space-y-4 rounded-2xl px-5 py-5">
          <h3 id="titulo-atenciones" className="text-base font-semibold text-texto">
            Atenciones <span className="font-normal text-texto-secundario">({atenciones.length})</span>
          </h3>
          {atenciones.length === 0 ? (
            <p className="text-sm text-texto-secundario">Sin atenciones registradas.</p>
          ) : (
            <LineaTiempo etiqueta="Atenciones del paciente, de la más reciente a la más antigua" elementos={atenciones.map(elementoAtencion)} />
          )}
        </section>
      </div>
    </div>
  );
}
