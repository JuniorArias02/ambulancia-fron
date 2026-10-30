import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, LoaderCircle, Mail } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { CampoContrasena } from '../../../components/forms/campo_contrasena';
import { CampoFormulario } from '../../../components/forms/campo_formulario';
import {
  claseEntrada,
  claseEstadoEntrada,
  idsDescripcion,
} from '../../../components/forms/estilos_campo';
import {
  esquemaInicioSesion,
  type FormularioInicioSesion,
} from '../schemas/inicio_sesion.schema';

interface PropiedadesFormularioIniciarSesion {
  enviando: boolean;
  alEnviar: (datos: FormularioInicioSesion) => void;
}

export function FormularioIniciarSesion({
  enviando,
  alEnviar,
}: PropiedadesFormularioIniciarSesion) {
  const {
    register,
    handleSubmit,
    setFocus,
    formState: { errors },
  } = useForm<FormularioInicioSesion>({
    resolver: zodResolver(esquemaInicioSesion),
    defaultValues: { correo: '', contrasena: '' },
  });

  useEffect(() => setFocus('correo'), [setFocus]);

  return (
    <form onSubmit={handleSubmit(alEnviar)} noValidate className="space-y-5">
      <CampoFormulario
        id="correo"
        etiqueta="Correo electrónico"
        icono={Mail}
        error={errors.correo?.message}
      >
        <input
          id="correo"
          type="email"
          inputMode="email"
          autoComplete="username"
          placeholder="nombre@institucion.co"
          required
          disabled={enviando}
          aria-invalid={errors.correo ? true : undefined}
          aria-describedby={idsDescripcion('correo', Boolean(errors.correo), false)}
          className={`${claseEntrada} pr-3 ${claseEstadoEntrada(Boolean(errors.correo))}`}
          {...register('correo')}
        />
      </CampoFormulario>

      <CampoContrasena
        id="contrasena"
        etiqueta="Contraseña"
        autoComplete="current-password"
        required
        disabled={enviando}
        error={errors.contrasena?.message}
        {...register('contrasena')}
      />

      <button
        type="submit"
        disabled={enviando}
        className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primario px-4 text-[15px] font-semibold text-white shadow-primario transition-[background-color,box-shadow,transform] duration-150 hover:bg-primario-hover focus-visible:ring-4 focus-visible:ring-primario/25 focus-visible:outline-none active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70 disabled:shadow-none"
      >
        {enviando ? (
          <>
            <LoaderCircle aria-hidden className="size-4 animate-spin" />
            Ingresando…
          </>
        ) : (
          <>
            Iniciar sesión
            <ArrowRight
              aria-hidden
              className="size-4 transition-transform duration-150 group-hover:translate-x-0.5"
            />
          </>
        )}
      </button>
    </form>
  );
}
