import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarCheck, CalendarClock, ClipboardCheck, FileText, Plus, UserRound, Wrench, Building2, Tag } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { AlertaError } from '../../../components/feedback/alerta_error';
import { CampoSelector } from '../../../components/forms/campo_selector';
import { CampoTexto } from '../../../components/forms/campo_texto';
import { EstadoError } from '../../../components/states/estado_error';
import { Dialogo } from '../../../components/ui/dialogo';
import { useNotificaciones } from '../../../hooks/use_notificaciones';
import { ETIQUETAS_TIPO_MANTENIMIENTO, TIPOS_MANTENIMIENTO } from '../constants/catalogos_inventario';
import { claseBotonPrimario, claseBotonSecundario } from '../constants/estilos_inventario';
import { useMantenimientos } from '../hooks/use_consultas_inventario';
import { useMutacionInventario } from '../hooks/use_mutacion_inventario';
import { esquemaMantenimiento, type EntradaMantenimiento, type FormularioMantenimiento } from '../schemas/catalogo.schema';
import { registrarMantenimiento } from '../services/catalogo.service';
import type { Equipo } from '../types/inventario.types';
import { diaDeHoy, formatearDia } from '../utils/formato_inventario';

function FormularioMantenimiento({ equipo, alTerminar }: { equipo: Equipo; alTerminar: () => void }) {
  const { notificar } = useNotificaciones();
  const [hoy] = useState(() => diaDeHoy());
  const mutacion = useMutacionInventario((datos: FormularioMantenimiento) => registrarMantenimiento(equipo.id, datos));
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EntradaMantenimiento, unknown, FormularioMantenimiento>({
    resolver: zodResolver(esquemaMantenimiento(hoy)),
    defaultValues: {
      tipo: 'preventivo',
      fechaMantenimiento: hoy,
      fechaProximo: '',
      responsable: '',
      proveedor: '',
      documentoSoporte: '',
      resultado: '',
      observaciones: '',
    },
  });

  const enviar = (datos: FormularioMantenimiento) =>
    mutacion.mutate(datos, {
      onSuccess: () => {
        notificar({ tono: 'exito', titulo: 'Mantenimiento registrado', descripcion: `Serie ${equipo.numeroSerie}` });
        alTerminar();
      },
    });

  return (
    <form onSubmit={handleSubmit(enviar)} noValidate className="space-y-4 rounded-2xl border border-borde/70 bg-white/50 p-4">
      <fieldset disabled={mutacion.isPending} className="space-y-4">
        {mutacion.error && <AlertaError error={mutacion.error} />}
        <div className="grid gap-4 sm:grid-cols-2">
          <CampoSelector id="tipo-mantenimiento" etiqueta="Tipo" icono={Tag} {...register('tipo')}>
            {TIPOS_MANTENIMIENTO.map((tipo) => (
              <option key={tipo} value={tipo}>
                {ETIQUETAS_TIPO_MANTENIMIENTO[tipo]}
              </option>
            ))}
          </CampoSelector>
          <CampoTexto id="fecha-mantenimiento" etiqueta="Fecha" icono={CalendarCheck} type="date" max={hoy} error={errors.fechaMantenimiento?.message} {...register('fechaMantenimiento')} />
          <CampoTexto id="fecha-proximo" etiqueta="Próximo" icono={CalendarClock} type="date" obligatorio={false} error={errors.fechaProximo?.message} {...register('fechaProximo')} />
          <CampoTexto id="resultado" etiqueta="Resultado" icono={ClipboardCheck} obligatorio={false} placeholder="aprobado" maxLength={50} error={errors.resultado?.message} {...register('resultado')} />
          <CampoTexto id="responsable" etiqueta="Responsable" icono={UserRound} obligatorio={false} maxLength={150} error={errors.responsable?.message} {...register('responsable')} />
          <CampoTexto id="proveedor-mantenimiento" etiqueta="Proveedor" icono={Building2} obligatorio={false} maxLength={150} error={errors.proveedor?.message} {...register('proveedor')} />
        </div>
        <CampoTexto id="documento-mantenimiento" etiqueta="Documento soporte" icono={FileText} obligatorio={false} maxLength={500} error={errors.documentoSoporte?.message} {...register('documentoSoporte')} />
      </fieldset>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={alTerminar} disabled={mutacion.isPending} className={claseBotonSecundario}>
          Cancelar
        </button>
        <button type="submit" disabled={mutacion.isPending} className={claseBotonPrimario}>
          <Wrench aria-hidden strokeWidth={1.75} className="size-4" />
          {mutacion.isPending ? 'Registrando…' : 'Registrar'}
        </button>
      </div>
    </form>
  );
}

