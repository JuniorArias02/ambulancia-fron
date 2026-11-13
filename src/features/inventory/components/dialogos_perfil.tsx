import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarCheck, CalendarX, CircleCheck, CircleSlash, Hash, ListChecks, NotebookPen, Save, Text, Trash2, TriangleAlert } from 'lucide-react';
import type { FormEvent } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { AlertaError } from '../../../components/feedback/alerta_error';
import { CampoTexto } from '../../../components/forms/campo_texto';
import { PieFormulario } from '../../../components/forms/pie_formulario';
import { Dialogo } from '../../../components/ui/dialogo';
import { Interruptor } from '../../../components/ui/interruptor';
import { useNotificaciones } from '../../../hooks/use_notificaciones';
import { useMutacionInventario } from '../hooks/use_mutacion_inventario';
import {
  esquemaDatosPerfil,
  esquemaDetalle,
  type EntradaDatosPerfil,
  type EntradaDetalle,
  type FormularioDatosPerfil,
  type FormularioDetalle,
} from '../schemas/perfil.schema';
import { actualizarDetallePerfil, actualizarPerfil, cambiarEstadoPerfil, quitarDetallePerfil } from '../services/perfiles.service';
import type { ControlInsumo, DatosDatosPerfil, DatosDetallePerfil, DetallePerfil, PerfilDotacion } from '../types/inventario.types';
import { soloCambios } from '../utils/cambios';
import { formatearCantidad } from '../utils/formato_inventario';

export function DialogoDatosPerfil({ perfil, alCerrar }: { perfil: PerfilDotacion; alCerrar: () => void }) {
  const { notificar } = useNotificaciones();
  const mutacion = useMutacionInventario((datos: FormularioDatosPerfil) =>
    actualizarPerfil(perfil.id, soloCambios<DatosDatosPerfil>(perfil, datos)),
  );
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<EntradaDatosPerfil, unknown, FormularioDatosPerfil>({
    resolver: zodResolver(esquemaDatosPerfil),
    defaultValues: {
      nombre: perfil.nombre,
      descripcion: perfil.descripcion ?? '',
      vigenteDesde: perfil.vigenteDesde ?? '',
      vigenteHasta: perfil.vigenteHasta ?? '',
    },
  });

  const enviar = (datos: FormularioDatosPerfil) =>
    mutacion.mutate(datos, {
      onSuccess: (actualizado) => {
        notificar({ tono: 'exito', titulo: 'Perfil actualizado', descripcion: actualizado.nombre });
        alCerrar();
      },
    });

  return (
    <Dialogo abierto titulo="Editar perfil" descripcion={`${perfil.codigo} · versión ${perfil.version}`} cerrable={!mutacion.isPending} alCerrar={alCerrar}>
      <form onSubmit={handleSubmit(enviar)} noValidate>
        <fieldset disabled={mutacion.isPending} className="space-y-5 px-6 py-5">
          {mutacion.error && <AlertaError error={mutacion.error} />}
          <CampoTexto id="nombre-perfil-editar" etiqueta="Nombre" icono={ListChecks} maxLength={150} error={errors.nombre?.message} {...register('nombre')} />
          <CampoTexto id="descripcion-perfil-editar" etiqueta="Descripción" icono={Text} obligatorio={false} maxLength={5000} error={errors.descripcion?.message} {...register('descripcion')} />
          <div className="grid gap-5 sm:grid-cols-2">
            <CampoTexto id="desde-perfil" etiqueta="Vigente desde" icono={CalendarCheck} type="date" obligatorio={false} error={errors.vigenteDesde?.message} {...register('vigenteDesde')} />
            <CampoTexto id="hasta-perfil" etiqueta="Vigente hasta" icono={CalendarX} type="date" obligatorio={false} error={errors.vigenteHasta?.message} {...register('vigenteHasta')} />
          </div>
        </fieldset>
        <PieFormulario textoEnviar="Guardar" textoEnviando="Guardando…" icono={Save} enviando={mutacion.isPending} deshabilitado={!isDirty} alCancelar={alCerrar} />
      </form>
    </Dialogo>
  );
}

/** Activar desactiva los demás perfiles del mismo tipo. */
export function DialogoEstadoPerfil({ perfil, alCerrar }: { perfil: PerfilDotacion; alCerrar: () => void }) {
  const { notificar } = useNotificaciones();
  const activar = !perfil.activo;
  const mutacion = useMutacionInventario(() => cambiarEstadoPerfil(perfil.id, activar));

  const enviar = (evento: FormEvent) => {
    evento.preventDefault();
    mutacion.mutate(undefined, {
      onSuccess: (actualizado) => {
        notificar({ tono: 'exito', titulo: actualizado.activo ? 'Perfil activado' : 'Perfil desactivado', descripcion: `${actualizado.codigo} v${actualizado.version}` });
        alCerrar();
      },
    });
  };

  return (
    <Dialogo abierto titulo={activar ? 'Activar perfil' : 'Desactivar perfil'} descripcion={`${perfil.codigo} · versión ${perfil.version}`} cerrable={!mutacion.isPending} alCerrar={alCerrar}>
      <form onSubmit={enviar}>
        <div className="space-y-4 px-6 py-5">
          {mutacion.error && <AlertaError error={mutacion.error} />}
          {activar ? (
            <p className="flex items-start gap-2.5 rounded-xl border border-advertencia/25 bg-advertencia/8 px-4 py-3 text-[13px] text-texto">
              <TriangleAlert aria-hidden strokeWidth={1.75} className="mt-0.5 size-4 shrink-0 text-advertencia" />
              <span>
                Los demás perfiles de <span className="font-medium">{perfil.tipoAmbulanciaNombre ?? 'este tipo'}</span> quedarán inactivos. Para
                activarlo necesita al menos un elemento y una vigencia que no haya terminado.
              </span>
            </p>
          ) : (
            <p className="text-[13px] text-texto">
              Las ambulancias de este tipo quedarán sin perfil vigente: su dotación no tendrá con qué compararse.
            </p>
          )}
        </div>
        <PieFormulario
          textoEnviar={activar ? 'Activar' : 'Desactivar'}
          textoEnviando="Guardando…"
          icono={activar ? CircleCheck : CircleSlash}
          enviando={mutacion.isPending}
          alCancelar={alCerrar}
        />
      </form>
    </Dialogo>
  );
}

