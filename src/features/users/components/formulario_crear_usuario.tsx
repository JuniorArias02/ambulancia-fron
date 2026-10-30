import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Phone, ShieldCheck, UserPlus, UserRound } from 'lucide-react';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { AlertaError } from '../../../components/feedback/alerta_error';
import { CampoContrasena } from '../../../components/forms/campo_contrasena';
import { CampoSelector } from '../../../components/forms/campo_selector';
import { CampoTexto } from '../../../components/forms/campo_texto';
import { ETIQUETAS_ROL } from '../../../constants/roles';
import { useNotificaciones } from '../../../hooks/use_notificaciones';
import { useCrearUsuario } from '../hooks/use_mutaciones_usuario';
import { useRoles } from '../hooks/use_roles';
import {
  esquemaCrearUsuario,
  type EntradaCrearUsuario,
  type FormularioCrearUsuario,
} from '../schemas/usuario.schema';
import { limpiarTelefono } from '../utils/cambios_usuario';
import { PieFormulario } from '../../../components/forms/pie_formulario';

interface PropiedadesFormularioCrearUsuario {
  alCambiarSinGuardar: (sinGuardar: boolean) => void;
  alTerminar: () => void;
  alCancelar: () => void;
}

export function FormularioCrearUsuario({
  alCambiarSinGuardar,
  alTerminar,
  alCancelar,
}: PropiedadesFormularioCrearUsuario) {
  const roles = useRoles();
  const creacion = useCrearUsuario();
  const { notificar } = useNotificaciones();
  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isDirty },
  } = useForm<EntradaCrearUsuario, unknown, FormularioCrearUsuario>({
    resolver: zodResolver(esquemaCrearUsuario),
    defaultValues: {
      nombres: '',
      apellidos: '',
      correo: '',
      telefono: '',
      contrasena: '',
      rol: '',
    },
  });

  useEffect(() => alCambiarSinGuardar(isDirty), [isDirty, alCambiarSinGuardar]);

  const rolSeleccionado = useWatch({ control, name: 'rol' });
  const descripcionRol = roles.data?.find((rol) => rol.nombre === rolSeleccionado)?.descripcion;

  const enviar = (datos: FormularioCrearUsuario) =>
    creacion.mutate(
      { ...datos, telefono: limpiarTelefono(datos.telefono) },
      {
        onSuccess: (usuario) => {
          notificar({
            tono: 'exito',
            titulo: 'Usuario creado',
            descripcion: `${usuario.nombres} ${usuario.apellidos} ya puede iniciar sesión.`,
          });
          alTerminar();
        },
        onError: (error) => {
          if (error.estado === 409) setError('correo', { message: error.message });
        },
      },
    );

  const errorGeneral = creacion.error && creacion.error.estado !== 409 ? creacion.error : null;

  return (
    <form onSubmit={handleSubmit(enviar)} noValidate className="flex min-h-full flex-col">
      <div className="flex-1 space-y-8 px-6 py-6">
        {errorGeneral && <AlertaError error={errorGeneral} />}

        <fieldset className="space-y-5">
          <legend className="mb-4 text-sm font-semibold text-texto">Datos personales</legend>
          <div className="grid gap-5 sm:grid-cols-2">
            <CampoTexto
              id="nombres"
              etiqueta="Nombres"
              icono={UserRound}
              autoComplete="off"
              maxLength={100}
              disabled={creacion.isPending}
              error={errors.nombres?.message}
              {...register('nombres')}
            />
            <CampoTexto
              id="apellidos"
              etiqueta="Apellidos"
              icono={UserRound}
              autoComplete="off"
              maxLength={100}
              disabled={creacion.isPending}
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
            disabled={creacion.isPending}
            error={errors.telefono?.message}
            ayuda="Opcional."
            {...register('telefono')}
          />
        </fieldset>

        <fieldset className="space-y-5">
          <legend className="mb-4 text-sm font-semibold text-texto">Acceso al sistema</legend>
          <CampoTexto
            id="correo"
            etiqueta="Correo electrónico"
            icono={Mail}
            type="email"
            inputMode="email"
            autoComplete="off"
            placeholder="nombre@institucion.co"
            maxLength={150}
            disabled={creacion.isPending}
            error={errors.correo?.message}
            {...register('correo')}
          />
          <CampoContrasena
            id="contrasena"
            etiqueta="Contraseña inicial"
            autoComplete="new-password"
            required
            disabled={creacion.isPending}
            error={errors.contrasena?.message}
            ayuda="Mínimo 10 caracteres, con al menos una letra y un número."
            {...register('contrasena')}
          />
          <CampoSelector
            id="rol"
            etiqueta="Rol"
            icono={ShieldCheck}
            disabled={creacion.isPending || !roles.isSuccess}
            error={
              errors.rol?.message ??
              (roles.isError ? 'No fue posible cargar los roles. Cierra e inténtalo de nuevo.' : undefined)
            }
            ayuda={roles.isPending ? 'Cargando roles…' : descripcionRol}
            {...register('rol')}
          >
            <option value="" disabled>
              Selecciona un rol
            </option>
            {roles.data?.map((rol) => (
              <option key={rol.nombre} value={rol.nombre}>
                {ETIQUETAS_ROL[rol.nombre]}
              </option>
            ))}
          </CampoSelector>
        </fieldset>
      </div>

      <PieFormulario
        textoEnviar="Crear usuario"
        textoEnviando="Creando…"
        icono={UserPlus}
        enviando={creacion.isPending}
        alCancelar={alCancelar}
      />
    </form>
  );
}
