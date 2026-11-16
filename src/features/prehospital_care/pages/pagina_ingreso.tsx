import { ArrowLeft, Copy, MapPin, Phone, Siren, Smartphone, Users } from 'lucide-react';
import { Link, useLocation, useNavigate, useParams } from 'react-router';
import { EstadoError } from '../../../components/states/estado_error';
import { RUTAS } from '../../../constants/rutas';
import { InsigniaModalidad } from '../../emergencies/components/insignias_emergencia';
import { EtiquetaPrioridad } from '../components/etiquetas';
import { SeccionAsignacion } from '../components/seccion_asignacion';
import { TablaHistorias } from '../components/tabla_historias';
import { Dato, Ficha } from '../components/valor_o_dato';
import {
  ETIQUETAS_ESTADO_EMERGENCIA,
  ETIQUETAS_FUENTE,
  ETIQUETAS_ORIGEN_UBICACION,
  ETIQUETAS_TIPO_INCIDENTE,
} from '../constants/catalogos_clinicos';
import { useIngreso, useInstitucionesOpciones } from '../hooks/use_historias';
import type { EmergenciaIngreso } from '../types/historia_clinica.types';
import { formatearFechaHora } from '../utils/formato_clinico';
import { rutaIngreso } from '../utils/rutas_historias';

function Volver() {
  const navegar = useNavigate();
  // Si se llegó desde la bandeja o un expediente, se vuelve allí con sus filtros.
  // `default` es la clave de la primera página abierta (p. ej. un enlace pegado).
  const hayHistorial = useLocation().key !== 'default';
  const clase = 'inline-flex items-center gap-1.5 text-sm font-medium text-texto-secundario transition-colors hover:text-primario';
  if (hayHistorial) {
    return (
      <button type="button" onClick={() => void navegar(-1)} className={clase}>
        <ArrowLeft aria-hidden strokeWidth={1.75} className="size-4" />
        Volver
      </button>
    );
  }
  return (
    <Link to={RUTAS.historiasClinicas} className={clase}>
      <ArrowLeft aria-hidden strokeWidth={1.75} className="size-4" />
      Historias clínicas
    </Link>
  );
}

function Encabezado({ emergencia }: { emergencia: EmergenciaIngreso }) {
  return (
    <header className="vidrio space-y-3 rounded-2xl px-5 py-4">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="flex items-center gap-2.5 text-2xl font-semibold tracking-tight text-texto">
          <Siren aria-hidden strokeWidth={1.75} className="size-6 text-critico" />
          {emergencia.numeroEmergencia}
        </h2>
        <EtiquetaPrioridad prioridad={emergencia.prioridad} />
        <InsigniaModalidad modalidad={emergencia.modalidad} />
        <span className="rounded-full bg-white/70 px-2.5 py-1 text-xs font-medium text-texto ring-1 ring-borde/80">
          {ETIQUETAS_ESTADO_EMERGENCIA[emergencia.estado] ?? emergencia.estado}
        </span>
        {emergencia.tipoIncidente && (
          <span className="text-sm text-texto-secundario">{ETIQUETAS_TIPO_INCIDENTE[emergencia.tipoIncidente] ?? emergencia.tipoIncidente}</span>
        )}
      </div>
      <p className="text-[13px] text-texto-secundario">
        Recibida {formatearFechaHora(emergencia.recibidaEn)}
        {emergencia.recibidaPor?.nombreCompleto && ` por ${emergencia.recibidaPor.nombreCompleto}`} · Fuente:{' '}
        {ETIQUETAS_FUENTE[emergencia.fuente] ?? emergencia.fuente}
        {emergencia.cerradaEn && ` · Cerrada ${formatearFechaHora(emergencia.cerradaEn)}`}
      </p>
      {emergencia.emergenciaPrincipal && (
        <p role="note" className="flex items-center gap-2 rounded-xl bg-advertencia/10 px-3 py-2 text-[13px] text-texto">
          <Copy aria-hidden strokeWidth={1.75} className="size-4 text-advertencia" />
          Llamada duplicada de{' '}
          <Link to={rutaIngreso(emergencia.emergenciaPrincipal.numeroEmergencia)} className="font-medium text-primario hover:underline">
            {emergencia.emergenciaPrincipal.numeroEmergencia}
          </Link>
        </p>
      )}
      {emergencia.duplicadas.length > 0 && (
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-texto-secundario">
          <Copy aria-hidden strokeWidth={1.75} className="size-4" />
          Se unieron {emergencia.duplicadas.length} {emergencia.duplicadas.length === 1 ? 'llamada duplicada' : 'llamadas duplicadas'}:
          {emergencia.duplicadas.map((duplicada) => (
            <Link key={duplicada.id} to={rutaIngreso(duplicada.numeroEmergencia)} className="font-medium text-primario hover:underline">
              {duplicada.numeroEmergencia}
            </Link>
          ))}
        </p>
      )}
    </header>
  );
}

