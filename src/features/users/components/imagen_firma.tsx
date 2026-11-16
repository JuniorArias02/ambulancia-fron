import { ImageOff, RotateCw } from 'lucide-react';
import { useImagenProtegida } from '../../../hooks/use_imagen_protegida';
import { obtenerImagenFirma } from '../services/firmas.service';
import type { FirmaUsuario } from '../types/firma.types';

interface PropiedadesImagenFirma {
  firma: FirmaUsuario;
  /** Texto alternativo: de quién es y de cuándo. */
  descripcion: string;
}

/** Se descarga con el token al mostrarse y se libera al ocultarse; cada descarga queda auditada. */
export function ImagenFirma({ firma, descripcion }: PropiedadesImagenFirma) {
  const imagen = useImagenProtegida(`firma/${firma.usuarioId}/${firma.id}`, (senal) =>
    obtenerImagenFirma(firma.usuarioId, firma.id, senal),
  );

  return (
    <div
      style={{ aspectRatio: `${Math.max(firma.anchoPx, 1)} / ${Math.max(firma.altoPx, 1)}` }}
      className="flex max-h-56 w-full items-center justify-center overflow-hidden rounded-xl border border-borde/80 bg-white"
    >
      {imagen.estado === 'cargando' && (
        <div role="status" className="size-full animate-pulse bg-borde/30">
          <span className="sr-only">Cargando firma…</span>
        </div>
      )}
      {imagen.estado === 'error' && (
        <div role="alert" className="flex flex-col items-center gap-2 px-4 py-3 text-center">
          <ImageOff aria-hidden strokeWidth={1.75} className="size-5 text-texto-secundario" />
          <p className="text-[13px] text-texto-secundario">
            {imagen.error.estado === 404 ? 'La imagen ya no está disponible.' : imagen.error.message}
          </p>
          <button
            type="button"
            onClick={imagen.reintentar}
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-primario hover:text-primario-hover"
          >
            <RotateCw aria-hidden strokeWidth={1.75} className="size-3.5" />
            Reintentar
          </button>
        </div>
      )}
      {imagen.estado === 'lista' && (
        <img src={imagen.url} alt={descripcion} draggable={false} className="size-full object-contain p-3" />
      )}
    </div>
  );
}
