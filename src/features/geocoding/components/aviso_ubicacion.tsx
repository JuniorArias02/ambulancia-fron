import { CircleCheck, LoaderCircle, TriangleAlert } from 'lucide-react';
import type { AvisoUbicacion } from '../utils/interpretar_geocodificacion';

interface PropiedadesAvisoUbicacion {
  /** Texto mientras se consulta; la primera vez el proveedor tarda de 1 a 3 s. */
  buscando: string | null;
  aviso: AvisoUbicacion | null;
}

/** Resultado de la geocodificación junto a la dirección, anunciado a los lectores de pantalla. */
export function AvisoUbicacion({ buscando, aviso }: PropiedadesAvisoUbicacion) {
  return (
    <div aria-live="polite" className="empty:hidden">
      {buscando ? (
        <p className="flex items-center gap-2 rounded-xl bg-primario/5 px-3.5 py-2.5 text-[13px] text-texto">
          <LoaderCircle aria-hidden className="size-4 shrink-0 animate-spin text-primario" />
          {buscando}
        </p>
      ) : (
        aviso && (
          <p
            className={`flex items-start gap-2.5 rounded-xl border px-3.5 py-2.5 text-[13px] ${
              aviso.tono === 'exito' ? 'border-exito/20 bg-exito/6' : 'border-advertencia/25 bg-advertencia/8'
            }`}
          >
            {aviso.tono === 'exito' ? (
              <CircleCheck aria-hidden strokeWidth={1.75} className="mt-0.5 size-4 shrink-0 text-exito" />
            ) : (
              <TriangleAlert aria-hidden strokeWidth={1.75} className="mt-0.5 size-4 shrink-0 text-advertencia" />
            )}
            <span className="min-w-0">
              <span className="block font-medium text-texto">{aviso.titulo}</span>
              {aviso.detalle && <span className="mt-0.5 block text-texto-secundario">{aviso.detalle}</span>}
            </span>
          </p>
        )
      )}
    </div>
  );
}