function Solicitud({ emergencia }: { emergencia: EmergenciaIngreso }) {
  return (
    <section aria-labelledby="titulo-solicitud" className="vidrio space-y-4 rounded-2xl px-5 py-5">
      <h3 id="titulo-solicitud" className="text-base font-semibold text-texto">
        Solicitud
      </h3>
      {emergencia.reportadaDesdeApp && (
        <p className="inline-flex items-center gap-2 rounded-full bg-cian/10 px-3 py-1 text-[13px] font-medium text-cian-texto">
          <Smartphone aria-hidden strokeWidth={1.75} className="size-4" />
          Reportada por un ciudadano desde la app
        </p>
      )}
      <Ficha>
        <Dato etiqueta="Descripción" valor={emergencia.descripcion} ancho />
        <Dato etiqueta="Dirección" valor={emergencia.direccion}>
          <span className="inline-flex items-start gap-1.5">
            <MapPin aria-hidden strokeWidth={1.75} className="mt-0.5 size-4 shrink-0 text-texto-secundario" />
            {emergencia.direccion}
          </span>
        </Dato>
        <Dato etiqueta="Referencia del lugar" valor={emergencia.referenciaLugar} />
        <Dato etiqueta="Origen de la ubicación" valor={emergencia.origenUbicacion}>
          {emergencia.origenUbicacion && (ETIQUETAS_ORIGEN_UBICACION[emergencia.origenUbicacion] ?? emergencia.origenUbicacion)}
        </Dato>
        <Dato etiqueta="Número de víctimas" valor={emergencia.numeroVictimas}>
          <span className="inline-flex items-center gap-1.5">
            <Users aria-hidden strokeWidth={1.75} className="size-4 text-texto-secundario" />
            {emergencia.numeroVictimas}
          </span>
        </Dato>
        <Dato etiqueta="Informante" valor={emergencia.informanteNombre} />
        <Dato etiqueta="Teléfono del informante" valor={emergencia.informanteTelefono}>
          <span className="inline-flex items-center gap-1.5">
            <Phone aria-hidden strokeWidth={1.75} className="size-4 text-texto-secundario" />
            {emergencia.informanteTelefono}
          </span>
        </Dato>
      </Ficha>
    </section>
  );
}

/** El servicio completo: solicitud, pacientes, tripulación, tiempos, recorrido e insumos. */
export function PaginaIngreso() {
  const { numero = '' } = useParams();
  const ingreso = useIngreso(numero);
  // Las instituciones traen coordenadas: así se marca el destino en el mapa.
  const instituciones = useInstitucionesOpciones(ingreso.isSuccess && ingreso.data.asignaciones.some((a) => a.institucionDestino));

  if (ingreso.isPending) {
    return (
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto">
        <Volver />
        <div role="status" className="space-y-4">
          <span className="sr-only">Cargando el servicio…</span>
          <div className="h-28 animate-pulse rounded-2xl bg-white/60" />
          <div className="h-48 animate-pulse rounded-2xl bg-white/50" />
        </div>
      </div>
    );
  }

  if (ingreso.isError) {
    const noExiste = ingreso.error.estado === 404;
    return (
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto">
        <Volver />
        <section className="vidrio rounded-2xl">
          <EstadoError
            titulo={noExiste ? 'Ingreso no encontrado' : 'No fue posible abrir el ingreso'}
            mensaje={ingreso.error.message}
            alReintentar={noExiste ? undefined : () => void ingreso.refetch()}
          />
        </section>
      </div>
    );
  }

  const { emergencia, asignaciones, historias } = ingreso.data;
  const escena =
    emergencia.latitud !== null && emergencia.longitud !== null ? { latitud: emergencia.latitud, longitud: emergencia.longitud } : null;
  const coordenadasDestino = (id: string | undefined) =>
    id ? instituciones.data?.find((institucion) => institucion.id === id)?.coordenadas ?? null : null;

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="space-y-4 pb-6">
        <Volver />
        <Encabezado emergencia={emergencia} />
        <Solicitud emergencia={emergencia} />

        <section aria-labelledby="titulo-pacientes" className="vidrio rounded-2xl">
          <h3 id="titulo-pacientes" className="border-b border-borde/70 px-5 py-4 text-base font-semibold text-texto">
            Pacientes del servicio <span className="font-normal text-texto-secundario">({historias.length})</span>
          </h3>
          {historias.length === 0 ? (
            <p className="px-5 py-6 text-sm text-texto-secundario">Este servicio no tiene historias clínicas.</p>
          ) : (
            <TablaHistorias historias={historias} ocultarIngreso />
          )}
        </section>

        {asignaciones.length === 0 ? (
          <p className="vidrio rounded-2xl px-5 py-6 text-sm text-texto-secundario">No se asignó ninguna ambulancia a este servicio.</p>
        ) : (
          asignaciones.map((asignacion) => (
            <SeccionAsignacion
              key={asignacion.id}
              asignacion={asignacion}
              escena={escena}
              destino={coordenadasDestino(asignacion.institucionDestino?.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
