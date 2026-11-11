import { CalendarDays, Clock, Mail, Phone, ShieldCheck, UserRound, UserRoundCheck, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { useAhora } from '../../../hooks/use_ahora';
import { formatearFechaHora } from '../../../utils/formato_fecha';
import { InsigniaEstadoUsuario } from '../../users/components/insignia_estado_usuario';
import type { VerificacionDetalle } from '../types/verificacion.types';
import { calcularEdad, formatearFechaNacimiento } from '../utils/formato_verificacion';
import { NumeroDocumento } from './numero_documento';

const INTERVALO_EDAD_MS = 60 * 60_000;

function Dato({ icono: Icono, etiqueta, children }: { icono: LucideIcon; etiqueta: string; children: ReactNode }) {
  return (
    <div className="flex gap-3 py-3.5">
      <Icono aria-hidden strokeWidth={1.75} className="mt-0.5 size-4 shrink-0 text-texto-secundario" />
      <div className="min-w-0 flex-1">
        <dt className="text-[13px] text-texto-secundario">{etiqueta}</dt>
        <dd className="mt-1 text-sm break-words text-texto">{children}</dd>
      </div>
    </div>
  );
}

export function DatosCiudadano({ verificacion }: { verificacion: VerificacionDetalle }) {
  const ahora = useAhora(INTERVALO_EDAD_MS);
  const edad = calcularEdad(verificacion.fechaNacimiento, ahora);

  return (
    <div className="px-5 pt-4 pb-1">
      <NumeroDocumento tipo={verificacion.tipoDocumento} numero={verificacion.numeroDocumento} />
      <dl className="mt-1 divide-y divide-borde/60">
        <Dato icono={UserRound} etiqueta="Nombres y apellidos">
          <span className="text-[15px] font-semibold">{verificacion.nombres}</span>{' '}
          <span className="text-[15px] font-semibold">{verificacion.apellidos}</span>
        </Dato>
        <Dato icono={CalendarDays} etiqueta="Fecha de nacimiento">
          <span className="font-medium tabular-nums">{formatearFechaNacimiento(verificacion.fechaNacimiento)}</span>
          {edad !== null && <span className="ml-2 text-texto-secundario">({edad} años)</span>}
        </Dato>
        <Dato icono={Mail} etiqueta="Correo">
          {verificacion.correo}
        </Dato>
        <Dato icono={Phone} etiqueta="Teléfono">
          {verificacion.telefono}
        </Dato>
        <Dato icono={ShieldCheck} etiqueta="Estado de la cuenta">
          <InsigniaEstadoUsuario estado={verificacion.estadoCuenta} />
        </Dato>
        <Dato icono={Clock} etiqueta="Registrado · última solicitud">
          <time dateTime={verificacion.registradoEn}>{formatearFechaHora(verificacion.registradoEn)}</time>
          <span className="mt-0.5 block text-[13px] text-texto-secundario">
            Solicitud enviada el{' '}
            <time dateTime={verificacion.enviadaEn}>{formatearFechaHora(verificacion.enviadaEn)}</time>
          </span>
        </Dato>
        {verificacion.revisadaPor && verificacion.revisadaEn && (
          <Dato icono={UserRoundCheck} etiqueta="Última revisión">
            {verificacion.revisadaPor.nombreCompleto ?? 'Administrador'}
            <span className="mt-0.5 block text-[13px] text-texto-secundario">
              <time dateTime={verificacion.revisadaEn}>{formatearFechaHora(verificacion.revisadaEn)}</time>
            </span>
          </Dato>
        )}
      </dl>
    </div>
  );
}
