import { Ban, ShieldAlert } from 'lucide-react';
import {
  ETIQUETAS_REGIMEN,
  ETIQUETAS_ROL_VICTIMA,
  ETIQUETAS_SEXO,
  ETIQUETAS_TIPO_DOCUMENTO,
  ETIQUETAS_TIPO_EVENTO,
} from '../constants/catalogos_clinicos';
import type { DatosHistoria, DetalleHistoria } from '../types/historia_clinica.types';
import { formatearFechaHora, formatearFechaNacimiento, tieneDato, textoEdad } from '../utils/formato_clinico';
import { EtiquetaDesenlace, EtiquetaTriage } from './etiquetas';
import { Bloque, Dato, Ficha, ValorODato } from './valor_o_dato';

export function SeccionResumen({ datos }: { datos: DatosHistoria }) {
  const esTransito = datos.tipoEvento === 'transito';
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <Bloque titulo="Evento">
        <Ficha>
          <Dato etiqueta="Hora del evento" valor={datos.horaEvento}>
            {datos.horaEvento && formatearFechaHora(datos.horaEvento)}
          </Dato>
          <Dato etiqueta="Tipo de evento" valor={datos.tipoEvento}>
            {datos.tipoEvento && ETIQUETAS_TIPO_EVENTO[datos.tipoEvento]}
          </Dato>
          <Dato etiqueta="Mecanismo de la lesión" valor={datos.mecanismoLesion} ancho />
          <Dato etiqueta="Elementos de protección" valor={datos.elementosProteccion} ancho />
          {esTransito && (
            <>
              <Dato etiqueta="Rol de la víctima" valor={datos.rolVictima}>
                {datos.rolVictima && ETIQUETAS_ROL_VICTIMA[datos.rolVictima]}
              </Dato>
              <Dato etiqueta="Placa del vehículo" valor={datos.placaVehiculo} />
              <Dato etiqueta="Póliza SOAT" valor={datos.polizaSoat} />
            </>
          )}
        </Ficha>
      </Bloque>
      <Bloque titulo="Diagnóstico">
        <Ficha>
          <Dato etiqueta="Impresión diagnóstica" valor={datos.impresionDiagnostica} ancho />
          <Dato etiqueta="Observaciones" valor={datos.observaciones} ancho />
        </Ficha>
      </Bloque>
    </div>
  );
}

export function SeccionPaciente({ datos }: { datos: DatosHistoria }) {
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <Bloque titulo="Identificación">
        <Ficha>
          <Dato etiqueta="Identificado" valor="sí">
            {datos.pacienteIdentificado ? 'Sí' : 'No (NN)'}
          </Dato>
          <Dato etiqueta="Sexo" valor={datos.sexo}>
            {datos.sexo && ETIQUETAS_SEXO[datos.sexo]}
          </Dato>
          <Dato etiqueta="Nombres" valor={datos.nombres} />
          <Dato etiqueta="Apellidos" valor={datos.apellidos} />
          <Dato etiqueta="Tipo de documento" valor={datos.tipoDocumento}>
            {datos.tipoDocumento && `${datos.tipoDocumento} · ${ETIQUETAS_TIPO_DOCUMENTO[datos.tipoDocumento]}`}
          </Dato>
          <Dato etiqueta="Número de documento" valor={datos.numeroDocumento} />
          <Dato etiqueta="Fecha de nacimiento" valor={datos.fechaNacimiento}>
            {datos.fechaNacimiento && formatearFechaNacimiento(datos.fechaNacimiento)}
          </Dato>
          <Dato etiqueta="Edad aproximada" valor={datos.edadAproximada}>
            {textoEdad(datos.edadAproximada)}
          </Dato>
        </Ficha>
      </Bloque>
      <div className="space-y-8">
        <Bloque titulo="Afiliación">
          <Ficha>
            <Dato etiqueta="EPS o aseguradora" valor={datos.aseguradoraEps} />
            <Dato etiqueta="Régimen de afiliación" valor={datos.regimenAfiliacion}>
              {datos.regimenAfiliacion && ETIQUETAS_REGIMEN[datos.regimenAfiliacion]}
            </Dato>
          </Ficha>
        </Bloque>
        <Bloque titulo="Acompañante">
          <Ficha>
            <Dato etiqueta="Nombre" valor={datos.acompananteNombre} />
            <Dato etiqueta="Teléfono" valor={datos.acompananteTelefono} />
          </Ficha>
        </Bloque>
      </div>
    </div>
  );
}

