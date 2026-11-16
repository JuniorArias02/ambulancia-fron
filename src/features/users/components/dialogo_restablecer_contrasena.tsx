import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowRight, Check, Copy, KeyRound, TriangleAlert, WandSparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Link } from 'react-router';
import { AlertaError } from '../../../components/feedback/alerta_error';
import { CampoContrasena } from '../../../components/forms/campo_contrasena';
import { PieFormulario } from '../../../components/forms/pie_formulario';
import { Dialogo } from '../../../components/ui/dialogo';
import { RUTAS } from '../../../constants/rutas';
import { useNotificaciones } from '../../../hooks/use_notificaciones';
import { CLAVES_USUARIOS } from '../constants/usuarios';
import { useRestablecerContrasena } from '../hooks/use_mutaciones_usuario';
import {
  esquemaRestablecerContrasena,
  type FormularioRestablecerContrasena,
} from '../schemas/usuario.schema';
import type { Usuario } from '../types/usuario.types';
import { generarContrasena } from '../utils/generar_contrasena';

const DURACION_COPIADO_MS = 2_000;

const claseBotonSecundario =
  'campo-vidrio inline-flex h-9 items-center gap-2 rounded-xl px-3 text-[13px] font-medium text-texto transition-colors duration-150 hover:bg-white hover:text-primario focus-visible:ring-2 focus-visible:ring-primario/40 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:text-texto';

interface PropiedadesDialogoRestablecerContrasena {
  usuario: Usuario;
  alCerrar: () => void;
}

/**
 * El administrador asigna una contraseña nueva sin conocer la actual. La contraseña solo vive
 * en el formulario: no se guarda ni se vuelve a mostrar después de guardarla.
 */
export function DialogoRestablecerContrasena({ usuario, alCerrar }: PropiedadesDialogoRestablecerContrasena) {
  const restablecimiento = useRestablecerContrasena();
  const clienteConsultas = useQueryClient();
  const { notificar } = useNotificaciones();
  const [visible, setVisible] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    control,
    formState: { errors, isSubmitted },
  } = useForm<FormularioRestablecerContrasena>({
    resolver: zodResolver(esquemaRestablecerContrasena),
    defaultValues: { contrasenaNueva: '', confirmacion: '' },
  });

  const contrasenaNueva = useWatch({ control, name: 'contrasenaNueva' });
  const enviando = restablecimiento.isPending;
  const nombreCompleto = `${usuario.nombres} ${usuario.apellidos}`;

  useEffect(() => {
    if (!copiado) return;
    const temporizador = window.setTimeout(() => setCopiado(false), DURACION_COPIADO_MS);
    return () => window.clearTimeout(temporizador);
  }, [copiado]);

  const generar = () => {
    const generada = generarContrasena();
    const opciones = { shouldDirty: true, shouldValidate: isSubmitted };
    setValue('contrasenaNueva', generada, opciones);
    setValue('confirmacion', generada, opciones);
    setVisible(true);
    setCopiado(false);
  };

  const copiar = () => {
    navigator.clipboard.writeText(contrasenaNueva).then(
      () => setCopiado(true),
      () =>
        notificar({
          tono: 'error',
          titulo: 'No fue posible copiar',
          descripcion: 'Selecciona la contraseña y cópiala a mano.',
        }),
    );
  };

  const enviar = (datos: FormularioRestablecerContrasena) =>
    restablecimiento.mutate(
      // Solo `contrasenaNueva`: el backend rechaza cualquier otro campo.
      { id: usuario.id, contrasenaNueva: datos.contrasenaNueva },
      {
        onSuccess: () => {
          notificar({
            tono: 'exito',
            titulo: 'Contraseña actualizada',
            descripcion: `Comunícasela a ${nombreCompleto} por un medio seguro. Se cerraron todas sus sesiones.`,
          });
          alCerrar();
        },
        onError: (error) => {
          if (error.estado === 400) {
            setError('contrasenaNueva', {
              message: error.detalles.length > 0 ? error.detalles.join(' ') : error.message,
            });
          }
          // El usuario ya no existe: se recarga la lista para que desaparezca.
          if (error.estado === 404) void clienteConsultas.invalidateQueries({ queryKey: CLAVES_USUARIOS.todos });
        },
      },
    );

  const error = restablecimiento.error;
  const errorGeneral = error && error.estado !== 400 ? error : null;

  return (
    <Dialogo
      abierto
      titulo="Restablecer contraseña"
      descripcion={`${nombreCompleto} · ${usuario.correo}`}
      cerrable={!enviando}
      alCerrar={alCerrar}
    >
      <form onSubmit={handleSubmit(enviar)} noValidate>
        <div className="space-y-5 px-6 py-5">
          {errorGeneral && (
            <div className="space-y-2">
              <AlertaError error={errorGeneral} />
              {errorGeneral.estado === 422 && (
                <Link
                  to={RUTAS.perfil}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-primario hover:text-primario-hover"
                >
                  Cambiar tu contraseña desde tu perfil
                  <ArrowRight aria-hidden strokeWidth={1.75} className="size-4" />
                </Link>
              )}
            </div>
          )}

          <p className="flex items-start gap-2.5 rounded-xl border border-advertencia/25 bg-advertencia/8 px-4 py-3 text-[13px] text-texto">
            <TriangleAlert aria-hidden strokeWidth={1.75} className="mt-0.5 size-4 shrink-0 text-advertencia" />
            Se cerrarán todas las sesiones de este usuario en la app y en la web. Deberá entrar de nuevo con la
            contraseña nueva.
          </p>

          <div className="space-y-2.5">
            <CampoContrasena
              id="contrasenaNueva"
              etiqueta="Contraseña nueva"
              autoComplete="new-password"
              required
              disabled={enviando}
              visible={visible}
              alCambiarVisibilidad={setVisible}
              error={errors.contrasenaNueva?.message}
              ayuda="Mínimo 10 caracteres, con al menos una letra y un número."
              {...register('contrasenaNueva')}
            />
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={generar} disabled={enviando} className={claseBotonSecundario}>
                <WandSparkles aria-hidden strokeWidth={1.75} className="size-4" />
                Generar
              </button>
              <button
                type="button"
                onClick={copiar}
                disabled={enviando || contrasenaNueva === ''}
                className={claseBotonSecundario}
              >
                {copiado ? (
                  <Check aria-hidden strokeWidth={2} className="size-4 text-exito" />
                ) : (
                  <Copy aria-hidden strokeWidth={1.75} className="size-4" />
                )}
                {copiado ? 'Copiada' : 'Copiar'}
              </button>
              <span aria-live="polite" className="sr-only">
                {copiado ? 'Contraseña copiada' : ''}
              </span>
            </div>
          </div>

          <CampoContrasena
            id="confirmacion"
            etiqueta="Confirmar contraseña"
            autoComplete="new-password"
            required
            disabled={enviando}
            error={errors.confirmacion?.message}
            {...register('confirmacion')}
          />

          <p className="text-[13px] text-texto-secundario">
            Después de guardar no podrás volver a verla. Si la generaste, cópiala antes.
          </p>
        </div>

        <PieFormulario
          textoEnviar="Restablecer contraseña"
          textoEnviando="Guardando…"
          icono={KeyRound}
          enviando={enviando}
          alCancelar={alCerrar}
        />
      </form>
    </Dialogo>
  );
}
