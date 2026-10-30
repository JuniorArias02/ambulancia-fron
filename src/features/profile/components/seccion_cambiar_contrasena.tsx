import { CircleAlert } from 'lucide-react';
import { useCambiarContrasena } from '../hooks/use_cambiar_contrasena';
import { FormularioCambiarContrasena } from './formulario_cambiar_contrasena';

export function SeccionCambiarContrasena() {
  const cambio = useCambiarContrasena();

  return (
    <section aria-labelledby="titulo-cambiar-contrasena" className="vidrio rounded-2xl p-5 sm:p-8">
      <header className="mb-6">
        <h3 id="titulo-cambiar-contrasena" className="text-base font-semibold text-texto">
          Cambiar contraseña
        </h3>
        <p className="mt-1 text-sm text-texto-secundario">
          Usa una contraseña que no utilices en otros servicios.
        </p>
      </header>

      <div aria-live="polite">
        {cambio.isError && (
          <div
            role="alert"
            className="mb-6 flex gap-3 rounded-xl border border-critico/20 bg-critico/6 px-4 py-3 text-sm"
          >
            <CircleAlert aria-hidden strokeWidth={1.75} className="mt-0.5 size-4 shrink-0 text-critico" />
            <span className="text-texto">{cambio.error.message}</span>
          </div>
        )}
      </div>

      <FormularioCambiarContrasena
        enviando={cambio.isPending}
        alEnviar={(datos) => cambio.mutate(datos)}
      />
    </section>
  );
}