const XABCDE = [
  { letra: 'X', titulo: 'Hemorragia masiva', clave: 'xHemorragiaMasiva' },
  { letra: 'A', titulo: 'Vía aérea', clave: 'aViaAerea' },
  { letra: 'B', titulo: 'Respiración', clave: 'bRespiracion' },
  { letra: 'C', titulo: 'Circulación', clave: 'cCirculacion' },
  { letra: 'D', titulo: 'Neurológico', clave: 'dNeurologico' },
  { letra: 'E', titulo: 'Exposición', clave: 'eExposicion' },
] as const satisfies readonly { letra: string; titulo: string; clave: keyof DatosHistoria }[];

export function SeccionValoracion({ datos }: { datos: DatosHistoria }) {
  const conAlergias = tieneDato(datos.alergias);
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <Bloque titulo="Valoración primaria XABCDE" accion={<EtiquetaTriage triage={datos.triage} completa />}>
        <ol className="divide-y divide-borde/60">
          {XABCDE.map(({ letra, titulo, clave }) => (
            <li key={letra} className="flex gap-4 py-3 first:pt-0">
              <span
                aria-hidden
                className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primario/8 text-lg font-semibold text-primario"
              >
                {letra}
              </span>
              <div className="min-w-0">
                <p className="text-[13px] text-texto-secundario">
                  <span className="sr-only">{letra}: </span>
                  {titulo}
                </p>
                <p className="text-sm break-words whitespace-pre-line text-texto">
                  <ValorODato valor={datos[clave]} />
                </p>
              </div>
            </li>
          ))}
        </ol>
      </Bloque>
      <Bloque titulo="Antecedentes (AMPLE)">
        <dl className="space-y-4">
          <div className={conAlergias ? 'rounded-xl bg-critico/8 px-3 py-2.5' : undefined}>
            <dt className={`flex items-center gap-1.5 text-[13px] ${conAlergias ? 'font-medium text-critico' : 'text-texto-secundario'}`}>
              {conAlergias && <ShieldAlert aria-hidden strokeWidth={2} className="size-3.5" />}
              Alergias
            </dt>
            <dd className="mt-0.5 text-sm break-words whitespace-pre-line text-texto">
              <ValorODato valor={datos.alergias} />
            </dd>
          </div>
          <Dato etiqueta="Medicamentos habituales" valor={datos.medicamentosHabituales} />
          <Dato etiqueta="Antecedentes" valor={datos.antecedentes} />
        </dl>
      </Bloque>
    </div>
  );
}

export function SeccionEntrega({ historia }: { historia: DetalleHistoria }) {
  const { datos } = historia;
  return (
    <div className="space-y-6">
      {datos.desenlace === 'rechazo_traslado' && (
        <div role="note" className="rounded-2xl border border-critico/25 bg-critico/6 px-5 py-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-critico">
            <Ban aria-hidden strokeWidth={2} className="size-4" />
            Rechazo del traslado
          </p>
          <p className="mt-1.5 text-sm break-words whitespace-pre-line text-texto">
            <ValorODato valor={datos.motivoRechazo} />
          </p>
        </div>
      )}
      <Bloque titulo="Desenlace y entrega">
        <Ficha>
          <Dato etiqueta="Desenlace" valor={datos.desenlace}>
            <EtiquetaDesenlace desenlace={datos.desenlace} />
          </Dato>
          <Dato etiqueta="Institución de destino" valor={historia.institucionDestino?.nombre} />
          <Dato etiqueta="Recibió" valor={datos.receptorNombre} />
          <Dato etiqueta="Cargo de quien recibió" valor={datos.receptorCargo} />
          <Dato etiqueta="Entregado" valor={datos.entregadoEn}>
            {datos.entregadoEn && formatearFechaHora(datos.entregadoEn)}
          </Dato>
          <Dato etiqueta="Condición de entrega" valor={datos.condicionEntrega} ancho />
        </Ficha>
      </Bloque>
    </div>
  );
}
