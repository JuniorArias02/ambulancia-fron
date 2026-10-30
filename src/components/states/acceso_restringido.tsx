import { ShieldAlert } from 'lucide-react';
import { Link } from 'react-router';
import { RUTAS } from '../../constants/rutas';

export function AccesoRestringido() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="vidrio flex max-w-md flex-col items-center rounded-3xl px-8 py-10 text-center">
        <span className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-advertencia/10 text-advertencia">
          <ShieldAlert aria-hidden strokeWidth={1.75} className="size-[22px]" />
        </span>
        <h2 className="text-lg font-semibold text-texto">Acceso restringido</h2>
        <p className="mt-1 text-sm text-texto-secundario">
          Tu rol no tiene permiso para ver esta sección. Si crees que es un error, comunícate con
          un administrador.
        </p>
        <Link
          to={RUTAS.inicio}
          className="mt-6 inline-flex h-10 items-center rounded-xl bg-primario px-4 text-sm font-medium text-white shadow-primario hover:bg-primario-hover"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
