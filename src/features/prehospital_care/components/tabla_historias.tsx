import { ArrowDown, ArrowUp, ArrowUpDown, Ban, FileSignature, FileX, TriangleAlert, type LucideIcon } from 'lucide-react';
import type { MouseEvent, ReactNode } from 'react';
import { Link, useNavigate } from 'react-router';
import { ETIQUETAS_MODALIDAD } from '../../../constants/modalidades_servicio';
import { ETIQUETAS_SEXO } from '../constants/catalogos_clinicos';
import type { OrdenHistorias, ResumenHistoria } from '../types/historia_clinica.types';
import { formatearFechaHora, nombrePaciente, textoDocumento, textoEdad } from '../utils/formato_clinico';
import { rutaExpediente, rutaIngreso } from '../utils/rutas_historias';
import { EtiquetaDesenlace, EtiquetaEstadoHistoria, EtiquetaTriage } from './etiquetas';
import { SinDato } from './valor_o_dato';

interface PropiedadesTablaHistorias {
  historias: readonly ResumenHistoria[];
  /** Con orden, los encabezados ordenables se pueden pulsar. */
  orden?: OrdenHistorias;
  alOrdenar?: (orden: OrdenHistorias) => void;
  /** En el ingreso ya se está en él: la columna sobra. */
  ocultarIngreso?: boolean;
}

const claseEnlace = 'font-medium text-primario hover:text-primario-hover hover:underline';

/** Un clic en un enlace no debe disparar también el de la fila. */
const detener = (evento: MouseEvent) => evento.stopPropagation();

export function NombrePaciente({ historia }: { historia: ResumenHistoria }) {
  const nombre = nombrePaciente(historia.paciente);
  const edad = textoEdad(historia.paciente.edadAnios);
  const sexo = historia.paciente.sexo ? ETIQUETAS_SEXO[historia.paciente.sexo] : null;
  const detalle = [edad, sexo].filter(Boolean).join(' · ');
  return (
    <div className="min-w-0">
      {nombre ? (
        <p className="truncate text-sm font-medium text-texto">{nombre}</p>
      ) : (
        <p className="text-sm text-texto-secundario italic">NN — sin identificar</p>
      )}
      {detalle && <p className="text-xs text-texto-secundario">{detalle}</p>}
    </div>
  );
}

function Indicador({ icono: Icono, texto, clase }: { icono: LucideIcon; texto: string; clase: string }) {
  return (
    <span title={texto} className={`inline-flex ${clase}`}>
      <Icono aria-hidden strokeWidth={1.75} className="size-4" />
      <span className="sr-only">{texto}</span>
    </span>
  );
}

export function IndicadoresHistoria({ historia }: { historia: ResumenHistoria }) {
  return (
    <div className="flex items-center gap-2">
      {historia.firmada ? (
        <Indicador icono={FileSignature} texto="Con firma" clase="text-exito" />
      ) : (
        <Indicador icono={FileX} texto="Sin firma" clase="text-texto-secundario/70" />
      )}
      {historia.riesgoCaidaAlto && <Indicador icono={TriangleAlert} texto="Riesgo de caída alto" clase="text-advertencia" />}
      {historia.desenlace === 'rechazo_traslado' && (
        <Indicador icono={Ban} texto="Rechazó el traslado" clase="text-critico" />
      )}
    </div>
  );
}

const profesional = (historia: ResumenHistoria) =>
  (historia.estado === 'cerrada' ? historia.cerradaPor?.nombreCompleto : null) ?? historia.creadaPor.nombreCompleto;

interface PropiedadesEncabezadoOrdenable {
  texto: string;
  /** El orden que activa este encabezado; la fecha alterna entre descendente y ascendente. */
  ordenes: readonly OrdenHistorias[];
  orden?: OrdenHistorias;
  alOrdenar?: (orden: OrdenHistorias) => void;
  className?: string;
}

function EncabezadoOrdenable({ texto, ordenes, orden, alOrdenar, className = '' }: PropiedadesEncabezadoOrdenable) {
  const claseBase = `px-3 py-3 font-medium ${className}`;
  if (!alOrdenar) {
    return (
      <th scope="col" className={claseBase}>
        {texto}
      </th>
    );
  }
  const activo = orden !== undefined && ordenes.includes(orden);
  const [primero = 'fecha_desc', segundo] = ordenes;
  const siguiente = activo && segundo && orden === primero ? segundo : primero;
  const Icono = !activo ? ArrowUpDown : orden === 'fecha_asc' ? ArrowUp : ArrowDown;
  const sentido = orden === 'fecha_asc' ? 'ascending' : 'descending';
  return (
    <th scope="col" aria-sort={activo ? sentido : 'none'} className={claseBase}>
      <button
        type="button"
        onClick={() => alOrdenar(siguiente)}
        className={`inline-flex items-center gap-1 rounded-md uppercase transition-colors hover:text-primario focus-visible:ring-2 focus-visible:ring-primario/40 focus-visible:outline-none ${
          activo ? 'text-primario' : ''
        }`}
      >
        {texto}
        <Icono aria-hidden strokeWidth={2} className="size-3.5" />
      </button>
    </th>
  );
}

