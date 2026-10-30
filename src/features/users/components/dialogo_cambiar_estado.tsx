import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Ban, CircleCheck, CircleSlash, TriangleAlert, type LucideIcon } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';
import { AlertaError } from '../../../components/feedback/alerta_error';
import { CampoMotivo } from '../../../components/forms/campo_motivo';
import { Dialogo } from '../../../components/ui/dialogo';
import { useNotificaciones } from '../../../hooks/use_notificaciones';
import { ACCIONES_ESTADO, ETIQUETAS_ESTADO } from '../constants/estados_usuario';
import { useCambiarEstadoUsuario } from '../hooks/use_mutaciones_usuario';
import { esquemaCambioEstado, type FormularioCambioEstado } from '../schemas/usuario.schema';
import type { EstadoUsuario, Usuario } from '../types/usuario.types';
import { InsigniaEstadoUsuario } from './insignia_estado_usuario';
import { PieFormulario } from '../../../components/forms/pie_formulario';

const LONGITUD_MAXIMA_MOTIVO = 255;

const ICONOS_ESTADO: Record<EstadoUsuario, LucideIcon> = {
  activo: CircleCheck,
  inactivo: CircleSlash,
  bloqueado: Ban,
};

interface PropiedadesDialogoCambiarEstado {
  usuario: Usuario;
  estadoDestino: EstadoUsuario;
  alCerrar: () => void;
}

export function DialogoCambiarEstado({
  usuario,
  estadoDestino,
  alCerrar,
}: PropiedadesDialogoCambiarEstado) {
  const cambio = useCambiarEstadoUsuario();
  const { notificar } = useNotificaciones();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormularioCambioEstado>({
    resolver: zodResolver(esquemaCambioEstado),
    defaultValues: { estado: estadoDestino, motivo: '' },
  });

  const accion = ACCIONES_ESTADO[estadoDestino];
  const desconecta = estadoDestino !== 'activo';
  const longitudMotivo = useWatch({ control, name: 'motivo' }).length;

  const enviar = (datos: FormularioCambioEstado) =>
    cambio.mutate(
      { id: usuario.id, datos },
      {
        onSuccess: (actualizado) => {
          notificar({
            tono: 'exito',
            titulo: `Usuario ${ETIQUETAS_ESTADO[actualizado.estado].toLowerCase()}`,
            descripcion: `${actualizado.nombres} ${actualizado.apellidos}`,
          });
          alCerrar();
        },
      },
    );

  return (
    <Dialogo
      abierto
      titulo={`${accion} usuario`}
      descripcion={`${usuario.nombres} ${usuario.apellidos} · ${usuario.correo}`}
      cerrable={!cambio.isPending}
      alCerrar={alCerrar}
    >
      <form onSubmit={handleSubmit(enviar)} noValidate>
        <div className="space-y-5 px-6 py-5">
          {cambio.error && <AlertaError error={cambio.error} />}

          <div className="flex items-center gap-3">
            <InsigniaEstadoUsuario estado={usuario.estado} />
            <ArrowRight aria-label="pasa a" strokeWidth={1.75} className="size-4 text-texto-secundario" />
            <InsigniaEstadoUsuario estado={estadoDestino} />
          </div>

          {desconecta && (
            <p className="flex items-start gap-2.5 rounded-xl border border-advertencia/25 bg-advertencia/8 px-4 py-3 text-[13px] text-texto">
              <TriangleAlert aria-hidden strokeWidth={1.75} className="mt-0.5 size-4 shrink-0 text-advertencia" />
              Se cerrarán sus sesiones de inmediato y no podrá iniciar sesión mientras siga{' '}
              {ETIQUETAS_ESTADO[estadoDestino].toLowerCase()}.
            </p>
          )}

          <CampoMotivo
            id="motivo"
            longitud={longitudMotivo}
            longitudMaxima={LONGITUD_MAXIMA_MOTIVO}
            disabled={cambio.isPending}
            error={errors.motivo?.message}
            ayuda="Queda registrado en la auditoría."
            {...register('motivo')}
          />
        </div>

        <PieFormulario
          textoEnviar={accion}
          textoEnviando="Guardando…"
          icono={ICONOS_ESTADO[estadoDestino]}
          tono={estadoDestino === 'bloqueado' ? 'peligro' : 'primario'}
          enviando={cambio.isPending}
          alCancelar={alCerrar}
        />
      </form>
    </Dialogo>
  );
}
