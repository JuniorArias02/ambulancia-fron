import { CircleAlert } from 'lucide-react';
import type { ErrorApi } from '../../services/error_api';

interface PropiedadesAlertaError {
  error: ErrorApi;
}

/** Muestra el error del backend; en validaciones (400) lista cada mensaje recibido. */
export function AlertaError({ error }: PropiedadesAlertaError) {
  const detalles = error.estado === 400 && error.detalles.length > 1 ? error.detalles : [];

  return (
    <div
      role="alert"
      className="flex gap-3 rounded-xl border border-critico/20 bg-critico/6 px-4 py-3 text-sm"
    >
      <CircleAlert aria-hidden strokeWidth={1.75} className="mt-0.5 size-4 shrink-0 text-critico" />
      <div className="min-w-0 text-texto">
        {detalles.length > 0 ? (
          <ul className="list-disc space-y-0.5 pl-4">
            {detalles.map((detalle) => (
              <li key={detalle}>{detalle}</li>
            ))}
          </ul>
        ) : (
          error.message
        )}
      </div>
    </div>
  );
}
