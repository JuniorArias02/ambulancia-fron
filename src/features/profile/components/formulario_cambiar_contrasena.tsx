import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound, LoaderCircle, TriangleAlert } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { CampoContrasena } from '../../../components/forms/campo_contrasena';
import {
  esquemaCambioContrasena,
  type FormularioCambioContrasena,
} from '../schemas/cambio_contrasena.schema';
import type { DatosCambioContrasena } from '../types/perfil.types';

interface PropiedadesFormularioCambiarContrasena {
  enviando: boolean;
  alEnviar: (datos: DatosCambioContrasena) => void;
}

export function FormularioCambiarContrasena({
  enviando,
  alEnviar,
}: PropiedadesFormularioCambiarContrasena) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormularioCambioContrasena>({
    resolver: zodResolver(esquemaCambioContrasena),
    defaultValues: { contrasenaActual: '', contrasenaNueva: '', confirmacion: '' },
  });

  const enviar = ({ contrasenaActual, contrasenaNueva }: FormularioCambioContrasena) =>
    alEnviar({ contrasenaActual, contrasenaNueva });

  return (
    <form onSubmit={handleSubmit(enviar)} noValidate className="space-y-5">
      <div className="sm:max-w-[calc(50%-10px)]">
        <CampoContrasena
          id="contrasenaActual"
          etiqueta="Contraseña actual"
          autoComplete="current-password"
          required
          disabled={enviando}
          error={errors.contrasenaActual?.message}
          {...register('contrasenaActual')}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <CampoContrasena
          id="contrasenaNueva"
          etiqueta="Nueva contraseña"
          autoComplete="new-password"
          required
          disabled={enviando}
          error={errors.contrasenaNueva?.message}
          ayuda="Mínimo 10 caracteres, con al menos una letra y un número."
          {...register('contrasenaNueva')}
        />
        <CampoContrasena
          id="confirmacion"
          etiqueta="Confirmar nueva contraseña"
          autoComplete="new-password"
          required
          disabled={enviando}
          error={errors.confirmacion?.message}
          {...register('confirmacion')}
        />
      </div>

      <div className="flex flex-col gap-4 border-t border-borde/80 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-start gap-2.5 text-[13px] leading-relaxed text-texto-secundario">
          <TriangleAlert
            aria-hidden
            strokeWidth={1.75}
            className="mt-0.5 size-4 shrink-0 text-advertencia"
          />
          Al guardar se cerrarán todas tus sesiones, incluida esta, y deberás iniciar sesión de
          nuevo.
        </p>
        <button
          type="submit"
          disabled={enviando}
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-primario px-5 text-sm font-semibold text-white shadow-primario transition-[background-color,transform] duration-150 hover:bg-primario-hover focus-visible:ring-4 focus-visible:ring-primario/25 focus-visible:outline-none active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70 disabled:shadow-none"
        >
          {enviando ? (
            <LoaderCircle aria-hidden className="size-4 animate-spin" />
          ) : (
            <KeyRound aria-hidden strokeWidth={1.75} className="size-4" />
          )}
          {enviando ? 'Guardando…' : 'Cambiar contraseña'}
        </button>
      </div>
    </form>
  );
}
