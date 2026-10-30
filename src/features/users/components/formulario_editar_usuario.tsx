import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Phone, Save, UserRound } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { AlertaError } from '../../../components/feedback/alerta_error';
import { CampoTexto } from '../../../components/forms/campo_texto';
import { useNotificaciones } from '../../../hooks/use_notificaciones';
import { useActualizarUsuario } from '../hooks/use_mutaciones_usuario';
import { esquemaEditarUsuario, type FormularioEditarUsuario } from '../schemas/usuario.schema';
import type { Usuario } from '../types/usuario.types';
import { construirCambiosUsuario } from '../utils/cambios_usuario';
import { PieFormulario } from '../../../components/forms/pie_formulario';

interface PropiedadesFormularioEditarUsuario {
  usuario: Usuario;
  alCambiarSinGuardar: (sinGuardar: boolean) => void;
  alTerminar: () => void;
  alCancelar: () => void;
}

export function FormularioEditarUsuario({
  usuario,
  alCambiarSinGuardar,
  alTerminar,
  alCancelar,
}: PropiedadesFormularioEditarUsuario) {
  const actualizacion = useActualizarUsuario();
  const { notificar } = useNotificaciones();
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<FormularioEditarUsuario>({
    resolver: zodResolver(esquemaEditarUsuario),
    defaultValues: {
      nombres: usuario.nombres,
      apellidos: usuario.apellidos,
      telefono: usuario.telefono ?? '',
    },
  });

  useEffect(() => alCambiarSinGuardar(isDirty), [isDirty, alCambiarSinGuardar]);

  const enviar = (formulario: FormularioEditarUsuario) => {
    const cambios = construirCambiosUsuario(usuario, formulario);
    if (Object.keys(cambios).length === 0) {
      alTerminar();
      return;
    }
    actualizacion.mutate(
      { id: usuario.id, datos: cambios },
      {
        onSuccess: () => {
          notificar({ tono: 'exito', titulo: 'Datos actualizados' });
          alTerminar();
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit(enviar)} noValidate className="flex min-h-full flex-col">
      <div className="flex-1 space-y-5 px-6 py-6">
        {actualizacion.error && <AlertaError error={actualizacion.error} />}

        <div className="grid gap-5 sm:grid-cols-2">
          <CampoTexto
            id="nombres"
            etiqueta="Nombres"
            icono={UserRound}
            autoComplete="off"
            maxLength={100}
            disabled={actualizacion.isPending}
            error={errors.nombres?.message}
            {...register('nombres')}
          />
          <CampoTexto
            id="apellidos"
            etiqueta="Apellidos"
            icono={UserRound}
            autoComplete="off"
            maxLength={100}
            disabled={actualizacion.isPending}
            error={errors.apellidos?.message}
            {...register('apellidos')}
          />
        </div>
        <CampoTexto
          id="telefono"
          etiqueta="Teléfono"
          icono={Phone}
          type="tel"
          inputMode="tel"
          placeholder="+57 300 123 4567"
          obligatorio={false}
          disabled={actualizacion.isPending}
          error={errors.telefono?.message}
          ayuda="Déjalo vacío para eliminarlo."
          {...register('telefono')}
        />

        <div className="flex items-start gap-3 rounded-xl bg-primario/5 px-4 py-3">
          <Mail aria-hidden strokeWidth={1.75} className="mt-0.5 size-4 shrink-0 text-primario" />
          <div className="min-w-0 text-[13px]">
            <p className="truncate font-medium text-texto">{usuario.correo}</p>
            <p className="text-texto-secundario">
              El correo, el rol y el estado se gestionan con sus propias acciones.
            </p>
          </div>
        </div>
      </div>

      <PieFormulario
        textoEnviar="Guardar cambios"
        textoEnviando="Guardando…"
        icono={Save}
        enviando={actualizacion.isPending}
        deshabilitado={!isDirty}
        alCancelar={alCancelar}
      />
    </form>
  );
}