/** Historial de mantenimientos de un equipo y registro de uno nuevo. */
export function PanelMantenimientos({ equipo, alCerrar }: { equipo: Equipo; alCerrar: () => void }) {
  const mantenimientos = useMantenimientos(equipo.id);
  const [registrando, setRegistrando] = useState(false);
  const deBaja = equipo.estado === 'baja';

  return (
    <Dialogo
      abierto
      variante="lateral"
      titulo="Mantenimientos"
      descripcion={`${equipo.insumoNombre ?? 'Equipo'} · Serie ${equipo.numeroSerie}`}
      alCerrar={alCerrar}
    >
      <div className="space-y-4 px-6 py-5">
        <dl className="grid grid-cols-2 gap-3 text-[13px]">
          <div>
            <dt className="text-texto-secundario">Último</dt>
            <dd className="mt-0.5 font-medium text-texto">{formatearDia(equipo.fechaUltimoMantenimiento)}</dd>
          </div>
          <div>
            <dt className="text-texto-secundario">Próximo</dt>
            <dd className="mt-0.5 font-medium text-texto">{formatearDia(equipo.fechaProximoMantenimiento)}</dd>
          </div>
        </dl>

        {registrando ? (
          <FormularioMantenimiento equipo={equipo} alTerminar={() => setRegistrando(false)} />
        ) : (
          !deBaja && (
            <button type="button" onClick={() => setRegistrando(true)} className={claseBotonSecundario}>
              <Plus aria-hidden strokeWidth={1.75} className="size-4" />
              Registrar mantenimiento
            </button>
          )
        )}

        {mantenimientos.isPending ? (
          <div role="status" aria-label="Cargando mantenimientos" className="space-y-2">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-2xl bg-white/50" />
            ))}
          </div>
        ) : mantenimientos.isError ? (
          <EstadoError titulo="No fue posible cargar los mantenimientos" mensaje={mantenimientos.error.message} alReintentar={() => void mantenimientos.refetch()} />
        ) : mantenimientos.data.length === 0 ? (
          <p className="rounded-2xl bg-white/50 px-4 py-8 text-center text-sm text-texto-secundario">Sin mantenimientos registrados.</p>
        ) : (
          <ol className="space-y-2">
            {mantenimientos.data.map((mantenimiento) => (
              <li key={mantenimiento.id} className="rounded-2xl border border-borde/70 bg-white/60 px-4 py-3">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="text-sm font-semibold text-texto">{ETIQUETAS_TIPO_MANTENIMIENTO[mantenimiento.tipo]}</span>
                  <span className="text-[13px] text-texto-secundario tabular-nums">{formatearDia(mantenimiento.fechaMantenimiento)}</span>
                  {mantenimiento.resultado && (
                    <span className="rounded-md bg-texto-secundario/8 px-1.5 py-0.5 text-[11px] font-medium text-texto-secundario">
                      {mantenimiento.resultado}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-[13px] text-texto-secundario">
                  {[mantenimiento.responsable, mantenimiento.proveedor].filter(Boolean).join(' · ') || 'Sin responsable registrado'}
                  {mantenimiento.fechaProximo && ` · Próximo: ${formatearDia(mantenimiento.fechaProximo)}`}
                </p>
              </li>
            ))}
          </ol>
        )}
      </div>
    </Dialogo>
  );
}