interface PropiedadesDialogoDetalle {
  perfil: PerfilDotacion;
  detalle: DetallePerfil;
  control: ControlInsumo | undefined;
  alCerrar: () => void;
}

export function DialogoDetalle({ perfil, detalle, control: tipoControl, alCerrar }: PropiedadesDialogoDetalle) {
  const { notificar } = useNotificaciones();
  const mutacion = useMutacionInventario((datos: FormularioDetalle) =>
    actualizarDetallePerfil(perfil.id, detalle.id, soloCambios<DatosDetallePerfil>(detalle, datos)),
  );
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty },
  } = useForm<EntradaDetalle, unknown, FormularioDetalle>({
    resolver: zodResolver(esquemaDetalle(tipoControl)),
    defaultValues: {
      cantidadRequerida: String(detalle.cantidadRequerida),
      cantidadMinima: detalle.cantidadMinima === null ? '' : String(detalle.cantidadMinima),
      obligatorio: detalle.obligatorio,
      observaciones: detalle.observaciones ?? '',
    },
  });

  const enviar = (datos: FormularioDetalle) =>
    mutacion.mutate(datos, {
      onSuccess: () => {
        notificar({ tono: 'exito', titulo: 'Elemento actualizado', descripcion: detalle.insumoNombre });
        alCerrar();
      },
    });

  return (
    <Dialogo abierto titulo="Editar elemento" descripcion={`${detalle.insumoNombre} (${detalle.unidadMedida})`} cerrable={!mutacion.isPending} alCerrar={alCerrar}>
      <form onSubmit={handleSubmit(enviar)} noValidate>
        <fieldset disabled={mutacion.isPending} className="space-y-5 px-6 py-5">
          {mutacion.error && <AlertaError error={mutacion.error} />}
          <div className="grid gap-5 sm:grid-cols-2">
            <CampoTexto id="requerida" etiqueta="Cantidad requerida" icono={Hash} inputMode="decimal" error={errors.cantidadRequerida?.message} {...register('cantidadRequerida')} />
            <CampoTexto
              id="minima"
              etiqueta="Cantidad mínima"
              icono={Hash}
              inputMode="decimal"
              obligatorio={false}
              ayuda="Por debajo es crítico. Vacía: igual a la requerida."
              error={errors.cantidadMinima?.message}
              {...register('cantidadMinima')}
            />
          </div>
          <Controller
            control={control}
            name="obligatorio"
            render={({ field }) => <Interruptor etiqueta="Obligatorio" activo={field.value} alCambiar={field.onChange} />}
          />
          <CampoTexto id="observaciones-detalle" etiqueta="Observaciones" icono={NotebookPen} obligatorio={false} maxLength={5000} error={errors.observaciones?.message} {...register('observaciones')} />
        </fieldset>
        <PieFormulario textoEnviar="Guardar" textoEnviando="Guardando…" icono={Save} enviando={mutacion.isPending} deshabilitado={!isDirty} alCancelar={alCerrar} />
      </form>
    </Dialogo>
  );
}

export function DialogoQuitarDetalle({ perfil, detalle, alCerrar }: { perfil: PerfilDotacion; detalle: DetallePerfil; alCerrar: () => void }) {
  const { notificar } = useNotificaciones();
  const mutacion = useMutacionInventario(() => quitarDetallePerfil(perfil.id, detalle.id));

  const enviar = (evento: FormEvent) => {
    evento.preventDefault();
    mutacion.mutate(undefined, {
      onSuccess: () => {
        notificar({ tono: 'exito', titulo: 'Elemento quitado', descripcion: detalle.insumoNombre });
        alCerrar();
      },
    });
  };

  return (
    <Dialogo abierto titulo="Quitar elemento" descripcion={`${perfil.codigo} · versión ${perfil.version}`} cerrable={!mutacion.isPending} alCerrar={alCerrar}>
      <form onSubmit={enviar}>
        <div className="space-y-4 px-6 py-5">
          {mutacion.error && <AlertaError error={mutacion.error} />}
          <p className="text-sm text-texto">
            ¿Quitar <span className="font-semibold">{detalle.insumoNombre}</span> ({formatearCantidad(detalle.cantidadRequerida)} {detalle.unidadMedida}) del perfil?
          </p>
          {perfil.activo && (
            <p className="text-[13px] text-texto-secundario">El perfil está activo: la dotación de las ambulancias dejará de exigirlo de inmediato.</p>
          )}
        </div>
        <PieFormulario textoEnviar="Quitar" textoEnviando="Quitando…" icono={Trash2} tono="peligro" enviando={mutacion.isPending} alCancelar={alCerrar} />
      </form>
    </Dialogo>
  );
}