function Celda({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <td className={`px-3 py-3 align-middle ${className}`}>{children}</td>;
}

/** Bandeja de historias: un clic en la fila abre el expediente; el ingreso es un enlace aparte. */
export function TablaHistorias({ historias, orden, alOrdenar, ocultarIngreso = false }: PropiedadesTablaHistorias) {
  const navegar = useNavigate();
  const abrir = (id: string) => void navegar(rutaExpediente(id));

  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[1040px] text-left">
          <thead>
            <tr className="border-b border-borde/80 text-xs tracking-wide text-texto-secundario uppercase">
              <EncabezadoOrdenable texto="N.º historia" ordenes={['numero']} orden={orden} alOrdenar={alOrdenar} className="pl-5" />
              {!ocultarIngreso && <th scope="col" className="px-3 py-3 font-medium">Ingreso</th>}
              <EncabezadoOrdenable texto="Atención" ordenes={['fecha_desc', 'fecha_asc']} orden={orden} alOrdenar={alOrdenar} />
              <EncabezadoOrdenable texto="Paciente" ordenes={['paciente']} orden={orden} alOrdenar={alOrdenar} />
              <th scope="col" className="px-3 py-3 font-medium">Documento</th>
              <th scope="col" className="px-3 py-3 font-medium">Triage</th>
              <th scope="col" className="px-3 py-3 font-medium">Desenlace</th>
              <th scope="col" className="hidden px-3 py-3 font-medium xl:table-cell">Ambulancia</th>
              <th scope="col" className="hidden px-3 py-3 font-medium xl:table-cell">Profesional</th>
              <th scope="col" className="px-3 py-3 font-medium">Estado</th>
              <th scope="col" className="py-3 pr-5 pl-3 font-medium">
                <span className="sr-only">Indicadores</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-borde/60">
            {historias.map((historia) => {
              const documento = textoDocumento(historia.paciente.tipoDocumento, historia.paciente.numeroDocumento);
              return (
                <tr
                  key={historia.id}
                  // Atajo del mouse; con teclado se abre desde el enlace del número.
                  onClick={() => abrir(historia.id)}
                  className={`cursor-pointer transition-colors duration-150 hover:bg-primario/5 ${
                    historia.estado === 'anulada' ? 'opacity-60' : ''
                  }`}
                >
                  <Celda className="pl-5 whitespace-nowrap">
                    <Link to={rutaExpediente(historia.id)} onClick={detener} className={`text-sm ${claseEnlace}`}>
                      {historia.numeroHistoria}
                    </Link>
                  </Celda>
                  {!ocultarIngreso && (
                    <Celda className="whitespace-nowrap">
                      <Link
                        to={rutaIngreso(historia.ingreso.numeroEmergencia)}
                        onClick={detener}
                        className={`text-[13px] ${claseEnlace}`}
                      >
                        {historia.ingreso.numeroEmergencia}
                      </Link>
                      <p className="text-xs text-texto-secundario">
                        <span className="sr-only">Tipo de servicio: </span>
                        {ETIQUETAS_MODALIDAD[historia.ingreso.modalidad]}
                      </p>
                    </Celda>
                  )}
                  <Celda className="text-[13px] whitespace-nowrap text-texto tabular-nums">
                    <time dateTime={historia.abiertaEn}>{formatearFechaHora(historia.abiertaEn)}</time>
                  </Celda>
                  <Celda className="max-w-56">
                    <NombrePaciente historia={historia} />
                  </Celda>
                  <Celda className="text-[13px] whitespace-nowrap text-texto tabular-nums">
                    {documento ?? <span className="text-texto-secundario">—</span>}
                  </Celda>
                  <Celda>
                    <EtiquetaTriage triage={historia.triage} />
                  </Celda>
                  <Celda className="text-sm">
                    <EtiquetaDesenlace desenlace={historia.desenlace} />
                  </Celda>
                  <Celda className="hidden text-[13px] whitespace-nowrap xl:table-cell">
                    {historia.ambulancia ? (
                      <span title={`Placa ${historia.ambulancia.placa}`}>{historia.ambulancia.codigo}</span>
                    ) : (
                      <SinDato />
                    )}
                  </Celda>
                  <Celda className="hidden max-w-44 truncate text-[13px] text-texto xl:table-cell">
                    {profesional(historia) ?? <SinDato />}
                  </Celda>
                  <Celda>
                    <EtiquetaEstadoHistoria estado={historia.estado} />
                  </Celda>
                  <Celda className="pr-5">
                    <IndicadoresHistoria historia={historia} />
                  </Celda>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-borde/60 md:hidden">
        {historias.map((historia) => (
          <li key={historia.id} className={historia.estado === 'anulada' ? 'opacity-60' : undefined}>
            <Link to={rutaExpediente(historia.id)} className="block space-y-2.5 px-4 py-4 hover:bg-primario/5">
              <div className="flex items-start justify-between gap-3">
                <NombrePaciente historia={historia} />
                <EtiquetaEstadoHistoria estado={historia.estado} />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <EtiquetaTriage triage={historia.triage} />
                <span className="text-sm">
                  <EtiquetaDesenlace desenlace={historia.desenlace} />
                </span>
                <IndicadoresHistoria historia={historia} />
              </div>
              <p className="text-[13px] text-texto-secundario">
                {historia.numeroHistoria} · {historia.ingreso.numeroEmergencia} · {ETIQUETAS_MODALIDAD[historia.ingreso.modalidad]} ·{' '}
                {formatearFechaHora(historia.abiertaEn)}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
