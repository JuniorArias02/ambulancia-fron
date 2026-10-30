import {
  Ambulance,
  CircleAlert,
  CircleCheck,
  Clock3,
  Info,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';
import { entorno } from '../../../config/entorno';
import { FormularioIniciarSesion } from '../components/formulario_iniciar_sesion';
import { useIniciarSesion } from '../hooks/use_iniciar_sesion';
import { useSesion } from '../hooks/use_sesion';
import type { MotivoCierreSesion } from '../types/autenticacion.types';

interface AvisoCierre {
  icono: LucideIcon;
  mensaje: string;
  tono: 'exito' | 'advertencia';
}

const CLASES_TONO: Record<AvisoCierre['tono'], { contenedor: string; icono: string }> = {
  exito: { contenedor: 'border-exito/20 bg-exito/6', icono: 'text-exito' },
  advertencia: { contenedor: 'border-advertencia/20 bg-advertencia/6', icono: 'text-advertencia' },
};

const AVISOS_CIERRE: Partial<Record<MotivoCierreSesion, AvisoCierre>> = {
  expirada: {
    icono: Clock3,
    mensaje: 'Tu sesión expiró. Inicia sesión de nuevo para continuar.',
    tono: 'advertencia',
  },
  no_autorizado: {
    icono: Info,
    mensaje: 'Tu sesión ya no es válida. Inicia sesión de nuevo.',
    tono: 'advertencia',
  },
  contrasena_cambiada: {
    icono: CircleCheck,
    mensaje: 'Contraseña actualizada. Inicia sesión con tu nueva contraseña.',
    tono: 'exito',
  },
};

function MarcaAplicacion() {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-11 items-center justify-center rounded-2xl bg-primario text-white shadow-primario">
        <Ambulance aria-hidden strokeWidth={1.75} className="size-[22px]" />
      </span>
      <span className="text-lg font-semibold tracking-tight text-institucional">
        {entorno.nombreAplicacion}
      </span>
    </div>
  );
}

function PresentacionInstitucional() {
  return (
    <div className="relative hidden flex-col justify-between overflow-hidden rounded-[20px] bg-linear-to-br from-primario/10 via-white/40 to-cian/10 p-10 lg:flex">
      <div
        aria-hidden
        className="absolute -top-24 -right-20 size-72 rounded-full bg-cian/20 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute -bottom-28 -left-16 size-80 rounded-full bg-primario/15 blur-3xl"
      />

      <div className="relative">
        <MarcaAplicacion />
      </div>

      <div className="relative">
        <span className="inline-flex items-center rounded-full border border-white/80 bg-white/60 px-3 py-1 text-xs font-semibold tracking-wide text-primario uppercase">
          Centro de despacho
        </span>
        <h2 className="mt-5 text-[32px] leading-[1.15] font-semibold tracking-tight text-institucional">
          Coordinación de emergencias y atención prehospitalaria.
        </h2>
        <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-texto-secundario">
          Supervisa las unidades, despacha ambulancias y da seguimiento a cada servicio desde un
          solo lugar.
        </p>
      </div>

      <p className="relative flex items-start gap-3 rounded-2xl border border-white/70 bg-white/50 p-4 text-[13px] leading-relaxed text-texto-secundario">
        <ShieldCheck aria-hidden strokeWidth={1.75} className="mt-0.5 size-[18px] shrink-0 text-primario" />
        Acceso exclusivo para personal autorizado. La información clínica está protegida y solo es
        visible según los permisos de cada rol.
      </p>
    </div>
  );
}

export function PaginaIniciarSesion() {
  const { motivoCierre } = useSesion();
  const inicioSesion = useIniciarSesion();
  const avisoCierre = motivoCierre ? AVISOS_CIERRE[motivoCierre] : undefined;

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-8 sm:px-6">
      <div
        aria-hidden
        className="pointer-events-none absolute top-[12%] left-[18%] size-96 rounded-full bg-primario/12 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-[14%] bottom-[10%] size-[28rem] rounded-full bg-lavanda/10 blur-3xl"
      />

      <main className="vidrio relative grid w-full max-w-[1040px] gap-2 rounded-[28px] p-2 lg:min-h-[600px] lg:grid-cols-[1.05fr_1fr]">
        <PresentacionInstitucional />

        <section className="flex flex-col px-5 py-8 sm:px-10 sm:py-12 lg:px-14">
          <div className="lg:hidden">
            <MarcaAplicacion />
          </div>

          <div className="mx-auto flex w-full max-w-[380px] flex-1 flex-col justify-center pt-10 lg:pt-0">
            <header className="mb-8">
              <h1 className="text-[28px] font-semibold tracking-tight text-texto">
                Iniciar sesión
              </h1>
              <p className="mt-2 text-[15px] text-texto-secundario">
                Ingresa con tu cuenta institucional para continuar.
              </p>
            </header>

            <div aria-live="polite">
              {inicioSesion.isError ? (
                <div
                  role="alert"
                  className="mb-6 flex gap-3 rounded-xl border border-critico/20 bg-critico/6 px-4 py-3 text-sm"
                >
                  <CircleAlert
                    aria-hidden
                    strokeWidth={1.75}
                    className="mt-0.5 size-4 shrink-0 text-critico"
                  />
                  <span className="text-texto">{inicioSesion.error.message}</span>
                </div>
              ) : (
                avisoCierre && (
                  <div
                    className={`mb-6 flex gap-3 rounded-xl border px-4 py-3 text-sm ${CLASES_TONO[avisoCierre.tono].contenedor}`}
                  >
                    <avisoCierre.icono
                      aria-hidden
                      strokeWidth={1.75}
                      className={`mt-0.5 size-4 shrink-0 ${CLASES_TONO[avisoCierre.tono].icono}`}
                    />
                    <span className="text-texto">{avisoCierre.mensaje}</span>
                  </div>
                )
              )}
            </div>

            <FormularioIniciarSesion
              enviando={inicioSesion.isPending}
              alEnviar={(datos) => inicioSesion.mutate(datos)}
            />

            <p className="mt-8 text-center text-[13px] leading-relaxed text-texto-secundario">
              ¿Problemas para ingresar? Comunícate con el administrador del sistema.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
