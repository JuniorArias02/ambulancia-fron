import { Info, LoaderCircle, RefreshCw } from 'lucide-react';
import { EstadoError } from '../../../components/states/estado_error';
import { DatosPerfil } from '../components/datos_perfil';
import { EncabezadoPerfil } from '../components/encabezado_perfil';
import { SeccionCambiarContrasena } from '../components/seccion_cambiar_contrasena';
import { usePerfil } from '../hooks/use_perfil';

export function PaginaPerfil() {
  const perfil = usePerfil();

  return (
    <div className="min-h-0 flex-1 space-y-3 overflow-y-auto">
      <div className="vidrio mx-auto max-w-3xl rounded-2xl p-5 sm:p-8">
        {perfil.isPending ? (
          <div role="status" className="flex items-center justify-center gap-3 py-16 text-sm text-texto-secundario">
            <LoaderCircle aria-hidden className="size-5 animate-spin text-primario" />
            Cargando perfil…
          </div>
        ) : perfil.isError ? (
          <EstadoError
            titulo="No fue posible cargar tu perfil"
            mensaje={perfil.error.message}
            alReintentar={() => void perfil.refetch()}
          />
        ) : (
          <>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <EncabezadoPerfil perfil={perfil.data} />
              <button
                type="button"
                onClick={() => void perfil.refetch()}
                disabled={perfil.isFetching}
                className="campo-vidrio inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-medium text-texto transition-colors duration-150 hover:bg-white focus-visible:ring-2 focus-visible:ring-primario/40 focus-visible:outline-none disabled:opacity-60"
              >
                <RefreshCw
                  aria-hidden
                  strokeWidth={1.75}
                  className={`size-4 ${perfil.isFetching ? 'animate-spin' : ''}`}
                />
                {perfil.isFetching ? 'Actualizando…' : 'Actualizar'}
              </button>
            </div>

            <section aria-labelledby="titulo-datos-perfil" className="mt-8">
              <h3 id="titulo-datos-perfil" className="text-base font-semibold text-texto">
                Información de la cuenta
              </h3>
              <DatosPerfil perfil={perfil.data} />
            </section>

            <p className="mt-4 flex items-start gap-2.5 rounded-xl bg-primario/5 px-4 py-3 text-[13px] leading-relaxed text-texto-secundario">
              <Info aria-hidden strokeWidth={1.75} className="mt-0.5 size-4 shrink-0 text-primario" />
              Estos datos los administra el sistema. Para modificarlos, comunícate con un
              administrador.
            </p>
          </>
        )}
      </div>

      {perfil.isSuccess && (
        <div className="mx-auto max-w-3xl">
          <SeccionCambiarContrasena />
        </div>
      )}
    </div>
  );
}
